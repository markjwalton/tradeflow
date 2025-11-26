import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export default function NavigationItemForm({ 
  isOpen, 
  onClose, 
  onSubmit, 
  item = null,
  parentOptions = []
}) {
  const [formData, setFormData] = React.useState({
    name: "",
    page_slug: "",
    icon: "",
    is_visible: true,
    parent_id: "",
    roles: []
  });

  React.useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || "",
        page_slug: item.page_slug || "",
        icon: item.icon || "",
        is_visible: item.is_visible !== false,
        parent_id: item.parent_id || "",
        roles: item.roles || []
      });
    } else {
      setFormData({
        name: "",
        page_slug: "",
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
          
          <div className="space-y-2">
            <Label htmlFor="page_slug">Page Slug</Label>
            <Input
              id="page_slug"
              value={formData.page_slug}
              onChange={(e) => setFormData({ ...formData, page_slug: e.target.value })}
              placeholder="dashboard"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="icon">Icon (Lucide icon name)</Label>
            <Input
              id="icon"
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              placeholder="Home"
            />
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