import { LayoutProps } from "./types";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";

export const WizardStyleLayout = ({ fields, renderField }: LayoutProps) => {
  // Group fields into logical sections (every 3-4 fields)
  const sections: any[][] = [];
  const fieldsPerSection = 3;
  
  for (let i = 0; i < fields.length; i += fieldsPerSection) {
    sections.push(fields.slice(i, i + fieldsPerSection));
  }

  return (
    <div className="space-y-8 p-4 bg-green-50/30 rounded-lg border-2 border-green-200/50">
      {sections.map((section, sectionIndex) => (
        <div key={sectionIndex} className="bg-white p-6 rounded-lg border border-green-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-500 text-white font-bold text-sm">
              {sectionIndex + 1}
            </div>
            <h3 className="text-sm font-semibold text-green-700 uppercase tracking-wide">
              Section {sectionIndex + 1}
            </h3>
          </div>
          {sectionIndex > 0 && <Separator className="my-4" />}
          <div className="space-y-4">
            {section.map((field) => (
              <div key={field.id}>
                {renderField(field)}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

