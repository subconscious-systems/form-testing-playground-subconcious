import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { FormField } from "@/types/form-config";

interface CheckboxFieldProps {
  field: FormField;
  value: boolean;
  onChange: (value: boolean) => void;
}

export const CheckboxField = ({ field, value, onChange }: CheckboxFieldProps) => {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox
        id={field.id}
        checked={value === true}
        onCheckedChange={(checked) => onChange(checked === true)}
        required={field.required}
      />
      <Label htmlFor={field.id} className="font-normal cursor-pointer">
        {field.label}
        {field.required && <span className="text-destructive ml-1">*</span>}
      </Label>
    </div>
  );
};

