import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { QueryErrorState } from "@/components/common/QueryErrorState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Loader2, Lightbulb, Code, Focus, Settings } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import RoadmapItemCard from "@/components/roadmap/RoadmapItemCard";
import RoadmapSettingsDialog, { defaultSettings } from "@/components/roadmap/RoadmapSettingsDialog";
import { Pagination } from "@/components/ui/Pagination";
import { PageHeader } from "@/components/sturij";

const defaultCategories = [
  { value: "idea", label: "Idea" },
  { value: "requirement", label: "Requirement" },
  { value: "feature", label: "Feature" },
  { value: "improvement", label: "Improvement" },
  { value: "bug_fix", label: "Bug Fix" },
  { value: "discussion_note", label: "Discussion Note" },
];

const defaultPriorities = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
];

const defaultStatuses = [
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
];

const sources = [
  { value: "user", label: "User Added" },
  { value: "ai_assistant", label: "AI Assistant" },
  { value: "discussion", label: "Discussion" },
];

const emptyItem = {
  title: "",
  description: "",
  category: "idea",
  priority: "medium",
  status: "backlog",
  source: "user",
  tags: [],
  notes: "",
  target_phase: "",
  is_starred: false,
  is_focused: false
};

export default function RoadmapManager() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState(emptyItem);
  const [filterCategory, setFilterCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [activeTab, setActiveTab] = useState("roadmap");
  const [currentPage, setCurrentPage] = useState({ roadmap: 1, development: 1, completed: 1 });

  const { data: items = [], isLoading, error, refetch } = useQuery({
    queryKey: ["roadmapItems"],
    queryFn: () => base44.entities.RoadmapItem.list("-created_date"),
  });

  const { data: settingsData = [] } = useQuery({
    queryKey: ["roadmapSettings"],
    queryFn: () => base44.entities.RoadmapSettings.list(),
  });

  const settings = settingsData[0] || defaultSettings;
  const categories = settings.categories || defaultCategories;
  const priorities = settings.priorities || defaultPriorities;
  const statuses = settings.statuses || defaultStatuses;
  const visibleTabs = settings.visible_tabs || ["roadmap", "development", "completed"];
  const allowDelete = settings.allow_delete !== false;
  const itemsPerPage = settings.items_per_page || 10;
  const pageSizeOptions = settings.page_size_options || [10, 20, 30, 50];
  const [pageSize, setPageSize] = useState(itemsPerPage);

  const saveSettings = async (newSettings) => {
    if (settingsData[0]) {
      await base44.entities.RoadmapSettings.update(settingsData[0].id, newSettings);
    } else {
      await base44.entities.RoadmapSettings.create(newSettings);
    }
    queryClient.invalidateQueries({ queryKey: ["roadmapSettings"] });
  };

  const { data: allJournals = [] } = useQuery({
    queryKey: ["allRoadmapJournals"],
    queryFn: () => base44.entities.RoadmapJournal.list(),
  });

  const journalCounts = useMemo(() => {
    const counts = {};
    allJournals.forEach(j => {
      counts[j.roadmap_item_id] = (counts[j.roadmap_item_id] || 0) + 1;
    });
    return counts;
  }, [allJournals]);

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.RoadmapItem.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roadmapItems"] });
      toast.success("Item added to roadmap");
      handleCloseDialog();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.RoadmapItem.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roadmapItems"] });
      toast.success("Item updated");
      handleCloseDialog();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.RoadmapItem.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roadmapItems"] });
      toast.success("Item deleted");
    },
  });

  const handleOpenDialog = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData(item);
    } else {
      setEditingItem(null);
      setFormData(emptyItem);
    }
    setShowDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setEditingItem(null);
    setFormData(emptyItem);
    setTagInput("");
  };

  const handleSave = () => {
    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleToggleStar = (item) => {
    updateMutation.mutate({ id: item.id, data: { ...item, is_starred: !item.is_starred } });
  };

  const handleToggleFocus = async (item) => {
    // Clear focus from all other items first
    if (!item.is_focused) {
      const focusedItems = items.filter(i => i.is_focused && i.id !== item.id);
      for (const fi of focusedItems) {
        await base44.entities.RoadmapItem.update(fi.id, { is_focused: false });
      }
    }
    updateMutation.mutate({ id: item.id, data: { ...item, is_focused: !item.is_focused } });
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...(formData.tags || []), tagInput.trim()] });
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) });
  };

  // Filter and sort items
  const processedItems = useMemo(() => {
    let filtered = items.filter(item => {
      // Hide "Live Chat Journal" from main roadmap
      if (item.title === "Live Chat Journal" && item.category === "discussion_note") {
        return false;
      }
      const matchesCategory = filterCategory === "all" || item.category === filterCategory;
      const matchesSearch = !searchQuery || 
        item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });

    // Sort: focused first, then starred, then by date
    return filtered.sort((a, b) => {
      if (a.is_focused && !b.is_focused) return -1;
      if (!a.is_focused && b.is_focused) return 1;
      if (a.is_starred && !b.is_starred) return -1;
      if (!a.is_starred && b.is_starred) return 1;
      return new Date(b.created_date) - new Date(a.created_date);
    });
  }, [items, filterCategory, searchQuery]);

  // Split into tabs based on settings
  const roadmapStatuses = statuses.filter(s => s.tab === "roadmap").map(s => s.value);
  const developmentStatuses = statuses.filter(s => s.tab === "development").map(s => s.value);
  const completedStatuses = statuses.filter(s => s.tab === "completed").map(s => s.value);
  
  const roadmapItems = processedItems.filter(i => roadmapStatuses.includes(i.status));
  const developmentItems = processedItems.filter(i => developmentStatuses.includes(i.status));
  const completedItems = processedItems.filter(i => completedStatuses.includes(i.status));
  
  // Paginate
  const paginateItems = (items, tab) => {
    const page = currentPage[tab] || 1;
    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
  };

  const focusedItem = items.find(i => i.is_focused);

  const handleOpenJournal = (item) => {
    navigate(createPageUrl("RoadmapJournal") + `?item=${item.id}`);
  };

  const ItemList = ({ items: listItems, showDevPrompt = false }) => (
    <div className="space-y-2">
      {listItems.map(item => (
        <div key={item.id} className="flex gap-2">
          <div className="flex-1">
            <RoadmapItemCard
              item={item}
              onEdit={handleOpenDialog}
              onDelete={allowDelete ? (id) => deleteMutation.mutate(id) : null}
              onToggleStar={handleToggleStar}
              onToggleFocus={handleToggleFocus}
              journalCount={journalCounts[item.id] || 0}
            />
          </div>
          {showDevPrompt && (
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => handleOpenJournal(item)}
              title="Open Journal & Dev Prompt"
            >
              <Code className="h-4 w-4" />
            </Button>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto -mt-6 min-h-screen">
      <PageHeader 
        title="Roadmap Manager"
        description="Track ideas, requirements, and development tasks"
      />

      <Card className="border-border mb-4">
        <CardContent className="px-2 py-1">
          <div className="flex gap-2">
            <Button 
              variant="ghost"
              className="hover:bg-[#e9efeb] hover:text-[#273e2d]"
              onClick={() => handleOpenDialog()}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setShowSettings(true)}>
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Focused Item Banner */}
      {focusedItem && (
        <div className="mb-6 p-4 bg-primary/10 border border-primary/20 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Focus className="h-5 w-5 text-primary" />
            <span className="font-semibold text-primary">Current Focus</span>
          </div>
          <p className="text-foreground font-medium">{focusedItem.title}</p>
          {focusedItem.description && (
            <p className="text-muted-foreground text-sm mt-1">{focusedItem.description}</p>
          )}
          <div className="flex gap-2 mt-3">
            <Button size="sm" variant="outline" onClick={() => handleOpenJournal(focusedItem)}>
              <Code className="h-3 w-3 mr-1" /> Journal & Dev Prompt
            </Button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-4 mb-6 flex-wrap">
        <div className="relative flex-1">
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(c => (
              <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : error ? (
        <QueryErrorState error={error} onRetry={refetch} />
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            {visibleTabs.includes("roadmap") && (
              <TabsTrigger value="roadmap">
                Roadmap ({roadmapItems.length})
              </TabsTrigger>
            )}
            {visibleTabs.includes("development") && (
              <TabsTrigger value="development">
                Development ({developmentItems.length})
              </TabsTrigger>
            )}
            {visibleTabs.includes("completed") && (
              <TabsTrigger value="completed">
                Completed ({completedItems.length})
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="roadmap" className="mt-6">
            <Card className="border-border">
              <CardContent className="p-4">
                {roadmapItems.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No items in roadmap. Add your first idea!</p>
                  </div>
                ) : (
                  <>
                    <ItemList items={paginateItems(roadmapItems, "roadmap")} />
                    <div className="mt-6">
                      <Pagination
                        currentPage={currentPage.roadmap}
                        totalItems={roadmapItems.length}
                        itemsPerPage={pageSize}
                        onPageChange={(p) => setCurrentPage({ ...currentPage, roadmap: p })}
                        onItemsPerPageChange={setPageSize}
                        pageSizeOptions={pageSizeOptions}
                      />
                    </div>
                  </>
                )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="development" className="mt-6">
                <Card className="border-border">
                  <CardContent className="p-4">
                {developmentItems.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Code className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No items in development. Set items to "Planned" to move them here.</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-6">
                      {developmentStatuses.map(status => {
                        const statusItems = developmentItems.filter(i => i.status === status);
                        if (statusItems.length === 0) return null;
                        const statusLabel = statuses.find(s => s.value === status)?.label || status;
                        return (
                          <div key={status}>
                            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                              {statusLabel}
                              <Badge variant="secondary">{statusItems.length}</Badge>
                            </h3>
                            <ItemList items={statusItems} showDevPrompt />
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-6">
                      <Pagination
                        currentPage={currentPage.development}
                        totalItems={developmentItems.length}
                        itemsPerPage={pageSize}
                        onPageChange={(p) => setCurrentPage({ ...currentPage, development: p })}
                        onItemsPerPageChange={setPageSize}
                        pageSizeOptions={pageSizeOptions}
                      />
                    </div>
                  </>
                )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="completed" className="mt-6">
                <Card className="border-border">
                  <CardContent className="p-4">
                {completedItems.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Code className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No completed items yet.</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-6">
                      {completedStatuses.map(status => {
                        const statusItems = completedItems.filter(i => i.status === status);
                        if (statusItems.length === 0) return null;
                        const statusLabel = statuses.find(s => s.value === status)?.label || status;
                        return (
                          <div key={status}>
                            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                              {statusLabel}
                              <Badge variant="secondary">{statusItems.length}</Badge>
                            </h3>
                            <ItemList items={statusItems} />
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-6">
                      <Pagination
                        currentPage={currentPage.completed}
                        totalItems={completedItems.length}
                        itemsPerPage={pageSize}
                        onPageChange={(p) => setCurrentPage({ ...currentPage, completed: p })}
                        onItemsPerPageChange={setPageSize}
                        pageSizeOptions={pageSizeOptions}
                      />
                    </div>
                  </>
                )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Item" : "Add Roadmap Item"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Title *</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Brief title..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Category</label>
                <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {categories.map(c => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Priority</label>
                <Select value={formData.priority} onValueChange={(v) => setFormData({ ...formData, priority: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {priorities.map(p => (
                      <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Status</label>
                <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {statuses.map(s => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Source</label>
                <Select value={formData.source} onValueChange={(v) => setFormData({ ...formData, source: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {sources.map(s => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Detailed description..."
                rows={3}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Target Phase</label>
              <Input
                value={formData.target_phase}
                onChange={(e) => setFormData({ ...formData, target_phase: e.target.value })}
                placeholder="e.g., Phase 1, MVP, v2.0..."
              />
            </div>

            <div>
              <label className="text-sm font-medium">Tags</label>
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add tag..."
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                />
                <Button type="button" variant="outline" onClick={handleAddTag}>Add</Button>
              </div>
              {formData.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {formData.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => handleRemoveTag(tag)}>
                      {tag} ×
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="text-sm font-medium">Notes</label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional context or notes..."
                rows={2}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={handleCloseDialog}>Cancel</Button>
              <Button onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending}>
                {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <RoadmapSettingsDialog
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onSave={saveSettings}
      />
    </div>
  );
}