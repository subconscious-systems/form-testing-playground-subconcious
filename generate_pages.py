#!/usr/bin/env python3
"""
Generate form pages using OpenAI GPT-4o model.
This script generates realistic form definitions with proper structure,
inputToLLM instructions, and groundTruth values.
"""

import json
import os
import random
from dotenv import load_dotenv
from openai import OpenAI
from typing import Dict, Any, List

# Load environment variables from .env file
load_dotenv()

# Initialize OpenAI client
api_key = os.getenv('OPENAI_API_KEY')
if not api_key:
    raise ValueError(
        "OPENAI_API_KEY not found. Please create a .env file with OPENAI_API_KEY=your-key-here"
    )

client = OpenAI(api_key=api_key)

# Industries for form generation
INDUSTRIES = [
    "Job Applications",
    "Grant Applications",
    "Scholarship Applications",
    "Lease application",
    "Restaurant reservation",
    "Appointment scheduling (dental, salon, etc.)",
    "Flight booking",
    "Train booking",
    "Bus booking",
    "Hotel booking",
    "Workout class booking",
    "Event registration/ticket purchase",
    "E-commerce → clothing",
    "E-commerce → gaming",
    "E-commerce → furniture",
    "Software bug reporting",
    "Personal loan application",
    "Loan refinancing application",
    "Mortgage application",
    "Insurance claim",
    "Medical doctors office form",
    "Research study",
    "NDA form",
    "Background check form",
    "Project bid → Construction",
    "Project bid → Consulting",
    "Project bid → freelance",
    "Tax filing forms",
    "Passport/Visa applications",
    "Subscription cancellation",
    "Contact us forms",
    "Product return form",
    "Vehicle registration/DMV forms",
    "Pet adoption application",
    "Contest/Sweepstakes entry",
    "Wholesale purchase form",
    "Wholesale seller post form"
]

# JSON Schema for form page generation
FORM_PAGE_SCHEMA = {
    "type": "object",
    "additionalProperties": False,
    "properties": {
        "id": {
            "type": "string",
            "description": "Unique identifier for the form (e.g., 'form-29', 'form-30')"
        },
        "title": {
            "type": "string",
            "description": "Descriptive title for the form"
        },
        "description": {
            "type": "string",
            "description": "Brief description of what the form is for"
        },
        "type": {
            "type": "string",
            "enum": ["single-page", "multipage"],
            "description": "Whether this is a single-page or multipage form"
        },
        "inputToLLM": {
            "type": "string",
            "description": "Detailed instructions for an LLM to fill out this form. Include all field values in a natural language format."
        },
        "pages": {
            "type": "array",
            "items": {
                "type": "object",
                "additionalProperties": False,
                "properties": {
                    "pageNumber": {"type": "integer"},
                    "fields": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "additionalProperties": False,
                            "properties": {
                                "id": {"type": "string"},
                                "type": {
                                    "type": "string",
                                    "enum": [
                                        "text", "textarea", "phone", "email", "url", "file",
                                        "checkbox", "switch", "select", "radio", "multiselect",
                                        "searchable-multiselect", "date", "time", "date-range",
                                        "number", "slider", "color", "currency", "star-rating",
                                        "address", "country", "state", "zip", "credit-card",
                                        "expiration-date", "cvv", "reactive-chunks"
                                    ]
                                },
                                "label": {"type": "string"},
                                "required": {"type": "boolean"},
                                "placeholder": {"type": ["string", "null"]},
                                "options": {"type": ["array", "null"], "items": {"type": "string"}},
                                "min": {"type": ["number", "null"]},
                                "max": {"type": ["number", "null"]},
                                "step": {"type": ["number", "null"]},
                                "defaultValue": {"type": ["number", "string", "null"]},
                                "currency": {"type": ["string", "null"]},
                                "maxStars": {"type": ["integer", "null"]},
                                "maxLength": {"type": ["integer", "null"]},
                                "accept": {"type": ["string", "null"]},
                                "allowed": {"type": ["string", "null"]},
                                "chunkFields": {
                                    "type": ["array", "null"],
                                    "items": {
                                        "type": "object",
                                        "additionalProperties": False
                                    }
                                }
                            },
                            "required": ["id", "type", "label", "required", "placeholder", "options", "min", "max", "step", "defaultValue", "currency", "maxStars", "maxLength", "accept", "allowed", "chunkFields"]
                        }
                    }
                },
                "required": ["pageNumber", "fields"]
            }
        },
        "groundTruth": {
            "type": "object",
            "additionalProperties": True,
            "description": "Expected values for all fields. This MUST be generated LAST after all pages and fields are defined. For each field ID in the form, provide the expected value. Format: dates as 'YYYY-MM-DD' strings, arrays for multi-selects, booleans for checkboxes/switches, numbers as strings or numbers, date-ranges as objects with 'from' and 'to' ISO date strings."
        }
    },
    "required": ["id", "title", "description", "type", "inputToLLM", "pages", "groundTruth"]
}

# Few-shot examples
FEW_SHOT_EXAMPLES = [
    {
        "id": "example-1",
        "title": "Employee Onboarding Form",
        "description": "New employee registration and information collection",
        "type": "single-page",
        "inputToLLM": "You are a new employee filling out an onboarding form. Your name is John Smith, email is john.smith@company.com, phone is 5551234567, employee ID is EMP001, department is Engineering, start date is 2024-09-01, you agree to company policies, and your emergency contact is Jane Smith with phone 5559876543.",
        "groundTruth": {
            "fullName": "John Smith",
            "email": "john.smith@company.com",
            "phone": "5551234567",
            "employeeId": "EMP001",
            "department": "Engineering",
            "startDate": "2024-09-01",
            "agreeToPolicies": True,
            "emergencyContactName": "Jane Smith",
            "emergencyContactPhone": "5559876543"
        },
        "pages": [
            {
                "pageNumber": 1,
                "fields": [
                    {"id": "fullName", "type": "text", "label": "Full Name", "placeholder": "Enter your full name", "required": True},
                    {"id": "email", "type": "email", "label": "Email Address", "placeholder": "you@company.com", "required": True},
                    {"id": "phone", "type": "phone", "label": "Phone Number", "placeholder": "(555) 123-4567", "required": True},
                    {"id": "employeeId", "type": "text", "label": "Employee ID", "placeholder": "EMP001", "required": True},
                    {"id": "department", "type": "select", "label": "Department", "options": ["Engineering", "Sales", "Marketing", "HR", "Finance"], "required": True},
                    {"id": "startDate", "type": "date", "label": "Start Date", "allowed": "after", "required": True},
                    {"id": "agreeToPolicies", "type": "checkbox", "label": "I agree to company policies", "required": True},
                    {"id": "emergencyContactName", "type": "text", "label": "Emergency Contact Name", "placeholder": "Full name", "required": True},
                    {"id": "emergencyContactPhone", "type": "phone", "label": "Emergency Contact Phone", "placeholder": "(555) 123-4567", "required": True}
                ]
            }
        ]
    },
    {
        "id": "example-2",
        "title": "Conference Registration",
        "description": "Multi-page conference registration with personal info, session selection, and payment",
        "type": "multipage",
        "inputToLLM": "You are registering for a tech conference. Page 1: Name is Sarah Johnson, email is sarah.j@email.com, phone is 5559876543, company is TechCorp. Page 2: You want to attend sessions on 'Machine Learning' and 'Cloud Computing', you have dietary restrictions (Vegetarian), and you need accommodation. Page 3: You will pay $450.00, card number is 4532015112830366, expiration is 12/25, CVV is 123, and you agree to terms.",
        "groundTruth": {
            "fullName": "Sarah Johnson",
            "email": "sarah.j@email.com",
            "phone": "5559876543",
            "company": "TechCorp",
            "sessions": ["Machine Learning", "Cloud Computing"],
            "dietaryRestrictions": ["Vegetarian"],
            "needsAccommodation": True,
            "paymentAmount": "450.00",
            "cardNumber": "4532015112830366",
            "expirationDate": "12/25",
            "cvv": "123",
            "agreeToTerms": True
        },
        "pages": [
            {
                "pageNumber": 1,
                "fields": [
                    {"id": "fullName", "type": "text", "label": "Full Name", "placeholder": "Enter your full name", "required": True},
                    {"id": "email", "type": "email", "label": "Email Address", "placeholder": "you@example.com", "required": True},
                    {"id": "phone", "type": "phone", "label": "Phone Number", "placeholder": "(555) 123-4567", "required": True},
                    {"id": "company", "type": "text", "label": "Company Name", "placeholder": "Enter company name", "required": True}
                ]
            },
            {
                "pageNumber": 2,
                "fields": [
                    {"id": "sessions", "type": "searchable-multiselect", "label": "Sessions to Attend", "options": ["Machine Learning", "Cloud Computing", "Web Development", "Data Science", "DevOps"], "required": True},
                    {"id": "dietaryRestrictions", "type": "multiselect", "label": "Dietary Restrictions", "options": ["None", "Vegetarian", "Vegan", "Gluten-Free", "Kosher"], "required": True},
                    {"id": "needsAccommodation", "type": "switch", "label": "Need Hotel Accommodation", "required": False}
                ]
            },
            {
                "pageNumber": 3,
                "fields": [
                    {"id": "paymentAmount", "type": "currency", "label": "Registration Fee (USD)", "currency": "USD", "placeholder": "0.00", "required": True},
                    {"id": "cardNumber", "type": "credit-card", "label": "Credit Card Number", "placeholder": "1234 5678 9012 3456", "required": True},
                    {"id": "expirationDate", "type": "expiration-date", "label": "Expiration Date", "placeholder": "MM/YY", "required": True},
                    {"id": "cvv", "type": "cvv", "label": "CVV", "placeholder": "123", "maxLength": 4, "required": True},
                    {"id": "agreeToTerms", "type": "checkbox", "label": "I agree to the terms and conditions", "required": True}
                ]
            }
        ]
    }
]

def generate_form_page(page_number: int, industry: str, form_id: str) -> Dict[str, Any]:
    """
    Generate a single form page using OpenAI GPT-4o.
    
    Args:
        page_number: The page number (1-10)
        industry: The industry/use case for the form
        form_id: The sequential form ID (e.g., "form-29")
    
    Returns:
        A dictionary containing the generated form definition
    """
    
    system_prompt = """You are an expert form designer creating realistic, industry-grade forms for testing AI form-filling systems.

Your task is to generate a complete form definition. IMPORTANT: Generate the JSON in this exact order:
1. id, title, description, type
2. inputToLLM (describe all field values that will be in groundTruth)
3. pages (all pages with all fields)
4. groundTruth (LAST - generate this after you know all field IDs from all pages)

The groundTruth object must contain an entry for EVERY field ID that appears in the pages. 
Format groundTruth values to match React component output:
   - Dates as 'YYYY-MM-DD' strings
   - Date ranges as objects: {"from": "YYYY-MM-DD", "to": "YYYY-MM-DD"}
   - Arrays for multi-select fields
   - Booleans for checkboxes/switches
   - Numbers as strings or numbers
   - Phone numbers as 10-digit strings (no formatting)
   - Credit card numbers as strings without spaces
   - CVV as 3-4 digit strings

Important rules:
- Use realistic field combinations (e.g., don't mix unrelated fields)
- Ensure groundTruth matches the inputToLLM description exactly
- For date fields, use 'allowed: "before"' for dates in the past (like DOB) and 'allowed: "after"' for future dates
- For multipage forms, distribute fields logically across pages
- Include validation-appropriate fields (phone, email, URL, etc.)
- Make forms industry-realistic (job apps, loan apps, registrations, etc.)
- Generate groundTruth LAST after you have defined all pages and fields

Generate diverse forms - vary industries, complexity, and field types."""

    user_prompt = f"""Generate a realistic, industry-grade form for: {industry}

CRITICAL: Generate the JSON in this exact order:
1. First: id (use exactly "{form_id}"), title, description, type
2. Second: inputToLLM (describe what values will be filled in - this guides groundTruth)
3. Third: pages (define ALL pages and ALL fields with their IDs)
4. LAST: groundTruth (after you know all field IDs from pages, create groundTruth with a key for each field ID)

Requirements:
- The form MUST be for: {industry}
- Use the exact form ID: "{form_id}" (do not generate a different ID)
- It can be single-page or multipage (if multipage, use 2-4 pages)
- Include 5-12 fields per page
- Mix different field types appropriately
- In inputToLLM, describe ALL field values that will appear in groundTruth
- In groundTruth, include an entry for EVERY field ID from all pages
- Ensure groundTruth values exactly match what you described in inputToLLM
- Use proper date formats and restrictions
- Make it realistic and useful for testing AI form-filling
- The form should be specific to the {industry} industry/use case

Generate a unique, realistic form for {industry}. Remember: groundTruth must be the LAST property in the JSON, and use the exact ID "{form_id}"."""

    try:
        response = client.beta.chat.completions.parse(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": "Here are two examples of well-structured forms:\n\n" + json.dumps(FEW_SHOT_EXAMPLES, indent=2)},
                {"role": "user", "content": user_prompt}
            ],
            response_format={
                "type": "json_schema",
                "json_schema": {
                    "name": "form_definition",
                    "strict": False,
                    "schema": FORM_PAGE_SCHEMA
                }
            },
            temperature=0.8
        )
        
        generated_form = json.loads(response.choices[0].message.content)
        # Ensure the ID matches what we requested
        generated_form["id"] = form_id
        print(f"✓ Generated form #{page_number} ({industry}): {generated_form.get('title', 'Unknown')}")
        return generated_form
        
    except Exception as e:
        print(f"✗ Error generating form #{page_number}: {str(e)}")
        raise

def main():
    """Main function to generate 10 form pages."""
    
    print("Starting form generation with OpenAI GPT-4o...")
    print("=" * 60)
    
    # Load manual config to count existing forms
    manual_config = {}
    manual_config_file = "manual_config.json"
    if os.path.exists(manual_config_file):
        try:
            with open(manual_config_file, 'r', encoding='utf-8') as f:
                manual_config = json.load(f)
            print(f"Loaded {len(manual_config)} forms from {manual_config_file}")
        except Exception as e:
            print(f"Warning: Could not load manual config: {e}")
            manual_config = {}
    
    # Load existing LLM config if it exists
    output_file = "llm_generated_config.json"
    existing_config = {}
    
    if os.path.exists(output_file):
        try:
            with open(output_file, 'r', encoding='utf-8') as f:
                existing_config = json.load(f)
            print(f"Loaded {len(existing_config)} existing LLM forms from {output_file}")
        except Exception as e:
            print(f"Warning: Could not load existing config: {e}")
            existing_config = {}
    
    # Calculate starting ID for LLM forms (after manual forms)
    manual_form_count = len(manual_config)
    existing_llm_count = len(existing_config)
    start_id = manual_form_count + existing_llm_count + 1
    
    # Generate 10 new forms
    generated_forms = {}
    
    for i in range(1, 11):
        form_number = start_id + i - 1
        form_id = f"form-{form_number}"
        
        # Skip if already exists
        if form_id in existing_config:
            print(f"⚠ Form {form_id} already exists, skipping...")
            continue
        
        # Randomly select an industry
        industry = random.choice(INDUSTRIES)
        
        try:
            form = generate_form_page(i, industry, form_id)
            generated_forms[form_id] = form
            print(f"  Form ID: {form_id}")
            print(f"  Industry: {industry}")
            print(f"  Title: {form.get('title', 'N/A')}")
            print(f"  Type: {form.get('type', 'N/A')}")
            print(f"  Pages: {len(form.get('pages', []))}")
            print()
            
        except Exception as e:
            print(f"✗ Failed to generate form #{i}: {str(e)}")
            print()
            continue
    
    # Merge with existing config
    all_forms = {**existing_config, **generated_forms}
    
    # Save to file
    try:
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(all_forms, f, indent=2, ensure_ascii=False)
        print("=" * 60)
        print(f"✓ Successfully saved {len(generated_forms)} new forms to {output_file}")
        print(f"  Total forms in file: {len(all_forms)}")
    except Exception as e:
        print(f"✗ Error saving to file: {str(e)}")
        raise

if __name__ == "__main__":
    main()

