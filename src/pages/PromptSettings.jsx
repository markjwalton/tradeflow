import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { Plus, Edit, Trash2, Loader2, Sparkles, Star } from "lucide-react";
import { toast } from "sonner";

const contextTypes = [
  { value: "general", label: "General" },
  { value: "project_name", label: "Project Name" },
  { value: "project_description", label: "Project Description" },
  { value: "task_description", label: "Task Description" },
  { value: "customer_notes", label: "Customer Notes" },
  { value: "requirements", label: "Requirements" },
  { value: "feedback", label: "Feedback" },
  { value: "survey_notes", label: "Survey Notes" },
  { value: "custom", label: "Custom" },
];

const outputFormats = [
  { value: "text", label: "Plain Text" },
  { value: "structured", label: "Structured" },
  { value: "list", label: "List" },
  { value: "summary", label: "Summary" },
];

const emptyPrompt = {
  name: "",
  description: "",
  context_type: "general",
  system_prompt: "",
  output_format: "text",
  is_active: true,
  is_default: false,
  tags: []
};

export default function PromptSettings() {
  const queryClient = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState(null);
  const [formData, setFormData] = useState(emptyPrompt);
  const [filterContext, setFilterContext] = useState("all");

  const { data: prompts = [], isLoading } = useQuery({
    queryKey: ["promptTemplates"],
    queryFn: () => base44.entities.PromptTemplate.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.PromptTemplate.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promptTemplates"] });
      toast.success("Prompt created");
      handleCloseDialog();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.PromptTemplate.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promptTemplates"] });
      toast.success("Prompt updated");
      handleCloseDialog();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.PromptTemplate.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promptTemplates"] });
      toast.success("Prompt deleted");
    },
  });

  const handleOpenDialog = (prompt = null) => {
    if (prompt) {
      setEditingPrompt(prompt);
      setFormData(prompt);
    } else {
      setEditingPrompt(null);
      setFormData(emptyPrompt);
    }
    setShowDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setEditingPrompt(null);
    setFormData(emptyPrompt);
  };

  const handleSave = () => {
    if (!formData.name || !formData.system_prompt) {
      toast.error("Name and system prompt are required");
      return;
    }

    if (editingPrompt) {
      updateMutation.mutate({ id: editingPrompt.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleSetDefault = async (prompt) => {
    // Unset current default for this context
    const currentDefault = prompts.find(
      p => p.context_type === prompt.context_type && p.is_default && p.id !== prompt.id
    );
    if (currentDefault) {
      await base44.entities.PromptTemplate.update(currentDefault.id, { is_default: false });
    }
    await base44.entities.PromptTemplate.update(prompt.id, { is_default: true });
    queryClient.invalidateQueries({ queryKey: ["promptTemplates"] });
    toast.success("Default prompt updated");
  };

  const filteredPrompts = filterContext === "all" 
    ? prompts 
    : prompts.filter(p => p.context_type === filterContext);

  const groupedPrompts = filteredPrompts.reduce((acc, prompt) => {
    const key = prompt.context_type || "general";
    if (!acc[key]) acc[key] = [];
    acc[key].push(prompt);
    return acc;
  }, {});

  return (
    <div className="p-6 bg-background min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-light font-display flex items-center gap-2 text-midnight-900">
            <Sparkles className="h-6 w-6 text-accent" />
            Prompt Settings
          </h1>
          <p className="text-charcoal-700">Manage AI reasoning prompts for input fields</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          New Prompt
        </Button>
      </div>

      <div className="mb-6">
        <Select value={filterContext} onValueChange={setFilterContext}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by context" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Contexts</SelectItem>
            {contextTypes.map((ct) => (
              <SelectItem key={ct.value} value={ct.value}>{ct.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-charcoal-700" />
        </div>
      ) : Object.keys(groupedPrompts).length === 0 ? (
        <div className="text-center py-12 text-charcoal-700">
          <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No prompts found. Create your first prompt template.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedPrompts).map(([contextType, contextPrompts]) => (
            <div key={contextType}>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Badge>{contextTypes.find(c => c.value === contextType)?.label || contextType}</Badge>
                <span className="text-muted-foreground text-sm font-normal">({contextPrompts.length})</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {contextPrompts.map((prompt) => (
                  <Card key={prompt.id} className={`hover:shadow-md transition-shadow ${!prompt.is_active ? "opacity-60" : ""}`}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        {prompt.name}
                        {prompt.is_default && (
                          <Star className="h-4 w-4 text-warning fill-warning" />
                        )}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">{prompt.description}</p>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xs text-muted-foreground mb-3 line-clamp-2">
                        {prompt.system_prompt}
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="outline">{prompt.output_format}</Badge>
                        {!prompt.is_active && <Badge variant="secondary">Inactive</Badge>}
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => handleOpenDialog(prompt)}>
                          <Edit className="h-3 w-3" />
                        </Button>
                        {!prompt.is_default && (
                          <Button size="sm" variant="ghost" onClick={() => handleSetDefault(prompt)} title="Set as default">
                            <Star className="h-3 w-3" />
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteMutation.mutate(prompt.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingPrompt ? "Edit Prompt" : "Create Prompt"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Name *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Project Description Helper"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Context Type</label>
                <Select value={formData.context_type} onValueChange={(v) => setFormData({ ...formData, context_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {contextTypes.map((ct) => (
                      <SelectItem key={ct.value} value={ct.value}>{ct.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Description</label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of what this prompt does"
              />
            </div>

            <div>
              <label className="text-sm font-medium">System Prompt *</label>
              <Textarea
                value={formData.system_prompt}
                onChange={(e) => setFormData({ ...formData, system_prompt: e.target.value })}
                placeholder="You are an assistant that helps users..."
                rows={6}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Output Format</label>
                <Select value={formData.output_format} onValueChange={(v) => setFormData({ ...formData, output_format: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {outputFormats.map((of) => (
                      <SelectItem key={of.value} value={of.value}>{of.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-4 pt-6">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(v) => setFormData({ ...formData, is_active: v })}
                  />
                  <label className="text-sm">Active</label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.is_default}
                    onCheckedChange={(v) => setFormData({ ...formData, is_default: v })}
                  />
                  <label className="text-sm">Default</label>
                </div>
              </div>
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