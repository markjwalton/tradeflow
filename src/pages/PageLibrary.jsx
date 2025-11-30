import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { Plus, Search, Layout, Sparkles, Trash2, Edit, Copy, Loader2, BookmarkPlus, Folder } from "lucide-react";
import { toast } from "sonner";
import PageBuilder from "@/components/library/PageBuilder";
import CustomProjectSelector from "@/components/library/CustomProjectSelector";

const categories = ["Dashboard", "List", "Detail", "Form", "Report", "Settings", "Custom", "Other"];

const categoryColors = {
  Dashboard: "bg-blue-100 text-blue-800",
  List: "bg-green-100 text-green-800",
  Detail: "bg-purple-100 text-purple-800",
  Form: "bg-yellow-100 text-yellow-800",
  Report: "bg-orange-100 text-orange-800",
  Settings: "bg-gray-100 text-gray-800",
  Custom: "bg-indigo-100 text-indigo-800",
  Other: "bg-slate-100 text-slate-800",
};

export default function PageLibrary() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingPage, setEditingPage] = useState(null);
  const [showAIDialog, setShowAIDialog] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState("all");
  const [addToProjectItem, setAddToProjectItem] = useState(null);

  const { data: pages = [], isLoading } = useQuery({
    queryKey: ["pageTemplates"],
    queryFn: () => base44.entities.PageTemplate.list(),
  });

  const { data: entities = [] } = useQuery({
    queryKey: ["entityTemplates"],
    queryFn: () => base44.entities.EntityTemplate.list(),
  });

  const { data: projects = [] } = useQuery({
    queryKey: ["customProjects"],
    queryFn: () => base44.entities.CustomProject.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.PageTemplate.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pageTemplates"] });
      setShowBuilder(false);
      setEditingPage(null);
      toast.success("Page template saved");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.PageTemplate.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pageTemplates"] });
      setShowBuilder(false);
      setEditingPage(null);
      toast.success("Page template updated");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.PageTemplate.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pageTemplates"] });
      toast.success("Page template deleted");
    },
  });

  // Get unique groups from pages
  const availableGroups = [...new Set(pages.filter(p => p.group).map(p => p.group))].sort();

  const filteredPages = pages.filter((page) => {
    const matchesSearch = page.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      page.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || page.category === selectedCategory;
    const matchesGroup = selectedGroup === "all" || page.group === selectedGroup || (selectedGroup === "ungrouped" && !page.group);
    
    if (selectedProjectId) {
      return matchesSearch && matchesCategory && matchesGroup && page.custom_project_id === selectedProjectId;
    } else {
      return matchesSearch && matchesCategory && matchesGroup && !page.custom_project_id;
    }
  });

  const groupedPages = filteredPages.reduce((acc, page) => {
    const groupKey = page.group || page.category || "Other";
    if (!acc[groupKey]) acc[groupKey] = [];
    acc[groupKey].push(page);
    return acc;
  }, {});

  const handleSavePage = (pageData) => {
    const dataToSave = {
      ...pageData,
      custom_project_id: selectedProjectId || null,
      is_custom: !!selectedProjectId,
      category: selectedProjectId ? "Custom" : pageData.category
    };
    
    if (editingPage?.id) {
      updateMutation.mutate({ id: editingPage.id, data: dataToSave });
    } else {
      createMutation.mutate(dataToSave);
    }
  };

  const handleSaveToLibrary = (page) => {
    const libraryPage = {
      ...page,
      custom_project_id: null,
      is_custom: false,
      is_global: true,
      name: page.name + " (Library)"
    };
    delete libraryPage.id;
    delete libraryPage.created_date;
    delete libraryPage.updated_date;
    createMutation.mutate(libraryPage);
    toast.success("Saved to default library");
  };

  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) return;
    
    setIsGenerating(true);
    try {
      const entityList = entities.map(e => e.name).join(", ");
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a UI/UX expert. Based on this description, generate a page template:

"${aiPrompt}"

Available entities in the system: ${entityList || "None defined yet"}

Return a JSON object with:
- name: PascalCase page name
- description: Brief description of the page
- category: One of [Dashboard, List, Detail, Form, Report, Settings, Other]
- layout: One of [full-width, centered, sidebar, split]
- entities_used: Array of entity names this page uses
- features: Array of feature names (e.g., "Search", "Filtering", "Export")
- components: Array of {name, type, description} for UI components
- actions: Array of user actions (e.g., "create", "edit", "delete")
- tags: Array of relevant tags`,
        response_json_schema: {
          type: "object",
          properties: {
            name: { type: "string" },
            description: { type: "string" },
            category: { type: "string" },
            layout: { type: "string" },
            entities_used: { type: "array", items: { type: "string" } },
            features: { type: "array", items: { type: "string" } },
            components: { type: "array", items: { type: "object" } },
            actions: { type: "array", items: { type: "string" } },
            tags: { type: "array", items: { type: "string" } }
          }
        }
      });

      setEditingPage(result);
      setShowAIDialog(false);
      setShowBuilder(true);
      setAiPrompt("");
      toast.success("Page generated! Review and save.");
    } catch (error) {
      toast.error("Failed to generate page");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDuplicate = (page) => {
    const duplicate = { 
      ...page, 
      name: page.name + " Copy",
      custom_project_id: selectedProjectId || page.custom_project_id,
      is_custom: !!selectedProjectId || page.is_custom
    };
    delete duplicate.id;
    delete duplicate.created_date;
    delete duplicate.updated_date;
    createMutation.mutate(duplicate);
  };

  const currentProject = projects.find(p => p.id === selectedProjectId);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            Page Library
            {currentProject && (
              <Badge className="bg-indigo-100 text-indigo-800">
                <Folder className="h-3 w-3 mr-1" />
                {currentProject.name}
              </Badge>
            )}
          </h1>
          <p className="text-gray-500">Reusable page templates for applications</p>
        </div>
        <div className="flex gap-2">
          <CustomProjectSelector
            selectedProjectId={selectedProjectId}
            onSelectProject={setSelectedProjectId}
          />
          <Button variant="outline" onClick={() => setShowAIDialog(true)}>
            <Sparkles className="h-4 w-4 mr-2" />
            AI Generate
          </Button>
          <Button onClick={() => { setEditingPage(null); setShowBuilder(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            New Page
          </Button>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search pages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedGroup} onValueChange={setSelectedGroup}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Group" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Groups</SelectItem>
            <SelectItem value="ungrouped">Ungrouped</SelectItem>
            {availableGroups.map((grp) => (
              <SelectItem key={grp} value={grp}>{grp}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : filteredPages.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Layout className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No page templates found</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedPages).map(([groupName, groupPages]) => (
            <div key={groupName}>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Badge className={categoryColors[groupName] || "bg-slate-100 text-slate-800"}>{groupName}</Badge>
                <span className="text-gray-400 text-sm font-normal">({groupPages.length})</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupPages.map((page) => (
                  <Card key={page.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Layout className="h-4 w-4 text-blue-600" />
                        {page.name}
                        {page.is_custom && (
                          <Badge variant="outline" className="text-xs">Custom</Badge>
                        )}
                      </CardTitle>
                      <p className="text-sm text-gray-500 mt-1">{page.description}</p>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex flex-wrap gap-1 mb-3">
                        {page.entities_used?.map((entity) => (
                          <Badge key={entity} variant="outline" className="text-xs">{entity}</Badge>
                        ))}
                      </div>
                      <div className="text-xs text-gray-500 mb-3">
                        {page.components?.length || 0} components · {page.actions?.length || 0} actions
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => { setEditingPage(page); setShowBuilder(true); }} title="Edit">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDuplicate(page)} title="Duplicate">
                          <Copy className="h-3 w-3" />
                        </Button>
                        {!page.custom_project_id && projects.length > 0 && (
                          <Button size="sm" variant="ghost" onClick={() => setAddToProjectItem(page)} title="Add to Project" className="text-indigo-600">
                            <Folder className="h-3 w-3" />
                          </Button>
                        )}
                        {page.is_custom && (
                          <Button size="sm" variant="ghost" onClick={() => handleSaveToLibrary(page)} title="Save to default library">
                            <BookmarkPlus className="h-3 w-3" />
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" className="text-red-600" onClick={() => deleteMutation.mutate(page.id)} title="Delete">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showBuilder} onOpenChange={setShowBuilder}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {editingPage?.id ? "Edit Page" : "Create Page"}
              {selectedProjectId && currentProject && (
                <Badge className="ml-2 bg-indigo-100 text-indigo-800">{currentProject.name}</Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          <PageBuilder
            initialData={editingPage}
            entities={entities}
            onSave={handleSavePage}
            onCancel={() => { setShowBuilder(false); setEditingPage(null); }}
            isSaving={createMutation.isPending || updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Add to Project Dialog */}
      <Dialog open={!!addToProjectItem} onOpenChange={(v) => !v && setAddToProjectItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Folder className="h-5 w-5 text-indigo-600" />
              Add "{addToProjectItem?.name}" to Project
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Select a custom project:</p>
            <div className="space-y-2">
              {projects.map((project) => (
                <Button
                  key={project.id}
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    const copy = { ...addToProjectItem, custom_project_id: project.id, is_custom: true, category: "Custom" };
                    delete copy.id;
                    delete copy.created_date;
                    delete copy.updated_date;
                    createMutation.mutate(copy);
                    setAddToProjectItem(null);
                    toast.success(`Added to ${project.name}`);
                  }}
                >
                  <Folder className="h-4 w-4 mr-2" />
                  {project.name}
                </Button>
              ))}
            </div>
            <Button variant="outline" className="w-full" onClick={() => setAddToProjectItem(null)}>Cancel</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showAIDialog} onOpenChange={setShowAIDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              Generate Page with AI
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Describe the page you need...&#10;&#10;Example: A dashboard page showing project statistics, recent tasks, and upcoming deadlines with charts"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              rows={5}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAIDialog(false)}>Cancel</Button>
              <Button onClick={handleAIGenerate} disabled={isGenerating || !aiPrompt.trim()}>
                {isGenerating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Generate
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}