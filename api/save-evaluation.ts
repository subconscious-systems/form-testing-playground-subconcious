import { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from 'pg';

// Initialize connection pool (reuse connection for serverless)
let pool: Pool | null = null;

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
      max: 1, // Limit connections for serverless
    });
  }
  return pool;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check if DATABASE_URL is set before attempting connection
    if (!process.env.DATABASE_URL) {
      return res.status(500).json({
        error: 'Database configuration error',
        message: 'DATABASE_URL environment variable is not set. Please configure it in your Vercel project settings.'
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
        errorMessage = 'Database connection failed. Please verify DATABASE_URL is set correctly in Vercel environment variables.';
      }
    }
    
    return res.status(500).json({
      error: 'Failed to save evaluation',
      message: errorMessage
    });
  }
}

