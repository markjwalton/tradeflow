import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Activity, AlertTriangle, CheckCircle2, XCircle, Loader2, Circle,
  RefreshCw, Sparkles, ArrowRight, TrendingUp, TrendingDown, Minus,
  FileCode, Component, Zap, Clock, HardDrive, Globe, Building2,
  Settings, Flag, Lightbulb, ChevronDown, ChevronRight
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie } from "recharts";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import PerformanceAuditCard from "@/components/monitoring/PerformanceAuditCard";
import WebVitalsCard from "@/components/monitoring/WebVitalsCard";

const metricTypeIcons = {
  page_size: FileCode,
  component_size: Component,
  function_size: Zap,
  load_time: Clock,
  api_response: Activity,
  memory_usage: HardDrive,
  bundle_size: HardDrive
};

const statusColors = {
  ok: "bg-success-50 text-success",
  warning: "bg-warning/10 text-warning",
  critical: "bg-destructive-50 text-destructive"
};

const severityColors = {
  low: "bg-info-50 text-info",
  medium: "bg-warning/10 text-warning",
  high: "bg-accent-100 text-accent",
  critical: "bg-destructive-50 text-destructive"
};

const trendIcons = {
  improving: <TrendingDown className="h-4 w-4 text-success" />,
  stable: <Minus className="h-4 w-4 text-muted-foreground" />,
  degrading: <TrendingUp className="h-4 w-4 text-destructive" />
};

const DEFAULT_THRESHOLDS = {
  page_size: { warning: 200, critical: 400, unit: "lines" },
  component_size: { warning: 100, critical: 200, unit: "lines" },
  function_size: { warning: 150, critical: 300, unit: "lines" },
  load_time: { warning: 2000, critical: 5000, unit: "ms" },
  api_response: { warning: 1000, critical: 3000, unit: "ms" },
  bundle_size: { warning: 500, critical: 1000, unit: "kb" }
};

const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };

function IssuesGroupedView({ issues, generateAIRecommendation, isGeneratingRecommendations, createRoadmapMutation, updateIssueMutation }) {
  const [expandedSeverities, setExpandedSeverities] = useState(new Set(["critical", "high"]));

  const groupedIssues = useMemo(() => {
    const groups = {};
    issues.forEach(issue => {
      const severity = issue.severity || "medium";
      if (!groups[severity]) {
        groups[severity] = { issues: [], open: 0, resolved: 0, withAI: 0, inRoadmap: 0 };
      }
      groups[severity].issues.push(issue);
      if (issue.status === "open") groups[severity].open++;
      if (issue.status === "resolved") groups[severity].resolved++;
      if (issue.ai_recommendation) groups[severity].withAI++;
      if (issue.roadmap_item_id) groups[severity].inRoadmap++;
    });
    return groups;
  }, [issues]);

  const toggleSeverity = (severity) => {
    setExpandedSeverities(prev => {
      const next = new Set(prev);
      if (next.has(severity)) next.delete(severity);
      else next.add(severity);
      return next;
    });
  };

  const sortedSeverities = Object.keys(groupedIssues).sort((a, b) => 
    (severityOrder[a] ?? 99) - (severityOrder[b] ?? 99)
  );

  const severityIcons = {
    critical: <XCircle className="h-5 w-5 text-destructive" />,
    high: <AlertTriangle className="h-5 w-5 text-secondary" />,
    medium: <AlertTriangle className="h-5 w-5 text-warning" />,
    low: <Circle className="h-5 w-5 text-info" />
  };

  return (
    <div className="space-y-2">
      {sortedSeverities.map(severity => {
        const group = groupedIssues[severity];
        const isExpanded = expandedSeverities.has(severity);
        
        return (
          <Card key={severity} className={
            severity === "critical" ? "border-destructive/20" :
            severity === "high" ? "border-accent/20" : ""
          }>
            <button
              onClick={() => toggleSeverity(severity)}
              className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                {isExpanded ? <ChevronDown className="h-5 w-5 text-muted-foreground" /> : <ChevronRight className="h-5 w-5 text-muted-foreground" />}
                <div className="flex items-center gap-2">
                  {severityIcons[severity]}
                  <span className="font-medium capitalize">{severity} Severity</span>
                </div>
                <Badge variant="outline">{group.issues.length} issues</Badge>
              </div>
              
              <div className="flex items-center gap-3">
                {group.open > 0 && <Badge className="bg-warning/10 text-warning">{group.open} Open</Badge>}
                {group.resolved > 0 && <Badge className="bg-success-50 text-success">{group.resolved} Resolved</Badge>}
                {group.withAI > 0 && (
                  <Badge className="bg-accent-100 text-accent">
                    <Sparkles className="h-3 w-3 mr-1" />
                    {group.withAI} AI
                  </Badge>
                )}
                {group.inRoadmap > 0 && (
                  <Badge className="bg-info-50 text-info">
                    <Flag className="h-3 w-3 mr-1" />
                    {group.inRoadmap} Roadmap
                  </Badge>
                )}
              </div>
            </button>
            
            {isExpanded && (
              <div className="border-t divide-y">
                {group.issues.map(issue => (
                  <div key={issue.id} className={`p-4 ${issue.status === "resolved" ? "opacity-60 bg-muted" : ""}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium">{issue.resource_name}</h3>
                          <Badge variant="outline">{issue.issue_type.replace(/_/g, " ")}</Badge>
                          <Badge variant="outline">{issue.status}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{issue.description}</p>
                        
                        {issue.ai_recommendation && (
                          <div className="bg-accent-100 p-3 rounded-lg mt-2">
                            <div className="flex items-center gap-2 text-accent text-sm font-medium mb-1">
                              <Sparkles className="h-4 w-4" />
                              AI Recommendation
                            </div>
                            <p className="text-sm text-foreground">{issue.ai_recommendation}</p>
                            {issue.suggested_actions?.length > 0 && (
                              <ul className="mt-2 space-y-1">
                                {issue.suggested_actions.map((action, i) => (
                                  <li key={i} className="text-sm text-accent flex items-start gap-2">
                                    <ArrowRight className="h-3 w-3 mt-1 flex-shrink-0" />
                                    {action}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        )}

                        {issue.roadmap_item_id && (
                          <div className="mt-2">
                            <Link to={createPageUrl("RoadmapManager") + `?item=${issue.roadmap_item_id}`}>
                              <Badge className="bg-info-50 text-info cursor-pointer">
                                <Lightbulb className="h-3 w-3 mr-1" />
                                View in Roadmap
                              </Badge>
                            </Link>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2 ml-4">
                        {!issue.ai_recommendation && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={(e) => { e.stopPropagation(); generateAIRecommendation(issue); }}
                            disabled={isGeneratingRecommendations}
                          >
                            {isGeneratingRecommendations ? (
                              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                            ) : (
                              <Sparkles className="h-3 w-3 mr-1" />
                            )}
                            Get AI Fix
                          </Button>
                        )}
                        {!issue.roadmap_item_id && issue.status === "open" && (
                          <Button 
                            size="sm"
                            onClick={(e) => { e.stopPropagation(); createRoadmapMutation.mutate(issue); }}
                          >
                            <Flag className="h-3 w-3 mr-1" />
                            Add to Roadmap
                          </Button>
                        )}
                        {issue.status === "open" && (
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={(e) => { e.stopPropagation(); updateIssueMutation.mutate({ id: issue.id, data: { status: "resolved", resolved_date: new Date().toISOString() } }); }}
                          >
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Resolve
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}

export default function SecurityDashboardTab() {
  return (
    <Tabs defaultValue="csp" className="space-y-6">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="csp" className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          CSP Headers
        </TabsTrigger>
        <TabsTrigger value="audit" className="flex items-center gap-2">
          <FileCode2 className="h-4 w-4" />
          NPM Audit
        </TabsTrigger>
        <TabsTrigger value="sentry" className="flex items-center gap-2">
          <Lock className="h-4 w-4" />
          Error Tracking
        </TabsTrigger>
      </TabsList>

      <TabsContent value="csp">
        <CSPConfig />
      </TabsContent>

      <TabsContent value="audit">
        <NPMAudit />
      </TabsContent>

      <TabsContent value="sentry" className="space-y-4">
        <div className="bg-card border rounded-lg p-6">
          <h3 className="text-lg font-medium mb-4">Sentry Error Tracking</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Setup Instructions</h4>
              <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                <li>Create a free account at <a href="https://sentry.io" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">sentry.io</a></li>
                <li>Create a new project for your application</li>
                <li>Copy your DSN (Data Source Name)</li>
                <li>Add to your environment variables: <code className="bg-muted px-1 rounded">VITE_SENTRY_DSN=your-dsn-here</code></li>
                <li>Optionally set: <code className="bg-muted px-1 rounded">VITE_APP_VERSION=1.0.0</code></li>
              </ol>
            </div>
            <div>
              <h4 className="font-medium mb-2">Features Enabled</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Automatic error capture with stack traces</li>
                <li>Performance monitoring (10% sampling in production)</li>
                <li>Session replay for debugging (10% of sessions)</li>
                <li>User context tracking</li>
                <li>Custom breadcrumbs for debugging</li>
                <li>Filtered errors (network issues, browser extensions, etc.)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Status</h4>
              <p className="text-sm text-muted-foreground">
                {import.meta.env.VITE_SENTRY_DSN ? (
                  <span className="text-success">✓ Sentry is configured and active</span>
                ) : (
                  <span className="text-warning">⚠ Sentry DSN not configured. Add VITE_SENTRY_DSN to enable error tracking.</span>
                )}
              </p>
            </div>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}