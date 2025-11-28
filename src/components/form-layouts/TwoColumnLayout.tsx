import { LayoutProps } from "./types";
import { Card, CardContent } from "@/components/ui/card";

export const TwoColumnLayout = ({ fields, renderField }: LayoutProps) => {
  return (
    <Card className="border-t-4 border-t-indigo-500 shadow-md">
      <CardContent className="p-6 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          {fields.map((field, index) => {
            // Check if this is a full-width field (like textarea or file upload)
            const isFullWidth = field.type === 'textarea' || field.type === 'file' || field.type === 'address';

            return (
              <div
                key={field.id}
                className={`${isFullWidth ? 'md:col-span-2' : 'md:col-span-1'} transition-all duration-200`}
              >
                {renderField(field)}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
