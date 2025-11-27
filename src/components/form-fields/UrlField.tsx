import { useState } from "react";
import { Input } from "@/components/ui/input";
import { BaseField } from "./BaseField";
import { FormField } from "@/types/form-config";

interface UrlFieldProps {
  field: FormField;
  value: string;
  onChange: (value: string) => void;
}

const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;

export const UrlField = ({ field, value, onChange }: UrlFieldProps) => {
  const [error, setError] = useState<string>("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    onChange(input);
    
    // Validate URL format
    if (input && !urlRegex.test(input)) {
      setError("Please enter a valid URL (e.g., https://example.com)");
    } else {
      setError("");
    }
  };

  const handleBlur = () => {
    if (value && !urlRegex.test(value)) {
      setError("Please enter a valid URL (e.g., https://example.com)");
    }
  };

  return (
    <BaseField field={field} value={value} onChange={onChange} error={error}>
      <Input
        id={field.id}
        type="url"
        value={value || ""}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={field.placeholder || "https://example.com"}
        required={field.required}
        className={error ? "border-destructive" : ""}
      />
    </BaseField>
  );
};
