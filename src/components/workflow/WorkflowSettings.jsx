import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Save, X, Plus } from "lucide-react";

export default function WorkflowSettings({ open, onOpenChange, workflow, onUpdate }) {
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    category: "project",
    triggerEntity: "",
    triggerEvent: "manual",
    estimatedDurationDays: null,
    isActive: true,
    tags: [],
  });
  const [newTag, setNewTag] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (workflow) {
      setFormData({
        name: workflow.name || "",
        code: workflow.code || "",
        description: workflow.description || "",
        category: workflow.category || "project",
        triggerEntity: workflow.triggerEntity || "",
        triggerEvent: workflow.triggerEvent || "manual",
        estimatedDurationDays: workflow.estimatedDurationDays || null,
        isActive: workflow.isActive !== false,
        tags: workflow.tags || [],
      });
    }
  }, [workflow]);

  const handleSave = async () => {
    setIsSaving(true);
    await onUpdate(formData);
    setIsSaving(false);
    onOpenChange(false);
  };

  const addTag = () => {
    if (newTag && !formData.tags.includes(newTag)) {
      setFormData({ ...formData, tags: [...formData.tags, newTag] });
      setNewTag("");
    }
  };

  const removeTag = (tag) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((t) => t !== tag),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Workflow Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Name</Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Code</Label>
              <Input
                value={formData.code}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    code: e.target.value.toLowerCase().replace(/\s+/g, "_"),
                  })
                }
              />
            </div>
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Category</Label>
              <Select
                value={formData.category}
                onValueChange={(v) => setFormData({ ...formData, category: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="project">Project</SelectItem>
                  <SelectItem value="manufacturing">Manufacturing</SelectItem>
                  <SelectItem value="installation">Installation</SelectItem>
                  <SelectItem value="service">Service</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Est. Duration (days)</Label>
              <Input
                type="number"
                value={formData.estimatedDurationDays || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    estimatedDurationDays: parseInt(e.target.value) || null,
                  })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Trigger Entity</Label>
              <Select
                value={formData.triggerEntity || "none"}
                onValueChange={(v) =>
                  setFormData({
                    ...formData,
                    triggerEntity: v === "none" ? "" : v,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="Enquiry">Enquiry</SelectItem>
                  <SelectItem value="Project">Project</SelectItem>
                  <SelectItem value="Customer">Customer</SelectItem>
                  <SelectItem value="PurchaseOrder">Purchase Order</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Trigger Event</Label>
              <Select
                value={formData.triggerEvent}
                onValueChange={(v) =>
                  setFormData({ ...formData, triggerEvent: v })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual Start</SelectItem>
                  <SelectItem value="on_create">On Create</SelectItem>
                  <SelectItem value="on_update">On Update</SelectItem>
                  <SelectItem value="on_status_change">On Status Change</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Tags</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add tag..."
                onKeyDown={(e) => e.key === "Enter" && addTag()}
              />
              <Button variant="outline" onClick={addTag}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-1">
              {formData.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="hover:text-[var(--color-destructive)]"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <Label>Active</Label>
            <Switch
              checked={formData.isActive}
              onCheckedChange={(v) => setFormData({ ...formData, isActive: v })}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={handleSave} disabled={isSaving} className="flex-1 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white">
              {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Settings
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}