import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const complexities = ["simple", "medium", "complex"];
const categories = ["Communication", "Automation", "Integration", "Reporting", "Security", "Workflow", "UI/UX", "Other"];

export default function TemplateFeatureEditor({ feature, entities = [], onSave, onCancel }) {
  const [name, setName] = useState(feature?.name || "");
  const [description, setDescription] = useState(feature?.description || "");
  const [category, setCategory] = useState(feature?.category || "Other");
  const [complexity, setComplexity] = useState(feature?.complexity || "medium");
  const [entitiesUsed, setEntitiesUsed] = useState(feature?.entities_used || []);
  const [triggers, setTriggers] = useState(feature?.triggers || []);
  const [triggerInput, setTriggerInput] = useState("");
  const [integrations, setIntegrations] = useState(feature?.integrations || []);
  const [integrationInput, setIntegrationInput] = useState("");

  const addItem = (value, list, setter, inputSetter) => {
    if (value.trim() && !list.includes(value.trim())) {
      setter([...list, value.trim()]);
      inputSetter("");
    }
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
      ...feature,
      name,
      description,
      category,
      complexity,
      entities_used: entitiesUsed,
      triggers,
      integrations
    });
  };

  return (
    <Dialog open={true} onOpenChange={() => onCancel()}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Edit Feature: {feature?.name}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Name</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium">Category</label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Description</label>
                <Input value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium">Complexity</label>
                <Select value={complexity} onValueChange={setComplexity}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {complexities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Entities Used</label>
              <div className="flex flex-wrap gap-2 mt-2 p-3 bg-muted rounded-lg">
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
              <label className="text-sm font-medium">Triggers</label>
              <div className="flex gap-2 mt-1">
                <Input value={triggerInput} onChange={(e) => setTriggerInput(e.target.value)} placeholder="Add trigger..." onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addItem(triggerInput, triggers, setTriggers, setTriggerInput))} />
                <Button variant="outline" onClick={() => addItem(triggerInput, triggers, setTriggers, setTriggerInput)}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {triggers.map((t) => (
                  <Badge key={t} variant="secondary" className="gap-1">{t}<button onClick={() => setTriggers(triggers.filter(x => x !== t))} className="hover:text-destructive">×</button></Badge>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Integrations</label>
              <div className="flex gap-2 mt-1">
                <Input value={integrationInput} onChange={(e) => setIntegrationInput(e.target.value)} placeholder="Add integration..." onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addItem(integrationInput, integrations, setIntegrations, setIntegrationInput))} />
                <Button variant="outline" onClick={() => addItem(integrationInput, integrations, setIntegrations, setIntegrationInput)}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {integrations.map((i) => (
                  <Badge key={i} variant="secondary" className="gap-1">{i}<button onClick={() => setIntegrations(integrations.filter(x => x !== i))} className="hover:text-destructive">×</button></Badge>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={onCancel}>Cancel</Button>
              <Button onClick={handleSave}>Save Changes</Button>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}