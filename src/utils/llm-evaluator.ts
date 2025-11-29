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
 * Throws error if API key is not available - no fallback
 */
export const evaluateTextFieldWithLLM = async (
  expected: string,
  actual: string,
  fieldLabel?: string
): Promise<LLMEvaluationResult> => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error('VITE_OPENAI_API_KEY is required for dynamic field evaluation');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an evaluator comparing two text values for a form field. Your task is to determine how well the submitted value matches the expected value. Consider:
- Semantic similarity (do they mean the same thing?)
- Acceptable variations (abbreviations, formatting differences, minor wording changes)
- Context relevance (is the submitted value appropriate for this field?)

Return ONLY a JSON object with:
- "score": a number between 0 and 1 (1.0 = perfect match, 0.0 = completely different)
- "feedback": a short one-line explanation (max 100 characters) explaining why this score was given

Be lenient with formatting, capitalization, and minor wording differences. Focus on whether the information is semantically equivalent.`
        },
        {
          role: 'user',
          content: `Field: ${fieldLabel || 'Text field'}
Expected value: "${expected}"
Submitted value: "${actual}"

Evaluate the similarity and return a JSON object with "score" (0-1) and "feedback" (one-line explanation).`
        }
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' }
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content;
  
  if (!content) {
    throw new Error('No response from OpenAI API');
  }

  const result = JSON.parse(content);
  const score = typeof result.score === 'number' 
    ? Math.max(0, Math.min(1, result.score)) // Clamp between 0 and 1
    : 0.5; // Default score if invalid

  const feedback = typeof result.feedback === 'string' 
    ? result.feedback.trim()
    : `Score: ${(score * 100).toFixed(0)}%`;

  return {
    score,
    feedback
  };
};

