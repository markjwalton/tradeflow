import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Play, Search, Database, Layout, Zap, CheckCircle2, XCircle, 
  Circle, Loader2, RefreshCw, Eye, Lightbulb, ArrowRight, Edit,
  FlaskConical, Beaker, Trash2, AlertTriangle, Plus, ArrowLeft, ArrowUpCircle, Sparkles, X
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { toast } from "sonner";
import { PageHeader } from "@/components/sturij";
import PagePreview from "@/components/library/PagePreview";
import PlaygroundEditor from "@/components/playground/PlaygroundEditor";
import VersionHistory from "@/components/playground/VersionHistory";
import PlaygroundJournalPanel from "@/components/playground/PlaygroundJournalPanel";
import PromoteToLibraryDialog from "@/components/playground/PromoteToLibraryDialog";

const statusIcons = {
  passed: <CheckCircle2 className="h-4 w-4 text-success" />,
  failed: <XCircle className="h-4 w-4 text-destructive" />,
  pending: <Circle className="h-4 w-4 text-muted-foreground" />,
  skipped: <Circle className="h-4 w-4 text-warning" />,
};

const typeIcons = {
  entity: <Database className="h-4 w-4 text-accent" />,
  page: <Layout className="h-4 w-4 text-info" />,
  feature: <Zap className="h-4 w-4 text-warning" />,
};

const itemStatusColors = {
  synced: "bg-muted text-muted-foreground",
  modified: "bg-info-50 text-info",
  testing: "bg-warning/10 text-warning",
  ready: "bg-success-50 text-success",
  promoted: "bg-accent-100 text-accent",
};

const complexityColors = {
  simple: "bg-success-50 text-success",
  medium: "bg-warning/10 text-warning",
  complex: "bg-destructive-50 text-destructive",
};

export default function PlaygroundSummary() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [activeTab, setActiveTab] = useState("overview");
  const [isSyncing, setIsSyncing] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [syncProgress, setSyncProgress] = useState({ current: 0, total: 0 });
  const [clearProgress, setClearProgress] = useState({ current: 0, total: 0 });
  
  // Detail view state
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [showPromote, setShowPromote] = useState(false);

  const { data: playgroundItems = [], isLoading } = useQuery({
    queryKey: ["playgroundItems"],
    queryFn: () => base44.entities.PlaygroundItem.list("-created_date"),
  });

  const { data: conceptItems = [] } = useQuery({
    queryKey: ["conceptItems"],
    queryFn: () => base44.entities.ConceptItem.list("-created_date"),
  });

  // Selected item detail queries
  const { data: selectedItem } = useQuery({
    queryKey: ["playgroundItem", selectedItemId],
    queryFn: async () => {
      if (!selectedItemId) return null;
      const items = await base44.entities.PlaygroundItem.filter({ id: selectedItemId });
      return items[0] || null;
    },
    enabled: !!selectedItemId
  });

  const { data: journalEntries = [] } = useQuery({
    queryKey: ["playgroundJournal", selectedItemId],
    queryFn: () => base44.entities.PlaygroundJournal.filter({ playground_item_id: selectedItemId }, "-created_date"),
    enabled: !!selectedItemId
  });

  const { data: testDataSets = [] } = useQuery({
    queryKey: ["testData", selectedItemId],
    queryFn: () => base44.entities.TestData.filter({ playground_item_id: selectedItemId }),
    enabled: !!selectedItemId
  });

  const { data: entityTemplates = [], isLoading: loadingEntities } = useQuery({
    queryKey: ["entityTemplates"],
    queryFn: () => base44.entities.EntityTemplate.filter({ is_custom: false }),
  });

  const { data: pageTemplates = [], isLoading: loadingPages } = useQuery({
    queryKey: ["pageTemplates"],
    queryFn: () => base44.entities.PageTemplate.filter({ is_custom: false }),
  });

  const { data: featureTemplates = [], isLoading: loadingFeatures } = useQuery({
    queryKey: ["featureTemplates"],
    queryFn: () => base44.entities.FeatureTemplate.filter({ is_custom: false }),
  });

  const allLoading = isLoading || loadingEntities || loadingPages || loadingFeatures;

  // Find template for selected item
  const selectedTemplate = selectedItem?.source_type === "page" 
    ? pageTemplates.find(t => t.id === selectedItem?.source_id)
    : selectedItem?.source_type === "feature"
    ? featureTemplates.find(t => t.id === selectedItem?.source_id)
    : selectedItem?.source_type === "entity"
    ? entityTemplates.find(t => t.id === selectedItem?.source_id)
    : null;

  const updateItemMutation = useMutation({
    mutationFn: (data) => base44.entities.PlaygroundItem.update(selectedItemId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playgroundItem", selectedItemId] });
      queryClient.invalidateQueries({ queryKey: ["playgroundItems"] });
      toast.success("Updated");
    },
  });

  // Helper: delay between API calls to avoid rate limits
  const delay = (ms) => new Promise(r => setTimeout(r, ms));

  // Clear all playground data
  const clearPlaygroundData = async () => {
    setIsClearing(true);
    setClearProgress({ current: 0, total: 0 });
    try {
      // Get all items to delete
      const allItems = await base44.entities.PlaygroundItem.list();
      const allTestData = await base44.entities.TestData.list();
      const total = allItems.length + allTestData.length;
      setClearProgress({ current: 0, total });
      
      let deleted = 0;
      
      // Delete all PlaygroundItems with delay
      for (const item of allItems) {
        await base44.entities.PlaygroundItem.delete(item.id);
        deleted++;
        setClearProgress({ current: deleted, total });
        await delay(100); // 100ms between deletes
      }
      
      // Delete all TestData with delay
      for (const td of allTestData) {
        await base44.entities.TestData.delete(td.id);
        deleted++;
        setClearProgress({ current: deleted, total });
        await delay(100);
      }
      
      queryClient.invalidateQueries({ queryKey: ["playgroundItems"] });
      queryClient.invalidateQueries({ queryKey: ["testData"] });
      toast.success("Playground data cleared");
    } catch (error) {
      toast.error("Failed to clear: " + error.message);
    } finally {
      setIsClearing(false);
      setClearProgress({ current: 0, total: 0 });
    }
  };

  // Sync library items to playground - checks by source_id to avoid duplicates
  const syncLibraryToPlayground = async () => {
    setIsSyncing(true);
    setSyncProgress({ current: 0, total: 0 });
    let added = 0;
    let failed = 0;

    // Get existing source_ids to prevent duplicates
    const existingSourceIds = new Set(
      playgroundItems.map(p => p.source_id)
    );

    const allTemplates = [
      ...entityTemplates.filter(t => !t.custom_project_id).map(t => ({ ...t, _type: "entity" })),
      ...pageTemplates.filter(t => !t.custom_project_id).map(t => ({ ...t, _type: "page" })),
      ...featureTemplates.filter(t => !t.custom_project_id).map(t => ({ ...t, _type: "feature" })),
    ].filter(t => !existingSourceIds.has(t.id));

    setSyncProgress({ current: 0, total: allTemplates.length });

    if (allTemplates.length === 0) {
      toast.info("Playground is up to date with library");
      setIsSyncing(false);
      return;
    }

    for (let i = 0; i < allTemplates.length; i++) {
      const template = allTemplates[i];
      
      // Retry logic for rate limits
      let retries = 3;
      let success = false;
      
      while (retries > 0 && !success) {
        try {
          await base44.entities.PlaygroundItem.create({
            source_type: template._type,
            source_id: template.id,
            source_name: template.name,
            group: template.group || template.category,
            item_origin: "library",
            status: "synced",
            current_version: 1,
            test_definition: generateDefaultTests(template._type, template),
          });
          added++;
          success = true;
        } catch (e) {
          if (e.message?.includes("Rate limit") && retries > 1) {
            // Wait longer on rate limit
            await delay(2000);
            retries--;
          } else {
            console.error("Failed to sync:", template.name, e.message);
            failed++;
            break;
          }
        }
      }
      
      setSyncProgress({ current: i + 1, total: allTemplates.length });
      
      // Add delay between creates to avoid rate limits
      await delay(150);
    }

    queryClient.invalidateQueries({ queryKey: ["playgroundItems"] });
    setIsSyncing(false);
    setSyncProgress({ current: 0, total: 0 });
    
    if (failed > 0) {
      toast.warning(`Synced ${added} items, ${failed} failed`);
    } else {
      toast.success(`Synced ${added} new items from library`);
    }
  };

  const generateDefaultTests = (type, template) => {
    if (type === "entity") {
      return {
        tests: [
          { name: "Has valid name", check: "name" },
          { name: "Has schema defined", check: "schema" },
          { name: "Schema has properties", check: "schema.properties" },
          { name: "Has required fields", check: "schema.required" },
        ]
      };
    } else if (type === "page") {
      return {
        tests: [
          { name: "Has valid name", check: "name" },
          { name: "Has category", check: "category" },
          { name: "Has components defined", check: "components" },
          { name: "Has entities assigned", check: "entities_used" },
          { name: "Has test data set", check: "test_data" },
        ]
      };
    } else if (type === "feature") {
      return {
        tests: [
          { name: "Has valid name", check: "name" },
          { name: "Has description", check: "description" },
          { name: "Has complexity defined", check: "complexity" },
          { name: "Has user stories", check: "user_stories" },
          { name: "Has test data set", check: "test_data" },
        ]
      };
    }
    return { tests: [] };
  };

  // Filter playground items
  const filteredItems = playgroundItems.filter(item => {
    const matchesSearch = item.source_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || item.source_type === filterType;
    const matchesStatus = filterStatus === "all" || item.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  // Items being actively worked on (modified, testing, ready)
  const activeItems = playgroundItems.filter(i => 
    ["modified", "testing", "ready"].includes(i.status)
  );

  // Concepts in progress
  const activeConcepts = conceptItems.filter(c => 
    ["draft", "review", "approved"].includes(c.status)
  );

  // Stats
  const stats = {
    total: playgroundItems.length,
    synced: playgroundItems.filter(i => i.status === "synced").length,
    modified: playgroundItems.filter(i => i.status === "modified").length,
    ready: playgroundItems.filter(i => i.status === "ready").length,
    concepts: conceptItems.filter(c => c.status !== "pushed_to_library").length,
    testsPassed: playgroundItems.filter(i => i.test_status === "passed").length,
    testsFailed: playgroundItems.filter(i => i.test_status === "failed").length,
  };

  // Detail view handlers
  const handleSaveVersion = (newData, changeSummary) => {
    const currentVersion = selectedItem.current_version || 1;
    const newVersion = currentVersion + 1;
    const versions = selectedItem.versions || [];
    
    if (!versions.find(v => v.version === currentVersion)) {
      versions.push({
        version: currentVersion,
        data: selectedItem.working_data || selectedTemplate,
        saved_date: new Date().toISOString(),
        change_summary: "Initial version"
      });
    }
    
    versions.push({
      version: newVersion,
      data: newData,
      saved_date: new Date().toISOString(),
      change_summary: changeSummary
    });

    updateItemMutation.mutate({
      working_data: newData,
      current_version: newVersion,
      versions: versions,
      test_status: "pending"
    });
    
    base44.entities.PlaygroundJournal.create({
      playground_item_id: selectedItemId,
      content: changeSummary,
      entry_type: "version_note",
      version_reference: newVersion,
      entry_date: new Date().toISOString()
    });
    
    setShowEditor(false);
    toast.success(`Saved as version ${newVersion}`);
  };

  const handleRevert = (version) => {
    const versionData = selectedItem.versions?.find(v => v.version === version);
    if (!versionData) return;
    
    updateItemMutation.mutate({
      working_data: versionData.data,
      current_version: version,
      test_status: "pending"
    });
    toast.success(`Reverted to version ${version}`);
  };

  const runTests = async () => {
    if (!selectedTemplate) return;
    setIsRunningTests(true);

    const tests = selectedItem.test_definition?.tests || [];
    const passed = [];
    const failed = [];
    const errors = [];

    for (const test of tests) {
      try {
        let result = false;
        
        if (selectedItem.source_type === "page") {
          const { name, category, components, entities_used } = selectedTemplate;
          if (test.check.includes("name")) result = name !== undefined;
          else if (test.check.includes("category")) result = category !== undefined;
          else if (test.check.includes("components")) result = Array.isArray(components);
          else if (test.check.includes("entities_used")) result = Array.isArray(entities_used);
          else if (test.check.includes("test_data")) result = testDataSets.length > 0;
          else result = true;
        } else if (selectedItem.source_type === "feature") {
          const { name, description, complexity, user_stories } = selectedTemplate;
          if (test.check.includes("name")) result = name !== undefined;
          else if (test.check.includes("description")) result = description && description.length > 10;
          else if (test.check.includes("complexity")) result = complexity !== undefined;
          else if (test.check.includes("user_stories")) result = Array.isArray(user_stories) && user_stories.length > 0;
          else if (test.check.includes("test_data")) result = testDataSets.length > 0;
          else result = true;
        } else if (selectedItem.source_type === "entity") {
          const { name, schema } = selectedTemplate;
          if (test.check.includes("name")) result = name !== undefined;
          else if (test.check.includes("schema")) result = schema && schema.properties;
          else if (test.check.includes("test_data")) result = testDataSets.length > 0;
          else result = true;
        }

        if (result) passed.push(test.name);
        else failed.push(test.name);
      } catch (e) {
        errors.push(`${test.name}: ${e.message}`);
      }
    }

    const status = errors.length > 0 || failed.length > 0 ? "failed" : "passed";
    
    updateItemMutation.mutate({
      test_status: status,
      test_results: { passed, failed, errors },
      last_test_date: new Date().toISOString()
    });
    
    setIsRunningTests(false);
  };

  const generateAISuggestions = async () => {
    if (!selectedTemplate || isGeneratingAI) return;
    setIsGeneratingAI(true);

    try {
      let prompt = "";
      
      if (selectedItem.source_type === "page") {
        prompt = `Analyze this page template and suggest improvements:

Page Name: ${selectedTemplate.name}
Description: ${selectedTemplate.description || "None"}
Category: ${selectedTemplate.category}
Layout: ${selectedTemplate.layout}
Components: ${JSON.stringify(selectedTemplate.components || [], null, 2)}

Provide 3-5 specific suggestions to improve this page.`;
      } else if (selectedItem.source_type === "feature") {
        prompt = `Analyze this feature template and suggest improvements:

Feature Name: ${selectedTemplate.name}
Description: ${selectedTemplate.description || "None"}
Complexity: ${selectedTemplate.complexity}
Entities Used: ${JSON.stringify(selectedTemplate.entities_used || [], null, 2)}

Provide 5-7 specific suggestions to improve this feature.`;
      } else if (selectedItem.source_type === "entity") {
        prompt = `Analyze this entity schema and suggest improvements:

Entity Name: ${selectedTemplate.name}
Description: ${selectedTemplate.description || "None"}
Schema: ${JSON.stringify(selectedTemplate.schema || {}, null, 2)}

Provide 3-5 specific suggestions to improve this entity.`;
      }

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: prompt + "\n\nReturn as JSON with a 'suggestions' array of strings.",
        response_json_schema: {
          type: "object",
          properties: {
            suggestions: { type: "array", items: { type: "string" } }
          }
        }
      });

      updateItemMutation.mutate({ ai_suggestions: result.suggestions || [] });
      toast.success("AI suggestions generated");
    } catch (error) {
      if (error.message?.includes("Rate limit")) {
        toast.error("Please wait a moment before trying again");
      } else {
        toast.error("Failed to generate suggestions");
      }
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // If item selected, show detail view
  if (selectedItemId && selectedItem) {
    const statusIcon = {
      passed: <CheckCircle2 className="h-5 w-5 text-success" />,
      failed: <XCircle className="h-5 w-5 text-destructive" />,
      pending: <Circle className="h-5 w-5 text-muted-foreground" />,
    }[selectedItem.test_status];

    const typeIcon = {
      page: <Layout className="h-6 w-6 text-info" />,
      feature: <Zap className="h-6 w-6 text-warning" />,
      entity: <Database className="h-6 w-6 text-accent" />,
    }[selectedItem.source_type];

    const typeLabel = {
      page: "Page",
      feature: "Feature", 
      entity: "Entity"
    }[selectedItem.source_type];

    return (
      <div className="max-w-5xl mx-auto -mt-6 bg-background min-h-screen">
        <PageHeader 
          title={selectedItem.source_name}
          description={`${typeLabel} Playground`}
        >
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setSelectedItemId(null)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            {typeIcon}
            <Badge variant="outline">v{selectedItem.current_version || 1}</Badge>
            {statusIcon}
            <Badge className={
              selectedItem.test_status === "passed" ? "bg-success-50 text-success" :
              selectedItem.test_status === "failed" ? "bg-destructive-50 text-destructive" :
              "bg-muted text-muted-foreground"
            }>
              {selectedItem.test_status}
            </Badge>
          </div>
        </PageHeader>

        {/* Action Buttons */}
        <div className="flex gap-2 mb-6">
          <Button onClick={() => setShowEditor(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="outline" onClick={runTests} disabled={isRunningTests}>
            {isRunningTests ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
            Run Tests
          </Button>
          <Button 
            variant="outline" 
            className="text-success border-success/30 hover:bg-success-50"
            onClick={() => setShowPromote(true)}
            disabled={selectedItem.test_status !== "passed"}
          >
            <ArrowUpCircle className="h-4 w-4 mr-2" />
            Promote to Library
          </Button>
        </div>

        {/* Preview/Summary Section */}
        {selectedTemplate && selectedItem.source_type === "page" && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Page Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PagePreview page={selectedTemplate} />
            </CardContent>
          </Card>
        )}

        {selectedTemplate && selectedItem.source_type === "feature" && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                Feature Summary
                <Badge className={complexityColors[selectedTemplate.complexity || "medium"]}>
                  {selectedTemplate.complexity || "medium"} complexity
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{selectedTemplate.description}</p>
              <div className="grid grid-cols-2 gap-4">
                {selectedTemplate.entities_used?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Entities Used</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedTemplate.entities_used.map(e => (
                        <Badge key={e} variant="outline">{e}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {selectedTemplate && selectedItem.source_type === "entity" && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Entity Schema</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{selectedTemplate.description}</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Fields</h4>
                  <div className="space-y-1">
                    {Object.keys(selectedTemplate.schema?.properties || {}).map(field => (
                      <Badge key={field} variant="outline">{field}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-3 gap-6">
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Details</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedTemplate ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Description</h4>
                    <p className="text-sm">{selectedTemplate.description || "No description"}</p>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">Template not found</p>
              )}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Unit Tests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {selectedItem.test_definition?.tests?.map((test, i) => {
                    const isPassed = selectedItem.test_results?.passed?.includes(test.name);
                    const isFailed = selectedItem.test_results?.failed?.includes(test.name);
                    return (
                      <div 
                        key={i} 
                        className={`flex items-center justify-between p-2 rounded ${
                          isPassed ? "bg-success-50" : isFailed ? "bg-destructive-50" : "bg-muted"
                        }`}
                      >
                        <span className="text-sm">{test.name}</span>
                        {isPassed && <CheckCircle2 className="h-4 w-4 text-success" />}
                        {isFailed && <XCircle className="h-4 w-4 text-destructive" />}
                        {!isPassed && !isFailed && <Circle className="h-4 w-4 text-muted-foreground" />}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <VersionHistory 
              versions={selectedItem.versions || []}
              currentVersion={selectedItem.current_version || 1}
              onRevert={handleRevert}
            />
          </div>
        </div>

        <div className="mt-6">
          <PlaygroundJournalPanel 
            playgroundItemId={selectedItemId} 
            currentVersion={selectedItem.current_version || 1}
          />
        </div>

        <Card className="mt-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-accent" />
              AI Suggestions
            </CardTitle>
            <Button onClick={generateAISuggestions} disabled={isGeneratingAI} variant="outline">
              {isGeneratingAI ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
              Generate Suggestions
            </Button>
          </CardHeader>
          <CardContent>
            {selectedItem.ai_suggestions?.length > 0 ? (
              <ul className="space-y-2">
                {selectedItem.ai_suggestions.map((suggestion, i) => (
                  <li key={i} className="flex items-start gap-2 p-3 bg-accent-100 rounded-lg">
                    <span className="text-accent font-bold">{i + 1}.</span>
                    <span className="text-sm">{suggestion}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-center py-4">No suggestions yet</p>
            )}
          </CardContent>
        </Card>

        {showEditor && (
          <PlaygroundEditor
            item={selectedItem}
            template={selectedTemplate}
            workingData={selectedItem.working_data}
            onSave={handleSaveVersion}
            onClose={() => setShowEditor(false)}
            type={selectedItem.source_type}
          />
        )}

        {showPromote && (
          <PromoteToLibraryDialog
            item={selectedItem}
            template={selectedTemplate}
            workingData={selectedItem.working_data}
            journalEntries={journalEntries}
            onClose={() => setShowPromote(false)}
            type={selectedItem.source_type}
          />
        )}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto -mt-6 min-h-screen">
      <PageHeader 
        title="Development Playground"
        description="Test, modify, and validate templates before deployment"
      />

      <Card className="border-border mb-4">
        <CardContent className="px-2 py-1">
          <div className="flex gap-2">
            <Link to={createPageUrl("ConceptWorkbench")}>
              <Button 
                variant="ghost"
                className="hover:bg-[#e9efeb] hover:text-[#273e2d]"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Concept
              </Button>
            </Link>
            <Button 
              variant="ghost" 
              onClick={syncLibraryToPlayground} 
              disabled={isSyncing || allLoading}
            >
              {isSyncing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {syncProgress.total > 0 ? `${syncProgress.current}/${syncProgress.total}` : "Syncing..."}
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Sync Library
                </>
              )}
            </Button>
            <Link to={createPageUrl("LivePreview")}>
              <Button variant="ghost">
                <Eye className="h-4 w-4 mr-2" />
                View Live Pages
              </Button>
            </Link>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" className="text-destructive hover:bg-destructive-50" disabled={isClearing || playgroundItems.length === 0}>
                  {isClearing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {clearProgress.total > 0 ? `${clearProgress.current}/${clearProgress.total}` : "Clearing..."}
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear All
                    </>
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    Clear Playground Data?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This will delete all {playgroundItems.length} playground items and their test data. 
                    Library templates will not be affected. You can re-sync from library afterwards.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={clearPlaygroundData} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                    Clear All Data
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>

      {/* Progress Banner */}
      {(isSyncing || isClearing) && (syncProgress.total > 0 || clearProgress.total > 0) && (
        <Card className="mb-6 border-info/20 bg-info-50">
          <CardContent className="py-4">
            <div className="flex items-center gap-4">
              <Loader2 className="h-5 w-5 animate-spin text-info" />
              <div className="flex-1">
                <div className="flex justify-between mb-1 text-sm">
                  <span className="font-medium">
                    {isSyncing ? "Syncing library items..." : "Clearing playground data..."}
                  </span>
                  <span>
                    {isSyncing 
                      ? `${syncProgress.current} / ${syncProgress.total}`
                      : `${clearProgress.current} / ${clearProgress.total}`
                    }
                  </span>
                </div>
                <Progress 
                  value={isSyncing 
                    ? (syncProgress.current / syncProgress.total) * 100
                    : (clearProgress.current / clearProgress.total) * 100
                  } 
                  className="h-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="playground">
            Playground ({playgroundItems.length})
          </TabsTrigger>
          <TabsTrigger value="concepts">
            Concepts ({activeConcepts.length})
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <Card className="border-border">
            <CardContent className="p-4 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold text-foreground">{stats.total}</div>
                <div className="text-sm text-muted-foreground">Library Items</div>
              </CardContent>
            </Card>
            <Card className="border-info/30 bg-info-50">
              <CardContent className="pt-4">
                <div className="text-2xl font-bold text-info">{stats.modified}</div>
                <div className="text-sm text-foreground">Being Modified</div>
              </CardContent>
            </Card>
            <Card className="border-success/30 bg-success-50">
              <CardContent className="pt-4">
                <div className="text-2xl font-bold text-success">{stats.ready}</div>
                <div className="text-sm text-primary">Ready to Promote</div>
              </CardContent>
            </Card>
            <Card className="border-warning/30 bg-warning/10">
              <CardContent className="pt-4">
                <div className="text-2xl font-bold text-warning">{stats.concepts}</div>
                <div className="text-sm text-secondary">Active Concepts</div>
              </CardContent>
            </Card>
          </div>

          {/* Active Work Summary */}
          <div className="grid grid-cols-2 gap-6">
            {/* Items Being Worked On */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Edit className="h-5 w-5 text-info" />
                  Items Being Modified ({activeItems.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activeItems.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No items currently being modified</p>
                ) : (
                  <div className="space-y-2">
                    {activeItems.slice(0, 5).map(item => (
                      <div key={item.id} onClick={() => setSelectedItemId(item.id)} className="flex items-center justify-between p-2 rounded hover:bg-muted cursor-pointer">
                        <div className="flex items-center gap-2">
                          {typeIcons[item.source_type]}
                          <span className="font-medium">{item.source_name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={itemStatusColors[item.status]}>{item.status}</Badge>
                          {statusIcons[item.test_status]}
                        </div>
                      </div>
                    ))}
                    {activeItems.length > 5 && (
                      <p className="text-sm text-muted-foreground text-center">+{activeItems.length - 5} more</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Active Concepts */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-warning" />
                  Active Concepts ({activeConcepts.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activeConcepts.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground mb-2">No concepts in progress</p>
                    <Link to={createPageUrl("ConceptWorkbench")}>
                      <Button size="sm" variant="outline">
                        <Lightbulb className="h-4 w-4 mr-2" />
                        Create New Concept
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {activeConcepts.slice(0, 5).map(concept => (
                      <Link key={concept.id} to={createPageUrl("ConceptWorkbench") + `?id=${concept.id}`}>
                        <div className="flex items-center justify-between p-2 rounded hover:bg-muted">
                          <div className="flex items-center gap-2">
                            {typeIcons[concept.item_type]}
                            <span className="font-medium">{concept.name}</span>
                          </div>
                          <Badge variant="outline">{concept.status}</Badge>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Workflow Guide */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Development Workflow</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm">
                <div className="flex flex-col items-center p-4 bg-warning/10 rounded-lg flex-1">
                  <Beaker className="h-8 w-8 text-warning mb-2" />
                  <span className="font-medium">Concept</span>
                  <span className="text-muted-foreground text-xs">New ideas</span>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
                <div className="flex flex-col items-center p-4 bg-accent-100 rounded-lg flex-1">
                  <FlaskConical className="h-8 w-8 text-accent mb-2" />
                  <span className="font-medium">Playground</span>
                  <span className="text-muted-foreground text-xs">Test & refine</span>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
                <div className="flex flex-col items-center p-4 bg-info-50 rounded-lg flex-1">
                  <Database className="h-8 w-8 text-info mb-2" />
                  <span className="font-medium">Library</span>
                  <span className="text-muted-foreground text-xs">Production ready</span>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
                <div className="flex flex-col items-center p-4 bg-success-50 rounded-lg flex-1">
                  <Play className="h-8 w-8 text-success mb-2" />
                  <span className="font-medium">Sprint</span>
                  <span className="text-muted-foreground text-xs">Implementation</span>
                </div>
              </div>
            </CardContent>
          </Card>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Playground Tab */}
        <TabsContent value="playground" className="space-y-4">
          {/* Filters */}
          <div className="flex gap-4 flex-wrap">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="entity">Entities</SelectItem>
                <SelectItem value="page">Pages</SelectItem>
                <SelectItem value="feature">Features</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="synced">Synced</SelectItem>
                <SelectItem value="modified">Modified</SelectItem>
                <SelectItem value="ready">Ready</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Items Grid */}
          <Card className="border-border">
            <CardContent className="p-4">
              {allLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <FlaskConical className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No items match your filters</p>
                  <Button variant="outline" className="mt-4" onClick={syncLibraryToPlayground}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Sync from Library
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredItems.map(item => (
                    <Card key={item.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedItemId(item.id)}>
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-base flex items-center gap-2">
                            {typeIcons[item.source_type]}
                            {item.source_name}
                          </CardTitle>
                          <div className="flex items-center gap-1">
                            <Badge className={itemStatusColors[item.status]}>{item.status}</Badge>
                            {statusIcons[item.test_status]}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                          <span>v{item.current_version || 1}</span>
                          {item.group && <Badge variant="outline">{item.group}</Badge>}
                        </div>
                        <Button size="sm" variant="outline" className="w-full">
                          <Eye className="h-3 w-3 mr-2" />
                          Open
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Concepts Tab */}
        <TabsContent value="concepts" className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-muted-foreground">New concepts being developed before adding to playground</p>
            <Link to={createPageUrl("ConceptWorkbench")}>
              <Button>
                <Lightbulb className="h-4 w-4 mr-2" />
                New Concept
              </Button>
            </Link>
          </div>

          <Card className="border-border">
            <CardContent className="p-4">
              {conceptItems.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No concepts yet</p>
                  <p className="text-sm mt-1">Create a new entity, page, or feature concept</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {conceptItems.map(concept => (
                    <Link key={concept.id} to={createPageUrl("ConceptWorkbench") + `?id=${concept.id}`}>
                      <Card className="hover:shadow-md transition-shadow border-warning/20">
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between">
                            <CardTitle className="text-base flex items-center gap-2">
                              {typeIcons[concept.item_type]}
                              {concept.name}
                            </CardTitle>
                            <Badge variant="outline">{concept.status}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{concept.description}</p>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="flex items-center gap-2 mb-3">
                            {statusIcons[concept.test_status]}
                            <span className="text-xs text-muted-foreground">
                              {concept.test_status === "passed" ? "Tests passed" : 
                               concept.test_status === "failed" ? "Tests failed" : "Not tested"}
                            </span>
                          </div>
                          <Button size="sm" variant="outline" className="w-full">
                            <Edit className="h-3 w-3 mr-2" />
                            Edit Concept
                          </Button>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}