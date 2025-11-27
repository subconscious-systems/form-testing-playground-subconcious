export interface FormConfig {
  id: string;
  title: string;
  description: string;
  complexity: 'simple' | 'complex' | 'multipage';
  pages?: number;
}

export const forms: FormConfig[] = [
  // Simple forms (1-3)
  {
    id: 'simple-1',
    title: 'Newsletter Signup',
    description: 'Single email input field',
    complexity: 'simple',
  },
  {
    id: 'simple-2',
    title: 'Feedback Form',
    description: 'Single text area input',
    complexity: 'simple',
  },
  {
    id: 'simple-3',
    title: 'Search Query',
    description: 'Single search input field',
    complexity: 'simple',
  },
  // Complex forms (4-6)
  {
    id: 'complex-1',
    title: 'Contact Information',
    description: 'Name, email, date, and file upload',
    complexity: 'complex',
  },
  {
    id: 'complex-2',
    title: 'Event Registration',
    description: 'Multiple fields with date picker and file attachment',
    complexity: 'complex',
  },
  {
    id: 'complex-3',
    title: 'Product Review',
    description: 'Rating, text, date, and image upload',
    complexity: 'complex',
  },
  // Multipage forms (7-10)
  {
    id: 'multipage-1',
    title: 'Job Application',
    description: '3-page application with personal info, experience, and documents',
    complexity: 'multipage',
    pages: 3,
  },
  {
    id: 'multipage-2',
    title: 'Grant Application',
    description: '4-page detailed grant proposal form',
    complexity: 'multipage',
    pages: 4,
  },
  {
    id: 'multipage-3',
    title: 'Scholarship Application',
    description: '3-page scholarship application with essays',
    complexity: 'multipage',
    pages: 3,
  },
  {
    id: 'multipage-4',
    title: 'Hotel Booking',
    description: '2-page booking form with preferences and payment',
    complexity: 'multipage',
    pages: 2,
  },
];
