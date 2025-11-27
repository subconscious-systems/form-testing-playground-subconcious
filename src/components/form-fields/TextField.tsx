import { Input } from "@/components/ui/input";
import { BaseField } from "./BaseField";
import { FormField } from "@/types/form-config";

interface TextFieldProps {
  field: FormField;
  value: string;
  onChange: (value: string) => void;
}

export const TextField = ({ field, value, onChange }: TextFieldProps) => {
  return (
    <BaseField field={field} value={value} onChange={onChange}>
      <Input
        id={field.id}
        type="text"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder || ""}
        required={field.required}
      />
    </BaseField>
  );
};

