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
  }>;
  accuracy: number; // 0-100
}

/**
 * Compare form submission data against ground truth
 */
export const compareWithGroundTruth = (
  submittedData: Record<string, any>,
  groundTruth: Record<string, any>
): ComparisonResult => {
  const fieldResults: ComparisonResult['fieldResults'] = {};
  let correctFields = 0;
  let totalFields = 0;
  const missingFields: string[] = [];
  const extraFields: string[] = [];

  // Check all ground truth fields
  Object.keys(groundTruth).forEach(fieldId => {
    totalFields++;
    const expected = groundTruth[fieldId];
    const actual = submittedData[fieldId];
    const match = compareValues(expected, actual, fieldId);
    
    fieldResults[fieldId] = {
      expected,
      actual: actual ?? null,
      match
    };

    if (match) {
      correctFields++;
    } else {
      if (actual === undefined || actual === null || actual === '' || 
          (Array.isArray(actual) && actual.length === 0)) {
        missingFields.push(fieldId);
      }
    }
  });

  // Check for extra fields in submission
  Object.keys(submittedData).forEach(fieldId => {
    if (!groundTruth.hasOwnProperty(fieldId)) {
      extraFields.push(fieldId);
    }
  });

  const accuracy = totalFields > 0 ? (correctFields / totalFields) * 100 : 0;

  return {
    totalFields,
    correctFields,
    incorrectFields: totalFields - correctFields,
    missingFields,
    extraFields,
    fieldResults,
    accuracy: Math.round(accuracy * 100) / 100
  };
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

  // Handle dates (normalize to ISO string date part)
  if (fieldId.toLowerCase().includes('date') && !fieldId.toLowerCase().includes('range')) {
    try {
      // Handle both Date objects and date strings
      const expectedDate = expected instanceof Date 
        ? expected.toISOString().split('T')[0]
        : new Date(expected).toISOString().split('T')[0];
      const actualDate = actual instanceof Date
        ? actual.toISOString().split('T')[0]
        : new Date(actual).toISOString().split('T')[0];
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

