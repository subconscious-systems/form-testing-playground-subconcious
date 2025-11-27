import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getFormByIdAsync } from "@/utils/form-config-loader";
import DynamicForm from "@/components/DynamicForm";
import { FormDefinition } from "@/types/form-config";

const FormPage = () => {
  const { formId } = useParams();
  const [form, setForm] = useState<FormDefinition | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadForm = async () => {
      if (formId) {
        setLoading(true);
        try {
          const loadedForm = await getFormByIdAsync(formId);
          setForm(loadedForm);
        } catch (error) {
          setForm(undefined);
        } finally {
          setLoading(false);
        }
      }
    };
    loadForm();
  }, [formId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading form...</p>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Form not found</p>
      </div>
    );
  }

  // For single-page forms, render the first (and only) page
  const page = form.pages[0];
  if (!page) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Form has no pages</p>
      </div>
    );
  }

  return (
    <DynamicForm
      formId={form.id}
      title={form.title}
      description={form.description}
      page={page}
      pageNumber={1}
      totalPages={form.pages.length}
      inputToLLM={form.inputToLLM}
      groundTruth={form.groundTruth}
    />
  );
};

export default FormPage;
