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
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { toast } from "sonner";
import { PageHeader } from "@/components/sturij";

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
  const [collapsedCategories, setCollapsedCategories] = useState({});

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

  const checklistsByCategory = filteredChecklists.reduce((acc, checklist) => {
    const category = checklist.category || "custom";
    if (!acc[category]) acc[category] = [];
    acc[category].push(checklist);
    return acc;
  }, {});

  const categories = Object.keys(checklistsByCategory).sort();

  const toggleCategory = (category) => {
    setCollapsedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  return (
    <div className="max-w-7xl mx-auto -mt-6 bg-background min-h-screen">
      <PageHeader 
        title="Checklist Templates"
        description="Create and manage reusable checklists"
      />

      {/* ActionBar Card */}
      <Card className="border-border mb-4">
        <CardContent className="flex items-center justify-between p-4">
          <div className="text-sm text-muted-foreground">
            {filteredChecklists.length} checklist{filteredChecklists.length !== 1 ? 's' : ''}
          </div>
          <Link to={createPageUrl("ChecklistBuilder")}>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Checklist
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Search & Filters */}
      <div className="flex gap-4 mb-4">
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
        <Card className="border-border">
          <CardContent className="text-center py-12">
            <ListChecks className="h-12 w-12 mx-auto opacity-30 mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium text-foreground">No checklists found</h3>
            <p className="text-muted-foreground mb-4">
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
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {categories.map((category) => {
            const categoryChecklists = checklistsByCategory[category];
            const isOpen = !collapsedCategories[category];
            
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
                            {category}
                          </CardTitle>
                          <Badge variant="outline">{categoryChecklists.length}</Badge>
                        </div>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="space-y-3 pt-0 p-4">
                      {categoryChecklists.map((checklist) => (
                        <Card key={checklist.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="text-h3">{checklist.name}</h3>
                                  {checklist.isActive !== false ? (
                                    <CheckCircle className="h-4 w-4 text-success" />
                                  ) : (
                                    <XCircle className="h-4 w-4 text-muted-foreground" />
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">{checklist.code}</p>
                                {checklist.description && (
                                  <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                                    {checklist.description}
                                  </p>
                                )}
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline">{checklist.items?.length || 0} items</Badge>
                                </div>
                              </div>

                              <div className="flex gap-2">
                                <Link to={`${createPageUrl("ChecklistBuilder")}?id=${checklist.id}`}>
                                  <Button variant="outline" size="sm">
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
                            </div>
                          </CardContent>
                        </Card>
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