import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Sparkles, Save, Loader2, Wand2, Plus, Trash2
} from "lucide-react";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";

export default function PlaygroundEditor({ 
  item, 
  template, 
  workingData, 
  onSave, 
  onClose,
  type // entity, page, or feature
}) {
  const [data, setData] = useState(workingData || template || {});
  const [aiPrompt, setAiPrompt] = useState("");
  const [isApplyingAI, setIsApplyingAI] = useState(false);
  const [changeSummary, setChangeSummary] = useState("");
  const [activeTab, setActiveTab] = useState("manual");

  const handleManualSave = () => {
    if (!changeSummary.trim()) {
      toast.error("Please provide a change summary");
      return;
    }
    onSave(data, changeSummary);
  };

  const applyAIChanges = async () => {
    if (!aiPrompt.trim()) return;
    setIsApplyingAI(true);

    try {
      let promptContext = "";
      if (type === "entity") {
        promptContext = `Entity Schema:
Name: ${data.name}
Description: ${data.description}
Properties: ${JSON.stringify(data.schema?.properties || {}, null, 2)}
Required: ${JSON.stringify(data.schema?.required || [])}
Relationships: ${JSON.stringify(data.relationships || [])}`;
      } else if (type === "page") {
        promptContext = `Page Template:
Name: ${data.name}
Description: ${data.description}
Category: ${data.category}
Layout: ${data.layout}
Components: ${JSON.stringify(data.components || [])}
Entities Used: ${JSON.stringify(data.entities_used || [])}
Features: ${JSON.stringify(data.features || [])}
Actions: ${JSON.stringify(data.actions || [])}`;
      } else if (type === "feature") {
        promptContext = `Feature Template:
Name: ${data.name}
Description: ${data.description}
Category: ${data.category}
Complexity: ${data.complexity}
Entities Used: ${JSON.stringify(data.entities_used || [])}
Triggers: ${JSON.stringify(data.triggers || [])}
Integrations: ${JSON.stringify(data.integrations || [])}
Requirements: ${JSON.stringify(data.requirements || [])}
User Stories: ${JSON.stringify(data.user_stories || [])}`;
      }

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are modifying a ${type} template based on user instructions.

CURRENT ${type.toUpperCase()}:
${promptContext}

USER REQUEST:
${aiPrompt}

Apply the requested changes and return the complete updated ${type} as JSON. Maintain the same structure but incorporate the changes.
Also provide a brief summary of what was changed.`,
        response_json_schema: {
          type: "object",
          properties: {
            updated_template: { type: "object" },
            change_summary: { type: "string" }
          }
        }
      });

      setData(result.updated_template);
      setChangeSummary(result.change_summary);
      setAiPrompt("");
      toast.success("AI changes applied - review and save");
    } catch (error) {
      toast.error("Failed to apply AI changes");
    } finally {
      setIsApplyingAI(false);
    }
  };

  // Render fields based on type
  const renderEntityFields = () => (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-[var(--color-midnight)]">Name</label>
        <Input 
          value={data.name || ""} 
          onChange={(e) => setData({ ...data, name: e.target.value })}
        />
      </div>
      <div>
        <label className="text-sm font-medium text-[var(--color-midnight)]">Description</label>
        <Textarea 
          value={data.description || ""} 
          onChange={(e) => setData({ ...data, description: e.target.value })}
          rows={2}
        />
      </div>
      <div>
        <label className="text-sm font-medium text-[var(--color-midnight)]">Schema Properties (JSON)</label>
        <Textarea 
          value={JSON.stringify(data.schema?.properties || {}, null, 2)} 
          onChange={(e) => {
            try {
              const props = JSON.parse(e.target.value);
              setData({ ...data, schema: { ...data.schema, properties: props }});
            } catch {}
          }}
          rows={10}
          className="font-mono text-sm"
        />
      </div>
    </div>
  );

  const renderPageFields = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-[var(--color-midnight)]">Name</label>
          <Input 
            value={data.name || ""} 
            onChange={(e) => setData({ ...data, name: e.target.value })}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-[var(--color-midnight)]">Category</label>
          <Input 
            value={data.category || ""} 
            onChange={(e) => setData({ ...data, category: e.target.value })}
          />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-[var(--color-midnight)]">Description</label>
        <Textarea 
          value={data.description || ""} 
          onChange={(e) => setData({ ...data, description: e.target.value })}
          rows={2}
        />
      </div>
      <div>
        <label className="text-sm font-medium text-[var(--color-midnight)]">Components (JSON)</label>
        <Textarea 
          value={JSON.stringify(data.components || [], null, 2)} 
          onChange={(e) => {
            try {
              setData({ ...data, components: JSON.parse(e.target.value) });
            } catch {}
          }}
          rows={6}
          className="font-mono text-sm"
        />
      </div>
    </div>
  );

  const renderFeatureFields = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-[var(--color-midnight)]">Name</label>
          <Input 
            value={data.name || ""} 
            onChange={(e) => setData({ ...data, name: e.target.value })}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-[var(--color-midnight)]">Complexity</label>
          <Input 
            value={data.complexity || ""} 
            onChange={(e) => setData({ ...data, complexity: e.target.value })}
          />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-[var(--color-midnight)]">Description</label>
        <Textarea 
          value={data.description || ""} 
          onChange={(e) => setData({ ...data, description: e.target.value })}
          rows={2}
        />
      </div>
      <div>
        <label className="text-sm font-medium text-[var(--color-midnight)]">User Stories (one per line)</label>
        <Textarea 
          value={(data.user_stories || []).join("\n")} 
          onChange={(e) => setData({ ...data, user_stories: e.target.value.split("\n").filter(s => s.trim()) })}
          rows={4}
        />
      </div>
      <div>
        <label className="text-sm font-medium text-[var(--color-midnight)]">Requirements (one per line)</label>
        <Textarea 
          value={(data.requirements || []).join("\n")} 
          onChange={(e) => setData({ ...data, requirements: e.target.value.split("\n").filter(s => s.trim()) })}
          rows={4}
        />
      </div>
    </div>
  );

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-[var(--color-midnight)]">Edit {type.charAt(0).toUpperCase() + type.slice(1)}: {data.name}</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
          <TabsList>
            <TabsTrigger value="manual">Manual Edit</TabsTrigger>
            <TabsTrigger value="ai">AI Prompt</TabsTrigger>
          </TabsList>

          <TabsContent value="manual" className="flex-1 overflow-auto">
            {type === "entity" && renderEntityFields()}
            {type === "page" && renderPageFields()}
            {type === "feature" && renderFeatureFields()}
          </TabsContent>

          <TabsContent value="ai" className="flex-1 overflow-auto space-y-4">
            <div>
              <label className="text-sm font-medium text-[var(--color-midnight)]">Describe the changes you want</label>
              <Textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="e.g., Add a 'priority' field with low/medium/high options..."
                rows={4}
              />
            </div>
            <Button onClick={applyAIChanges} disabled={isApplyingAI || !aiPrompt.trim()} className="bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-dark)] text-white">
              {isApplyingAI ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Wand2 className="h-4 w-4 mr-2" />}
              Apply with AI
            </Button>
            
            {changeSummary && (
              <div className="bg-[var(--color-success)]/10 p-3 rounded-lg">
                <p className="text-sm text-[var(--color-success-dark)]"><strong>Changes applied:</strong> {changeSummary}</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="border-t border-[var(--color-background-muted)] pt-4 space-y-3">
          <div>
            <label className="text-sm font-medium text-[var(--color-midnight)]">Change Summary (required for save)</label>
            <Input
              value={changeSummary}
              onChange={(e) => setChangeSummary(e.target.value)}
              placeholder="Describe what changed in this version..."
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleManualSave} disabled={!changeSummary.trim()} className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white">
              <Save className="h-4 w-4 mr-2" />
              Save New Version
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}