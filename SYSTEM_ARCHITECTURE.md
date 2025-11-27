# Form Playground System Architecture

## Overview
This is a configuration-driven form system where forms are defined in JSON/YAML and rendered dynamically in React. The system supports 28+ input types, validation, multipage forms, and state management.

## Key Components

### 1. Configuration File: `config_form.json`
- Location: Root directory
- Structure: Array of form definitions
- Each form has: id, title, description, type, pages
- Each page has: pageNumber, fields array
- Each field has: id, type, label, and type-specific parameters

### 2. Form Context: `src/contexts/FormContext.tsx`
- Manages form state across pages
- Stores data by formId and pageNumber
- Provides: updateField, getPageData, getAllFormData, submitForm
- Persists data during navigation

### 3. Dynamic Form Renderer: `src/components/DynamicForm.tsx`
- Reads form configuration
- Renders appropriate field components
- Handles validation and submission
- Manages navigation between pages

### 4. Field Components: `src/components/form-fields/`
- Individual React components for each input type
- Modular and reusable
- Each component handles its own validation
- All use BaseField wrapper for consistent styling

### 5. Form State Hook: `src/hooks/useFormState.ts`
- Wraps FormContext
- Provides simple API: pageData, updateFieldValue, getAllData, handleSubmit

## Data Flow

1. **Form Definition** → `config_form.json` defines form structure
2. **Form Loading** → `form-config-loader.ts` loads and caches config
3. **Form Rendering** → `DynamicForm` reads config and renders fields
4. **State Management** → `FormContext` stores all form data
5. **Field Updates** → User input → updateField → Context updated
6. **Page Navigation** → Data persists in context, new page loads existing data
7. **Form Submission** → Last page → getAllFormData → Console log + clear context

## State Persistence

- **During Session**: FormContext (React Context API)
- **Across Pages**: Data stored by formId and pageNumber
- **On Submit**: All pages' data collected and logged
- **After Submit**: Context cleared, user redirected

## Validation System

### Real-time Validation
- Each field component validates on change
- Errors displayed below field
- Red border on invalid fields

### Form-level Validation
- On "Next" button: Validates current page
- On "Submit" button: Validates current page + collects all data
- Missing required fields show toast error

### Automatic Validations
- Phone: 10 digits only
- Email: Format validation
- URL: Format validation
- Zip: 5 digits only
- CVV: 3 or 4 digits
- Credit Card: 15 or 16 digits
- Date restrictions: Based on `allowed` parameter

## Form Types

### Single-Page Forms
- `type: "single-page"`
- One page only
- Immediate submission
- Data logged on submit

### Multipage Forms
- `type: "multipage"`
- 2+ pages
- Data persists across navigation
- "Next" button on intermediate pages
- "Submit" button on last page
- All pages' data collected on final submit

## Adding New Forms

1. Add form definition to `config_form.json`
2. Form automatically appears on home page
3. No code changes needed
4. System renders dynamically based on config

## Console Output Format

**Single-Page:**
```
=== FORM SUBMISSION ===
Form ID: form-id
Form Type: Single Page
Complete Form Data: { field1: value1, field2: value2 }
======================
```

**Multipage:**
```
=== FORM SUBMISSION ===
Form ID: form-id
Form Type: Multipage
Total Pages: 3
Complete Form Data: { all fields from all pages }
======================
```

