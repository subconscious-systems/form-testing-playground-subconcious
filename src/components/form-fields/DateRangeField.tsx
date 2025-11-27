import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { BaseField } from "./BaseField";
import { FormField } from "@/types/form-config";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";

interface DateRangeFieldProps {
  field: FormField;
  value: DateRange | undefined;
  onChange: (value: DateRange | undefined) => void;
}

export const DateRangeField = ({ field, value, onChange }: DateRangeFieldProps) => {
  // Ensure we have a proper DateRange object with from/to, not defaulting to today
  const rangeValue: DateRange = value && (value.from || value.to) 
    ? { 
        from: value.from ? (typeof value.from === "string" ? new Date(value.from) : value.from) : undefined,
        to: value.to ? (typeof value.to === "string" ? new Date(value.to) : value.to) : undefined
      }
    : { from: undefined, to: undefined };

  const handleSelect = (range: DateRange | undefined) => {
    if (!range) {
      onChange({ from: undefined, to: undefined });
      return;
    }

    // If both from and to are selected, update the value
    if (range.from && range.to) {
      onChange(range);
    } else if (range.from) {
      // Only from is selected, keep it and wait for to
      onChange({ from: range.from, to: undefined });
    } else {
      // Reset if from is cleared
      onChange({ from: undefined, to: undefined });
    }
  };

  // Only pass selected prop if we have at least a from date
  // When no dates are selected, pass undefined to prevent today from being highlighted
  const selectedValue = (rangeValue.from || rangeValue.to) 
    ? rangeValue 
    : undefined;

  // Disable today's date from being auto-selected by not highlighting it
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <BaseField field={field} value={value} onChange={onChange}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn("w-full justify-start text-left font-normal", !rangeValue.from && "text-muted-foreground")}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {rangeValue.from
              ? rangeValue.to
                ? `${format(rangeValue.from, "PPP")} - ${format(rangeValue.to, "PPP")}`
                : `${format(rangeValue.from, "PPP")} - ...`
              : "Pick a date range"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            selected={selectedValue}
            onSelect={handleSelect}
            initialFocus
            numberOfMonths={2}
            defaultMonth={rangeValue.from || new Date()}
            classNames={{
              day_today: "bg-transparent text-foreground font-normal hover:bg-accent"
            }}
          />
        </PopoverContent>
      </Popover>
    </BaseField>
  );
};
