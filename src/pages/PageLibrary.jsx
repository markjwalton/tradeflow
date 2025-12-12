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
import { Plus, Search, Layout, Sparkles, Trash2, Edit, Copy, Loader2, BookmarkPlus, Folder, Database, Check, Eye } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import PageBuilder from "@/components/library/PageBuilder";
import CustomProjectSelector from "@/components/library/CustomProjectSelector";
import PagePreview from "@/components/library/PagePreview";

const categories = ["Dashboard", "List", "Detail", "Form", "Report", "Settings", "Custom", "Other"];

const categoryColors = {
  Dashboard: "bg-info-50 text-info",
  List: "bg-success-50 text-success",
  Detail: "bg-accent-100 text-accent",
  Form: "bg-warning/10 text-warning",
  Report: "bg-warning/10 text-warning",
  Settings: "bg-muted text-muted-foreground",
  Custom: "bg-primary/10 text-primary",
  Other: "bg-muted text-muted-foreground",
};

export default function PageLibrary() {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 30;
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
  const [showBulkAIDialog, setShowBulkAIDialog] = useState(false);
  const [isBulkGenerating, setIsBulkGenerating] = useState(false);
  const [bulkGeneratedPages, setBulkGeneratedPages] = useState([]);
  const [selectedBulkPages, setSelectedBulkPages] = useState([]);
  const [previewPage, setPreviewPage] = useState(null);

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

  // Pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPages = filteredPages.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredPages.length / itemsPerPage);

  const paginatedGroupedPages = paginatedPages.reduce((acc, page) => {
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

  // Get entities for current project
  const projectEntities = selectedProjectId 
    ? entities.filter(e => e.custom_project_id === selectedProjectId)
    : entities.filter(e => !e.custom_project_id);

  const handleBulkAIGenerate = async () => {
    if (projectEntities.length === 0) {
      toast.error("No entities found to generate pages from");
      return;
    }
    
    setIsBulkGenerating(true);
    setBulkGeneratedPages([]);
    setSelectedBulkPages([]);
    
    try {
      const entitySummary = projectEntities.map(e => ({
        name: e.name,
        description: e.description,
        fields: Object.keys(e.schema?.properties || {}).join(", "),
        relationships: e.relationships?.map(r => r.target_entity).join(", ") || "none"
      }));

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a UI/UX expert. Analyze these entities and generate appropriate page templates for a business application.

ENTITIES:
${JSON.stringify(entitySummary, null, 2)}

Generate pages that would be useful for managing these entities. Include:
- List pages for viewing/managing records
- Detail pages for viewing individual records
- Dashboard pages for overviews
- Form pages where appropriate
- Any specialized pages based on entity relationships

For each page, determine which entities it uses based on the entity relationships.

Return a JSON object with a "pages" array containing page templates.`,
        response_json_schema: {
          type: "object",
          properties: {
            pages: {
              type: "array",
              items: {
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
            }
          }
        }
      });

      const generated = result.pages || [];
      setBulkGeneratedPages(generated);
      setSelectedBulkPages(generated.map((_, i) => i));
      toast.success(`Generated ${generated.length} page suggestions`);
    } catch (error) {
      toast.error("Failed to generate pages");
    } finally {
      setIsBulkGenerating(false);
    }
  };

  const handleSaveBulkPages = async () => {
    const pagesToSave = selectedBulkPages.map(i => bulkGeneratedPages[i]);
    
    for (const page of pagesToSave) {
      const pageData = {
        ...page,
        custom_project_id: selectedProjectId || null,
        is_custom: !!selectedProjectId,
        category: selectedProjectId ? "Custom" : page.category
      };
      await base44.entities.PageTemplate.create(pageData);
    }
    
    queryClient.invalidateQueries({ queryKey: ["pageTemplates"] });
    toast.success(`Saved ${pagesToSave.length} pages`);
    setShowBulkAIDialog(false);
    setBulkGeneratedPages([]);
    setSelectedBulkPages([]);
  };

  return (
    <div className="p-6 bg-background min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-light font-display flex items-center gap-2 text-foreground">
            Page Library
            {currentProject && (
              <Badge className="bg-primary/10 text-primary">
                <Folder className="h-3 w-3 mr-1" />
                {currentProject.name}
              </Badge>
            )}
          </h1>
          <p className="text-muted-foreground">Reusable page templates for applications</p>
        </div>
        <div className="flex gap-2">
          <CustomProjectSelector
            selectedProjectId={selectedProjectId}
            onSelectProject={setSelectedProjectId}
          />
          <Button variant="outline" onClick={() => setShowBulkAIDialog(true)} disabled={projectEntities.length === 0}>
            <Database className="h-4 w-4 mr-2" />
            AI from Entities ({projectEntities.length})
          </Button>
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
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : filteredPages.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Layout className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No page templates found</p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              Showing {startIndex + 1}-{Math.min(endIndex, filteredPages.length)} of {filteredPages.length} pages
            </p>
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
          <div className="space-y-8">
          {Object.entries(paginatedGroupedPages).map(([groupName, groupPages]) => (
            <div key={groupName}>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Badge className={categoryColors[groupName] || "bg-muted text-muted-foreground"}>{groupName}</Badge>
                <span className="text-muted-foreground text-sm font-normal">({groupPages.length})</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupPages.map((page) => (
                  <Card key={page.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Layout className="h-4 w-4 text-info" />
                        {page.name}
                        {page.is_custom && (
                          <Badge variant="outline" className="text-xs">Custom</Badge>
                        )}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{page.description}</p>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex flex-wrap gap-1 mb-3">
                        {page.entities_used?.map((entity) => (
                          <Badge key={entity} variant="outline" className="text-xs">{entity}</Badge>
                        ))}
                      </div>
                      <div className="text-xs text-muted-foreground mb-3">
                        {page.components?.length || 0} components · {page.actions?.length || 0} actions
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => setPreviewPage(page)} title="Preview">
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => { setEditingPage(page); setShowBuilder(true); }} title="Edit">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDuplicate(page)} title="Duplicate">
                          <Copy className="h-3 w-3" />
                        </Button>
                        {!page.custom_project_id && projects.length > 0 && (
                          <Button size="sm" variant="ghost" onClick={() => setAddToProjectItem(page)} title="Add to Project" className="text-primary">
                            <Folder className="h-3 w-3" />
                          </Button>
                        )}
                        {page.is_custom && (
                          <Button size="sm" variant="ghost" onClick={() => handleSaveToLibrary(page)} title="Save to default library">
                            <BookmarkPlus className="h-3 w-3" />
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteMutation.mutate(page.id)} title="Delete">
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
        </>
      )}

      <Dialog open={showBuilder} onOpenChange={setShowBuilder}>
        <DialogContent className="max-w-4xl h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {editingPage?.id ? "Edit Page" : "Create Page"}
              {selectedProjectId && currentProject && (
                <Badge className="ml-2 bg-primary/10 text-primary">{currentProject.name}</Badge>
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
              <Folder className="h-5 w-5 text-primary" />
              Add "{addToProjectItem?.name}" to Project
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Select a custom project:</p>
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
              <Sparkles className="h-5 w-5 text-accent" />
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

      {/* Bulk AI Generate Dialog */}
      <Dialog open={showBulkAIDialog} onOpenChange={setShowBulkAIDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-info" />
              Generate Pages from Entities
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto space-y-4">
            {bulkGeneratedPages.length === 0 ? (
              <>
                <p className="text-sm text-muted-foreground">
                  AI will analyze your {projectEntities.length} entities and suggest relevant pages.
                </p>
                <div className="bg-muted rounded-lg p-3">
                  <p className="text-sm font-medium mb-2">Entities to analyze:</p>
                  <div className="flex flex-wrap gap-1">
                    {projectEntities.map(e => (
                      <Badge key={e.id} variant="outline">{e.name}</Badge>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowBulkAIDialog(false)}>Cancel</Button>
                  <Button onClick={handleBulkAIGenerate} disabled={isBulkGenerating}>
                    {isBulkGenerating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Generate Pages
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Select pages to add ({selectedBulkPages.length}/{bulkGeneratedPages.length} selected)
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedBulkPages(
                      selectedBulkPages.length === bulkGeneratedPages.length 
                        ? [] 
                        : bulkGeneratedPages.map((_, i) => i)
                    )}
                  >
                    {selectedBulkPages.length === bulkGeneratedPages.length ? "Deselect All" : "Select All"}
                  </Button>
                </div>
                <div className="space-y-2 max-h-96 overflow-auto">
                  {bulkGeneratedPages.map((page, index) => (
                    <div 
                      key={index} 
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedBulkPages.includes(index) ? "border-info bg-info-50" : "hover:bg-muted"
                      }`}
                      onClick={() => setSelectedBulkPages(prev => 
                        prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox checked={selectedBulkPages.includes(index)} />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Layout className="h-4 w-4 text-info" />
                            <span className="font-medium">{page.name}</span>
                            <Badge className={categoryColors[page.category] || "bg-muted"}>{page.category}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{page.description}</p>
                          {page.entities_used?.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {page.entities_used.map(e => (
                                <Badge key={e} variant="outline" className="text-xs">{e}</Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end gap-2 pt-2 border-t">
                  <Button variant="outline" onClick={() => { setBulkGeneratedPages([]); setSelectedBulkPages([]); }}>
                    Regenerate
                  </Button>
                  <Button onClick={handleSaveBulkPages} disabled={selectedBulkPages.length === 0}>
                    <Check className="h-4 w-4 mr-2" />
                    Save {selectedBulkPages.length} Pages
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
      {/* Preview Dialog */}
      <Dialog open={!!previewPage} onOpenChange={(v) => !v && setPreviewPage(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Layout className="h-5 w-5 text-info" />
              {previewPage?.name}
              {previewPage?.category && (
                <Badge className={categoryColors[previewPage.category]}>{previewPage.category}</Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          {previewPage && (
            <div className="space-y-4">
              <p className="text-muted-foreground text-sm">{previewPage.description}</p>
              
              {/* Visual Preview */}
              <PagePreview page={previewPage} />

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                {previewPage.entities_used?.length > 0 && (
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground mb-1">Entities</h4>
                    <div className="flex flex-wrap gap-1">
                      {previewPage.entities_used.map(e => (
                        <Badge key={e} variant="outline" className="text-xs">{e}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {previewPage.features?.length > 0 && (
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground mb-1">Features</h4>
                    <div className="flex flex-wrap gap-1">
                      {previewPage.features.map(f => (
                        <Badge key={f} className="bg-accent-100 text-accent text-xs">{f}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setPreviewPage(null)}>Close</Button>
                <Button onClick={() => { setEditingPage(previewPage); setShowBuilder(true); setPreviewPage(null); }}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Page
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}