export interface ComparisonResult {
  totalFields: number;
  correctFields: number;
  incorrectFields: number;
  missingFields: string[];
  extraFields: string[];
  fieldResults: Record<string, {
    expected: any;
    actual: any;
    match: boolean;
    score?: number; // 0-1 for both fixed and dynamic fields
    llmScore?: number; // 0-1 for dynamic fields evaluated by LLM (deprecated, use score)
    llmFeedback?: string; // One-line feedback from LLM
    fieldType?: string; // Field type for categorization
  }>;
  accuracy: number; // 0-100
  fixedFieldScore: number; // Average accuracy of fixed/deterministic fields (0-100)
  dynamicFieldScore: number; // Average LLM score of dynamic fields (0-100)
  fixedFields: string[]; // Field IDs that are fixed/deterministic
  dynamicFields: string[]; // Field IDs that are dynamic/non-deterministic
}

/**
 * Check if a field type is dynamic (requires LLM evaluation)
 */
const isDynamicField = (fieldType: string): boolean => {
  return fieldType === 'text' || fieldType === 'textarea' || fieldType === 'address';
};

/**
 * Compare form submission data against ground truth
 * @param submittedData - The submitted form data
 * @param groundTruth - The expected ground truth values
 * @param formDefinition - Optional form definition to determine field types
 * @param llmEvaluations - Optional pre-computed LLM evaluations for dynamic fields
 */
export const compareWithGroundTruth = async (
  submittedData: Record<string, any>,
  groundTruth: Record<string, any>,
  formDefinition?: { pages: Array<{ fields: Array<{ id: string; type: string; label?: string }> }> },
  llmEvaluations?: Record<string, { score: number; feedback?: string }>
): Promise<ComparisonResult> => {
  // Build field type map from form definition
  const fieldTypeMap: Record<string, string> = {};
  if (formDefinition) {
    formDefinition.pages.forEach(page => {
      page.fields.forEach(field => {
        fieldTypeMap[field.id] = field.type;
      });
    });
  }

  const fieldResults: ComparisonResult['fieldResults'] = {};
  let correctFields = 0;
  let totalFields = 0;
  const missingFields: string[] = [];
  const extraFields: string[] = [];
  const fixedFields: string[] = [];
  const dynamicFields: string[] = [];
  let fixedFieldCorrect = 0;
  let fixedFieldTotal = 0;
  let dynamicFieldScoreSum = 0;
  let dynamicFieldTotal = 0;

  // Check all ground truth fields
  for (const fieldId of Object.keys(groundTruth)) {
    totalFields++;
    const expected = groundTruth[fieldId];
    const actual = submittedData[fieldId];
    const fieldType = fieldTypeMap[fieldId] || 'text'; // Default to text if unknown
    const isDynamic = isDynamicField(fieldType);
    
    if (isDynamic) {
      dynamicFields.push(fieldId);
      dynamicFieldTotal++;
      
      // MUST use LLM evaluation for dynamic fields - no fallback
      if (llmEvaluations && llmEvaluations[fieldId]) {
        const llmScore = llmEvaluations[fieldId].score;
        const llmFeedback = llmEvaluations[fieldId].feedback || '';
        const match = llmScore >= 0.8; // Threshold for "correct" (80% similarity)
        
        fieldResults[fieldId] = {
          expected,
          actual: actual ?? null,
          match,
          score: llmScore, // Use score instead of llmScore
          llmScore, // Keep for backward compatibility
          llmFeedback,
          fieldType
        };
        
        if (match) {
          correctFields++;
        }
        dynamicFieldScoreSum += llmScore;
      } else {
        // If no LLM evaluation, mark as incorrect (should not happen)
        fieldResults[fieldId] = {
          expected,
          actual: actual ?? null,
          match: false,
          score: 0.0,
          llmScore: 0,
          llmFeedback: 'LLM evaluation not available',
          fieldType
        };
        dynamicFieldScoreSum += 0.0;
      }
    } else {
      // Fixed/deterministic field
      fixedFields.push(fieldId);
      fixedFieldTotal++;
      const match = compareValues(expected, actual, fieldId);
      // For fixed fields, score is 1.0 if match, 0.0 if not
      const score = match ? 1.0 : 0.0;
      
      fieldResults[fieldId] = {
        expected,
        actual: actual ?? null,
        match,
        score, // Add score for fixed fields (0.0 or 1.0)
        fieldType
      };

      if (match) {
        correctFields++;
        fixedFieldCorrect++;
      } else {
        if (actual === undefined || actual === null || actual === '' || 
            (Array.isArray(actual) && actual.length === 0)) {
          missingFields.push(fieldId);
        }
      }
    }
  }

  // Check for extra fields in submission
  Object.keys(submittedData).forEach(fieldId => {
    if (!groundTruth.hasOwnProperty(fieldId)) {
      extraFields.push(fieldId);
    }
  });

  // Calculate scores: sum all field scores (0-1) and divide by total
  let totalScoreSum = 0;
  
  // Add all field scores (both fixed and dynamic use the score field)
  Object.keys(fieldResults).forEach(fieldId => {
    const score = fieldResults[fieldId].score ?? 0.0;
    totalScoreSum += score;
  });

  // Overall accuracy: average of all field scores (0-1) converted to percentage
  const accuracy = totalFields > 0 ? (totalScoreSum / totalFields) * 100 : 0;
  const fixedFieldScore = fixedFieldTotal > 0 ? (fixedFieldCorrect / fixedFieldTotal) * 100 : 100;
  const dynamicFieldScore = dynamicFieldTotal > 0 ? (dynamicFieldScoreSum / dynamicFieldTotal) * 100 : 100;

  return {
    totalFields,
    correctFields,
    incorrectFields: totalFields - correctFields,
    missingFields,
    extraFields,
    fieldResults,
    accuracy: Math.round(accuracy * 100) / 100,
    fixedFieldScore: Math.round(fixedFieldScore * 100) / 100,
    dynamicFieldScore: Math.round(dynamicFieldScore * 100) / 100,
    fixedFields,
    dynamicFields
  };
};

/**
 * Extract date portion (YYYY-MM-DD) from various date formats
 */
const extractDatePortion = (value: any): string | null => {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  try {
    // If it's already a Date object
    if (value instanceof Date) {
      return value.toISOString().split('T')[0];
    }

    // If it's a string, try to extract YYYY-MM-DD
    const str = String(value).trim();
    
    // If it's already in YYYY-MM-DD format
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
      return str;
    }

    // If it's an ISO string (YYYY-MM-DDTHH:mm:ss.sssZ), extract date part
    if (str.includes('T')) {
      const datePart = str.split('T')[0];
      if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
        return datePart;
      }
    }

    // Try to parse as Date and extract date portion
    const date = new Date(str);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }

    return null;
  } catch {
    return null;
  }
};

/**
 * Compare two values considering field type and format
 */
const compareValues = (expected: any, actual: any, fieldId: string): boolean => {
  // Handle null/undefined/empty
  if (expected === null || expected === undefined) {
    return actual === null || actual === undefined || actual === '' || actual === false;
  }
  if (actual === null || actual === undefined || actual === '') {
    return false;
  }

  // Handle arrays (for multi-select, checkboxes, reactive-chunks)
  if (Array.isArray(expected)) {
    if (!Array.isArray(actual)) return false;
    if (expected.length !== actual.length) return false;
    // Sort and compare (order doesn't matter for multi-select)
    const sortedExpected = [...expected].sort().map(v => String(v).toLowerCase().trim());
    const sortedActual = [...actual].sort().map(v => String(v).toLowerCase().trim());
    return JSON.stringify(sortedExpected) === JSON.stringify(sortedActual);
  }

  // Handle booleans (for checkbox, switch)
  if (typeof expected === 'boolean') {
    return expected === Boolean(actual);
  }

  // Handle date-range objects
  if (fieldId.toLowerCase().includes('range') || (typeof expected === 'object' && expected !== null && !Array.isArray(expected) && (expected.from || expected.to))) {
    try {
      const expectedFrom = extractDatePortion(expected.from);
      const expectedTo = extractDatePortion(expected.to);
      const actualFrom = extractDatePortion(actual?.from);
      const actualTo = extractDatePortion(actual?.to);
      return expectedFrom === actualFrom && expectedTo === actualTo;
    } catch {
      return false;
    }
  }

  // Handle dates (normalize to ISO string date part)
  if (fieldId.toLowerCase().includes('date') && !fieldId.toLowerCase().includes('range')) {
    try {
      // Extract just the date portion (YYYY-MM-DD) from both values
      const expectedDate = extractDatePortion(expected);
      const actualDate = extractDatePortion(actual);
      
      if (expectedDate === null || actualDate === null) {
        return false;
      }
      
      return expectedDate === actualDate;
    } catch {
      // If date parsing fails, do string comparison
      return String(expected).trim() === String(actual).trim();
    }
  }

  // Handle time
  if (fieldId.toLowerCase().includes('time') && !fieldId.toLowerCase().includes('date')) {
    // Time format: HH:MM
    const normalizeTime = (time: any) => {
      const str = String(time).trim();
      // Handle formats like "14:30" or "2:30 PM"
      if (str.includes(':')) {
        const parts = str.split(':');
        if (parts.length >= 2) {
          let hours = parseInt(parts[0]);
          const minutes = parts[1].split(/\s/)[0];
          // Handle PM
          if (str.toUpperCase().includes('PM') && hours < 12) hours += 12;
          if (str.toUpperCase().includes('AM') && hours === 12) hours = 0;
          return `${String(hours).padStart(2, '0')}:${minutes.padStart(2, '0')}`;
        }
      }
      return str;
    };
    return normalizeTime(expected) === normalizeTime(actual);
  }

  // Handle numbers (convert to number and compare)
  if (typeof expected === 'number') {
    const actualNum = Number(actual);
    return !isNaN(actualNum) && Math.abs(expected - actualNum) < 0.01; // Allow small floating point differences
  }

  // Handle strings (case-insensitive, trim whitespace)
  if (typeof expected === 'string') {
    const normalizedExpected = expected.toLowerCase().trim();
    const normalizedActual = String(actual).toLowerCase().trim();
    
    // For phone numbers, remove formatting
    if (fieldId.toLowerCase().includes('phone')) {
      const digitsExpected = normalizedExpected.replace(/\D/g, '');
      const digitsActual = normalizedActual.replace(/\D/g, '');
      return digitsExpected === digitsActual;
    }
    
    // For credit cards, remove spaces
    if (fieldId.toLowerCase().includes('credit') || fieldId.toLowerCase().includes('card')) {
      const digitsExpected = normalizedExpected.replace(/\s/g, '');
      const digitsActual = normalizedActual.replace(/\s/g, '');
      return digitsExpected === digitsActual;
    }
    
    // For CVV, remove non-digits
    if (fieldId.toLowerCase().includes('cvv')) {
      const digitsExpected = normalizedExpected.replace(/\D/g, '');
      const digitsActual = normalizedActual.replace(/\D/g, '');
      return digitsExpected === digitsActual;
    }
    
    // For zip codes, remove non-digits
    if (fieldId.toLowerCase().includes('zip') || fieldId.toLowerCase().includes('postal')) {
      const digitsExpected = normalizedExpected.replace(/\D/g, '');
      const digitsActual = normalizedActual.replace(/\D/g, '');
      return digitsExpected === digitsActual;
    }
    
    // For currency, remove $ and commas, compare as numbers
    if (fieldId.toLowerCase().includes('amount') || fieldId.toLowerCase().includes('salary') || 
        fieldId.toLowerCase().includes('currency') || fieldId.toLowerCase().includes('price')) {
      const numExpected = parseFloat(normalizedExpected.replace(/[$,]/g, ''));
      const numActual = parseFloat(normalizedActual.replace(/[$,]/g, ''));
      return !isNaN(numExpected) && !isNaN(numActual) && Math.abs(numExpected - numActual) < 0.01;
    }
    
    return normalizedExpected === normalizedActual;
  }

  // Default: strict equality
  return expected === actual;
};

