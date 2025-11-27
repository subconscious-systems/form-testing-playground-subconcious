import { useState } from "react";
import { Input } from "@/components/ui/input";
import { BaseField } from "./BaseField";
import { FormField } from "@/types/form-config";

interface EmailFieldProps {
  field: FormField;
  value: string;
  onChange: (value: string) => void;
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const EmailField = ({ field, value, onChange }: EmailFieldProps) => {
  const [error, setError] = useState<string>("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    onChange(input);
    
    // Validate email format
    if (input && !emailRegex.test(input)) {
      setError("Please enter a valid email address");
    } else {
      setError("");
    }
  };

  const handleBlur = () => {
    if (value && !emailRegex.test(value)) {
      setError("Please enter a valid email address");
    }
  };

  return (
    <BaseField field={field} value={value} onChange={onChange} error={error}>
      <Input
        id={field.id}
        type="email"
        value={value || ""}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={field.placeholder || "you@example.com"}
        required={field.required}
        className={error ? "border-destructive" : ""}
      />
    </BaseField>
  );
};
