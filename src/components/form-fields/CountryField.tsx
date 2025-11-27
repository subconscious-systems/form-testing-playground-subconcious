import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BaseField } from "./BaseField";
import { FormField } from "@/types/form-config";

interface CountryFieldProps {
  field: FormField;
  value: string;
  onChange: (value: string) => void;
}

const COUNTRIES = [
  "United States", "Canada", "United Kingdom", "Australia", "Germany", "France", "Japan", "China",
  "India", "Brazil", "Mexico", "Spain", "Italy", "South Korea", "Netherlands", "Sweden"
];

export const CountryField = ({ field, value, onChange }: CountryFieldProps) => {
  return (
    <BaseField field={field} value={value} onChange={onChange}>
      <Select value={value || ""} onValueChange={onChange} required={field.required}>
        <SelectTrigger id={field.id}>
          <SelectValue placeholder="Select country" />
        </SelectTrigger>
        <SelectContent>
          {COUNTRIES.map((country) => (
            <SelectItem key={country} value={country}>
              {country}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </BaseField>
  );
};

