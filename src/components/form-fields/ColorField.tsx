import { Input } from "@/components/ui/input";
import { BaseField } from "./BaseField";
import { FormField } from "@/types/form-config";

interface ColorFieldProps {
  field: FormField;
  value: string;
  onChange: (value: string) => void;
}

export const ColorField = ({ field, value, onChange }: ColorFieldProps) => {
  return (
    <BaseField field={field} value={value} onChange={onChange}>
      <div className="flex items-center gap-2">
        <Input
          id={field.id}
          type="color"
          value={value || "#000000"}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-20 cursor-pointer"
          required={field.required}
        />
        <Input
          type="text"
          value={value || "#000000"}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          className="flex-1"
        />
      </div>
    </BaseField>
  );
};

