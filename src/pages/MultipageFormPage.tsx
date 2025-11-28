import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getFormByIdAsync } from "@/utils/form-config-loader";
import DynamicForm from "@/components/DynamicForm";
import { FormDefinition } from "@/types/form-config";

const MultipageFormPage = () => {
  const { formId, page } = useParams();
  const pageNum = parseInt(page || "1");
  const [configForm, setConfigForm] = useState<FormDefinition | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadForm = async () => {
      if (formId) {
        setLoading(true);
        try {
          const loadedForm = await getFormByIdAsync(formId);
          setConfigForm(loadedForm);
        } catch (error) {
          setConfigForm(undefined);
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

  if (!configForm || configForm.type !== "multipage") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Form not found</p>
      </div>
    );
  }

  const currentPage = configForm.pages.find((p) => p.pageNumber === pageNum);

  if (!currentPage) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Page not found</p>
      </div>
    );
  }

  return (
    <DynamicForm
      key={`${configForm.id}-page-${pageNum}`}
      formId={configForm.id}
      title={configForm.title}
      description={configForm.description}
      page={currentPage}
      pageNumber={pageNum}
      totalPages={configForm.pages.length}
      inputToLLM={configForm.inputToLLM}
      groundTruth={configForm.groundTruth}
      layout={configForm.layout || 'single-column'}
      websiteContext={configForm.websiteContext}
    />
  );

};

export default MultipageFormPage;
