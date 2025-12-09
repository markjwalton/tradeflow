import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Settings } from "lucide-react";
import { getValueByBinding, setValueByBinding } from "./utils";
import LayoutConfigEditor from "./LayoutConfigEditor";

/**
 * Renders the project_editor_full pattern
 */
export default function ProjectEditorRenderer({ config, data, onAction }) {
  const [formData, setFormData] = useState(data || {});
  const [openSections, setOpenSections] = useState(
    new Set((config.sections || []).filter(s => s.defaultOpen !== false).map(s => s.id))
  );
  const [configEditorOpen, setConfigEditorOpen] = useState(false);
  const [currentConfig, setCurrentConfig] = useState(config);

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

  const handleConfigSave = (newConfig) => {
    setCurrentConfig(newConfig);
    if (onAction) {
      onAction("config.update", { config: newConfig });
    }
  };

  const isTwoColumn = currentConfig.layout === "twoColumn";

  const toggleSection = (sectionId) => {
    setOpenSections(prev => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
            {currentConfig.pageHeader.title}
          </h1>
          {currentConfig.pageHeader.subtitle && (
            <p className="text-muted-foreground">{currentConfig.pageHeader.subtitle}</p>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={() => setConfigEditorOpen(true)}>
          <Settings className="h-4 w-4 mr-2" />
          Configure Layout
        </Button>
      </div>

      {/* Form Sections */}
      <div className="space-y-4">
        {(config.sections || []).map((section) => (
          <Collapsible
            key={section.id}
            open={openSections.has(section.id)}
            onOpenChange={() => toggleSection(section.id)}
          >
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{section.title}</CardTitle>
                      {section.description && (
                        <CardDescription className="mt-1">{section.description}</CardDescription>
                      )}
                    </div>
                    <ChevronDown
                      className={`h-5 w-5 text-muted-foreground transition-transform ${
                        openSections.has(section.id) ? "transform rotate-180" : ""
                      }`}
                    />
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-4">
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
              </CollapsibleContent>
            </Card>
          </Collapsible>
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
    case "DateField":
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