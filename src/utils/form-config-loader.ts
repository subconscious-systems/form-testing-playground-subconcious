import { FormConfig, FormDefinition } from '@/types/form-config';

let cachedCombinedConfig: FormConfig | null = null;
let llmConfigCache: FormConfig | null = null;
let manualConfigCache: FormConfig | null = null;

// Function to load config dynamically via fetch (allows reloading without rebuild)
const loadConfigFile = async (filename: string, forceReload: boolean = false): Promise<FormConfig> => {
  try {
    // Fetch the JSON file with cache busting if forcing reload
    const url = `/${filename}` + (forceReload ? `?t=${Date.now()}` : '');
    const response = await fetch(url);
    
    if (!response.ok) {
      // If file doesn't exist (404), return empty config
      if (response.status === 404) {
        console.warn(`${filename} not found, using empty config.`);
        return {};
      }
      throw new Error(`Failed to load ${filename}: ${response.status} ${response.statusText}`);
    }
    
    const importedConfig = await response.json();
    
    // Validate it's a valid object (can be empty {})
    if (importedConfig && 
        typeof importedConfig === 'object' && 
        !Array.isArray(importedConfig)) {
      // Only use if it has content (not empty object)
      if (Object.keys(importedConfig).length > 0) {
        return importedConfig as FormConfig;
      }
    }
    return {};
  } catch (error) {
    // If fetch fails (network error, invalid JSON, etc.), use empty object
    console.warn(`Could not load ${filename}, using empty config.`, error);
    return {};
  }
};

// Function to load LLM config dynamically via fetch
const loadLLMConfig = async (forceReload: boolean = false): Promise<FormConfig> => {
  // Return cached version if not forcing reload
  if (llmConfigCache && !forceReload) {
    return llmConfigCache;
  }

  llmConfigCache = await loadConfigFile('llm_generated_config.json', forceReload);
  return llmConfigCache;
};

// Function to load manual config dynamically via fetch
const loadManualConfig = async (forceReload: boolean = false): Promise<FormConfig> => {
  // Return cached version if not forcing reload
  if (manualConfigCache && !forceReload) {
    return manualConfigCache;
  }

  manualConfigCache = await loadConfigFile('manual_config.json', forceReload);
  return manualConfigCache;
};

const loadCombinedConfig = async (forceReload: boolean = false): Promise<FormConfig> => {
  // If cache exists and not forcing reload, return cached config
  if (cachedCombinedConfig && !forceReload) {
    return cachedCombinedConfig;
  }

  // Load both configs (will fetch from server if forcing reload)
  const [llmGeneratedConfigJson, manualConfig] = await Promise.all([
    loadLLMConfig(forceReload),
    loadManualConfig(forceReload)
  ]);

  // Merge both configs (LLM forms will overwrite manual forms if same ID, but shouldn't happen)
  // Manual config takes precedence if there are duplicate IDs
  cachedCombinedConfig = { ...llmGeneratedConfigJson, ...manualConfig };
  return cachedCombinedConfig;
};

// Export function to clear cache and force reload
export const clearFormConfigCache = (): void => {
  cachedCombinedConfig = null;
  llmConfigCache = null;
  manualConfigCache = null;
};

export const loadFormConfig = async (forceReload: boolean = false): Promise<FormConfig> => {
  return loadCombinedConfig(forceReload);
};

export const loadFormConfigAsync = async (forceReload: boolean = false): Promise<FormConfig> => {
  return loadCombinedConfig(forceReload);
};

export const getFormById = async (formId: string, forceReload: boolean = false): Promise<FormDefinition | undefined> => {
  const config = await loadFormConfig(forceReload);
  return config[formId];
};

export const getFormByIdAsync = async (formId: string, forceReload: boolean = false): Promise<FormDefinition | undefined> => {
  const config = await loadFormConfigAsync(forceReload);
  return config[formId];
};

export const getAllForms = async (forceReload: boolean = false): Promise<FormDefinition[]> => {
  const config = await loadFormConfig(forceReload);
  return Object.values(config);
};

export const getAllFormsAsync = async (forceReload: boolean = false): Promise<FormDefinition[]> => {
  const config = await loadFormConfigAsync(forceReload);
  return Object.values(config);
};


