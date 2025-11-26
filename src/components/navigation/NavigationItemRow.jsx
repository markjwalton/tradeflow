import React from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { GripVertical, Pencil, Trash2, Home, Settings, Users, FileText, LayoutDashboard, FolderOpen, ChevronRight, Folder } from "lucide-react";

const iconMap = {
  Home,
  Settings,
  Users,
  FileText,
  LayoutDashboard,
  FolderOpen,
  Dashboard: LayoutDashboard
};

export default function NavigationItemRow({ 
  item, 
  onEdit, 
  onDelete, 
  onToggleVisibility,
  dragHandleProps = {},
  depth = 0,
  parentName = null
}) {
  const IconComponent = item.icon ? iconMap[item.icon] : null;

  return (
    <div 
      className="flex items-center gap-3 p-3 bg-white border rounded-lg shadow-sm"
      style={{ marginLeft: depth * 24 }}
    >
      <div {...dragHandleProps} className="cursor-grab">
        <GripVertical className="h-5 w-5 text-gray-400" />
      </div>
      
      {depth > 0 && (
        <ChevronRight className="h-4 w-4 text-gray-300" />
      )}
      
      <div className="flex items-center gap-2 flex-1">
        {IconComponent ? (
          <IconComponent className="h-4 w-4 text-gray-500" />
        ) : item.item_type === "folder" ? (
          <Folder className="h-4 w-4 text-amber-500" />
        ) : null}
        <span className="font-medium">{item.name}</span>
        {item.item_type === "folder" ? (
          <Badge variant="outline" className="text-xs text-amber-600">Folder</Badge>
        ) : (
          <span className="text-sm text-gray-400">{item.page_url || item.page_slug}</span>
        )}
        {parentName && (
          <span className="text-xs text-gray-400">(child of {parentName})</span>
        )}
      </div>

      {item.roles?.length > 0 && (
        <div className="flex gap-1">
          {item.roles.map(role => (
            <Badge key={role} variant="outline" className="text-xs">{role}</Badge>
          ))}
        </div>
      )}

      <Switch
        checked={item.is_visible !== false}
        onCheckedChange={() => onToggleVisibility(item)}
      />

      <Button variant="ghost" size="icon" onClick={() => onEdit(item)}>
        <Pencil className="h-4 w-4" />
      </Button>

      <Button variant="ghost" size="icon" onClick={() => onDelete(item)}>
        <Trash2 className="h-4 w-4 text-red-500" />
      </Button>
    </div>
  );
}