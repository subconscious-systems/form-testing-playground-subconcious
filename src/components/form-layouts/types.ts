import { FormField } from "@/types/form-config";
import { ReactNode } from "react";

export type LayoutType = 'single-column' | 'two-column' | 'split-screen' | 'wizard-style' | 'website-style';

export interface LayoutProps {
  fields: FormField[];
  renderField: (field: FormField) => ReactNode;
}

