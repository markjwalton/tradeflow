import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ArrowLeft, Database, Layout, Zap, FileInput, ListChecks, GitBranch, Briefcase } from "lucide-react";
import { toast } from "sonner";
import EntityBuilder from "@/components/library/EntityBuilder";
import PageBuilder from "@/components/library/PageBuilder";
import FeatureBuilder from "@/components/library/FeatureBuilder";
import BusinessTemplateBuilder from "@/components/templates/BusinessTemplateBuilder";
import { PageHeader } from "@/components/sturij";

// Import form builder components
import FormFieldPalette from "@/components/forms/FormFieldPalette";
import FormFieldEditor from "@/components/forms/FormFieldEditor";
import DynamicFormRenderer from "@/components/forms/DynamicFormRenderer";
import FormSettings from "@/components/forms/FormSettings";
import AIFormGenerator from "@/components/forms/AIFormGenerator";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { GripVertical, Trash2, Copy, Eye, Save, Settings, Sparkles, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { CheckSquare } from "lucide-react";
import AIChecklistGenerator from "@/components/checklists/AIChecklistGenerator";

// Import workflow components
import WorkflowCanvas from "@/components/workflow/WorkflowCanvas";
import WorkflowStepPalette from "@/components/workflow/WorkflowStepPalette";
import WorkflowStepEditor from "@/components/workflow/WorkflowStepEditor";
import WorkflowSettings from "@/components/workflow/WorkflowSettings";
import AIWorkflowGenerator from "@/components/workflow/AIWorkflowGenerator";

export default function LibraryItemBuilder() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const defaultType = urlParams.get("type") || "entity";
  const itemId = urlParams.get("id");
  const projectId = urlParams.get("project");
  
  const [activeTab, setActiveTab] = useState(defaultType);
  
  // Form builder state
  const [selectedFieldIndex, setSelectedFieldIndex] = useState(null);
  const [showFormSettings, setShowFormSettings] = useState(false);
  const [showFormPreview, setShowFormPreview] = useState(false);
  const [showFormAI, setShowFormAI] = useState(false);
  const [formData, setFormData] = useState({
    name: "", code: "", description: "", category: "data_capture",
    fields: [], sections: [], submitButtonText: "Submit",
    successMessage: "Form submitted successfully!", isActive: true,
  });
  
  // Checklist builder state
  const [showChecklistSettings, setShowChecklistSettings] = useState(false);
  const [showChecklistAI, setShowChecklistAI] = useState(false);
  const [editingItemIndex, setEditingItemIndex] = useState(null);
  const [checklistData, setChecklistData] = useState({
    name: "", code: "", description: "", category: "custom",
    items: [], requireAllItems: true, isActive: true,
  });
  
  // Workflow builder state
  const [selectedStepId, setSelectedStepId] = useState(null);
  const [showWorkflowSettings, setShowWorkflowSettings] = useState(false);
  const [workflowViewMode, setWorkflowViewMode] = useState("canvas");
  const [workflowData, setWorkflowData] = useState({
    name: "", code: "", description: "", category: "project",
    triggerEntity: "", triggerEvent: "manual",
  });
  
  // Business template state
  const [businessTemplateData, setBusinessTemplateData] = useState(null);

  const { data: entities = [] } = useQuery({
    queryKey: ["entityTemplates"],
    queryFn: () => base44.entities.EntityTemplate.list(),
  });

  const { data: pages = [] } = useQuery({
    queryKey: ["pageTemplates"],
    queryFn: () => base44.entities.PageTemplate.list(),
  });

  const { data: features = [] } = useQuery({
    queryKey: ["featureTemplates"],
    queryFn: () => base44.entities.FeatureTemplate.list(),
  });

  const { data: projects = [] } = useQuery({
    queryKey: ["customProjects"],
    queryFn: () => base44.entities.CustomProject.list(),
  });
  
  // Form template query
  const { data: formTemplate } = useQuery({
    queryKey: ["formTemplate", itemId],
    queryFn: async () => {
      if (!itemId || activeTab !== "form") return null;
      const forms = await base44.entities.FormTemplate.filter({ id: itemId });
      return forms[0] || null;
    },
    enabled: !!itemId && activeTab === "form",
  });
  
  // Checklist query
  const { data: checklist } = useQuery({
    queryKey: ["checklist", itemId],
    queryFn: async () => {
      if (!itemId || activeTab !== "checklist") return null;
      const checklists = await base44.entities.ChecklistTemplate.filter({ id: itemId });
      return checklists[0] || null;
    },
    enabled: !!itemId && activeTab === "checklist",
  });
  
  // Workflow query
  const { data: workflow } = useQuery({
    queryKey: ["workflow", itemId],
    queryFn: async () => {
      if (!itemId || activeTab !== "workflow") return null;
      const workflows = await base44.entities.Workflow.filter({ id: itemId });
      return workflows[0] || null;
    },
    enabled: !!itemId && activeTab === "workflow",
  });
  
  const { data: workflowSteps = [] } = useQuery({
    queryKey: ["workflowSteps", itemId],
    queryFn: () => base44.entities.WorkflowStep.filter({ workflowId: itemId }),
    enabled: !!itemId && activeTab === "workflow",
  });
  
  const { data: formTemplates = [] } = useQuery({
    queryKey: ["formTemplates"],
    queryFn: () => base44.entities.FormTemplate.list(),
  });

  const { data: checklistTemplates = [] } = useQuery({
    queryKey: ["checklistTemplates"],
    queryFn: () => base44.entities.ChecklistTemplate.list(),
  });
  
  // Business template query
  const { data: businessTemplate } = useQuery({
    queryKey: ["businessTemplate", itemId],
    queryFn: async () => {
      if (!itemId || activeTab !== "business") return null;
      const templates = await base44.entities.BusinessTemplate.filter({ id: itemId });
      return templates[0] || null;
    },
    enabled: !!itemId && activeTab === "business",
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
  
  useEffect(() => {
    if (checklist) {
      setChecklistData({
        name: checklist.name || "",
        code: checklist.code || "",
        description: checklist.description || "",
        category: checklist.category || "custom",
        items: checklist.items || [],
        requireAllItems: checklist.requireAllItems !== false,
        isActive: checklist.isActive !== false,
      });
    }
  }, [checklist]);
  
  useEffect(() => {
    if (workflow) {
      setWorkflowData({
        name: workflow.name || "",
        code: workflow.code || "",
        description: workflow.description || "",
        category: workflow.category || "project",
        triggerEntity: workflow.triggerEntity || "",
        triggerEvent: workflow.triggerEvent || "manual",
      });
    }
  }, [workflow]);
  
  useEffect(() => {
    if (businessTemplate) {
      setBusinessTemplateData(businessTemplate);
    }
  }, [businessTemplate]);

  const currentProject = projects.find(p => p.id === projectId);
  const availableGroups = [...new Set(entities.filter(e => e.group).map(e => e.group))].sort();

  const editingItem = itemId 
    ? (activeTab === "entity" ? entities.find(e => e.id === itemId) :
       activeTab === "page" ? pages.find(p => p.id === itemId) :
       features.find(f => f.id === itemId))
    : null;

  const entityCreateMutation = useMutation({
    mutationFn: (data) => base44.entities.EntityTemplate.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entityTemplates"] });
      toast.success("Entity saved");
      navigate(createPageUrl("Library"));
    },
  });

  const entityUpdateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.EntityTemplate.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entityTemplates"] });
      toast.success("Entity updated");
      navigate(createPageUrl("Library"));
    },
  });

  const pageCreateMutation = useMutation({
    mutationFn: (data) => base44.entities.PageTemplate.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pageTemplates"] });
      toast.success("Page saved");
      navigate(createPageUrl("Library"));
    },
  });

  const pageUpdateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.PageTemplate.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pageTemplates"] });
      toast.success("Page updated");
      navigate(createPageUrl("Library"));
    },
  });

  const featureCreateMutation = useMutation({
    mutationFn: (data) => base44.entities.FeatureTemplate.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["featureTemplates"] });
      toast.success("Feature saved");
      navigate(createPageUrl("Library"));
    },
  });

  const featureUpdateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.FeatureTemplate.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["featureTemplates"] });
      toast.success("Feature updated");
      navigate(createPageUrl("Library"));
    },
  });
  
  // Form mutations
  const formCreateMutation = useMutation({
    mutationFn: (data) => base44.entities.FormTemplate.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["formTemplate"] });
      toast.success("Form saved");
      navigate(createPageUrl("Library"));
    },
  });
  
  const formUpdateMutation = useMutation({
    mutationFn: (data) => base44.entities.FormTemplate.update(itemId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["formTemplate"] });
      toast.success("Form updated");
      navigate(createPageUrl("Library"));
    },
  });
  
  // Checklist mutations
  const checklistCreateMutation = useMutation({
    mutationFn: (data) => base44.entities.ChecklistTemplate.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checklist"] });
      toast.success("Checklist saved");
      navigate(createPageUrl("Library"));
    },
  });
  
  const checklistUpdateMutation = useMutation({
    mutationFn: (data) => base44.entities.ChecklistTemplate.update(itemId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checklist"] });
      toast.success("Checklist updated");
      navigate(createPageUrl("Library"));
    },
  });
  
  // Workflow mutations
  const workflowCreateMutation = useMutation({
    mutationFn: (data) => base44.entities.Workflow.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workflow"] });
      toast.success("Workflow saved");
      navigate(createPageUrl("Library"));
    },
  });
  
  const workflowUpdateMutation = useMutation({
    mutationFn: (data) => base44.entities.Workflow.update(itemId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workflow"] });
      toast.success("Workflow updated");
      navigate(createPageUrl("Library"));
    },
  });
  
  // Business template mutations
  const businessCreateMutation = useMutation({
    mutationFn: (data) => base44.entities.BusinessTemplate.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["businessTemplates"] });
      toast.success("Template saved");
      navigate(createPageUrl("Library"));
    },
  });
  
  const businessUpdateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.BusinessTemplate.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["businessTemplates"] });
      toast.success("Template updated");
      navigate(createPageUrl("Library"));
    },
  });

  const handleSave = (itemData) => {
    const dataToSave = {
      ...itemData,
      custom_project_id: projectId || null,
      is_custom: !!projectId,
      category: projectId ? "Custom" : itemData.category
    };

    if (editingItem?.id) {
      if (activeTab === "entity") {
        entityUpdateMutation.mutate({ id: editingItem.id, data: dataToSave });
      } else if (activeTab === "page") {
        pageUpdateMutation.mutate({ id: editingItem.id, data: dataToSave });
      } else {
        featureUpdateMutation.mutate({ id: editingItem.id, data: dataToSave });
      }
    } else {
      if (activeTab === "entity") {
        entityCreateMutation.mutate(dataToSave);
      } else if (activeTab === "page") {
        pageCreateMutation.mutate(dataToSave);
      } else {
        featureCreateMutation.mutate(dataToSave);
      }
    }
  };

  const isSaving = entityCreateMutation.isPending || entityUpdateMutation.isPending ||
                   pageCreateMutation.isPending || pageUpdateMutation.isPending ||
                   featureCreateMutation.isPending || featureUpdateMutation.isPending ||
                   formCreateMutation.isPending || formUpdateMutation.isPending ||
                   checklistCreateMutation.isPending || checklistUpdateMutation.isPending ||
                   workflowCreateMutation.isPending || workflowUpdateMutation.isPending ||
                   businessCreateMutation.isPending || businessUpdateMutation.isPending;
  
  // Form builder handlers
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
    setFormData({ ...formData, fields: [...formData.fields, newField] });
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
    const newField = { ...field, fieldId: `field_${Date.now()}`, label: `${field.label} (Copy)` };
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
  
  // Checklist handlers
  const handleAddChecklistItem = () => {
    const newItem = {
      itemId: `item_${Date.now()}`,
      label: "New checklist item",
      description: "",
      required: true,
      category: "",
    };
    setChecklistData({ ...checklistData, items: [...checklistData.items, newItem] });
    setEditingItemIndex(checklistData.items.length);
  };
  
  const handleUpdateChecklistItem = (index, updates) => {
    const newItems = [...checklistData.items];
    newItems[index] = { ...newItems[index], ...updates };
    setChecklistData({ ...checklistData, items: newItems });
  };
  
  const handleDeleteChecklistItem = (index) => {
    const newItems = checklistData.items.filter((_, i) => i !== index);
    setChecklistData({ ...checklistData, items: newItems });
    setEditingItemIndex(null);
  };
  
  const handleChecklistDragEnd = (result) => {
    if (!result.destination) return;
    const newItems = Array.from(checklistData.items);
    const [moved] = newItems.splice(result.source.index, 1);
    newItems.splice(result.destination.index, 0, moved);
    setChecklistData({ ...checklistData, items: newItems });
  };
  
  const selectedField = selectedFieldIndex !== null ? formData.fields[selectedFieldIndex] : null;
  const selectedStep = workflowSteps.find((s) => s.id === selectedStepId);
  
  const renderFormBuilder = () => (
    <div className="h-[calc(100vh-200px)] flex">
      <FormFieldPalette onAddField={handleAddField} />
      <div className="flex-1 overflow-auto p-6">
        {formData.fields.length === 0 ? (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <FileInput className="h-8 w-8" />
              </div>
              <p>Add fields from the palette</p>
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
                              className={`border rounded-lg p-3 transition-all cursor-pointer ${
                                selectedFieldIndex === index ? "ring-2 ring-primary" : "hover:border-primary/50"
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
                                    {field.required && <span className="text-destructive text-xs">*</span>}
                                    <Badge variant="outline" className="text-xs">{field.type}</Badge>
                                  </div>
                                  {field.helpText && <p className="text-xs text-muted-foreground mt-1">{field.helpText}</p>}
                                </div>
                                <div className="flex gap-1">
                                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={(e) => { e.stopPropagation(); handleDuplicateField(index); }}>
                                    <Copy className="h-3 w-3" />
                                  </Button>
                                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive" onClick={(e) => { e.stopPropagation(); handleDeleteField(index); }}>
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
      {selectedField && (
        <FormFieldEditor
          field={selectedField}
          onUpdate={(updates) => handleUpdateField(selectedFieldIndex, updates)}
          onDelete={() => handleDeleteField(selectedFieldIndex)}
          onClose={() => setSelectedFieldIndex(null)}
        />
      )}
    </div>
  );
  
  const renderChecklistBuilder = () => (
    <div className="h-[calc(100vh-200px)] overflow-auto p-6">
      <div className="max-w-2xl mx-auto">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Checklist Items</h2>
            <Button size="sm" onClick={handleAddChecklistItem}>
              <Plus className="h-4 w-4 mr-1" />
              Add Item
            </Button>
          </div>
          {checklistData.items.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckSquare className="h-12 w-12 mx-auto opacity-30 mb-2" />
              <p>No items yet. Click "Add Item" to get started.</p>
            </div>
          ) : (
            <DragDropContext onDragEnd={handleChecklistDragEnd}>
              <Droppable droppableId="checklist-items">
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
                    {checklistData.items.map((item, index) => (
                      <Draggable key={item.itemId} draggableId={item.itemId} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`border rounded-lg p-3 transition-all ${
                              editingItemIndex === index ? "ring-2 ring-primary" : "hover:border-primary/50"
                            } ${snapshot.isDragging ? "shadow-lg" : ""}`}
                          >
                            {editingItemIndex === index ? (
                              <div className="space-y-3">
                                <Input value={item.label} onChange={(e) => handleUpdateChecklistItem(index, { label: e.target.value })} placeholder="Item label" />
                                <Textarea value={item.description || ""} onChange={(e) => handleUpdateChecklistItem(index, { description: e.target.value })} placeholder="Description (optional)" rows={2} />
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Switch checked={item.required !== false} onCheckedChange={(v) => handleUpdateChecklistItem(index, { required: v })} />
                                    <Label className="text-sm">Required</Label>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button size="sm" variant="destructive" onClick={() => handleDeleteChecklistItem(index)}>
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                    <Button size="sm" onClick={() => setEditingItemIndex(null)}>Done</Button>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 cursor-pointer" onClick={() => setEditingItemIndex(index)}>
                                <div {...provided.dragHandleProps}>
                                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <CheckSquare className="h-4 w-4 text-muted-foreground" />
                                <div className="flex-1">
                                  <span className="font-medium text-sm">{item.label}</span>
                                  {item.required && <span className="text-destructive text-xs ml-1">*</span>}
                                  {item.description && <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </Card>
      </div>
    </div>
  );
  
  const renderWorkflowBuilder = () => (
    <div className="h-[calc(100vh-200px)] flex">
      {workflowViewMode === "canvas" ? (
        <>
          <WorkflowStepPalette onAddStep={(type) => {
            const nextStepNumber = workflowSteps.length + 1;
            base44.entities.WorkflowStep.create({
              workflowId: itemId,
              name: `Step ${nextStepNumber}`,
              code: `step_${nextStepNumber}`,
              stepNumber: nextStepNumber,
              stepType: type,
              assigneeType: "user",
              isRequired: true,
              canSkip: false,
            }).then(() => queryClient.invalidateQueries({ queryKey: ["workflowSteps"] }));
          }} />
          <div className="flex-1 overflow-auto p-4">
            <WorkflowCanvas
              steps={workflowSteps.sort((a, b) => a.stepNumber - b.stepNumber)}
              selectedStepId={selectedStepId}
              onSelectStep={setSelectedStepId}
              onReorderSteps={async (reordered) => {
                for (let i = 0; i < reordered.length; i++) {
                  await base44.entities.WorkflowStep.update(reordered[i].id, { stepNumber: i + 1 });
                }
                queryClient.invalidateQueries({ queryKey: ["workflowSteps"] });
              }}
              onDeleteStep={(id) => {
                base44.entities.WorkflowStep.delete(id).then(() => {
                  queryClient.invalidateQueries({ queryKey: ["workflowSteps"] });
                  setSelectedStepId(null);
                });
              }}
              formTemplates={formTemplates}
              checklistTemplates={checklistTemplates}
            />
          </div>
          {selectedStep && (
            <WorkflowStepEditor
              step={selectedStep}
              formTemplates={formTemplates}
              checklistTemplates={checklistTemplates}
              allSteps={workflowSteps}
              onUpdate={(data) => {
                base44.entities.WorkflowStep.update(selectedStep.id, data).then(() => {
                  queryClient.invalidateQueries({ queryKey: ["workflowSteps"] });
                });
              }}
              onDelete={() => {
                base44.entities.WorkflowStep.delete(selectedStep.id).then(() => {
                  queryClient.invalidateQueries({ queryKey: ["workflowSteps"] });
                  setSelectedStepId(null);
                });
              }}
              onClose={() => setSelectedStepId(null)}
            />
          )}
        </>
      ) : (
        <AIWorkflowGenerator
          embedded={true}
          onGenerate={(generated) => {
            toast.success("AI workflow generated - switch to canvas to see");
            setWorkflowViewMode("canvas");
          }}
          onCancel={() => setWorkflowViewMode("canvas")}
        />
      )}
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto -mt-6 min-h-screen">
      <PageHeader 
        title={editingItem ? `Edit ${activeTab}` : `Create ${activeTab}`}
        description={currentProject ? `Project: ${currentProject.name}` : "Template Library"}
      >
        <Button variant="ghost" onClick={() => navigate(createPageUrl("Library"))}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Library
        </Button>
      </PageHeader>

      <Card>
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="entity">
                <Database className="h-4 w-4 mr-2" />
                Entity
              </TabsTrigger>
              <TabsTrigger value="page">
                <Layout className="h-4 w-4 mr-2" />
                Page
              </TabsTrigger>
              <TabsTrigger value="feature">
                <Zap className="h-4 w-4 mr-2" />
                Feature
              </TabsTrigger>
              <TabsTrigger value="form">
                <FileInput className="h-4 w-4 mr-2" />
                Form
              </TabsTrigger>
              <TabsTrigger value="checklist">
                <ListChecks className="h-4 w-4 mr-2" />
                Checklist
              </TabsTrigger>
              <TabsTrigger value="workflow">
                <GitBranch className="h-4 w-4 mr-2" />
                Workflow
              </TabsTrigger>
              <TabsTrigger value="business">
                <Briefcase className="h-4 w-4 mr-2" />
                Business
              </TabsTrigger>
            </TabsList>

            <TabsContent value="entity" className="mt-6">
              <EntityBuilder
                initialData={activeTab === "entity" ? editingItem : null}
                onSave={handleSave}
                onCancel={() => navigate(createPageUrl("Library"))}
                isSaving={isSaving}
                existingGroups={availableGroups}
              />
            </TabsContent>

            <TabsContent value="page" className="mt-6">
              <PageBuilder
                initialData={activeTab === "page" ? editingItem : null}
                entities={entities}
                onSave={handleSave}
                onCancel={() => navigate(createPageUrl("Library"))}
                isSaving={isSaving}
              />
            </TabsContent>

            <TabsContent value="feature" className="mt-6">
              <FeatureBuilder
                initialData={activeTab === "feature" ? editingItem : null}
                entities={entities}
                onSave={handleSave}
                onCancel={() => navigate(createPageUrl("Library"))}
                isSaving={isSaving}
              />
            </TabsContent>
            
            <TabsContent value="form" className="mt-6">
              {renderFormBuilder()}
            </TabsContent>
            
            <TabsContent value="checklist" className="mt-6">
              {renderChecklistBuilder()}
            </TabsContent>
            
            <TabsContent value="workflow" className="mt-6">
              {renderWorkflowBuilder()}
            </TabsContent>
            
            <TabsContent value="business" className="mt-6">
              <BusinessTemplateBuilder
                initialData={businessTemplateData}
                onSave={(data) => {
                  const saveData = { ...data, custom_project_id: projectId || null };
                  if (itemId) {
                    businessUpdateMutation.mutate({ id: itemId, data: saveData });
                  } else {
                    businessCreateMutation.mutate(saveData);
                  }
                }}
                onCancel={() => navigate(createPageUrl("Library"))}
                isSaving={businessCreateMutation.isPending || businessUpdateMutation.isPending}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}