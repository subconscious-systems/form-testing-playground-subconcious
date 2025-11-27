import { useState } from "react";
import { Input } from "@/components/ui/input";
import { BaseField } from "./BaseField";
import { FormField } from "@/types/form-config";

interface CvvFieldProps {
  field: FormField;
  value: string;
  onChange: (value: string) => void;
}

export const CvvField = ({ field, value, onChange }: CvvFieldProps) => {
  const [error, setError] = useState<string>("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    // Only allow digits
    const digitsOnly = input.replace(/\D/g, "");
    // Limit to 4 digits (max for CVV)
    const limited = digitsOnly.slice(0, 4);
    
    onChange(limited);
    
    // Validate - CVV must be 3 or 4 digits
    if (limited.length > 0 && limited.length !== 3 && limited.length !== 4) {
      setError("CVV must be 3 or 4 digits");
    } else {
      setError("");
    }
  };

  const handleBlur = () => {
    if (value && value.length !== 3 && value.length !== 4) {
      setError("CVV must be 3 or 4 digits");
    } else {
      setError("");
    }
  };

  return (
    <BaseField field={field} value={value} onChange={onChange} error={error}>
      <Input
        id={field.id}
        type="text"
        value={value || ""}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={field.placeholder || "123"}
        maxLength={4}
        required={field.required}
        className={error ? "border-destructive" : ""}
      />
    </BaseField>
  );
};
