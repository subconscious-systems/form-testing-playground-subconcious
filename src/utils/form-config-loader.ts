import manualConfigJson from '../../manual_config.json';
import llmGeneratedConfigJson from '../../llm_generated_config.json';
import { FormConfig, FormDefinition } from '@/types/form-config';

let cachedCombinedConfig: FormConfig | null = null;

const loadCombinedConfig = (): FormConfig => {
  if (cachedCombinedConfig) {
    return cachedCombinedConfig;
  }
  
  // Combine manual and LLM generated configs
  const manualConfig = (manualConfigJson as FormConfig) || {};
  const llmConfig = (llmGeneratedConfigJson as FormConfig) || {};
  
  // Merge both configs (LLM forms will overwrite manual forms if same ID, but shouldn't happen)
  cachedCombinedConfig = { ...manualConfig, ...llmConfig };
  return cachedCombinedConfig;
};

export const loadFormConfig = (): FormConfig => {
  return loadCombinedConfig();
};

export const loadFormConfigAsync = async (): Promise<FormConfig> => {
  return loadCombinedConfig();
};

export const getFormById = (formId: string): FormDefinition | undefined => {
  const config = loadFormConfig();
  return config[formId];
};

export const getFormByIdAsync = async (formId: string): Promise<FormDefinition | undefined> => {
  const config = await loadFormConfigAsync();
  return config[formId];
};

export const getAllForms = (): FormDefinition[] => {
  const config = loadFormConfig();
  return Object.values(config);
};

export const getAllFormsAsync = async (): Promise<FormDefinition[]> => {
  const config = await loadFormConfigAsync();
  return Object.values(config);
};


