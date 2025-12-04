import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
import { Sparkles, Loader2, CheckCircle2, Plus, Lightbulb } from "lucide-react";
import { toast } from "sonner";

export default function AIWidgetGenerator({ 
  isOpen, 
  onClose, 
  entities = [], 
  pages = [], 
  features = [] 
}) {
  const queryClient = useQueryClient();
  const [mode, setMode] = useState("recommend"); // recommend, create, insight
  const [widgetType, setWidgetType] = useState("stat_card");
  const [customPrompt, setCustomPrompt] = useState("");
  const [generatedWidgets, setGeneratedWidgets] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedWidgets, setSelectedWidgets] = useState(new Set());

  const createMutation = useMutation({
    mutationFn: (widgets) => Promise.all(
      widgets.map(w => base44.entities.DashboardWidget.create(w))
    ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboardWidgets"] });
      toast.success("Widgets created and added to staging");
      onClose();
    }
  });

  const generateRecommendations = async () => {
    setIsGenerating(true);
    setGeneratedWidgets([]);

    try {
      // Build context - handle cases where templates might not exist
      const context = {
        entities: entities.length > 0 
          ? entities.map(e => ({ name: e.name, category: e.category, fields: Object.keys(e.schema?.properties || {}) }))
          : ["Project", "Task", "Customer", "Appointment", "Estimate"].map(n => ({ name: n })),
        pages: pages.length > 0 
          ? pages.map(p => ({ name: p.name, category: p.category }))
          : ["Dashboard", "Projects", "Tasks", "Customers", "Calendar"].map(n => ({ name: n })),
        features: features.length > 0 
          ? features.map(f => ({ name: f.name, category: f.category }))
          : []
      };

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Based on this application architecture, recommend dashboard widgets:

Application Context:
${JSON.stringify(context, null, 2)}

Generate 5-8 recommended dashboard widgets. For each widget include:
- name: Display name
- widget_type: One of "stat_card", "info_card", "quick_action", "ai_insight", "chart", "table"
- description: What this widget shows
- category: Widget category (e.g., "Analytics", "Quick Actions", "Insights")
- config: Widget configuration object with appropriate fields for the type
- reasoning: Why this widget would be valuable

For stat_card: include title, value (use a real number like "24" or "156"), change (like "+12%"), changeType (up/down), color (blue/green/purple/amber/red)
For quick_action: include title, description, actions array with label and url
For ai_insight: include title, insight text, confidence (0-1), source
For chart: include title, chartType (bar/line/pie)
For info_card: include title, content, variant (default/info/success/warning)

Return as JSON array.`,
        response_json_schema: {
          type: "object",
          properties: {
            widgets: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  widget_type: { type: "string" },
                  description: { type: "string" },
                  category: { type: "string" },
                  config: { type: "object" },
                  reasoning: { type: "string" }
                }
              }
            }
          }
        }
      });

      if (result.widgets && result.widgets.length > 0) {
        setGeneratedWidgets(result.widgets);
        toast.success(`Generated ${result.widgets.length} widget recommendations`);
      } else {
        toast.error("No widgets generated - try again");
      }
    } catch (error) {
      console.error("AI Generation error:", error);
      toast.error("Failed to generate recommendations: " + (error.message || "Unknown error"));
    } finally {
      setIsGenerating(false);
    }
  };

  const generateCustomWidget = async () => {
    if (!customPrompt.trim()) {
      toast.error("Please describe the widget you want");
      return;
    }

    setIsGenerating(true);
    setGeneratedWidgets([]);

    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Create a dashboard widget based on this request: "${customPrompt}"

Widget type: ${widgetType}

Generate a complete widget configuration including:
- name: Display name
- description: What this widget shows
- category: Widget category
- config: Complete configuration object for a ${widgetType} widget
- reasoning: How this fulfills the request

For stat_card: include title, value, change, changeType, color
For quick_action: include title, description, actions array
For ai_insight: include title, insight, confidence, source
For chart: include title, chartType, data placeholders
For info_card: include title, content, variant

Return as JSON object.`,
        response_json_schema: {
          type: "object",
          properties: {
            name: { type: "string" },
            widget_type: { type: "string" },
            description: { type: "string" },
            category: { type: "string" },
            config: { type: "object" },
            reasoning: { type: "string" }
          }
        }
      });

      setGeneratedWidgets([{ ...result, widget_type: widgetType }]);
    } catch (error) {
      toast.error("Failed to generate widget");
    } finally {
      setIsGenerating(false);
    }
  };

  const generateInsightWidgets = async () => {
    setIsGenerating(true);
    setGeneratedWidgets([]);

    try {
      const context = {
        entities: entities.map(e => e.name),
        pages: pages.map(p => p.name)
      };

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate AI insight widgets for a business dashboard.

Application has these entities: ${context.entities.join(", ")}
And these pages: ${context.pages.join(", ")}

Create 3-5 AI insight widgets that would provide valuable business intelligence. Each should:
- Analyze patterns, trends, or anomalies
- Provide actionable recommendations
- Include confidence scores

Return as JSON array with name, description, category, config (title, insight, confidence 0-1, source), reasoning.`,
        response_json_schema: {
          type: "object",
          properties: {
            widgets: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  description: { type: "string" },
                  category: { type: "string" },
                  config: { type: "object" },
                  reasoning: { type: "string" }
                }
              }
            }
          }
        }
      });

      setGeneratedWidgets((result.widgets || []).map(w => ({ ...w, widget_type: "ai_insight" })));
    } catch (error) {
      toast.error("Failed to generate insight widgets");
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleSelect = (index) => {
    setSelectedWidgets(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const handleCreate = () => {
    const widgetsToCreate = generatedWidgets
      .filter((_, i) => selectedWidgets.has(i))
      .map(w => ({
        name: w.name,
        description: w.description,
        widget_type: w.widget_type,
        category: w.category,
        config: w.config,
        ai_generated: true,
        ai_reasoning: w.reasoning,
        status: "staging",
        version: 1
      }));

    if (widgetsToCreate.length === 0) {
      toast.error("Select at least one widget");
      return;
    }

    createMutation.mutate(widgetsToCreate);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[var(--color-accent)]" />
            AI Widget Generator
          </DialogTitle>
        </DialogHeader>

        <div className="flex gap-2 border-b border-[var(--color-background-muted)] pb-3">
          <Button
            variant={mode === "recommend" ? "default" : "outline"}
            size="sm"
            onClick={() => setMode("recommend")}
            className={mode === "recommend" ? "bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)]" : ""}
          >
            <Lightbulb className="h-4 w-4 mr-1" />
            Recommend
          </Button>
          <Button
            variant={mode === "create" ? "default" : "outline"}
            size="sm"
            onClick={() => setMode("create")}
            className={mode === "create" ? "bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)]" : ""}
          >
            <Plus className="h-4 w-4 mr-1" />
            Custom
          </Button>
          <Button
            variant={mode === "insight" ? "default" : "outline"}
            size="sm"
            onClick={() => setMode("insight")}
            className={mode === "insight" ? "bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)]" : ""}
          >
            <Sparkles className="h-4 w-4 mr-1" />
            AI Insights
          </Button>
        </div>

        <div className="flex-1 overflow-auto">
          {mode === "recommend" && (
            <div className="space-y-4 p-1">
              <p className="text-sm text-[var(--color-charcoal)]">
                AI will analyze your app's entities, pages, and features to recommend relevant dashboard widgets.
              </p>
              <Button 
                onClick={generateRecommendations} 
                disabled={isGenerating}
                className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-dark)]"
              >
                {isGenerating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                Generate Recommendations
              </Button>
            </div>
          )}

          {mode === "create" && (
            <div className="space-y-4 p-1">
              <div>
                <Label className="text-[var(--color-midnight)]">Widget Type</Label>
                <Select value={widgetType} onValueChange={setWidgetType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stat_card">Stat Card</SelectItem>
                    <SelectItem value="info_card">Info Card</SelectItem>
                    <SelectItem value="quick_action">Quick Actions</SelectItem>
                    <SelectItem value="chart">Chart</SelectItem>
                    <SelectItem value="table">Table</SelectItem>
                    <SelectItem value="ai_insight">AI Insight</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-[var(--color-midnight)]">Describe your widget</Label>
                <Textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="e.g., Show total revenue this month with comparison to last month..."
                  rows={3}
                />
              </div>
              <Button 
                onClick={generateCustomWidget} 
                disabled={isGenerating}
                className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-dark)]"
              >
                {isGenerating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                Generate Widget
              </Button>
            </div>
          )}

          {mode === "insight" && (
            <div className="space-y-4 p-1">
              <p className="text-sm text-[var(--color-charcoal)]">
                Generate AI-powered insight widgets that provide intelligent analysis and recommendations.
              </p>
              <Button 
                onClick={generateInsightWidgets} 
                disabled={isGenerating}
                className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-dark)]"
              >
                {isGenerating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                Generate Insight Widgets
              </Button>
            </div>
          )}

          {/* Generated Widgets */}
          {generatedWidgets.length > 0 && (
            <div className="mt-6 space-y-3">
              <h3 className="font-medium text-[var(--color-midnight)]">Generated Widgets ({generatedWidgets.length})</h3>
              <div className="grid gap-3">
                {generatedWidgets.map((widget, i) => (
                  <Card 
                    key={i} 
                    className={`cursor-pointer transition-colors ${selectedWidgets.has(i) ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10" : ""}`}
                    onClick={() => toggleSelect(i)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`mt-1 h-5 w-5 rounded border-2 flex items-center justify-center ${selectedWidgets.has(i) ? "bg-[var(--color-primary)] border-[var(--color-primary)]" : "border-[var(--color-charcoal)]/30"}`}>
                          {selectedWidgets.has(i) && <CheckCircle2 className="h-3 w-3 text-white" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-[var(--color-midnight)]">{widget.name}</h4>
                            <Badge variant="secondary">{widget.widget_type}</Badge>
                            {widget.category && <Badge variant="outline">{widget.category}</Badge>}
                          </div>
                          <p className="text-sm text-[var(--color-charcoal)] mt-1">{widget.description}</p>
                          {widget.reasoning && (
                            <p className="text-xs text-[var(--color-accent)] mt-2">
                              <Lightbulb className="h-3 w-3 inline mr-1" />
                              {widget.reasoning}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

        {generatedWidgets.length > 0 && (
          <div className="flex justify-between items-center pt-4 border-t border-[var(--color-background-muted)]">
            <span className="text-sm text-[var(--color-charcoal)]">
              {selectedWidgets.size} of {generatedWidgets.length} selected
            </span>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button 
                onClick={handleCreate} 
                disabled={selectedWidgets.size === 0 || createMutation.isPending}
                className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white"
              >
                {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Add to Staging ({selectedWidgets.size})
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}