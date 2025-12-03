import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { FormField, FormPage } from "@/types/form-config";
import { useFormState } from "@/hooks/useFormState";
import { compareWithGroundTruth, ComparisonResult } from "@/utils/form-comparison";
import { FormDefinition } from "@/types/form-config";
import { saveEvaluationToDatabase } from "@/utils/api";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { layoutComponents } from "./form-layouts";
import {
  TextField,
  TextareaField,
  PhoneField,
  EmailField,
  UrlField,
  CheckboxField,
  SwitchField,
  SelectField,
  RadioField,
  MultiSelectField,
  SearchableMultiSelectField,
  DateField,
  TimeField,
  DateRangeField,
  NumberField,
  SliderField,
  CurrencyField,
  StarRatingField,
  AddressField,
  CountryField,
  StateField,
  ZipField,
  CreditCardField,
  ExpirationDateField,
  CvvField,
  ReactiveChunksField,
} from "./form-fields";

interface DynamicFormProps {
  formId: string;
  title: string;
  description: string;
  page: FormPage;
  pageNumber?: number;
  totalPages?: number;
  inputToLLM?: string;
  groundTruth?: Record<string, any>;
  layout?: 'single-column' | 'two-column' | 'split-screen' | 'wizard-style' | 'website-style';
  websiteContext?: any; // Should be WebsiteContext
  formDefinition?: FormDefinition; // Full form definition for field type lookup
}

const DynamicForm = ({ formId, title, description, page, pageNumber = 1, totalPages = 1, inputToLLM, groundTruth, layout = 'single-column', websiteContext, formDefinition }: DynamicFormProps) => {
  const { pageData, updateFieldValue, getAllData, handleSubmit: submitForm } = useFormState({
    formId,
    pageNumber,
  });

  const [openSelects, setOpenSelects] = useState<Record<string, boolean>>({});
  const [searchQueries, setSearchQueries] = useState<Record<string, string>>({});
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);
  const navigate = useNavigate();

  // Load existing data for this page on mount
  useEffect(() => {
    // Clear comparison result when navigating to a new page
    // This ensures the form always renders on page load, not the evaluation report
    // IMPORTANT: This must run BEFORE any other logic to prevent showing evaluation on page load
    setComparisonResult(null);
    // Data is already loaded via useFormState hook
    // This effect can be used for any additional initialization if needed
  }, [formId, pageNumber]);


  const handleFieldChange = (fieldId: string, value: any) => {
    updateFieldValue(fieldId, value);
  };

  const validateField = (field: FormField, value: any): string | null => {
    // Required field check
    if (field.required) {
      if (field.type === "checkbox" || field.type === "switch") {
        if (value !== true) return `${field.label} is required`;
      } else if (field.type === "multiselect" || field.type === "searchable-multiselect") {
        if (!value || (Array.isArray(value) && value.length === 0)) {
          return `${field.label} is required`;
        }
      } else if (field.type === "reactive-chunks") {
        if (!value || (Array.isArray(value) && value.length === 0)) {
          return `${field.label} is required`;
        }
      } else if (!value) {
        return `${field.label} is required`;
      }
    }

    // Format validation
    if (value) {
      if (field.type === "phone") {
        const digits = String(value).replace(/\D/g, "");
        if (digits.length !== 10) {
          return "Phone number must be exactly 10 digits";
        }
      } else if (field.type === "email") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(String(value))) {
          return "Please enter a valid email address";
        }
      } else if (field.type === "url") {
        const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
        if (!urlRegex.test(String(value))) {
          return "Please enter a valid URL";
        }
      } else if (field.type === "zip") {
        const digits = String(value).replace(/\D/g, "");
        if (digits.length !== 5) {
          return "Zip code must be exactly 5 digits";
        }
      } else if (field.type === "cvv") {
        const digits = String(value).replace(/\D/g, "");
        if (digits.length !== 3 && digits.length !== 4) {
          return "CVV must be 3 or 4 digits";
        }
      } else if (field.type === "credit-card") {
        const digits = String(value).replace(/\D/g, "");
        if (digits.length !== 15 && digits.length !== 16) {
          return "Credit card number must be 15 or 16 digits";
        }
      }
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields on current page
    const validationErrors: string[] = [];

    page.fields.forEach((field) => {
      const value = pageData[field.id];
      const error = validateField(field, value);
      if (error) {
        validationErrors.push(error);
      }
    });

    if (validationErrors.length > 0) {
      toast.error(validationErrors[0]);
      return;
    }

    // If this is the last page, submit the entire form
    if (pageNumber === totalPages) {
      const allFormData = getAllData(); // Get data without clearing (we'll clear after navigation)

      toast.success("Form submitted successfully!");

      // Compare with ground truth if available
      if (groundTruth && formDefinition) {
        // Perform comparison with binary scoring
        const comparison = await compareWithGroundTruth(
          allFormData,
          groundTruth,
          formDefinition
        );

        // Store comparison result in sessionStorage for the complete page
        // Data will be cleared when navigating away from complete page
        sessionStorage.setItem(`form-evaluation-${formId}`, JSON.stringify({
          comparison,
          submittedData: allFormData,
          formDefinition
        }));

        // Save evaluation to database
        try {
          // Transform fieldResults into field_eval format
          const fieldEval: Record<string, {
            expected: any;
            submitted: any;
            score: number;
            required: boolean;
            inputType: string;
          }> = {};

          Object.entries(comparison.fieldResults).forEach(([fieldId, result]) => {
            fieldEval[fieldId] = {
              expected: result.expected,
              submitted: result.actual,
              score: result.score ?? 0.0,
              required: result.required ?? false,
              inputType: result.fieldType || 'text'
            };
          });

          await saveEvaluationToDatabase({
            form_id: formId,
            title: formDefinition.title,
            description: formDefinition.description,
            type: formDefinition.type,
            layout: formDefinition.layout || 'single-column',
            inputToLLM: formDefinition.inputToLLM,
            field_eval: fieldEval,
            overall_accuracy: comparison.accuracy
          });
        } catch (error) {
          // Log error but don't block navigation
          console.error('Failed to save evaluation to database:', error);
        }

        // Clear form data and navigate to complete page
        submitForm();
        navigate(`/${formId}/complete`);
      } else {
        // If no ground truth, clear and navigate home
        submitForm();
        setTimeout(() => navigate("/"), 1500);
      }
    } else {
      // Not the last page, navigate to next page
      navigate(`/${formId}/page/${pageNumber + 1}`);
    }
  };

  const handleNext = () => {
    // Validate all fields before moving to next page
    const validationErrors: string[] = [];

    page.fields.forEach((field) => {
      const value = pageData[field.id];
      const error = validateField(field, value);
      if (error) {
        validationErrors.push(error);
      }
    });

    if (validationErrors.length > 0) {
      toast.error(validationErrors[0]);
      return;
    }

    // Navigate to next page
    navigate(`/${formId}/page/${pageNumber + 1}`);
  };

  const handleBack = () => {
    if (pageNumber > 1) {
      navigate(`/${formId}/page/${pageNumber - 1}`);
    } else {
      navigate("/");
    }
  };

  const renderField = (field: FormField) => {
    const value = pageData[field.id];
    const commonProps = {
      field,
      value: value !== undefined ? value : (field.type === "multiselect" || field.type === "searchable-multiselect" ? [] : field.type === "reactive-chunks" ? [] : ""),
      onChange: (val: any) => handleFieldChange(field.id, val),
    };

    switch (field.type) {
      case "text":
        return <TextField {...commonProps} value={value || ""} />;
      case "textarea":
        return <TextareaField {...commonProps} value={value || ""} />;
      case "phone":
        return <PhoneField {...commonProps} value={value || ""} />;
      case "email":
        return <EmailField {...commonProps} value={value || ""} />;
      case "url":
        return <UrlField {...commonProps} value={value || ""} />;
      case "checkbox":
        return <CheckboxField {...commonProps} value={value === true} />;
      case "switch":
        return <SwitchField {...commonProps} value={value === true} />;
      case "select":
        return <SelectField {...commonProps} value={value || ""} />;
      case "radio":
        return <RadioField {...commonProps} value={value || ""} />;
      case "multiselect":
        return <MultiSelectField {...commonProps} value={Array.isArray(value) ? value : []} />;
      case "searchable-multiselect":
        return (
          <SearchableMultiSelectField
            {...commonProps}
            value={Array.isArray(value) ? value : []}
            isOpen={openSelects[field.id] || false}
            onOpenChange={(open) => setOpenSelects({ ...openSelects, [field.id]: open })}
            searchQuery={searchQueries[field.id] || ""}
            onSearchChange={(query) => setSearchQueries({ ...searchQueries, [field.id]: query })}
          />
        );
      case "date":
        return <DateField {...commonProps} value={value ? (typeof value === "string" ? new Date(value) : value) : undefined} />;
      case "time":
        return <TimeField {...commonProps} value={value || ""} />;
      case "date-range":
        // Ensure date-range value is properly structured
        const dateRangeValue = value && (value.from || value.to)
          ? {
            from: value.from ? (typeof value.from === "string" ? new Date(value.from) : value.from) : undefined,
            to: value.to ? (typeof value.to === "string" ? new Date(value.to) : value.to) : undefined
          }
          : undefined;
        return <DateRangeField {...commonProps} value={dateRangeValue} />;
      case "number":
        return <NumberField {...commonProps} value={value || ""} />;
      case "slider":
        return <SliderField {...commonProps} value={value || field.defaultValue || field.min || 0} />;
      case "currency":
        return <CurrencyField {...commonProps} value={value || ""} />;
      case "star-rating":
        return <StarRatingField {...commonProps} value={value || 0} />;
      case "address":
        return <AddressField {...commonProps} value={value || ""} />;
      case "country":
        return <CountryField {...commonProps} value={value || ""} />;
      case "state":
        return <StateField {...commonProps} value={value || ""} />;
      case "zip":
        return <ZipField {...commonProps} value={value || ""} />;
      case "credit-card":
        return <CreditCardField {...commonProps} value={value || ""} />;
      case "expiration-date":
        return <ExpirationDateField {...commonProps} value={value || ""} />;
      case "cvv":
        return <CvvField {...commonProps} value={value || ""} />;
      case "reactive-chunks":
        return <ReactiveChunksField {...commonProps} value={Array.isArray(value) ? value : []} />;
      default:
        return <TextField {...commonProps} value={value || ""} />;
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Ground Truth Display */}
        {groundTruth && (
          <Card className="border-2 border-blue-200 bg-blue-50/50">
            <CardHeader>
              <CardTitle className="text-lg">Ground Truth Values</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs font-mono bg-white p-3 rounded border overflow-auto max-h-40">
                {JSON.stringify(groundTruth, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}

        {/* Input to LLM Display */}
        {inputToLLM && (
          <Card className="border-2 border-green-200 bg-green-50/50">
            <CardHeader>
              <CardTitle className="text-lg">Input to LLM</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{inputToLLM}</p>
            </CardContent>
          </Card>
        )}

        {/* Form Card - Only show if not website-style layout */}
        {layout !== 'website-style' && (
          <Card className="w-full">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <CardTitle>{title}</CardTitle>
                {totalPages > 1 && (
                  <span className="text-sm text-muted-foreground">
                    Page {pageNumber} of {totalPages}
                  </span>
                )}
              </div>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
              {comparisonResult ? (
                // Show comparison report
                <div className="space-y-4">
                  <div className="text-center space-y-2">
                    <h3 className="text-2xl font-bold">Submission Results</h3>
                    <div className="text-4xl font-bold">
                      {comparisonResult.accuracy.toFixed(1)}%
                    </div>
                    <div className="flex gap-2 justify-center">
                      <Badge variant="outline" className="text-green-600">
                        <CheckCircle2 className="w-4 h-4 mr-1" />
                        {comparisonResult.correctFields} Correct
                      </Badge>
                      <Badge variant="outline" className="text-red-600">
                        <XCircle className="w-4 h-4 mr-1" />
                        {comparisonResult.incorrectFields} Incorrect
                      </Badge>
                      {comparisonResult.missingFields.length > 0 && (
                        <Badge variant="outline" className="text-yellow-600">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {comparisonResult.missingFields.length} Missing
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold">Correct Fields:</h4>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(comparisonResult.fieldResults)
                        .filter(([_, result]) => result.match)
                        .map(([fieldId]) => (
                          <Badge key={fieldId} variant="outline" className="text-green-600 bg-green-50">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            {fieldId}
                          </Badge>
                        ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold">Incorrect/Missing Fields:</h4>
                    <div className="space-y-2">
                      {Object.entries(comparisonResult.fieldResults)
                        .filter(([_, result]) => !result.match)
                        .map(([fieldId, result]) => (
                          <div key={fieldId} className="p-3 bg-red-50 border border-red-200 rounded text-sm">
                            <div className="font-semibold mb-1">{fieldId}</div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <span className="text-muted-foreground">Expected: </span>
                                <span className="font-mono">{JSON.stringify(result.expected)}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Actual: </span>
                                <span className="font-mono">
                                  {result.actual === null ? (
                                    <span className="text-red-600">(Missing)</span>
                                  ) : (
                                    JSON.stringify(result.actual)
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                  <Button
                    onClick={() => {
                      setComparisonResult(null);
                      navigate("/");
                    }}
                    className="w-full"
                  >
                    Back to Forms
                  </Button>
                </div>
              ) : (
                // Show form
                <form onSubmit={handleSubmit}>
                  <div className="mb-4 flex items-center justify-between">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-medium">
                      Layout: {layout.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Badge>
                  </div>
                  {(() => {
                    const LayoutComponent = layoutComponents[layout] || layoutComponents['single-column'];
                    return <LayoutComponent
                      fields={page.fields}
                      renderField={renderField}
                      websiteContext={websiteContext}
                      pageNumber={pageNumber}
                      totalPages={totalPages}
                    />;
                  })()}
                  <div className="flex gap-3 mt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleBack}
                      className="flex-1"
                    >
                      {pageNumber > 1 ? "Back" : "Cancel"}
                    </Button>
                    {pageNumber < totalPages ? (
                      <Button
                        type="button"
                        onClick={handleNext}
                        className="flex-1"
                      >
                        Next
                      </Button>
                    ) : (
                      <Button type="submit" className="flex-1">
                        Submit
                      </Button>
                    )}
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        )}

        {/* Website-style layout - renders its own full page structure */}
        {layout === 'website-style' && (
          <div>
            {comparisonResult ? (
              // Show comparison report in website style
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Card className="w-full">
                  <CardHeader>
                    <CardTitle className="text-2xl">Submission Results</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center space-y-2">
                      <div className="text-4xl font-bold">
                        {comparisonResult.accuracy.toFixed(1)}%
                      </div>
                      <div className="flex gap-2 justify-center">
                        <Badge variant="outline" className="text-green-600">
                          <CheckCircle2 className="w-4 h-4 mr-1" />
                          {comparisonResult.correctFields} Correct
                        </Badge>
                        <Badge variant="outline" className="text-red-600">
                          <XCircle className="w-4 h-4 mr-1" />
                          {comparisonResult.incorrectFields} Incorrect
                        </Badge>
                      </div>
                    </div>
                    <Button
                      onClick={() => {
                        setComparisonResult(null);
                        navigate("/");
                      }}
                      className="w-full"
                    >
                      Back to Forms
                    </Button>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {(() => {
                  const LayoutComponent = layoutComponents[layout] || layoutComponents['single-column'];
                  return <LayoutComponent
                    fields={page.fields}
                    renderField={renderField}
                    websiteContext={websiteContext}
                    pageNumber={pageNumber}
                    totalPages={totalPages}
                  />;
                })()}
                {/* Submit buttons integrated into website layout */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
                  <div className="flex gap-3 mt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleBack}
                      className="flex-1"
                    >
                      {pageNumber > 1 ? "Back" : "Cancel"}
                    </Button>
                    {pageNumber < totalPages ? (
                      <Button
                        type="button"
                        onClick={handleNext}
                        className="flex-1"
                      >
                        Next
                      </Button>
                    ) : (
                      <Button type="submit" className="flex-1">
                        Submit
                      </Button>
                    )}
                  </div>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DynamicForm;
