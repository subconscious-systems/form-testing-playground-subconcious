import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { BaseField } from "./BaseField";
import { FormField } from "@/types/form-config";
import { ChevronsUpDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

// All available addresses for home-address fields
const AVAILABLE_ADDRESSES = [
  "123 Main Street, New York, NY 10001",
  "123 Main St, Boston, MA 02101",
  "1234 Main Street, Los Angeles, CA 90001",
  "1234 Main St, Chicago, IL 60601",
  "12 Main Avenue, New York, NY 10002",
  "12 Main Ave, San Francisco, CA 94102",
  "123 Oak Street, Seattle, WA 98101",
  "123 Oak St, Portland, OR 97201",
  "1234 Oak Street, Denver, CO 80201",
  "1234 Oak Ave, Phoenix, AZ 85001",
  "456 Park Avenue, New York, NY 10022",
  "456 Park Ave, Miami, FL 33101",
  "4567 Park Avenue, Houston, TX 77001",
  "4567 Park St, Atlanta, GA 30301",
  "789 Elm Street, Philadelphia, PA 19101",
  "789 Elm St, Washington, DC 20001",
  "7890 Elm Street, Dallas, TX 75201",
  "7890 Elm Ave, San Diego, CA 92101",
  "321 Pine Street, Austin, TX 78701",
  "321 Pine St, Nashville, TN 37201",
  "3210 Pine Avenue, Las Vegas, NV 89101",
  "3210 Pine St, Minneapolis, MN 55401",
  "555 Broadway, New York, NY 10012",
  "555 Broadway St, San Antonio, TX 78201",
  "5555 Broadway Avenue, Columbus, OH 43201"
];

interface HomeAddressFieldProps {
  field: FormField;
  value: string;
  onChange: (value: string) => void;
}

export const HomeAddressField = ({ field, value, onChange }: HomeAddressFieldProps) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter addresses based on search query - always use the complete AVAILABLE_ADDRESSES list
  const filteredAddresses = AVAILABLE_ADDRESSES.filter((address) =>
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

