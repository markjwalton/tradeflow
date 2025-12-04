import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";

const layouts = ["full-width", "centered", "sidebar", "split"];
const componentTypes = ["Table", "Form", "Chart", "Card", "List", "Modal", "Tabs", "Filter", "Search", "Button", "Stats"];

export default function TemplatePageEditor({ page, entities = [], onSave, onCancel }) {
  const [name, setName] = useState(page?.name || "");
  const [description, setDescription] = useState(page?.description || "");
  const [layout, setLayout] = useState(page?.layout || "full-width");
  const [entitiesUsed, setEntitiesUsed] = useState(page?.entities_used || []);
  const [features, setFeatures] = useState(page?.features || []);
  const [featureInput, setFeatureInput] = useState("");
  const [components, setComponents] = useState(page?.components || []);
  const [actions, setActions] = useState(page?.actions || []);
  const [actionInput, setActionInput] = useState("");

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

  const toggleEntity = (entityName) => {
    if (entitiesUsed.includes(entityName)) {
      setEntitiesUsed(entitiesUsed.filter(e => e !== entityName));
    } else {
      setEntitiesUsed([...entitiesUsed, entityName]);
    }
  };

  const handleSave = () => {
    onSave({
      ...page,
      name,
      description,
      layout,
      entities_used: entitiesUsed,
      features,
      components: components.filter(c => c.name.trim()),
      actions
    });
  };

  return (
    <Dialog open={true} onOpenChange={() => onCancel()}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Edit Page: {page?.name}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-[var(--color-midnight)]">Name</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium text-[var(--color-midnight)]">Layout</label>
                <Select value={layout} onValueChange={setLayout}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {layouts.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-[var(--color-midnight)]">Description</label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>

            <div>
              <label className="text-sm font-medium text-[var(--color-midnight)]">Entities Used</label>
              <div className="flex flex-wrap gap-2 mt-2 p-3 bg-[var(--color-background)] rounded-lg">
                {entities.map((entity) => (
                  <Badge
                    key={entity.name}
                    variant={entitiesUsed.includes(entity.name) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleEntity(entity.name)}
                  >
                    {entity.name}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-[var(--color-midnight)]">Features</label>
              <div className="flex gap-2 mt-1">
                <Input value={featureInput} onChange={(e) => setFeatureInput(e.target.value)} placeholder="Add feature..." onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addFeature())} />
                <Button variant="outline" onClick={addFeature}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {features.map((f) => (
                  <Badge key={f} variant="secondary" className="gap-1">{f}<button onClick={() => setFeatures(features.filter(x => x !== f))} className="hover:text-[var(--color-destructive)]">×</button></Badge>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-[var(--color-midnight)]">Components</label>
                <Button size="sm" variant="outline" onClick={addComponent}><Plus className="h-3 w-3 mr-1" />Add</Button>
              </div>
              <div className="space-y-2">
                {components.map((comp, idx) => (
                  <div key={idx} className="flex gap-2 items-center p-2 bg-[var(--color-background)] rounded">
                    <Input value={comp.name} onChange={(e) => { const u = [...components]; u[idx] = {...comp, name: e.target.value}; setComponents(u); }} placeholder="Name" className="flex-1" />
                    <Select value={comp.type} onValueChange={(v) => { const u = [...components]; u[idx] = {...comp, type: v}; setComponents(u); }}>
                      <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {componentTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Button size="icon" variant="ghost" className="text-[var(--color-destructive)]" onClick={() => setComponents(components.filter((_, i) => i !== idx))}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-[var(--color-midnight)]">Actions</label>
              <div className="flex gap-2 mt-1">
                <Input value={actionInput} onChange={(e) => setActionInput(e.target.value)} placeholder="Add action..." onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addAction())} />
                <Button variant="outline" onClick={addAction}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {actions.map((a) => (
                  <Badge key={a} variant="secondary" className="gap-1">{a}<button onClick={() => setActions(actions.filter(x => x !== a))} className="hover:text-[var(--color-destructive)]">×</button></Badge>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={onCancel}>Cancel</Button>
              <Button onClick={handleSave} className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white">Save Changes</Button>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}