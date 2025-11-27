import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { BaseField } from "./BaseField";
import { FormField } from "@/types/form-config";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface SearchableMultiSelectFieldProps {
  field: FormField;
  value: string[];
  onChange: (value: string[]) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const SearchableMultiSelectField = ({
  field,
  value,
  onChange,
  isOpen,
  onOpenChange,
  searchQuery,
  onSearchChange,
}: SearchableMultiSelectFieldProps) => {
  const selectedValues = Array.isArray(value) ? value : [];

  return (
    <BaseField field={field} value={value} onChange={onChange}>
      <div className="space-y-2">
        {/* Display selected items in boxes above */}
        {selectedValues.length > 0 && (
          <div className="flex flex-wrap gap-2 p-2 border rounded-md bg-muted/50">
            {selectedValues.map((val) => (
              <div
                key={val}
                className="flex items-center gap-1 px-2 py-1 bg-secondary rounded-md text-sm"
              >
                <span>{val}</span>
                <button
                  type="button"
                  onClick={() => onChange(selectedValues.filter((v) => v !== val))}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
        <Popover open={isOpen} onOpenChange={onOpenChange}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-start">
              {selectedValues.length > 0
                ? `Add more options (${selectedValues.length} selected)`
                : "Search and select options"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-0" align="start">
            <Command>
              <CommandInput
                placeholder="Search options..."
                value={searchQuery}
                onValueChange={onSearchChange}
              />
              <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup>
                  {field.options
                    ?.filter((opt) => opt.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((option) => (
                      <CommandItem
                        key={option}
                        onSelect={() => {
                          if (selectedValues.includes(option)) {
                            onChange(selectedValues.filter((v) => v !== option));
                          } else {
                            onChange([...selectedValues, option]);
                          }
                          // Clear search query when option is selected
                          onSearchChange("");
                        }}
                      >
                        <div className="flex items-center space-x-2">
                          <div
                            className={cn(
                              "h-4 w-4 rounded border",
                              selectedValues.includes(option) && "bg-primary"
                            )}
                          />
                          <span>{option}</span>
                        </div>
                      </CommandItem>
                    ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </BaseField>
  );
};
