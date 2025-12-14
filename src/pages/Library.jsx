import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  Plus, Search, Database, Layout, Zap, Sparkles, Trash2, Edit, Copy, 
  Loader2, BookmarkPlus, Folder, Check, Eye, ChevronDown, ChevronRight, 
  ArrowLeft, FolderPlus, Users, FileInput, ListChecks, Briefcase, GitBranch
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import EntityBuilder from "@/components/library/EntityBuilder";
import PageBuilder from "@/components/library/PageBuilder";
import FeatureBuilder from "@/components/library/FeatureBuilder";
import CustomProjectSelector from "@/components/library/CustomProjectSelector";
import AddGroupToProjectDialog from "@/components/library/AddGroupToProjectDialog";
import PagePreview from "@/components/library/PagePreview";
import { PageHeader } from "@/components/sturij";

const entityCategories = ["Core", "CRM", "Finance", "Operations", "HR", "Inventory", "Communication", "Custom", "Other"];
const pageCategories = ["Dashboard", "List", "Detail", "Form", "Report", "Settings", "Custom", "Other"];
const featureCategories = ["Communication", "Automation", "Integration", "Reporting", "Security", "Workflow", "UI/UX", "Custom", "Other"];
const formCategories = ["Contact", "Survey", "Registration", "Feedback", "Application", "Custom", "Other"];
const checklistCategories = ["Onboarding", "Quality", "Compliance", "Process", "Project", "Custom", "Other"];
const businessCategories = ["Construction", "Consulting", "Healthcare", "Retail", "Manufacturing", "Custom", "Other"];
const workflowCategories = ["Approval", "Notification", "Automation", "Integration", "Process", "Custom", "Other"];

const complexityColors = {
  simple: "bg-success-50 text-success",
  medium: "bg-warning/10 text-warning",
  complex: "bg-destructive-50 text-destructive",
};

export default function Library() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("entities");
  const [activeSection, setActiveSection] = useState("core"); // core, community, forms, business, workflows
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedGroup, setSelectedGroup] = useState("all");
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [expandedGroups, setExpandedGroups] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 30;

  // Detail view state
  const [selectedItem, setSelectedItem] = useState(null);
  const [showBuilder, setShowBuilder] = useState(false);
  const [showAIDialog, setShowAIDialog] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [addToProjectItem, setAddToProjectItem] = useState(null);
  const [addGroupToProject, setAddGroupToProject] = useState(null);
  
  // Bulk AI state
  const [showBulkAIDialog, setShowBulkAIDialog] = useState(false);
  const [isBulkGenerating, setIsBulkGenerating] = useState(false);
  const [bulkGenerated, setBulkGenerated] = useState([]);
  const [selectedBulk, setSelectedBulk] = useState([]);

  // Data queries
  const { data: entities = [], isLoading: loadingEntities } = useQuery({
    queryKey: ["entityTemplates"],
    queryFn: () => base44.entities.EntityTemplate.list(),
  });

  const { data: pages = [], isLoading: loadingPages } = useQuery({
    queryKey: ["pageTemplates"],
    queryFn: () => base44.entities.PageTemplate.list(),
  });

  const { data: features = [], isLoading: loadingFeatures } = useQuery({
    queryKey: ["featureTemplates"],
    queryFn: () => base44.entities.FeatureTemplate.list(),
  });

  const { data: communityItems = [], isLoading: loadingCommunity } = useQuery({
    queryKey: ["communityLibraryItems"],
    queryFn: () => base44.entities.CommunityLibraryItem.list(),
    enabled: activeSection === "community"
  });

  const { data: formTemplates = [], isLoading: loadingForms } = useQuery({
    queryKey: ["formTemplates"],
    queryFn: () => base44.entities.FormTemplate.list(),
    enabled: activeSection === "forms"
  });

  const { data: checklistTemplates = [], isLoading: loadingChecklists } = useQuery({
    queryKey: ["checklistTemplates"],
    queryFn: () => base44.entities.ChecklistTemplate.list(),
    enabled: activeSection === "forms"
  });

  const { data: businessTemplates = [], isLoading: loadingBusiness } = useQuery({
    queryKey: ["businessTemplates"],
    queryFn: () => base44.entities.BusinessTemplate.list(),
    enabled: activeSection === "business"
  });

  const { data: workflows = [], isLoading: loadingWorkflows } = useQuery({
    queryKey: ["workflows"],
    queryFn: () => base44.entities.Workflow.list(),
    enabled: activeSection === "workflows"
  });

  const { data: projects = [] } = useQuery({
    queryKey: ["customProjects"],
    queryFn: () => base44.entities.CustomProject.list(),
  });

  const currentProject = projects.find(p => p.id === selectedProjectId);
  const projectEntities = selectedProjectId 
    ? entities.filter(e => e.custom_project_id === selectedProjectId)
    : entities.filter(e => !e.custom_project_id);

  // Mutations
  const entityCreateMutation = useMutation({
    mutationFn: (data) => base44.entities.EntityTemplate.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entityTemplates"] });
      setShowBuilder(false);
      setSelectedItem(null);
      toast.success("Entity saved");
    },
  });

  const entityUpdateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.EntityTemplate.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entityTemplates"] });
      setShowBuilder(false);
      setSelectedItem(null);
      toast.success("Entity updated");
    },
  });

  const entityDeleteMutation = useMutation({
    mutationFn: (id) => base44.entities.EntityTemplate.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entityTemplates"] });
      setSelectedItem(null);
      toast.success("Entity deleted");
    },
  });

  const pageCreateMutation = useMutation({
    mutationFn: (data) => base44.entities.PageTemplate.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pageTemplates"] });
      setShowBuilder(false);
      setSelectedItem(null);
      toast.success("Page saved");
    },
  });

  const pageUpdateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.PageTemplate.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pageTemplates"] });
      setShowBuilder(false);
      setSelectedItem(null);
      toast.success("Page updated");
    },
  });

  const pageDeleteMutation = useMutation({
    mutationFn: (id) => base44.entities.PageTemplate.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pageTemplates"] });
      setSelectedItem(null);
      toast.success("Page deleted");
    },
  });

  const featureCreateMutation = useMutation({
    mutationFn: (data) => base44.entities.FeatureTemplate.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["featureTemplates"] });
      setShowBuilder(false);
      setSelectedItem(null);
      toast.success("Feature saved");
    },
  });

  const featureUpdateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.FeatureTemplate.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["featureTemplates"] });
      setShowBuilder(false);
      setSelectedItem(null);
      toast.success("Feature updated");
    },
  });

  const featureDeleteMutation = useMutation({
    mutationFn: (id) => base44.entities.FeatureTemplate.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["featureTemplates"] });
      setSelectedItem(null);
      toast.success("Feature deleted");
    },
  });

  // Get current data based on active section and tab
  const getCurrentData = () => {
    if (activeSection === "community") return communityItems;
    if (activeSection === "forms") {
      if (activeTab === "forms") return formTemplates;
      return checklistTemplates;
    }
    if (activeSection === "business") return businessTemplates;
    if (activeSection === "workflows") return workflows;
    
    // Core library
    if (activeTab === "entities") return entities;
    if (activeTab === "pages") return pages;
    return features;
  };

  const getCurrentCategories = () => {
    if (activeSection === "community") {
      if (activeTab === "entities") return entityCategories;
      if (activeTab === "pages") return pageCategories;
      return featureCategories;
    }
    if (activeSection === "forms") {
      if (activeTab === "forms") return formCategories;
      return checklistCategories;
    }
    if (activeSection === "business") return businessCategories;
    if (activeSection === "workflows") return workflowCategories;
    
    if (activeTab === "entities") return entityCategories;
    if (activeTab === "pages") return pageCategories;
    return featureCategories;
  };

  const isLoading = activeSection === "community" ? loadingCommunity :
                    activeSection === "forms" ? (loadingForms || loadingChecklists) :
                    activeSection === "business" ? loadingBusiness :
                    activeSection === "workflows" ? loadingWorkflows :
                    (loadingEntities || loadingPages || loadingFeatures);
  const currentData = getCurrentData();
  const availableGroups = [...new Set(currentData.filter(i => i.group).map(i => i.group))].sort();

  const filteredData = currentData.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    const matchesGroup = selectedGroup === "all" || item.group === selectedGroup || (selectedGroup === "ungrouped" && !item.group);
    
    if (selectedProjectId) {
      return matchesSearch && matchesCategory && matchesGroup && item.custom_project_id === selectedProjectId;
    } else {
      return matchesSearch && matchesCategory && matchesGroup && !item.custom_project_id;
    }
  });

  // Pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const paginatedGrouped = paginatedData.reduce((acc, item) => {
    let groupKey;
    if (activeTab === "entities" && item.group && item.category) {
      groupKey = `${item.category} / ${item.group}`;
    } else {
      groupKey = item.group || item.category || "Other";
    }
    if (!acc[groupKey]) acc[groupKey] = [];
    acc[groupKey].push(item);
    return acc;
  }, {});

  // Handlers
  const handleSave = (itemData) => {
    const dataToSave = {
      ...itemData,
      custom_project_id: selectedProjectId || null,
      is_custom: !!selectedProjectId,
      category: selectedProjectId ? "Custom" : itemData.category
    };

    if (selectedItem?.id) {
      if (activeTab === "entities") {
        entityUpdateMutation.mutate({ id: selectedItem.id, data: dataToSave });
      } else if (activeTab === "pages") {
        pageUpdateMutation.mutate({ id: selectedItem.id, data: dataToSave });
      } else {
        featureUpdateMutation.mutate({ id: selectedItem.id, data: dataToSave });
      }
    } else {
      if (activeTab === "entities") {
        entityCreateMutation.mutate(dataToSave);
      } else if (activeTab === "pages") {
        pageCreateMutation.mutate(dataToSave);
      } else {
        featureCreateMutation.mutate(dataToSave);
      }
    }
  };

  const handleDelete = (item) => {
    if (activeTab === "entities") entityDeleteMutation.mutate(item.id);
    else if (activeTab === "pages") pageDeleteMutation.mutate(item.id);
    else featureDeleteMutation.mutate(item.id);
  };

  const handleDuplicate = (item) => {
    const duplicate = { 
      ...item, 
      name: item.name + " Copy",
      ...(activeTab === "entities" && { schema: { ...item.schema, name: item.name + " Copy" } }),
      custom_project_id: selectedProjectId || item.custom_project_id,
      is_custom: !!selectedProjectId || item.is_custom
    };
    delete duplicate.id;
    delete duplicate.created_date;
    delete duplicate.updated_date;

    if (activeTab === "entities") entityCreateMutation.mutate(duplicate);
    else if (activeTab === "pages") pageCreateMutation.mutate(duplicate);
    else featureCreateMutation.mutate(duplicate);
  };

  const handleSaveToLibrary = (item) => {
    const libraryItem = {
      ...item,
      custom_project_id: null,
      is_custom: false,
      is_global: true,
      name: item.name + " (Library)"
    };
    delete libraryItem.id;
    delete libraryItem.created_date;
    delete libraryItem.updated_date;

    if (activeTab === "entities") entityCreateMutation.mutate(libraryItem);
    else if (activeTab === "pages") pageCreateMutation.mutate(libraryItem);
    else featureCreateMutation.mutate(libraryItem);
    
    toast.success("Saved to default library");
  };

  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);

    try {
      const entityList = entities.map(e => e.name).join(", ");
      let result;

      if (activeTab === "entities") {
        result = await base44.integrations.Core.InvokeLLM({
          prompt: `You are an expert database architect. Based on this description, generate an entity schema:

"${aiPrompt}"

Return a JSON object with: name, description, category (one of: ${entityCategories.join(", ")}), schema (with properties and required), relationships, tags`,
          response_json_schema: {
            type: "object",
            properties: {
              name: { type: "string" },
              description: { type: "string" },
              category: { type: "string" },
              schema: { type: "object" },
              relationships: { type: "array" },
              tags: { type: "array" }
            }
          }
        });
      } else if (activeTab === "pages") {
        result = await base44.integrations.Core.InvokeLLM({
          prompt: `You are a UI/UX expert. Based on this description, generate a page template:

"${aiPrompt}"

Available entities: ${entityList}

Return a JSON object with: name, description, category (one of: ${pageCategories.join(", ")}), layout, entities_used, features, components, actions, tags`,
          response_json_schema: {
            type: "object",
            properties: {
              name: { type: "string" },
              description: { type: "string" },
              category: { type: "string" },
              layout: { type: "string" },
              entities_used: { type: "array" },
              features: { type: "array" },
              components: { type: "array" },
              actions: { type: "array" },
              tags: { type: "array" }
            }
          }
        });
      } else {
        result = await base44.integrations.Core.InvokeLLM({
          prompt: `You are a software architect. Based on this description, generate a feature template:

"${aiPrompt}"

Available entities: ${entityList}

Return a JSON object with: name, description, category (one of: ${featureCategories.join(", ")}), complexity, entities_used, triggers, integrations, requirements, user_stories, tags`,
          response_json_schema: {
            type: "object",
            properties: {
              name: { type: "string" },
              description: { type: "string" },
              category: { type: "string" },
              complexity: { type: "string" },
              entities_used: { type: "array" },
              triggers: { type: "array" },
              integrations: { type: "array" },
              requirements: { type: "array" },
              user_stories: { type: "array" },
              tags: { type: "array" }
            }
          }
        });
      }

      setSelectedItem(result);
      setShowAIDialog(false);
      setShowBuilder(true);
      setAiPrompt("");
      toast.success("Generated! Review and save.");
    } catch (error) {
      toast.error("Failed to generate");
    } finally {
      setIsGenerating(false);
    }
  };

  const getIcon = (type) => {
    if (type === "entities" || activeTab === "entities") return Database;
    if (type === "pages" || activeTab === "pages") return Layout;
    return Zap;
  };

  const Icon = getIcon();

  // Detail view rendering
  if (selectedItem && !showBuilder) {
    return (
      <div className="max-w-5xl mx-auto -mt-6 min-h-screen">
        <PageHeader 
          title={selectedItem.name}
          description={activeTab === "entities" ? "Entity Template" : activeTab === "pages" ? "Page Template" : "Feature Template"}
        >
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setSelectedItem(null)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Icon className="h-6 w-6" />
            {selectedItem.is_custom && <Badge variant="outline">Custom</Badge>}
          </div>
        </PageHeader>

        <div className="flex gap-2 mb-6">
          <Button onClick={() => setShowBuilder(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="outline" onClick={() => handleDuplicate(selectedItem)}>
            <Copy className="h-4 w-4 mr-2" />
            Duplicate
          </Button>
          {selectedItem.is_custom && (
            <Button variant="outline" onClick={() => handleSaveToLibrary(selectedItem)}>
              <BookmarkPlus className="h-4 w-4 mr-2" />
              Save to Library
            </Button>
          )}
          <Button 
            variant="outline" 
            className="text-destructive ml-auto"
            onClick={() => handleDelete(selectedItem)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>

        {/* Entity Detail */}
        {activeTab === "entities" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Schema</CardTitle>
                <CardDescription>{selectedItem.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Fields</h4>
                    <div className="space-y-2">
                      {Object.entries(selectedItem.schema?.properties || {}).map(([field, config]) => (
                        <div key={field} className="flex items-center justify-between p-2 bg-muted rounded">
                          <div>
                            <span className="font-medium">{field}</span>
                            <span className="text-xs text-muted-foreground ml-2">({config.type})</span>
                          </div>
                          {selectedItem.schema?.required?.includes(field) && (
                            <Badge variant="outline" className="text-xs">Required</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  {selectedItem.relationships?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Relationships</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedItem.relationships.map((rel, i) => (
                          <Badge key={i} variant="outline">
                            {rel.target_entity} ({rel.relationship_type})
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Page Detail */}
        {activeTab === "pages" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Page Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <PagePreview page={selectedItem} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">{selectedItem.description}</p>
                {selectedItem.entities_used?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Entities Used</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedItem.entities_used.map(e => (
                        <Badge key={e} variant="outline">{e}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {selectedItem.features?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Features</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedItem.features.map(f => (
                        <Badge key={f} className="bg-accent-100 text-accent">{f}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Feature Detail */}
        {activeTab === "features" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Feature Details
                  <Badge className={complexityColors[selectedItem.complexity || "medium"]}>
                    {selectedItem.complexity || "medium"} complexity
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">{selectedItem.description}</p>
                
                {selectedItem.entities_used?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Entities Used</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedItem.entities_used.map(e => (
                        <Badge key={e} variant="outline">{e}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {selectedItem.triggers?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Triggers</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedItem.triggers.map(t => (
                        <Badge key={t} className="bg-info-50 text-info">{t}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {selectedItem.user_stories?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">User Stories</h4>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      {selectedItem.user_stories.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    );
  }

  // Main library view
  return (
    <div className="max-w-7xl mx-auto -mt-6 min-h-screen">
      <PageHeader 
        title={currentProject ? `Library: ${currentProject.name}` : "Template Library"}
        description={
          activeSection === "core" ? "Production-ready templates for entities, pages, and features" :
          activeSection === "community" ? "Community-shared templates and components" :
          activeSection === "forms" ? "Form and checklist templates" :
          activeSection === "business" ? "Business-specific templates" :
          "Workflow and automation templates"
        }
      >
        <Select value={activeSection} onValueChange={(v) => { setActiveSection(v); setActiveTab(v === "forms" ? "forms" : "entities"); }}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="core">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                Core Library
              </div>
            </SelectItem>
            <SelectItem value="community">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Community
              </div>
            </SelectItem>
            <SelectItem value="forms">
              <div className="flex items-center gap-2">
                <FileInput className="h-4 w-4" />
                Forms & Checklists
              </div>
            </SelectItem>
            <SelectItem value="business">
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Business Templates
              </div>
            </SelectItem>
            <SelectItem value="workflows">
              <div className="flex items-center gap-2">
                <GitBranch className="h-4 w-4" />
                Workflows
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </PageHeader>

      <Card className="border-border mb-4">
        <CardContent className="px-2 py-1">
          <div className="flex gap-2">
            <CustomProjectSelector
              selectedProjectId={selectedProjectId}
              onSelectProject={setSelectedProjectId}
            />
            <Button 
              variant="ghost"
              className="hover:bg-[#e9efeb] hover:text-[#273e2d]"
              onClick={() => setShowAIDialog(true)}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              AI Generate
            </Button>
            {activeTab !== "entities" && (
              <Button 
                variant="ghost"
                className="hover:bg-[#e9efeb] hover:text-[#273e2d]"
                onClick={() => setShowBulkAIDialog(true)} 
                disabled={projectEntities.length === 0}
              >
                <Database className="h-4 w-4 mr-2" />
                AI from Entities ({projectEntities.length})
              </Button>
            )}
            <Button 
              variant="ghost"
              className="hover:bg-[#e9efeb] hover:text-[#273e2d]"
              onClick={() => {
                if (activeSection === "core") {
                  const type = activeTab === "entities" ? "entity" : activeTab === "pages" ? "page" : "feature";
                  navigate(createPageUrl("LibraryItemBuilder") + `?type=${type}` + (selectedProjectId ? `&project=${selectedProjectId}` : ""));
                } else if (activeSection === "forms") {
                  if (activeTab === "forms") navigate(createPageUrl("FormBuilder"));
                  else navigate(createPageUrl("ChecklistBuilder"));
                } else if (activeSection === "business") {
                  navigate(createPageUrl("BusinessTemplates") + "?mode=new");
                } else if (activeSection === "workflows") {
                  navigate(createPageUrl("WorkflowDesigner"));
                }
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              New {
                activeSection === "core" ? (activeTab === "entities" ? "Entity" : activeTab === "pages" ? "Page" : "Feature") :
                activeSection === "forms" ? (activeTab === "forms" ? "Form" : "Checklist") :
                activeSection === "business" ? "Template" :
                activeSection === "workflows" ? "Workflow" :
                "Item"
              }
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          {activeSection === "core" && (
            <>
              <TabsTrigger value="entities">
                <Database className="h-4 w-4 mr-2" />
                Entities ({entities.filter(e => selectedProjectId ? e.custom_project_id === selectedProjectId : !e.custom_project_id).length})
              </TabsTrigger>
              <TabsTrigger value="pages">
                <Layout className="h-4 w-4 mr-2" />
                Pages ({pages.filter(p => selectedProjectId ? p.custom_project_id === selectedProjectId : !p.custom_project_id).length})
              </TabsTrigger>
              <TabsTrigger value="features">
                <Zap className="h-4 w-4 mr-2" />
                Features ({features.filter(f => selectedProjectId ? f.custom_project_id === selectedProjectId : !f.custom_project_id).length})
              </TabsTrigger>
            </>
          )}
          {activeSection === "community" && (
            <>
              <TabsTrigger value="entities">
                <Database className="h-4 w-4 mr-2" />
                Entities ({communityItems.filter(i => i.item_type === "entity").length})
              </TabsTrigger>
              <TabsTrigger value="pages">
                <Layout className="h-4 w-4 mr-2" />
                Pages ({communityItems.filter(i => i.item_type === "page").length})
              </TabsTrigger>
              <TabsTrigger value="features">
                <Zap className="h-4 w-4 mr-2" />
                Features ({communityItems.filter(i => i.item_type === "feature").length})
              </TabsTrigger>
            </>
          )}
          {activeSection === "forms" && (
            <>
              <TabsTrigger value="forms">
                <FileInput className="h-4 w-4 mr-2" />
                Forms ({formTemplates.length})
              </TabsTrigger>
              <TabsTrigger value="checklists">
                <ListChecks className="h-4 w-4 mr-2" />
                Checklists ({checklistTemplates.length})
              </TabsTrigger>
            </>
          )}
          {activeSection === "business" && (
            <TabsTrigger value="business">
              <Briefcase className="h-4 w-4 mr-2" />
              Templates ({businessTemplates.length})
            </TabsTrigger>
          )}
          {activeSection === "workflows" && (
            <TabsTrigger value="workflows">
              <GitBranch className="h-4 w-4 mr-2" />
              Workflows ({workflows.length})
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value={activeTab} className="mt-6 space-y-4">
          {/* Filters */}
          <div className="flex gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={`Search ${activeTab}...`}
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
                {getCurrentCategories().map((cat) => (
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

          {/* Items Grid */}
          <Card className="border-border">
            <CardContent className="p-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : filteredData.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Icon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No {activeTab} found</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-muted-foreground">
                      Showing {startIndex + 1}-{Math.min(endIndex, filteredData.length)} of {filteredData.length}
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
                        <span className="text-sm">Page {currentPage} of {totalPages}</span>
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

                  <div className="space-y-4">
                    {Object.entries(paginatedGrouped).map(([groupName, groupItems]) => {
                      const isExpanded = expandedGroups[groupName] === true;
                      return (
                        <Collapsible
                          key={groupName}
                          open={isExpanded}
                          onOpenChange={() => setExpandedGroups(prev => ({ ...prev, [groupName]: !isExpanded }))}
                        >
                          <Card className="border-border">
                            <CollapsibleTrigger className="w-full">
                              <CardHeader className="py-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                    <h3 className="font-medium">{groupName}</h3>
                                  </div>
                                  {!selectedProjectId && projects.length > 0 && availableGroups.includes(groupName) && (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-7 text-xs gap-1 hover:bg-[#e9efeb] hover:text-[#273e2d]"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setAddGroupToProject(groupName);
                                      }}
                                    >
                                      <FolderPlus className="h-3 w-3" />
                                      Add Group
                                    </Button>
                                  )}
                                </div>
                              </CardHeader>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              <CardContent className="pt-0 space-y-2">
                                {groupItems.map((item) => (
                                  <Card 
                                    key={item.id} 
                                    className="border-border hover:shadow-sm transition-shadow cursor-pointer"
                                    onClick={() => setSelectedItem(item)}
                                  >
                                    <CardContent className="p-4">
                                      <div className="flex items-center gap-4">
                                        <Icon className="h-5 w-5 flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-medium text-base">{item.name}</h3>
                                            {item.is_custom && <Badge variant="outline" className="text-xs">Custom</Badge>}
                                            {activeTab === "features" && (
                                              <Badge className={complexityColors[item.complexity || "medium"]}>
                                                {item.complexity || "medium"}
                                              </Badge>
                                            )}
                                          </div>
                                          <p className="text-sm text-muted-foreground line-clamp-1">{item.description}</p>
                                          <div className="flex items-center gap-3 mt-2">
                                            <div className="flex flex-wrap gap-1">
                                              {item.tags?.slice(0, 3).map((tag) => (
                                                <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                                              ))}
                                            </div>
                                          </div>
                                        </div>
                                        <div className="flex gap-1 flex-shrink-0">
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={(e) => { 
                                              e.stopPropagation(); 
                                              const type = activeTab === "entities" ? "entity" : activeTab === "pages" ? "page" : "feature";
                                              navigate(createPageUrl("LibraryItemBuilder") + `?type=${type}&id=${item.id}` + (selectedProjectId ? `&project=${selectedProjectId}` : ""));
                                            }}
                                            title="Edit"
                                          >
                                            <Edit className="h-3 w-3" />
                                          </Button>
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={(e) => { e.stopPropagation(); handleDuplicate(item); }}
                                            title="Duplicate"
                                          >
                                            <Copy className="h-3 w-3" />
                                          </Button>
                                          {!item.custom_project_id && projects.length > 0 && (
                                            <Button
                                              size="sm"
                                              variant="ghost"
                                              onClick={(e) => { e.stopPropagation(); setAddToProjectItem(item); }}
                                              title="Add to Project"
                                              className="text-primary"
                                            >
                                              <Folder className="h-3 w-3" />
                                            </Button>
                                          )}
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            className="text-destructive hover:text-destructive"
                                            onClick={(e) => { e.stopPropagation(); handleDelete(item); }}
                                            title="Delete"
                                          >
                                            <Trash2 className="h-3 w-3" />
                                          </Button>
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>
                                ))}
                              </CardContent>
                            </CollapsibleContent>
                          </Card>
                        </Collapsible>
                      );
                    })}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Builder Dialog */}
      <Dialog open={showBuilder} onOpenChange={setShowBuilder}>
        <DialogContent className="max-w-4xl h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {selectedItem?.id ? "Edit" : "Create"} {activeTab === "entities" ? "Entity" : activeTab === "pages" ? "Page" : "Feature"}
              {selectedProjectId && currentProject && (
                <Badge className="ml-2 bg-primary/10 text-primary">{currentProject.name}</Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          {activeTab === "entities" && (
            <EntityBuilder
              initialData={selectedItem}
              onSave={handleSave}
              onCancel={() => { setShowBuilder(false); setSelectedItem(null); }}
              isSaving={entityCreateMutation.isPending || entityUpdateMutation.isPending}
              existingGroups={availableGroups}
            />
          )}
          {activeTab === "pages" && (
            <PageBuilder
              initialData={selectedItem}
              entities={entities}
              onSave={handleSave}
              onCancel={() => { setShowBuilder(false); setSelectedItem(null); }}
              isSaving={pageCreateMutation.isPending || pageUpdateMutation.isPending}
            />
          )}
          {activeTab === "features" && (
            <FeatureBuilder
              initialData={selectedItem}
              entities={entities}
              onSave={handleSave}
              onCancel={() => { setShowBuilder(false); setSelectedItem(null); }}
              isSaving={featureCreateMutation.isPending || featureUpdateMutation.isPending}
            />
          )}
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

                    if (activeTab === "entities") entityCreateMutation.mutate(copy);
                    else if (activeTab === "pages") pageCreateMutation.mutate(copy);
                    else featureCreateMutation.mutate(copy);

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

      {/* Add Group to Project Dialog */}
      <AddGroupToProjectDialog
        open={!!addGroupToProject}
        onOpenChange={(v) => !v && setAddGroupToProject(null)}
        groupName={addGroupToProject}
        entities={entities.filter(e => e.group === addGroupToProject && !e.custom_project_id)}
        pages={pages.filter(p => p.group === addGroupToProject && !p.custom_project_id)}
        features={features.filter(f => f.group === addGroupToProject && !f.custom_project_id)}
        projects={projects}
        allEntities={entities}
        allPages={pages}
        allFeatures={features}
      />

      {/* AI Generate Dialog */}
      <Dialog open={showAIDialog} onOpenChange={setShowAIDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-accent" />
              Generate {activeTab === "entities" ? "Entity" : activeTab === "pages" ? "Page" : "Feature"} with AI
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder={
                activeTab === "entities" 
                  ? "Describe the entity...\n\nExample: Track invoices with customer, line items, amounts, due date, payment status"
                  : activeTab === "pages"
                  ? "Describe the page...\n\nExample: Dashboard showing project stats, recent tasks, upcoming deadlines with charts"
                  : "Describe the feature...\n\nExample: Send email notifications when task is assigned or status changes"
              }
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

      {/* Bulk AI Generate Dialog - for Pages/Features only */}
      {activeTab !== "entities" && (
        <Dialog open={showBulkAIDialog} onOpenChange={setShowBulkAIDialog}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Generate {activeTab === "pages" ? "Pages" : "Features"} from Entities
              </DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-auto space-y-4">
              {bulkGenerated.length === 0 ? (
                <>
                  <p className="text-sm text-muted-foreground">
                    AI will analyze {projectEntities.length} entities and suggest {activeTab}.
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
                    <Button onClick={async () => {
                      setIsBulkGenerating(true);
                      try {
                        const entitySummary = projectEntities.map(e => ({
                          name: e.name,
                          description: e.description,
                          fields: Object.keys(e.schema?.properties || {}).join(", ")
                        }));

                        const result = await base44.integrations.Core.InvokeLLM({
                          prompt: activeTab === "pages"
                            ? `Generate page templates for these entities:\n${JSON.stringify(entitySummary, null, 2)}`
                            : `Generate feature templates for these entities:\n${JSON.stringify(entitySummary, null, 2)}`,
                          response_json_schema: {
                            type: "object",
                            properties: {
                              [activeTab]: { type: "array", items: { type: "object" } }
                            }
                          }
                        });

                        const generated = result[activeTab] || [];
                        setBulkGenerated(generated);
                        setSelectedBulk(generated.map((_, i) => i));
                        toast.success(`Generated ${generated.length} suggestions`);
                      } catch (error) {
                        toast.error("Failed to generate");
                      } finally {
                        setIsBulkGenerating(false);
                      }
                    }} disabled={isBulkGenerating}>
                      {isBulkGenerating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Generate
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      {selectedBulk.length}/{bulkGenerated.length} selected
                    </p>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedBulk(selectedBulk.length === bulkGenerated.length ? [] : bulkGenerated.map((_, i) => i))}>
                      {selectedBulk.length === bulkGenerated.length ? "Deselect All" : "Select All"}
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {bulkGenerated.map((item, i) => (
                      <div 
                        key={i} 
                        className={`p-3 border rounded cursor-pointer ${selectedBulk.includes(i) ? "border-primary bg-primary/5" : ""}`}
                        onClick={() => setSelectedBulk(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i])}
                      >
                        <div className="flex gap-3">
                          <Checkbox checked={selectedBulk.includes(i)} />
                          <div className="flex-1">
                            <div className="font-medium">{item.name}</div>
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end gap-2 border-t pt-2">
                    <Button variant="outline" onClick={() => { setBulkGenerated([]); setSelectedBulk([]); }}>Regenerate</Button>
                    <Button onClick={async () => {
                      for (const i of selectedBulk) {
                        const data = { ...bulkGenerated[i], custom_project_id: selectedProjectId || null, is_custom: !!selectedProjectId };
                        if (activeTab === "pages") await base44.entities.PageTemplate.create(data);
                        else await base44.entities.FeatureTemplate.create(data);
                      }
                      queryClient.invalidateQueries();
                      toast.success(`Saved ${selectedBulk.length}`);
                      setShowBulkAIDialog(false);
                      setBulkGenerated([]);
                    }}>
                      <Check className="h-4 w-4 mr-2" />
                      Save {selectedBulk.length}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}