import { Label } from "@/components/ui/label";
import { FormField } from "@/types/form-config";

interface BaseFieldProps {
  field: FormField;
  value: any;
  onChange: (value: any) => void;
  children: React.ReactNode;
  showLabel?: boolean;
  error?: string;
}

export const BaseField = ({ field, value, onChange, children, showLabel = true, error }: BaseFieldProps) => {
  return (
    <div className="space-y-2">
      {showLabel && (
        <Label htmlFor={field.id}>
          {field.label}
          {field.required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      {children}
      {error && (
        <p className="text-sm text-destructive mt-1">{error}</p>
      )}
    </div>
  );
};

