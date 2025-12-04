import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

const categories = ["Communication", "Automation", "Integration", "Reporting", "Security", "Workflow", "UI/UX", "Other"];
const complexities = ["simple", "medium", "complex"];
const defaultGroups = [
  "Email",
  "Notifications",
  "Data Export",
  "Data Import",
  "Scheduling",
  "Approvals",
  "Analytics",
  "Other"
];

export default function FeatureBuilder({ initialData, entities = [], onSave, onCancel, isSaving }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Other");
  const [group, setGroup] = useState("");
  const [complexity, setComplexity] = useState("medium");
  const [entitiesUsed, setEntitiesUsed] = useState([]);
  const [triggers, setTriggers] = useState([]);
  const [triggerInput, setTriggerInput] = useState("");
  const [integrations, setIntegrations] = useState([]);
  const [integrationInput, setIntegrationInput] = useState("");
  const [requirements, setRequirements] = useState([]);
  const [requirementInput, setRequirementInput] = useState("");
  const [userStories, setUserStories] = useState([]);
  const [storyInput, setStoryInput] = useState("");
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setDescription(initialData.description || "");
      setCategory(initialData.category || "Other");
      setGroup(initialData.group || "");
      setComplexity(initialData.complexity || "medium");
      setEntitiesUsed(initialData.entities_used || []);
      setTriggers(initialData.triggers || []);
      setIntegrations(initialData.integrations || []);
      setRequirements(initialData.requirements || []);
      setUserStories(initialData.user_stories || []);
      setTags(initialData.tags || []);
    }
  }, [initialData]);

  const addItem = (value, list, setter, inputSetter) => {
    if (value.trim() && !list.includes(value.trim())) {
      setter([...list, value.trim()]);
      inputSetter("");
    }
  };

  const removeItem = (item, list, setter) => {
    setter(list.filter(x => x !== item));
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
      complexity,
      entities_used: entitiesUsed,
      triggers,
      integrations,
      requirements,
      user_stories: userStories,
      tags,
    });
  };

  const ArrayInput = ({ label, value, onChange, list, onAdd, onRemove, placeholder }) => (
    <div>
      <label className="text-sm font-medium text-[var(--color-midnight)]">{label}</label>
      <div className="flex gap-2 mt-1">
        <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), onAdd())} />
        <Button type="button" variant="outline" onClick={onAdd}>Add</Button>
      </div>
      <div className="flex flex-wrap gap-1 mt-2">
        {list.map((item) => (
          <Badge key={item} variant="secondary" className="gap-1">{item}<button onClick={() => onRemove(item)} className="hover:text-[var(--color-destructive)]">×</button></Badge>
        ))}
      </div>
    </div>
  );

  return (
    <ScrollArea className="flex-1 -mx-6 px-6 max-h-[70vh]">
      <div className="space-y-6 pb-4 pr-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-[var(--color-midnight)]">Feature Name *</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Email Notifications, PDF Export" />
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
            <label className="text-sm font-medium text-[var(--color-midnight)]">Complexity</label>
            <Select value={complexity} onValueChange={setComplexity}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {complexities.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-[var(--color-midnight)]">Description</label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What does this feature do?" rows={2} />
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

        <ArrayInput
          label="Triggers"
          value={triggerInput}
          onChange={setTriggerInput}
          list={triggers}
          onAdd={() => addItem(triggerInput, triggers, setTriggers, setTriggerInput)}
          onRemove={(item) => removeItem(item, triggers, setTriggers)}
          placeholder="e.g., user_action, schedule, event"
        />

        <ArrayInput
          label="External Integrations"
          value={integrationInput}
          onChange={setIntegrationInput}
          list={integrations}
          onAdd={() => addItem(integrationInput, integrations, setIntegrations, setIntegrationInput)}
          onRemove={(item) => removeItem(item, integrations, setIntegrations)}
          placeholder="e.g., SendGrid, Stripe, AWS S3"
        />

        <ArrayInput
          label="Technical Requirements"
          value={requirementInput}
          onChange={setRequirementInput}
          list={requirements}
          onAdd={() => addItem(requirementInput, requirements, setRequirements, setRequirementInput)}
          onRemove={(item) => removeItem(item, requirements, setRequirements)}
          placeholder="e.g., API key, webhook endpoint"
        />

        <ArrayInput
          label="User Stories"
          value={storyInput}
          onChange={setStoryInput}
          list={userStories}
          onAdd={() => addItem(storyInput, userStories, setUserStories, setStoryInput)}
          onRemove={(item) => removeItem(item, userStories, setUserStories)}
          placeholder="As a user, I want to..."
        />

        <ArrayInput
          label="Tags"
          value={tagInput}
          onChange={setTagInput}
          list={tags}
          onAdd={() => addItem(tagInput, tags, setTags, setTagInput)}
          onRemove={(item) => removeItem(item, tags, setTags)}
          placeholder="Add tag..."
        />

        <div className="flex justify-end gap-2 pt-4 border-t border-[var(--color-background-muted)]">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button onClick={handleSave} disabled={!name.trim() || isSaving} className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white">
            {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Save Feature
          </Button>
        </div>
      </div>
    </ScrollArea>
  );
}