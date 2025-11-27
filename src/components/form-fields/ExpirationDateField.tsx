import { Input } from "@/components/ui/input";
import { BaseField } from "./BaseField";
import { FormField } from "@/types/form-config";

interface ExpirationDateFieldProps {
  field: FormField;
  value: string;
  onChange: (value: string) => void;
}

export const ExpirationDateField = ({ field, value, onChange }: ExpirationDateFieldProps) => {
  return (
    <BaseField field={field} value={value} onChange={onChange}>
      <Input
        id={field.id}
        type="text"
        value={value || ""}
        onChange={(e) => {
          let val = e.target.value.replace(/\D/g, "");
          if (val.length >= 2) val = val.slice(0, 2) + "/" + val.slice(2, 4);
          onChange(val);
        }}
        placeholder={field.placeholder || "MM/YY"}
        maxLength={5}
        required={field.required}
      />
    </BaseField>
  );
};

