import React from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Link, Unlink, ZoomIn, ZoomOut, FileText } from "lucide-react";

const nodeTypes = [
  { value: "central", label: "Central Topic" },
  { value: "main_branch", label: "Main Branch" },
  { value: "sub_branch", label: "Sub Branch" },
  { value: "feature", label: "Feature" },
  { value: "entity", label: "Entity" },
  { value: "page", label: "Page" },
  { value: "note", label: "Note" },
];

const colors = [
  { value: "#3b82f6", label: "Blue" },
  { value: "#10b981", label: "Green" },
  { value: "#f59e0b", label: "Amber" },
  { value: "#ef4444", label: "Red" },
  { value: "#8b5cf6", label: "Purple" },
  { value: "#ec4899", label: "Pink" },
  { value: "#06b6d4", label: "Cyan" },
  { value: "#84cc16", label: "Lime" },
];

export default function MindMapToolbar({
  onAddNode,
  onDeleteSelected,
  onStartConnection,
  onShowBusinessContext,
  isConnecting,
  hasSelection,
  selectedNodeType,
  onChangeNodeType,
  selectedColor,
  onChangeColor,
}) {
  return (
    <div className="flex items-center gap-2 p-2 bg-white border-b">
      <Button size="sm" onClick={onAddNode}>
        <Plus className="h-4 w-4 mr-1" />
        Add Node
      </Button>

      <Button
        size="sm"
        variant={isConnecting ? "default" : "outline"}
        onClick={onStartConnection}
      >
        <Link className="h-4 w-4 mr-1" />
        {isConnecting ? "Click Target" : "Connect"}
      </Button>

      <Button
        size="sm"
        variant="outline"
        onClick={onDeleteSelected}
        disabled={!hasSelection}
      >
        <Trash2 className="h-4 w-4 mr-1" />
        Delete
      </Button>

      <div className="w-px h-6 bg-gray-200 mx-2" />

      <Select value={selectedNodeType || ""} onValueChange={onChangeNodeType} disabled={!hasSelection}>
        <SelectTrigger className="w-36 h-8">
          <SelectValue placeholder="Node Type" />
        </SelectTrigger>
        <SelectContent>
          {nodeTypes.map((type) => (
            <SelectItem key={type.value} value={type.value}>
              {type.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={selectedColor || ""} onValueChange={onChangeColor} disabled={!hasSelection}>
        <SelectTrigger className="w-28 h-8">
          <SelectValue placeholder="Color" />
        </SelectTrigger>
        <SelectContent>
          {colors.map((color) => (
            <SelectItem key={color.value} value={color.value}>
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: color.value }}
                />
                {color.label}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex-1" />

      <Button size="sm" variant="outline" onClick={onShowBusinessContext}>
        <FileText className="h-4 w-4 mr-1" />
        Business Context
      </Button>
    </div>
  );
}