import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ArrowLeft,
  Save,
  Eye,
  Plus,
  Loader2,
  Settings,
  GripVertical,
  Trash2,
  Copy,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

import FormFieldPalette from "@/components/forms/FormFieldPalette";
import FormFieldEditor from "@/components/forms/FormFieldEditor";
import DynamicFormRenderer from "@/components/forms/DynamicFormRenderer";
import FormSettings from "@/components/forms/FormSettings";
import AIFormGenerator from "@/components/forms/AIFormGenerator";

export default function FormBuilder() {
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const formId = urlParams.get("id");

  const [selectedFieldIndex, setSelectedFieldIndex] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showNewDialog, setShowNewDialog] = useState(!formId);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    category: "data_capture",
    fields: [],
    sections: [],
    submitButtonText: "Submit",
    successMessage: "Form submitted successfully!",
    isActive: true,
  });

  // Fetch form template
  const { data: formTemplate, isLoading } = useQuery({
    queryKey: ["formTemplate", formId],
    queryFn: async () => {
      if (!formId) return null;
      const forms = await base44.entities.FormTemplate.filter({ id: formId });
      return forms[0] || null;
    },
    enabled: !!formId,
  });

  useEffect(() => {
    if (formTemplate) {
      setFormData({
        name: formTemplate.name || "",
        code: formTemplate.code || "",
        description: formTemplate.description || "",
        category: formTemplate.category || "data_capture",
        fields: formTemplate.fields || [],
        sections: formTemplate.sections || [],
        submitButtonText: formTemplate.submitButtonText || "Submit",
        successMessage: formTemplate.successMessage || "Form submitted successfully!",
        linkedEntity: formTemplate.linkedEntity || "",
        isActive: formTemplate.isActive !== false,
      });
    }
  }, [formTemplate]);

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.FormTemplate.create(data),
    onSuccess: (newForm) => {
      const url = new URL(window.location.href);
      url.searchParams.set("id", newForm.id);
      window.history.replaceState({}, "", url);
      queryClient.invalidateQueries({ queryKey: ["formTemplate"] });
      setShowNewDialog(false);
      toast.success("Form created");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.FormTemplate.update(formId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["formTemplate", formId] });
      toast.success("Form saved");
    },
  });

  const handleCreate = () => {
    if (!formData.name || !formData.code) {
      toast.error("Name and code are required");
      return;
    }
    createMutation.mutate(formData);
  };

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  const handleAddField = (fieldType) => {
    const newField = {
      fieldId: `field_${Date.now()}`,
      label: `New ${fieldType} field`,
      type: fieldType,
      required: false,
      placeholder: "",
      helpText: "",
      options: fieldType === "select" || fieldType === "multiselect" || fieldType === "radio" 
        ? ["Option 1", "Option 2"] 
        : [],
    };
    setFormData({
      ...formData,
      fields: [...formData.fields, newField],
    });
    setSelectedFieldIndex(formData.fields.length);
  };

  const handleUpdateField = (index, updates) => {
    const newFields = [...formData.fields];
    newFields[index] = { ...newFields[index], ...updates };
    setFormData({ ...formData, fields: newFields });
  };

  const handleDeleteField = (index) => {
    const newFields = formData.fields.filter((_, i) => i !== index);
    setFormData({ ...formData, fields: newFields });
    setSelectedFieldIndex(null);
  };

  const handleDuplicateField = (index) => {
    const field = formData.fields[index];
    const newField = {
      ...field,
      fieldId: `field_${Date.now()}`,
      label: `${field.label} (Copy)`,
    };
    const newFields = [...formData.fields];
    newFields.splice(index + 1, 0, newField);
    setFormData({ ...formData, fields: newFields });
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const newFields = Array.from(formData.fields);
    const [moved] = newFields.splice(result.source.index, 1);
    newFields.splice(result.destination.index, 0, moved);
    setFormData({ ...formData, fields: newFields });
  };

  const handleAIGenerate = (generated) => {
    setFormData({
      ...formData,
      name: generated.formName || formData.name,
      description: generated.formDescription || formData.description,
      category: generated.category || formData.category,
      fields: [...formData.fields, ...(generated.fields || [])],
    });
    toast.success(`Added ${generated.fields?.length || 0} fields!`);
  };

  const selectedField = selectedFieldIndex !== null ? formData.fields[selectedFieldIndex] : null;

  if (!formId && !showNewDialog) {
    return (
      <div className="h-screen flex items-center justify-center bg-[var(--color-background)]">
        <Card className="w-96 p-6 border-background-muted bg-card">
          <h2 className="text-lg font-semibold mb-4 text-[var(--color-midnight)]">No Form Selected</h2>
          <div className="space-y-3">
            <Button onClick={() => setShowNewDialog(true)} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Create New Form
            </Button>
            <Link to={createPageUrl("FormTemplates")}>
              <Button variant="outline" className="w-full">
                Browse Existing Forms
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="bg-card border-b border-background-muted px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to={createPageUrl("FormTemplates")}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-lg font-semibold text-[var(--color-midnight)]">{formData.name || "New Form"}</h1>
            <div className="flex items-center gap-2">
              {formData.code && <Badge variant="outline">{formData.code}</Badge>}
              {formData.category && (
                <Badge variant="secondary">{formData.category}</Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowAIGenerator(true)}>
            <Sparkles className="h-4 w-4 mr-1" />
            AI Generate
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowPreview(true)}>
            <Eye className="h-4 w-4 mr-1" />
            Preview
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowSettings(true)}>
            <Settings className="h-4 w-4 mr-1" />
            Settings
          </Button>
          <Button size="sm" onClick={handleSave} disabled={updateMutation.isPending}>
            {updateMutation.isPending && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
            <Save className="h-4 w-4 mr-1" />
            Save
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Field Palette */}
        <FormFieldPalette onAddField={handleAddField} />

        {/* Form Canvas */}
        <div className="flex-1 overflow-auto p-6">
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-charcoal-700" />
            </div>
          ) : formData.fields.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center text-charcoal-700">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <Plus className="h-8 w-8 text-charcoal-700" />
                </div>
                <h3 className="font-medium text-midnight-900">No fields yet</h3>
                <p className="text-sm">Add fields from the palette on the left</p>
              </div>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto">
              <Card className="p-6">
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="form-fields">
                    {(provided) => (
                      <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-3">
                        {formData.fields.map((field, index) => (
                          <Draggable key={field.fieldId} draggableId={field.fieldId} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`border rounded-lg p-3 bg-card transition-all cursor-pointer ${
                                  selectedFieldIndex === index
                                    ? "ring-2 ring-primary border-primary"
                                    : "hover:border-border"
                                } ${snapshot.isDragging ? "shadow-lg" : ""}`}
                                onClick={() => setSelectedFieldIndex(index)}
                              >
                                <div className="flex items-start gap-2">
                                  <div {...provided.dragHandleProps} className="mt-1 cursor-grab">
                                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium text-sm">{field.label}</span>
                                      {field.required && (
                                        <span className="text-destructive text-xs">*</span>
                                      )}
                                      <Badge variant="outline" className="text-xs">
                                        {field.type}
                                      </Badge>
                                    </div>
                                    {field.helpText && (
                                      <p className="text-xs text-muted-foreground mt-1">{field.helpText}</p>
                                    )}
                                  </div>
                                  <div className="flex gap-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 w-7 p-0"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDuplicateField(index);
                                      }}
                                    >
                                      <Copy className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 w-7 p-0 text-destructive"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteField(index);
                                      }}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </Card>
            </div>
          )}
        </div>

        {/* Field Editor Panel */}
        {selectedField && (
          <FormFieldEditor
            field={selectedField}
            onUpdate={(updates) => handleUpdateField(selectedFieldIndex, updates)}
            onDelete={() => handleDeleteField(selectedFieldIndex)}
            onClose={() => setSelectedFieldIndex(null)}
          />
        )}
      </div>

      {/* New Form Dialog */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Form</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Form Name *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Site Survey Form"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Code *</label>
              <Input
                value={formData.code}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    code: e.target.value.toLowerCase().replace(/\s+/g, "_"),
                  })
                }
                placeholder="e.g., site_survey"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Category</label>
              <Select
                value={formData.category}
                onValueChange={(v) => setFormData({ ...formData, category: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
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
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleCreate}
                disabled={createMutation.isPending}
                className="flex-1"
              >
                {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Create Form
              </Button>
              <Link to={createPageUrl("FormTemplates")}>
                <Button variant="outline">Cancel</Button>
              </Link>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Form Preview</DialogTitle>
          </DialogHeader>
          <DynamicFormRenderer
            formTemplate={formData}
            onSubmit={(data) => {
              console.log("Form submitted:", data);
              toast.success("Preview submitted!");
            }}
            isPreview={true}
          />
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <FormSettings
        open={showSettings}
        onOpenChange={setShowSettings}
        formData={formData}
        onUpdate={(updates) => setFormData({ ...formData, ...updates })}
      />

      {/* AI Generator */}
      <AIFormGenerator
        open={showAIGenerator}
        onOpenChange={setShowAIGenerator}
        onGenerate={handleAIGenerate}
      />
    </div>
  );
}