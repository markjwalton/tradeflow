import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { getValueByBinding, setValueByBinding } from "./utils";

/**
 * Renders the project_editor_full pattern
 */
export default function ProjectEditorRenderer({ config, data, onAction }) {
  const [formData, setFormData] = useState(data || {});

  const handleFieldChange = (binding, value) => {
    setFormData(prev => setValueByBinding(prev, binding, value));
  };

  const handlePrimaryAction = () => {
    if (onAction && config.actions?.primary?.actionId) {
      onAction(config.actions.primary.actionId, formData);
    }
  };

  const handleSecondaryAction = (action) => {
    if (onAction && action.actionId) {
      onAction(action.actionId, formData);
    }
  };

  const isTwoColumn = config.layout === "twoColumn";

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
          {config.pageHeader.title}
        </h1>
        {config.pageHeader.subtitle && (
          <p className="text-muted-foreground">{config.pageHeader.subtitle}</p>
        )}
      </div>

      {/* Form Sections */}
      <div className="space-y-6">
        {(config.sections || []).map((section) => (
          <Card key={section.id}>
            <CardHeader>
              <CardTitle>{section.title}</CardTitle>
              {section.description && (
                <p className="text-sm text-muted-foreground">{section.description}</p>
              )}
            </CardHeader>
            <CardContent>
              <div className={`grid ${isTwoColumn ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"} gap-4`}>
                {(section.fields || []).map(field => (
                  <div key={field.id} className={field.component === "TextAreaField" ? "md:col-span-2" : ""}>
                    <label className="text-sm font-medium mb-1 block">
                      {field.label}
                      {field.required && <span className="text-destructive ml-1">*</span>}
                    </label>
                    <FieldComponent
                      field={field}
                      value={getValueByBinding(formData, field.binding)}
                      onChange={(value) => handleFieldChange(field.binding, value)}
                    />
                    {field.helpText && (
                      <p className="text-xs text-muted-foreground mt-1">{field.helpText}</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Actions */}
      <div className="mt-8 flex gap-3 justify-end">
        {(config.actions?.secondary || []).map((action, idx) => (
          <Button
            key={idx}
            variant={action.variant || "secondary"}
            onClick={() => handleSecondaryAction(action)}
          >
            {action.label}
          </Button>
        ))}
        {config.actions?.primary && (
          <Button onClick={handlePrimaryAction}>
            {config.actions.primary.label}
          </Button>
        )}
      </div>
    </div>
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
            <SelectValue placeholder={`Select ${field.label.toLowerCase()}...`} />
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
    
    case "CheckboxField":
      return (
        <div className="flex items-center gap-2">
          <Checkbox
            checked={value || false}
            onCheckedChange={onChange}
          />
          <span className="text-sm">{field.label}</span>
        </div>
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
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        />
      );
    
    default:
      return <p className="text-sm text-muted-foreground">Unknown field type: {field.component}</p>;
  }
}