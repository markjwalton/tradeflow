import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Library, FileText, Search } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";

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

export default function AddNodeDialog({
  open,
  onOpenChange,
  onAddCustomNode,
  onAddTemplateNode,
}) {
  const [activeTab, setActiveTab] = useState("custom");
  
  // Custom node state
  const [customName, setCustomName] = useState("");
  const [customType, setCustomType] = useState("sub_branch");
  const [customNotes, setCustomNotes] = useState("");
  
  // Template filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterArea, setFilterArea] = useState("all");

  // Fetch templates
  const { data: templates = [] } = useQuery({
    queryKey: ["nodeTemplates"],
    queryFn: () => base44.entities.NodeTemplate.list(),
  });

  // Get unique functional areas
  const functionalAreas = [...new Set(templates.map(t => t.functional_area).filter(Boolean))];

  // Filter templates
  const filteredTemplates = templates.filter(t => {
    const matchesSearch = !searchQuery || 
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.specification_notes?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === "all" || t.category === filterCategory;
    const matchesArea = filterArea === "all" || t.functional_area === filterArea;
    return matchesSearch && matchesCategory && matchesArea;
  });

  const handleAddCustom = () => {
    const typeConfig = nodeTypes.find(t => t.value === customType);
    onAddCustomNode({
      text: customName,
      node_type: customType,
      specification_notes: customNotes,
      color: typeConfig?.color || "#3b82f6",
    });
    resetCustomForm();
    onOpenChange(false);
  };

  const handleAddTemplate = (template) => {
    onAddTemplateNode({
      text: template.name,
      node_type: template.category,
      specification_notes: template.specification_notes,
      color: template.suggested_color || nodeTypes.find(t => t.value === template.category)?.color || "#3b82f6",
      template_id: template.id,
    });
    onOpenChange(false);
  };

  const resetCustomForm = () => {
    setCustomName("");
    setCustomType("sub_branch");
    setCustomNotes("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add Node
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="custom" className="gap-2">
              <FileText className="h-4 w-4" />
              Custom Node
            </TabsTrigger>
            <TabsTrigger value="template" className="gap-2">
              <Library className="h-4 w-4" />
              From Template
            </TabsTrigger>
          </TabsList>

          {/* Custom Node Tab */}
          <TabsContent value="custom" className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium">Node Name</label>
              <Input
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Enter node name..."
              />
            </div>

            <div>
              <label className="text-sm font-medium">Category</label>
              <Select value={customType} onValueChange={setCustomType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {nodeTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: type.color }}
                        />
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Specification Notes</label>
              <Textarea
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                placeholder="Enter detailed functional requirements..."
                rows={5}
              />
              <p className="text-xs text-gray-500 mt-1">
                Document detailed requirements, acceptance criteria, or implementation notes.
              </p>
            </div>

            <Button 
              className="w-full" 
              onClick={handleAddCustom}
              disabled={!customName}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Custom Node
            </Button>
          </TabsContent>

          {/* Template Tab */}
          <TabsContent value="template" className="space-y-4 mt-4">
            {/* Filters */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search templates..."
                  className="pl-9"
                />
              </div>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-36">
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
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Functional Area" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Areas</SelectItem>
                  {functionalAreas.map(area => (
                    <SelectItem key={area} value={area}>{area}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Template List */}
            <ScrollArea className="h-80">
              <div className="space-y-2 pr-4">
                {filteredTemplates.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Library className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p>No templates found.</p>
                    <p className="text-sm">Try adjusting your filters or create templates in the Template Library.</p>
                  </div>
                ) : (
                  filteredTemplates.map(template => (
                    <div
                      key={template.id}
                      className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => handleAddTemplate(template)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{template.name}</span>
                            <Badge className={categoryColors[template.category]}>
                              {template.category}
                            </Badge>
                            {template.functional_area && (
                              <Badge variant="outline">{template.functional_area}</Badge>
                            )}
                          </div>
                          {template.specification_notes && (
                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                              {template.specification_notes}
                            </p>
                          )}
                          {template.tags?.length > 0 && (
                            <div className="flex gap-1 mt-2">
                              {template.tags.map(tag => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <Button size="sm" variant="ghost">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}