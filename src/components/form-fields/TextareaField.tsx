import { Textarea } from "@/components/ui/textarea";
import { BaseField } from "./BaseField";
import { FormField } from "@/types/form-config";

interface TextareaFieldProps {
  field: FormField;
  value: string;
  onChange: (value: string) => void;
}

export const TextareaField = ({ field, value, onChange }: TextareaFieldProps) => {
  return (
    <BaseField field={field} value={value} onChange={onChange}>
      <Textarea
        id={field.id}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder || ""}
        required={field.required}
        rows={4}
      />
    </BaseField>
  );
};

