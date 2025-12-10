import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp, AlertCircle, MessageSquare, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AIInsightsPanel({ sessions, tasks }) {
  const [generating, setGenerating] = useState(false);
  const [insights, setInsights] = useState(null);

  const generateInsights = async () => {
    setGenerating(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze these onboarding sessions and tasks to provide actionable insights:

Sessions: ${JSON.stringify(sessions.map(s => ({
  status: s.status,
  created: s.created_date,
  summary: s.high_level_summary
})))}

Tasks: ${JSON.stringify(tasks.map(t => ({
  title: t.task_title,
  status: t.status,
  priority: t.priority,
  dueDate: t.due_date
})))}

Provide insights on:
1. Process efficiency and bottlenecks
2. Risk areas and potential issues
3. User interaction patterns
4. Document completeness
5. Timeline predictions
6. Recommendations for improvement

Return as structured JSON.`,
        response_json_schema: {
          type: "object",
          properties: {
            efficiency_score: { type: "number" },
            bottlenecks: { type: "array", items: { type: "string" } },
            risks: { type: "array", items: { type: "object" } },
            patterns: { type: "array", items: { type: "string" } },
            recommendations: { type: "array", items: { type: "string" } },
            timeline_prediction: { type: "string" }
          }
        }
      });
      setInsights(result);
      toast.success("AI insights generated");
    } catch (error) {
      toast.error("Failed to generate insights");
      console.error(error);
    }
    setGenerating(false);
  };

  if (!insights) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-12">
          <Sparkles className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground mb-4">
            Generate AI-powered insights on your onboarding processes
          </p>
          <Button onClick={generateInsights} disabled={generating}>
            {generating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Insights
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Efficiency Score */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Process Efficiency</CardTitle>
          <Button variant="outline" size="sm" onClick={generateInsights} disabled={generating}>
            <Sparkles className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="text-4xl font-bold">{insights.efficiency_score}%</div>
            <div className="flex-1">
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all" 
                  style={{ width: `${insights.efficiency_score}%` }}
                />
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {insights.timeline_prediction}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bottlenecks */}
      {insights.bottlenecks?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-warning" />
              Identified Bottlenecks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {insights.bottlenecks.map((bottleneck, idx) => (
                <div key={idx} className="p-3 border rounded-lg bg-warning/5">
                  <p className="text-sm">{bottleneck}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Risks */}
      {insights.risks?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Risk Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {insights.risks.map((risk, idx) => (
                <div key={idx} className="p-3 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-medium">{risk.title || risk.name || "Risk Item"}</p>
                    <Badge variant="destructive">{risk.severity || "medium"}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{risk.description || risk.details}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Patterns */}
      {insights.patterns?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Interaction Patterns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {insights.patterns.map((pattern, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <MessageSquare className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <span>{pattern}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {insights.recommendations?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {insights.recommendations.map((rec, idx) => (
                <div key={idx} className="p-3 border rounded-lg bg-primary/5">
                  <p className="text-sm">{rec}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}