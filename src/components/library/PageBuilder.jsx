import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Loader2, FileText, CheckSquare } from "lucide-react";

const categories = ["Dashboard", "List", "Detail", "Form", "Report", "Settings", "Other"];
const layouts = ["full-width", "centered", "sidebar", "split"];
const componentTypes = ["Table", "Form", "Chart", "Card", "List", "Modal", "Tabs", "Filter", "Search", "Button", "Stats", "Checklist"];
const defaultGroups = [
  "Admin Pages",
  "Customer Portal",
  "Reports",
  "Settings",
  "Dashboards",
  "CRUD Pages",
  "Other"
];

export default function PageBuilder({ initialData, entities = [], onSave, onCancel, isSaving }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Other");
  const [group, setGroup] = useState("");
  const [layout, setLayout] = useState("full-width");
  const [entitiesUsed, setEntitiesUsed] = useState([]);
  const [features, setFeatures] = useState([]);
  const [featureInput, setFeatureInput] = useState("");
  const [components, setComponents] = useState([]);
  const [actions, setActions] = useState([]);
  const [actionInput, setActionInput] = useState("");
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");

  // Fetch form and checklist templates
  const { data: formTemplates = [] } = useQuery({
    queryKey: ["formTemplates"],
    queryFn: () => base44.entities.FormTemplate.list(),
  });

  const { data: checklistTemplates = [] } = useQuery({
    queryKey: ["checklistTemplates"],
    queryFn: () => base44.entities.ChecklistTemplate.list(),
  });

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setDescription(initialData.description || "");
      setCategory(initialData.category || "Other");
      setGroup(initialData.group || "");
      setLayout(initialData.layout || "full-width");
      setEntitiesUsed(initialData.entities_used || []);
      setFeatures(initialData.features || []);
      setComponents(initialData.components || []);
      setActions(initialData.actions || []);
      setTags(initialData.tags || []);
    }
  }, [initialData]);

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const addFeature = () => {
    if (featureInput.trim() && !features.includes(featureInput.trim())) {
      setFeatures([...features, featureInput.trim()]);
      setFeatureInput("");
    }
  };

  const addAction = () => {
    if (actionInput.trim() && !actions.includes(actionInput.trim())) {
      setActions([...actions, actionInput.trim()]);
      setActionInput("");
    }
  };

  const addComponent = () => {
    setComponents([...components, { name: "", type: "Card", description: "" }]);
  };

  const updateComponent = (index, updates) => {
    const updated = [...components];
    updated[index] = { ...updated[index], ...updates };
    setComponents(updated);
  };

  const toggleEntity = (entityName) => {
    if (entitiesUsed.includes(entityName)) {
      setEntitiesUsed(entitiesUsed.filter(e => e !== entityName));
    } else {
      setEntitiesUsed([...entitiesUsed, entityName]);
    }
  };

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({
      name,
      description,
      category,
      group: group || null,
      layout,
      entities_used: entitiesUsed,
      features,
      components: components.filter(c => c.name.trim()),
      actions,
      tags,
    });
  };

  return (
    <ScrollArea className="flex-1 -mx-6 px-6 max-h-[70vh]">
      <div className="space-y-6 pb-4 pr-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-[var(--color-midnight)]">Page Name *</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., CustomerList, ProjectDashboard" />
          </div>
          <div>
            <label className="text-sm font-medium text-[var(--color-midnight)]">Category</label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {categories.map((cat) => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-[var(--color-midnight)]">Group</label>
            <Select value={group} onValueChange={setGroup}>
              <SelectTrigger><SelectValue placeholder="Select a group..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value={null}>No Group</SelectItem>
                {defaultGroups.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium text-[var(--color-midnight)]">Layout</label>
            <Select value={layout} onValueChange={setLayout}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {layouts.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-[var(--color-midnight)]">Description</label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What does this page do?" rows={2} />
        </div>

        {/* Entities Used */}
        <div>
          <label className="text-sm font-medium text-[var(--color-midnight)]">Entities Used</label>
          <div className="flex flex-wrap gap-2 mt-2 p-3 bg-[var(--color-background)] rounded-lg">
            {entities.length > 0 ? entities.map((entity) => (
              <Badge
                key={entity.id}
                variant={entitiesUsed.includes(entity.name) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleEntity(entity.name)}
              >
                {entity.name}
              </Badge>
            )) : <span className="text-sm text-[var(--color-charcoal)]">No entities available</span>}
          </div>
        </div>

        {/* Features */}
        <div>
          <label className="text-sm font-medium text-[var(--color-midnight)]">Features</label>
          <div className="flex gap-2 mt-1">
            <Input value={featureInput} onChange={(e) => setFeatureInput(e.target.value)} placeholder="Add feature..." onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addFeature())} />
            <Button type="button" variant="outline" onClick={addFeature}>Add</Button>
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {features.map((f) => (
              <Badge key={f} variant="secondary" className="gap-1">{f}<button onClick={() => setFeatures(features.filter(x => x !== f))} className="hover:text-[var(--color-destructive)]">×</button></Badge>
            ))}
          </div>
        </div>

        {/* Components */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-[var(--color-midnight)]">UI Components</label>
            <Button size="sm" variant="outline" onClick={addComponent}><Plus className="h-3 w-3 mr-1" />Add</Button>
          </div>
          <div className="space-y-2">
            {components.map((comp, index) => (
              <div key={index} className="p-3 bg-[var(--color-background)] rounded-lg space-y-2">
                <div className="flex gap-2 items-center">
                  <Select value={comp.type} onValueChange={(v) => updateComponent(index, { type: v, linkedTemplateId: null, linkedTemplateName: null })}>
                    <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {componentTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Input value={comp.name} onChange={(e) => updateComponent(index, { name: e.target.value })} placeholder="Component name" className="flex-1" />
                  <Button size="sm" variant="ghost" className="text-[var(--color-destructive)]" onClick={() => setComponents(components.filter((_, i) => i !== index))}><Trash2 className="h-3 w-3" /></Button>
                </div>

                {/* Show Form Template selector when type is Form */}
                {comp.type === "Form" && formTemplates.length > 0 && (
                  <div className="flex items-center gap-2 pl-2">
                    <FileText className="h-4 w-4 text-[var(--color-info)]" />
                    <Select 
                      value={comp.linkedTemplateId || "none"} 
                      onValueChange={(v) => {
                        const template = formTemplates.find(f => f.id === v);
                        updateComponent(index, { 
                          linkedTemplateId: v === "none" ? null : v,
                          linkedTemplateName: template?.name || null,
                          name: template?.name || comp.name
                        });
                      }}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Link to Form Template..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No linked template</SelectItem>
                        {formTemplates.map((f) => (
                          <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Show Checklist Template selector when type is Checklist */}
                {comp.type === "Checklist" && checklistTemplates.length > 0 && (
                  <div className="flex items-center gap-2 pl-2">
                    <CheckSquare className="h-4 w-4 text-[var(--color-success)]" />
                    <Select 
                      value={comp.linkedTemplateId || "none"} 
                      onValueChange={(v) => {
                        const template = checklistTemplates.find(c => c.id === v);
                        updateComponent(index, { 
                          linkedTemplateId: v === "none" ? null : v,
                          linkedTemplateName: template?.name || null,
                          name: template?.name || comp.name
                        });
                      }}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Link to Checklist Template..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No linked template</SelectItem>
                        {checklistTemplates.map((c) => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <Input value={comp.description} onChange={(e) => updateComponent(index, { description: e.target.value })} placeholder="Description" className="text-sm" />
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div>
          <label className="text-sm font-medium text-[var(--color-midnight)]">User Actions</label>
          <div className="flex gap-2 mt-1">
            <Input value={actionInput} onChange={(e) => setActionInput(e.target.value)} placeholder="Add action (e.g., create, edit, delete)..." onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addAction())} />
            <Button type="button" variant="outline" onClick={addAction}>Add</Button>
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {actions.map((a) => (
              <Badge key={a} variant="secondary" className="gap-1">{a}<button onClick={() => setActions(actions.filter(x => x !== a))} className="hover:text-[var(--color-destructive)]">×</button></Badge>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="text-sm font-medium text-[var(--color-midnight)]">Tags</label>
          <div className="flex gap-2 mt-1">
            <Input value={tagInput} onChange={(e) => setTagInput(e.target.value)} placeholder="Add tag..." onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())} className="flex-1" />
            <Button type="button" variant="outline" onClick={addTag}>Add</Button>
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="gap-1">{tag}<button onClick={() => setTags(tags.filter(t => t !== tag))} className="hover:text-[var(--color-destructive)]">×</button></Badge>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-[var(--color-background-muted)]">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button onClick={handleSave} disabled={!name.trim() || isSaving} className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white">
            {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Save Page
          </Button>
        </div>
      </div>
    </ScrollArea>
  );
}