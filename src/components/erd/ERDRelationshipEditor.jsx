import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowRight } from "lucide-react";

export default function ERDRelationshipEditor({
  sourceEntity,
  targetEntity,
  onSave,
  onCancel,
}) {
  const [relationshipType, setRelationshipType] = useState("one-to-many");
  const [fieldName, setFieldName] = useState(
    `${targetEntity.name.toLowerCase()}_id`
  );

  const handleSave = () => {
    if (!fieldName.trim()) return;
    
    onSave(sourceEntity.id, {
      target_entity: targetEntity.name,
      relationship_type: relationshipType,
      field_name: fieldName,
    });
  };

  return (
    <div className="space-y-4">
      {/* Visual representation */}
      <div className="flex items-center justify-center gap-4 p-4 bg-slate-50 rounded-lg">
        <Badge variant="outline" className="text-base px-3 py-1">
          {sourceEntity.name}
        </Badge>
        <ArrowRight className="h-5 w-5 text-indigo-500" />
        <Badge variant="outline" className="text-base px-3 py-1">
          {targetEntity.name}
        </Badge>
      </div>

      {/* Relationship type */}
      <div>
        <label className="text-sm font-medium">Relationship Type</label>
        <Select value={relationshipType} onValueChange={setRelationshipType}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="one-to-one">
              One to One (1:1)
            </SelectItem>
            <SelectItem value="one-to-many">
              One to Many (1:N)
            </SelectItem>
            <SelectItem value="many-to-many">
              Many to Many (N:N)
            </SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-gray-500 mt-1">
          {relationshipType === "one-to-one" && "Each record in source relates to exactly one record in target"}
          {relationshipType === "one-to-many" && "Each record in source can relate to multiple records in target"}
          {relationshipType === "many-to-many" && "Multiple records can relate to multiple records"}
        </p>
      </div>

      {/* Field name */}
      <div>
        <label className="text-sm font-medium">Field Name (Foreign Key)</label>
        <Input
          value={fieldName}
          onChange={(e) => setFieldName(e.target.value)}
          placeholder="e.g., customer_id"
        />
        <p className="text-xs text-gray-500 mt-1">
          This field will be added to {sourceEntity.name} to reference {targetEntity.name}
        </p>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={handleSave} disabled={!fieldName.trim()}>
          Create Relationship
        </Button>
      </div>
    </div>
  );
}