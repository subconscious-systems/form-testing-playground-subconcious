import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BaseField } from "./BaseField";
import { FormField } from "@/types/form-config";
import { X } from "lucide-react";

interface MultiSelectFieldProps {
  field: FormField;
  value: string[];
  onChange: (value: string[]) => void;
}

export const MultiSelectField = ({ field, value, onChange }: MultiSelectFieldProps) => {
  const selectedValues = Array.isArray(value) ? value : [];

  return (
    <BaseField field={field} value={value} onChange={onChange}>
      <div className="space-y-2">
        <Select
          value=""
          onValueChange={(val) => {
            if (!selectedValues.includes(val)) {
              onChange([...selectedValues, val]);
            }
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select options" />
          </SelectTrigger>
          <SelectContent>
            {field.options?.map((option) => (
              <SelectItem key={option} value={option} disabled={selectedValues.includes(option)}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedValues.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {selectedValues.map((val) => (
              <div
                key={val}
                className="flex items-center gap-1 px-2 py-1 bg-secondary rounded-md text-sm"
              >
                <span>{val}</span>
                <button
                  type="button"
                  onClick={() => onChange(selectedValues.filter((v) => v !== val))}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </BaseField>
  );
};

