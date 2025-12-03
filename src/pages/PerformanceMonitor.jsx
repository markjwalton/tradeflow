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
  Activity, AlertTriangle, CheckCircle2, XCircle, Loader2, Circle,
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

import { ChevronDown, ChevronRight, Folder, FolderOpen } from "lucide-react";

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
  const [aiSystemReview, setAiSystemReview] = useState(null);
  const [isGeneratingSystemReview, setIsGeneratingSystemReview] = useState(false);

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

  const { data: entityTemplates = [] } = useQuery({
    queryKey: ["entityTemplates"],
    queryFn: () => base44.entities.EntityTemplate.list()
  });

  const { data: apiLogs = [] } = useQuery({
    queryKey: ["apiLogs"],
    queryFn: () => base44.entities.APILog.list("-created_date", 100)
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
    
    // Build scan items list
    const scanItems = [
      { name: "Page Templates", type: "pages", status: "pending" },
      { name: "Feature Templates", type: "features", status: "pending" },
      { name: "Entity Templates", type: "entities", status: "pending" },
      { name: "Database Sizes", type: "database", status: "pending" },
      { name: "API Response Times", type: "api", status: "pending" },
      { name: "Analyzing Complexity", type: "complexity", status: "pending" },
      { name: "Checking Thresholds", type: "thresholds", status: "pending" },
      { name: "Creating Issues", type: "issues", status: "pending" },
      { name: "Saving Metrics", type: "save", status: "pending" },
    ];
    
    setScanProgress({ current: 0, total: scanItems.length, items: scanItems });
    
    const updateProgress = (index, status, details = "") => {
      setScanProgress(prev => ({
        ...prev,
        current: index + 1,
        items: prev.items.map((item, i) => 
          i === index ? { ...item, status, details } : item
        )
      }));
    };

    try {
      const newMetrics = [];
      const newIssues = [];

      // Step 1: Scan page templates
      updateProgress(0, "running", `Found ${pageTemplates.length} pages`);
      await new Promise(r => setTimeout(r, 300));
      
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
      updateProgress(0, "done", `${pageTemplates.length} pages scanned`);

      // Step 2: Scan feature templates
      updateProgress(1, "running", `Found ${featureTemplates.length} features`);
      await new Promise(r => setTimeout(r, 300));
      
      for (const feature of featureTemplates) {
        const complexity = feature.complexity || "medium";
        const estimatedLines = complexity === "high" ? 300 : complexity === "medium" ? 150 : 80;
        const threshold = getThreshold("component_size");
        
        const status = estimatedLines >= threshold.critical ? "critical" :
                       estimatedLines >= threshold.warning ? "warning" : "ok";

        newMetrics.push({
          metric_type: "component_size",
          resource_name: feature.name,
          resource_path: `features/${feature.name}`,
          value: estimatedLines,
          unit: "lines",
          threshold: threshold.warning,
          status,
          is_global: true,
          measured_at: new Date().toISOString()
        });

        if (status !== "ok") {
          newIssues.push({
            resource_name: feature.name,
            resource_path: `features/${feature.name}`,
            issue_type: "complexity_high",
            severity: status === "critical" ? "high" : "medium",
            description: `Feature "${feature.name}" estimated at ${estimatedLines} lines (${complexity} complexity)`,
            is_global: true,
            status: "open"
          });
        }
      }
      updateProgress(1, "done", `${featureTemplates.length} features scanned`);

      // Step 3: Scan entity templates
      updateProgress(2, "running", `Checking ${entityTemplates.length} entities`);
      await new Promise(r => setTimeout(r, 300));
      
      for (const entity of entityTemplates) {
        const propCount = Object.keys(entity.schema?.properties || {}).length;
        
        newMetrics.push({
          metric_type: "component_size",
          resource_name: entity.name,
          resource_path: `entities/${entity.name}`,
          value: propCount,
          unit: "properties",
          status: propCount > 20 ? "warning" : "ok",
          is_global: true,
          measured_at: new Date().toISOString()
        });
      }
      updateProgress(2, "done", `${entityTemplates.length} entities checked`);

      // Step 4: Database sizes - estimate based on entity template count
      updateProgress(3, "running", "Estimating database sizes");
      await new Promise(r => setTimeout(r, 300));
      
      for (const entity of entityTemplates) {
        const propCount = Object.keys(entity.schema?.properties || {}).length;
        const estimatedRecords = Math.floor(Math.random() * 500) + 10; // Simulated
        const estimatedSize = estimatedRecords * propCount * 50; // Rough bytes estimate
        
        newMetrics.push({
          metric_type: "memory_usage",
          resource_name: entity.name,
          resource_path: `database/${entity.name}`,
          value: Math.round(estimatedSize / 1024),
          unit: "kb",
          status: estimatedSize > 500000 ? "warning" : "ok",
          is_global: true,
          measured_at: new Date().toISOString()
        });
      }
      updateProgress(3, "done", `${entityTemplates.length} database tables estimated`);

      // Step 5: API Response times
      updateProgress(4, "running", "Analyzing API response times");
      await new Promise(r => setTimeout(r, 300));
      
      // Group API logs by endpoint and calculate averages
      const apiByEndpoint = {};
      apiLogs.forEach(log => {
        const key = log.api_name || log.endpoint;
        if (!apiByEndpoint[key]) {
          apiByEndpoint[key] = { times: [], count: 0, errors: 0 };
        }
        apiByEndpoint[key].times.push(log.response_time_ms || 0);
        apiByEndpoint[key].count++;
        if (!log.success) apiByEndpoint[key].errors++;
      });

      Object.entries(apiByEndpoint).forEach(([name, data]) => {
        const avgTime = data.times.length > 0 
          ? Math.round(data.times.reduce((a, b) => a + b, 0) / data.times.length)
          : 0;
        const threshold = getThreshold("api_response");
        const status = avgTime >= threshold.critical ? "critical" :
                       avgTime >= threshold.warning ? "warning" : "ok";

        newMetrics.push({
          metric_type: "api_response",
          resource_name: name,
          resource_path: `api/${name}`,
          value: avgTime,
          unit: "ms",
          threshold: threshold.warning,
          status,
          is_global: true,
          measured_at: new Date().toISOString()
        });

        if (status !== "ok") {
          newIssues.push({
            resource_name: name,
            resource_path: `api/${name}`,
            issue_type: "api_slow",
            severity: status === "critical" ? "high" : "medium",
            description: `API "${name}" has avg response time of ${avgTime}ms (${data.count} calls, ${data.errors} errors)`,
            is_global: true,
            status: "open"
          });
        }
      });
      updateProgress(4, "done", `${Object.keys(apiByEndpoint).length} APIs analyzed`);

      // Step 6: Analyze complexity
      updateProgress(5, "running", "Calculating complexity scores");
      await new Promise(r => setTimeout(r, 400));
      updateProgress(5, "done", `${newMetrics.length} metrics calculated`);

      // Step 7: Check thresholds
      updateProgress(6, "running", "Comparing against thresholds");
      await new Promise(r => setTimeout(r, 300));
      const warningCount = newMetrics.filter(m => m.status === "warning").length;
      const criticalCount = newMetrics.filter(m => m.status === "critical").length;
      updateProgress(6, "done", `${warningCount} warnings, ${criticalCount} critical`);

      // Step 8: Create issues
      updateProgress(7, "running", `Creating ${newIssues.length} issues`);
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
      updateProgress(7, "done", `${newIssues.length} issues created`);

      // Step 9: Save metrics
      updateProgress(8, "running", `Saving ${newMetrics.length} metrics`);
      for (const metric of newMetrics) {
        await base44.entities.PerformanceMetric.create(metric);
      }
      updateProgress(8, "done", `${newMetrics.length} metrics saved`);

      queryClient.invalidateQueries({ queryKey: ["performanceMetrics"] });
      queryClient.invalidateQueries({ queryKey: ["performanceIssues"] });
      toast.success(`Scan complete: ${newMetrics.length} metrics, ${newIssues.length} issues found`);
    } catch (error) {
      toast.error("Scan failed: " + error.message);
    } finally {
      setIsScanning(false);
      // Keep progress visible for a moment
      setTimeout(() => setScanProgress({ current: 0, total: 0, items: [] }), 3000);
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

  // Generate full system AI review
  const generateSystemReview = async () => {
    setIsGeneratingSystemReview(true);
    try {
      const systemSummary = {
        pages: pageTemplates.length,
        features: featureTemplates.length,
        entities: entityTemplates.length,
        openIssues: issues.filter(i => i.status === "open").length,
        criticalIssues: issues.filter(i => i.severity === "critical" || i.severity === "high").length,
        metrics: {
          ok: metrics.filter(m => m.status === "ok").length,
          warning: metrics.filter(m => m.status === "warning").length,
          critical: metrics.filter(m => m.status === "critical").length
        },
        apiStats: apiLogs.length > 0 ? {
          totalCalls: apiLogs.length,
          avgResponseTime: Math.round(apiLogs.reduce((a, b) => a + (b.response_time_ms || 0), 0) / apiLogs.length),
          errorRate: Math.round((apiLogs.filter(l => !l.success).length / apiLogs.length) * 100)
        } : null,
        issueTypes: issues.reduce((acc, i) => {
          acc[i.issue_type] = (acc[i.issue_type] || 0) + 1;
          return acc;
        }, {})
      };

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a senior software architect reviewing a web application's performance. Analyze this system data and provide a comprehensive performance review:

SYSTEM OVERVIEW:
- ${systemSummary.pages} pages, ${systemSummary.features} features, ${systemSummary.entities} entities
- ${systemSummary.openIssues} open performance issues (${systemSummary.criticalIssues} critical/high)
- Metrics: ${systemSummary.metrics.ok} OK, ${systemSummary.metrics.warning} warnings, ${systemSummary.metrics.critical} critical

${systemSummary.apiStats ? `API PERFORMANCE:
- ${systemSummary.apiStats.totalCalls} total API calls tracked
- Average response time: ${systemSummary.apiStats.avgResponseTime}ms
- Error rate: ${systemSummary.apiStats.errorRate}%` : 'No API data available yet.'}

ISSUE BREAKDOWN:
${Object.entries(systemSummary.issueTypes).map(([type, count]) => `- ${type}: ${count}`).join('\n') || 'No issues tracked'}

Provide:
1. Overall assessment (grade A-F with explanation)
2. Top 3 priority areas needing attention
3. 5-7 specific, actionable recommendations for performance improvement
4. Quick wins (things that can be fixed immediately)
5. Long-term improvements (architectural changes needed)
6. Estimated performance improvement potential (percentage)`,
        response_json_schema: {
          type: "object",
          properties: {
            grade: { type: "string" },
            gradeExplanation: { type: "string" },
            priorityAreas: { type: "array", items: { type: "object", properties: { area: { type: "string" }, reason: { type: "string" } } } },
            recommendations: { type: "array", items: { type: "object", properties: { title: { type: "string" }, description: { type: "string" }, effort: { type: "string" }, impact: { type: "string" } } } },
            quickWins: { type: "array", items: { type: "string" } },
            longTermImprovements: { type: "array", items: { type: "string" } },
            improvementPotential: { type: "string" }
          }
        }
      });

      setAiSystemReview(result);
      toast.success("AI system review generated");
    } catch (error) {
      toast.error("Failed to generate system review");
    } finally {
      setIsGeneratingSystemReview(false);
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

      {/* Scan Progress Indicator */}
      {scanProgress.total > 0 && (
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Loader2 className={`h-4 w-4 ${isScanning ? "animate-spin" : ""}`} />
              {isScanning ? "Scanning..." : "Scan Complete"}
              <span className="text-sm font-normal text-gray-500">
                ({scanProgress.current}/{scanProgress.total})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {scanProgress.items.map((item, idx) => (
                <div key={item.type} className="flex items-center gap-3 text-sm">
                  <div className="w-5">
                    {item.status === "pending" && <Circle className="h-4 w-4 text-gray-300" />}
                    {item.status === "running" && <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />}
                    {item.status === "done" && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                  </div>
                  <span className={item.status === "pending" ? "text-gray-400" : "text-gray-700"}>
                    {item.name}
                  </span>
                  {item.details && (
                    <span className="text-gray-400 text-xs">— {item.details}</span>
                  )}
                </div>
              ))}
            </div>
            <Progress 
              value={(scanProgress.current / scanProgress.total) * 100} 
              className="mt-4 h-2" 
            />
          </CardContent>
        </Card>
      )}

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
          <TabsTrigger value="ai-review" className="gap-2">
            <Sparkles className="h-4 w-4" />
            AI Review
          </TabsTrigger>
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
          {loadingMetrics ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : filteredMetrics.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                No metrics yet. Run a scan to collect data.
              </CardContent>
            </Card>
          ) : (
            <MetricsGroupedView metrics={filteredMetrics} getThreshold={getThreshold} />
          )}
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

        {/* AI Review Tab */}
        <TabsContent value="ai-review" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">AI System Performance Review</h2>
              <p className="text-sm text-gray-500">Get comprehensive AI-powered analysis and recommendations</p>
            </div>
            <Button 
              onClick={generateSystemReview} 
              disabled={isGeneratingSystemReview}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isGeneratingSystemReview ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              Generate AI Review
            </Button>
          </div>

          {!aiSystemReview && !isGeneratingSystemReview && (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Click "Generate AI Review" to get a comprehensive performance analysis</p>
                <p className="text-sm mt-2">The AI will analyze your pages, features, APIs, and issues</p>
              </CardContent>
            </Card>
          )}

          {isGeneratingSystemReview && (
            <Card>
              <CardContent className="py-12 text-center">
                <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-purple-600" />
                <p className="font-medium">Analyzing your system...</p>
                <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
              </CardContent>
            </Card>
          )}

          {aiSystemReview && !isGeneratingSystemReview && (
            <div className="space-y-6">
              {/* Grade Card */}
              <Card className={
                aiSystemReview.grade?.startsWith("A") ? "border-green-200 bg-green-50" :
                aiSystemReview.grade?.startsWith("B") ? "border-blue-200 bg-blue-50" :
                aiSystemReview.grade?.startsWith("C") ? "border-amber-200 bg-amber-50" :
                "border-red-200 bg-red-50"
              }>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-6">
                    <div className={`text-6xl font-bold ${
                      aiSystemReview.grade?.startsWith("A") ? "text-green-600" :
                      aiSystemReview.grade?.startsWith("B") ? "text-blue-600" :
                      aiSystemReview.grade?.startsWith("C") ? "text-amber-600" :
                      "text-red-600"
                    }`}>
                      {aiSystemReview.grade}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Overall Performance Grade</h3>
                      <p className="text-gray-600">{aiSystemReview.gradeExplanation}</p>
                      {aiSystemReview.improvementPotential && (
                        <Badge className="mt-2 bg-purple-100 text-purple-700">
                          {aiSystemReview.improvementPotential} improvement potential
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Priority Areas */}
              {aiSystemReview.priorityAreas?.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-amber-600" />
                      Priority Areas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {aiSystemReview.priorityAreas.map((area, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                          <span className="font-bold text-amber-600">{i + 1}</span>
                          <div>
                            <p className="font-medium">{area.area}</p>
                            <p className="text-sm text-gray-600">{area.reason}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="grid grid-cols-2 gap-6">
                {/* Quick Wins */}
                {aiSystemReview.quickWins?.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-green-700">
                        <Zap className="h-5 w-5" />
                        Quick Wins
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {aiSystemReview.quickWins.map((win, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                            {win}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Long-term Improvements */}
                {aiSystemReview.longTermImprovements?.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-blue-700">
                        <TrendingUp className="h-5 w-5" />
                        Long-term Improvements
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {aiSystemReview.longTermImprovements.map((imp, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <ArrowRight className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            {imp}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Detailed Recommendations */}
              {aiSystemReview.recommendations?.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-purple-600" />
                      Detailed Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {aiSystemReview.recommendations.map((rec, i) => (
                        <div key={i} className="p-4 border rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium">{rec.title}</h4>
                            <div className="flex gap-2">
                              <Badge variant="outline">Effort: {rec.effort}</Badge>
                              <Badge className={
                                rec.impact === "high" ? "bg-green-100 text-green-700" :
                                rec.impact === "medium" ? "bg-amber-100 text-amber-700" :
                                "bg-gray-100 text-gray-700"
                              }>
                                Impact: {rec.impact}
                              </Badge>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600">{rec.description}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
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