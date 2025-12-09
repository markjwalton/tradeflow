import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Plus, Trash2 } from "lucide-react";

export default function FormFieldEditor({ field, onUpdate, onDelete, onClose }) {
  const hasOptions = ["select", "multiselect", "radio"].includes(field.type);

  const addOption = () => {
    const options = field.options || [];
    onUpdate({ options: [...options, `Option ${options.length + 1}`] });
  };

  const updateOption = (index, value) => {
    const options = [...(field.options || [])];
    options[index] = value;
    onUpdate({ options });
  };

  const removeOption = (index) => {
    const options = [...(field.options || [])];
    options.splice(index, 1);
    onUpdate({ options });
  };

  return (
    <div className="w-80 bg-card border-l border-border flex flex-col">
      <div className="p-3 border-b border-border flex items-center justify-between">
        <h3 className="font-semibold text-sm text-foreground">Edit Field</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          <div>
            <Label>Field Label</Label>
            <Input
              value={field.label || ""}
              onChange={(e) => onUpdate({ label: e.target.value })}
            />
          </div>

          <div>
            <Label>Field ID</Label>
            <Input
              value={field.fieldId || ""}
              onChange={(e) =>
                onUpdate({ fieldId: e.target.value.toLowerCase().replace(/\s+/g, "_") })
              }
            />
            <p className="text-xs text-muted-foreground mt-1">Used to reference this field</p>
          </div>

          {field.type !== "section" && field.type !== "instructions" && (
            <>
              <div>
                <Label>Placeholder</Label>
                <Input
                  value={field.placeholder || ""}
                  onChange={(e) => onUpdate({ placeholder: e.target.value })}
                />
              </div>

              <div>
                <Label>Help Text</Label>
                <Textarea
                  value={field.helpText || ""}
                  onChange={(e) => onUpdate({ helpText: e.target.value })}
                  rows={2}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>Required</Label>
                <Switch
                  checked={field.required === true}
                  onCheckedChange={(v) => onUpdate({ required: v })}
                />
              </div>
            </>
          )}

          {field.type === "instructions" && (
            <div>
              <Label>Instructions Text</Label>
              <Textarea
                value={field.placeholder || ""}
                onChange={(e) => onUpdate({ placeholder: e.target.value })}
                rows={4}
                placeholder="Enter instructions or information to display..."
              />
            </div>
          )}

          {field.type === "number" && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Min Value</Label>
                  <Input
                    type="number"
                    value={field.validation?.min || ""}
                    onChange={(e) =>
                      onUpdate({
                        validation: { ...field.validation, min: e.target.value },
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Max Value</Label>
                  <Input
                    type="number"
                    value={field.validation?.max || ""}
                    onChange={(e) =>
                      onUpdate({
                        validation: { ...field.validation, max: e.target.value },
                      })
                    }
                  />
                </div>
              </div>
            </>
          )}

          {field.type === "text" && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Min Length</Label>
                <Input
                  type="number"
                  value={field.validation?.minLength || ""}
                  onChange={(e) =>
                    onUpdate({
                      validation: { ...field.validation, minLength: e.target.value },
                    })
                  }
                />
              </div>
              <div>
                <Label>Max Length</Label>
                <Input
                  type="number"
                  value={field.validation?.maxLength || ""}
                  onChange={(e) =>
                    onUpdate({
                      validation: { ...field.validation, maxLength: e.target.value },
                    })
                  }
                />
              </div>
            </div>
          )}

          {field.type === "rating" && (
            <div>
              <Label>Max Rating</Label>
              <Input
                type="number"
                value={field.validation?.maxRating || 5}
                onChange={(e) =>
                  onUpdate({
                    validation: { ...field.validation, maxRating: parseInt(e.target.value) || 5 },
                  })
                }
                min={1}
                max={10}
              />
            </div>
          )}

          {hasOptions && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Options</Label>
                <Button size="sm" variant="outline" onClick={addOption}>
                  <Plus className="h-3 w-3 mr-1" />
                  Add
                </Button>
              </div>
              <div className="space-y-2">
                {(field.options || []).map((option, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-9 w-9 p-0 text-destructive"
                      onClick={() => removeOption(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <Label>Default Value</Label>
            <Input
              value={field.defaultValue || ""}
              onChange={(e) => onUpdate({ defaultValue: e.target.value })}
            />
          </div>
        </div>
      </ScrollArea>

      <div className="p-3 border-t border-border">
        <Button variant="destructive" size="sm" className="w-full" onClick={onDelete}>
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Field
        </Button>
      </div>
    </div>
  );
}