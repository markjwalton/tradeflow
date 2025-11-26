import React from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { GripVertical, Pencil, Trash2, Home, Settings, Users, FileText, LayoutDashboard, FolderOpen } from "lucide-react";

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
  dragHandleProps = {}
}) {
  const IconComponent = item.icon ? iconMap[item.icon] : null;

  return (
    <div className="flex items-center gap-3 p-3 bg-white border rounded-lg shadow-sm">
      <div {...dragHandleProps} className="cursor-grab">
        <GripVertical className="h-5 w-5 text-gray-400" />
      </div>
      
      <div className="flex items-center gap-2 flex-1">
        {IconComponent && <IconComponent className="h-4 w-4 text-gray-500" />}
        <span className="font-medium">{item.name}</span>
        <span className="text-sm text-gray-400">/{item.page_slug}</span>
      </div>

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