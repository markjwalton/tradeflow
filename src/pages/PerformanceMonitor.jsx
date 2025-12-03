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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Activity, AlertTriangle, CheckCircle2, XCircle, Loader2, 
  RefreshCw, Sparkles, ArrowRight, TrendingUp, TrendingDown, Minus,
  FileCode, Component, Zap, Clock, HardDrive, Globe, Building2,
  Settings, Flag, Lightbulb
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from "recharts";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const COLORS = ["#22c55e", "#f59e0b", "#ef4444", "#3b82f6", "#8b5cf6"];

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
  ok: "bg-green-100 text-green-700",
  warning: "bg-amber-100 text-amber-700",
  critical: "bg-red-100 text-red-700"
};

const severityColors = {
  low: "bg-blue-100 text-blue-700",
  medium: "bg-amber-100 text-amber-700",
  high: "bg-orange-100 text-orange-700",
  critical: "bg-red-100 text-red-700"
};

const trendIcons = {
  improving: <TrendingDown className="h-4 w-4 text-green-600" />,
  stable: <Minus className="h-4 w-4 text-gray-400" />,
  degrading: <TrendingUp className="h-4 w-4 text-red-600" />
};

const DEFAULT_THRESHOLDS = {
  page_size: { warning: 200, critical: 400, unit: "lines" },
  component_size: { warning: 100, critical: 200, unit: "lines" },
  function_size: { warning: 150, critical: 300, unit: "lines" },
  load_time: { warning: 2000, critical: 5000, unit: "ms" },
  api_response: { warning: 1000, critical: 3000, unit: "ms" },
  bundle_size: { warning: 500, critical: 1000, unit: "kb" }
};

export default function PerformanceMonitor() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  const [viewMode, setViewMode] = useState("global");
  const [selectedTenantId, setSelectedTenantId] = useState("");
  const [showThresholdEditor, setShowThresholdEditor] = useState(false);
  const [showIssueDetail, setShowIssueDetail] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState({ current: 0, total: 0, items: [] });
  const [isGeneratingRecommendations, setIsGeneratingRecommendations] = useState(false);

  const { data: metrics = [], isLoading: loadingMetrics } = useQuery({
    queryKey: ["performanceMetrics"],
    queryFn: () => base44.entities.PerformanceMetric.list("-measured_at", 500)
  });

  const { data: issues = [], isLoading: loadingIssues } = useQuery({
    queryKey: ["performanceIssues"],
    queryFn: () => base44.entities.PerformanceIssue.list("-created_date")
  });

  const { data: thresholds = [] } = useQuery({
    queryKey: ["performanceThresholds"],
    queryFn: () => base44.entities.PerformanceThreshold.list()
  });

  const { data: tenants = [] } = useQuery({
    queryKey: ["tenants"],
    queryFn: () => base44.entities.Tenant.list()
  });

  const { data: pageTemplates = [] } = useQuery({
    queryKey: ["pageTemplates"],
    queryFn: () => base44.entities.PageTemplate.list()
  });

  const { data: featureTemplates = [] } = useQuery({
    queryKey: ["featureTemplates"],
    queryFn: () => base44.entities.FeatureTemplate.list()
  });

  const createIssueMutation = useMutation({
    mutationFn: (data) => base44.entities.PerformanceIssue.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["performanceIssues"] })
  });

  const updateIssueMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.PerformanceIssue.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["performanceIssues"] });
      toast.success("Issue updated");
    }
  });

  const createRoadmapMutation = useMutation({
    mutationFn: async (issue) => {
      const roadmapItem = await base44.entities.RoadmapItem.create({
        title: `Performance: ${issue.resource_name}`,
        description: issue.description,
        category: "improvement",
        priority: issue.severity === "critical" ? "critical" : issue.severity === "high" ? "high" : "medium",
        status: "backlog",
        source: "ai_assistant",
        notes: issue.ai_recommendation,
        tags: ["performance", "refactoring"]
      });
      await base44.entities.PerformanceIssue.update(issue.id, {
        roadmap_item_id: roadmapItem.id,
        status: "in_progress"
      });
      return roadmapItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["performanceIssues"] });
      queryClient.invalidateQueries({ queryKey: ["roadmapItems"] });
      toast.success("Added to roadmap");
    }
  });

  const saveThresholdMutation = useMutation({
    mutationFn: async (data) => {
      const existing = thresholds.find(t => t.metric_type === data.metric_type);
      if (existing) {
        return base44.entities.PerformanceThreshold.update(existing.id, data);
      }
      return base44.entities.PerformanceThreshold.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["performanceThresholds"] });
      toast.success("Threshold saved");
    }
  });

  // Get threshold for a metric type
  const getThreshold = (metricType) => {
    const custom = thresholds.find(t => t.metric_type === metricType);
    return custom || DEFAULT_THRESHOLDS[metricType] || { warning: 100, critical: 200, unit: "lines" };
  };

  // Scan and analyze performance
  const runPerformanceScan = async () => {
    setIsScanning(true);
    try {
      const newMetrics = [];
      const newIssues = [];

      // Simulate scanning pages and components
      for (const page of pageTemplates) {
        const componentCount = page.components?.length || 0;
        const estimatedLines = 50 + (componentCount * 30);
        const threshold = getThreshold("page_size");
        
        const status = estimatedLines >= threshold.critical ? "critical" :
                       estimatedLines >= threshold.warning ? "warning" : "ok";

        newMetrics.push({
          metric_type: "page_size",
          resource_name: page.name,
          resource_path: `pages/${page.name}`,
          value: estimatedLines,
          unit: "lines",
          threshold: threshold.warning,
          status,
          is_global: true,
          measured_at: new Date().toISOString()
        });

        if (status !== "ok") {
          newIssues.push({
            resource_name: page.name,
            resource_path: `pages/${page.name}`,
            issue_type: "size_exceeded",
            severity: status === "critical" ? "high" : "medium",
            description: `Page "${page.name}" has ${estimatedLines} lines (threshold: ${threshold.warning})`,
            is_global: true,
            status: "open"
          });
        }
      }

      // Save metrics
      for (const metric of newMetrics) {
        await base44.entities.PerformanceMetric.create(metric);
      }

      // Save issues
      for (const issue of newIssues) {
        const existing = issues.find(i => 
          i.resource_name === issue.resource_name && 
          i.issue_type === issue.issue_type &&
          i.status === "open"
        );
        if (!existing) {
          await base44.entities.PerformanceIssue.create(issue);
        }
      }

      queryClient.invalidateQueries({ queryKey: ["performanceMetrics"] });
      queryClient.invalidateQueries({ queryKey: ["performanceIssues"] });
      toast.success(`Scan complete: ${newMetrics.length} metrics, ${newIssues.length} issues found`);
    } catch (error) {
      toast.error("Scan failed: " + error.message);
    } finally {
      setIsScanning(false);
    }
  };

  // Generate AI recommendations for an issue
  const generateAIRecommendation = async (issue) => {
    setIsGeneratingRecommendations(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this performance issue and provide specific recommendations:

Issue: ${issue.issue_type}
Resource: ${issue.resource_name}
Path: ${issue.resource_path}
Description: ${issue.description}
Severity: ${issue.severity}

Provide:
1. A clear explanation of the problem
2. 3-5 specific actionable steps to fix it
3. Estimated effort (low/medium/high)
4. Priority recommendation

Focus on code refactoring, component splitting, and performance optimization best practices.`,
        response_json_schema: {
          type: "object",
          properties: {
            explanation: { type: "string" },
            actions: { type: "array", items: { type: "string" } },
            effort: { type: "string" },
            priority: { type: "string" },
            summary: { type: "string" }
          }
        }
      });

      await base44.entities.PerformanceIssue.update(issue.id, {
        ai_recommendation: result.summary || result.explanation,
        suggested_actions: result.actions || []
      });

      queryClient.invalidateQueries({ queryKey: ["performanceIssues"] });
      toast.success("AI recommendation generated");
    } catch (error) {
      toast.error("Failed to generate recommendation");
    } finally {
      setIsGeneratingRecommendations(false);
    }
  };

  // Filter metrics/issues by view mode
  const filteredMetrics = metrics.filter(m => {
    if (viewMode === "global") return m.is_global !== false;
    if (selectedTenantId) return m.tenant_id === selectedTenantId;
    return !m.is_global;
  });

  const filteredIssues = issues.filter(i => {
    if (viewMode === "global") return i.is_global !== false;
    if (selectedTenantId) return i.tenant_id === selectedTenantId;
    return !i.is_global;
  });

  const openIssues = filteredIssues.filter(i => i.status === "open");
  const criticalIssues = openIssues.filter(i => i.severity === "critical" || i.severity === "high");

  // Stats
  const stats = useMemo(() => {
    const byType = {};
    filteredMetrics.forEach(m => {
      if (!byType[m.metric_type]) byType[m.metric_type] = { ok: 0, warning: 0, critical: 0, total: 0 };
      byType[m.metric_type][m.status || "ok"]++;
      byType[m.metric_type].total++;
    });

    const healthScore = filteredMetrics.length > 0 
      ? Math.round((filteredMetrics.filter(m => m.status === "ok").length / filteredMetrics.length) * 100)
      : 100;

    return { byType, healthScore };
  }, [filteredMetrics]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Activity className="h-6 w-6 text-blue-600" />
            Performance Monitor
          </h1>
          <p className="text-gray-500">Track page sizes, load times, and identify refactoring needs</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowThresholdEditor(true)}>
            <Settings className="h-4 w-4 mr-2" />
            Thresholds
          </Button>
          <Button onClick={runPerformanceScan} disabled={isScanning}>
            {isScanning ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Run Scan
          </Button>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="flex items-center gap-4 mb-6">
        <Tabs value={viewMode} onValueChange={setViewMode}>
          <TabsList>
            <TabsTrigger value="global" className="gap-2">
              <Globe className="h-4 w-4" />
              Global
            </TabsTrigger>
            <TabsTrigger value="tenant" className="gap-2">
              <Building2 className="h-4 w-4" />
              Tenant Sites
            </TabsTrigger>
          </TabsList>
        </Tabs>
        {viewMode === "tenant" && (
          <Select value={selectedTenantId} onValueChange={setSelectedTenantId}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All tenants" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={null}>All Tenants</SelectItem>
              {tenants.map(t => (
                <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="metrics">Metrics ({filteredMetrics.length})</TabsTrigger>
          <TabsTrigger value="issues">
            Issues ({openIssues.length})
            {criticalIssues.length > 0 && (
              <Badge className="ml-2 bg-red-500">{criticalIssues.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Health Score */}
          <div className="grid grid-cols-4 gap-4">
            <Card className={stats.healthScore >= 80 ? "border-green-200" : stats.healthScore >= 50 ? "border-amber-200" : "border-red-200"}>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-500">Health Score</div>
                    <div className={`text-3xl font-bold ${
                      stats.healthScore >= 80 ? "text-green-600" : 
                      stats.healthScore >= 50 ? "text-amber-600" : "text-red-600"
                    }`}>
                      {stats.healthScore}%
                    </div>
                  </div>
                  {stats.healthScore >= 80 ? (
                    <CheckCircle2 className="h-10 w-10 text-green-500" />
                  ) : stats.healthScore >= 50 ? (
                    <AlertTriangle className="h-10 w-10 text-amber-500" />
                  ) : (
                    <XCircle className="h-10 w-10 text-red-500" />
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="text-sm text-gray-500">Open Issues</div>
                <div className="text-3xl font-bold">{openIssues.length}</div>
                {criticalIssues.length > 0 && (
                  <p className="text-xs text-red-600">{criticalIssues.length} critical</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="text-sm text-gray-500">Resources Tracked</div>
                <div className="text-3xl font-bold">{filteredMetrics.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="text-sm text-gray-500">Last Scan</div>
                <div className="text-lg font-medium">
                  {metrics[0]?.measured_at ? format(new Date(metrics[0].measured_at), "MMM d, HH:mm") : "Never"}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Metrics by Type */}
          <Card>
            <CardHeader>
              <CardTitle>Metrics by Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(stats.byType).map(([type, counts]) => {
                  const Icon = metricTypeIcons[type] || Activity;
                  const okPercent = counts.total > 0 ? (counts.ok / counts.total) * 100 : 100;
                  const warnPercent = counts.total > 0 ? (counts.warning / counts.total) * 100 : 0;
                  const critPercent = counts.total > 0 ? (counts.critical / counts.total) * 100 : 0;
                  
                  return (
                    <div key={type} className="flex items-center gap-4">
                      <div className="flex items-center gap-2 w-40">
                        <Icon className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium capitalize">{type.replace("_", " ")}</span>
                      </div>
                      <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden flex">
                        <div className="h-full bg-green-500" style={{ width: `${okPercent}%` }} />
                        <div className="h-full bg-amber-500" style={{ width: `${warnPercent}%` }} />
                        <div className="h-full bg-red-500" style={{ width: `${critPercent}%` }} />
                      </div>
                      <div className="w-24 text-right text-sm text-gray-500">
                        {counts.ok}/{counts.total} OK
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Critical Issues */}
          {criticalIssues.length > 0 && (
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-700 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Critical Issues Requiring Attention
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {criticalIssues.slice(0, 5).map(issue => (
                    <div key={issue.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <div>
                        <p className="font-medium">{issue.resource_name}</p>
                        <p className="text-sm text-gray-600">{issue.description}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => generateAIRecommendation(issue)}
                          disabled={isGeneratingRecommendations}
                        >
                          <Sparkles className="h-3 w-3 mr-1" />
                          AI Fix
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => createRoadmapMutation.mutate(issue)}
                        >
                          <Flag className="h-3 w-3 mr-1" />
                          Add to Roadmap
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Metrics Tab */}
        <TabsContent value="metrics">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Resource</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Threshold</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Trend</TableHead>
                  <TableHead>Last Measured</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingMetrics ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : filteredMetrics.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No metrics yet. Run a scan to collect data.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMetrics.map(metric => {
                    const Icon = metricTypeIcons[metric.metric_type] || Activity;
                    const threshold = getThreshold(metric.metric_type);
                    return (
                      <TableRow key={metric.id}>
                        <TableCell>
                          <div className="font-medium">{metric.resource_name}</div>
                          <div className="text-xs text-gray-500">{metric.resource_path}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="gap-1">
                            <Icon className="h-3 w-3" />
                            {metric.metric_type.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono">
                          {metric.value} {metric.unit}
                        </TableCell>
                        <TableCell className="text-gray-500">
                          {threshold.warning} / {threshold.critical}
                        </TableCell>
                        <TableCell>
                          <Badge className={statusColors[metric.status || "ok"]}>
                            {metric.status || "ok"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {trendIcons[metric.trend || "stable"]}
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {metric.measured_at ? format(new Date(metric.measured_at), "MMM d, HH:mm") : "-"}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Issues Tab */}
        <TabsContent value="issues" className="space-y-4">
          {loadingIssues ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : filteredIssues.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-green-500" />
                <p>No performance issues found!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredIssues.map(issue => (
                <Card key={issue.id} className={
                  issue.status === "resolved" ? "opacity-60" :
                  issue.severity === "critical" ? "border-red-200" :
                  issue.severity === "high" ? "border-orange-200" : ""
                }>
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium">{issue.resource_name}</h3>
                          <Badge className={severityColors[issue.severity]}>{issue.severity}</Badge>
                          <Badge variant="outline">{issue.issue_type.replace("_", " ")}</Badge>
                          <Badge variant="outline">{issue.status}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{issue.description}</p>
                        
                        {issue.ai_recommendation && (
                          <div className="bg-purple-50 p-3 rounded-lg mt-2">
                            <div className="flex items-center gap-2 text-purple-700 text-sm font-medium mb-1">
                              <Sparkles className="h-4 w-4" />
                              AI Recommendation
                            </div>
                            <p className="text-sm text-purple-900">{issue.ai_recommendation}</p>
                            {issue.suggested_actions?.length > 0 && (
                              <ul className="mt-2 space-y-1">
                                {issue.suggested_actions.map((action, i) => (
                                  <li key={i} className="text-sm text-purple-800 flex items-start gap-2">
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
                              <Badge className="bg-blue-100 text-blue-700 cursor-pointer">
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
                            onClick={() => generateAIRecommendation(issue)}
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
                            onClick={() => createRoadmapMutation.mutate(issue)}
                          >
                            <Flag className="h-3 w-3 mr-1" />
                            Add to Roadmap
                          </Button>
                        )}
                        {issue.status === "open" && (
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => updateIssueMutation.mutate({ id: issue.id, data: { status: "resolved", resolved_date: new Date().toISOString() } })}
                          >
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Resolve
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Size Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Page Size Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={filteredMetrics.filter(m => m.metric_type === "page_size").slice(0, 10)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="resource_name" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={80} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#3b82f6" name="Lines" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Status Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Status Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: "OK", value: filteredMetrics.filter(m => m.status === "ok").length, fill: "#22c55e" },
                          { name: "Warning", value: filteredMetrics.filter(m => m.status === "warning").length, fill: "#f59e0b" },
                          { name: "Critical", value: filteredMetrics.filter(m => m.status === "critical").length, fill: "#ef4444" }
                        ].filter(d => d.value > 0)}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ name, value }) => `${name}: ${value}`}
                      />
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tenant Comparison (when in tenant view) */}
          {viewMode === "tenant" && !selectedTenantId && (
            <Card>
              <CardHeader>
                <CardTitle>Tenant Health Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {tenants.map(tenant => {
                    const tenantMetrics = metrics.filter(m => m.tenant_id === tenant.id);
                    const okCount = tenantMetrics.filter(m => m.status === "ok").length;
                    const healthPercent = tenantMetrics.length > 0 ? Math.round((okCount / tenantMetrics.length) * 100) : 100;
                    
                    return (
                      <div key={tenant.id} className="flex items-center gap-4">
                        <div className="w-40 font-medium truncate">{tenant.name}</div>
                        <div className="flex-1">
                          <Progress value={healthPercent} className="h-3" />
                        </div>
                        <div className={`w-16 text-right font-medium ${
                          healthPercent >= 80 ? "text-green-600" : 
                          healthPercent >= 50 ? "text-amber-600" : "text-red-600"
                        }`}>
                          {healthPercent}%
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Threshold Editor Dialog */}
      <Dialog open={showThresholdEditor} onOpenChange={setShowThresholdEditor}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Performance Thresholds</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {Object.entries(DEFAULT_THRESHOLDS).map(([type, defaults]) => {
              const current = getThreshold(type);
              const Icon = metricTypeIcons[type] || Activity;
              return (
                <div key={type} className="flex items-center gap-4 p-3 border rounded-lg">
                  <div className="flex items-center gap-2 w-40">
                    <Icon className="h-4 w-4" />
                    <span className="text-sm font-medium capitalize">{type.replace("_", " ")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-xs text-amber-600">Warning:</Label>
                    <Input 
                      type="number" 
                      className="w-20" 
                      defaultValue={current.warning}
                      id={`warning-${type}`}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-xs text-red-600">Critical:</Label>
                    <Input 
                      type="number" 
                      className="w-20" 
                      defaultValue={current.critical}
                      id={`critical-${type}`}
                    />
                  </div>
                  <Badge variant="outline">{current.unit}</Badge>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      const warning = parseInt(document.getElementById(`warning-${type}`).value);
                      const critical = parseInt(document.getElementById(`critical-${type}`).value);
                      saveThresholdMutation.mutate({
                        metric_type: type,
                        warning_threshold: warning,
                        critical_threshold: critical,
                        unit: current.unit
                      });
                    }}
                  >
                    Save
                  </Button>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}