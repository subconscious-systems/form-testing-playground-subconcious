# Form Playground Subconscious

A highly configurable form-filling test environment for browser automation and LLM form-filling evaluation.

## Overview

This project provides a dynamic form system where forms are defined in JSON configuration files. It supports 28+ input types, validation, multipage forms, and most importantly - **ground truth comparison** for evaluating LLM form-filling accuracy.

## Features

- **Configuration-Driven Forms**: Define forms in JSON/YAML instead of hardcoded React components
- **28+ Input Types**: Text, email, phone, date, time, file upload, selectors, sliders, currency, credit card, and more
- **Ground Truth Comparison**: Compare LLM submissions against expected values with detailed accuracy reports
- **Multipage Forms**: Support for multi-step forms with state persistence
- **Input to LLM**: Each form includes context information for LLM form-filling
- **Real-time Validation**: Field-level and form-level validation
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
# VITE_OPENAI_API_KEY=your_openai_api_key

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

## Project Structure

- `config_form.json` - Central configuration file for all forms
- `src/components/DynamicForm.tsx` - Core form renderer
- `src/components/form-fields/` - Individual field components
- `src/utils/form-comparison.ts` - Ground truth comparison logic
- `src/pages/` - Page components (Index, FormPage, MultipageFormPage)

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

## Building for Production

```sh
npm run build
```

The built files will be in the `dist` directory.

## License

Private project
