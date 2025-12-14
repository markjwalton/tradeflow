import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Search,
  MoreVertical,
  Edit,
  Copy,
  Trash2,
  Loader2,
  FileText,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { toast } from "sonner";
import { PageHeader } from "@/components/sturij";

const categoryColors = {
  survey: "bg-info-50 text-info",
  checkin: "bg-success-50 text-success",
  assessment: "bg-accent-100 text-accent",
  data_capture: "bg-info-50 text-info",
  approval: "bg-warning/10 text-warning",
  feedback: "bg-accent-100 text-accent",
  custom: "bg-muted text-muted-foreground",
};

export default function FormTemplates() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [collapsedCategories, setCollapsedCategories] = useState(() => {
    // Initialize all categories as collapsed
    return {};
  });

  const { data: forms = [], isLoading } = useQuery({
    queryKey: ["formTemplates"],
    queryFn: () => base44.entities.FormTemplate.list(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.FormTemplate.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["formTemplates"] });
      toast.success("Form deleted");
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: async (form) => {
      return base44.entities.FormTemplate.create({
        name: `${form.name} (Copy)`,
        code: `${form.code}_copy_${Date.now()}`,
        description: form.description,
        category: form.category,
        fields: form.fields,
        sections: form.sections,
        submitButtonText: form.submitButtonText,
        successMessage: form.successMessage,
        isActive: false,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["formTemplates"] });
      toast.success("Form duplicated");
    },
  });

  const filteredForms = forms.filter((form) => {
    const matchesSearch =
      !search ||
      form.name?.toLowerCase().includes(search.toLowerCase()) ||
      form.code?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || form.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const formsByCategory = filteredForms.reduce((acc, form) => {
    const category = form.category || "custom";
    if (!acc[category]) acc[category] = [];
    acc[category].push(form);
    return acc;
  }, {});

  const categories = Object.keys(formsByCategory).sort();

  const toggleCategory = (category) => {
    setCollapsedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  // Check if category should be open (default collapsed unless explicitly opened)
  const isCategoryOpen = (category) => {
    return collapsedCategories[category] === true;
  };

  return (
    <div className="max-w-7xl mx-auto -mt-6 min-h-screen">
      <PageHeader 
        title="Form Templates"
        description="Create and manage reusable form templates"
      />

      {/* ActionBar Card */}
      <Card className="border-border mb-4">
        <CardContent className="flex items-center justify-end p-4">
          <Link to={createPageUrl("FormBuilder")}>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Form
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Search & Filters */}
      <div className="flex gap-4 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search forms..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="survey">Survey</SelectItem>
            <SelectItem value="checkin">Check-in</SelectItem>
            <SelectItem value="assessment">Assessment</SelectItem>
            <SelectItem value="data_capture">Data Capture</SelectItem>
            <SelectItem value="approval">Approval</SelectItem>
            <SelectItem value="feedback">Feedback</SelectItem>
            <SelectItem value="custom">Custom</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : filteredForms.length === 0 ? (
        <Card className="border-border">
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 mx-auto opacity-30 mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium text-foreground">No forms found</h3>
            <p className="text-muted-foreground mb-4">
              {search || categoryFilter !== "all"
                ? "Try adjusting your filters"
                : "Create your first form template"}
            </p>
            {!search && categoryFilter === "all" && (
              <Link to={createPageUrl("FormBuilder")}>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Form
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {categories.map((category) => {
            const categoryForms = formsByCategory[category];
            const isOpen = isCategoryOpen(category);
            
            return (
              <Card key={category} className="border-border">
                <Collapsible open={isOpen} onOpenChange={() => toggleCategory(category)}>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {isOpen ? (
                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                          )}
                          <CardTitle className="text-lg capitalize">
                            {category.replace(/_/g, " ")}
                          </CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="space-y-3 pt-0 p-4">
                      {categoryForms.map((form) => (
                        <div key={form.id} className="bg-card border border-border rounded-lg hover:shadow-md transition-shadow p-4">
                          <div className="flex items-center gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-h3">{form.name}</h3>
                                {form.isActive !== false ? (
                                  <CheckCircle className="h-4 w-4 text-success" />
                                ) : (
                                  <XCircle className="h-4 w-4 text-muted-foreground" />
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">{form.code}</p>
                              {form.description && (
                                <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                                  {form.description}
                                </p>
                              )}
                            </div>

                            <div className="flex gap-2">
                              <Link to={`${createPageUrl("FormBuilder")}?id=${form.id}`}>
                                <Button variant="ghost" size="sm" className="hover:bg-[#e9efeb] hover:text-[#273e2d]">
                                  <Edit className="h-4 w-4 mr-1" />
                                  Edit
                                </Button>
                              </Link>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => duplicateMutation.mutate(form)}>
                                    <Copy className="h-4 w-4 mr-2" />
                                    Duplicate
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() => deleteMutation.mutate(form.id)}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}