import formConfigJson from '../../config_form.json';
import { FormConfig, FormDefinition } from '@/types/form-config';

let cachedConfig: FormConfig | null = null;

export const loadFormConfig = (): FormConfig => {
  if (cachedConfig) {
    return cachedConfig;
  }
  
  cachedConfig = formConfigJson as FormConfig;
  return cachedConfig;
};

export const getFormById = (formId: string): FormDefinition | undefined => {
  const config = loadFormConfig();
  return config[formId];
};

export const getAllForms = (): FormDefinition[] => {
  const config = loadFormConfig();
  return Object.values(config);
};

