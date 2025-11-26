import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
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

export default function NavigationItemForm({ 
  isOpen, 
  onClose, 
  onSubmit, 
  item = null,
  parentOptions = []
}) {
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
              <Label htmlFor="page_url">Page URL</Label>
              <Input
                id="page_url"
                value={formData.page_url}
                onChange={(e) => setFormData({ ...formData, page_url: e.target.value })}
                placeholder="/dashboard or /settings/profile"
                required
              />
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="icon">Icon (Lucide icon name)</Label>
            <Input
              id="icon"
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              placeholder="Home"
            />
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
            <Label>Roles (leave empty for all)</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Add role (e.g. admin)"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    const role = e.target.value.trim();
                    if (role && !formData.roles.includes(role)) {
                      setFormData({ ...formData, roles: [...formData.roles, role] });
                      e.target.value = "";
                    }
                  }
                }}
              />
            </div>
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