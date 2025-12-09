import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";
import { getValueByBinding, setValueByBinding } from "./utils";

/**
 * Right-side editor panel for quick edits
 */
export default function RightPanelEditor({ isOpen, onClose, config, data, onAction }) {
  const [formData, setFormData] = useState(data);

  const handleFieldChange = (binding, value) => {
    setFormData(prev => setValueByBinding(prev, binding, value));
  };

  const handleSubmit = () => {
    if (onAction && config.submitActionId) {
      onAction(config.submitActionId, formData);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 w-full sm:w-96 bg-background shadow-xl z-50 overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">{config.title}</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-4">
            {config.fields.map(field => (
              <div key={field.id}>
                <label className="text-sm font-medium mb-1 block">{field.label}</label>
                <FieldComponent
                  field={field}
                  value={getValueByBinding(formData, field.binding)}
                  onChange={(value) => handleFieldChange(field.binding, value)}
                />
              </div>
            ))}
          </div>

          <div className="mt-6 flex gap-2">
            <Button onClick={handleSubmit} className="flex-1">Save Changes</Button>
            <Button variant="outline" onClick={onClose}>Cancel</Button>
          </div>
        </div>
      </div>
    </>
  );
}

/**
 * Renders the appropriate field component
 */
function FieldComponent({ field, value, onChange }) {
  switch (field.component) {
    case "TextField":
      return (
        <Input
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    
    case "TextAreaField":
      return (
        <Textarea
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
        />
      );
    
    case "SelectField":
      return (
        <Select value={value || ""} onValueChange={onChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {field.options?.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    
    case "DatePickerField":
      return (
        <Input
          type="date"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    
    case "NumberField":
      return (
        <Input
          type="number"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    
    default:
      return <p className="text-sm text-muted-foreground">Unknown field type: {field.component}</p>;
  }
}