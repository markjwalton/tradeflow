import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Sparkles, Plus, Trash2, Link2, Database } from "lucide-react";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";

const fieldTypes = [
  { value: "string", label: "Text" },
  { value: "number", label: "Number" },
  { value: "boolean", label: "Yes/No" },
  { value: "date", label: "Date" },
  { value: "date-time", label: "Date & Time" },
  { value: "array", label: "List" },
  { value: "object", label: "Object" },
];

export default function EntityDetailDialog({
  open,
  onOpenChange,
  node,
  allNodes,
  connections,
  onUpdateNode,
  businessContext,
}) {
  const [entityName, setEntityName] = useState("");
  const [description, setDescription] = useState("");
  const [fields, setFields] = useState([]);
  const [relationships, setRelationships] = useState([]);
  const [isEnhancing, setIsEnhancing] = useState(false);

  // Initialize from node data
  useEffect(() => {
    if (node && open) {
      setEntityName(node.text || "");
      
      // Parse existing entity_schema if available
      if (node.entity_schema) {
        try {
          const schema = typeof node.entity_schema === "string" 
            ? JSON.parse(node.entity_schema) 
            : node.entity_schema;
          
          setDescription(schema.description || "");
          
          // Convert properties to fields array
          const props = schema.properties || {};
          const fieldList = Object.entries(props).map(([name, config]) => ({
            name,
            type: config.format || config.type || "string",
            description: config.description || "",
            required: schema.required?.includes(name) || false,
            isRelationship: config.description?.includes("Reference to") || false,
            relatedEntity: config.description?.match(/Reference to (\w+)/)?.[1] || "",
          }));
          setFields(fieldList);
          
          // Extract relationships
          const rels = fieldList
            .filter(f => f.isRelationship)
            .map(f => ({
              field: f.name,
              targetEntity: f.relatedEntity,
              type: "many-to-one",
            }));
          setRelationships(rels);
        } catch (e) {
          setFields([]);
          setRelationships([]);
        }
      } else {
        setDescription("");
        setFields([]);
        setRelationships([]);
      }
    }
  }, [node, open]);

  const handleAddField = () => {
    setFields([...fields, { 
      name: "", 
      type: "string", 
      description: "", 
      required: false,
      isRelationship: false,
      relatedEntity: "",
    }]);
  };

  const handleUpdateField = (index, key, value) => {
    const newFields = [...fields];
    newFields[index] = { ...newFields[index], [key]: value };
    
    // If marking as relationship, update related fields
    if (key === "isRelationship" && value) {
      newFields[index].type = "string";
    }
    
    setFields(newFields);
  };

  const handleRemoveField = (index) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const handleAIEnhance = async () => {
    setIsEnhancing(true);
    try {
      // Get other entity nodes for relationship context
      const otherEntities = allNodes
        .filter(n => n.node_type === "entity" && n.id !== node.id)
        .map(n => n.text);

      const prompt = `You are an expert database architect. Enhance this entity definition with detailed fields, proper types, and relationships.

ENTITY NAME: ${entityName}
BUSINESS CONTEXT: ${businessContext || "General business application"}

OTHER ENTITIES IN THE SYSTEM (for relationships):
${otherEntities.join(", ") || "None defined yet"}

CURRENT FIELDS:
${fields.length > 0 ? JSON.stringify(fields, null, 2) : "No fields defined yet"}

Generate a comprehensive entity schema with:
1. All necessary fields with appropriate types (string, number, boolean, date, date-time, array, object)
2. Clear descriptions for each field
3. Mark required fields
4. Identify relationships to other entities (use field names ending in _id for foreign keys)
5. Add common fields like status, priority, dates where appropriate
6. Consider validation needs (enums, formats, etc.)

Return JSON with this structure:
{
  "description": "What this entity represents",
  "fields": [
    {
      "name": "field_name",
      "type": "string|number|boolean|date|date-time|array|object",
      "description": "Field description",
      "required": true|false,
      "isRelationship": true|false,
      "relatedEntity": "EntityName or empty",
      "enum": ["option1", "option2"] // optional, for dropdowns
    }
  ],
  "suggestedRelationships": [
    {
      "field": "field_name",
      "targetEntity": "EntityName",
      "type": "many-to-one|one-to-many|many-to-many"
    }
  ]
}`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            description: { type: "string" },
            fields: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  type: { type: "string" },
                  description: { type: "string" },
                  required: { type: "boolean" },
                  isRelationship: { type: "boolean" },
                  relatedEntity: { type: "string" },
                  enum: { type: "array", items: { type: "string" } },
                }
              }
            },
            suggestedRelationships: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  field: { type: "string" },
                  targetEntity: { type: "string" },
                  type: { type: "string" },
                }
              }
            }
          }
        }
      });

      setDescription(result.description || "");
      setFields(result.fields || []);
      setRelationships(result.suggestedRelationships || []);
      toast.success("Entity enhanced with AI suggestions");
    } catch (error) {
      toast.error("Failed to enhance entity");
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleSave = () => {
    // Build schema object
    const properties = {};
    const required = [];

    fields.forEach(field => {
      const prop = {
        type: field.type === "date" || field.type === "date-time" ? "string" : field.type,
        description: field.isRelationship 
          ? `Reference to ${field.relatedEntity}` 
          : field.description,
      };
      
      if (field.type === "date") prop.format = "date";
      if (field.type === "date-time") prop.format = "date-time";
      if (field.enum?.length > 0) prop.enum = field.enum;
      
      properties[field.name] = prop;
      
      if (field.required) required.push(field.name);
    });

    const schema = {
      name: entityName,
      type: "object",
      description,
      properties,
      required,
    };

    onUpdateNode(node.id, {
      text: entityName,
      entity_schema: JSON.stringify(schema),
      entity_relationships: JSON.stringify(relationships),
    });

    toast.success("Entity saved");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Entity Details: {entityName || "New Entity"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Entity Name & Description */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Entity Name</label>
              <Input
                value={entityName}
                onChange={(e) => setEntityName(e.target.value)}
                placeholder="e.g., Order, Customer, Product"
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

          {/* AI Enhance Button */}
          <Button
            variant="outline"
            onClick={handleAIEnhance}
            disabled={isEnhancing || !entityName}
            className="w-full"
          >
            {isEnhancing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            {isEnhancing ? "Enhancing..." : "AI Enhance Fields"}
          </Button>

          {/* Fields */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Fields</label>
              <Button variant="outline" size="sm" onClick={handleAddField}>
                <Plus className="h-3 w-3 mr-1" />
                Add Field
              </Button>
            </div>
            
            <ScrollArea className="h-64 border rounded-lg p-2">
              <div className="space-y-2">
                {fields.map((field, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-start p-2 bg-gray-50 rounded">
                    <div className="col-span-3">
                      <Input
                        value={field.name}
                        onChange={(e) => handleUpdateField(index, "name", e.target.value)}
                        placeholder="field_name"
                        className="text-sm"
                      />
                    </div>
                    <div className="col-span-2">
                      <Select
                        value={field.type}
                        onValueChange={(v) => handleUpdateField(index, "type", v)}
                      >
                        <SelectTrigger className="text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {fieldTypes.map(t => (
                            <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-4">
                      <Input
                        value={field.description}
                        onChange={(e) => handleUpdateField(index, "description", e.target.value)}
                        placeholder="Description"
                        className="text-sm"
                      />
                    </div>
                    <div className="col-span-2 flex items-center gap-2">
                      <label className="flex items-center gap-1 text-xs">
                        <input
                          type="checkbox"
                          checked={field.required}
                          onChange={(e) => handleUpdateField(index, "required", e.target.checked)}
                        />
                        Req
                      </label>
                      <label className="flex items-center gap-1 text-xs">
                        <input
                          type="checkbox"
                          checked={field.isRelationship}
                          onChange={(e) => handleUpdateField(index, "isRelationship", e.target.checked)}
                        />
                        <Link2 className="h-3 w-3" />
                      </label>
                    </div>
                    <div className="col-span-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500"
                        onClick={() => handleRemoveField(index)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    {field.isRelationship && (
                      <div className="col-span-12 pl-2">
                        <Select
                          value={field.relatedEntity}
                          onValueChange={(v) => handleUpdateField(index, "relatedEntity", v)}
                        >
                          <SelectTrigger className="text-sm w-48">
                            <SelectValue placeholder="Related entity..." />
                          </SelectTrigger>
                          <SelectContent>
                            {allNodes
                              .filter(n => n.node_type === "entity" && n.id !== node?.id)
                              .map(n => (
                                <SelectItem key={n.id} value={n.text}>{n.text}</SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                ))}
                
                {fields.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No fields defined. Add fields manually or use AI Enhance.
                  </p>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Relationships Summary */}
          {relationships.length > 0 && (
            <div>
              <label className="text-sm font-medium">Relationships</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {relationships.map((rel, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    <Link2 className="h-3 w-3 mr-1" />
                    {rel.field} → {rel.targetEntity} ({rel.type})
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleSave} disabled={!entityName}>
              Save Entity
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}