import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Save, Database, FileText } from "lucide-react";

const nodeTypes = [
  { value: "central", label: "Central Topic", color: "#3b82f6" },
  { value: "main_branch", label: "Main Branch", color: "#10b981" },
  { value: "sub_branch", label: "Sub Branch", color: "#f59e0b" },
  { value: "feature", label: "Feature", color: "#8b5cf6" },
  { value: "entity", label: "Entity", color: "#ec4899" },
  { value: "page", label: "Page", color: "#06b6d4" },
  { value: "note", label: "Note", color: "#84cc16" },
];

const categoryColors = {
  central: "bg-info-50 text-info",
  main_branch: "bg-success-50 text-success",
  sub_branch: "bg-warning/10 text-warning",
  feature: "bg-accent/10 text-accent",
  entity: "bg-accent-100 text-accent",
  page: "bg-info-50 text-info",
  note: "bg-success/10 text-success",
};

export default function NodeDetailPanel({ node, onUpdate, onClose, onEditEntity }) {
  const [text, setText] = useState("");
  const [nodeType, setNodeType] = useState("");
  const [specNotes, setSpecNotes] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (node) {
      setText(node.text || "");
      setNodeType(node.node_type || "sub_branch");
      setSpecNotes(node.specification_notes || "");
      setHasChanges(false);
    }
  }, [node?.id]);

  if (!node) return null;

  const handleChange = (field, value) => {
    if (field === "text") setText(value);
    if (field === "node_type") setNodeType(value);
    if (field === "specification_notes") setSpecNotes(value);
    setHasChanges(true);
  };

  const handleSave = () => {
    onUpdate(node.id, {
      text,
      node_type: nodeType,
      specification_notes: specNotes,
    });
    setHasChanges(false);
  };

  const typeConfig = nodeTypes.find(t => t.value === nodeType);

  return (
    <div className="w-80 bg-white border-l flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b bg-muted">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium text-sm">Node Details</span>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* Node Name */}
        <div>
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Name</label>
          <Input
            value={text}
            onChange={(e) => handleChange("text", e.target.value)}
            className="mt-1"
          />
        </div>

        {/* Node Type */}
        <div>
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Type</label>
          <Select value={nodeType} onValueChange={(v) => handleChange("node_type", v)}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {nodeTypes.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: type.color }} />
                    {type.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Type Badge */}
        <div>
          <Badge className={categoryColors[nodeType]}>{typeConfig?.label}</Badge>
          {node.template_id && (
            <Badge variant="outline" className="ml-2 text-xs">From Template</Badge>
          )}
        </div>

        {/* Specification Notes */}
        <div>
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Specification Notes
          </label>
          <Textarea
            value={specNotes}
            onChange={(e) => handleChange("specification_notes", e.target.value)}
            placeholder="Add detailed requirements, acceptance criteria, or implementation notes..."
            rows={8}
            className="mt-1 text-sm"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Document functional requirements for this node.
          </p>
        </div>

        {/* Entity Actions */}
        {nodeType === "entity" && (
          <Button
            variant="outline"
            className="w-full text-accent border-accent/20 hover:bg-accent/10"
            onClick={() => onEditEntity(node)}
          >
            <Database className="h-4 w-4 mr-2" />
            Edit Entity Schema
          </Button>
        )}
      </div>

      {/* Footer */}
      {hasChanges && (
        <div className="p-3 border-t bg-muted">
          <Button className="w-full" onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      )}
    </div>
  );
}