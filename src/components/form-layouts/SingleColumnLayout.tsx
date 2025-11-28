import { LayoutProps } from "./types";
import { Card, CardContent } from "@/components/ui/card";

export const SingleColumnLayout = ({ fields, renderField }: LayoutProps) => {
  return (
    <div className="max-w-2xl mx-auto">
      <Card className="shadow-sm border-gray-200">
        <CardContent className="p-6 md:p-8 space-y-6">
          {fields.map((field) => (
            <div key={field.id} className="bg-white">
              {renderField(field)}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
