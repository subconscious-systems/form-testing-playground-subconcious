import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { FormField } from "@/types/form-config";

interface SwitchFieldProps {
  field: FormField;
  value: boolean;
  onChange: (value: boolean) => void;
}

export const SwitchField = ({ field, value, onChange }: SwitchFieldProps) => {
  return (
    <div className="flex items-center space-x-2">
      <Switch
        id={field.id}
        checked={value === true}
        onCheckedChange={(checked) => onChange(checked === true)}
      />
      <Label htmlFor={field.id} className="font-normal cursor-pointer">
        {field.label}
        {field.required && <span className="text-destructive ml-1">*</span>}
      </Label>
    </div>
  );
};

