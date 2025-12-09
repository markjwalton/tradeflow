import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";

const fieldTypes = ["string", "number", "boolean", "date", "datetime", "array", "object"];

export default function TemplateEntityEditor({ entity, onSave, onCancel }) {
  const [name, setName] = useState(entity?.name || "");
  const [description, setDescription] = useState(entity?.description || "");
  const [fields, setFields] = useState(() => {
    if (entity?.schema?.properties) {
      return Object.entries(entity.schema.properties).map(([key, val]) => ({
        name: key,
        type: val.type || "string",
        description: val.description || "",
        required: entity.schema.required?.includes(key) || false
      }));
    }
    return [];
  });

  const addField = () => {
    setFields([...fields, { name: "", type: "string", description: "", required: false }]);
  };

  const updateField = (index, updates) => {
    const updated = [...fields];
    updated[index] = { ...updated[index], ...updates };
    setFields(updated);
  };

  const handleSave = () => {
    const schema = {
      name,
      type: "object",
      properties: {},
      required: []
    };
    
    fields.forEach(field => {
      if (field.name.trim()) {
        schema.properties[field.name] = {
          type: field.type,
          description: field.description
        };
        if (field.required) {
          schema.required.push(field.name);
        }
      }
    });

    onSave({
      ...entity,
      name,
      description,
      schema
    });
  };

  return (
    <Dialog open={true} onOpenChange={() => onCancel()}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Edit Entity: {entity?.name}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Name</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Input value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Fields</label>
                <Button size="sm" variant="outline" onClick={addField}>
                  <Plus className="h-3 w-3 mr-1" />Add Field
                </Button>
              </div>
              <div className="space-y-2">
                {fields.map((field, idx) => (
                  <div key={idx} className="flex gap-2 items-center p-2 bg-muted rounded">
                    <Input
                      value={field.name}
                      onChange={(e) => updateField(idx, { name: e.target.value })}
                      placeholder="Field name"
                      className="flex-1"
                    />
                    <Select value={field.type} onValueChange={(v) => updateField(idx, { type: v })}>
                      <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {fieldTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Input
                      value={field.description}
                      onChange={(e) => updateField(idx, { description: e.target.value })}
                      placeholder="Description"
                      className="flex-1"
                    />
                    <Button size="icon" variant="ghost" className="text-destructive" onClick={() => setFields(fields.filter((_, i) => i !== idx))}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={onCancel}>Cancel</Button>
              <Button onClick={handleSave}>Save Changes</Button>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}