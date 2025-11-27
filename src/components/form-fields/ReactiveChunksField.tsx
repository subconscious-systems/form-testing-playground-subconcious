import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { BaseField } from "./BaseField";
import { FormField } from "@/types/form-config";
import { Plus, X } from "lucide-react";

interface ReactiveChunksFieldProps {
  field: FormField;
  value: any[];
  onChange: (value: any[]) => void;
}

export const ReactiveChunksField = ({ field, value, onChange }: ReactiveChunksFieldProps) => {
  const chunks = Array.isArray(value) ? value : [];

  const updateChunk = (index: number, chunkFieldId: string, chunkValue: any) => {
    const newChunks = [...chunks];
    newChunks[index] = { ...newChunks[index], [chunkFieldId]: chunkValue };
    onChange(newChunks);
  };

  const addChunk = () => {
    const newChunk: any = {};
    field.chunkFields?.forEach((cf) => {
      newChunk[cf.id] = "";
    });
    onChange([...chunks, newChunk]);
  };

  const removeChunk = (index: number) => {
    onChange(chunks.filter((_, i) => i !== index));
  };

  return (
    <BaseField field={field} value={value} onChange={onChange}>
      <div className="space-y-4">
        {chunks.map((chunk: any, index: number) => (
          <div key={index} className="border rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Entry {index + 1}</h4>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeChunk(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            {field.chunkFields?.map((chunkField) => (
              <div key={chunkField.id} className="space-y-1">
                <Label className="text-sm">{chunkField.label}</Label>
                {chunkField.type === "text" && (
                  <Input
                    value={chunk[chunkField.id] || ""}
                    onChange={(e) => updateChunk(index, chunkField.id, e.target.value)}
                    placeholder={chunkField.placeholder}
                  />
                )}
                {chunkField.type === "textarea" && (
                  <Textarea
                    value={chunk[chunkField.id] || ""}
                    onChange={(e) => updateChunk(index, chunkField.id, e.target.value)}
                    placeholder={chunkField.placeholder}
                    rows={3}
                  />
                )}
                {chunkField.type === "date" && (() => {
                  const dateValue = chunk[chunkField.id];
                  const dateString = dateValue ? new Date(dateValue).toISOString().split('T')[0] : '';
                  
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const todayString = today.toISOString().split('T')[0];
                  
                  let min: string | undefined;
                  let max: string | undefined;
                  
                  if (chunkField.allowed === "before") {
                    max = todayString;
                    const minDate = new Date();
                    minDate.setFullYear(minDate.getFullYear() - 100);
                    min = minDate.toISOString().split('T')[0];
                  } else if (chunkField.allowed === "after") {
                    min = todayString;
                    const maxDate = new Date();
                    maxDate.setFullYear(maxDate.getFullYear() + 100);
                    max = maxDate.toISOString().split('T')[0];
                  } else {
                    const minDate = new Date();
                    minDate.setFullYear(minDate.getFullYear() - 100);
                    min = minDate.toISOString().split('T')[0];
                    const maxDate = new Date();
                    maxDate.setFullYear(maxDate.getFullYear() + 100);
                    max = maxDate.toISOString().split('T')[0];
                  }
                  
                  return (
                    <Input
                      type="date"
                      value={dateString}
                      onChange={(e) => {
                        const inputValue = e.target.value;
                        if (inputValue) {
                          const date = new Date(inputValue + 'T00:00:00');
                          updateChunk(index, chunkField.id, date.toISOString());
                        } else {
                          updateChunk(index, chunkField.id, '');
                        }
                      }}
                      min={min}
                      max={max}
                      required={chunkField.required}
                      className="w-full"
                    />
                  );
                })()}
                {chunkField.type === "number" && (
                  <Input
                    type="number"
                    value={chunk[chunkField.id] || ""}
                    onChange={(e) => updateChunk(index, chunkField.id, e.target.value ? Number(e.target.value) : "")}
                    placeholder={chunkField.placeholder}
                    min={chunkField.min}
                    max={chunkField.max}
                    step={chunkField.step}
                  />
                )}
                {chunkField.type === "currency" && (
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none z-10">
                      {chunkField.currency || "$"}
                    </span>
                    <Input
                      type="number"
                      value={chunk[chunkField.id] || ""}
                      onChange={(e) => updateChunk(index, chunkField.id, e.target.value)}
                      placeholder={chunkField.placeholder || "0.00"}
                      step="0.01"
                      min="0"
                      className="pl-7"
                    />
                  </div>
                )}
                {chunkField.type === "select" && chunkField.options && (
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={chunk[chunkField.id] || ""}
                    onChange={(e) => updateChunk(index, chunkField.id, e.target.value)}
                  >
                    <option value="">Select...</option>
                    {chunkField.options.map((option: string) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                )}
                {chunkField.type === "email" && (
                  <Input
                    type="email"
                    value={chunk[chunkField.id] || ""}
                    onChange={(e) => updateChunk(index, chunkField.id, e.target.value)}
                    placeholder={chunkField.placeholder}
                  />
                )}
                {chunkField.type === "phone" && (
                  <Input
                    type="tel"
                    value={chunk[chunkField.id] || ""}
                    onChange={(e) => {
                      const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 10);
                      updateChunk(index, chunkField.id, digitsOnly);
                    }}
                    placeholder={chunkField.placeholder || "(555) 123-4567"}
                    maxLength={10}
                  />
                )}
              </div>
            ))}
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          onClick={addChunk}
          className="w-full"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Entry
        </Button>
      </div>
    </BaseField>
  );
};

