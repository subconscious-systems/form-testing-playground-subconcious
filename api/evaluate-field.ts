import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check if OPENAI_API_KEY is set
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: 'OpenAI API key not configured',
        message: 'OPENAI_API_KEY environment variable is not set. Please configure it in your Vercel project settings.'
      });
    }

    const { expected, actual, fieldLabel } = req.body;

    // Validate required fields
    if (!expected || !actual) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'expected and actual values are required'
      });
    }

    // Call OpenAI API
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
      return res.status(response.status).json({
        error: 'OpenAI API error',
        message: `OpenAI API returned ${response.status}: ${errorText}`
      });
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      return res.status(500).json({
        error: 'Invalid response from OpenAI',
        message: 'No response content from OpenAI API'
      });
    }

    const result = JSON.parse(content);
    const score = typeof result.score === 'number' 
      ? Math.max(0, Math.min(1, result.score)) // Clamp between 0 and 1
      : 0.5; // Default score if invalid

    const feedback = typeof result.feedback === 'string' 
      ? result.feedback.trim()
      : `Score: ${(score * 100).toFixed(0)}%`;

    return res.status(200).json({
      score,
      feedback
    });
  } catch (error) {
    console.error('Evaluation error:', error);
    return res.status(500).json({
      error: 'Failed to evaluate field',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

