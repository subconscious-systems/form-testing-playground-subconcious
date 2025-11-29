/**
 * Local development server for API endpoints
 * This runs alongside Vite in development mode
 */

import express from 'express';
import cors from 'cors';
import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.API_PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize connection pool
let pool = null;

const getPool = () => {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    
    pool = new Pool({
      connectionString,
      ssl: {
        rejectUnauthorized: false
      },
      max: 1,
    });
  }
  return pool;
};

// API endpoint
app.post('/api/save-evaluation', async (req, res) => {
  try {
    // Check if DATABASE_URL is set before attempting connection
    if (!process.env.DATABASE_URL) {
      return res.status(500).json({
        error: 'Database configuration error',
        message: 'DATABASE_URL environment variable is not set. Please add it to your .env file.'
      });
    }

    const dbPool = getPool();

    const {
      form_id,
      title,
      description,
      type,
      layout,
      inputToLLM,
      field_eval,
      fixed_field_score,
      dynamic_field_score,
      overall_accuracy
    } = req.body;

    // Validate required fields
    if (!form_id || !field_eval || fixed_field_score === undefined || dynamic_field_score === undefined || overall_accuracy === undefined) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        message: 'form_id, field_eval, fixed_field_score, dynamic_field_score, and overall_accuracy are required' 
      });
    }

    // Insert evaluation into database
    const insertQuery = `
      INSERT INTO form_evaluations (
        form_id,
        title,
        description,
        type,
        layout,
        input_to_llm,
        field_eval,
        fixed_field_score,
        dynamic_field_score,
        overall_accuracy
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING eval_id, created_at
    `;

    const result = await dbPool.query(insertQuery, [
      form_id,
      title || null,
      description || null,
      type || null,
      layout || null,
      inputToLLM || null,
      JSON.stringify(field_eval),
      fixed_field_score,
      dynamic_field_score,
      overall_accuracy
    ]);

    return res.status(200).json({
      success: true,
      eval_id: result.rows[0].eval_id,
      created_at: result.rows[0].created_at
    });
  } catch (error) {
    console.error('Database error:', error);
    
    // Provide more helpful error messages
    let errorMessage = 'Unknown error';
    if (error instanceof Error) {
      errorMessage = error.message;
      // Check for common database connection errors
      if (error.message.includes('DATABASE_URL') || error.message.includes('connection')) {
        errorMessage = 'Database connection failed. Please verify DATABASE_URL is set correctly in your .env file.';
      }
    }
    
    return res.status(500).json({
      error: 'Failed to save evaluation',
      message: errorMessage
    });
  }
});

// LLM evaluation endpoint
app.post('/api/evaluate-field', async (req, res) => {
  try {
    // Check if OPENAI_API_KEY is set
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: 'OpenAI API key not configured',
        message: 'OPENAI_API_KEY environment variable is not set. Please add it to your .env file.'
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
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`🚀 Local API server running on http://localhost:${PORT}`);
  console.log(`📝 API endpoint: http://localhost:${PORT}/api/save-evaluation`);
});

