import { LayoutProps } from "./types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export const WizardStyleLayout = ({ fields, renderField, pageNumber = 1, totalPages = 1 }: LayoutProps) => {
  // If totalPages is 1, we might be in a single page form or the props weren't passed correctly.
  // In that case, we can try to simulate steps if there are many fields, OR just show 1 step.
  // However, for multipage forms, totalPages should be > 1.

  const steps = Array.from({ length: totalPages }, (_, i) => i + 1);
  const currentStep = pageNumber;

  return (
    <div className="space-y-8">
      {/* Progress Steps Header */}
      <div className="flex items-center justify-between px-4 max-w-3xl mx-auto w-full">
        {steps.map((step) => (
          <div key={step} className="flex flex-col items-center flex-1 relative">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold z-10 transition-colors duration-300
              ${step === currentStep
                  ? 'bg-blue-600 text-white shadow-lg ring-4 ring-blue-50 scale-110'
                  : step < currentStep
                    ? 'bg-green-500 text-white'
                    : 'bg-white border-2 border-gray-200 text-gray-400'
                }`}
            >
              {step < currentStep ? '✓' : step}
            </div>
            <span className={`text-xs mt-2 font-medium transition-colors duration-300 ${step === currentStep ? 'text-blue-600' : step < currentStep ? 'text-green-600' : 'text-gray-400'}`}>
              Step {step}
            </span>
            {/* Connector Line */}
            {step < totalPages && (
              <div className="absolute top-5 left-1/2 w-full h-0.5 -z-0 bg-gray-200">
                <div
                  className="h-full bg-green-500 transition-all duration-500 ease-in-out"
                  style={{ width: step < currentStep ? '100%' : '0%' }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="max-w-3xl mx-auto">
        <Card className="border-t-4 border-t-blue-500 shadow-md">
          <CardHeader className="pb-2 border-b border-gray-100 bg-gray-50/50">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-gray-900">
                Step {currentStep} of {totalPages}
              </h3>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {fields.map((field) => (
              <div key={field.id} className="transition-all duration-200 hover:bg-gray-50/50 p-3 rounded-lg -mx-3 border border-transparent hover:border-gray-100">
                {renderField(field)}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
