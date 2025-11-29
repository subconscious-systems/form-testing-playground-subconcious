/**
 * LLM-as-Judge evaluation for non-deterministic fields (text, textarea, address)
 * Uses GPT-4o-mini to score similarity between expected and actual values
 */

export interface LLMEvaluationResult {
  score: number; // 0-1
  feedback: string; // One-line explanation of the score
}

/**
 * Evaluate a text field using LLM-as-judge
 * Returns a score between 0 and 1 with feedback
 * Calls backend API endpoint to keep API key secure
 */
export const evaluateTextFieldWithLLM = async (
  expected: string,
  actual: string,
  fieldLabel?: string
): Promise<LLMEvaluationResult> => {
  const response = await fetch('/api/evaluate-field', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      expected,
      actual,
      fieldLabel
    }),
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
  return {
    score: data.score,
    feedback: data.feedback
  };
};

