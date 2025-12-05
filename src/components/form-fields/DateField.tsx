import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BaseField } from "./BaseField";
import { FormField } from "@/types/form-config";

interface DateFieldProps {
  field: FormField;
  value: Date | undefined;
  onChange: (value: Date | undefined) => void;
}

export const DateField = ({ field, value, onChange }: DateFieldProps) => {
  const dateStyle = field.dateStyle || "default";
  
  // States for dropdown picker (must be at top level due to React Hooks rules)
  const [dropdownMonth, setDropdownMonth] = useState<string>(
    value ? String(value.getMonth() + 1) : ""
  );
  const [dropdownDay, setDropdownDay] = useState<string>(
    value ? String(value.getDate()) : ""
  );
  const [dropdownYear, setDropdownYear] = useState<string>(
    value ? String(value.getFullYear()) : ""
  );
  
  // State for text-input (must be at top level)
  const formatDateForInput = (date: Date | undefined): string => {
    if (!date) return '';
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };
  const [inputValue, setInputValue] = useState(formatDateForInput(value));

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

  // Update dropdown state when value changes
  useEffect(() => {
    if (value && dateStyle === "dropdown") {
      setDropdownMonth(String(value.getMonth() + 1));
      setDropdownDay(String(value.getDate()));
      setDropdownYear(String(value.getFullYear()));
    }
  }, [value, dateStyle]);

  // Update text-input state when value changes
  useEffect(() => {
    if (dateStyle === "text-input") {
      setInputValue(formatDateForInput(value));
    }
  }, [value, dateStyle]);

  // Dropdown style (separate dropdowns for month, day, year)
  if (dateStyle === "dropdown") {
    // Generate year options (±50 years from 2025)
    const years = Array.from({ length: 101 }, (_, i) => 2025 - 50 + i);
    const months = [
      { value: "1", label: "January" },
      { value: "2", label: "February" },
      { value: "3", label: "March" },
      { value: "4", label: "April" },
      { value: "5", label: "May" },
      { value: "6", label: "June" },
      { value: "7", label: "July" },
      { value: "8", label: "August" },
      { value: "9", label: "September" },
      { value: "10", label: "October" },
      { value: "11", label: "November" },
      { value: "12", label: "December" },
    ];

    // Calculate days based on selected month and year
    const getDaysInMonth = (month: number, year: number) => {
      return new Date(year, month, 0).getDate();
    };

    const monthNum = dropdownMonth ? parseInt(dropdownMonth, 10) : 1;
    const yearNum = dropdownYear ? parseInt(dropdownYear, 10) : 2025;
    const daysInMonth = getDaysInMonth(monthNum, yearNum);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    // Update date when all three fields are selected
    useEffect(() => {
      if (dropdownMonth && dropdownDay && dropdownYear) {
        const month = parseInt(dropdownMonth, 10);
        const day = parseInt(dropdownDay, 10);
        const year = parseInt(dropdownYear, 10);
        
        // Validate day exists in selected month/year
        const maxDays = getDaysInMonth(month, year);
        const validDay = Math.min(day, maxDays);
        
        const newDate = new Date(year, month - 1, validDay);
        if (newDate >= minDate && newDate <= maxDate) {
          onChange(newDate);
        }
      } else {
        onChange(undefined);
      }
    }, [dropdownMonth, dropdownDay, dropdownYear]);

    return (
      <BaseField field={field} value={value} onChange={onChange}>
        <div className="grid grid-cols-3 gap-2">
          {/* Month Dropdown */}
          <Select value={dropdownMonth} onValueChange={setDropdownMonth}>
            <SelectTrigger>
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
              {months.map((month) => (
                <SelectItem key={month.value} value={month.value}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Day Dropdown */}
          <Select 
            value={dropdownDay} 
            onValueChange={setDropdownDay}
            disabled={!dropdownMonth}
          >
            <SelectTrigger>
              <SelectValue placeholder="Day" />
            </SelectTrigger>
            <SelectContent>
              {days.map((day) => (
                <SelectItem key={day} value={String(day)}>
                  {day}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Year Dropdown */}
          <Select value={dropdownYear} onValueChange={setDropdownYear}>
            <SelectTrigger>
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={String(year)}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </BaseField>
    );
  }

  // Text input style (MM/DD/YYYY)
  if (dateStyle === "text-input") {
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
