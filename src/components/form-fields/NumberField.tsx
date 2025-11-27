import { Input } from "@/components/ui/input";
import { BaseField } from "./BaseField";
import { FormField } from "@/types/form-config";

interface NumberFieldProps {
  field: FormField;
  value: number | string;
  onChange: (value: number | string) => void;
}

export const NumberField = ({ field, value, onChange }: NumberFieldProps) => {
  return (
    <BaseField field={field} value={value} onChange={onChange}>
      <Input
        id={field.id}
        type="number"
        value={value || ""}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : "")}
        placeholder={field.placeholder || "0"}
        min={field.min}
        max={field.max}
        step={field.step}
        required={field.required}
      />
    </BaseField>
  );
};

