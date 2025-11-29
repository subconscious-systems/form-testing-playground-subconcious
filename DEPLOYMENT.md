# Vercel Deployment Guide

## Prerequisites

1. **Database Schema**: Make sure you've run the SQL script from `database_schema.sql` in your Neon PostgreSQL database to create/update the `form_evaluations` table.

2. **Environment Variables**: Set the following environment variables in your Vercel project settings:

   - `DATABASE_URL`: Your Neon PostgreSQL connection string
     ```
     postgresql://username:password@host:port/database?sslmode=require
     ```
     (Get your connection string from your Neon dashboard)
   
   - `OPENAI_API_KEY`: Your OpenAI API key (for LLM evaluation of dynamic fields)
     ```
     sk-...
     ```
     **Important**: Use `OPENAI_API_KEY` (without `VITE_` prefix) to keep the key secure on the server side.

## Deployment Steps

1. **Push to Git**: Make sure all your changes are committed and pushed to your Git repository.

2. **Connect to Vercel**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Import your Git repository
   - Vercel will auto-detect it's a Vite project

3. **Set Environment Variables**:
   - In your Vercel project settings, go to "Environment Variables"
   - Add `DATABASE_URL` (available for Production, Preview, and Development)
   - Add `OPENAI_API_KEY` (available for Production, Preview, and Development)
     - **Security Note**: Do NOT use `VITE_OPENAI_API_KEY`. The `VITE_` prefix exposes the key to the browser, which is a security risk.

4. **Deploy**:
   - Click "Deploy" or push to your main branch
   - Vercel will automatically build and deploy

## How It Works

- **Frontend**: Vite builds the React app and serves it as static files
- **API Routes**: 
  - `/api/save-evaluation` - Handled by Vercel's serverless function (`api/save-evaluation.ts`)
  - `/api/evaluate-field` - Handled by Vercel's serverless function (`api/evaluate-field.ts`) for secure LLM evaluation
- **Routing**: `vercel.json` ensures client-side routing works for direct URL access (e.g., `/123` or `/123/complete`)
- **Database**: The serverless function connects to Neon PostgreSQL using the `DATABASE_URL` environment variable
- **LLM Evaluation**: OpenAI API calls are made server-side via `/api/evaluate-field` to keep the API key secure

## Important Notes

- The `server.js` file is **only for local development**. Vercel uses serverless functions in the `api/` directory instead.
- **Security**: Use `OPENAI_API_KEY` (not `VITE_OPENAI_API_KEY`) to keep your API key secure. The `VITE_` prefix exposes environment variables to the browser, which is a security risk for API keys.
- The database schema must match the structure in `database_schema.sql` for the API to work correctly.

## Troubleshooting

- **404 on API calls**: Check that `DATABASE_URL` is set correctly in Vercel environment variables
- **LLM evaluation fails**: Check that `OPENAI_API_KEY` (not `VITE_OPENAI_API_KEY`) is set in Vercel environment variables
- **Database connection errors**: Verify your Neon PostgreSQL connection string is correct and the database is accessible
- **Direct URL access doesn't work**: Ensure `vercel.json` is in the root directory and has the correct rewrite rules

