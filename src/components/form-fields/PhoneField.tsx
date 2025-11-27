import { useState } from "react";
import { Input } from "@/components/ui/input";
import { BaseField } from "./BaseField";
import { FormField } from "@/types/form-config";

interface PhoneFieldProps {
  field: FormField;
  value: string;
  onChange: (value: string) => void;
}

export const PhoneField = ({ field, value, onChange }: PhoneFieldProps) => {
  const [error, setError] = useState<string>("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    // Remove all non-digit characters
    const digitsOnly = input.replace(/\D/g, "");
    
    // Limit to 10 digits
    const limited = digitsOnly.slice(0, 10);
    
    onChange(limited);
    
    // Validate
    if (limited.length > 0 && limited.length !== 10) {
      setError("Phone number must be exactly 10 digits");
    } else {
      setError("");
    }
  };

  return (
    <BaseField field={field} value={value} onChange={onChange} error={error}>
      <Input
        id={field.id}
        type="tel"
        value={value || ""}
        onChange={handleChange}
        placeholder={field.placeholder || "(555) 123-4567"}
        required={field.required}
        maxLength={10}
        className={error ? "border-destructive" : ""}
      />
    </BaseField>
  );
};
