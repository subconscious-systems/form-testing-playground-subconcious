import { useParams } from "react-router-dom";
import { getFormById } from "@/utils/form-config-loader";
import DynamicForm from "@/components/DynamicForm";

const MultipageFormPage = () => {
  const { formId, page } = useParams();
  const pageNum = parseInt(page || "1");

  // Get form from config
  const configForm = formId ? getFormById(formId) : undefined;
  
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
      formId={configForm.id}
      title={configForm.title}
      description={configForm.description}
      page={currentPage}
      pageNumber={pageNum}
      totalPages={configForm.pages.length}
      inputToLLM={configForm.inputToLLM}
      groundTruth={configForm.groundTruth}
    />
  );

};

export default MultipageFormPage;
