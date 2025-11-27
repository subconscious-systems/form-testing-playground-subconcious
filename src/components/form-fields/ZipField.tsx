import { useState } from "react";
import { Input } from "@/components/ui/input";
import { BaseField } from "./BaseField";
import { FormField } from "@/types/form-config";

interface ZipFieldProps {
  field: FormField;
  value: string;
  onChange: (value: string) => void;
}

export const ZipField = ({ field, value, onChange }: ZipFieldProps) => {
  const [error, setError] = useState<string>("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    // Only allow digits
    const digitsOnly = input.replace(/\D/g, "");
    // Limit to 5 digits
    const limited = digitsOnly.slice(0, 5);
    
    onChange(limited);
    
    // Validate
    if (limited.length > 0 && limited.length !== 5) {
      setError("Zip code must be exactly 5 digits");
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
        placeholder={field.placeholder || "12345"}
        pattern="[0-9]{5}"
        maxLength={5}
        required={field.required}
        className={error ? "border-destructive" : ""}
      />
    </BaseField>
  );
};
