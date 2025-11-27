import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BaseField } from "./BaseField";
import { FormField } from "@/types/form-config";
import { Upload } from "lucide-react";

interface FileFieldProps {
  field: FormField;
  value: string | null;
  onChange: (value: string | null) => void;
}

export const FileField = ({ field, value, onChange }: FileFieldProps) => {
  return (
    <BaseField field={field} value={value} onChange={onChange}>
      <div className="flex items-center gap-2">
        <Input
          id={field.id}
          type="file"
          accept={field.accept}
          onChange={(e) => onChange(e.target.files?.[0]?.name || null)}
          className="hidden"
          required={field.required}
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => document.getElementById(field.id)?.click()}
          className="w-full"
        >
          <Upload className="mr-2 h-4 w-4" />
          {value || "Choose file"}
        </Button>
      </div>
    </BaseField>
  );
};

