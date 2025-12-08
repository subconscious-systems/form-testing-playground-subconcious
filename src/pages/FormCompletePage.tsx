import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowLeft } from "lucide-react";

const FormCompletePage = () => {
  const { formId } = useParams();
  const navigate = useNavigate();
  const [evalId, setEvalId] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (formId) {
      const stored = sessionStorage.getItem(`form-evaluation-${formId}`);
      if (stored) {
        try {
          const data = JSON.parse(stored);
          setEvalId(data.evalId);
        } catch (error) {
          console.error("Error parsing session storage data", error);
          navigate(`/${formId}`);
        }
      } else {
        // No evaluation data, redirect to form
        navigate(`/${formId}`);
      }
      setLoading(false);
    }
  }, [formId, navigate]);

  const handleBack = () => {
    if (formId) {
      navigate(`/${formId}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 flex items-center justify-center">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="w-16 h-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-700">
            Task and Submitted successfully
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-muted-foreground">
            <p>Form Number: <span className="font-semibold text-foreground">{formId}</span></p>
            {evalId && (
              <p>Results stored in database id: <span className="font-semibold text-foreground">{evalId}</span></p>
            )}
          </div>

          <div className="pt-4">
            <Button onClick={handleBack} variant="outline" className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Form
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FormCompletePage;

