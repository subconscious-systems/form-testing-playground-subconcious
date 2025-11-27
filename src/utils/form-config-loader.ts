import formConfigJson from '../../config_form.json';
import llmGeneratedConfigJson from '../../llm_generated_config.json';
import { FormConfig, FormDefinition } from '@/types/form-config';

let cachedConfig: FormConfig | null = null;
let cachedLlmConfig: FormConfig | null = null;
let useLlmGenerated = false;

export const setUseLlmGenerated = (useLlm: boolean) => {
  useLlmGenerated = useLlm;
  // Clear cache when switching to force reload
  if (useLlm) {
    cachedLlmConfig = null;
  } else {
    cachedConfig = null;
  }
};

export const getUseLlmGenerated = (): boolean => {
  return useLlmGenerated;
};

const loadLlmConfig = async (): Promise<FormConfig> => {
  if (cachedLlmConfig) {
    return cachedLlmConfig;
  }
  
  // Import directly from root (like config_form.json)
  try {
    cachedLlmConfig = (llmGeneratedConfigJson as FormConfig) || {};
    return cachedLlmConfig;
  } catch (error) {
    console.warn('Failed to load LLM generated config:', error);
    cachedLlmConfig = {};
    return cachedLlmConfig;
  }
};

export const loadFormConfig = (): FormConfig => {
  if (useLlmGenerated) {
    // For LLM config, we need to load it synchronously on first call
    // This is a limitation - we'll need to handle async loading in components
    if (cachedLlmConfig) {
      return cachedLlmConfig;
    }
    // Return empty config initially, will be loaded async
    return {};
  } else {
    if (cachedConfig) {
      return cachedConfig;
    }
    cachedConfig = formConfigJson as FormConfig;
    return cachedConfig;
  }
};

export const loadFormConfigAsync = async (): Promise<FormConfig> => {
  if (useLlmGenerated) {
    return await loadLlmConfig();
  } else {
    if (cachedConfig) {
      return cachedConfig;
    }
    cachedConfig = formConfigJson as FormConfig;
    return cachedConfig;
  }
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

