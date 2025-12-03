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
import { GripVertical, Pencil, Trash2, Copy, Home, Settings, Users, FileText, LayoutDashboard, FolderOpen, Folder, ShoppingCart, Mail, Calendar, Bell, Search, Heart, Star, Bookmark, Clock, Globe, Lock, Key, Shield, Zap, Database, Server, Code, Terminal, Cpu, Monitor, Smartphone, Tablet, Camera, Image, Video, Music, Mic, Phone, MessageSquare, Send, Inbox, Archive, Trash, Edit, PenTool, Layers, Grid, List, BarChart, PieChart, TrendingUp, DollarSign, CreditCard, Wallet, Gift, Tag, Package, Truck, MapPin, Navigation, Compass, Map, Flag, Award, Target, Crosshair, MoveRight, CornerDownRight, Power } from "lucide-react";

const iconMap = {
  Home, Settings, Users, FileText, LayoutDashboard, FolderOpen, 
  Dashboard: LayoutDashboard, ShoppingCart, Mail, Calendar, Bell, 
  Search, Heart, Star, Bookmark, Clock, Globe, Lock, Key, Shield, 
  Zap, Database, Server, Code, Terminal, Cpu, Monitor, Smartphone, 
  Tablet, Camera, Image, Video, Music, Mic, Phone, MessageSquare, 
  Send, Inbox, Archive, Trash, Edit, PenTool, Layers, Grid, List, 
  BarChart, PieChart, TrendingUp, DollarSign, CreditCard, Wallet, 
  Gift, Tag, Package, Truck, MapPin, Navigation, Compass, Map, 
  Flag, Award, Target, Crosshair
};

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
  const IconComponent = item.icon ? iconMap[item.icon] : null;

  const validParentOptions = parentOptions.filter(p => {
    if (p.id === item.id) return false;
    if (p.id === item.parent_id) return false;
    return true;
  });

  return (
    <div 
      className={`group flex items-center gap-3 p-3 bg-white border rounded-lg transition-all duration-150 ${
        isDragging ? "shadow-md ring-2 ring-blue-400 bg-blue-50" : "hover:bg-gray-50"
      }`}
    >
      <div {...dragHandleProps} className="cursor-grab opacity-0 group-hover:opacity-100 transition-opacity">
        <GripVertical className="h-5 w-5 text-gray-400" />
      </div>
      
      <div className="flex items-center gap-2 flex-1">
        {IconComponent ? (
          <IconComponent className="h-4 w-4 text-gray-500" />
        ) : item.item_type === "folder" ? (
          <Folder className="h-4 w-4 text-amber-500" />
        ) : null}
        <span className="font-medium">{item.name}</span>
        {item.item_type === "folder" && (
          <Badge variant="outline" className="text-xs text-amber-600 border-amber-300 bg-amber-50">Folder</Badge>
        )}
        {item.item_type === "folder" && item.default_collapsed && (
          <Badge variant="outline" className="text-xs text-gray-500">Collapsed</Badge>
        )}
      </div>

      {item.roles?.length > 0 && (
        <div className="flex gap-1">
          {item.roles.map(role => (
            <Badge key={role} variant="outline" className="text-xs">{role}</Badge>
          ))}
        </div>
      )}

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
                  {parent.depth > 0 ? '└─ ' : ''}{parent.name}
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
            <Power className="h-4 w-4 text-green-500" />
          </Button>
        )}

        <Button variant="ghost" size="icon" onClick={() => onDelete(item)} title="Delete">
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
      </div>

      <Switch
        checked={item.is_visible !== false}
        onCheckedChange={() => onToggleVisibility(item)}
        className={item.is_visible !== false ? "data-[state=checked]:bg-green-500" : "data-[state=unchecked]:bg-red-500"}
      />
    </div>
  );
}