# OpenAI Form Generation Prompt

Use this prompt to generate forms that match our form configuration system. Copy and paste this entire prompt, then add your specific form requirements at the end.

---

## System Overview

You are generating form configurations for a React-based form playground system. Forms are defined in JSON format and rendered dynamically. The system supports both single-page and multipage forms with comprehensive validation and field types.

## JSON Structure

The form configuration follows this exact structure:

```json
{
  "forms": [
    {
      "id": "unique-form-id",
      "title": "Form Title",
      "description": "Brief description of the form",
      "type": "single-page" | "multipage",
      "pages": [
        {
          "pageNumber": 1,
          "fields": [
            {
              "id": "field-id",
              "type": "field-type",
              "label": "Field Label",
              "placeholder": "Optional placeholder text",
              "required": true | false,
              // ... additional type-specific parameters
            }
          ]
        }
      ]
    }
  ]
}
```

## Available Field Types & Parameters

### 1. **text**
Basic text input field.
```json
{
  "id": "field-id",
  "type": "text",
  "label": "Field Label",
  "placeholder": "Optional placeholder",
  "required": true
}
```

### 2. **textarea**
Multi-line text area input.
```json
{
  "id": "field-id",
  "type": "textarea",
  "label": "Field Label",
  "placeholder": "Optional placeholder",
  "required": true
}
```

### 3. **phone**
Phone number input (exactly 10 digits, no text allowed).
```json
{
  "id": "field-id",
  "type": "phone",
  "label": "Phone Number",
  "placeholder": "(555) 123-4567",
  "required": true
}
```
**Validation**: Automatically enforces exactly 10 digits, strips non-numeric characters.

### 4. **email**
Email input with format validation.
```json
{
  "id": "field-id",
  "type": "email",
  "label": "Email Address",
  "placeholder": "you@example.com",
  "required": true
}
```
**Validation**: Validates proper email format (user@domain.com).

### 5. **url**
URL input with format validation.
```json
{
  "id": "field-id",
  "type": "url",
  "label": "Website URL",
  "placeholder": "https://example.com",
  "required": true
}
```
**Validation**: Validates proper URL format.

### 6. **file**
File upload input.
```json
{
  "id": "field-id",
  "type": "file",
  "label": "Upload File",
  "accept": ".pdf,.jpg,.jpeg,.png" | "*/*",
  "required": true
}
```
**Parameters**:
- `accept`: File types to accept (e.g., ".pdf", ".pdf,.jpg,.jpeg", "*/*")

### 7. **checkbox**
Confirmation checkbox.
```json
{
  "id": "field-id",
  "type": "checkbox",
  "label": "I agree to the terms and conditions",
  "required": true
}
```
**Note**: The label text appears next to the checkbox.

### 8. **switch**
Toggle switch input.
```json
{
  "id": "field-id",
  "type": "switch",
  "label": "Enable notifications",
  "required": false
}
```

### 9. **select**
Single selection dropdown.
```json
{
  "id": "field-id",
  "type": "select",
  "label": "Select an option",
  "options": ["Option 1", "Option 2", "Option 3"],
  "required": true
}
```
**Parameters**:
- `options`: Array of strings for dropdown options

### 10. **radio**
Radio button group selection.
```json
{
  "id": "field-id",
  "type": "radio",
  "label": "Choose an option",
  "options": ["Option A", "Option B", "Option C"],
  "required": true
}
```
**Parameters**:
- `options`: Array of strings for radio button options

### 11. **multiselect**
Multiple selection dropdown (non-searchable).
```json
{
  "id": "field-id",
  "type": "multiselect",
  "label": "Select multiple options",
  "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
  "required": true
}
```
**Parameters**:
- `options`: Array of strings for selectable options
**Behavior**: Selected items appear as removable chips above the dropdown.

### 12. **searchable-multiselect**
Searchable multiple selection dropdown.
```json
{
  "id": "field-id",
  "type": "searchable-multiselect",
  "label": "Search and select multiple options",
  "options": ["Apple", "Banana", "Cherry", "Date", "Elderberry"],
  "required": true
}
```
**Parameters**:
- `options`: Array of strings for searchable options
**Behavior**: 
- Search box filters options as you type
- Selected items appear as removable chips above
- Search box clears automatically when an option is selected

### 13. **date**
Date picker with calendar.
```json
{
  "id": "field-id",
  "type": "date",
  "label": "Select Date",
  "allowed": "before" | "after" | undefined,
  "required": true
}
```
**Parameters**:
- `allowed`: 
  - `"before"`: Only allows past dates (e.g., Date of Birth)
  - `"after"`: Only allows future dates (e.g., Start Date, Expiration Date)
  - `undefined`: Allows all dates

### 14. **time**
Time picker input.
```json
{
  "id": "field-id",
  "type": "time",
  "label": "Select Time",
  "required": true
}
```

### 15. **date-range**
Date range selection (from/to dates).
```json
{
  "id": "field-id",
  "type": "date-range",
  "label": "Select Date Range",
  "required": true
}
```
**Behavior**: 
- Click first date to set "from"
- Click second date to set "to"
- Shows range as "Date1 - Date2" when complete
- Today's date is NOT auto-selected

### 16. **number**
Numeric input field.
```json
{
  "id": "field-id",
  "type": "number",
  "label": "Enter a number",
  "placeholder": "0",
  "min": 0,
  "max": 100,
  "step": 1,
  "required": true
}
```
**Parameters**:
- `min`: Minimum value
- `max`: Maximum value
- `step`: Increment step (e.g., 0.01 for decimals, 1 for integers)

### 17. **slider**
Range slider input.
```json
{
  "id": "field-id",
  "type": "slider",
  "label": "Select value",
  "min": 0,
  "max": 100,
  "step": 1,
  "defaultValue": 50,
  "required": true
}
```
**Parameters**:
- `min`: Minimum slider value
- `max`: Maximum slider value
- `step`: Increment step
- `defaultValue`: Initial value

### 18. **color**
Color picker input.
```json
{
  "id": "field-id",
  "type": "color",
  "label": "Choose a color",
  "required": true
}
```

### 19. **currency**
Currency amount input with symbol prefix.
```json
{
  "id": "field-id",
  "type": "currency",
  "label": "Enter amount",
  "placeholder": "0.00",
  "currency": "USD",
  "required": true
}
```
**Parameters**:
- `currency`: Currency symbol (default: "$")
**Note**: Currency symbol appears on the left, properly spaced from input.

### 20. **star-rating**
Star rating input (clickable stars).
```json
{
  "id": "field-id",
  "type": "star-rating",
  "label": "Rate this",
  "maxStars": 5,
  "required": true
}
```
**Parameters**:
- `maxStars`: Number of stars (default: 5)

### 21. **address**
Address autocomplete input.
```json
{
  "id": "field-id",
  "type": "address",
  "label": "Enter address",
  "placeholder": "Start typing address...",
  "required": true
}
```

### 22. **country**
Country selection dropdown.
```json
{
  "id": "field-id",
  "type": "country",
  "label": "Select Country",
  "required": true
}
```
**Note**: Pre-populated with common countries.

### 23. **state**
State/Province selection dropdown.
```json
{
  "id": "field-id",
  "type": "state",
  "label": "Select State/Province",
  "required": true
}
```
**Note**: Pre-populated with US states.

### 24. **zip**
ZIP/Postal code input (exactly 5 digits).
```json
{
  "id": "field-id",
  "type": "zip",
  "label": "Zip/Postal Code",
  "placeholder": "12345",
  "required": true
}
```
**Validation**: Automatically enforces exactly 5 digits, strips non-numeric characters.

### 25. **credit-card**
Credit card number input (15 or 16 digits).
```json
{
  "id": "field-id",
  "type": "credit-card",
  "label": "Credit Card Number",
  "placeholder": "1234 5678 9012 3456",
  "required": true
}
```
**Validation**: 
- Automatically formats with spaces every 4 digits
- Validates 15 or 16 digits
- Shows error if invalid length

### 26. **expiration-date**
Credit card expiration date (MM/YY format).
```json
{
  "id": "field-id",
  "type": "expiration-date",
  "label": "Expiration Date",
  "placeholder": "MM/YY",
  "required": true
}
```
**Validation**: Automatically formats as MM/YY.

### 27. **cvv**
Credit card CVV code (3 or 4 digits).
```json
{
  "id": "field-id",
  "type": "cvv",
  "label": "CVV",
  "placeholder": "123",
  "maxLength": 4,
  "required": true
}
```
**Validation**: 
- Only allows digits
- Validates 3 or 4 digits
- Shows graceful error messages

### 28. **reactive-chunks**
Dynamic repeating sections (e.g., work experience, education).
```json
{
  "id": "field-id",
  "type": "reactive-chunks",
  "label": "Work Experience",
  "chunkFields": [
    {
      "id": "title",
      "type": "text",
      "label": "Job Title",
      "required": true
    },
    {
      "id": "description",
      "type": "textarea",
      "label": "Description",
      "required": true
    },
    {
      "id": "date",
      "type": "date",
      "label": "Date",
      "allowed": "before",
      "required": true
    }
  ],
  "required": true
}
```
**Parameters**:
- `chunkFields`: Array of field definitions for each chunk entry
**Supported chunkField types**: `text`, `textarea`, `date`, `number`, `currency`, `select`, `email`, `phone`
**Behavior**: 
- Users can click "+" to add new entries
- Each entry can be removed with X button
- All chunk fields are rendered for each entry

## Form Structure Rules

### Single-Page Forms
- Set `"type": "single-page"`
- Must have exactly 1 page with `"pageNumber": 1`
- All fields on one page

### Multipage Forms
- Set `"type": "multipage"`
- Must have 2+ pages
- Pages must be numbered sequentially starting from 1
- Each page should have logical grouping of related fields
- Last page typically contains submission/terms

## Field ID Naming Conventions

- Use camelCase: `firstName`, `emailAddress`, `dateOfBirth`
- Be descriptive: `currentEmployer` not `emp1`
- Use consistent naming: `startDate` and `endDate` (not `date1` and `date2`)
- For reactive chunks, use descriptive IDs: `workExperience`, `education`, `references`

## Validation Rules (Automatic)

The following validations are automatically applied:

1. **Phone**: Exactly 10 digits, no text
2. **Email**: Proper email format (user@domain.com)
3. **URL**: Valid URL format
4. **Zip**: Exactly 5 digits
5. **CVV**: 3 or 4 digits only
6. **Credit Card**: 15 or 16 digits only
7. **Required fields**: Must be filled before submission
8. **Date restrictions**: Enforced based on `allowed` parameter

## Best Practices

1. **Logical Grouping**: Group related fields together on the same page
2. **Progressive Disclosure**: Put basic info first, detailed info later
3. **Required Fields**: Mark essential fields as `required: true`
4. **Helpful Placeholders**: Provide clear, example-based placeholders
5. **Descriptive Labels**: Use clear, user-friendly labels
6. **Reactive Chunks**: Use for repeating data (work history, education, references)
7. **Date Restrictions**: 
   - Use `"allowed": "before"` for DOB, graduation dates, past events
   - Use `"allowed": "after"` for start dates, expiration dates, future events
8. **File Uploads**: Specify `accept` parameter for file type restrictions
9. **Multi-select**: Use `searchable-multiselect` for long option lists (>10 items)
10. **Currency**: Always specify `currency` parameter (defaults to "$")

## Example: Complete Form

```json
{
  "id": "job-application-example",
  "title": "Software Engineer Application",
  "description": "Application form for software engineer position",
  "type": "multipage",
  "pages": [
    {
      "pageNumber": 1,
      "fields": [
        {
          "id": "firstName",
          "type": "text",
          "label": "First Name",
          "placeholder": "Enter your first name",
          "required": true
        },
        {
          "id": "lastName",
          "type": "text",
          "label": "Last Name",
          "placeholder": "Enter your last name",
          "required": true
        },
        {
          "id": "email",
          "type": "email",
          "label": "Email Address",
          "placeholder": "you@example.com",
          "required": true
        },
        {
          "id": "phone",
          "type": "phone",
          "label": "Phone Number",
          "placeholder": "(555) 123-4567",
          "required": true
        },
        {
          "id": "dateOfBirth",
          "type": "date",
          "label": "Date of Birth",
          "allowed": "before",
          "required": true
        }
      ]
    },
    {
      "pageNumber": 2,
      "fields": [
        {
          "id": "yearsExperience",
          "type": "number",
          "label": "Years of Experience",
          "min": 0,
          "max": 50,
          "required": true
        },
        {
          "id": "programmingLanguages",
          "type": "searchable-multiselect",
          "label": "Programming Languages",
          "options": ["Python", "JavaScript", "Java", "C++", "Go", "Rust"],
          "required": true
        },
        {
          "id": "workExperience",
          "type": "reactive-chunks",
          "label": "Work Experience",
          "chunkFields": [
            {
              "id": "title",
              "type": "text",
              "label": "Job Title",
              "required": true
            },
            {
              "id": "company",
              "type": "text",
              "label": "Company",
              "required": true
            },
            {
              "id": "startDate",
              "type": "date",
              "label": "Start Date",
              "allowed": "before",
              "required": true
            },
            {
              "id": "description",
              "type": "textarea",
              "label": "Description",
              "required": true
            }
          ],
          "required": true
        }
      ]
    },
    {
      "pageNumber": 3,
      "fields": [
        {
          "id": "resume",
          "type": "file",
          "label": "Upload Resume",
          "accept": ".pdf",
          "required": true
        },
        {
          "id": "coverLetter",
          "type": "textarea",
          "label": "Cover Letter",
          "placeholder": "Tell us why you're interested...",
          "required": true
        },
        {
          "id": "terms",
          "type": "checkbox",
          "label": "I agree to the terms and conditions",
          "required": true
        }
      ]
    }
  ]
}
```

## Output Format

When generating a form, output ONLY the form object (not the entire "forms" array). The form will be added to the existing forms array in config_form.json.

Output format:
```json
{
  "id": "unique-form-id",
  "title": "Form Title",
  "description": "Form description",
  "type": "single-page" | "multipage",
  "pages": [...]
}
```

## Important Notes

1. **ID Uniqueness**: Each form must have a unique `id` (kebab-case recommended: `job-application`, `grant-request`)
2. **Page Numbers**: Must be sequential starting from 1 (1, 2, 3, ...)
3. **Field IDs**: Must be unique within a form (can repeat across different forms)
4. **Required Fields**: Use `"required": true` for mandatory fields, `"required": false` or omit for optional
5. **Date Restrictions**: Always specify `allowed` for date fields when appropriate
6. **File Types**: Use specific `accept` values (e.g., ".pdf", ".pdf,.jpg,.jpeg")
7. **Options Arrays**: For select/radio/multiselect, always provide an array of strings
8. **Reactive Chunks**: Only use supported types in `chunkFields` (text, textarea, date, number, currency, select, email, phone)

---

## Your Task

Generate a form configuration JSON for: [DESCRIBE YOUR FORM HERE]

Requirements:
- Form purpose: [Describe what the form is for]
- Target audience: [Who will fill this form]
- Key information needed: [List main data points]
- Number of pages: [Single-page or multipage, how many pages]
- Special requirements: [Any specific validations, field types, or constraints]

Generate the complete form configuration following all the rules and examples above.

