import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { BaseField } from "./BaseField";
import { FormField } from "@/types/form-config";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface DateFieldProps {
  field: FormField;
  value: Date | undefined;
  onChange: (value: Date | undefined) => void;
}

export const DateField = ({ field, value, onChange }: DateFieldProps) => {
  const dateStyle = field.dateStyle || "default";
  const [isOpen, setIsOpen] = useState(false);

  // Determine min/max based on "allowed" parameter
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayString = today.toISOString().split('T')[0];

  let minDate: Date;
  let maxDate: Date;

  if (field.allowed === "before") {
    maxDate = today;
    minDate = new Date();
    minDate.setFullYear(minDate.getFullYear() - 100);
  } else if (field.allowed === "after") {
    minDate = today;
    maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() + 100);
  } else {
    minDate = new Date();
    minDate.setFullYear(minDate.getFullYear() - 100);
    maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() + 100);
  }

  // Default calendar style
  if (dateStyle === "default") {
    const dateString = value ? value.toISOString().split('T')[0] : '';
    const min = minDate.toISOString().split('T')[0];
    const max = maxDate.toISOString().split('T')[0];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      if (inputValue) {
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
  }

  // iOS-style scrollable picker
  if (dateStyle === "ios-scroll") {
    const currentDate = value || new Date();
    const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
    const [selectedDay, setSelectedDay] = useState(currentDate.getDate());
    const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

    const months = Array.from({ length: 12 }, (_, i) => i);
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 100 }, (_, i) => currentYear - 50 + i);
    
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const handleDateChange = (month: number, day: number, year: number) => {
      const validDay = Math.min(day, new Date(year, month + 1, 0).getDate());
      setSelectedMonth(month);
      setSelectedDay(validDay);
      setSelectedYear(year);
      const newDate = new Date(year, month, validDay);
      if (newDate >= minDate && newDate <= maxDate) {
        onChange(newDate);
      }
    };

    // Update selected values when value prop changes
    useEffect(() => {
      if (value) {
        const valueMonth = value.getMonth();
        const valueDay = value.getDate();
        const valueYear = value.getFullYear();
        setSelectedMonth(valueMonth);
        setSelectedDay(valueDay);
        setSelectedYear(valueYear);
      }
    }, [value]);

    return (
      <BaseField field={field} value={value} onChange={onChange}>
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn("w-full justify-start text-left font-normal", !value && "text-muted-foreground")}
              type="button"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {value ? format(value, "PPP") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="flex gap-3 p-4 bg-background border-b">
              {/* Month Scroll */}
              <div className="flex flex-col items-center min-w-[80px]">
                <div className="text-xs font-semibold mb-2 text-muted-foreground uppercase">Month</div>
                <div className="h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 snap-y snap-mandatory">
                  {months.map((month) => {
                    const monthName = new Date(2000, month, 1).toLocaleString('default', { month: 'short' });
                    return (
                      <div
                        key={month}
                        onClick={() => handleDateChange(month, Math.min(selectedDay, new Date(selectedYear, month + 1, 0).getDate()), selectedYear)}
                        className={cn(
                          "px-4 py-2 cursor-pointer text-sm rounded hover:bg-accent snap-center",
                          selectedMonth === month && "bg-primary text-primary-foreground font-semibold"
                        )}
                      >
                        {monthName}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Day Scroll */}
              <div className="flex flex-col items-center min-w-[60px]">
                <div className="text-xs font-semibold mb-2 text-muted-foreground uppercase">Day</div>
                <div className="h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 snap-y snap-mandatory">
                  {days.map((day) => (
                    <div
                      key={day}
                      onClick={() => handleDateChange(selectedMonth, day, selectedYear)}
                      className={cn(
                        "px-3 py-2 cursor-pointer text-sm rounded hover:bg-accent text-center snap-center",
                        selectedDay === day && "bg-primary text-primary-foreground font-semibold"
                      )}
                    >
                      {day}
                    </div>
                  ))}
                </div>
              </div>

              {/* Year Scroll */}
              <div className="flex flex-col items-center min-w-[80px]">
                <div className="text-xs font-semibold mb-2 text-muted-foreground uppercase">Year</div>
                <div className="h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 snap-y snap-mandatory">
                  {years.map((year) => (
                    <div
                      key={year}
                      onClick={() => handleDateChange(selectedMonth, Math.min(selectedDay, new Date(year, selectedMonth + 1, 0).getDate()), year)}
                      className={cn(
                        "px-4 py-2 cursor-pointer text-sm rounded hover:bg-accent text-center snap-center",
                        selectedYear === year && "bg-primary text-primary-foreground font-semibold"
                      )}
                    >
                      {year}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-3 border-t flex justify-end">
              <Button variant="default" size="sm" onClick={() => setIsOpen(false)}>
                Done
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </BaseField>
    );
  }

  // Text input style (MM/DD/YYYY)
  if (dateStyle === "text-input") {
    const formatDateForInput = (date: Date | undefined): string => {
      if (!date) return '';
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const year = date.getFullYear();
      return `${month}/${day}/${year}`;
    };

    const parseDateFromInput = (input: string): Date | undefined => {
      // Must match exactly MM/DD/YYYY format with 4-digit year
      const match = input.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
      if (!match) return undefined;
      
      const [, month, day, year] = match;
      const monthNum = parseInt(month, 10);
      const dayNum = parseInt(day, 10);
      const yearNum = parseInt(year, 10);

      // Validate month: must be between 1 and 12
      if (monthNum < 1 || monthNum > 12) return undefined;
      
      // Validate day: must be between 1 and 31
      if (dayNum < 1 || dayNum > 31) return undefined;
      
      // Validate year: must be exactly 4 digits (already enforced by regex, but double-check)
      if (year.length !== 4) return undefined;

      // Create date and validate it's a real date (handles cases like Feb 30, Apr 31, etc.)
      const date = new Date(yearNum, monthNum - 1, dayNum);
      if (date.getFullYear() !== yearNum || date.getMonth() !== monthNum - 1 || date.getDate() !== dayNum) {
        return undefined; // Invalid date (e.g., Feb 30, Apr 31)
      }

      // Check if date is within allowed range
      if (date >= minDate && date <= maxDate) {
        return date;
      }
      return undefined;
    };

    const [inputValue, setInputValue] = useState(formatDateForInput(value));

    // Sync input value when value prop changes
    useEffect(() => {
      setInputValue(formatDateForInput(value));
    }, [value]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let value = e.target.value;
      
      // Allow only digits and slashes
      value = value.replace(/[^\d/]/g, '');
      
      // Prevent more than 10 characters (MM/DD/YYYY)
      if (value.length > 10) {
        value = value.slice(0, 10);
      }
      
      // Auto-format as user types
      if (value.length > 2 && !value.includes('/')) {
        value = value.slice(0, 2) + '/' + value.slice(2);
      }
      if (value.length > 5 && value.split('/').length === 2) {
        value = value.slice(0, 5) + '/' + value.slice(5, 9);
      }
      
      // Validate month while typing (first two digits)
      const parts = value.split('/');
      if (parts[0] && parts[0].length === 2) {
        const month = parseInt(parts[0], 10);
        if (month > 12) {
          // Auto-correct to 12 if user types > 12
          value = '12/' + (parts[1] || '');
        }
      }
      
      // Validate day while typing (third and fourth digits)
      if (parts[1] && parts[1].length === 2) {
        const day = parseInt(parts[1], 10);
        if (day > 31) {
          // Auto-correct to 31 if user types > 31
          value = parts[0] + '/31/' + (parts[2] || '');
        }
      }
      
      setInputValue(value);
      
      // Only parse and validate when we have a complete date (MM/DD/YYYY = 10 chars)
      if (value.length === 10) {
        const parsedDate = parseDateFromInput(value);
        onChange(parsedDate);
      } else {
        onChange(undefined);
      }
    };

    return (
      <BaseField field={field} value={value} onChange={onChange}>
        <Input
          id={field.id}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="MM/DD/YYYY"
          maxLength={10}
          required={field.required}
          className="w-full"
        />
      </BaseField>
    );
  }

  // Fallback to default
  return null;
};
