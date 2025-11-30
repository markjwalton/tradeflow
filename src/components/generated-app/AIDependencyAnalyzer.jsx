import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Database,
  Layout,
  Zap,
  Workflow,
  AlertTriangle,
  CheckCircle,
  Sparkles,
  Loader2,
  ChevronRight,
  FileText,
  ListChecks,
} from "lucide-react";
import { toast } from "sonner";

export default function AIDependencyAnalyzer({
  selectedEntities = [],
  selectedPages = [],
  selectedFeatures = [],
  selectedWorkflows = [],
  allEntities = [],
  allPages = [],
  allFeatures = [],
  allWorkflows = [],
  allForms = [],
  allChecklists = [],
  onApplySuggestions,
}) {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [selectedSuggestions, setSelectedSuggestions] = useState({
    entities: [],
    pages: [],
    features: [],
    workflows: [],
    forms: [],
    checklists: [],
  });

  const runAnalysis = async () => {
    setAnalyzing(true);
    try {
      // Build context for AI
      const context = {
        selectedEntities: selectedEntities.map((e) => ({
          name: e.name,
          description: e.description,
          schema: e.schema,
          relationships: e.relationships,
        })),
        selectedPages: selectedPages.map((p) => ({
          name: p.name,
          description: p.description,
          entities_used: p.entities_used,
          features: p.features,
        })),
        selectedFeatures: selectedFeatures.map((f) => ({
          name: f.name,
          description: f.description,
          entities_used: f.entities_used,
        })),
        selectedWorkflows: selectedWorkflows.map((w) => ({
          name: w.name,
          description: w.description,
          triggerEntity: w.triggerEntity,
        })),
        availableEntities: allEntities
          .filter((e) => !selectedEntities.find((se) => se.id === e.id))
          .map((e) => ({ name: e.name, description: e.description })),
        availablePages: allPages
          .filter((p) => !selectedPages.find((sp) => sp.id === p.id))
          .map((p) => ({
            name: p.name,
            description: p.description,
            category: p.category,
            entities_used: p.entities_used,
          })),
        availableFeatures: allFeatures
          .filter((f) => !selectedFeatures.find((sf) => sf.id === f.id))
          .map((f) => ({
            name: f.name,
            description: f.description,
            category: f.category,
          })),
        availableForms: allForms.map((f) => ({ name: f.name, code: f.code })),
        availableChecklists: allChecklists.map((c) => ({ name: c.name, code: c.code })),
      };

      const prompt = `Analyze this application specification and identify missing dependencies, gaps, and suggestions.

SELECTED ITEMS:
${JSON.stringify(context.selectedEntities, null, 2)}

Selected Pages: ${JSON.stringify(context.selectedPages, null, 2)}

Selected Features: ${JSON.stringify(context.selectedFeatures, null, 2)}

Selected Workflows: ${JSON.stringify(context.selectedWorkflows, null, 2)}

AVAILABLE (not yet selected):
Entities: ${JSON.stringify(context.availableEntities, null, 2)}
Pages: ${JSON.stringify(context.availablePages, null, 2)}
Features: ${JSON.stringify(context.availableFeatures, null, 2)}
Forms: ${JSON.stringify(context.availableForms, null, 2)}
Checklists: ${JSON.stringify(context.availableChecklists, null, 2)}

ANALYSIS TASKS:
1. Check entity relationships - if an entity references another entity (e.g., customerId references Customer), flag if that entity is missing
2. Check if entities have appropriate pages (list, detail, form pages)
3. Suggest features that would enhance the selected entities (e.g., email notifications for Enquiry, PDF export for Estimate)
4. Check if workflows reference forms or checklists that should be included
5. Identify any logical gaps in the application design

For each suggestion, explain WHY it's needed.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            missingEntities: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  reason: { type: "string" },
                  referencedBy: { type: "string" },
                  severity: { type: "string", enum: ["critical", "recommended", "optional"] },
                },
              },
            },
            missingPages: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  reason: { type: "string" },
                  forEntity: { type: "string" },
                  pageType: { type: "string" },
                  severity: { type: "string", enum: ["critical", "recommended", "optional"] },
                },
              },
            },
            suggestedFeatures: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  reason: { type: "string" },
                  forEntities: { type: "array", items: { type: "string" } },
                  severity: { type: "string", enum: ["critical", "recommended", "optional"] },
                },
              },
            },
            missingForms: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  reason: { type: "string" },
                  usedInWorkflow: { type: "string" },
                },
              },
            },
            missingChecklists: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  reason: { type: "string" },
                  usedInWorkflow: { type: "string" },
                },
              },
            },
            gaps: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  issue: { type: "string" },
                  suggestion: { type: "string" },
                  severity: { type: "string", enum: ["critical", "recommended", "optional"] },
                },
              },
            },
            summary: { type: "string" },
          },
        },
      });

      setAnalysis(result);

      // Pre-select critical and recommended items
      const preSelected = {
        entities: result.missingEntities
          ?.filter((e) => e.severity !== "optional")
          .map((e) => e.name) || [],
        pages: result.missingPages
          ?.filter((p) => p.severity !== "optional")
          .map((p) => p.name) || [],
        features: result.suggestedFeatures
          ?.filter((f) => f.severity !== "optional")
          .map((f) => f.name) || [],
        forms: result.missingForms?.map((f) => f.name) || [],
        checklists: result.missingChecklists?.map((c) => c.name) || [],
      };
      setSelectedSuggestions(preSelected);

      toast.success("Analysis complete");
    } catch (error) {
      console.error("Analysis error:", error);
      toast.error("Failed to analyze dependencies");
    }
    setAnalyzing(false);
  };

  const toggleSelection = (type, name) => {
    setSelectedSuggestions((prev) => ({
      ...prev,
      [type]: prev[type].includes(name)
        ? prev[type].filter((n) => n !== name)
        : [...prev[type], name],
    }));
  };

  const handleApply = () => {
    // Find full objects for selected items
    const entitiesToAdd = allEntities.filter((e) =>
      selectedSuggestions.entities.includes(e.name)
    );
    const pagesToAdd = allPages.filter((p) =>
      selectedSuggestions.pages.includes(p.name)
    );
    const featuresToAdd = allFeatures.filter((f) =>
      selectedSuggestions.features.includes(f.name)
    );
    const formsToAdd = allForms.filter((f) =>
      selectedSuggestions.forms.includes(f.name)
    );
    const checklistsToAdd = allChecklists.filter((c) =>
      selectedSuggestions.checklists.includes(c.name)
    );

    onApplySuggestions({
      entities: entitiesToAdd,
      pages: pagesToAdd,
      features: featuresToAdd,
      forms: formsToAdd,
      checklists: checklistsToAdd,
      gaps: analysis?.gaps || [],
    });
  };

  const severityColors = {
    critical: "bg-red-100 text-red-700 border-red-300",
    recommended: "bg-amber-100 text-amber-700 border-amber-300",
    optional: "bg-blue-100 text-blue-700 border-blue-300",
  };

  const severityIcons = {
    critical: <AlertTriangle className="h-4 w-4 text-red-500" />,
    recommended: <Sparkles className="h-4 w-4 text-amber-500" />,
    optional: <CheckCircle className="h-4 w-4 text-blue-500" />,
  };

  if (!analysis) {
    return (
      <Card className="border-dashed">
        <CardContent className="pt-6">
          <div className="text-center">
            <Sparkles className="h-12 w-12 mx-auto text-purple-400 mb-4" />
            <h3 className="font-semibold mb-2">AI Dependency Analyzer</h3>
            <p className="text-sm text-gray-500 mb-4">
              Analyze your selection to find missing entities, suggest pages,
              and identify gaps in your application design.
            </p>
            <Button onClick={runAnalysis} disabled={analyzing}>
              {analyzing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Run Analysis
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalIssues =
    (analysis.missingEntities?.length || 0) +
    (analysis.missingPages?.length || 0) +
    (analysis.suggestedFeatures?.length || 0) +
    (analysis.gaps?.length || 0);

  const criticalCount = [
    ...(analysis.missingEntities || []),
    ...(analysis.missingPages || []),
    ...(analysis.suggestedFeatures || []),
    ...(analysis.gaps || []),
  ].filter((i) => i.severity === "critical").length;

  return (
    <Card className={criticalCount > 0 ? "border-red-200 bg-red-50/50" : "border-green-200 bg-green-50/50"}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            {criticalCount > 0 ? (
              <AlertTriangle className="h-5 w-5 text-red-500" />
            ) : (
              <CheckCircle className="h-5 w-5 text-green-500" />
            )}
            Analysis Results
          </CardTitle>
          <Button variant="outline" size="sm" onClick={runAnalysis} disabled={analyzing}>
            {analyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Re-analyze"}
          </Button>
        </div>
        <p className="text-sm text-gray-600">{analysis.summary}</p>
        <div className="flex gap-2 mt-2">
          <Badge className={severityColors.critical}>
            {criticalCount} Critical
          </Badge>
          <Badge className={severityColors.recommended}>
            {[...(analysis.missingEntities || []), ...(analysis.missingPages || []), ...(analysis.suggestedFeatures || [])].filter((i) => i.severity === "recommended").length} Recommended
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="entities">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="entities" className="text-xs">
              <Database className="h-3 w-3 mr-1" />
              Entities ({analysis.missingEntities?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="pages" className="text-xs">
              <Layout className="h-3 w-3 mr-1" />
              Pages ({analysis.missingPages?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="features" className="text-xs">
              <Zap className="h-3 w-3 mr-1" />
              Features ({analysis.suggestedFeatures?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="workflow" className="text-xs">
              <Workflow className="h-3 w-3 mr-1" />
              Workflow
            </TabsTrigger>
            <TabsTrigger value="gaps" className="text-xs">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Gaps ({analysis.gaps?.length || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="entities">
            <ScrollArea className="h-52">
              <div className="space-y-2 pr-2">
                {analysis.missingEntities?.length > 0 ? (
                  analysis.missingEntities.map((entity) => (
                    <div
                      key={entity.name}
                      className={`flex items-start gap-3 p-3 bg-white rounded-lg border ${
                        severityColors[entity.severity]
                      }`}
                    >
                      <Checkbox
                        checked={selectedSuggestions.entities.includes(entity.name)}
                        onCheckedChange={() => toggleSelection("entities", entity.name)}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          {severityIcons[entity.severity]}
                          <span className="font-medium">{entity.name}</span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">{entity.reason}</p>
                        {entity.referencedBy && (
                          <Badge variant="outline" className="text-xs mt-1">
                            Referenced by: {entity.referencedBy}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                    <p className="text-sm">All entity dependencies satisfied</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="pages">
            <ScrollArea className="h-52">
              <div className="space-y-2 pr-2">
                {analysis.missingPages?.length > 0 ? (
                  analysis.missingPages.map((page) => (
                    <div
                      key={page.name}
                      className={`flex items-start gap-3 p-3 bg-white rounded-lg border ${
                        severityColors[page.severity]
                      }`}
                    >
                      <Checkbox
                        checked={selectedSuggestions.pages.includes(page.name)}
                        onCheckedChange={() => toggleSelection("pages", page.name)}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          {severityIcons[page.severity]}
                          <span className="font-medium">{page.name}</span>
                          {page.pageType && (
                            <Badge variant="secondary" className="text-xs">
                              {page.pageType}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 mt-1">{page.reason}</p>
                        {page.forEntity && (
                          <Badge variant="outline" className="text-xs mt-1">
                            For: {page.forEntity}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                    <p className="text-sm">All page requirements covered</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="features">
            <ScrollArea className="h-52">
              <div className="space-y-2 pr-2">
                {analysis.suggestedFeatures?.length > 0 ? (
                  analysis.suggestedFeatures.map((feature) => (
                    <div
                      key={feature.name}
                      className={`flex items-start gap-3 p-3 bg-white rounded-lg border ${
                        severityColors[feature.severity]
                      }`}
                    >
                      <Checkbox
                        checked={selectedSuggestions.features.includes(feature.name)}
                        onCheckedChange={() => toggleSelection("features", feature.name)}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          {severityIcons[feature.severity]}
                          <span className="font-medium">{feature.name}</span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">{feature.reason}</p>
                        {feature.forEntities?.length > 0 && (
                          <div className="flex gap-1 mt-1">
                            {feature.forEntities.map((e) => (
                              <Badge key={e} variant="outline" className="text-xs">
                                {e}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                    <p className="text-sm">No additional features suggested</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="workflow">
            <ScrollArea className="h-52">
              <div className="space-y-4 pr-2">
                {analysis.missingForms?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Missing Forms
                    </h4>
                    <div className="space-y-2">
                      {analysis.missingForms.map((form) => (
                        <div key={form.name} className="flex items-start gap-3 p-2 bg-white rounded border">
                          <Checkbox
                            checked={selectedSuggestions.forms.includes(form.name)}
                            onCheckedChange={() => toggleSelection("forms", form.name)}
                          />
                          <div>
                            <span className="font-medium text-sm">{form.name}</span>
                            <p className="text-xs text-gray-500">{form.reason}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {analysis.missingChecklists?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <ListChecks className="h-4 w-4" />
                      Missing Checklists
                    </h4>
                    <div className="space-y-2">
                      {analysis.missingChecklists.map((checklist) => (
                        <div key={checklist.name} className="flex items-start gap-3 p-2 bg-white rounded border">
                          <Checkbox
                            checked={selectedSuggestions.checklists.includes(checklist.name)}
                            onCheckedChange={() => toggleSelection("checklists", checklist.name)}
                          />
                          <div>
                            <span className="font-medium text-sm">{checklist.name}</span>
                            <p className="text-xs text-gray-500">{checklist.reason}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {!analysis.missingForms?.length && !analysis.missingChecklists?.length && (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                    <p className="text-sm">All workflow dependencies satisfied</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="gaps">
            <ScrollArea className="h-52">
              <div className="space-y-2 pr-2">
                {analysis.gaps?.length > 0 ? (
                  analysis.gaps.map((gap, idx) => (
                    <div
                      key={idx}
                      className={`p-3 bg-white rounded-lg border ${severityColors[gap.severity]}`}
                    >
                      <div className="flex items-center gap-2">
                        {severityIcons[gap.severity]}
                        <span className="font-medium text-sm">{gap.issue}</span>
                      </div>
                      <div className="flex items-start gap-2 mt-2 text-xs text-gray-600">
                        <ChevronRight className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        <span>{gap.suggestion}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                    <p className="text-sm">No design gaps identified</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between items-center mt-4 pt-4 border-t">
          <div className="text-sm text-gray-500">
            {Object.values(selectedSuggestions).flat().length} items selected
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setSelectedSuggestions({
                  entities: [],
                  pages: [],
                  features: [],
                  forms: [],
                  checklists: [],
                })
              }
            >
              Clear
            </Button>
            <Button size="sm" onClick={handleApply}>
              Apply Selected
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}