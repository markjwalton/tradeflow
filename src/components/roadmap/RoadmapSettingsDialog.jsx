import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Loader2, GripVertical } from "lucide-react";
import { toast } from "sonner";

const defaultSettings = {
  categories: [
    { value: "idea", label: "Idea" },
    { value: "requirement", label: "Requirement" },
    { value: "feature", label: "Feature" },
    { value: "improvement", label: "Improvement" },
    { value: "bug_fix", label: "Bug Fix" },
    { value: "discussion_note", label: "Discussion Note" },
  ],
  statuses: [
    { value: "backlog", label: "Backlog", tab: "roadmap" },
    { value: "on_hold", label: "On Hold", tab: "roadmap" },
    { value: "planned", label: "Planned", tab: "development" },
    { value: "ai_review", label: "AI Review", tab: "development" },
    { value: "ready", label: "Ready", tab: "development" },
    { value: "in_sprint", label: "In Sprint", tab: "development" },
    { value: "in_progress", label: "In Progress", tab: "development" },
    { value: "testing", label: "Testing", tab: "development" },
    { value: "completed", label: "Completed", tab: "completed" },
    { value: "archived", label: "Archived", tab: "completed" },
  ],
  priorities: [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
    { value: "critical", label: "Critical" },
  ],
  visible_tabs: ["roadmap", "development", "completed"],
  days_until_archive: 30,
  allow_delete: true,
  items_per_page: 10,
  page_size_options: [10, 20, 30, 50]
};

export default function RoadmapSettingsDialog({ isOpen, onClose, settings, onSave }) {
  const [formData, setFormData] = useState(settings || defaultSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [newCategory, setNewCategory] = useState({ value: "", label: "" });
  const [newStatus, setNewStatus] = useState({ value: "", label: "", tab: "roadmap" });
  const [newPriority, setNewPriority] = useState({ value: "", label: "" });

  useEffect(() => {
    if (settings) {
      setFormData({ ...defaultSettings, ...settings });
    }
  }, [settings]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(formData);
      toast.success("Settings saved");
      onClose();
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const addCategory = () => {
    if (newCategory.value && newCategory.label) {
      setFormData({
        ...formData,
        categories: [...formData.categories, newCategory]
      });
      setNewCategory({ value: "", label: "" });
    }
  };

  const removeCategory = (index) => {
    setFormData({
      ...formData,
      categories: formData.categories.filter((_, i) => i !== index)
    });
  };

  const addStatus = () => {
    if (newStatus.value && newStatus.label) {
      setFormData({
        ...formData,
        statuses: [...formData.statuses, newStatus]
      });
      setNewStatus({ value: "", label: "", tab: "roadmap" });
    }
  };

  const removeStatus = (index) => {
    setFormData({
      ...formData,
      statuses: formData.statuses.filter((_, i) => i !== index)
    });
  };

  const updateStatusTab = (index, tab) => {
    const updated = [...formData.statuses];
    updated[index] = { ...updated[index], tab };
    setFormData({ ...formData, statuses: updated });
  };

  const addPriority = () => {
    if (newPriority.value && newPriority.label) {
      setFormData({
        ...formData,
        priorities: [...formData.priorities, newPriority]
      });
      setNewPriority({ value: "", label: "" });
    }
  };

  const removePriority = (index) => {
    setFormData({
      ...formData,
      priorities: formData.priorities.filter((_, i) => i !== index)
    });
  };

  const toggleTab = (tab) => {
    const current = formData.visible_tabs || [];
    if (current.includes(tab)) {
      setFormData({ ...formData, visible_tabs: current.filter(t => t !== tab) });
    } else {
      setFormData({ ...formData, visible_tabs: [...current, tab] });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Roadmap Settings</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="general" className="mt-4">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="statuses">Statuses</TabsTrigger>
            <TabsTrigger value="priorities">Priorities</TabsTrigger>
          </TabsList>

          {/* General Tab */}
          <TabsContent value="general" className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium text-[var(--color-midnight)]">Visible Tabs</label>
              <div className="flex gap-4 mt-2">
                {["roadmap", "development", "completed"].map(tab => (
                  <label key={tab} className="flex items-center gap-2">
                    <Switch
                      checked={formData.visible_tabs?.includes(tab)}
                      onCheckedChange={() => toggleTab(tab)}
                    />
                    <span className="capitalize">{tab}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-[var(--color-midnight)]">Days Until Auto-Archive</label>
                <Input
                  type="number"
                  value={formData.days_until_archive}
                  onChange={(e) => setFormData({ ...formData, days_until_archive: parseInt(e.target.value) || 30 })}
                  className="mt-1"
                />
                <p className="text-xs text-[var(--color-charcoal)] mt-1">Completed items archive after this many days</p>
              </div>
              <div>
                <label className="text-sm font-medium text-[var(--color-midnight)]">Default Items Per Page</label>
                <Select 
                  value={String(formData.items_per_page)} 
                  onValueChange={(v) => setFormData({ ...formData, items_per_page: parseInt(v) })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(formData.page_size_options || [10, 20, 30, 50]).map(n => (
                      <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={formData.allow_delete}
                onCheckedChange={(v) => setFormData({ ...formData, allow_delete: v })}
              />
              <label className="text-sm font-medium text-[var(--color-midnight)]">Allow Delete</label>
            </div>

            <div>
              <label className="text-sm font-medium text-[var(--color-midnight)]">Page Size Options</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {(formData.page_size_options || []).map((size, i) => (
                  <Badge key={i} variant="secondary" className="cursor-pointer" onClick={() => {
                    setFormData({
                      ...formData,
                      page_size_options: formData.page_size_options.filter((_, idx) => idx !== i)
                    });
                  }}>
                    {size} ×
                  </Badge>
                ))}
                <Input
                  type="number"
                  placeholder="Add..."
                  className="w-20 h-6 text-xs"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && e.target.value) {
                      const val = parseInt(e.target.value);
                      if (val > 0 && !formData.page_size_options?.includes(val)) {
                        setFormData({
                          ...formData,
                          page_size_options: [...(formData.page_size_options || []), val].sort((a, b) => a - b)
                        });
                        e.target.value = "";
                      }
                    }
                  }}
                />
              </div>
            </div>
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-4 mt-4">
            <div className="space-y-2">
              {formData.categories?.map((cat, index) => (
                <div key={index} className="flex items-center gap-2 bg-[var(--color-background)] p-2 rounded-lg border border-[var(--color-background-muted)]">
                  <GripVertical className="h-4 w-4 text-[var(--color-charcoal)]" />
                  <span className="text-sm font-mono text-[var(--color-charcoal)] w-32">{cat.value}</span>
                  <span className="flex-1 text-[var(--color-midnight)]">{cat.label}</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-[var(--color-destructive)]" onClick={() => removeCategory(index)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="value (snake_case)"
                value={newCategory.value}
                onChange={(e) => setNewCategory({ ...newCategory, value: e.target.value.toLowerCase().replace(/\s+/g, "_") })}
                className="w-40"
              />
              <Input
                placeholder="Label"
                value={newCategory.label}
                onChange={(e) => setNewCategory({ ...newCategory, label: e.target.value })}
                className="flex-1"
              />
              <Button onClick={addCategory} size="sm"><Plus className="h-4 w-4" /></Button>
            </div>
          </TabsContent>

          {/* Statuses Tab */}
          <TabsContent value="statuses" className="space-y-4 mt-4">
            <div className="space-y-2">
              {formData.statuses?.map((status, index) => (
                <div key={index} className="flex items-center gap-2 bg-[var(--color-background)] p-2 rounded-lg border border-[var(--color-background-muted)]">
                  <GripVertical className="h-4 w-4 text-[var(--color-charcoal)]" />
                  <span className="text-sm font-mono text-[var(--color-charcoal)] w-28">{status.value}</span>
                  <span className="flex-1 text-[var(--color-midnight)]">{status.label}</span>
                  <Select value={status.tab} onValueChange={(v) => updateStatusTab(index, v)}>
                    <SelectTrigger className="w-32 h-7 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="roadmap">Roadmap</SelectItem>
                      <SelectItem value="development">Development</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-[var(--color-destructive)]" onClick={() => removeStatus(index)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="value"
                value={newStatus.value}
                onChange={(e) => setNewStatus({ ...newStatus, value: e.target.value.toLowerCase().replace(/\s+/g, "_") })}
                className="w-28"
              />
              <Input
                placeholder="Label"
                value={newStatus.label}
                onChange={(e) => setNewStatus({ ...newStatus, label: e.target.value })}
                className="flex-1"
              />
              <Select value={newStatus.tab} onValueChange={(v) => setNewStatus({ ...newStatus, tab: v })}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="roadmap">Roadmap</SelectItem>
                  <SelectItem value="development">Development</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={addStatus} size="sm"><Plus className="h-4 w-4" /></Button>
            </div>
          </TabsContent>

          {/* Priorities Tab */}
          <TabsContent value="priorities" className="space-y-4 mt-4">
            <div className="space-y-2">
              {formData.priorities?.map((pri, index) => (
                <div key={index} className="flex items-center gap-2 bg-[var(--color-background)] p-2 rounded-lg border border-[var(--color-background-muted)]">
                  <GripVertical className="h-4 w-4 text-[var(--color-charcoal)]" />
                  <span className="text-sm font-mono text-[var(--color-charcoal)] w-24">{pri.value}</span>
                  <span className="flex-1 text-[var(--color-midnight)]">{pri.label}</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-[var(--color-destructive)]" onClick={() => removePriority(index)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="value"
                value={newPriority.value}
                onChange={(e) => setNewPriority({ ...newPriority, value: e.target.value.toLowerCase().replace(/\s+/g, "_") })}
                className="w-32"
              />
              <Input
                placeholder="Label"
                value={newPriority.label}
                onChange={(e) => setNewPriority({ ...newPriority, label: e.target.value })}
                className="flex-1"
              />
              <Button onClick={addPriority} size="sm"><Plus className="h-4 w-4" /></Button>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t border-[var(--color-background-muted)] mt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={isSaving} className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white">
            {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Save Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export { defaultSettings };