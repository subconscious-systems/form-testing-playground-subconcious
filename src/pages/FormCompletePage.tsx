import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, ArrowLeft, TrendingUp } from "lucide-react";
import { ComparisonResult } from "@/utils/form-comparison";
import { FormDefinition } from "@/types/form-config";

/**
 * Format a value for display, especially handling dates
 */
const formatValueForDisplay = (value: any, fieldType?: string): string => {
  if (value === null || value === undefined || value === '') {
    return 'N/A';
  }

  // Handle date fields - extract just the date portion
  if (fieldType && (fieldType === 'date' || fieldType === 'expiration-date')) {
    const str = String(value).trim();
    // If it's an ISO string, extract date part
    if (str.includes('T')) {
      const datePart = str.split('T')[0];
      if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
        return datePart;
      }
    }
    // If it's already YYYY-MM-DD format
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
      return str;
    }
    // Try to parse as date
    try {
      const date = new Date(str);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
    } catch {
      // Fall through to default formatting
    }
  }

  // Handle date-range objects
  if (typeof value === 'object' && value !== null && !Array.isArray(value) && (value.from || value.to)) {
    const formatDate = (d: any) => {
      if (!d) return 'N/A';
      const str = String(d).trim();
      if (str.includes('T')) {
        return str.split('T')[0];
      }
      if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
        return str;
      }
      try {
        const date = new Date(str);
        if (!isNaN(date.getTime())) {
          return date.toISOString().split('T')[0];
        }
      } catch {}
      return str;
    };
    return `From: ${formatDate(value.from)}, To: ${formatDate(value.to)}`;
  }

  // Handle arrays
  if (Array.isArray(value)) {
    return JSON.stringify(value, null, 2);
  }

  // Handle objects
  if (typeof value === 'object' && value !== null) {
    return JSON.stringify(value, null, 2);
  }

  // Default: return as string
  return String(value);
};

const FormCompletePage = () => {
  const { formId } = useParams();
  const navigate = useNavigate();
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);
  const [submittedData, setSubmittedData] = useState<Record<string, any> | null>(null);
  const [formDefinition, setFormDefinition] = useState<FormDefinition | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (formId) {
      const stored = sessionStorage.getItem(`form-evaluation-${formId}`);
      if (stored) {
        try {
          const data = JSON.parse(stored);
          
          // Load the data (only accessible during initial flow)
          setComparison(data.comparison);
          setSubmittedData(data.submittedData);
          setFormDefinition(data.formDefinition);
        } catch (error) {
          // Invalid data, clear it and redirect to form
          sessionStorage.removeItem(`form-evaluation-${formId}`);
          navigate(`/${formId}`);
        }
      } else {
        // No evaluation data, redirect to form
        navigate(`/${formId}`);
      }
      setLoading(false);
    }
    
    // Cleanup: Clear data when component unmounts (navigating away)
    // This ensures data is only accessible during the initial submission flow
    return () => {
      if (formId) {
        sessionStorage.removeItem(`form-evaluation-${formId}`);
      }
    };
  }, [formId, navigate]);

  const handleBack = () => {
    if (formId) {
      // Navigate back to the form
      // Data will be cleared by the cleanup function in useEffect
      if (formDefinition?.type === 'multipage') {
        navigate(`/${formId}/page/1`);
      } else {
        navigate(`/${formId}`);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading evaluation...</p>
      </div>
    );
  }

  if (!comparison) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">No evaluation data found</p>
        <Button onClick={() => navigate("/")} className="ml-4">Go Home</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {formDefinition?.title || "Form Submission Results"}
            </h1>
            <p className="text-muted-foreground">
              Evaluation of your form submission
            </p>
          </div>
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Form
          </Button>
        </div>

        {/* Overall Accuracy Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Overall Accuracy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-blue-600">
              {comparison.accuracy.toFixed(1)}%
            </div>
            <div className="text-sm text-muted-foreground mt-2">
              {comparison.totalFields} total fields
            </div>
          </CardContent>
        </Card>

        {/* Detailed Results */}
        <Card>
          <CardHeader>
            <CardTitle>Field-by-Field Results</CardTitle>
            <CardDescription>
              Detailed comparison of each field
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(comparison.fieldResults).map(([fieldId, result]) => {
                const field = formDefinition?.pages
                  .flatMap(p => p.fields)
                  .find(f => f.id === fieldId);
                const isRequired = comparison.requiredFields.includes(fieldId);
                const isOptional = comparison.optionalFields.includes(fieldId);
                
                return (
                  <div
                    key={fieldId}
                    className="border rounded-lg p-4 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">
                          {field?.label || fieldId}
                        </h3>
                        {isRequired && (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            Required
                          </Badge>
                        )}
                        {isOptional && (
                          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                            Optional
                          </Badge>
                        )}
                        {result.match ? (
                          <Badge variant="outline" className="text-green-600">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Correct
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-red-600">
                            <XCircle className="w-3 h-3 mr-1" />
                            Incorrect
                          </Badge>
                        )}
                        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          {(result.score * 100).toFixed(0)}%
                        </Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground mb-1">Expected:</div>
                        <div className="font-mono bg-muted p-2 rounded">
                          {formatValueForDisplay(result.expected, result.fieldType)}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground mb-1">Submitted:</div>
                        <div className="font-mono bg-muted p-2 rounded">
                          {formatValueForDisplay(result.actual, result.fieldType)}
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 pt-2 border-t">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-muted-foreground">Score:</span>
                        <span className="text-sm font-bold text-purple-700">
                          {(result.score * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>


        {/* Overall Accuracy */}
        <Card>
          <CardHeader>
            <CardTitle>Overall Accuracy</CardTitle>
            <CardDescription>
              Average of all field scores across {comparison.totalFields} total field(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">
                {comparison.accuracy.toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">
                Calculated by summing all field scores (0-1 binary) and dividing by total number of fields
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          <Button onClick={handleBack} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Form
          </Button>
          <Button onClick={() => {
            // Navigate home - data will be cleared by cleanup function
            navigate("/");
          }}>
            Return to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FormCompletePage;

