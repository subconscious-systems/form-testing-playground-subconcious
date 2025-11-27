import { Slider } from "@/components/ui/slider";
import { BaseField } from "./BaseField";
import { FormField } from "@/types/form-config";

interface SliderFieldProps {
  field: FormField;
  value: number;
  onChange: (value: number) => void;
}

export const SliderField = ({ field, value, onChange }: SliderFieldProps) => {
  return (
    <BaseField field={field} value={value} onChange={onChange}>
      <div className="space-y-2">
        <Slider
          id={field.id}
          value={[value || field.defaultValue || field.min || 0]}
          onValueChange={(vals) => onChange(vals[0])}
          min={field.min || 0}
          max={field.max || 100}
          step={field.step || 1}
          className="w-full"
        />
        <div className="text-center text-sm text-muted-foreground">
          {value || field.defaultValue || field.min || 0}
        </div>
      </div>
    </BaseField>
  );
};

