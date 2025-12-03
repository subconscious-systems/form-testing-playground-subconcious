import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BaseField } from "./BaseField";
import { FormField } from "@/types/form-config";

interface StateFieldProps {
  field: FormField;
  value: string;
  onChange: (value: string) => void;
}

const STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware",
  "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas",
  "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi",
  "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico", "New York",
  "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina",
  "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia",
  "Wisconsin", "Wyoming"
];

export const StateField = ({ field, value, onChange }: StateFieldProps) => {
  return (
    <BaseField field={field} value={value} onChange={onChange}>
      <Select value={value || ""} onValueChange={onChange} required={field.required}>
        <SelectTrigger id={field.id}>
          <SelectValue placeholder="Select state/province" />
        </SelectTrigger>
        <SelectContent>
          {STATES.map((state) => (
            <SelectItem key={state} value={state}>
              {state}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </BaseField>
  );
};

