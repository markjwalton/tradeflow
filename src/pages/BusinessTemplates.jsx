import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { Plus, Edit2, Trash2, Building2, Search, Database, Layout, Zap, GitBranch, Loader2, Star, Folder, ChevronDown, ChevronRight } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import CustomProjectSelector from "@/components/library/CustomProjectSelector";
import { toast } from "sonner";
import BusinessTemplateBuilder from "@/components/templates/BusinessTemplateBuilder";
import { PageHeader } from "@/components/sturij";

const categories = [
  "Professional Services",
  "Construction", 
  "Retail",
  "Healthcare",
  "Technology",
  "Manufacturing",
  "Finance",
  "Education",
  "Custom",
  "Other"
];

const categoryColors = {
  "Professional Services": "bg-info-50 text-info",
  "Construction": "bg-warning/10 text-warning",
  "Retail": "bg-accent-100 text-accent",
  "Healthcare": "bg-success-50 text-success",
  "Technology": "bg-accent-100 text-accent",
  "Manufacturing": "bg-warning/10 text-warning",
  "Finance": "bg-success-50 text-success",
  "Education": "bg-info-50 text-info",
  "Custom": "bg-primary/10 text-primary",
  "Other": "bg-muted text-muted-foreground",
};

export default function BusinessTemplates() {
  const queryClient = useQueryClient();
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [expandedGroups, setExpandedGroups] = useState({});

  const { data: projects = [] } = useQuery({
    queryKey: ["customProjects"],
    queryFn: () => base44.entities.CustomProject.list(),
  });

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ["businessTemplates"],
    queryFn: () => base44.entities.BusinessTemplate.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.BusinessTemplate.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["businessTemplates"] });
      resetForm();
      toast.success("Template created");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.BusinessTemplate.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["businessTemplates"] });
      resetForm();
      toast.success("Template updated");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.BusinessTemplate.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["businessTemplates"] });
      toast.success("Template deleted");
    },
  });

  const resetForm = () => {
    setEditingTemplate(null);
    setShowBuilder(false);
  };

  const handleEdit = (template) => {
    setEditingTemplate(template);
    setShowBuilder(true);
  };

  const handleSave = (data) => {
    const dataToSave = {
      ...data,
      custom_project_id: selectedProjectId || null,
      category: selectedProjectId ? "Custom" : data.category
    };
    
    if (editingTemplate) {
      updateMutation.mutate({ id: editingTemplate.id, data: dataToSave });
    } else {
      createMutation.mutate(dataToSave);
    }
  };

  const toggleStar = async (template) => {
    await base44.entities.BusinessTemplate.update(template.id, {
      is_starred: !template.is_starred
    });
    queryClient.invalidateQueries({ queryKey: ["businessTemplates"] });
    toast.success(template.is_starred ? "Removed from featured" : "Added to featured");
  };

  const filteredTemplates = templates.filter(t => {
    const matchesSearch = !searchQuery || 
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === "all" || t.category === filterCategory;
    
    // Project filter
    if (selectedProjectId) {
      return matchesSearch && matchesCategory && t.custom_project_id === selectedProjectId;
    } else {
      return matchesSearch && matchesCategory && !t.custom_project_id;
    }
  });

  // Group templates by category
  const groupedTemplates = filteredTemplates.reduce((acc, template) => {
    const groupKey = template.category || "Other";
    if (!acc[groupKey]) acc[groupKey] = [];
    acc[groupKey].push(template);
    return acc;
  }, {});

  const currentProject = projects.find(p => p.id === selectedProjectId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto -mt-6 min-h-screen">
      <PageHeader 
        title={currentProject ? `Business Templates: ${currentProject.name}` : "Business Templates"}
        description="Pre-defined templates with entities, pages, and features"
      />

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
              onClick={() => setShowBuilder(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Template
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search templates..."
            className="pl-9"
          />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(cat => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="border-border">
        <CardContent className="p-4">
          <div className="space-y-4">
            {Object.entries(groupedTemplates).map(([groupName, groupTemplates]) => {
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
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="pt-0 space-y-2">
                        {groupTemplates.map((template) => (
                          <Card key={template.id} className="border-border hover:shadow-sm transition-shadow">
                            <CardContent className="p-4">
                              <div className="flex items-center gap-4">
                                <Building2 className="h-5 w-5 text-info flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    {template.is_starred && <Star className="h-4 w-4 fill-warning text-warning flex-shrink-0" />}
                                    <h3 className="font-medium text-base">{template.name}</h3>
                                    <Badge className={categoryColors[template.category || "Other"]}>
                                      {template.category || "Other"}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                                    {template.summary || template.description}
                                  </p>
                                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                      <Database className="h-3 w-3" />
                                      {template.entities?.length || 0} entities
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Layout className="h-3 w-3" />
                                      {template.pages?.length || 0} pages
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Zap className="h-3 w-3" />
                                      {template.features?.length || 0} features
                                    </span>
                                  </div>
                                  {template.tags?.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                      {template.tags.slice(0, 3).map(tag => (
                                        <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                <div className="flex gap-1 flex-shrink-0">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => toggleStar(template)}
                                    title={template.is_starred ? "Remove from featured" : "Add to featured"}
                                  >
                                    <Star className={`h-3 w-3 ${template.is_starred ? "fill-warning text-warning" : ""}`} />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleEdit(template)}
                                    title="Edit"
                                  >
                                    <Edit2 className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-destructive hover:text-destructive"
                                    onClick={() => deleteMutation.mutate(template.id)}
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

            {filteredTemplates.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Building2 className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>No templates found</p>
                <Button variant="link" onClick={() => setShowBuilder(true)}>
                  Create your first template
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Builder Dialog */}
      <Dialog open={showBuilder} onOpenChange={(open) => !open && resetForm()}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? "Edit Template" : "New Business Template"}
            </DialogTitle>
          </DialogHeader>
          <BusinessTemplateBuilder
            initialData={editingTemplate}
            onSave={handleSave}
            onCancel={resetForm}
            isSaving={createMutation.isPending || updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}