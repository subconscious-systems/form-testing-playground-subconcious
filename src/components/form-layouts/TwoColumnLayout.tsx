import { LayoutProps } from "./types";

export const TwoColumnLayout = ({ fields, renderField }: LayoutProps) => {
  // Group fields into pairs for two-column layout
  const fieldPairs: any[][] = [];
  for (let i = 0; i < fields.length; i += 2) {
    fieldPairs.push(fields.slice(i, i + 2));
  }

  return (
    <div className="space-y-6 p-4 bg-blue-50/30 rounded-lg border-2 border-blue-200/50">
      {fieldPairs.map((pair, pairIndex) => (
        <div key={pairIndex} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pair.map((field) => (
            <div key={field.id} className="bg-white p-4 rounded-md border border-blue-100">
              {renderField(field)}
            </div>
          ))}
          {/* If odd number of fields, add empty div to maintain grid */}
          {pair.length === 1 && <div></div>}
        </div>
      ))}
    </div>
  );
};

