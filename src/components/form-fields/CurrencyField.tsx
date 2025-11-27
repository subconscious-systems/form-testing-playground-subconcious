import { Input } from "@/components/ui/input";
import { BaseField } from "./BaseField";
import { FormField } from "@/types/form-config";

interface CurrencyFieldProps {
  field: FormField;
  value: string;
  onChange: (value: string) => void;
}

export const CurrencyField = ({ field, value, onChange }: CurrencyFieldProps) => {
  const currencySymbol = field.currency || "$";
  // Calculate padding based on currency symbol length
  const paddingLeft = currencySymbol.length === 1 ? "pl-7" : "pl-10";
  
  return (
    <BaseField field={field} value={value} onChange={onChange}>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none z-10">
          {currencySymbol}
        </span>
        <Input
          id={field.id}
          type="number"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder || "0.00"}
          step="0.01"
          min="0"
          className={paddingLeft}
          required={field.required}
        />
      </div>
    </BaseField>
  );
};

