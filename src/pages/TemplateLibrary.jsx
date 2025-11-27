import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Plus, Search, Pencil, Trash2, Loader2, Library, Copy } from "lucide-react";
import { toast } from "sonner";

const nodeTypes = [
  { value: "central", label: "Central Topic", color: "#3b82f6" },
  { value: "main_branch", label: "Main Branch", color: "#10b981" },
  { value: "sub_branch", label: "Sub Branch", color: "#f59e0b" },
  { value: "feature", label: "Feature", color: "#8b5cf6" },
  { value: "entity", label: "Entity", color: "#ec4899" },
  { value: "page", label: "Page", color: "#06b6d4" },
  { value: "note", label: "Note", color: "#84cc16" },
];

const categoryColors = {
  central: "bg-blue-100 text-blue-700",
  main_branch: "bg-green-100 text-green-700",
  sub_branch: "bg-amber-100 text-amber-700",
  feature: "bg-purple-100 text-purple-700",
  entity: "bg-pink-100 text-pink-700",
  page: "bg-cyan-100 text-cyan-700",
  note: "bg-lime-100 text-lime-700",
};

const defaultFunctionalAreas = [
  "User Management",
  "Authentication",
  "Finance",
  "Operations",
  "Reporting",
  "Communications",
  "Inventory",
  "CRM",
  "HR",
  "Project Management",
];

export default function TemplateLibrary() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterArea, setFilterArea] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "sub_branch",
    functional_area: "",
    specification_notes: "",
    suggested_color: "",
    tags: [],
    is_global: true,
  });
  const [tagInput, setTagInput] = useState("");

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ["nodeTemplates"],
    queryFn: () => base44.entities.NodeTemplate.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.NodeTemplate.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nodeTemplates"] });
      setShowForm(false);
      resetForm();
      toast.success("Template created");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.NodeTemplate.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nodeTemplates"] });
      setShowForm(false);
      setEditingTemplate(null);
      resetForm();
      toast.success("Template updated");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.NodeTemplate.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nodeTemplates"] });
      toast.success("Template deleted");
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      category: "sub_branch",
      functional_area: "",
      specification_notes: "",
      suggested_color: "",
      tags: [],
      is_global: true,
    });
    setTagInput("");
  };

  const handleEdit = (template) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name || "",
      category: template.category || "sub_branch",
      functional_area: template.functional_area || "",
      specification_notes: template.specification_notes || "",
      suggested_color: template.suggested_color || "",
      tags: template.tags || [],
      is_global: template.is_global !== false,
    });
    setShowForm(true);
  };

  const handleDuplicate = (template) => {
    setFormData({
      name: `${template.name} (Copy)`,
      category: template.category || "sub_branch",
      functional_area: template.functional_area || "",
      specification_notes: template.specification_notes || "",
      suggested_color: template.suggested_color || "",
      tags: template.tags || [],
      is_global: true,
    });
    setEditingTemplate(null);
    setShowForm(true);
  };

  const handleSubmit = () => {
    const data = {
      ...formData,
      suggested_color: formData.suggested_color || nodeTypes.find(t => t.value === formData.category)?.color,
    };
    
    if (editingTemplate) {
      updateMutation.mutate({ id: editingTemplate.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleAddTag = () => {
    if (tagInput && !formData.tags.includes(tagInput)) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput] });
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) });
  };

  // Get unique functional areas from existing templates
  const existingAreas = [...new Set(templates.map(t => t.functional_area).filter(Boolean))];
  const allAreas = [...new Set([...defaultFunctionalAreas, ...existingAreas])].sort();

  const filteredTemplates = templates.filter(t => {
    const matchesSearch = !search || 
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.specification_notes?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = filterCategory === "all" || t.category === filterCategory;
    const matchesArea = filterArea === "all" || t.functional_area === filterArea;
    return matchesSearch && matchesCategory && matchesArea;
  });

  // Group templates by functional area
  const groupedTemplates = filteredTemplates.reduce((acc, template) => {
    const area = template.functional_area || "Uncategorized";
    if (!acc[area]) acc[area] = [];
    acc[area].push(template);
    return acc;
  }, {});

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Library className="h-6 w-6" />
            Node Template Library
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Create and manage reusable node templates with functional specifications
          </p>
        </div>
        <Button onClick={() => { resetForm(); setEditingTemplate(null); setShowForm(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          New Template
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {nodeTypes.map(type => (
              <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterArea} onValueChange={setFilterArea}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Functional Area" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Areas</SelectItem>
            {allAreas.map(area => (
              <SelectItem key={area} value={area}>{area}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Templates grouped by area */}
      {Object.keys(groupedTemplates).length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Library className="h-16 w-16 mx-auto mb-4 opacity-30" />
          <p className="text-lg">No templates yet</p>
          <p className="text-sm">Create your first template to start building your library.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedTemplates).sort().map(([area, areaTemplates]) => (
            <div key={area}>
              <h2 className="text-lg font-semibold mb-3 text-gray-700">{area}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {areaTemplates.map(template => (
                  <Card key={template.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: template.suggested_color || nodeTypes.find(t => t.value === template.category)?.color }}
                          />
                          <CardTitle className="text-base">{template.name}</CardTitle>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDuplicate(template)}>
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(template)}>
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => deleteMutation.mutate(template.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Badge className={categoryColors[template.category]}>{template.category}</Badge>
                      
                      {template.specification_notes && (
                        <p className="text-sm text-gray-600 line-clamp-3">
                          {template.specification_notes}
                        </p>
                      )}
                      
                      {template.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {template.tags.map(tag => (
                            <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingTemplate ? "Edit Template" : "New Template"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., User Authentication"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Category</label>
                <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {nodeTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: type.color }} />
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Functional Area</label>
                <Select value={formData.functional_area} onValueChange={(v) => setFormData({ ...formData, functional_area: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select area..." />
                  </SelectTrigger>
                  <SelectContent>
                    {allAreas.map(area => (
                      <SelectItem key={area} value={area}>{area}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Specification Notes</label>
              <Textarea
                value={formData.specification_notes}
                onChange={(e) => setFormData({ ...formData, specification_notes: e.target.value })}
                placeholder="Detailed functional requirements, acceptance criteria, implementation notes..."
                rows={5}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Tags</label>
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add tag..."
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                />
                <Button variant="outline" onClick={handleAddTag}>Add</Button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {formData.tags.map(tag => (
                    <Badge 
                      key={tag} 
                      variant="secondary" 
                      className="cursor-pointer"
                      onClick={() => handleRemoveTag(tag)}
                    >
                      {tag} ×
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <Button 
              className="w-full" 
              onClick={handleSubmit}
              disabled={!formData.name || createMutation.isPending || updateMutation.isPending}
            >
              {(createMutation.isPending || updateMutation.isPending) && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              {editingTemplate ? "Update Template" : "Create Template"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}