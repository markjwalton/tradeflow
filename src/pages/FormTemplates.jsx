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
} from "lucide-react";
import { toast } from "sonner";

const categoryColors = {
  survey: "bg-info-50 text-info-foreground",
  checkin: "bg-success-50 text-success-foreground",
  assessment: "bg-accent-100 text-accent-700",
  data_capture: "bg-info-50 text-info-foreground",
  approval: "bg-warning/10 text-warning-foreground",
  feedback: "bg-accent-100 text-accent-700",
  custom: "bg-muted text-muted-foreground",
};

export default function FormTemplates() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

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

  return (
    <div className="p-6 bg-[var(--color-background)] min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-light font-display text-[var(--color-midnight)]">Form Templates</h1>
          <p className="text-[var(--color-charcoal)]">Create and manage reusable form templates</p>
        </div>
        <Link to={createPageUrl("FormBuilder")}>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Form
          </Button>
        </Link>
      </div>

      <div className="flex gap-4 mb-6">
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
          <Loader2 className="h-8 w-8 animate-spin text-[var(--color-charcoal)]" />
        </div>
      ) : filteredForms.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 mx-auto opacity-30 mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium text-[var(--color-midnight)]">No forms found</h3>
          <p className="text-[var(--color-charcoal)] mb-4">
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
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredForms.map((form) => (
            <Card key={form.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {form.name}
                      {form.isActive !== false ? (
                        <CheckCircle className="h-4 w-4 text-success-foreground" />
                      ) : (
                        <XCircle className="h-4 w-4 text-muted-foreground" />
                      )}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{form.code}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <Link to={`${createPageUrl("FormBuilder")}?id=${form.id}`}>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                      </Link>
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
              </CardHeader>
              <CardContent>
                {form.description && (
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {form.description}
                  </p>
                )}
                <div className="flex flex-wrap gap-2">
                  {form.category && (
                    <Badge className={categoryColors[form.category]}>
                      {form.category}
                    </Badge>
                  )}
                  <Badge variant="outline">{form.fields?.length || 0} fields</Badge>
                </div>
                <div className="mt-4 pt-3 border-t flex justify-end">
                  <Link to={`${createPageUrl("FormBuilder")}?id=${form.id}`}>
                    <Button variant="outline" size="sm">
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}