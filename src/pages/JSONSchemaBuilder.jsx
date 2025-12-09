import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, Copy, X } from "lucide-react";
import { toast } from "sonner";

export default function JSONSchemaBuilder() {
  const [schemaName, setSchemaName] = useState("");
  const [fields, setFields] = useState([]);
  const [showAddDialog, setShowAddDialog] = useState(false);

  const addField = (field) => {
    setFields([...fields, { ...field, id: Date.now() }]);
    setShowAddDialog(false);
  };

  const removeField = (id) => {
    setFields(fields.filter(f => f.id !== id));
  };

  const generateSchema = () => {
    const properties = {};
    const required = [];

    fields.forEach(field => {
      const prop = { type: field.type };
      
      if (field.description) prop.description = field.description;
      if (field.format) prop.format = field.format;
      if (field.minLength) prop.minLength = parseInt(field.minLength);
      if (field.maxLength) prop.maxLength = parseInt(field.maxLength);
      if (field.default) prop.default = field.default;
      if (field.enum?.length > 0) prop.enum = field.enum;
      if (field.items) prop.items = field.items;
      if (field.properties) prop.properties = field.properties;

      properties[field.name] = prop;
      if (field.required) required.push(field.name);
    });

    return {
      name: schemaName,
      type: "object",
      properties,
      required
    };
  };

  const copyToClipboard = () => {
    const schema = generateSchema();
    navigator.clipboard.writeText(JSON.stringify(schema, null, 2));
    toast.success("Schema copied to clipboard");
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">JSON Schema Builder</h1>
        <p className="text-muted-foreground">Create JSON schemas for entities and data structures</p>
      </div>

      <Card className="p-6 mb-6">
        <Label>Schema Name</Label>
        <Input
          value={schemaName}
          onChange={(e) => setSchemaName(e.target.value)}
          placeholder="e.g., User, Product, Order"
          className="mt-2"
        />
      </Card>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Fields</h2>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Field
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <AddFieldDialog onAdd={addField} onClose={() => setShowAddDialog(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3 mb-6">
        {fields.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">
            No fields added yet. Click "Add Field" to get started.
          </Card>
        ) : (
          fields.map(field => (
            <Card key={field.id} className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{field.name}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary">{field.type}</span>
                    {field.required && (
                      <span className="text-xs px-2 py-0.5 rounded bg-destructive/10 text-destructive">Required</span>
                    )}
                  </div>
                  {field.description && (
                    <p className="text-sm text-muted-foreground">{field.description}</p>
                  )}
                  {field.enum && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Allowed: {field.enum.join(", ")}
                    </div>
                  )}
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeField(field.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold">Generated Schema</h3>
          <Button variant="outline" size="sm" onClick={copyToClipboard}>
            <Copy className="w-4 h-4 mr-2" />
            Copy
          </Button>
        </div>
        <pre className="bg-muted p-4 rounded text-xs overflow-x-auto">
          {JSON.stringify(generateSchema(), null, 2)}
        </pre>
      </Card>
    </div>
  );
}

function AddFieldDialog({ onAdd, onClose }) {
  const [fieldName, setFieldName] = useState("");
  const [description, setDescription] = useState("");
  const [fieldType, setFieldType] = useState("string");
  const [format, setFormat] = useState("");
  const [minLength, setMinLength] = useState("");
  const [maxLength, setMaxLength] = useState("");
  const [required, setRequired] = useState(false);
  const [allowedValues, setAllowedValues] = useState([]);
  const [newValue, setNewValue] = useState("");
  const [defaultValue, setDefaultValue] = useState("");
  const [examples, setExamples] = useState([]);
  const [newExample, setNewExample] = useState("");

  const handleAddValue = () => {
    if (newValue.trim()) {
      setAllowedValues([...allowedValues, newValue.trim()]);
      setNewValue("");
    }
  };

  const handleAddExample = () => {
    if (newExample.trim()) {
      setExamples([...examples, newExample.trim()]);
      setNewExample("");
    }
  };

  const handleSubmit = () => {
    if (!fieldName.trim()) {
      toast.error("Field name is required");
      return;
    }

    const field = {
      name: fieldName,
      type: fieldType,
      description,
      required
    };

    if (format) field.format = format;
    if (minLength) field.minLength = minLength;
    if (maxLength) field.maxLength = maxLength;
    if (allowedValues.length > 0) field.enum = allowedValues;
    if (defaultValue) field.default = defaultValue;
    if (examples.length > 0) field.examples = examples;

    if (fieldType === "array") {
      field.items = { type: "string" };
    }

    onAdd(field);
  };

  return (
    <div>
      <DialogHeader>
        <DialogTitle>Add New Field</DialogTitle>
        <p className="text-sm text-muted-foreground">Create a new field for your JSON schema</p>
      </DialogHeader>

      <div className="space-y-4 mt-6">
        <div>
          <Label>Field Name *</Label>
          <Input
            value={fieldName}
            onChange={(e) => setFieldName(e.target.value)}
            placeholder="e.g., firstName, age, isActive"
            className="mt-2"
          />
        </div>

        <div>
          <Label>Description</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the purpose of this field"
            className="mt-2"
          />
        </div>

        <div>
          <Label>Field Type</Label>
          <div className="grid grid-cols-2 gap-3 mt-2">
            {[
              { value: "string", label: "Text", desc: "For text values like names, addresses, descriptions" },
              { value: "number", label: "Number", desc: "For decimal numbers (e.g., 3.14, -10.5)" },
              { value: "integer", label: "Integer", desc: "For whole numbers only (e.g., 1, -5, 100)" },
              { value: "boolean", label: "Boolean", desc: "For true/false values" },
              { value: "enum", label: "Enum", desc: "For a fixed set of allowed values" },
              { value: "object", label: "Object", desc: "For grouping related fields together" },
              { value: "array", label: "List", desc: "For collections of items" },
            ].map(type => (
              <button
                key={type.value}
                onClick={() => setFieldType(type.value)}
                className={`p-3 border rounded-lg text-left transition-colors ${
                  fieldType === type.value 
                    ? "border-primary bg-primary/5" 
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="font-medium text-sm mb-1">{type.label}</div>
                <div className="text-xs text-muted-foreground">{type.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {fieldType === "string" && (
          <div>
            <Label>Format</Label>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Plain Text" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={null}>Plain Text</SelectItem>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="date-time">Date Time</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="uri">URL</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {(fieldType === "string" || fieldType === "number" || fieldType === "integer") && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Min Length</Label>
              <Input
                value={minLength}
                onChange={(e) => setMinLength(e.target.value)}
                placeholder="No minimum"
                type="number"
                className="mt-2"
              />
            </div>
            <div>
              <Label>Max Length</Label>
              <Input
                value={maxLength}
                onChange={(e) => setMaxLength(e.target.value)}
                placeholder="No maximum"
                type="number"
                className="mt-2"
              />
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          <Checkbox checked={required} onCheckedChange={setRequired} id="required" />
          <Label htmlFor="required" className="cursor-pointer">Required Field</Label>
        </div>

        {fieldType === "enum" && (
          <div>
            <Label>Allowed Values</Label>
            <div className="flex gap-2 mt-2">
              <Input
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                placeholder="Enter value"
                onKeyPress={(e) => e.key === "Enter" && handleAddValue()}
              />
              <Button type="button" onClick={handleAddValue}>Add</Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {allowedValues.map((val, idx) => (
                <span key={idx} className="px-2 py-1 bg-muted rounded text-sm flex items-center gap-1">
                  {val}
                  <button onClick={() => setAllowedValues(allowedValues.filter((_, i) => i !== idx))}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        <div>
          <Label>Default Value</Label>
          <Input
            value={defaultValue}
            onChange={(e) => setDefaultValue(e.target.value)}
            placeholder="Default text"
            className="mt-2"
          />
        </div>

        <div>
          <Label>Examples</Label>
          <div className="flex gap-2 mt-2">
            <Input
              value={newExample}
              onChange={(e) => setNewExample(e.target.value)}
              placeholder="Example text"
              onKeyPress={(e) => e.key === "Enter" && handleAddExample()}
            />
            <Button type="button" onClick={handleAddExample}>Add</Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {examples.map((ex, idx) => (
              <span key={idx} className="px-2 py-1 bg-muted rounded text-sm flex items-center gap-1">
                {ex}
                <button onClick={() => setExamples(examples.filter((_, i) => i !== idx))}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-6">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit}>Add Field</Button>
      </div>
    </div>
  );
}