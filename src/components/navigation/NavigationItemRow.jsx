import React from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { 
  GripVertical, 
  Pencil, 
  Trash2, 
  Copy, 
  Folder,
  MoveRight, 
  CornerDownRight, 
  Power 
} from "lucide-react";
import { getIconByName } from "./NavIconMap";

export default function NavigationItemRow({ 
  item, 
  onEdit, 
  onDelete, 
  onToggleVisibility,
  onMoveToParent,
  onDuplicate,
  onUnallocate,
  parentOptions = [],
  dragHandleProps = {},
  depth = 0,
  isDragging = false
}) {
  const IconComponent = item.icon ? getIconByName(item.icon) : null;

  const validParentOptions = parentOptions.filter(p => {
    if (p.id === item.id) return false;
    if (p.id === item.parent_id) return false;
    return true;
  });

  return (
    <div className={`draggable-item group ${isDragging ? "dragging" : ""}`}>
      <div {...dragHandleProps} className="drag-handle">
        <GripVertical className="h-5 w-5" />
      </div>
      
      <div className="flex items-center gap-2 flex-1">
        {IconComponent ? (
          <IconComponent className="h-4 w-4 text-muted-foreground" />
        ) : item.item_type === "folder" ? (
          <Folder className="h-4 w-4 text-secondary-500" />
        ) : null}
        <span className="text-title">{item.name}</span>
        {item.item_type === "folder" && (
          <Badge variant="outline" className="text-xs text-secondary-600 border-secondary-300 bg-secondary-50">Folder</Badge>
        )}
        {item.item_type === "folder" && item.default_collapsed && (
          <Badge variant="outline" className="text-xs text-muted-foreground">Collapsed</Badge>
        )}
      </div>

      {item.roles?.length > 0 && (
        <div className="flex gap-1">
          {item.roles.map(role => (
            <Badge key={role} variant="outline" className="text-xs">{role}</Badge>
          ))}
        </div>
      )}

      <div className="action-buttons">
        {onMoveToParent && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" title="Move to...">
                <MoveRight className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem 
                onClick={() => onMoveToParent(item, null)}
                disabled={!item.parent_id}
                className="gap-2"
              >
                <CornerDownRight className="h-4 w-4 rotate-180" />
                Move to top level
              </DropdownMenuItem>
              {validParentOptions.length > 0 && <DropdownMenuSeparator />}
              {validParentOptions.map(parent => (
                <DropdownMenuItem 
                  key={parent.id}
                  onClick={() => onMoveToParent(item, parent.id)}
                  className="gap-2"
                >
                  <CornerDownRight className="h-4 w-4" />
                  {parent.depth > 0 ? '└─ ' : ''}{parent.name || 'Unnamed'}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {onDuplicate && (
          <Button variant="ghost" size="icon" onClick={onDuplicate} title="Duplicate">
            <Copy className="h-4 w-4" />
          </Button>
        )}

        <Button variant="ghost" size="icon" onClick={() => onEdit(item)} title="Edit">
          <Pencil className="h-4 w-4" />
        </Button>

        {onUnallocate && (
          <Button variant="ghost" size="icon" onClick={() => onUnallocate(item)} title="Remove from navigation">
            <Power className="h-4 w-4 text-success" />
          </Button>
        )}

        <Button variant="ghost" size="icon" onClick={() => onDelete(item)} title="Delete">
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>

      <Switch
        checked={item.is_visible !== false}
        onCheckedChange={() => onToggleVisibility(item)}
        className={item.is_visible !== false ? "data-[state=checked]:bg-success" : "data-[state=unchecked]:bg-destructive"}
      />
    </div>
  );
}