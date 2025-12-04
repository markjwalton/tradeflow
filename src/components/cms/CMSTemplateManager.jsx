import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
import { 
  Plus, Layout, FileText, ShoppingBag, Mail, Trash2, Edit, 
  Loader2, Download, ExternalLink, AlertCircle
} from "lucide-react";
import { toast } from "sonner";

const templateTypes = [
  { value: "page", label: "Page", icon: Layout },
  { value: "blog", label: "Blog Post", icon: FileText },
  { value: "product", label: "Product", icon: ShoppingBag },
  { value: "email", label: "Email", icon: Mail },
];

export default function CMSTemplateManager({ tenantId }) {
  const queryClient = useQueryClient();
  const [showEditor, setShowEditor] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [showWixImport, setShowWixImport] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "page",
    description: "",
    content_structure: {},
    fields: []
  });

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ["cmsTemplates", tenantId],
    queryFn: () => base44.entities.CMSTemplate.filter(tenantId ? { tenant_id: tenantId } : {})
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.CMSTemplate.create({ ...data, tenant_id: tenantId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cmsTemplates"] });
      toast.success("Template created");
      closeEditor();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.CMSTemplate.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cmsTemplates"] });
      toast.success("Template updated");
      closeEditor();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.CMSTemplate.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cmsTemplates"] });
      toast.success("Template deleted");
    }
  });

  const openEditor = (template = null) => {
    if (template) {
      setEditingTemplate(template);
      setFormData({
        name: template.name,
        type: template.type,
        description: template.description || "",
        content_structure: template.content_structure || {},
        fields: template.fields || []
      });
    } else {
      setEditingTemplate(null);
      setFormData({
        name: "",
        type: "page",
        description: "",
        content_structure: {},
        fields: []
      });
    }
    setShowEditor(true);
  };

  const closeEditor = () => {
    setShowEditor(false);
    setEditingTemplate(null);
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (editingTemplate) {
      updateMutation.mutate({ id: editingTemplate.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const addField = () => {
    setFormData({
      ...formData,
      fields: [...formData.fields, { name: "", label: "", type: "text", required: false }]
    });
  };

  const updateField = (index, updates) => {
    const newFields = [...formData.fields];
    newFields[index] = { ...newFields[index], ...updates };
    setFormData({ ...formData, fields: newFields });
  };

  const removeField = (index) => {
    setFormData({
      ...formData,
      fields: formData.fields.filter((_, i) => i !== index)
    });
  };

  const groupedTemplates = templateTypes.map(type => ({
    ...type,
    templates: templates.filter(t => t.type === type.value)
  }));

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Layout className="h-5 w-5" />
          Templates
        </CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowWixImport(true)}>
            <Download className="h-4 w-4 mr-2" />
            Import from Wix
          </Button>
          <Button onClick={() => openEditor()}>
            <Plus className="h-4 w-4 mr-2" />
            New Template
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-[var(--color-charcoal)]" />
          </div>
        ) : templates.length === 0 ? (
          <div className="text-center py-12 text-[var(--color-charcoal)]">
            <Layout className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No templates yet</p>
            <Button className="mt-4 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white" onClick={() => openEditor()}>
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {groupedTemplates.filter(g => g.templates.length > 0).map(group => {
              const Icon = group.icon;
              return (
                <div key={group.value}>
                  <h3 className="text-sm font-semibold text-[var(--color-charcoal)] mb-3 flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    {group.label} Templates
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {group.templates.map(template => (
                      <div 
                        key={template.id}
                        className="border border-[var(--color-background-muted)] rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-[var(--color-midnight)]">{template.name}</h4>
                          {template.source === "wix_import" && (
                            <Badge className="bg-[var(--color-accent)]/20 text-[var(--color-accent-dark)]">Wix</Badge>
                          )}
                        </div>
                        {template.description && (
                          <p className="text-sm text-[var(--color-charcoal)] mb-3">{template.description}</p>
                        )}
                        <div className="flex items-center justify-between">
                          <Badge variant="outline">
                            {template.fields?.length || 0} fields
                          </Badge>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" onClick={() => openEditor(template)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="text-[var(--color-destructive)]"
                              onClick={() => {
                                if (confirm("Delete this template?")) {
                                  deleteMutation.mutate(template.id);
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>

      {/* Editor Dialog */}
      <Dialog open={showEditor} onOpenChange={setShowEditor}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingTemplate ? "Edit Template" : "New Template"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <Label>Type</Label>
                <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {templateTypes.map(t => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
              />
            </div>

            {/* Custom Fields */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Custom Fields</Label>
                <Button variant="outline" size="sm" onClick={addField}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Field
                </Button>
              </div>
              <div className="space-y-2">
                {formData.fields.map((field, index) => (
                  <div key={index} className="flex gap-2 items-center p-2 bg-[var(--color-background)] rounded">
                    <Input
                      placeholder="Field name"
                      value={field.name}
                      onChange={(e) => updateField(index, { name: e.target.value })}
                      className="w-32"
                    />
                    <Input
                      placeholder="Label"
                      value={field.label}
                      onChange={(e) => updateField(index, { label: e.target.value })}
                      className="flex-1"
                    />
                    <Select 
                      value={field.type} 
                      onValueChange={(v) => updateField(index, { type: v })}
                    >
                      <SelectTrigger className="w-28">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Text</SelectItem>
                        <SelectItem value="textarea">Text Area</SelectItem>
                        <SelectItem value="number">Number</SelectItem>
                        <SelectItem value="image">Image</SelectItem>
                        <SelectItem value="rich_text">Rich Text</SelectItem>
                        <SelectItem value="date">Date</SelectItem>
                        <SelectItem value="boolean">Boolean</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="ghost" size="icon" onClick={() => removeField(index)}>
                      <Trash2 className="h-4 w-4 text-[var(--color-destructive)]" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={closeEditor}>Cancel</Button>
              <Button onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending} className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white">
                {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingTemplate ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Wix Import Dialog */}
      <Dialog open={showWixImport} onOpenChange={setShowWixImport}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import from Wix</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-[var(--color-warning)]/10 border border-[var(--color-warning)]/30 rounded-lg">
              <div className="flex gap-2">
                <AlertCircle className="h-5 w-5 text-[var(--color-warning)] flex-shrink-0" />
                <div>
                  <p className="font-medium text-[var(--color-warning-dark)]">Wix API Integration Required</p>
                  <p className="text-sm text-[var(--color-warning-dark)] mt-1">
                    To import templates from Wix, you need to:
                  </p>
                  <ol className="list-decimal list-inside text-sm text-[var(--color-warning-dark)] mt-2 space-y-1">
                    <li>Enable Wix Dev Mode in your Wix site</li>
                    <li>Create a Wix API key with read access</li>
                    <li>Configure the API key in settings</li>
                  </ol>
                </div>
              </div>
            </div>
            <div>
              <Label>Wix Site URL</Label>
              <Input placeholder="https://yoursite.wixsite.com/mysite" />
            </div>
            <div>
              <Label>Wix API Key</Label>
              <Input type="password" placeholder="Enter your Wix API key" />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowWixImport(false)}>Cancel</Button>
              <Button disabled>
                <Download className="h-4 w-4 mr-2" />
                Import Templates
              </Button>
            </div>
            <p className="text-xs text-[var(--color-charcoal)] text-center">
              Note: Wix template import is coming soon. Currently, you can manually recreate templates.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}