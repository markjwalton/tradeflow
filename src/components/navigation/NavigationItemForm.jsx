import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { X, Home, Settings, Users, FileText, LayoutDashboard, FolderOpen, ShoppingCart, Mail, Calendar, Bell, Search, Heart, Star, Bookmark, Clock, Globe, Lock, Key, Shield, Zap, Database, Server, Code, Terminal, Cpu, Monitor, Smartphone, Tablet, Camera, Image, Video, Music, Mic, Phone, MessageSquare, Send, Inbox, Archive, Trash, Edit, PenTool, Layers, Grid, List, BarChart, PieChart, TrendingUp, DollarSign, CreditCard, Wallet, Gift, Tag, Package, Truck, MapPin, Navigation, Compass, Map, Flag, Award, Target, Crosshair } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const iconOptions = [
  { name: "Home", icon: Home },
  { name: "Settings", icon: Settings },
  { name: "Users", icon: Users },
  { name: "FileText", icon: FileText },
  { name: "LayoutDashboard", icon: LayoutDashboard },
  { name: "FolderOpen", icon: FolderOpen },
  { name: "ShoppingCart", icon: ShoppingCart },
  { name: "Mail", icon: Mail },
  { name: "Calendar", icon: Calendar },
  { name: "Bell", icon: Bell },
  { name: "Search", icon: Search },
  { name: "Heart", icon: Heart },
  { name: "Star", icon: Star },
  { name: "Bookmark", icon: Bookmark },
  { name: "Clock", icon: Clock },
  { name: "Globe", icon: Globe },
  { name: "Lock", icon: Lock },
  { name: "Key", icon: Key },
  { name: "Shield", icon: Shield },
  { name: "Zap", icon: Zap },
  { name: "Database", icon: Database },
  { name: "Server", icon: Server },
  { name: "Code", icon: Code },
  { name: "Terminal", icon: Terminal },
  { name: "Cpu", icon: Cpu },
  { name: "Monitor", icon: Monitor },
  { name: "Smartphone", icon: Smartphone },
  { name: "Tablet", icon: Tablet },
  { name: "Camera", icon: Camera },
  { name: "Image", icon: Image },
  { name: "Video", icon: Video },
  { name: "Music", icon: Music },
  { name: "Mic", icon: Mic },
  { name: "Phone", icon: Phone },
  { name: "MessageSquare", icon: MessageSquare },
  { name: "Send", icon: Send },
  { name: "Inbox", icon: Inbox },
  { name: "Archive", icon: Archive },
  { name: "Trash", icon: Trash },
  { name: "Edit", icon: Edit },
  { name: "PenTool", icon: PenTool },
  { name: "Layers", icon: Layers },
  { name: "Grid", icon: Grid },
  { name: "List", icon: List },
  { name: "BarChart", icon: BarChart },
  { name: "PieChart", icon: PieChart },
  { name: "TrendingUp", icon: TrendingUp },
  { name: "DollarSign", icon: DollarSign },
  { name: "CreditCard", icon: CreditCard },
  { name: "Wallet", icon: Wallet },
  { name: "Gift", icon: Gift },
  { name: "Tag", icon: Tag },
  { name: "Package", icon: Package },
  { name: "Truck", icon: Truck },
  { name: "MapPin", icon: MapPin },
  { name: "Navigation", icon: Navigation },
  { name: "Compass", icon: Compass },
  { name: "Map", icon: Map },
  { name: "Flag", icon: Flag },
  { name: "Award", icon: Award },
  { name: "Target", icon: Target },
  { name: "Crosshair", icon: Crosshair },
];

export default function NavigationItemForm({ 
  isOpen, 
  onClose, 
  onSubmit, 
  item = null,
  parentOptions = [],
  tenantId = "__global__"
}) {
  // Fetch roles for this tenant + global roles
  const { data: tenantRoles = [] } = useQuery({
    queryKey: ["tenantRoles", tenantId],
    queryFn: () => base44.entities.TenantRole.filter({ tenant_id: tenantId }),
    enabled: isOpen,
  });

  const { data: globalRoles = [] } = useQuery({
    queryKey: ["tenantRoles", "__global__"],
    queryFn: () => base44.entities.TenantRole.filter({ tenant_id: "__global__" }),
    enabled: isOpen && tenantId !== "__global__",
  });

  // Fetch page templates for dropdown
  const { data: pageTemplates = [] } = useQuery({
    queryKey: ["pageTemplates"],
    queryFn: () => base44.entities.PageTemplate.list("name"),
    enabled: isOpen,
  });

  // Combine roles, tenant-specific first
  const availableRoles = tenantId === "__global__" 
    ? tenantRoles 
    : [...tenantRoles, ...globalRoles.filter(gr => !tenantRoles.some(tr => tr.name === gr.name))];
  const [formData, setFormData] = React.useState({
    name: "",
    item_type: "page",
    page_url: "",
    icon: "",
    is_visible: true,
    parent_id: "",
    roles: []
  });

  React.useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || "",
        item_type: item.item_type || (item.page_slug || item.page_url ? "page" : "folder"),
        page_url: item.page_url || item.page_slug || "",
        icon: item.icon || "",
        is_visible: item.is_visible !== false,
        parent_id: item.parent_id || "",
        roles: item.roles || []
      });
    } else {
      setFormData({
        name: "",
        item_type: "page",
        page_url: "",
        icon: "",
        is_visible: true,
        parent_id: "",
        roles: []
      });
    }
  }, [item, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{item ? "Edit Navigation Item" : "Add Navigation Item"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Dashboard"
              required
            />
          </div>
          
          {/* Type Selection */}
          <div className="space-y-2">
            <Label>Type</Label>
            <Select 
              value={formData.item_type} 
              onValueChange={(val) => setFormData({ ...formData, item_type: val })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="page">Page (has URL)</SelectItem>
                <SelectItem value="folder">Folder (container only)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.item_type === "page" && (
            <div className="space-y-2">
              <Label htmlFor="page_url">Page Slug *</Label>
              <Select 
                value={formData.page_url} 
                onValueChange={(val) => setFormData({ ...formData, page_url: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a page..." />
                </SelectTrigger>
                <SelectContent>
                  {pageTemplates.map((page) => (
                    <SelectItem key={page.id} value={page.name}>
                      {page.name}
                      {page.category && <span className="text-gray-400 ml-2">({page.category})</span>}
                    </SelectItem>
                  ))}
                  <SelectItem value="__custom__">Custom URL...</SelectItem>
                </SelectContent>
              </Select>
              {formData.page_url === "__custom__" && (
                <Input
                  placeholder="/custom-page-url"
                  onChange={(e) => setFormData({ ...formData, page_url: e.target.value })}
                  className="mt-2"
                />
              )}
            </div>
          )}
          
          <div className="space-y-2">
            <Label>Icon</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start gap-2">
                  {formData.icon ? (
                    <>
                      {(() => {
                        const IconComp = iconOptions.find(i => i.name === formData.icon)?.icon;
                        return IconComp ? <IconComp className="h-4 w-4" /> : null;
                      })()}
                      {formData.icon}
                    </>
                  ) : (
                    <span className="text-gray-500">Select an icon...</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-2" align="start">
                <div className="grid grid-cols-8 gap-1 max-h-48 overflow-y-auto">
                  {iconOptions.map(({ name, icon: IconComp }) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => setFormData({ ...formData, icon: name })}
                      className={`p-2 rounded hover:bg-gray-100 transition-colors ${
                        formData.icon === name ? 'bg-blue-100 ring-1 ring-blue-400' : ''
                      }`}
                      title={name}
                    >
                      <IconComp className="h-4 w-4" />
                    </button>
                  ))}
                </div>
                {formData.icon && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full mt-2 text-gray-500"
                    onClick={() => setFormData({ ...formData, icon: '' })}
                  >
                    Clear icon
                  </Button>
                )}
              </PopoverContent>
            </Popover>
          </div>

          {/* Parent Selection - supports up to 2 levels of nesting */}
          <div className="space-y-2">
            <Label>Parent Item (optional, up to 2 levels deep)</Label>
            <Select 
              value={formData.parent_id || "none"} 
              onValueChange={(val) => setFormData({ ...formData, parent_id: val === "none" ? "" : val })}
            >
              <SelectTrigger>
                <SelectValue placeholder="No parent (top level)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No parent (top level)</SelectItem>
                {parentOptions
                  .filter(p => p.id !== item?.id)
                  .map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.depth > 0 ? "└─ " : ""}{p.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">Items can be nested up to 2 levels deep</p>
          </div>

          {/* Roles */}
          <div className="space-y-2">
            <Label>Roles (leave empty for all users)</Label>
            {availableRoles.length > 0 ? (
              <div className="border rounded-md p-3 space-y-2 max-h-40 overflow-y-auto">
                {availableRoles.map((role) => (
                  <div key={role.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`role-${role.id}`}
                      checked={formData.roles.includes(role.name)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFormData({ ...formData, roles: [...formData.roles, role.name] });
                        } else {
                          setFormData({ ...formData, roles: formData.roles.filter(r => r !== role.name) });
                        }
                      }}
                    />
                    <label htmlFor={`role-${role.id}`} className="text-sm cursor-pointer flex-1">
                      {role.name}
                      {role.description && (
                        <span className="text-gray-400 ml-1">— {role.description}</span>
                      )}
                    </label>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">
                No roles defined. Add roles in Tenant Manager first.
              </p>
            )}
            {formData.roles.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {formData.roles.map((role) => (
                  <Badge key={role} variant="secondary" className="gap-1">
                    {role}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => setFormData({ 
                        ...formData, 
                        roles: formData.roles.filter(r => r !== role) 
                      })}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="is_visible">Visible</Label>
            <Switch
              id="is_visible"
              checked={formData.is_visible}
              onCheckedChange={(checked) => setFormData({ ...formData, is_visible: checked })}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {item ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}