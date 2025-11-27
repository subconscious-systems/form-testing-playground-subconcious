import { createContext, useContext, useState, ReactNode } from "react";

interface FormData {
  [fieldId: string]: any;
}

interface FormState {
  [formId: string]: {
    [pageNumber: number]: FormData;
  };
}

interface FormContextType {
  formState: FormState;
  updateField: (formId: string, pageNumber: number, fieldId: string, value: any) => void;
  updatePageData: (formId: string, pageNumber: number, data: FormData) => void;
  getPageData: (formId: string, pageNumber: number) => FormData;
  getAllFormData: (formId: string) => Record<string, any>;
  clearFormData: (formId: string) => void;
  submitForm: (formId: string) => Record<string, any>;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

export const FormProvider = ({ children }: { children: ReactNode }) => {
  const [formState, setFormState] = useState<FormState>({});

  const updateField = (formId: string, pageNumber: number, fieldId: string, value: any) => {
    setFormState((prev) => ({
      ...prev,
      [formId]: {
        ...prev[formId],
        [pageNumber]: {
          ...prev[formId]?.[pageNumber],
          [fieldId]: value,
        },
      },
    }));
  };

  const updatePageData = (formId: string, pageNumber: number, data: FormData) => {
    setFormState((prev) => ({
      ...prev,
      [formId]: {
        ...prev[formId],
        [pageNumber]: data,
      },
    }));
  };

  const getPageData = (formId: string, pageNumber: number): FormData => {
    return formState[formId]?.[pageNumber] || {};
  };

  const getAllFormData = (formId: string): Record<string, any> => {
    const formPages = formState[formId];
    if (!formPages) return {};

    // Flatten all pages into a single object
    const allData: Record<string, any> = {};
    Object.keys(formPages).forEach((pageNum) => {
      const pageData = formPages[parseInt(pageNum)];
      Object.assign(allData, pageData);
    });

    return allData;
  };

  const clearFormData = (formId: string) => {
    setFormState((prev) => {
      const newState = { ...prev };
      delete newState[formId];
      return newState;
    });
  };

  const submitForm = (formId: string): Record<string, any> => {
    const allData = getAllFormData(formId);
    clearFormData(formId);
    return allData;
  };

  return (
    <FormContext.Provider
      value={{
        formState,
        updateField,
        updatePageData,
        getPageData,
        getAllFormData,
        clearFormData,
        submitForm,
      }}
    >
      {children}
    </FormContext.Provider>
  );
};

export const useFormContext = () => {
  const context = useContext(FormContext);
  if (context === undefined) {
    throw new Error("useFormContext must be used within a FormProvider");
  }
  return context;
};

