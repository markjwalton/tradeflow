import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowLeft, Play, CheckCircle2, XCircle, Circle, 
  Loader2, Zap, Sparkles
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { toast } from "sonner";

const complexityColors = {
  simple: "bg-green-100 text-green-700",
  medium: "bg-yellow-100 text-yellow-700",
  complex: "bg-red-100 text-red-700",
};

export default function PlaygroundFeature() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const itemId = urlParams.get("id");
  
  const [isRunning, setIsRunning] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: item, isLoading } = useQuery({
    queryKey: ["playgroundItem", itemId],
    queryFn: async () => {
      const items = await base44.entities.PlaygroundItem.filter({ id: itemId });
      return items[0];
    },
    enabled: !!itemId
  });

  const { data: featureTemplates = [] } = useQuery({
    queryKey: ["featureTemplates"],
    queryFn: () => base44.entities.FeatureTemplate.list(),
  });

  const template = featureTemplates.find(t => t.id === item?.source_id);

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.PlaygroundItem.update(itemId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playgroundItem", itemId] });
      toast.success("Updated");
    },
  });

  const runTests = async () => {
    if (!template) return;
    setIsRunning(true);

    const tests = item.test_definition?.tests || [];
    const passed = [];
    const failed = [];
    const errors = [];

    for (const test of tests) {
      try {
        const { name, description, complexity, user_stories } = template;
        let result = false;
        
        if (test.check.includes("name")) result = name !== undefined;
        else if (test.check.includes("description")) result = description && description.length > 10;
        else if (test.check.includes("complexity")) result = complexity !== undefined;
        else if (test.check.includes("user_stories")) result = Array.isArray(user_stories) && user_stories.length > 0;
        else result = true;

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
    if (!template) return;
    setIsGenerating(true);

    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this feature template and suggest improvements:

Feature Name: ${template.name}
Description: ${template.description || "None"}
Category: ${template.category}
Complexity: ${template.complexity}
Entities Used: ${JSON.stringify(template.entities_used || [], null, 2)}
Triggers: ${JSON.stringify(template.triggers || [], null, 2)}
Integrations: ${JSON.stringify(template.integrations || [], null, 2)}
Requirements: ${JSON.stringify(template.requirements || [], null, 2)}
User Stories: ${JSON.stringify(template.user_stories || [], null, 2)}

Provide 5-7 specific suggestions to improve this feature:
- Enhanced functionality
- Additional use cases
- Performance optimizations
- Security considerations
- User experience improvements
- Integration opportunities
- Best practices

Return as JSON with a "suggestions" array of strings.`,
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
      toast.error("Failed to generate suggestions");
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading || !item) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const statusIcon = {
    passed: <CheckCircle2 className="h-5 w-5 text-green-600" />,
    failed: <XCircle className="h-5 w-5 text-red-600" />,
    pending: <Circle className="h-5 w-5 text-gray-400" />,
  }[item.test_status];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(createPageUrl("PlaygroundSummary"))}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="h-6 w-6 text-amber-600" />
            {item.source_name}
          </h1>
          <p className="text-gray-500">Feature Playground</p>
        </div>
        <div className="flex items-center gap-2">
          {statusIcon}
          <Badge className={
            item.test_status === "passed" ? "bg-green-100 text-green-800" :
            item.test_status === "failed" ? "bg-red-100 text-red-800" :
            "bg-gray-100 text-gray-800"
          }>
            {item.test_status}
          </Badge>
        </div>
      </div>

      {/* Feature Summary */}
      {template && (
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
            <p className="text-gray-600 mb-4">{template.description}</p>
            <div className="grid grid-cols-2 gap-4">
              {template.entities_used?.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Entities Used</h4>
                  <div className="flex flex-wrap gap-1">
                    {template.entities_used.map(e => (
                      <Badge key={e} variant="outline">{e}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {template.triggers?.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Triggers</h4>
                  <div className="flex flex-wrap gap-1">
                    {template.triggers.map(t => (
                      <Badge key={t} className="bg-blue-100 text-blue-800">{t}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {template.integrations?.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Integrations</h4>
                  <div className="flex flex-wrap gap-1">
                    {template.integrations.map(i => (
                      <Badge key={i} className="bg-purple-100 text-purple-800">{i}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-6">
        {/* Requirements & User Stories */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Requirements & User Stories</CardTitle>
          </CardHeader>
          <CardContent>
            {template ? (
              <div className="space-y-4">
                {template.requirements?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Requirements</h4>
                    <ul className="space-y-1">
                      {template.requirements.map((r, i) => (
                        <li key={i} className="text-sm flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {template.user_stories?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">User Stories</h4>
                    <ul className="space-y-2">
                      {template.user_stories.map((s, i) => (
                        <li key={i} className="text-sm bg-slate-50 p-2 rounded italic">
                          "{s}"
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {!template.requirements?.length && !template.user_stories?.length && (
                  <p className="text-gray-500">No requirements or user stories defined</p>
                )}
              </div>
            ) : (
              <p className="text-gray-500">Template not found</p>
            )}
          </CardContent>
        </Card>

        {/* Unit Tests */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Unit Tests</CardTitle>
            <Button onClick={runTests} disabled={isRunning}>
              {isRunning ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
              Run Tests
            </Button>
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
                      isPassed ? "bg-green-50" : isFailed ? "bg-red-50" : "bg-gray-50"
                    }`}
                  >
                    <span className="text-sm">{test.name}</span>
                    {isPassed && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                    {isFailed && <XCircle className="h-4 w-4 text-red-600" />}
                    {!isPassed && !isFailed && <Circle className="h-4 w-4 text-gray-400" />}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Suggestions */}
      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            AI Improvement Suggestions
          </CardTitle>
          <Button onClick={generateAISuggestions} disabled={isGenerating}>
            {isGenerating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
            AI Suggest Improvements
          </Button>
        </CardHeader>
        <CardContent>
          {item.ai_suggestions?.length > 0 ? (
            <ul className="space-y-2">
              {item.ai_suggestions.map((suggestion, i) => (
                <li key={i} className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg">
                  <Sparkles className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{suggestion}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-center py-4">No suggestions yet. Click "AI Suggest Improvements" to get AI-powered enhancement ideas.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}