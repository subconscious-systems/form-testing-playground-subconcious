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
      overall_accuracy
    } = req.body;

    // Validate required fields
    if (!form_id || !field_eval || overall_accuracy === undefined) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        message: 'form_id, field_eval, and overall_accuracy are required' 
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
        overall_accuracy
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
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

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`🚀 Local API server running on http://localhost:${PORT}`);
  console.log(`📝 API endpoint: http://localhost:${PORT}/api/save-evaluation`);
});

