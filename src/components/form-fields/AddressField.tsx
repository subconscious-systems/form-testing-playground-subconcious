import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { BaseField } from "./BaseField";
import { FormField } from "@/types/form-config";
import { ChevronsUpDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface AddressFieldProps {
  field: FormField;
  value: string;
  onChange: (value: string) => void;
}

export const AddressField = ({ field, value, onChange }: AddressFieldProps) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter addresses based on search query
  const filteredAddresses = (field.options || []).filter((address) =>
    address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <BaseField field={field} value={value} onChange={onChange}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between font-normal"
            type="button"
          >
            {value || field.placeholder || "Start typing address..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput
              placeholder="Search address..."
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandList>
              <CommandEmpty>No address found.</CommandEmpty>
              <CommandGroup>
                {filteredAddresses.map((address) => (
                  <CommandItem
                    key={address}
                    value={address}
                    onSelect={() => {
                      onChange(address === value ? "" : address);
                      setOpen(false);
                      setSearchQuery("");
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === address ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {address}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </BaseField>
  );
};

