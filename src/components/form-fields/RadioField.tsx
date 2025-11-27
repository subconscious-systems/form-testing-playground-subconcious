import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { BaseField } from "./BaseField";
import { FormField } from "@/types/form-config";

interface RadioFieldProps {
  field: FormField;
  value: string;
  onChange: (value: string) => void;
}

export const RadioField = ({ field, value, onChange }: RadioFieldProps) => {
  return (
    <BaseField field={field} value={value} onChange={onChange}>
      <RadioGroup value={value || ""} onValueChange={onChange} required={field.required}>
        {field.options?.map((option) => (
          <div key={option} className="flex items-center space-x-2">
            <RadioGroupItem value={option} id={`${field.id}-${option}`} />
            <Label htmlFor={`${field.id}-${option}`} className="font-normal cursor-pointer">
              {option}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </BaseField>
  );
};

