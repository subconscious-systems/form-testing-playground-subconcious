import json
import os
import random
import sys
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional, Literal, Union

from dotenv import load_dotenv
from openai import OpenAI
from pydantic import BaseModel, Field, model_validator

# ============== ENV + CLIENT SETUP ==============

load_dotenv()

api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    raise ValueError("OPENAI_API_KEY not found. Put OPENAI_API_KEY=your-key in .env")

client = OpenAI(api_key=api_key)

# ============== CONSTANTS ==============

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
    "Wholesale seller post form",
]

FieldType = Literal[
    "text",
    "textarea",
    "phone",
    "email",
    "url",
    "checkbox",
    "switch",
    "select",
    "radio",
    "multiselect",
    "searchable-multiselect",
    "date",
    "time",
    "date-range",
    "number",
    "slider",
    "currency",
    "star-rating",
    "home-address",
    "country",
    "state",
    "zip",
    "credit-card",
    "expiration-date",
    "cvv",
    "reactive-chunks",
]

FormType = Literal["single-page", "multipage"]
LayoutType = Literal["single-column", "two-column", "split-screen", "wizard-style", "website-style"]

VALID_COUNTRIES_LIST = [
    "United States",
    "Canada",
    "United Kingdom",
    "Australia",
    "Germany",
    "France",
    "Japan",
    "China",
    "India",
    "Brazil",
    "Mexico",
    "Spain",
    "Italy",
    "South Korea",
    "Netherlands",
    "Sweden",
]

VALID_STATES_LIST = [
    "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware",
    "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas",
    "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi",
    "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico", "New York",
    "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina",
    "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia",
    "Wisconsin", "Wyoming",
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
    "5555 Broadway Avenue, Columbus, OH 43201",
]

# ============== PYDANTIC MODELS ==============


class ChunkField(BaseModel):
    id: str
    type: FieldType
    label: str
    required: bool = True
    placeholder: Optional[str] = None
    options: Optional[List[str]] = None
    min: Optional[float] = None
    max: Optional[float] = None
    step: Optional[float] = None
    defaultValue: Optional[Union[float, str]] = None
    currency: Optional[str] = None
    maxStars: Optional[int] = None
    maxLength: Optional[int] = None
    allowed: Optional[str] = None  # "before" / "after"

    model_config = {"extra": "forbid"}


class FormField(BaseModel):
    id: str
    type: FieldType
    label: str
    required: bool
    placeholder: Optional[str] = None
    options: Optional[List[str]] = None
    min: Optional[float] = None
    max: Optional[float] = None
    step: Optional[float] = None
    defaultValue: Optional[Union[float, str]] = None
    currency: Optional[str] = None
    maxStars: Optional[int] = None
    maxLength: Optional[int] = None
    allowed: Optional[str] = None
    dateStyle: Optional[str] = None   # assigned post-LLM
    rangeStyle: Optional[str] = None  # assigned post-LLM
    chunkFields: Optional[List[ChunkField]] = None

    model_config = {"extra": "forbid"}

    @model_validator(mode="after")
    def validate_country_state_address(self):
        if self.type == "country":
            if self.options:
                invalid = [o for o in self.options if o not in VALID_COUNTRIES_LIST]
                if invalid:
                    raise ValueError(f"Invalid countries in options: {invalid}")
            if isinstance(self.defaultValue, str) and self.defaultValue not in VALID_COUNTRIES_LIST:
                raise ValueError(f"Invalid default country: {self.defaultValue}")

        if self.type == "state":
            if self.options:
                invalid = [o for o in self.options if o not in VALID_STATES_LIST]
                if invalid:
                    raise ValueError(f"Invalid states in options: {invalid}")
            if isinstance(self.defaultValue, str) and self.defaultValue not in VALID_STATES_LIST:
                raise ValueError(f"Invalid default state: {self.defaultValue}")

        if self.type == "home-address":
            if isinstance(self.defaultValue, str) and self.defaultValue not in VALID_ADDRESSES_LIST:
                raise ValueError(f"Invalid home-address default: {self.defaultValue}")

        return self


class Page(BaseModel):
    pageNumber: int
    fields: List[FormField]


class NavigationItem(BaseModel):
    label: str
    href: str
    active: Optional[bool] = None


class SidebarLink(BaseModel):
    label: str
    href: str


class SidebarContent(BaseModel):
    title: str
    content: str
    links: Optional[List[SidebarLink]] = None


class FooterLink(BaseModel):
    label: str
    href: str


class FooterLinkGroup(BaseModel):
    title: str
    links: List[FooterLink]


class WebsiteContext(BaseModel):
    companyName: str
    logoUrl: Optional[str] = Field(
        default=None,
        description="DO NOT generate. Leave null; UI uses placeholder logo."
    )
    themeColor: str
    navigationItems: List[NavigationItem]
    heroTitle: str
    heroSubtitle: str
    sidebarContent: Optional[SidebarContent] = None
    footerLinks: List[FooterLinkGroup]


class FormDefinition(BaseModel):
    id: str
    title: str
    description: str
    type: FormType
    layout: LayoutType
    inputToLLM: str
    pages: List[Page]
    websiteContext: Optional[WebsiteContext] = None
    groundTruth: Dict[str, Any]

    model_config = {"extra": "forbid"}

    @model_validator(mode="after")
    def validate_ground_truth_country_state_address(self):
        field_type_map: Dict[str, FieldType] = {}
        for page in self.pages:
            for field in page.fields:
                field_type_map[field.id] = field.type

        for field_id, value in self.groundTruth.items():
            ftype = field_type_map.get(field_id)
            if ftype == "country":
                if isinstance(value, str):
                    if value not in VALID_COUNTRIES_LIST:
                        raise ValueError(f"Invalid country in groundTruth[{field_id}]: {value}")
                elif isinstance(value, list):
                    invalid = [v for v in value if v not in VALID_COUNTRIES_LIST]
                    if invalid:
                        raise ValueError(f"Invalid countries in groundTruth[{field_id}]: {invalid}")

            if ftype == "state":
                if isinstance(value, str):
                    if value not in VALID_STATES_LIST:
                        raise ValueError(f"Invalid state in groundTruth[{field_id}]: {value}")
                elif isinstance(value, list):
                    invalid = [v for v in value if v not in VALID_STATES_LIST]
                    if invalid:
                        raise ValueError(f"Invalid states in groundTruth[{field_id}]: {invalid}")

            if ftype == "home-address":
                if isinstance(value, str):
                    if value not in VALID_ADDRESSES_LIST:
                        raise ValueError(f"Invalid home-address in groundTruth[{field_id}]: {value}")
                elif isinstance(value, list):
                    invalid = [v for v in value if v not in VALID_ADDRESSES_LIST]
                    if invalid:
                        raise ValueError(f"Invalid home-address values in groundTruth[{field_id}]: {invalid}")

        return self


class FormBatch(BaseModel):
    forms: List[FormDefinition]

    model_config = {"extra": "forbid"}

    @model_validator(mode="after")
    def validate_batch_size(self):
        if len(self.forms) != 5:
            raise ValueError(f"Batch must contain exactly 5 forms, got {len(self.forms)}")
        return self


# ============== FEW-SHOT EXAMPLES (SHORTENED) ==============

FEW_SHOT_EXAMPLES = [
    {
        "id": "example-1",
        "title": "Employee Onboarding Form",
        "description": "New employee registration and information collection",
        "type": "single-page",
        "layout": "single-column",
        "inputToLLM": (
            "I am a new employee filling out an onboarding form. "
            "My name is John Smith, my email is john.smith@company.com, "
            "my phone number is 5551234567, my employee ID is EMP001, "
            "my department is Engineering, my start date is 09-01-2024, "
            "I agree to company policies, and my emergency contact is "
            "Jane Smith with phone number 5559876543."
        ),
        "pages": [
            {
                "pageNumber": 1,
                "fields": [
                    {"id": "fullName", "type": "text", "label": "Full Name", "required": True},
                    {"id": "email", "type": "email", "label": "Email Address", "required": True},
                    {"id": "phone", "type": "phone", "label": "Phone Number", "required": True},
                    {"id": "employeeId", "type": "text", "label": "Employee ID", "required": True},
                    {
                        "id": "department",
                        "type": "select",
                        "label": "Department",
                        "options": ["Engineering", "Sales", "Marketing", "HR", "Finance"],
                        "required": True,
                    },
                    {"id": "startDate", "type": "date", "label": "Start Date", "allowed": "after", "required": True},
                    {
                        "id": "agreeToPolicies",
                        "type": "checkbox",
                        "label": "I agree to company policies",
                        "required": True,
                    },
                    {
                        "id": "emergencyContactName",
                        "type": "text",
                        "label": "Emergency Contact Name",
                        "required": True,
                    },
                    {
                        "id": "emergencyContactPhone",
                        "type": "phone",
                        "label": "Emergency Contact Phone",
                        "required": True,
                    },
                ],
            }
        ],
        "groundTruth": {
            "fullName": "John Smith",
            "email": "john.smith@company.com",
            "phone": "5551234567",
            "employeeId": "EMP001",
            "department": "Engineering",
            "startDate": "09-01-2024",
            "agreeToPolicies": True,
            "emergencyContactName": "Jane Smith",
            "emergencyContactPhone": "5559876543",
        },
    }
]

# ============== HELPERS ==============


def assign_date_styles_round_robin(
    form_dict: Dict[str, Any],
    date_field_counter: int,
    range_field_counter: int,
) -> tuple[Dict[str, Any], int, int]:
    """Assign dateStyle/rangeStyle in round-robin across all forms."""
    date_styles = ["default", "text-input", "dropdown"]
    range_styles = ["single-calendar", "dual-calendar"]

    for page in form_dict.get("pages", []):
        for field in page.get("fields", []):
            if field.get("type") == "date":
                field["dateStyle"] = date_styles[date_field_counter % len(date_styles)]
                date_field_counter += 1
            elif field.get("type") == "date-range":
                field["rangeStyle"] = range_styles[range_field_counter % len(range_styles)]
                range_field_counter += 1

    return form_dict, date_field_counter, range_field_counter


def build_system_prompt(today: datetime, min_date: datetime, max_date: datetime) -> str:
    today_str = today.strftime("%m-%d-%Y")
    min_str = min_date.strftime("%m-%d-%Y")
    max_str = max_date.strftime("%m-%d-%Y")

    return f"""
You are an expert form designer creating realistic, industry-grade forms
for testing AI form-filling systems.

DATE RULES (CRITICAL):
- Today: {today_str}
- All dates in groundTruth MUST be between {min_str} and {max_str} (MM-DD-YYYY).
- Past dates (e.g., birth dates, past events): {min_str} to {today_str}.
- Future dates (e.g., bookings, appointments): {today_str} to {max_str}.
- All single dates in groundTruth MUST use 'MM-DD-YYYY' format.
- Date ranges must be: {{ "from": "MM-DD-YYYY", "to": "MM-DD-YYYY" }}.

ADDRESS RULES (CRITICAL):
- For type="home-address", groundTruth values MUST be EXACTLY one of:
  {", ".join(f'"{a}"' for a in VALID_ADDRESSES_LIST)}
- Do NOT expand abbreviations (keep "St", "Ave", etc. exactly as listed).
- Do NOT invent custom addresses.

FIELD TYPE RULES (CRITICAL):
- Use specific types, never generic text, for structured data:
  * phone       → type="phone" (10-digit string in groundTruth)
  * email       → type="email"
  * website/url → type="url"
  * single date → type="date" (with allowed="before"/"after" when relevant)
  * periods     → type="date-range" (NOT two separate date fields)
  * money       → type="currency"
  * card number → type="credit-card"
  * card expiry → type="expiration-date" (MM/YY)
  * CVV         → type="cvv"
  * country     → type="country" (only from allowed list)
  * US state    → type="state"   (only from allowed list)
  * ZIP         → type="zip"
  * rating      → type="star-rating"
  * long text   → type="textarea"
  * yes/no opt-in or agreements  → type="checkbox"
  * toggles/settings             → type="switch"
  * visual numeric range         → type="slider"
  * physical addresses           → type="home-address"

- type="text" is ONLY allowed for generic strings such as:
  names, job titles, company names, short labels, etc.
- NEVER use type="text" for phone/email/url/date/money/credit-card/zip/country/state/addresses.

COUNTRY/STATE RULES:
- For type="country", options and values MUST be from:
  {", ".join(VALID_COUNTRIES_LIST)}
- For type="state", options and values MUST be from these US states:
  {", ".join(VALID_STATES_LIST)}

INPUT TO LLM:
- inputToLLM MUST be written in FIRST PERSON, as if the person is describing themselves:
  "My name is...", "My email is...", "I live at...", "My phone number is...", etc.
- inputToLLM must be consistent with groundTruth values.

GROUNDTRUTH:
- The groundTruth object must contain a key for EVERY field id in all pages.
- Use:
  * dates: "MM-DD-YYYY"
  * date ranges: {{ "from": "MM-DD-YYYY", "to": "MM-DD-YYYY" }}
  * multi-select: arrays
  * checkbox/switch: booleans
  * money: strings or numbers, using type="currency"
  * credit-card, cvv, phone: strings
"""


def build_user_prompt(
    form_ids: List[str],
    industries: List[str],
    layouts: List[str],
    today: datetime,
    min_date: datetime,
    max_date: datetime,
) -> str:
    today_str = today.strftime("%m-%d-%Y")
    min_str = min_date.strftime("%m-%d-%Y")
    max_str = max_date.strftime("%m-%d-%Y")

    form_specs = []
    for i in range(5):
        form_specs.append(
            f"""FORM {i+1}:
- Form ID: "{form_ids[i]}" (use this exact string)
- Industry: {industries[i]}
- Layout: "{layouts[i]}" (use this exact layout string)
- Make the fields and copy realistic for this industry."""
        )
    form_specs_str = "\n\n".join(form_specs)

    return f"""
Generate EXACTLY 5 complete form definitions.

For EACH of the 5 forms:

1. Use the Pydantic-derived JSON schema you see as the target structure (FormBatch → forms[]).
2. Generate properties in this order:
   - id, title, description, type, layout
   - websiteContext (ONLY if layout == "website-style")
   - inputToLLM
   - pages
   - groundTruth  (MUST be last)

3. Respect these per-form specs:
{form_specs_str}

4. General requirements:
- Forms must be realistic for their industry.
- They may be single-page or multipage (2–4 pages) consistent with type.
- Each page should have ~5–12 fields.
- Use a mix of field types, following the field type rules from the system prompt.
- Set required=true only for essential fields; optional ones required=false.
- For website-style layout, include a rich websiteContext (companyName, themeColor, navigationItems, heroTitle, heroSubtitle, footerLinks, optional sidebarContent).
  * DO NOT set logoUrl (leave null or omit).
- groundTruth must include EVERY field id from all pages.
- Dates must be between {min_str} and {max_str} (MM-DD-YYYY).
  * Past dates (e.g., date of birth, past events) must be ≤ {today_str}.
  * Future dates (e.g., bookings, appointments) must be ≥ {today_str}.
- All date strings MUST be in MM-DD-YYYY format in groundTruth.

5. FIRST PERSON inputToLLM:
- Write inputToLLM as if the form-filler is speaking about themselves and the concrete values,
  matching exactly what you put in groundTruth.

Return ONLY JSON that matches the provided JSON schema.
"""


# ============== LLM CALL ==============


def generate_form_batch(
    form_ids: List[str],
    industries: List[str],
    layouts: List[str],
) -> List[Dict[str, Any]]:
    if len(form_ids) != 5 or len(industries) != 5 or len(layouts) != 5:
        raise ValueError("generate_form_batch expects exactly 5 form_ids, industries, and layouts")

    today = datetime.now()
    min_date = today - timedelta(days=730)
    max_date = today + timedelta(days=730)

    system_prompt = build_system_prompt(today, min_date, max_date)
    user_prompt = build_user_prompt(form_ids, industries, layouts, today, min_date, max_date)

    schema = FormBatch.model_json_schema()
    schema["additionalProperties"] = False  # batch object itself

    response = client.beta.chat.completions.parse(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": system_prompt},
            {
                "role": "user",
                "content": "Here is an example of a well-structured form batch:\n\n"
                + json.dumps({"forms": FEW_SHOT_EXAMPLES}, indent=2),
            },
            {"role": "user", "content": user_prompt},
        ],
        response_format={
            "type": "json_schema",
            "json_schema": {"name": "form_batch", "strict": False, "schema": schema},
        },
        temperature=0.7,
    )

    content = response.choices[0].message.content
    if isinstance(content, str):
        parsed = json.loads(content)
    else:
        parsed = content

    batch = FormBatch(**parsed)

    # Force IDs/layouts to match requested ones in order
    results = []
    for i, form in enumerate(batch.forms):
        form.id = form_ids[i]
        form.layout = layouts[i]
        results.append(form.model_dump(exclude_none=False))

    return results


# ============== MAIN SCRIPT ==============


def main():
    # CLI: python generate_pages.py [num_batches]
    num_batches = 1
    if len(sys.argv) > 1:
        try:
            num_batches = int(sys.argv[1])
            if num_batches < 1:
                raise ValueError
        except ValueError:
            print("Usage: python generate_pages.py [num_batches]")
            sys.exit(1)

    total_forms = num_batches * 5
    print("=" * 60)
    print(f"GENERATING {total_forms} NEW FORMS ({num_batches} batches × 5 forms)")
    print("=" * 60)

    manual_config_file = "public/manual_config.json"
    llm_output_file = "public/llm_generated_config.json"

    manual_config: Dict[str, Any] = {}
    if os.path.exists(manual_config_file):
        try:
            with open(manual_config_file, "r", encoding="utf-8") as f:
                manual_config = json.load(f)
            print(f"Loaded {len(manual_config)} manual forms from {manual_config_file}")
        except Exception as e:
            print(f"Warning: Could not load manual_config: {e}")

    existing_llm: Dict[str, Any] = {}
    if os.path.exists(llm_output_file):
        try:
            with open(llm_output_file, "r", encoding="utf-8") as f:
                existing_llm = json.load(f)
            print(f"Loaded {len(existing_llm)} LLM forms from {llm_output_file}")
        except Exception as e:
            print(f"Warning: Could not load existing LLM config: {e}")

    manual_count = len(manual_config)
    existing_llm_count = len(existing_llm)
    start_id = manual_count + existing_llm_count + 1

    layouts_cycle = ["single-column", "two-column", "split-screen", "wizard-style", "website-style"]

    generated_forms: Dict[str, Any] = {}
    date_field_counter = 0
    range_field_counter = 0

    for batch_idx in range(num_batches):
        print("\n" + "=" * 60)
        print(f"BATCH {batch_idx + 1}/{num_batches}")
        print("=" * 60)

        # Batch planning
        batch_form_ids: List[str] = []
        batch_industries: List[str] = []
        batch_layouts: List[str] = []

        # Seed per batch so industry shuffle is reproducible
        random.seed(start_id + batch_idx)
        shuffled_industries = INDUSTRIES.copy()
        random.shuffle(shuffled_industries)

        for i in range(5):
            form_number = start_id + batch_idx * 5 + i
            form_id = str(form_number)
            if form_id in existing_llm:
                print(f"⚠ Form {form_id} already exists in {llm_output_file}, skipping...")
                continue

            industry = shuffled_industries[i % len(shuffled_industries)]
            layout = layouts_cycle[(form_number - 1) % len(layouts_cycle)]

            batch_form_ids.append(form_id)
            batch_industries.append(industry)
            batch_layouts.append(layout)

        if not batch_form_ids:
            print("No new forms needed in this batch.")
            continue

        print(f"Generating forms: {', '.join(batch_form_ids)}")
        print(f"Industries : {', '.join(batch_industries)}")

        try:
            batch_forms = generate_form_batch(batch_form_ids, batch_industries, batch_layouts)
        except Exception as e:
            print(f"✗ Failed to generate batch {batch_idx + 1}: {e}")
            continue

        for i, form in enumerate(batch_forms):
            form_id = batch_form_ids[i]
            form, date_field_counter, range_field_counter = assign_date_styles_round_robin(
                form, date_field_counter, range_field_counter
            )
            generated_forms[form_id] = form

            print(f"\n  Form ID: {form_id}")
            print(f"    Industry: {batch_industries[i]}")
            print(f"    Layout:   {batch_layouts[i]}")
            print(f"    Title:    {form.get('title', 'N/A')}")
            print(f"    Type:     {form.get('type', 'N/A')}")
            print(f"    Pages:    {len(form.get('pages', []))}")

        # Save after each batch
        all_forms_so_far = {**existing_llm, **generated_forms}
        try:
            os.makedirs(os.path.dirname(llm_output_file), exist_ok=True)
            with open(llm_output_file, "w", encoding="utf-8") as f:
                json.dump(all_forms_so_far, f, indent=2, ensure_ascii=False)
            print(f"\n  ✓ Saved {len(batch_forms)} forms to {llm_output_file}")
            print(f"  Total forms in file now: {len(all_forms_so_far)}")
        except Exception as e:
            print(f"  ✗ Error saving forms: {e}")

    # Final stats
    all_forms = {**existing_llm, **generated_forms}
    print("\n" + "=" * 60)
    print("✓ Generation complete")
    print(f"  New forms generated: {len(generated_forms)}")
    print(f"  Total forms in file: {len(all_forms)}")

    field_type_counts: Dict[str, int] = {}
    date_style_counts: Dict[str, int] = {}
    range_style_counts: Dict[str, int] = {}

    for form in all_forms.values():
        for page in form.get("pages", []):
            for field in page.get("fields", []):
                ftype = field.get("type", "unknown")
                field_type_counts[ftype] = field_type_counts.get(ftype, 0) + 1
                if ftype == "date":
                    style = field.get("dateStyle", "default")
                    date_style_counts[style] = date_style_counts.get(style, 0) + 1
                if ftype == "date-range":
                    style = field.get("rangeStyle", "single-calendar")
                    range_style_counts[style] = range_style_counts.get(style, 0) + 1

    print("\nFIELD TYPE DISTRIBUTION")
    print("-" * 60)
    for ftype, count in sorted(field_type_counts.items(), key=lambda x: x[1], reverse=True):
        print(f"  {ftype:20s}: {count:4d}")

    if date_style_counts:
        print("\nDATE PICKER STYLE DISTRIBUTION")
        print("-" * 60)
        for style, count in date_style_counts.items():
            print(f"  {style:20s}: {count:4d}")

    if range_style_counts:
        print("\nDATE RANGE PICKER STYLE DISTRIBUTION")
        print("-" * 60)
        for style, count in range_style_counts.items():
            print(f"  {style:20s}: {count:4d}")

    print("\nUsage: python generate_pages.py [num_batches]")
    print("Example: python generate_pages.py 4   # generates 20 forms (4×5)")
    print("=" * 60)


if __name__ == "__main__":
    main()
