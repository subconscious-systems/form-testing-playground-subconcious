import { LayoutProps } from "./types";

export const SingleColumnLayout = ({ fields, renderField }: LayoutProps) => {
  return (
    <div className="space-y-6 p-4 bg-gray-50/30 rounded-lg border-2 border-gray-200/50">
      {fields.map((field) => (
        <div key={field.id} className="bg-white p-4 rounded-md border border-gray-100">
          {renderField(field)}
        </div>
      ))}
    </div>
  );
};

