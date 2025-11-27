import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BaseField } from "./BaseField";
import { FormField } from "@/types/form-config";

interface SelectFieldProps {
  field: FormField;
  value: string;
  onChange: (value: string) => void;
}

export const SelectField = ({ field, value, onChange }: SelectFieldProps) => {
  return (
    <BaseField field={field} value={value} onChange={onChange}>
      <Select value={value || ""} onValueChange={onChange} required={field.required}>
        <SelectTrigger id={field.id}>
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          {field.options?.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </BaseField>
  );
};

