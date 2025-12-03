import { useState, useEffect } from "react";
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
  const rangeStyle = field.rangeStyle || "single-calendar";
  const [isOpen, setIsOpen] = useState(false);

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

  // Single calendar with two pointers (default)
  if (rangeStyle === "single-calendar") {
    return (
      <BaseField field={field} value={value} onChange={onChange}>
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn("w-full justify-start text-left font-normal", !rangeValue.from && "text-muted-foreground")}
              type="button"
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
  }

  // Dual calendar (two separate date fields with individual calendars)
  if (rangeStyle === "dual-calendar") {
    const [fromDate, setFromDate] = useState<Date | undefined>(rangeValue.from);
    const [toDate, setToDate] = useState<Date | undefined>(rangeValue.to);
    const [fromOpen, setFromOpen] = useState(false);
    const [toOpen, setToOpen] = useState(false);

    // Sync state with value prop
    useEffect(() => {
      setFromDate(rangeValue.from);
      setToDate(rangeValue.to);
    }, [rangeValue.from, rangeValue.to]);

    const handleFromSelect = (date: Date | undefined) => {
      if (!date) {
        setFromDate(undefined);
        onChange({ from: undefined, to: toDate });
        return;
      }

      setFromDate(date);
      
      // If toDate exists and the new fromDate is after toDate, update toDate to be the same as fromDate
      if (toDate && date > toDate) {
        setToDate(date);
        onChange({ from: date, to: date });
      } else {
        onChange({ from: date, to: toDate });
      }
      setFromOpen(false);
    };

    const handleToSelect = (date: Date | undefined) => {
      if (!date) {
        setToDate(undefined);
        onChange({ from: fromDate, to: undefined });
        return;
      }

      // If fromDate exists and the new toDate is before fromDate, update fromDate to be the same as toDate
      if (fromDate && date < fromDate) {
        setFromDate(date);
        onChange({ from: date, to: date });
      } else {
        setToDate(date);
        onChange({ from: fromDate, to: date });
      }
      setToOpen(false);
    };

    return (
      <BaseField field={field} value={value} onChange={onChange} showLabel={false}>
        <div className="flex flex-col gap-3 w-full">
          {/* From Date Field */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-foreground">
              {field.label} - From Date
              {field.required && <span className="text-destructive ml-1">*</span>}
            </label>
            <Popover open={fromOpen} onOpenChange={setFromOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal", !fromDate && "text-muted-foreground")}
                  type="button"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {fromDate ? format(fromDate, "PPP") : "Select start date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={fromDate}
                  onSelect={handleFromSelect}
                  defaultMonth={fromDate || new Date()}
                  classNames={{
                    day_today: "bg-transparent text-foreground font-normal hover:bg-accent"
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* To Date Field */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-foreground">
              {field.label} - To Date
              {field.required && <span className="text-destructive ml-1">*</span>}
            </label>
            <Popover open={toOpen} onOpenChange={setToOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal", !toDate && "text-muted-foreground")}
                  type="button"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {toDate ? format(toDate, "PPP") : "Select end date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={toDate}
                  onSelect={handleToSelect}
                  defaultMonth={toDate || fromDate || new Date()}
                  disabled={fromDate ? (date: Date) => {
                    const dateToCompare = new Date(date);
                    dateToCompare.setHours(0, 0, 0, 0);
                    const fromDateToCompare = new Date(fromDate);
                    fromDateToCompare.setHours(0, 0, 0, 0);
                    return dateToCompare < fromDateToCompare;
                  } : undefined}
                  classNames={{
                    day_today: "bg-transparent text-foreground font-normal hover:bg-accent"
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </BaseField>
    );
  }

  return null;
};
