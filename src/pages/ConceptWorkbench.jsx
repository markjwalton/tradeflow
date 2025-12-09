import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  ArrowLeft, Save, Loader2, Lightbulb, Play, CheckCircle2, XCircle, Circle,
  Sparkles, Wand2, ArrowUpCircle, Database, Layout, Zap, FlaskConical
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { toast } from "sonner";
import PlaygroundJournalPanel from "@/components/playground/PlaygroundJournalPanel";

const typeOptions = [
  { value: "entity", label: "Entity", icon: Database },
  { value: "page", label: "Page", icon: Layout },
  { value: "feature", label: "Feature", icon: Zap },
];

export default function ConceptWorkbench() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const conceptId = urlParams.get("id");

  const [isNew, setIsNew] = useState(!conceptId);
  const [formData, setFormData] = useState({
    item_type: "entity",
    name: "",
    description: "",
    group: "",
    data: {},
    status: "draft",
  });
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPushDialog, setShowPushDialog] = useState(false);
  const [pushTarget, setPushTarget] = useState("playground");
  const [devPrompt, setDevPrompt] = useState("");
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);

  const { data: concept, isLoading } = useQuery({
    queryKey: ["concept", conceptId],
    queryFn: async () => {
      const items = await base44.entities.ConceptItem.filter({ id: conceptId });
      return items[0];
    },
    enabled: !!conceptId
  });

  useEffect(() => {
    if (concept) {
      setFormData(concept);
      setIsNew(false);
    }
  }, [concept]);

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.ConceptItem.create(data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["conceptItems"] });
      toast.success("Concept created");
      navigate(createPageUrl("ConceptWorkbench") + `?id=${result.id}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.ConceptItem.update(conceptId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["concept", conceptId] });
      queryClient.invalidateQueries({ queryKey: ["conceptItems"] });
      toast.success("Concept saved");
    },
  });

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (isNew) {
      createMutation.mutate(formData);
    } else {
      updateMutation.mutate(formData);
    }
  };

  const generateWithAI = async () => {
    if (!formData.name.trim()) {
      toast.error("Enter a name first");
      return;
    }
    setIsGenerating(true);

    try {
      let prompt = "";
      let schema = {};

      if (formData.item_type === "entity") {
        prompt = `Generate an entity template for: "${formData.name}"
Description: ${formData.description || "Not specified"}

Return a complete entity definition with:
- name, description, category
- schema with properties (each with type, description)
- required fields array
- relationships if applicable`;
        schema = {
          type: "object",
          properties: {
            name: { type: "string" },
            description: { type: "string" },
            category: { type: "string" },
            schema: { type: "object" },
            relationships: { type: "array" }
          }
        };
      } else if (formData.item_type === "page") {
        prompt = `Generate a page template for: "${formData.name}"
Description: ${formData.description || "Not specified"}

Return a complete page definition with:
- name, description, category, layout
- components array with name, type, description
- entities_used, features, actions arrays`;
        schema = {
          type: "object",
          properties: {
            name: { type: "string" },
            description: { type: "string" },
            category: { type: "string" },
            layout: { type: "string" },
            components: { type: "array" },
            entities_used: { type: "array" },
            features: { type: "array" },
            actions: { type: "array" }
          }
        };
      } else {
        prompt = `Generate a feature template for: "${formData.name}"
Description: ${formData.description || "Not specified"}

Return a complete feature definition with:
- name, description, category, complexity
- entities_used, triggers, integrations arrays
- requirements and user_stories arrays`;
        schema = {
          type: "object",
          properties: {
            name: { type: "string" },
            description: { type: "string" },
            category: { type: "string" },
            complexity: { type: "string" },
            entities_used: { type: "array" },
            triggers: { type: "array" },
            integrations: { type: "array" },
            requirements: { type: "array" },
            user_stories: { type: "array" }
          }
        };
      }

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: schema
      });

      setFormData(prev => ({
        ...prev,
        data: result,
        description: result.description || prev.description
      }));
      toast.success("AI generated template data");
    } catch (error) {
      if (error.message?.includes("Rate limit")) {
        toast.error("Please wait a moment before trying again");
      } else {
        toast.error("Failed to generate");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const runTests = async () => {
    setIsRunningTests(true);
    const data = formData.data;
    const passed = [];
    const failed = [];

    // Basic tests based on type
    if (formData.item_type === "entity") {
      if (data.name) passed.push("Has name"); else failed.push("Missing name");
      if (data.schema?.properties && Object.keys(data.schema.properties).length > 0) 
        passed.push("Has schema properties"); 
      else failed.push("Missing schema properties");
    } else if (formData.item_type === "page") {
      if (data.name) passed.push("Has name"); else failed.push("Missing name");
      if (data.category) passed.push("Has category"); else failed.push("Missing category");
      if (Array.isArray(data.components)) passed.push("Has components"); else failed.push("Missing components");
    } else {
      if (data.name) passed.push("Has name"); else failed.push("Missing name");
      if (data.description) passed.push("Has description"); else failed.push("Missing description");
      if (Array.isArray(data.user_stories) && data.user_stories.length > 0) 
        passed.push("Has user stories"); 
      else failed.push("Missing user stories");
    }

    const testStatus = failed.length > 0 ? "failed" : "passed";
    const updatedData = {
      ...formData,
      test_status: testStatus,
      test_results: { passed, failed }
    };
    setFormData(updatedData);

    if (!isNew) {
      updateMutation.mutate(updatedData);
    }
    
    setIsRunningTests(false);
    toast.success(testStatus === "passed" ? "All tests passed!" : `${failed.length} tests failed`);
  };

  const generateDevPrompt = async () => {
    setIsGeneratingPrompt(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate a development prompt for implementing this ${formData.item_type}:

Name: ${formData.name}
Description: ${formData.description}
Data: ${JSON.stringify(formData.data, null, 2)}

Create a detailed, actionable prompt that can be used by an AI coding assistant.`
      });
      setDevPrompt(result);
    } catch (error) {
      toast.error("Failed to generate prompt");
    } finally {
      setIsGeneratingPrompt(false);
    }
  };

  const pushToPlayground = async () => {
    // Create PlaygroundItem from concept
    const playgroundItem = await base44.entities.PlaygroundItem.create({
      source_type: formData.item_type,
      source_name: formData.name,
      group: formData.group || formData.data?.category,
      item_origin: "concept",
      status: "modified",
      current_version: 1,
      working_data: formData.data,
      test_status: formData.test_status || "pending",
      test_results: formData.test_results,
      development_prompt: devPrompt,
    });

    // Update concept status
    await base44.entities.ConceptItem.update(conceptId, {
      status: "pushed_to_playground",
      pushed_playground_id: playgroundItem.id
    });

    queryClient.invalidateQueries({ queryKey: ["conceptItems"] });
    queryClient.invalidateQueries({ queryKey: ["playgroundItems"] });
    toast.success("Pushed to Playground!");
    setShowPushDialog(false);
    navigate(createPageUrl("PlaygroundSummary"));
  };

  const pushToLibrary = async () => {
    // Create library template
    let templateId;
    if (formData.item_type === "entity") {
      const result = await base44.entities.EntityTemplate.create({
        ...formData.data,
        is_global: true,
        is_custom: false
      });
      templateId = result.id;
    } else if (formData.item_type === "page") {
      const result = await base44.entities.PageTemplate.create({
        ...formData.data,
        is_global: true,
        is_custom: false
      });
      templateId = result.id;
    } else {
      const result = await base44.entities.FeatureTemplate.create({
        ...formData.data,
        is_global: true,
        is_custom: false
      });
      templateId = result.id;
    }

    // Update concept
    await base44.entities.ConceptItem.update(conceptId, {
      status: "pushed_to_library",
      pushed_library_id: templateId
    });

    queryClient.invalidateQueries({ queryKey: ["conceptItems"] });
    queryClient.invalidateQueries({ queryKey: ["entityTemplates"] });
    queryClient.invalidateQueries({ queryKey: ["pageTemplates"] });
    queryClient.invalidateQueries({ queryKey: ["featureTemplates"] });
    toast.success("Pushed to Library!");
    setShowPushDialog(false);
  };

  const statusIcon = {
    passed: <CheckCircle2 className="h-5 w-5 text-success" />,
    failed: <XCircle className="h-5 w-5 text-destructive" />,
    pending: <Circle className="h-5 w-5 text-muted-foreground" />,
  }[formData.test_status || "pending"];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto bg-background min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(createPageUrl("PlaygroundSummary"))}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-light font-display flex items-center gap-2 text-foreground">
            <Lightbulb className="h-6 w-6 text-warning" />
            {isNew ? "New Concept" : formData.name}
          </h1>
          <p className="text-muted-foreground">Design and test before adding to playground</p>
        </div>
        <div className="flex items-center gap-2">
          {statusIcon}
          <Badge variant="outline">{formData.status}</Badge>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex gap-2 mb-6">
        <Button onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending}>
          {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          <Save className="h-4 w-4 mr-2" />
          Save
        </Button>
        <Button variant="outline" onClick={generateWithAI} disabled={isGenerating}>
          {isGenerating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Wand2 className="h-4 w-4 mr-2" />}
          AI Generate
        </Button>
        <Button variant="outline" onClick={runTests} disabled={isRunningTests || !formData.data?.name}>
          {isRunningTests ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
          Run Tests
        </Button>
        {!isNew && formData.test_status === "passed" && (
          <Button 
            className="bg-success hover:bg-success/90 text-success-foreground"
            onClick={() => setShowPushDialog(true)}
          >
            <ArrowUpCircle className="h-4 w-4 mr-2" />
            Push Forward
          </Button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main Form */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Concept Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Type</label>
                <Select 
                  value={formData.item_type} 
                  onValueChange={(v) => setFormData({ ...formData, item_type: v, data: {} })}
                  disabled={!isNew}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {typeOptions.map(t => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Group</label>
                <Input
                  value={formData.group}
                  onChange={(e) => setFormData({ ...formData, group: e.target.value })}
                  placeholder="e.g., CRM, Finance..."
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Name</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Concept name..."
              />
            </div>

            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="What does this concept do?"
                rows={3}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Template Data (JSON)</label>
              <Textarea
                value={JSON.stringify(formData.data, null, 2)}
                onChange={(e) => {
                  try {
                    setFormData({ ...formData, data: JSON.parse(e.target.value) });
                  } catch {}
                }}
                rows={12}
                className="font-mono text-sm"
              />
            </div>
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Test Results */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              {formData.test_results ? (
                <div className="space-y-2">
                  {formData.test_results.passed?.map((t, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-success bg-success-50 p-2 rounded">
                      <CheckCircle2 className="h-4 w-4" />
                      {t}
                    </div>
                  ))}
                  {formData.test_results.failed?.map((t, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-destructive bg-destructive-50 p-2 rounded">
                      <XCircle className="h-4 w-4" />
                      {t}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">Run tests to see results</p>
              )}
            </CardContent>
          </Card>

          {/* AI Suggestions */}
          {formData.ai_suggestions?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-accent" />
                  Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {formData.ai_suggestions.map((s, i) => (
                    <li key={i} className="text-sm bg-accent-100 p-2 rounded">{s}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Push Dialog */}
      <Dialog open={showPushDialog} onOpenChange={setShowPushDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowUpCircle className="h-5 w-5 text-success" />
              Push Concept Forward
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Push to:</label>
              <Select value={pushTarget} onValueChange={setPushTarget}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="playground">
                    <div className="flex items-center gap-2">
                      <FlaskConical className="h-4 w-4 text-accent" />
                      Playground (for further testing)
                    </div>
                  </SelectItem>
                  <SelectItem value="library">
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4 text-info" />
                      Library (production ready)
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {pushTarget === "library" && (
              <div className="bg-warning/10 p-3 rounded-lg text-sm text-warning">
                <strong>Note:</strong> Pushing directly to library skips the playground testing phase. 
                Only do this if the concept is fully validated.
              </div>
            )}

            {pushTarget === "playground" && !devPrompt && (
              <Button variant="outline" onClick={generateDevPrompt} disabled={isGeneratingPrompt} className="w-full">
                {isGeneratingPrompt ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                Generate Development Prompt
              </Button>
            )}

            {devPrompt && (
              <div>
                <label className="text-sm font-medium">Development Prompt</label>
                <Textarea value={devPrompt} onChange={(e) => setDevPrompt(e.target.value)} rows={6} className="mt-1" />
              </div>
            )}

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowPushDialog(false)} className="flex-1">
                Cancel
              </Button>
              <Button 
                onClick={pushTarget === "playground" ? pushToPlayground : pushToLibrary}
                className="flex-1 bg-success hover:bg-success/90 text-success-foreground"
              >
                Push to {pushTarget === "playground" ? "Playground" : "Library"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}