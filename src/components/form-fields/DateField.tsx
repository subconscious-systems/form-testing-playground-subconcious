import { Input } from "@/components/ui/input";
import { BaseField } from "./BaseField";
import { FormField } from "@/types/form-config";

interface DateFieldProps {
  field: FormField;
  value: Date | undefined;
  onChange: (value: Date | undefined) => void;
}

export const DateField = ({ field, value, onChange }: DateFieldProps) => {
  // Convert Date to YYYY-MM-DD format for input
  const dateString = value ? value.toISOString().split('T')[0] : '';

  // Determine min/max based on "allowed" parameter
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayString = today.toISOString().split('T')[0];

  let min: string | undefined;
  let max: string | undefined;

  if (field.allowed === "before") {
    // Only allow dates before today (past dates only)
    max = todayString;
    // Set a reasonable minimum (e.g., 100 years ago)
    const minDate = new Date();
    minDate.setFullYear(minDate.getFullYear() - 100);
    min = minDate.toISOString().split('T')[0];
  } else if (field.allowed === "after") {
    // Only allow dates after today (future dates only)
    min = todayString;
    // Set a reasonable maximum (e.g., 100 years from now)
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() + 100);
    max = maxDate.toISOString().split('T')[0];
  } else {
    // No restrictions - allow a wide range
    const minDate = new Date();
    minDate.setFullYear(minDate.getFullYear() - 100);
    min = minDate.toISOString().split('T')[0];
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() + 100);
    max = maxDate.toISOString().split('T')[0];
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    if (inputValue) {
      // Parse the date string and create a Date object
      const date = new Date(inputValue + 'T00:00:00');
      onChange(date);
    } else {
      onChange(undefined);
    }
  };

  return (
    <BaseField field={field} value={value} onChange={onChange}>
      <Input
        id={field.id}
        type="date"
        value={dateString}
        onChange={handleChange}
        min={min}
        max={max}
        required={field.required}
        className="w-full"
      />
    </BaseField>
  );
};
