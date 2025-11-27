export interface FormField {
  id: string;
  type: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: string[];
  min?: number;
  max?: number;
  step?: number;
  defaultValue?: number;
  accept?: string;
  maxLength?: number;
  currency?: string;
  maxStars?: number;
  chunkFields?: FormField[];
  allowed?: 'before' | 'after'; // For date fields: 'before' = only past dates, 'after' = only future dates
  [key: string]: any; // Allow additional properties for future extensibility
}

export interface FormPage {
  pageNumber: number;
  fields: FormField[];
}

export interface FormDefinition {
  id: string;
  title: string;
  description: string;
  type: 'single-page' | 'multipage';
  pages: FormPage[];
  inputToLLM: string; // Information provided to LLM to fill the form
  groundTruth: Record<string, any>; // Expected values for each field ID
}

export interface FormConfig {
  [formId: string]: FormDefinition; // Object with form IDs as keys
}

