import { useState } from "react";
import { Input } from "@/components/ui/input";
import { BaseField } from "./BaseField";
import { FormField } from "@/types/form-config";

interface CreditCardFieldProps {
  field: FormField;
  value: string;
  onChange: (value: string) => void;
}

export const CreditCardField = ({ field, value, onChange }: CreditCardFieldProps) => {
  const [error, setError] = useState<string>("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    // Remove all spaces and non-digits
    const digitsOnly = input.replace(/\D/g, "");
    // Limit to 16 digits (max for credit card)
    const limited = digitsOnly.slice(0, 16);
    
    // Format with spaces every 4 digits
    const formatted = limited.replace(/(.{4})/g, "$1 ").trim();
    
    onChange(formatted);
    
    // Validate - Credit card must be 15 or 16 digits
    const digitCount = limited.length;
    if (digitCount > 0 && digitCount !== 15 && digitCount !== 16) {
      setError("Credit card number must be 15 or 16 digits");
    } else {
      setError("");
    }
  };

  const handleBlur = () => {
    const digitsOnly = (value || "").replace(/\D/g, "");
    if (digitsOnly && digitsOnly.length !== 15 && digitsOnly.length !== 16) {
      setError("Credit card number must be 15 or 16 digits");
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
        placeholder={field.placeholder || "1234 5678 9012 3456"}
        maxLength={19} // 16 digits + 3 spaces
        required={field.required}
        className={error ? "border-destructive" : ""}
      />
    </BaseField>
  );
};
