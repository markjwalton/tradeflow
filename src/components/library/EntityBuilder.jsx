import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, GripVertical, Loader2 } from "lucide-react";

const categories = ["Core", "CRM", "Finance", "Operations", "HR", "Inventory", "Communication", "Other"];
const fieldTypes = ["string", "number", "boolean", "array", "object"];
const stringFormats = ["none", "date", "date-time", "email", "uri"];

const defaultGroups = [
  "Workflow System",
  "Appointments",
  "Forms & Checklists",
  "Templates",
  "CRM & Sales",
  "Project Management",
  "Documents",
  "Other"
];

export default function EntityBuilder({ initialData, onSave, onCancel, isSaving }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Other");
  const [group, setGroup] = useState("");
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [fields, setFields] = useState([]);
  const [relationships, setRelationships] = useState([]);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setDescription(initialData.description || "");
      setCategory(initialData.category || "Other");
      setGroup(initialData.group || "");
      setTags(initialData.tags || []);
      setRelationships(initialData.relationships || []);
      
      // Parse schema properties into fields
      const props = initialData.schema?.properties || {};
      const required = initialData.schema?.required || [];
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
  }, [initialData]);

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

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tag) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const addRelationship = () => {
    setRelationships([...relationships, { target_entity: "", relationship_type: "one-to-many", field_name: "" }]);
  };

  const updateRelationship = (index, updates) => {
    const updated = [...relationships];
    updated[index] = { ...updated[index], ...updates };
    setRelationships(updated);
  };

  const removeRelationship = (index) => {
    setRelationships(relationships.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!name.trim()) return;

    // Build schema from fields
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
      category,
      group: group || null,
      tags,
      relationships: relationships.filter((r) => r.target_entity.trim()),
      schema: {
        name,
        type: "object",
        properties,
        required,
      },
    };

    onSave(entityData);
  };

  return (
    <ScrollArea className="flex-1 -mx-6 px-6">
      <div className="space-y-6 pb-4">
        {/* Basic Info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Entity Name *</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Customer, Invoice, Project"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Category</label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">Group</label>
          <Select value={group} onValueChange={setGroup}>
            <SelectTrigger>
              <SelectValue placeholder="Select a group..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={null}>No Group</SelectItem>
              {defaultGroups.map((g) => (
                <SelectItem key={g} value={g}>{g}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500 mt-1">Group related entities together within a category</p>
        </div>

        <div>
          <label className="text-sm font-medium">Description</label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what this entity represents..."
            rows={2}
          />
        </div>

        {/* Tags */}
        <div>
          <label className="text-sm font-medium">Tags</label>
          <div className="flex gap-2 mt-1">
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="Add tag..."
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
              className="flex-1"
            />
            <Button type="button" variant="outline" onClick={addTag}>Add</Button>
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="gap-1">
                {tag}
                <button onClick={() => removeTag(tag)} className="hover:text-red-600">×</button>
              </Badge>
            ))}
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
          <div className="space-y-2">
            {fields.map((field, index) => (
              <div key={index} className="flex gap-2 items-start p-3 bg-gray-50 rounded-lg">
                <div className="flex-1 grid grid-cols-4 gap-2">
                  <Input
                    value={field.name}
                    onChange={(e) => updateField(index, { name: e.target.value })}
                    placeholder="Field name"
                  />
                  <Select value={field.type} onValueChange={(v) => updateField(index, { type: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {fieldTypes.map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    value={field.description}
                    onChange={(e) => updateField(index, { description: e.target.value })}
                    placeholder="Description"
                  />
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
                  className="text-red-600"
                  onClick={() => removeField(index)}
                  disabled={fields.length === 1}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Relationships */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium">Relationships</label>
            <Button size="sm" variant="outline" onClick={addRelationship}>
              <Plus className="h-3 w-3 mr-1" />
              Add Relationship
            </Button>
          </div>
          {relationships.length > 0 ? (
            <div className="space-y-2">
              {relationships.map((rel, index) => (
                <div key={index} className="flex gap-2 items-center p-3 bg-gray-50 rounded-lg">
                  <Input
                    value={rel.target_entity}
                    onChange={(e) => updateRelationship(index, { target_entity: e.target.value })}
                    placeholder="Target entity"
                    className="flex-1"
                  />
                  <Select
                    value={rel.relationship_type}
                    onValueChange={(v) => updateRelationship(index, { relationship_type: v })}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="one-to-one">One to One</SelectItem>
                      <SelectItem value="one-to-many">One to Many</SelectItem>
                      <SelectItem value="many-to-many">Many to Many</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    value={rel.field_name}
                    onChange={(e) => updateRelationship(index, { field_name: e.target.value })}
                    placeholder="Field name (e.g., customer_id)"
                    className="flex-1"
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-600"
                    onClick={() => removeRelationship(index)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No relationships defined</p>
          )}
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
    </ScrollArea>
  );
}