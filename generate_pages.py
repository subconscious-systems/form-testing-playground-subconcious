import json
import os
import random
from datetime import datetime, timedelta
from dotenv import load_dotenv
from openai import OpenAI
from typing import Dict, Any, List, Optional, Literal, Union
from pydantic import BaseModel, Field, field_validator, model_validator

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

# Pydantic Models for form page generation

# Field type enum
FieldType = Literal[
    "text", "textarea", "phone", "email", "url",
                                        "checkbox", "switch", "select", "radio", "multiselect",
                                        "searchable-multiselect", "date", "time", "date-range",
    "number", "slider", "currency", "star-rating",
                                        "address", "country", "state", "zip", "credit-card",
                                        "expiration-date", "cvv", "reactive-chunks"
                                    ]

FormType = Literal["single-page", "multipage"]
LayoutType = Literal["single-column", "two-column", "split-screen", "wizard-style", "website-style"]

# Valid country and state lists (must match UI components)
VALID_COUNTRIES_LIST = [
    "United States", "Canada", "United Kingdom", "Australia", "Germany", "France", 
    "Japan", "China", "India", "Brazil", "Mexico", "Spain", "Italy", "South Korea", 
    "Netherlands", "Sweden"
]

VALID_STATES_LIST = [
    "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware",
    "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas",
    "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi",
    "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico", "New York",
    "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina",
    "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia",
    "Wisconsin", "Wyoming"
]

VALID_ADDRESSES_LIST = [
    "123 Main Street, New York, NY 10001",
    "123 Main St, Boston, MA 02101",
    "1234 Main Street, Los Angeles, CA 90001",
    "1234 Main St, Chicago, IL 60601",
    "12 Main Avenue, New York, NY 10002",
    "12 Main Ave, San Francisco, CA 94102",
    "123 Oak Street, Seattle, WA 98101",
    "123 Oak St, Portland, OR 97201",
    "1234 Oak Street, Denver, CO 80201",
    "1234 Oak Ave, Phoenix, AZ 85001",
    "456 Park Avenue, New York, NY 10022",
    "456 Park Ave, Miami, FL 33101",
    "4567 Park Avenue, Houston, TX 77001",
    "4567 Park St, Atlanta, GA 30301",
    "789 Elm Street, Philadelphia, PA 19101",
    "789 Elm St, Washington, DC 20001",
    "7890 Elm Street, Dallas, TX 75201",
    "7890 Elm Ave, San Diego, CA 92101",
    "321 Pine Street, Austin, TX 78701",
    "321 Pine St, Nashville, TN 37201",
    "3210 Pine Avenue, Las Vegas, NV 89101",
    "3210 Pine St, Minneapolis, MN 55401",
    "555 Broadway, New York, NY 10012",
    "555 Broadway St, San Antonio, TX 78201",
    "5555 Broadway Avenue, Columbus, OH 43201"
]


class ChunkField(BaseModel):
    """Represents a field within a reactive-chunks field."""
    # For OpenAI structured output, we need to define specific fields
    # If chunk fields need to be flexible, we'll handle that in validation
    model_config = {"extra": "forbid"}


class FormField(BaseModel):
    """Represents a single form field."""
    id: str = Field(..., description="Unique identifier for the field")
    type: FieldType = Field(..., description="Type of the form field")
    label: str = Field(..., description="Label text for the field")
    required: bool = Field(..., description="Whether the field is required")
    placeholder: Optional[str] = Field(None, description="Placeholder text")
    options: Optional[List[str]] = Field(
        None, 
        description="Options for select/multiselect/radio/address fields. If type is 'country', options must be from: " + ", ".join(VALID_COUNTRIES_LIST) + ". If type is 'state', options must be from the 50 US states list. If type is 'address', options must be from the valid addresses list. Schema validation will enforce this."
    )
    min: Optional[float] = Field(None, description="Minimum value for number/slider fields")
    max: Optional[float] = Field(None, description="Maximum value for number/slider fields")
    step: Optional[float] = Field(None, description="Step value for number/slider fields")
    defaultValue: Optional[Union[float, str]] = Field(
        None, 
        description="Default value for the field. If type is 'country', must be from: " + ", ".join(VALID_COUNTRIES_LIST) + ". If type is 'state', must be from the 50 US states list. If type is 'address', must be from the valid addresses list. Schema validation will enforce this."
    )
    currency: Optional[str] = Field(None, description="Currency code for currency fields")
    maxStars: Optional[int] = Field(None, description="Maximum stars for star-rating fields")
    maxLength: Optional[int] = Field(None, description="Maximum length for text fields")
    allowed: Optional[str] = Field(None, description="Date restriction: 'before' or 'after'")
    # dateStyle and rangeStyle are NOT generated by LLM - they are assigned automatically in round-robin fashion
    dateStyle: Optional[str] = Field(None, description="DO NOT GENERATE THIS FIELD. It will be automatically assigned.")
    rangeStyle: Optional[str] = Field(None, description="DO NOT GENERATE THIS FIELD. It will be automatically assigned.")
    chunkFields: Optional[List[ChunkField]] = Field(None, description="Fields for reactive-chunks type")
    
    @model_validator(mode='after')
    def validate_country_state_fields(self):
        """Validate that country and state fields only use valid values."""
        if self.type == "country":
            # Validate options
            if self.options:
                invalid = [opt for opt in self.options if opt not in VALID_COUNTRIES_LIST]
                if invalid:
                    raise ValueError(f"Invalid countries in options: {invalid}. Must be one of: {VALID_COUNTRIES_LIST}")
            # Validate defaultValue
            if self.defaultValue and isinstance(self.defaultValue, str):
                if self.defaultValue not in VALID_COUNTRIES_LIST:
                    raise ValueError(f"Invalid country default value: {self.defaultValue}. Must be one of: {VALID_COUNTRIES_LIST}")
        
        elif self.type == "state":
            # Validate options
            if self.options:
                invalid = [opt for opt in self.options if opt not in VALID_STATES_LIST]
                if invalid:
                    raise ValueError(f"Invalid states in options: {invalid}. Must be one of: {VALID_STATES_LIST}")
            # Validate defaultValue
            if self.defaultValue and isinstance(self.defaultValue, str):
                if self.defaultValue not in VALID_STATES_LIST:
                    raise ValueError(f"Invalid state default value: {self.defaultValue}. Must be one of: {VALID_STATES_LIST}")
        
        elif self.type == "address":
            # Validate options
            if self.options:
                invalid = [opt for opt in self.options if opt not in VALID_ADDRESSES_LIST]
                if invalid:
                    raise ValueError(f"Invalid addresses in options: {invalid}. Must be one of: {VALID_ADDRESSES_LIST}")
            # Validate defaultValue
            if self.defaultValue and isinstance(self.defaultValue, str):
                if self.defaultValue not in VALID_ADDRESSES_LIST:
                    raise ValueError(f"Invalid address default value: {self.defaultValue}. Must be one of: {VALID_ADDRESSES_LIST}")
        
        return self


class Page(BaseModel):
    """Represents a single page in a form."""
    pageNumber: int = Field(..., description="Page number (1-indexed)")
    fields: List[FormField] = Field(..., description="List of fields on this page")


class NavigationItem(BaseModel):
    """Represents a navigation item in website-style layout."""
    label: str = Field(..., description="Navigation label")
    href: str = Field(..., description="Navigation link URL")
    active: Optional[bool] = Field(None, description="Whether this item is currently active")


class SidebarLink(BaseModel):
    """Represents a link in the sidebar content."""
    label: str = Field(..., description="Link label")
    href: str = Field(..., description="Link URL")


class SidebarContent(BaseModel):
    """Represents sidebar content in website-style layout."""
    title: str = Field(..., description="Sidebar title")
    content: str = Field(..., description="Sidebar content text")
    links: Optional[List[SidebarLink]] = Field(None, description="Optional links in sidebar")


class FooterLink(BaseModel):
    """Represents a single link in footer link groups."""
    label: str = Field(..., description="Link label")
    href: str = Field(..., description="Link URL")


class FooterLinkGroup(BaseModel):
    """Represents a group of footer links."""
    title: str = Field(..., description="Group title")
    links: List[FooterLink] = Field(..., description="List of links in this group")


class WebsiteContext(BaseModel):
    """Context for website-style layout. REQUIRED if layout is 'website-style'."""
    companyName: str = Field(..., description="Company name")
    logoUrl: Optional[str] = Field(None, description="DO NOT generate this field. Leave it null/undefined. The UI will automatically show a placeholder logo based on the company name initial.")
    themeColor: str = Field(..., description="Hex code, e.g., #2563EB")
    navigationItems: List[NavigationItem] = Field(..., description="Navigation menu items")
    heroTitle: str = Field(..., description="Hero section title")
    heroSubtitle: str = Field(..., description="Hero section subtitle")
    sidebarContent: Optional[SidebarContent] = Field(None, description="Sidebar content")
    footerLinks: List[FooterLinkGroup] = Field(..., description="Footer link groups")


class FormDefinition(BaseModel):
    """Complete form definition with all pages and metadata."""
    id: str = Field(..., description="Unique identifier for the form (e.g., '29', '30') - just the number as a string")
    title: str = Field(..., description="Descriptive title for the form")
    description: str = Field(..., description="Brief description of what the form is for")
    type: FormType = Field(..., description="Whether this is a single-page or multipage form")
    layout: LayoutType = Field(
        ...,
        description="Layout style for the form: 'single-column' (vertical stack), 'two-column' (grid), 'split-screen' (two columns with sidebar), 'wizard-style' (sectioned with dividers), 'website-style' (professional website layout with header, navigation, and side-by-side content)"
    )
    inputToLLM: str = Field(
        ...,
        description="Detailed instructions for an LLM to fill out this form, written in FIRST PERSON mode. Describe all field values as if the person filling the form is speaking about themselves (e.g., 'My name is John Smith, my email is john@example.com, my address is 123 Main St...'). Do NOT use second person."
    )
    pages: List[Page] = Field(..., description="List of pages in the form")
    websiteContext: Optional[WebsiteContext] = Field(
        None,
        description="Context for website-style layout. REQUIRED if layout is 'website-style'."
    )
    groundTruth: Dict[str, Any] = Field(
        ...,
        description="Expected values for all fields. This MUST be generated LAST after all pages and fields are defined. For each field ID in the form, provide the expected value. Format: dates as 'YYYY-MM-DD' strings, arrays for multi-selects, booleans for checkboxes/switches, numbers as strings or numbers, date-ranges as objects with 'from' and 'to' ISO date strings."
    )
    
    model_config = {"extra": "forbid"}
    
    @model_validator(mode='after')
    def validate_ground_truth_country_state(self):
        """Validate that groundTruth values for country and state fields are valid."""
        # Build a map of field IDs to their types
        field_types = {}
        for page in self.pages:
            for field in page.fields:
                field_types[field.id] = field.type
        
        # Validate groundTruth values
        for field_id, value in self.groundTruth.items():
            field_type = field_types.get(field_id)
            
            if field_type == "country":
                if isinstance(value, str) and value not in VALID_COUNTRIES_LIST:
                    raise ValueError(f"Invalid country value in groundTruth for field '{field_id}': {value}. Must be one of: {VALID_COUNTRIES_LIST}")
                elif isinstance(value, list):
                    invalid = [v for v in value if v not in VALID_COUNTRIES_LIST]
                    if invalid:
                        raise ValueError(f"Invalid country values in groundTruth for field '{field_id}': {invalid}. Must be from: {VALID_COUNTRIES_LIST}")
            
            elif field_type == "state":
                if isinstance(value, str) and value not in VALID_STATES_LIST:
                    raise ValueError(f"Invalid state value in groundTruth for field '{field_id}': {value}. Must be one of: {VALID_STATES_LIST}")
                elif isinstance(value, list):
                    invalid = [v for v in value if v not in VALID_STATES_LIST]
                    if invalid:
                        raise ValueError(f"Invalid state values in groundTruth for field '{field_id}': {invalid}. Must be from: {VALID_STATES_LIST}")
            
            elif field_type == "address":
                if isinstance(value, str) and value not in VALID_ADDRESSES_LIST:
                    raise ValueError(f"Invalid address value in groundTruth for field '{field_id}': {value}. Must be one of: {VALID_ADDRESSES_LIST}")
                elif isinstance(value, list):
                    invalid = [v for v in value if v not in VALID_ADDRESSES_LIST]
                    if invalid:
                        raise ValueError(f"Invalid address values in groundTruth for field '{field_id}': {invalid}. Must be from: {VALID_ADDRESSES_LIST}")
        
        return self

# Few-shot examples
FEW_SHOT_EXAMPLES = [
    {
        "id": "example-1",
        "title": "Employee Onboarding Form",
        "description": "New employee registration and information collection",
        "type": "single-page",
        "inputToLLM": "I am a new employee filling out an onboarding form. My name is John Smith, my email is john.smith@company.com, my phone number is 5551234567, my employee ID is EMP001, my department is Engineering, my start date is 2024-09-01, I agree to company policies, and my emergency contact is Jane Smith with phone number 5559876543.",
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
        "inputToLLM": "I am registering for a tech conference. Page 1: My name is Sarah Johnson, my email is sarah.j@email.com, my phone number is 5559876543, and my company is TechCorp. Page 2: I want to attend sessions on 'Machine Learning' and 'Cloud Computing', I have dietary restrictions (Vegetarian), and I need accommodation. Page 3: I will pay $450.00, my card number is 4532015112830366, expiration is 12/25, CVV is 123, and I agree to terms.",
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

def assign_date_styles_random(form_dict: Dict[str, Any], form_id: str) -> Dict[str, Any]:
    """
    Assign dateStyle and rangeStyle to date and date-range fields randomly.
    This ensures random distribution of all date picker types across all forms.
    """
    # Date picker styles (3 types)
    date_styles = ["default", "ios-scroll", "text-input"]
    # Date range picker styles (2 types)
    range_styles = ["single-calendar", "dual-calendar"]
    
    # Use form_id as seed for reproducibility (same form always gets same styles)
    random.seed(hash(form_id) if not form_id.isdigit() else int(form_id))
    
    # Process all pages
    if "pages" in form_dict:
        for page in form_dict["pages"]:
            if "fields" in page:
                for field in page["fields"]:
                    if field.get("type") == "date":
                        # Remove any existing dateStyle (from LLM if it generated one)
                        if "dateStyle" in field:
                            del field["dateStyle"]
                        # Assign randomly
                        field["dateStyle"] = random.choice(date_styles)
                    elif field.get("type") == "date-range":
                        # Remove any existing rangeStyle (from LLM if it generated one)
                        if "rangeStyle" in field:
                            del field["rangeStyle"]
                        # Assign randomly
                        field["rangeStyle"] = random.choice(range_styles)
    
    return form_dict


def generate_form_page(page_number: int, industry: str, form_id: str, layout: str) -> Dict[str, Any]:
    """
    Generate a single form page using OpenAI GPT-4o.
    
    Args:
        page_number: The page number (1-10)
        industry: The industry/use case for the form
        form_id: The sequential form ID (e.g., "29") - just the number as a string
        layout: The layout style to use (e.g., "two-column", "split-screen")
    
    Returns:
        A dictionary containing the generated form definition
    """
    
    # Get current date information
    today = datetime.now()
    current_date_str = today.strftime("%Y-%m-%d")
    current_day_name = today.strftime("%A")
    current_date_formatted = today.strftime("%B %d, %Y")
    
    # Calculate date range (2 years before and 2 years after)
    two_years_ago = today - timedelta(days=730)  # Approximately 2 years
    two_years_from_now = today + timedelta(days=730)  # Approximately 2 years
    min_date_str = two_years_ago.strftime("%Y-%m-%d")
    max_date_str = two_years_from_now.strftime("%Y-%m-%d")
    
    system_prompt = f"""You are an expert form designer creating realistic, industry-grade forms for testing AI form-filling systems.

CURRENT DATE INFORMATION:
- Today's date: {current_date_str} ({current_day_name}, {current_date_formatted})
- Date range for all generated dates: {min_date_str} to {max_date_str} (2 years before today to 2 years after today)

Your task is to generate a complete form definition. IMPORTANT: Generate the JSON in this exact order:
1. id, title, description, type, layout
2. websiteContext (IF layout is 'website-style' - generate realistic company info, nav, hero, footer)
3. inputToLLM (describe all field values that will be in groundTruth)
4. pages (all pages with all fields)
5. groundTruth (LAST - generate this after you know all field IDs from all pages)

The groundTruth object must contain an entry for EVERY field ID that appears in the pages. 
Format groundTruth values to match React component output:
   - Dates as 'YYYY-MM-DD' strings
   - Date ranges as objects: {{"from": "YYYY-MM-DD", "to": "YYYY-MM-DD"}}
   - Arrays for multi-select fields
   - Booleans for checkboxes/switches
   - Numbers as strings or numbers
   - Phone numbers as 10-digit strings (no formatting)
   - Credit card numbers as strings without spaces
   - CVV as 3-4 digit strings

CRITICAL DATE RULES:
- ALL dates in groundTruth MUST be between {min_date_str} and {max_date_str} (2 years before today to 2 years after today)
- For past dates (e.g., date of birth, past events, historical data): Use dates between {min_date_str} and {current_date_str}
- For future dates (e.g., booking dates, appointment dates, event dates, expiration dates): Use dates between {current_date_str} and {max_date_str}
- For date ranges: Both "from" and "to" dates must be within the allowed range ({min_date_str} to {max_date_str})
- NEVER use dates outside this range (e.g., dates from 2023 when today is 2025, or dates far in the future)
- Base all date generation on today's date: {current_date_str}

Important rules:
- Use realistic field combinations (e.g., don't mix unrelated fields)
- Ensure groundTruth matches the inputToLLM description exactly
- CRITICAL: The inputToLLM field MUST be written in FIRST PERSON mode. Write it as if the person filling the form is describing their own information. Use phrases like "My name is...", "My address is...", "I work at...", "My phone number is...", etc. Do NOT use second person ("Your name is...", "You should enter..."). The inputToLLM should read as if the person is speaking about themselves.
- For date fields, use 'allowed: "before"' for dates in the past (like DOB) and 'allowed: "after"' for future dates
- For multipage forms, distribute fields logically across pages
- Include validation-appropriate fields (phone, email, URL, etc.)
- Make forms industry-realistic (job apps, loan apps, registrations, etc.)
- Generate groundTruth LAST after you have defined all pages and fields
- IMPORTANT: Set the "required" field appropriately for each field. Fields that are essential for the form purpose should be required=true, while optional fields should be required=false. This affects form validation.
- If layout is 'website-style', you MUST generate a rich 'websiteContext' object with realistic branding, navigation, and footer links appropriate for the industry.
- For 'website-style', make the heroTitle and heroSubtitle very engaging and professional.
- CRITICAL: DO NOT generate logoUrl in websiteContext. Always set logoUrl to null or omit it entirely. The UI automatically displays a placeholder logo based on the company name initial.
- CRITICAL: DO NOT use "file" or "color" field types. These are not supported in the UI.
- CRITICAL: For "country" field type, you MUST only use values from the allowed countries list (enforced by schema validation). The schema will reject invalid country names.
- CRITICAL: For "state" field type, you MUST only use values from the 50 US states list (enforced by schema validation). The schema will reject invalid state names or abbreviations.

Generate diverse forms - vary industries, complexity, and field types."""

    user_prompt = f"""Generate a realistic, industry-grade form for: {industry}

CURRENT DATE CONTEXT:
- Today is: {current_date_str} ({current_day_name}, {current_date_formatted})
- All dates in groundTruth MUST be between {min_date_str} and {max_date_str} (2 years before today to 2 years after today)

CRITICAL: Generate the JSON in this exact order:
1. First: id (use exactly "{form_id}"), title, description, type, layout ("{layout}")
2. Second: websiteContext (only if layout is 'website-style')
3. Third: inputToLLM (describe what values will be filled in - this guides groundTruth)
4. Fourth: pages (define ALL pages and ALL fields with their IDs)
5. LAST: groundTruth (after you know all field IDs from pages, create groundTruth with a key for each field ID)

Requirements:
- The form MUST be for: {industry}
- Use the exact form ID: "{form_id}" (do not generate a different ID, just use the number as a string)
- Use the exact layout: "{layout}" (do not generate a different layout)
- It can be single-page or multipage (if multipage, use 2-4 pages)
- Include 5-12 fields per page
- Mix different field types appropriately
- IMPORTANT: Set "required": true for essential fields and "required": false for optional fields. This is critical for form validation.
- CRITICAL: In inputToLLM, write in FIRST PERSON mode. Describe all field values as if the person filling the form is speaking about themselves. Use "My name is...", "My email is...", "I live at...", "My phone number is...", etc. Do NOT use second person ("Your name is...", "You should enter..."). The inputToLLM should read naturally as someone describing their own information, including dates relative to today ({current_date_str})
- In groundTruth, include an entry for EVERY field ID from all pages
- Ensure groundTruth values exactly match what you described in inputToLLM
- DATE REQUIREMENTS FOR groundTruth:
  * ALL dates must be between {min_date_str} and {max_date_str}
  * For past dates (birth dates, past events): Use dates from {min_date_str} to {current_date_str}
  * For future dates (bookings, appointments, events): Use dates from {current_date_str} to {max_date_str}
  * NEVER use dates outside this 4-year range (2 years before to 2 years after today)
  * Format all dates as 'YYYY-MM-DD' strings
- Use proper date formats and restrictions
- CRITICAL: DO NOT generate 'dateStyle' or 'rangeStyle' fields - these are automatically assigned in round-robin fashion after generation
- Make it realistic and useful for testing AI form-filling
- The form should be specific to the {industry} industry/use case
- CRITICAL: DO NOT use "file" or "color" field types. These are not supported in the UI.
- CRITICAL: For "country" field type, only use values from the allowed countries list. The schema validation will enforce this - invalid countries will be rejected.
- CRITICAL: For "state" field type, only use values from the 50 US states list. The schema validation will enforce this - invalid states will be rejected.
- CRITICAL: For "address" field type, you MUST include the 'options' field with all valid addresses from the allowed addresses list. The address field acts as a searchable dropdown. Only use values from the allowed addresses list in both options and groundTruth. The schema validation will enforce this - invalid addresses will be rejected.
- CRITICAL: For "address" field type, you MUST include the 'options' field with all valid addresses from the allowed addresses list. The LLM will see these options in the schema. Only use values from the allowed addresses list. The schema validation will enforce this - invalid addresses will be rejected.

Generate a unique, realistic form for {industry}. Remember: groundTruth must be the LAST property in the JSON, use the exact ID "{form_id}" (as a string), use the exact layout "{layout}", set "required" appropriately for each field, and ensure ALL dates in groundTruth are within the allowed range ({min_date_str} to {max_date_str}). If layout is 'website-style', include detailed websiteContext but DO NOT generate logoUrl - always set it to null or omit it. DO NOT use file or color field types."""

    try:
        # Generate JSON schema from Pydantic model and customize for OpenAI
        json_schema = FormDefinition.model_json_schema()
        
        # OpenAI requires additionalProperties: false at the top level
        json_schema["additionalProperties"] = False
        
        # But we need additionalProperties: true for groundTruth to allow arbitrary field IDs
        if "properties" in json_schema and "groundTruth" in json_schema["properties"]:
            # Ensure groundTruth allows additional properties (arbitrary field IDs)
            ground_truth_schema = json_schema["properties"]["groundTruth"]
            if "type" in ground_truth_schema:
                # If it's already an object type, add additionalProperties
                ground_truth_schema["additionalProperties"] = True
            elif "anyOf" in ground_truth_schema:
                # Handle anyOf case
                for schema_option in ground_truth_schema["anyOf"]:
                    if schema_option.get("type") == "object":
                        schema_option["additionalProperties"] = True
            
            # Add explicit country/state/address lists to groundTruth description
            current_desc = ground_truth_schema.get("description", "")
            ground_truth_schema["description"] = (
                current_desc + 
                " CRITICAL: For country field values, MUST use only: " + ", ".join(VALID_COUNTRIES_LIST) + 
                ". For state field values, MUST use only these 50 US states: " + ", ".join(VALID_STATES_LIST) + 
                ". For address field values, MUST use only: " + ", ".join(VALID_ADDRESSES_LIST) + 
                ". Schema validation will reject invalid values."
            )
        
        # Enhance schema with explicit country/state lists for LLM guidance
        # The LLM reads the schema, so we add the lists directly in descriptions
        if "properties" in json_schema and "pages" in json_schema["properties"]:
            pages_schema = json_schema["properties"]["pages"]
            if "items" in pages_schema and "properties" in pages_schema["items"]:
                fields_schema = pages_schema["items"]["properties"].get("fields", {})
                if "items" in fields_schema and "properties" in fields_schema["items"]:
                    field_props = fields_schema["items"]["properties"]
                    
                    # Enhance options field description with explicit lists
                    if "options" in field_props:
                        current_desc = field_props.get("description", "")
                        # Add explicit lists to description so LLM sees them in schema
                        field_props["description"] = (
                            current_desc + 
                            " CRITICAL: If field type is 'country', options MUST be from this exact list: " + 
                            ", ".join(VALID_COUNTRIES_LIST) + 
                            ". If field type is 'state', options MUST be from these 50 US states: " + 
                            ", ".join(VALID_STATES_LIST) + 
                            ". If field type is 'address', options MUST be from: " + 
                            ", ".join(VALID_ADDRESSES_LIST) + 
                            ". Schema validation will reject invalid values."
                        )
                    
                    # Enhance defaultValue field description
                    if "defaultValue" in field_props:
                        current_desc = field_props.get("description", "")
                        field_props["description"] = (
                            current_desc + 
                            " CRITICAL: If field type is 'country', value MUST be from: " + 
                            ", ".join(VALID_COUNTRIES_LIST) + 
                            ". If field type is 'state', value MUST be from: " + 
                            ", ".join(VALID_STATES_LIST) + 
                            ". If field type is 'address', value MUST be from: " + 
                            ", ".join(VALID_ADDRESSES_LIST) + 
                            ". Schema validation will reject invalid values."
                        )
        
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
                    "schema": json_schema
                }
            },
            temperature=0.8
        )
        
        # Parse the response - OpenAI returns JSON string when using json_schema mode
        response_content = response.choices[0].message.content
        if isinstance(response_content, str):
            parsed_data = json.loads(response_content)
        else:
            parsed_data = response_content
        
        # Validate and parse with Pydantic
        generated_form_model = FormDefinition(**parsed_data)
        
        # Ensure the ID and layout match what we requested
        generated_form_model.id = form_id
        generated_form_model.layout = layout
        
        # Convert to dict for return (maintains backward compatibility)
        generated_form = generated_form_model.model_dump(exclude_none=False)
        
        # Assign dateStyle and rangeStyle randomly (post-processing)
        generated_form = assign_date_styles_random(generated_form, form_id)
        
        print(f"✓ Generated form #{page_number} ({industry}, {layout}): {generated_form_model.title}")
        return generated_form
        
    except Exception as e:
        print(f"✗ Error generating form #{page_number}: {str(e)}")
        raise

def main():
    
    print("Starting form generation with OpenAI GPT-4o...")
    print("=" * 60)
    
    # Load manual config to count existing forms (from public folder)
    manual_config = {}
    manual_config_file = "public/manual_config.json"
    if os.path.exists(manual_config_file):
        try:
            with open(manual_config_file, 'r', encoding='utf-8') as f:
                manual_config = json.load(f)
            print(f"Loaded {len(manual_config)} forms from {manual_config_file}")
        except Exception as e:
            print(f"Warning: Could not load manual config: {e}")
            manual_config = {}
    
    # Load existing LLM config if it exists (from public folder)
    output_file = "public/llm_generated_config.json"
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
    
    # Generate 20 new forms
    generated_forms = {}
    
    for i in range(1, 21):
        form_number = start_id + i - 1
        form_id = str(form_number)  # Use just the number as string
        
        # Skip if already exists
        if form_id in existing_config:
            print(f"⚠ Form {form_id} already exists, skipping...")
            continue
        
        # Round-robin selection based on form number to ensure even distribution
        # even across multiple runs of the script
        industry_index = (form_number - 1) % len(INDUSTRIES)
        industry = INDUSTRIES[industry_index]
        
        # Round-robin selection for layout
        layouts = ["single-column", "two-column", "split-screen", "wizard-style", "website-style"]
        layout_index = (form_number - 1) % len(layouts)
        selected_layout = layouts[layout_index]
        
        try:
            form = generate_form_page(i, industry, form_id, selected_layout)
            generated_forms[form_id] = form
            print(f"  Form ID: {form_id}")
            print(f"  Industry: {industry}")
            print(f"  Layout: {selected_layout}")
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
    
    # Calculate field distribution statistics
    field_type_counts: Dict[str, int] = {}
    date_style_counts: Dict[str, int] = {}
    range_style_counts: Dict[str, int] = {}
    
    for form_id, form_data in all_forms.items():
        if "pages" in form_data:
            for page in form_data["pages"]:
                if "fields" in page:
                    for field in page["fields"]:
                        field_type = field.get("type", "unknown")
                        field_type_counts[field_type] = field_type_counts.get(field_type, 0) + 1
                        
                        # Count date styles
                        if field_type == "date":
                            date_style = field.get("dateStyle", "default")
                            date_style_counts[date_style] = date_style_counts.get(date_style, 0) + 1
                        
                        # Count range styles
                        if field_type == "date-range":
                            range_style = field.get("rangeStyle", "single-calendar")
                            range_style_counts[range_style] = range_style_counts.get(range_style, 0) + 1
    
    # Save to file (directly to public folder)
    output_file = "public/llm_generated_config.json"
    try:
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(all_forms, f, indent=2, ensure_ascii=False)
        
        print("=" * 60)
        print(f"✓ Successfully saved {len(generated_forms)} new forms to {output_file}")
        print(f"  Total forms in file: {len(all_forms)}")
        
        # Print field distribution statistics
        print("=" * 60)
        print("FIELD DISTRIBUTION STATISTICS")
        print("=" * 60)
        print("\nField Type Distribution:")
        for field_type, count in sorted(field_type_counts.items(), key=lambda x: x[1], reverse=True):
            print(f"  {field_type:30s}: {count:4d}")
        
        if date_style_counts:
            print("\nDate Picker Style Distribution:")
            for style, count in sorted(date_style_counts.items(), key=lambda x: x[1], reverse=True):
                print(f"  {style:30s}: {count:4d}")
        
        if range_style_counts:
            print("\nDate Range Picker Style Distribution:")
            for style, count in sorted(range_style_counts.items(), key=lambda x: x[1], reverse=True):
                print(f"  {style:30s}: {count:4d}")
        
        print("=" * 60)
    except Exception as e:
        print(f"✗ Error saving to file: {str(e)}")
        raise

if __name__ == "__main__":
    main()

