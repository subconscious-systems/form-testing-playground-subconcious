import { BaseField } from "./BaseField";
import { FormField } from "@/types/form-config";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingFieldProps {
  field: FormField;
  value: number;
  onChange: (value: number) => void;
}

export const StarRatingField = ({ field, value, onChange }: StarRatingFieldProps) => {
  const stars = Array.from({ length: field.maxStars || 5 }, (_, i) => i + 1);
  const rating = value || 0;

  return (
    <BaseField field={field} value={value} onChange={onChange}>
      <div className="flex gap-1">
        {stars.map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="focus:outline-none"
          >
            <Star
              className={cn(
                "w-8 h-8 transition-colors",
                star <= rating ? "fill-warning text-warning" : "text-muted-foreground"
              )}
            />
          </button>
        ))}
      </div>
    </BaseField>
  );
};

