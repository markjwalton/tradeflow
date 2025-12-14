import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  ArrowLeft, Play, CheckCircle2, XCircle, Circle, 
  Loader2, Layout, Zap, Database, Sparkles, Eye, Edit, ArrowUpCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { toast } from "sonner";
import PagePreview from "@/components/library/PagePreview";
import PlaygroundEditor from "@/components/playground/PlaygroundEditor";
import VersionHistory from "@/components/playground/VersionHistory";
import PlaygroundJournalPanel from "@/components/playground/PlaygroundJournalPanel";
import PromoteToLibraryDialog from "@/components/playground/PromoteToLibraryDialog";
import { PageHeader } from "@/components/sturij";

const complexityColors = {
  simple: "bg-success-50 text-success",
  medium: "bg-warning/10 text-warning",
  complex: "bg-destructive-50 text-destructive",
};

export default function PlaygroundItem() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const itemId = urlParams.get("id");
  
  const [isRunning, setIsRunning] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [showPromote, setShowPromote] = useState(false);

  const { data: item, isLoading } = useQuery({
    queryKey: ["playgroundItem", itemId],
    queryFn: async () => {
      const items = await base44.entities.PlaygroundItem.filter({ id: itemId });
      return items[0];
    },
    enabled: !!itemId
  });

  const { data: pageTemplates = [] } = useQuery({
    queryKey: ["pageTemplates"],
    queryFn: () => base44.entities.PageTemplate.list(),
  });

  const { data: featureTemplates = [] } = useQuery({
    queryKey: ["featureTemplates"],
    queryFn: () => base44.entities.FeatureTemplate.list(),
  });

  const { data: entityTemplates = [] } = useQuery({
    queryKey: ["entityTemplates"],
    queryFn: () => base44.entities.EntityTemplate.list(),
  });

  // Find template based on item type
  const template = item?.source_type === "page" 
    ? pageTemplates.find(t => t.id === item?.source_id)
    : item?.source_type === "feature"
    ? featureTemplates.find(t => t.id === item?.source_id)
    : item?.source_type === "entity"
    ? entityTemplates.find(t => t.id === item?.source_id)
    : null;

  const { data: journalEntries = [] } = useQuery({
    queryKey: ["playgroundJournal", itemId],
    queryFn: () => base44.entities.PlaygroundJournal.filter({ playground_item_id: itemId }, "-created_date"),
    enabled: !!itemId
  });

  const { data: testDataSets = [] } = useQuery({
    queryKey: ["testData", itemId],
    queryFn: () => base44.entities.TestData.filter({ playground_item_id: itemId }),
    enabled: !!itemId
  });

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.PlaygroundItem.update(itemId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playgroundItem", itemId] });
      toast.success("Updated");
    },
  });

  const handleSaveVersion = (newData, changeSummary) => {
    const currentVersion = item.current_version || 1;
    const newVersion = currentVersion + 1;
    const versions = item.versions || [];
    
    if (!versions.find(v => v.version === currentVersion)) {
      versions.push({
        version: currentVersion,
        data: item.working_data || template,
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

    updateMutation.mutate({
      working_data: newData,
      current_version: newVersion,
      versions: versions,
      test_status: "pending"
    });
    
    base44.entities.PlaygroundJournal.create({
      playground_item_id: itemId,
      content: changeSummary,
      entry_type: "version_note",
      version_reference: newVersion,
      entry_date: new Date().toISOString()
    });
    
    setShowEditor(false);
    toast.success(`Saved as version ${newVersion}`);
  };

  const handleRevert = (version) => {
    const versionData = item.versions?.find(v => v.version === version);
    if (!versionData) return;
    
    updateMutation.mutate({
      working_data: versionData.data,
      current_version: version,
      test_status: "pending"
    });
    toast.success(`Reverted to version ${version}`);
  };

  const runTests = async () => {
    if (!template) return;
    setIsRunning(true);

    const tests = item.test_definition?.tests || [];
    const passed = [];
    const failed = [];
    const errors = [];

    for (const test of tests) {
      try {
        let result = false;
        
        if (item.source_type === "page") {
          const { name, category, components, entities_used } = template;
          if (test.check.includes("name")) result = name !== undefined;
          else if (test.check.includes("category")) result = category !== undefined;
          else if (test.check.includes("components")) result = Array.isArray(components);
          else if (test.check.includes("entities_used")) result = Array.isArray(entities_used);
          else if (test.check.includes("test_data")) result = testDataSets.length > 0;
          else result = true;
        } else if (item.source_type === "feature") {
          const { name, description, complexity, user_stories } = template;
          if (test.check.includes("name")) result = name !== undefined;
          else if (test.check.includes("description")) result = description && description.length > 10;
          else if (test.check.includes("complexity")) result = complexity !== undefined;
          else if (test.check.includes("user_stories")) result = Array.isArray(user_stories) && user_stories.length > 0;
          else if (test.check.includes("test_data")) result = testDataSets.length > 0;
          else result = true;
        } else if (item.source_type === "entity") {
          const { name, schema } = template;
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
    
    updateMutation.mutate({
      test_status: status,
      test_results: { passed, failed, errors },
      last_test_date: new Date().toISOString()
    });
    
    setIsRunning(false);
  };

  const generateAISuggestions = async () => {
    if (!template || isGenerating) return;
    setIsGenerating(true);

    try {
      let prompt = "";
      
      if (item.source_type === "page") {
        prompt = `Analyze this page template and suggest improvements:

Page Name: ${template.name}
Description: ${template.description || "None"}
Category: ${template.category}
Layout: ${template.layout}
Components: ${JSON.stringify(template.components || [], null, 2)}
Entities Used: ${JSON.stringify(template.entities_used || [], null, 2)}
Features: ${JSON.stringify(template.features || [], null, 2)}

Provide 3-5 specific suggestions to improve this page.`;
      } else if (item.source_type === "feature") {
        prompt = `Analyze this feature template and suggest improvements:

Feature Name: ${template.name}
Description: ${template.description || "None"}
Complexity: ${template.complexity}
Entities Used: ${JSON.stringify(template.entities_used || [], null, 2)}
Requirements: ${JSON.stringify(template.requirements || [], null, 2)}

Provide 5-7 specific suggestions to improve this feature.`;
      } else if (item.source_type === "entity") {
        prompt = `Analyze this entity schema and suggest improvements:

Entity Name: ${template.name}
Description: ${template.description || "None"}
Schema: ${JSON.stringify(template.schema || {}, null, 2)}
Relationships: ${JSON.stringify(template.relationships || [], null, 2)}

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

      updateMutation.mutate({ ai_suggestions: result.suggestions || [] });
      toast.success("AI suggestions generated");
    } catch (error) {
      if (error.message?.includes("Rate limit")) {
        toast.error("Please wait a moment before trying again");
      } else {
        toast.error("Failed to generate suggestions");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading || !item) {
    return (
      <div className="flex justify-center items-center h-64 bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const statusIcon = {
    passed: <CheckCircle2 className="h-5 w-5 text-success" />,
    failed: <XCircle className="h-5 w-5 text-destructive" />,
    pending: <Circle className="h-5 w-5 text-muted-foreground" />,
  }[item.test_status];

  const typeIcon = {
    page: <Layout className="h-6 w-6 text-info" />,
    feature: <Zap className="h-6 w-6 text-warning" />,
    entity: <Database className="h-6 w-6 text-accent" />,
  }[item.source_type];

  const typeLabel = {
    page: "Page",
    feature: "Feature", 
    entity: "Entity"
  }[item.source_type];

  return (
    <div className="max-w-5xl mx-auto -mt-6 bg-background min-h-screen">
      <PageHeader 
        title={item.source_name}
        description={`${typeLabel} Playground`}
      >
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate(createPageUrl("PlaygroundSummary"))}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          {typeIcon}
          <Badge variant="outline">v{item.current_version || 1}</Badge>
          {statusIcon}
          <Badge className={
            item.test_status === "passed" ? "bg-success-50 text-success" :
            item.test_status === "failed" ? "bg-destructive-50 text-destructive" :
            "bg-muted text-muted-foreground"
          }>
            {item.test_status}
          </Badge>
        </div>
      </PageHeader>

      {/* Action Buttons */}
      <div className="flex gap-2 mb-6">
        <Button onClick={() => setShowEditor(true)}>
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>
        <Button variant="outline" onClick={runTests} disabled={isRunning}>
          {isRunning ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
          Run Tests
        </Button>
        <Button 
          variant="outline" 
          className="text-success border-success/30 hover:bg-success-50"
          onClick={() => setShowPromote(true)}
          disabled={item.test_status !== "passed"}
        >
          <ArrowUpCircle className="h-4 w-4 mr-2" />
          Promote to Library
        </Button>
      </div>

      {/* Preview/Summary Section - varies by type */}
      {template && item.source_type === "page" && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Page Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PagePreview page={template} />
          </CardContent>
        </Card>
      )}

      {template && item.source_type === "feature" && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              Feature Summary
              <Badge className={complexityColors[template.complexity || "medium"]}>
                {template.complexity || "medium"} complexity
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">{template.description}</p>
            <div className="grid grid-cols-2 gap-4">
              {template.entities_used?.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Entities Used</h4>
                  <div className="flex flex-wrap gap-1">
                    {template.entities_used.map(e => (
                      <Badge key={e} variant="outline">{e}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {template.triggers?.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Triggers</h4>
                  <div className="flex flex-wrap gap-1">
                    {template.triggers.map(t => (
                      <Badge key={t} className="bg-info-50 text-info">{t}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {template && item.source_type === "entity" && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Entity Schema</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">{template.description}</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Fields</h4>
                <div className="space-y-1">
                  {Object.keys(template.schema?.properties || {}).map(field => (
                    <Badge key={field} variant="outline">{field}</Badge>
                  ))}
                </div>
              </div>
              {template.relationships?.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Relationships</h4>
                  <div className="flex flex-wrap gap-1">
                    {template.relationships.map((r, i) => (
                      <Badge key={i} className="bg-accent-100 text-accent">{r.target_entity}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-3 gap-6">
        {/* Details Column - varies by type */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">
              {item.source_type === "page" ? "Page Details" : 
               item.source_type === "feature" ? "Requirements & User Stories" : 
               "Entity Details"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {template ? (
              <div className="space-y-4">
                {/* Page type details */}
                {item.source_type === "page" && (
                  <>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Description</h4>
                      <p className="text-sm">{template.description || "No description"}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Category</h4>
                        <Badge>{template.category}</Badge>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Layout</h4>
                        <Badge variant="outline">{template.layout}</Badge>
                      </div>
                    </div>
                    {template.components?.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">Components ({template.components.length})</h4>
                        <div className="space-y-1">
                          {template.components.map((c, i) => (
                            <div key={i} className="text-sm bg-muted p-2 rounded">
                              <span className="font-medium">{c.name}</span>
                              {c.type && <Badge variant="outline" className="ml-2 text-xs">{c.type}</Badge>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Feature type details */}
                {item.source_type === "feature" && (
                  <>
                    {template.requirements?.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">Requirements</h4>
                        <ul className="space-y-1">
                          {template.requirements.map((r, i) => (
                            <li key={i} className="text-sm flex items-start gap-2">
                              <CheckCircle2 className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                              {r}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {template.user_stories?.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">User Stories</h4>
                        <ul className="space-y-2">
                          {template.user_stories.map((s, i) => (
                            <li key={i} className="text-sm bg-muted p-2 rounded italic">
                              "{s}"
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                )}

                {/* Entity type details */}
                {item.source_type === "entity" && (
                  <>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">Schema Properties</h4>
                      <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-64">
                        {JSON.stringify(template.schema?.properties || {}, null, 2)}
                      </pre>
                    </div>
                    {template.relationships?.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">Relationships</h4>
                        <div className="space-y-2">
                          {template.relationships.map((rel, i) => (
                            <div key={i} className="text-sm bg-muted p-2 rounded">
                              <span className="font-medium">{rel.target_entity}</span>
                              <Badge variant="outline" className="ml-2 text-xs">{rel.relationship_type}</Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">Template not found</p>
            )}
          </CardContent>
        </Card>

        {/* Unit Tests & Version History */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Unit Tests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {item.test_definition?.tests?.map((test, i) => {
                  const isPassed = item.test_results?.passed?.includes(test.name);
                  const isFailed = item.test_results?.failed?.includes(test.name);
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
            versions={item.versions || []}
            currentVersion={item.current_version || 1}
            onRevert={handleRevert}
          />
        </div>
      </div>

      {/* Journal Panel */}
      <div className="mt-6">
        <PlaygroundJournalPanel 
          playgroundItemId={itemId} 
          currentVersion={item.current_version || 1}
        />
      </div>

      {/* AI Suggestions */}
      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-accent" />
            AI Suggestions
          </CardTitle>
          <Button onClick={generateAISuggestions} disabled={isGenerating} variant="outline">
            {isGenerating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
            Generate Suggestions
          </Button>
        </CardHeader>
        <CardContent>
          {item.ai_suggestions?.length > 0 ? (
            <ul className="space-y-2">
              {item.ai_suggestions.map((suggestion, i) => (
                <li key={i} className="flex items-start gap-2 p-3 bg-accent-100 rounded-lg">
                  <span className="text-accent font-bold">{i + 1}.</span>
                  <span className="text-sm">{suggestion}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground text-center py-4">No suggestions yet. Click "Generate Suggestions" to get AI-powered improvements.</p>
          )}
        </CardContent>
      </Card>

      {/* Editor Dialog */}
      {showEditor && (
        <PlaygroundEditor
          item={item}
          template={template}
          workingData={item.working_data}
          onSave={handleSaveVersion}
          onClose={() => setShowEditor(false)}
          type={item.source_type}
        />
      )}

      {/* Promote Dialog */}
      {showPromote && (
        <PromoteToLibraryDialog
          item={item}
          template={template}
          workingData={item.working_data}
          journalEntries={journalEntries}
          onClose={() => setShowPromote(false)}
          type={item.source_type}
        />
      )}
    </div>
  );
}