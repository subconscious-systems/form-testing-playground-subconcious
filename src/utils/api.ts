/**
 * API utility functions for saving evaluations to database
 */

interface FieldEval {
  expected: any;
  submitted: any;
  score: number; // 0-1 for both fixed and dynamic fields
  dynamic: boolean;
  inputType: string; // Field input type (text, email, date, etc.)
  feedback?: string; // Only for dynamic fields
}

interface SaveEvaluationPayload {
  form_id: string;
  title?: string;
  description?: string;
  type?: string;
  layout?: string;
  inputToLLM?: string;
  field_eval: Record<string, FieldEval>;
  fixed_field_score: number;
  dynamic_field_score: number;
  overall_accuracy: number;
}

/**
 * Save evaluation to database
 */
export const saveEvaluationToDatabase = async (payload: SaveEvaluationPayload): Promise<{ success: boolean; eval_id?: number; error?: string }> => {
  try {
    const response = await fetch('/api/save-evaluation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch {
        // If response is not JSON, use status text
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return { success: true, eval_id: data.eval_id };
  } catch (error) {
    console.error('Error saving evaluation:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

