import { Input } from "@/components/ui/input";
import { BaseField } from "./BaseField";
import { FormField } from "@/types/form-config";

interface TimeFieldProps {
  field: FormField;
  value: string;
  onChange: (value: string) => void;
}

export const TimeField = ({ field, value, onChange }: TimeFieldProps) => {
  return (
    <BaseField field={field} value={value} onChange={onChange}>
      <Input
        id={field.id}
        type="time"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        required={field.required}
      />
    </BaseField>
  );
};

