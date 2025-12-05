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
  
  return (
    <BaseField field={field} value={value} onChange={onChange}>
      <div className="flex gap-2 items-center">
        <div className="flex-shrink-0 px-3 py-2 bg-muted border border-input rounded-md text-sm font-medium text-muted-foreground">
          {currencySymbol}
        </div>
        <Input
          id={field.id}
          type="number"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder || "0.00"}
          step="0.01"
          min="0"
          className="flex-1"
          required={field.required}
        />
      </div>
    </BaseField>
  );
};

