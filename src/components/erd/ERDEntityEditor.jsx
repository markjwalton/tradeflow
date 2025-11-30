import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Loader2 } from "lucide-react";

const fieldTypes = ["string", "number", "boolean", "array", "object"];
const stringFormats = ["none", "date", "date-time", "email", "uri"];

export default function ERDEntityEditor({ entity, onSave, onCancel }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [fields, setFields] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (entity) {
      setName(entity.name || "");
      setDescription(entity.description || "");
      
      const props = entity.schema?.properties || {};
      const required = entity.schema?.required || [];
      const parsedFields = Object.entries(props).map(([fieldName, fieldDef]) => ({
        name: fieldName,
        type: fieldDef.type || "string",
        description: fieldDef.description || "",
        required: required.includes(fieldName),
        format: fieldDef.format || "none",
        enumValues: fieldDef.enum ? fieldDef.enum.join(", ") : "",
        default: fieldDef.default !== undefined ? String(fieldDef.default) : "",
      }));
      setFields(parsedFields.length > 0 ? parsedFields : [createEmptyField()]);
    } else {
      setFields([createEmptyField()]);
    }
  }, [entity]);

  const createEmptyField = () => ({
    name: "",
    type: "string",
    description: "",
    required: false,
    format: "none",
    enumValues: "",
    default: "",
  });

  const addField = () => {
    setFields([...fields, createEmptyField()]);
  };

  const updateField = (index, updates) => {
    const updated = [...fields];
    updated[index] = { ...updated[index], ...updates };
    setFields(updated);
  };

  const removeField = (index) => {
    if (fields.length > 1) {
      setFields(fields.filter((_, i) => i !== index));
    }
  };

  const handleSave = () => {
    if (!name.trim()) return;

    setIsSaving(true);

    const properties = {};
    const required = [];

    fields.forEach((field) => {
      if (!field.name.trim()) return;
      
      const fieldDef = {
        type: field.type,
        description: field.description,
      };
      
      if (field.format && field.format !== "none") {
        fieldDef.format = field.format;
      }
      
      if (field.enumValues.trim()) {
        fieldDef.enum = field.enumValues.split(",").map((v) => v.trim()).filter(Boolean);
      }
      
      if (field.default.trim()) {
        if (field.type === "number") {
          fieldDef.default = parseFloat(field.default);
        } else if (field.type === "boolean") {
          fieldDef.default = field.default === "true";
        } else {
          fieldDef.default = field.default;
        }
      }
      
      if (field.required) {
        required.push(field.name);
      }
      
      properties[field.name] = fieldDef;
    });

    const entityData = {
      name,
      description,
      category: entity?.category || "Custom",
      relationships: entity?.relationships || [],
      schema: {
        name,
        type: "object",
        properties,
        required,
      },
    };

    onSave(entityData);
    setIsSaving(false);
  };

  return (
    <div className="space-y-4">
      {/* Basic Info */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Entity Name *</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Customer, Order"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Description</label>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What this entity represents"
          />
        </div>
      </div>

      {/* Fields */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium">Fields</label>
          <Button size="sm" variant="outline" onClick={addField}>
            <Plus className="h-3 w-3 mr-1" />
            Add Field
          </Button>
        </div>
        <div className="space-y-2 max-h-64 overflow-auto">
          {fields.map((field, index) => (
            <div key={index} className="flex gap-2 items-start p-2 bg-gray-50 rounded-lg">
              <div className="flex-1 grid grid-cols-3 gap-2">
                <Input
                  value={field.name}
                  onChange={(e) => updateField(index, { name: e.target.value })}
                  placeholder="Field name"
                  className="h-8 text-sm"
                />
                <Select value={field.type} onValueChange={(v) => updateField(index, { type: v })}>
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {fieldTypes.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={field.required}
                    onCheckedChange={(c) => updateField(index, { required: c })}
                  />
                  <span className="text-xs text-gray-500">Required</span>
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="text-red-600 h-8 w-8 p-0"
                onClick={() => removeField(index)}
                disabled={fields.length === 1}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={handleSave} disabled={!name.trim() || isSaving}>
          {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Save Entity
        </Button>
      </div>
    </div>
  );
}