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
import { Plus, Edit2, Trash2, Building2, Search, Database, Layout, Zap, GitBranch, Loader2 } from "lucide-react";
import { toast } from "sonner";
import BusinessTemplateBuilder from "@/components/templates/BusinessTemplateBuilder";

const categories = [
  "Professional Services",
  "Construction", 
  "Retail",
  "Healthcare",
  "Technology",
  "Manufacturing",
  "Finance",
  "Education",
  "Other"
];

const categoryColors = {
  "Professional Services": "bg-blue-100 text-blue-700",
  "Construction": "bg-amber-100 text-amber-700",
  "Retail": "bg-pink-100 text-pink-700",
  "Healthcare": "bg-green-100 text-green-700",
  "Technology": "bg-purple-100 text-purple-700",
  "Manufacturing": "bg-orange-100 text-orange-700",
  "Finance": "bg-emerald-100 text-emerald-700",
  "Education": "bg-cyan-100 text-cyan-700",
  "Other": "bg-gray-100 text-gray-700",
};

export default function BusinessTemplates() {
  const queryClient = useQueryClient();
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

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
    if (editingTemplate) {
      updateMutation.mutate({ id: editingTemplate.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const filteredTemplates = templates.filter(t => {
    const matchesSearch = !searchQuery || 
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === "all" || t.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Building2 className="h-6 w-6" />
            Business Templates
          </h1>
          <p className="text-gray-500 mt-1">
            Pre-defined templates with entities, pages, and features
          </p>
        </div>
        <Button onClick={() => setShowBuilder(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Template
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
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

      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  {template.category && (
                    <Badge className={`mt-1 ${categoryColors[template.category]}`}>
                      {template.category}
                    </Badge>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={() => handleEdit(template)}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="text-red-500 hover:text-red-600"
                    onClick={() => deleteMutation.mutate(template.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {template.summary ? (
                <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                  {template.summary}
                </p>
              ) : template.description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {template.description}
                </p>
              )}
              
              {/* Stats */}
              <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
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
              
              {/* Relationships & Workflows */}
              {(template.entity_relationships?.length > 0 || template.workflows?.length > 0) && (
                <div className="flex items-center gap-2 text-xs text-purple-600 mb-3">
                  <GitBranch className="h-3 w-3" />
                  <span>
                    {template.entity_relationships?.length || 0} relationships, {template.workflows?.length || 0} workflows
                  </span>
                </div>
              )}
              
              {template.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {template.tags.slice(0, 3).map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {template.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{template.tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {filteredTemplates.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500">
            <Building2 className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>No templates found</p>
            <Button variant="link" onClick={() => setShowBuilder(true)}>
              Create your first template
            </Button>
          </div>
        )}
      </div>

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