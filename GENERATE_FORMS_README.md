# Form Generation with OpenAI GPT-4o

This directory contains scripts to generate form definitions using OpenAI's GPT-4o model.

## Setup

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

2. Set your OpenAI API key:
```bash
export OPENAI_API_KEY="your-api-key-here"
```

Or on Windows:
```cmd
set OPENAI_API_KEY=your-api-key-here
```

Or create a `.env` file (if using python-dotenv):
```
OPENAI_API_KEY=your-api-key-here
```

## Usage

Run the generation script:
```bash
python generate_pages.py
```

This will:
- Generate 10 new form definitions
- Save them to `llm_generated_config.json`
- Skip forms that already exist (based on form ID)

## Output

The generated forms are saved in `llm_generated_config.json` in the root directory. This file is automatically copied to the `public` folder so it can be served by the web application.

## Form Structure

Each generated form includes:
- **id**: Unique identifier (e.g., `llm-form-1`)
- **title**: Descriptive title
- **description**: Brief description
- **type**: Either `single-page` or `multipage`
- **inputToLLM**: Natural language instructions for an LLM to fill the form
- **groundTruth**: Expected values matching React component output formats
- **pages**: Array of form pages with fields

## Viewing Generated Forms

1. Start the development server:
```bash
npm run dev
```

2. Open the application in your browser
3. Toggle the "LLM Generated Forms" switch on the home page
4. Browse and test the generated forms

## Customization

To generate more or fewer forms, modify the loop in `generate_pages.py`:
```python
for i in range(1, 11):  # Change 11 to desired number + 1
```

To change the model or temperature, modify the `generate_form_page` function in `generate_pages.py`.

