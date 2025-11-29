# Form Playground Subconscious

A highly configurable form-filling test environment for browser automation and LLM form-filling evaluation.

## Overview

This project provides a dynamic form system where forms are defined in JSON configuration files. It supports 28+ input types, validation, multipage forms, and most importantly - **ground truth comparison** for evaluating LLM form-filling accuracy.

## Features

- **Configuration-Driven Forms**: Define forms in JSON/YAML instead of hardcoded React components
- **28+ Input Types**: Text, email, phone, date, time, file upload, selectors, sliders, currency, credit card, and more
- **AI-Powered Evaluation**: Uses GPT-4o-mini as a judge to evaluate dynamic fields (text, textarea, address) with semantic similarity scoring
- **Intelligent Scoring System**:
  - **Fixed Field Score**: Average accuracy for deterministic fields (email, date, select, checkbox, etc.)
  - **Dynamic Field Score**: Average AI-evaluated score for non-deterministic fields (text, textarea, address)
  - **Overall Accuracy**: Weighted average across all fields (0-100%)
- **Database Integration**: Automatically stores all evaluation results in PostgreSQL (Neon) with detailed field-by-field analysis
- **Ground Truth Comparison**: Compare LLM submissions against expected values with detailed accuracy reports
- **Multipage Forms**: Support for multi-step forms with state persistence
- **Input to LLM**: Each form includes context information for LLM form-filling
- **Real-time Validation**: Field-level and form-level validation
- **Multiple Form Layouts**: Single column, two column, split screen, wizard style, and website-style layouts
- **Industry Examples**: Realistic forms for various industries (job applications, patient registration, payment forms, etc.)

## Getting Started

### Prerequisites

- Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

### Installation

```sh
# Step 1: Clone the repository
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory
cd form-playground-subconcious

# Step 3: Install dependencies
npm install

# Step 4: Set up environment variables
# Create a .env file in the root directory with:
# DATABASE_URL=your_neon_postgresql_connection_string
# OPENAI_API_KEY=your_openai_api_key
# Note: Use OPENAI_API_KEY (not VITE_OPENAI_API_KEY) to keep the key secure on the server side

# Step 5: Start the development servers
# Option 1: Run both frontend and API server together
npm run dev:all

# Option 2: Run them separately (in different terminals)
# Terminal 1: Frontend (Vite)
npm run dev

# Terminal 2: API Server (Express)
npm run dev:api
```

The application will be available at `http://localhost:8080`
The API server will run on `http://localhost:3001`

## Evaluation System

### How It Works

1. **Form Submission**: When a form is submitted, the system compares submitted values against ground truth
2. **Field Classification**: Fields are automatically classified as:
   - **Fixed/Deterministic**: Fields with exact matching (email, date, select, checkbox, etc.)
   - **Dynamic/Non-Deterministic**: Fields requiring semantic evaluation (text, textarea, address)
3. **AI Evaluation**: Dynamic fields are evaluated one-by-one using GPT-4o-mini:
   - Each field receives a similarity score (0-1)
   - AI provides one-line feedback explaining the score
   - Evaluation happens sequentially with progress indication
4. **Score Calculation**:
   - Fixed fields: 1.0 for exact match, 0.0 for mismatch
   - Dynamic fields: AI-generated score (0-1) based on semantic similarity
   - Overall accuracy: Sum of all field scores ÷ total number of fields
5. **Database Storage**: All evaluation data is automatically saved to PostgreSQL:
   - Form metadata (title, description, type, layout)
   - Field-by-field evaluation with scores and feedback
   - Separate columns for fixed field score, dynamic field score, and overall accuracy
   - Timestamped records for tracking evaluation history

### Evaluation Report

After form submission, users see a detailed evaluation report showing:
- Fixed Fields Average Score (percentage)
- Dynamic Fields Average Score (percentage) 
- Individual field results with:
  - Expected vs. submitted values
  - Score (for dynamic fields)
  - AI feedback (for dynamic fields)
- Overall Accuracy (bottom of page)

## Project Structure

- `manual_config.json` - Manually created form configurations
- `llm_generated_config.json` - AI-generated form configurations
- `src/components/DynamicForm.tsx` - Core form renderer with evaluation logic
- `src/components/form-fields/` - Individual field components
- `src/components/form-layouts/` - Form layout components
- `src/utils/form-comparison.ts` - Ground truth comparison logic
- `src/utils/llm-evaluator.ts` - AI-powered field evaluation
- `src/utils/api.ts` - Database API integration
- `src/pages/` - Page components (Index, FormPage, MultipageFormPage, FormCompletePage)
- `api/save-evaluation.ts` - Vercel serverless function for database operations
- `server.js` - Local Express server for development

## Form Configuration

Forms are defined in `config_form.json` with the following structure:

```json
{
  "form-id": {
    "id": "form-id",
    "title": "Form Title",
    "description": "Form description",
    "type": "single-page" | "multipage",
    "inputToLLM": "Context information for LLM",
    "groundTruth": {
      "fieldId": "expected value"
    },
    "pages": [...]
  }
}
```

## Technologies

- **Vite** - Build tool and dev server
- **React** - UI framework
- **TypeScript** - Type safety
- **shadcn-ui** - UI component library
- **Tailwind CSS** - Styling
- **React Router DOM** - Routing
- **date-fns** - Date manipulation
- **OpenAI GPT-4o-mini** - AI-powered field evaluation
- **PostgreSQL (Neon)** - Database for storing evaluation results
- **Express.js** - Local development API server
- **Vercel Serverless Functions** - Production API endpoints

## Database Setup

The application uses PostgreSQL (Neon) to store evaluation results. See `DATABASE_SETUP.md` for:
- Database schema structure
- Environment variable configuration
- Table structure and field descriptions

**Important**: Make sure to set `DATABASE_URL` in your Vercel environment variables for production deployment.

## Building for Production

```sh
npm run build
```

The built files will be in the `dist` directory.

## Deployment

See `DEPLOYMENT.md` for detailed Vercel deployment instructions, including:
- Environment variable setup
- Database configuration
- Serverless function deployment

## License

Private project
