import { useEffect } from "react";
import { useFormContext } from "@/contexts/FormContext";

interface UseFormStateOptions {
  formId: string;
  pageNumber: number;
}

export const useFormState = ({ formId, pageNumber }: UseFormStateOptions) => {
  const { getPageData, updateField, getAllFormData, submitForm } = useFormContext();

  // Get current page data
  const pageData = getPageData(formId, pageNumber);

  // Update a single field
  const updateFieldValue = (fieldId: string, value: any) => {
    updateField(formId, pageNumber, fieldId, value);
  };

  // Get all form data across all pages
  const getAllData = () => {
    return getAllFormData(formId);
  };

  // Submit form and get all data
  const handleSubmit = () => {
    return submitForm(formId);
  };

  return {
    pageData,
    updateFieldValue,
    getAllData,
    handleSubmit,
  };
};

