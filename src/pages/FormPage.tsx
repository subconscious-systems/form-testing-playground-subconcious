import { useParams } from "react-router-dom";
import { getFormById } from "@/utils/form-config-loader";
import DynamicForm from "@/components/DynamicForm";

const FormPage = () => {
  const { formId } = useParams();
  const form = formId ? getFormById(formId) : undefined;

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
