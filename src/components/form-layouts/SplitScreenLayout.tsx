import { LayoutProps } from "./types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export const SplitScreenLayout = ({ fields, renderField }: LayoutProps) => {
  // Split fields roughly in half
  const midpoint = Math.ceil(fields.length / 2);
  const leftFields = fields.slice(0, midpoint);
  const rightFields = fields.slice(midpoint);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-4 bg-gradient-to-r from-purple-50/40 to-pink-50/40 rounded-lg border-2 border-purple-200/50">
      {/* Left Column - Form Fields */}
      <div className="space-y-6 bg-white/80 p-6 rounded-lg border-l-4 border-purple-400">
        <h3 className="text-sm font-semibold text-purple-700 mb-4 uppercase tracking-wide">Primary Information</h3>
        {leftFields.map((field) => (
          <div key={field.id}>
            {renderField(field)}
          </div>
        ))}
      </div>

      {/* Right Column - Form Fields (or summary area) */}
      <div className="space-y-6 bg-white/80 p-6 rounded-lg border-l-4 border-pink-400">
        <h3 className="text-sm font-semibold text-pink-700 mb-4 uppercase tracking-wide">Additional Details</h3>
        {rightFields.length > 0 ? (
          rightFields.map((field) => (
            <div key={field.id}>
              {renderField(field)}
            </div>
          ))
        ) : (
          <Card className="border-dashed border-2 border-pink-300">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Additional Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Complete the fields on the left to continue.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

