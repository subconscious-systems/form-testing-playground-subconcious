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

export interface WebsiteContext {
  companyName: string;
  logoUrl?: string; // Optional URL or initials
  themeColor: string; // Hex code
  navigationItems: Array<{ label: string; href: string; active?: boolean }>;
  heroTitle: string;
  heroSubtitle: string;
  sidebarContent?: {
    title: string;
    content: string;
    links?: Array<{ label: string; href: string }>;
  };
  footerLinks: Array<{ title: string; links: Array<{ label: string; href: string }> }>;
}

export type LayoutType = 'single-column' | 'two-column' | 'split-screen' | 'wizard-style' | 'website-style';

export interface FormDefinition {
  id: string;
  title: string;
  description: string;
  type: 'single-page' | 'multipage';
  pages: FormPage[];
  inputToLLM: string; // Information provided to LLM to fill the form
  groundTruth: Record<string, any>; // Expected values for each field ID
  layout?: LayoutType; // Layout style for the form (defaults to 'single-column' for manual forms)
  websiteContext?: WebsiteContext; // Context for website-style layout
}

export interface FormConfig {
  [formId: string]: FormDefinition; // Object with form IDs as keys
}

