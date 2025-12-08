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
  ListChecks,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

const categoryColors = {
  quality: "bg-info-50 text-info",
  safety: "bg-destructive-50 text-destructive",
  compliance: "bg-accent-100 text-accent",
  preparation: "bg-success-50 text-success",
  verification: "bg-warning/10 text-warning",
  custom: "bg-muted text-muted-foreground",
};

export default function ChecklistTemplates() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const { data: checklists = [], isLoading } = useQuery({
    queryKey: ["checklistTemplates"],
    queryFn: () => base44.entities.ChecklistTemplate.list(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ChecklistTemplate.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checklistTemplates"] });
      toast.success("Checklist deleted");
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: async (checklist) => {
      return base44.entities.ChecklistTemplate.create({
        name: `${checklist.name} (Copy)`,
        code: `${checklist.code}_copy_${Date.now()}`,
        description: checklist.description,
        category: checklist.category,
        items: checklist.items,
        requireAllItems: checklist.requireAllItems,
        isActive: false,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checklistTemplates"] });
      toast.success("Checklist duplicated");
    },
  });

  const filteredChecklists = checklists.filter((cl) => {
    const matchesSearch =
      !search ||
      cl.name?.toLowerCase().includes(search.toLowerCase()) ||
      cl.code?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || cl.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-6 bg-background min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-light font-display text-midnight-900">Checklist Templates</h1>
          <p className="text-charcoal-700">Create and manage reusable checklists</p>
        </div>
        <Link to={createPageUrl("ChecklistBuilder")}>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Checklist
          </Button>
        </Link>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search checklists..."
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
            <SelectItem value="quality">Quality</SelectItem>
            <SelectItem value="safety">Safety</SelectItem>
            <SelectItem value="compliance">Compliance</SelectItem>
            <SelectItem value="preparation">Preparation</SelectItem>
            <SelectItem value="verification">Verification</SelectItem>
            <SelectItem value="custom">Custom</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : filteredChecklists.length === 0 ? (
        <div className="text-center py-12">
          <ListChecks className="h-12 w-12 mx-auto opacity-30 mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium text-midnight-900">No checklists found</h3>
          <p className="text-charcoal-700 mb-4">
            {search || categoryFilter !== "all"
              ? "Try adjusting your filters"
              : "Create your first checklist template"}
          </p>
          {!search && categoryFilter === "all" && (
            <Link to={createPageUrl("ChecklistBuilder")}>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Checklist
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredChecklists.map((checklist) => (
            <Card key={checklist.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {checklist.name}
                      {checklist.isActive !== false ? (
                        <CheckCircle className="h-4 w-4 text-success" />
                      ) : (
                        <XCircle className="h-4 w-4 text-muted-foreground" />
                      )}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{checklist.code}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <Link to={`${createPageUrl("ChecklistBuilder")}?id=${checklist.id}`}>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                      </Link>
                      <DropdownMenuItem onClick={() => duplicateMutation.mutate(checklist)}>
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => deleteMutation.mutate(checklist.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                {checklist.description && (
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {checklist.description}
                  </p>
                )}
                <div className="flex flex-wrap gap-2">
                  {checklist.category && (
                    <Badge className={categoryColors[checklist.category]}>
                      {checklist.category}
                    </Badge>
                  )}
                  <Badge variant="outline">{checklist.items?.length || 0} items</Badge>
                </div>
                <div className="mt-4 pt-3 border-t flex justify-end">
                  <Link to={`${createPageUrl("ChecklistBuilder")}?id=${checklist.id}`}>
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