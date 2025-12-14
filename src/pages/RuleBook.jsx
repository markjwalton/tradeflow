import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { 
  Plus, Loader2, BookOpen, Shield, Database, Layout, Zap, 
  Eye, TestTube, FileText, ChevronDown, ChevronRight,
  Edit, Trash2, AlertTriangle, Copy, Check
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/sturij";

const categories = [
  { value: "security", label: "Security", icon: Shield, color: "bg-destructive-50 text-destructive" },
  { value: "architecture", label: "Architecture", icon: Layout, color: "bg-accent-100 text-accent" },
  { value: "data", label: "Data", icon: Database, color: "bg-primary/10 text-primary" },
  { value: "ui_ux", label: "UI/UX", icon: Eye, color: "bg-accent-100 text-accent" },
  { value: "performance", label: "Performance", icon: Zap, color: "bg-warning/10 text-warning" },
  { value: "accessibility", label: "Accessibility", icon: Eye, color: "bg-success-50 text-success" },
  { value: "testing", label: "Testing", icon: TestTube, color: "bg-warning/10 text-warning" },
  { value: "documentation", label: "Documentation", icon: FileText, color: "bg-muted text-muted-foreground" },
  { value: "other", label: "Other", icon: BookOpen, color: "bg-muted text-muted-foreground" },
];

const priorities = [
  { value: "critical", label: "Critical", color: "bg-destructive text-white" },
  { value: "high", label: "High", color: "bg-warning text-white" },
  { value: "medium", label: "Medium", color: "bg-primary text-white" },
  { value: "low", label: "Low", color: "bg-muted text-muted-foreground" },
];

const enforcements = [
  { value: "must", label: "MUST", color: "text-destructive font-bold" },
  { value: "should", label: "SHOULD", color: "text-warning font-semibold" },
  { value: "could", label: "COULD", color: "text-muted-foreground" },
];

const emptyRule = {
  title: "",
  description: "",
  category: "other",
  priority: "medium",
  is_active: true,
  enforcement: "should",
  examples: [],
  tags: []
};

export default function RuleBook() {
  const queryClient = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [formData, setFormData] = useState(emptyRule);
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [exampleInput, setExampleInput] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [expandedCategories, setExpandedCategories] = useState({});
  const [copiedRules, setCopiedRules] = useState([]);

  const { data: rules = [], isLoading } = useQuery({
    queryKey: ["developmentRules"],
    queryFn: () => base44.entities.DevelopmentRule.list("-priority"),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.DevelopmentRule.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["developmentRules"] });
      toast.success("Rule added");
      handleCloseDialog();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.DevelopmentRule.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["developmentRules"] });
      toast.success("Rule updated");
      handleCloseDialog();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.DevelopmentRule.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["developmentRules"] });
      toast.success("Rule deleted");
    },
  });

  const handleOpenDialog = (rule = null) => {
    if (rule) {
      setEditingRule(rule);
      setFormData(rule);
    } else {
      setEditingRule(null);
      setFormData(emptyRule);
    }
    setShowDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setEditingRule(null);
    setFormData(emptyRule);
    setExampleInput("");
    setTagInput("");
  };

  const handleSave = () => {
    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (editingRule) {
      updateMutation.mutate({ id: editingRule.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleAddExample = () => {
    if (exampleInput.trim()) {
      setFormData({ ...formData, examples: [...(formData.examples || []), exampleInput.trim()] });
      setExampleInput("");
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...(formData.tags || []), tagInput.trim()] });
      setTagInput("");
    }
  };

  const toggleCategory = (cat) => {
    setExpandedCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const toggleRuleSelection = (ruleId) => {
    setCopiedRules(prev => 
      prev.includes(ruleId) ? prev.filter(id => id !== ruleId) : [...prev, ruleId]
    );
  };

  const copySelectedRules = () => {
    const selected = rules.filter(r => copiedRules.includes(r.id));
    const text = selected.map(r => {
      const enforcement = enforcements.find(e => e.value === r.enforcement)?.label || "SHOULD";
      return `[${r.category.toUpperCase()}] ${enforcement}: ${r.title}\n${r.description}`;
    }).join("\n\n");
    navigator.clipboard.writeText(text);
    toast.success(`${selected.length} rules copied to clipboard`);
  };

  // Filter and group rules
  const filteredRules = useMemo(() => {
    return rules.filter(rule => {
      const matchesCategory = filterCategory === "all" || rule.category === filterCategory;
      const matchesPriority = filterPriority === "all" || rule.priority === filterPriority;
      const matchesSearch = !searchQuery || 
        rule.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rule.description?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesPriority && matchesSearch;
    });
  }, [rules, filterCategory, filterPriority, searchQuery]);

  const groupedRules = useMemo(() => {
    const groups = {};
    categories.forEach(cat => { groups[cat.value] = []; });
    filteredRules.forEach(rule => {
      if (groups[rule.category]) {
        groups[rule.category].push(rule);
      }
    });
    // Sort by priority within each group
    Object.keys(groups).forEach(cat => {
      groups[cat].sort((a, b) => {
        const order = { critical: 0, high: 1, medium: 2, low: 3 };
        return order[a.priority] - order[b.priority];
      });
    });
    return groups;
  }, [filteredRules]);

  const getCategoryInfo = (cat) => categories.find(c => c.value === cat) || categories[8];
  const getPriorityInfo = (pri) => priorities.find(p => p.value === pri) || priorities[2];
  const getEnforcementInfo = (enf) => enforcements.find(e => e.value === enf) || enforcements[1];

  return (
    <div className="max-w-7xl mx-auto -mt-6 bg-background min-h-screen">
      <PageHeader 
        title="Development Rule Book"
        description="Maintain rules for AI-assisted development"
      >
        <div className="flex gap-2">
          {copiedRules.length > 0 && (
            <Button variant="outline" onClick={copySelectedRules}>
              <Copy className="h-4 w-4 mr-2" />
              Copy {copiedRules.length} Rules
            </Button>
          )}
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="h-4 w-4 mr-2" />
            Add Rule
          </Button>
        </div>
      </PageHeader>

      {/* Filters */}
      <div className="flex gap-4 mb-6 flex-wrap">
        <Input
          placeholder="Search rules..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-64"
        />
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(c => (
              <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterPriority} onValueChange={setFilterPriority}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            {priorities.map(p => (
              <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-4">
          {categories.map(category => {
            const catRules = groupedRules[category.value] || [];
            if (catRules.length === 0 && filterCategory !== "all") return null;
            const Icon = category.icon;
            const isExpanded = expandedCategories[category.value] !== false;
            const criticalCount = catRules.filter(r => r.priority === "critical").length;

            return (
              <Collapsible key={category.value} open={isExpanded} onOpenChange={() => toggleCategory(category.value)}>
                <Card>
                  <CollapsibleTrigger className="w-full">
                    <CardHeader className="py-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                          <Icon className="h-5 w-5" />
                          <h3 className="text-h5">{category.label}</h3>
                          <Badge variant="secondary">{catRules.length}</Badge>
                          {criticalCount > 0 && (
                            <Badge className="bg-destructive text-destructive-foreground">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              {criticalCount} Critical
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      {catRules.length === 0 ? (
                        <p className="text-muted-foreground text-sm py-4">No rules in this category</p>
                      ) : (
                        <div className="space-y-3">
                          {catRules.map(rule => {
                            const priInfo = getPriorityInfo(rule.priority);
                            const enfInfo = getEnforcementInfo(rule.enforcement);
                            const isSelected = copiedRules.includes(rule.id);

                            return (
                              <div 
                                key={rule.id} 
                                className={`border rounded-lg p-4 ${!rule.is_active ? "opacity-50" : ""} ${isSelected ? "ring-2 ring-primary" : ""}`}
                              >
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex items-start gap-3 flex-1">
                                    <button
                                      onClick={() => toggleRuleSelection(rule.id)}
                                      className={`mt-1 h-5 w-5 rounded border flex items-center justify-center ${isSelected ? "bg-primary border-primary text-white" : "border-border"}`}
                                    >
                                      {isSelected && <Check className="h-3 w-3" />}
                                    </button>
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 flex-wrap mb-1">
                                        <Badge className={priInfo.color}>{priInfo.label}</Badge>
                                        <span className={enfInfo.color}>{enfInfo.label}:</span>
                                        <span className="font-medium">{rule.title}</span>
                                        {!rule.is_active && <Badge variant="outline">Inactive</Badge>}
                                      </div>
                                      <p className="text-sm text-muted-foreground mb-2">{rule.description}</p>
                                      {rule.examples?.length > 0 && (
                                        <div className="text-xs text-muted-foreground mt-2">
                                          <span className="font-medium">Examples:</span>
                                          <ul className="list-disc list-inside">
                                            {rule.examples.map((ex, i) => <li key={i}>{ex}</li>)}
                                          </ul>
                                        </div>
                                      )}
                                      {rule.tags?.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-2">
                                          {rule.tags.map(tag => (
                                            <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(rule)}>
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteMutation.mutate(rule.id)}>
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            );
          })}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingRule ? "Edit Rule" : "Add Development Rule"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Title *</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Always validate user input"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Category</label>
                <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {categories.map(c => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Priority</label>
                <Select value={formData.priority} onValueChange={(v) => setFormData({ ...formData, priority: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {priorities.map(p => (
                      <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Enforcement</label>
                <Select value={formData.enforcement} onValueChange={(v) => setFormData({ ...formData, enforcement: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {enforcements.map(e => (
                      <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Detailed explanation of the rule..."
                rows={3}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Examples</label>
              <div className="flex gap-2">
                <Input
                  value={exampleInput}
                  onChange={(e) => setExampleInput(e.target.value)}
                  placeholder="Add example..."
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddExample())}
                />
                <Button type="button" variant="outline" onClick={handleAddExample}>Add</Button>
              </div>
              {formData.examples?.length > 0 && (
                <ul className="mt-2 text-sm list-disc list-inside">
                  {formData.examples.map((ex, i) => (
                    <li key={i} className="flex items-center justify-between">
                      <span>{ex}</span>
                      <Button variant="ghost" size="sm" onClick={() => setFormData({...formData, examples: formData.examples.filter((_, idx) => idx !== i)})}>×</Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <label className="text-sm font-medium">Tags</label>
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add tag..."
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                />
                <Button type="button" variant="outline" onClick={handleAddTag}>Add</Button>
              </div>
              {formData.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {formData.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => setFormData({...formData, tags: formData.tags.filter(t => t !== tag)})}>
                      {tag} ×
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={formData.is_active}
                onCheckedChange={(v) => setFormData({ ...formData, is_active: v })}
              />
              <label className="text-sm">Active</label>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={handleCloseDialog}>Cancel</Button>
              <Button onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending}>
                {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}