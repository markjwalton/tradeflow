import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
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
  Shield, ShieldAlert, ShieldCheck, ShieldX, Lock, Unlock, Key,
  AlertTriangle, CheckCircle2, XCircle, Loader2, Circle,
  RefreshCw, Sparkles, Eye, EyeOff, Globe, Building2, Users,
  Activity, Clock, MapPin, Monitor, Smartphone, LogIn, LogOut,
  AlertOctagon, Database, Settings, FileText, ChevronDown, ChevronRight,
  Plus, Edit, Trash2, Flag, HardDrive, Download, Upload
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from "recharts";
import AuditLogCard from "@/components/monitoring/AuditLogCard.js";

const COLORS = ["#22c55e", "#f59e0b", "#ef4444", "#3b82f6", "#8b5cf6"];

const severityColors = {
  info: "bg-gray-100 text-gray-700",
  low: "bg-blue-100 text-blue-700",
  medium: "bg-amber-100 text-amber-700",
  high: "bg-orange-100 text-orange-700",
  critical: "bg-red-100 text-red-700"
};

const eventTypeIcons = {
  login_success: <LogIn className="h-4 w-4 text-green-600" />,
  login_failed: <ShieldX className="h-4 w-4 text-red-600" />,
  logout: <LogOut className="h-4 w-4 text-gray-600" />,
  password_change: <Key className="h-4 w-4 text-blue-600" />,
  permission_denied: <Lock className="h-4 w-4 text-amber-600" />,
  suspicious_activity: <AlertOctagon className="h-4 w-4 text-orange-600" />,
  brute_force: <ShieldAlert className="h-4 w-4 text-red-600" />,
  sql_injection: <AlertTriangle className="h-4 w-4 text-red-600" />,
  xss_attempt: <AlertTriangle className="h-4 w-4 text-red-600" />,
  rate_limit: <Clock className="h-4 w-4 text-amber-600" />,
  api_abuse: <Activity className="h-4 w-4 text-orange-600" />,
  data_export: <Download className="h-4 w-4 text-blue-600" />,
  config_change: <Settings className="h-4 w-4 text-purple-600" />
};

const policyCategories = [
  { value: "authentication", label: "Authentication", icon: Key },
  { value: "authorization", label: "Authorization", icon: Lock },
  { value: "data_protection", label: "Data Protection", icon: Shield },
  { value: "network", label: "Network Security", icon: Globe },
  { value: "backup", label: "Backup & Recovery", icon: HardDrive },
  { value: "compliance", label: "Compliance", icon: FileText },
  { value: "monitoring", label: "Monitoring", icon: Activity }
];

export default function SecurityMonitor() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  const [viewMode, setViewMode] = useState("global");
  const [selectedTenantId, setSelectedTenantId] = useState("");
  const [showPolicyEditor, setShowPolicyEditor] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState(null);
  const [showBackupEditor, setShowBackupEditor] = useState(false);
  const [editingBackup, setEditingBackup] = useState(null);
  const [isGeneratingAudit, setIsGeneratingAudit] = useState(false);
  const [expandedEventTypes, setExpandedEventTypes] = useState(new Set(["login_failed", "brute_force", "suspicious_activity"]));

  // Data queries
  const { data: securityEvents = [], isLoading: loadingEvents } = useQuery({
    queryKey: ["securityEvents"],
    queryFn: () => base44.entities.SecurityEvent.list("-created_date", 500)
  });

  const { data: securityPolicies = [] } = useQuery({
    queryKey: ["securityPolicies"],
    queryFn: () => base44.entities.SecurityPolicy.list()
  });

  const { data: backupConfigs = [] } = useQuery({
    queryKey: ["backupConfigs"],
    queryFn: () => base44.entities.BackupConfig.list()
  });

  const { data: securityAudits = [] } = useQuery({
    queryKey: ["securityAudits"],
    queryFn: () => base44.entities.SecurityAudit.list("-audit_date", 50)
  });

  const { data: roadmapItems = [] } = useQuery({
    queryKey: ["roadmapItems"],
    queryFn: () => base44.entities.RoadmapItem.list()
  });

  const [isAddingToRoadmap, setIsAddingToRoadmap] = useState(false);

  const { data: tenants = [] } = useQuery({
    queryKey: ["tenants"],
    queryFn: () => base44.entities.Tenant.list()
  });

  const { data: entityTemplates = [] } = useQuery({
    queryKey: ["entityTemplates"],
    queryFn: () => base44.entities.EntityTemplate.list()
  });

  // Mutations
  const createPolicyMutation = useMutation({
    mutationFn: (data) => base44.entities.SecurityPolicy.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["securityPolicies"] });
      toast.success("Policy created");
      setShowPolicyEditor(false);
    }
  });

  const updatePolicyMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.SecurityPolicy.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["securityPolicies"] });
      toast.success("Policy updated");
      setShowPolicyEditor(false);
    }
  });

  const deletePolicyMutation = useMutation({
    mutationFn: (id) => base44.entities.SecurityPolicy.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["securityPolicies"] });
      toast.success("Policy deleted");
    }
  });

  const createBackupMutation = useMutation({
    mutationFn: (data) => base44.entities.BackupConfig.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["backupConfigs"] });
      toast.success("Backup config created");
      setShowBackupEditor(false);
    }
  });

  const updateBackupMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.BackupConfig.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["backupConfigs"] });
      toast.success("Backup config updated");
      setShowBackupEditor(false);
    }
  });

  const markEventReviewed = useMutation({
    mutationFn: async ({ id, reviewed }) => {
      const user = await base44.auth.me();
      return base44.entities.SecurityEvent.update(id, { 
        reviewed, 
        reviewed_by: user?.email,
        reviewed_date: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["securityEvents"] });
      toast.success("Event updated");
    }
  });

  // Add finding to roadmap
  const addFindingToRoadmap = async (finding, auditId) => {
    setIsAddingToRoadmap(true);
    try {
      const roadmapItem = await base44.entities.RoadmapItem.create({
        title: `Security: ${finding.title}`,
        description: finding.description,
        category: "requirement",
        priority: finding.severity === "critical" ? "critical" : finding.severity === "high" ? "high" : "medium",
        status: "backlog",
        source: "ai_assistant",
        notes: finding.recommendation,
        tags: ["security", finding.category || "audit"]
      });

      // Update the audit finding with the roadmap item ID
      const audit = securityAudits.find(a => a.id === auditId);
      if (audit) {
        const updatedFindings = audit.findings.map(f => 
          f.title === finding.title ? { ...f, roadmap_item_id: roadmapItem.id, status: "in_progress" } : f
        );
        await base44.entities.SecurityAudit.update(auditId, { findings: updatedFindings });
      }

      queryClient.invalidateQueries({ queryKey: ["securityAudits"] });
      queryClient.invalidateQueries({ queryKey: ["roadmapItems"] });
      toast.success("Added to roadmap");
    } catch (error) {
      toast.error("Failed to add to roadmap");
    } finally {
      setIsAddingToRoadmap(false);
    }
  };

  // Filter data by view mode
  const filteredEvents = securityEvents.filter(e => {
    if (viewMode === "global") return e.is_global !== false || !e.tenant_id;
    if (selectedTenantId) return e.tenant_id === selectedTenantId;
    return e.tenant_id;
  });

  const filteredPolicies = securityPolicies.filter(p => {
    if (viewMode === "global") return p.is_global !== false;
    if (selectedTenantId) return p.tenant_id === selectedTenantId;
    return !p.is_global;
  });

  const filteredBackups = backupConfigs.filter(b => {
    if (viewMode === "global") return b.is_global !== false;
    if (selectedTenantId) return b.tenant_id === selectedTenantId;
    return !b.is_global;
  });

  // Stats
  const stats = useMemo(() => {
    const last24h = filteredEvents.filter(e => 
      new Date(e.created_date) > new Date(Date.now() - 24 * 60 * 60 * 1000)
    );
    const last7d = filteredEvents.filter(e => 
      new Date(e.created_date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    );

    const loginAttempts = last24h.filter(e => e.event_type === "login_success" || e.event_type === "login_failed");
    const successfulLogins = last24h.filter(e => e.event_type === "login_success").length;
    const failedLogins = last24h.filter(e => e.event_type === "login_failed").length;
    const attacks = last24h.filter(e => ["brute_force", "sql_injection", "xss_attempt", "api_abuse"].includes(e.event_type));
    const criticalEvents = last24h.filter(e => e.severity === "critical" || e.severity === "high");
    const unreviewedCritical = filteredEvents.filter(e => 
      (e.severity === "critical" || e.severity === "high") && !e.reviewed
    );

    // Hourly breakdown for charts
    const hourlyData = [];
    for (let i = 23; i >= 0; i--) {
      const hourStart = new Date(Date.now() - i * 60 * 60 * 1000);
      const hourEnd = new Date(Date.now() - (i - 1) * 60 * 60 * 1000);
      const hourEvents = last24h.filter(e => {
        const d = new Date(e.created_date);
        return d >= hourStart && d < hourEnd;
      });
      hourlyData.push({
        hour: format(hourStart, "HH:mm"),
        logins: hourEvents.filter(e => e.event_type === "login_success").length,
        failed: hourEvents.filter(e => e.event_type === "login_failed").length,
        attacks: hourEvents.filter(e => ["brute_force", "sql_injection", "xss_attempt"].includes(e.event_type)).length
      });
    }

    return {
      total24h: last24h.length,
      total7d: last7d.length,
      successfulLogins,
      failedLogins,
      loginSuccessRate: loginAttempts.length > 0 ? ((successfulLogins / loginAttempts.length) * 100).toFixed(1) : 100,
      attacks: attacks.length,
      criticalEvents: criticalEvents.length,
      unreviewedCritical: unreviewedCritical.length,
      blockedEvents: last24h.filter(e => e.blocked).length,
      hourlyData
    };
  }, [filteredEvents]);

  // Group events by type
  const eventsByType = useMemo(() => {
    const groups = {};
    filteredEvents.forEach(e => {
      if (!groups[e.event_type]) {
        groups[e.event_type] = { events: [], critical: 0, high: 0, medium: 0, low: 0, info: 0, unreviewed: 0 };
      }
      groups[e.event_type].events.push(e);
      groups[e.event_type][e.severity || "info"]++;
      if (!e.reviewed) groups[e.event_type].unreviewed++;
    });
    return groups;
  }, [filteredEvents]);

  const toggleEventType = (type) => {
    setExpandedEventTypes(prev => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  };

  // Generate AI Security Audit
  const generateSecurityAudit = async () => {
    setIsGeneratingAudit(true);
    try {
      const auditData = {
        totalEvents: securityEvents.length,
        criticalEvents: securityEvents.filter(e => e.severity === "critical").length,
        highEvents: securityEvents.filter(e => e.severity === "high").length,
        failedLogins: securityEvents.filter(e => e.event_type === "login_failed").length,
        attacks: securityEvents.filter(e => ["brute_force", "sql_injection", "xss_attempt", "api_abuse"].includes(e.event_type)).length,
        blockedEvents: securityEvents.filter(e => e.blocked).length,
        activePolicies: securityPolicies.filter(p => p.is_active).length,
        policyCategories: securityPolicies.reduce((acc, p) => {
          acc[p.category] = (acc[p.category] || 0) + 1;
          return acc;
        }, {}),
        backupConfigs: backupConfigs.length,
        entityCount: entityTemplates.length,
        tenantCount: tenants.length
      };

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a senior cybersecurity analyst conducting a security audit. Analyze this application's security data and provide a comprehensive security review:

SECURITY EVENTS (Last 30 days):
- Total events: ${auditData.totalEvents}
- Critical events: ${auditData.criticalEvents}
- High severity events: ${auditData.highEvents}
- Failed login attempts: ${auditData.failedLogins}
- Detected attacks: ${auditData.attacks}
- Blocked events: ${auditData.blockedEvents}

SECURITY POLICIES:
- Active policies: ${auditData.activePolicies}
- Categories covered: ${Object.keys(auditData.policyCategories).join(", ") || "None"}

BACKUP CONFIGURATION:
- Backup configs: ${auditData.backupConfigs}

SYSTEM SCOPE:
- Entities: ${auditData.entityCount}
- Tenants: ${auditData.tenantCount}

Provide:
1. Overall security score (0-100) and grade (A-F)
2. Executive summary of security posture
3. Top 5 security findings with severity, title, description, and recommendation
4. Missing security controls that should be implemented
5. Compliance recommendations (GDPR, SOC2, etc.)
6. Immediate actions required
7. Long-term security improvements`,
        response_json_schema: {
          type: "object",
          properties: {
            score: { type: "number" },
            grade: { type: "string" },
            summary: { type: "string" },
            findings: { 
              type: "array", 
              items: { 
                type: "object", 
                properties: {
                  severity: { type: "string" },
                  title: { type: "string" },
                  description: { type: "string" },
                  recommendation: { type: "string" }
                }
              }
            },
            missingControls: { type: "array", items: { type: "string" } },
            complianceRecommendations: { type: "array", items: { type: "string" } },
            immediateActions: { type: "array", items: { type: "string" } },
            longTermImprovements: { type: "array", items: { type: "string" } }
          }
        }
      });

      await base44.entities.SecurityAudit.create({
        audit_date: new Date().toISOString(),
        audit_type: "ai_review",
        overall_score: result.score,
        grade: result.grade,
        findings: result.findings,
        recommendations: [...(result.immediateActions || []), ...(result.longTermImprovements || [])],
        ai_summary: result.summary,
        is_global: viewMode === "global",
        tenant_id: selectedTenantId || null
      });

      queryClient.invalidateQueries({ queryKey: ["securityAudits"] });
      toast.success("Security audit completed");
    } catch (error) {
      toast.error("Failed to generate security audit");
    } finally {
      setIsGeneratingAudit(false);
    }
  };

  const latestAudit = securityAudits[0];

  return (
    <div className="p-6 bg-[var(--color-background)] min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-light flex items-center gap-2 text-[var(--color-midnight)]" style={{ fontFamily: 'var(--font-heading)' }}>
            <Shield className="h-6 w-6 text-[var(--color-success)]" />
            Security Monitor
          </h1>
          <p className="text-[var(--color-charcoal)]">Monitor security events, policies, and compliance</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowPolicyEditor(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Policy
          </Button>
          <Button onClick={generateSecurityAudit} disabled={isGeneratingAudit} className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white">
            {isGeneratingAudit ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
            AI Security Audit
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
          <TabsTrigger value="events">
            Events
            {stats.unreviewedCritical > 0 && (
              <Badge className="ml-2 bg-red-500">{stats.unreviewedCritical}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="logins">Login Monitor</TabsTrigger>
          <TabsTrigger value="policies">Policies ({filteredPolicies.length})</TabsTrigger>
          <TabsTrigger value="backups">Backups</TabsTrigger>
          <TabsTrigger value="audit" className="gap-2">
            <Sparkles className="h-4 w-4" />
            AI Audit
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-5 gap-4">
            <Card className={stats.unreviewedCritical > 0 ? "border-red-200" : "border-green-200"}>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-500">Security Status</div>
                    <div className={`text-2xl font-bold ${stats.unreviewedCritical > 0 ? "text-red-600" : "text-green-600"}`}>
                      {stats.unreviewedCritical > 0 ? "Alert" : "Secure"}
                    </div>
                  </div>
                  {stats.unreviewedCritical > 0 ? (
                    <ShieldAlert className="h-10 w-10 text-red-500" />
                  ) : (
                    <ShieldCheck className="h-10 w-10 text-green-500" />
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="text-sm text-gray-500">Events (24h)</div>
                <div className="text-2xl font-bold">{stats.total24h}</div>
                <p className="text-xs text-gray-400">{stats.total7d} this week</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="text-sm text-gray-500">Login Success Rate</div>
                <div className={`text-2xl font-bold ${parseFloat(stats.loginSuccessRate) >= 95 ? "text-green-600" : "text-amber-600"}`}>
                  {stats.loginSuccessRate}%
                </div>
                <p className="text-xs text-gray-400">{stats.failedLogins} failed today</p>
              </CardContent>
            </Card>

            <Card className={stats.attacks > 0 ? "border-red-200" : ""}>
              <CardContent className="pt-4">
                <div className="text-sm text-gray-500">Attacks Detected</div>
                <div className={`text-2xl font-bold ${stats.attacks > 0 ? "text-red-600" : "text-green-600"}`}>
                  {stats.attacks}
                </div>
                <p className="text-xs text-gray-400">{stats.blockedEvents} blocked</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="text-sm text-gray-500">Active Policies</div>
                <div className="text-2xl font-bold">{filteredPolicies.filter(p => p.is_active).length}</div>
                <p className="text-xs text-gray-400">{filteredBackups.length} backup configs</p>
              </CardContent>
            </Card>
          </div>

          {/* Activity Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Security Activity (24h)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.hourlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" tick={{ fontSize: 10 }} />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="logins" stackId="1" stroke="#22c55e" fill="#22c55e" name="Successful Logins" />
                    <Area type="monotone" dataKey="failed" stackId="1" stroke="#f59e0b" fill="#f59e0b" name="Failed Logins" />
                    <Area type="monotone" dataKey="attacks" stackId="1" stroke="#ef4444" fill="#ef4444" name="Attacks" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Critical Events Needing Review */}
          {stats.unreviewedCritical > 0 && (
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-700 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Critical Events Requiring Review ({stats.unreviewedCritical})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredEvents
                    .filter(e => (e.severity === "critical" || e.severity === "high") && !e.reviewed)
                    .slice(0, 5)
                    .map(event => (
                      <div key={event.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          {eventTypeIcons[event.event_type]}
                          <div>
                            <p className="font-medium">{event.event_type.replace(/_/g, " ")}</p>
                            <p className="text-sm text-gray-600">{event.description || event.user_email}</p>
                            <p className="text-xs text-gray-400">
                              {event.ip_address} • {format(new Date(event.created_date), "MMM d, HH:mm")}
                            </p>
                          </div>
                        </div>
                        <Button 
                          size="sm" 
                          onClick={() => markEventReviewed.mutate({ id: event.id, reviewed: true })}
                        >
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Mark Reviewed
                        </Button>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Events Tab - Grouped by Type */}
        <TabsContent value="events" className="space-y-2">
          {loadingEvents ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : Object.keys(eventsByType).length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                <ShieldCheck className="h-12 w-12 mx-auto mb-4 text-green-500" />
                <p>No security events recorded</p>
              </CardContent>
            </Card>
          ) : (
            Object.entries(eventsByType)
              .sort((a, b) => b[1].events.length - a[1].events.length)
              .map(([type, group]) => {
                const isExpanded = expandedEventTypes.has(type);
                const hasCritical = group.critical > 0 || group.high > 0;
                
                return (
                  <Card key={type} className={hasCritical ? "border-red-200" : ""}>
                    <button
                      onClick={() => toggleEventType(type)}
                      className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        {isExpanded ? <ChevronDown className="h-5 w-5 text-gray-400" /> : <ChevronRight className="h-5 w-5 text-gray-400" />}
                        <div className="flex items-center gap-2">
                          {eventTypeIcons[type]}
                          <span className="font-medium capitalize">{type.replace(/_/g, " ")}</span>
                        </div>
                        <Badge variant="outline">{group.events.length} events</Badge>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {group.critical > 0 && <Badge className="bg-red-100 text-red-700">{group.critical} Critical</Badge>}
                        {group.high > 0 && <Badge className="bg-orange-100 text-orange-700">{group.high} High</Badge>}
                        {group.medium > 0 && <Badge className="bg-amber-100 text-amber-700">{group.medium} Medium</Badge>}
                        {group.unreviewed > 0 && <Badge variant="outline">{group.unreviewed} Unreviewed</Badge>}
                      </div>
                    </button>
                    
                    {isExpanded && (
                      <div className="border-t">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Time</TableHead>
                              <TableHead>User</TableHead>
                              <TableHead>IP Address</TableHead>
                              <TableHead>Description</TableHead>
                              <TableHead>Severity</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {group.events.slice(0, 20).map(event => (
                              <TableRow key={event.id} className={event.blocked ? "bg-red-50" : ""}>
                                <TableCell className="text-sm">
                                  {format(new Date(event.created_date), "MMM d, HH:mm:ss")}
                                </TableCell>
                                <TableCell>{event.user_email || "-"}</TableCell>
                                <TableCell className="font-mono text-xs">{event.ip_address || "-"}</TableCell>
                                <TableCell className="max-w-xs truncate">{event.description}</TableCell>
                                <TableCell>
                                  <Badge className={severityColors[event.severity || "info"]}>
                                    {event.severity || "info"}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  {event.blocked && <Badge className="bg-red-100 text-red-700">Blocked</Badge>}
                                  {event.reviewed && <Badge className="bg-green-100 text-green-700">Reviewed</Badge>}
                                </TableCell>
                                <TableCell>
                                  {!event.reviewed && (
                                    <Button 
                                      size="sm" 
                                      variant="ghost"
                                      onClick={() => markEventReviewed.mutate({ id: event.id, reviewed: true })}
                                    >
                                      <CheckCircle2 className="h-3 w-3" />
                                    </Button>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </Card>
                );
              })
          )}
        </TabsContent>

        {/* Login Monitor Tab */}
        <TabsContent value="logins" className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-4">
                <div className="text-sm text-gray-500">Successful Logins (24h)</div>
                <div className="text-3xl font-bold text-green-600">{stats.successfulLogins}</div>
              </CardContent>
            </Card>
            <Card className={stats.failedLogins > 10 ? "border-red-200" : ""}>
              <CardContent className="pt-4">
                <div className="text-sm text-gray-500">Failed Logins (24h)</div>
                <div className={`text-3xl font-bold ${stats.failedLogins > 10 ? "text-red-600" : "text-amber-600"}`}>
                  {stats.failedLogins}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-sm text-gray-500">Success Rate</div>
                <div className={`text-3xl font-bold ${parseFloat(stats.loginSuccessRate) >= 95 ? "text-green-600" : "text-amber-600"}`}>
                  {stats.loginSuccessRate}%
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Login Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Device</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEvents
                    .filter(e => e.event_type === "login_success" || e.event_type === "login_failed")
                    .slice(0, 50)
                    .map(event => (
                      <TableRow key={event.id} className={event.event_type === "login_failed" ? "bg-red-50" : ""}>
                        <TableCell className="text-sm">
                          {format(new Date(event.created_date), "MMM d, HH:mm:ss")}
                        </TableCell>
                        <TableCell>
                          {event.event_type === "login_success" ? (
                            <Badge className="bg-green-100 text-green-700">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Success
                            </Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-700">
                              <XCircle className="h-3 w-3 mr-1" />
                              Failed
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{event.user_email || "-"}</TableCell>
                        <TableCell className="font-mono text-xs">{event.ip_address || "-"}</TableCell>
                        <TableCell>{event.location || "-"}</TableCell>
                        <TableCell className="text-xs max-w-[200px] truncate">{event.user_agent || "-"}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Policies Tab */}
        <TabsContent value="policies" className="space-y-4">
          {policyCategories.map(category => {
            const categoryPolicies = filteredPolicies.filter(p => p.category === category.value);
            if (categoryPolicies.length === 0) return null;
            const Icon = category.icon;
            
            return (
              <Card key={category.value}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Icon className="h-5 w-5 text-blue-600" />
                    {category.label}
                    <Badge variant="outline">{categoryPolicies.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {categoryPolicies.map(policy => (
                      <div key={policy.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Switch 
                            checked={policy.is_active} 
                            onCheckedChange={(checked) => updatePolicyMutation.mutate({ id: policy.id, data: { is_active: checked } })}
                          />
                          <div>
                            <p className="font-medium">{policy.name}</p>
                            <p className="text-sm text-gray-500">{policy.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{policy.enforcement}</Badge>
                          {policy.is_global && <Badge className="bg-blue-100 text-blue-700">Global</Badge>}
                          <Button size="sm" variant="ghost" onClick={() => { setEditingPolicy(policy); setShowPolicyEditor(true); }}>
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="ghost" className="text-red-500" onClick={() => deletePolicyMutation.mutate(policy.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {filteredPolicies.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No security policies defined</p>
                <Button className="mt-4" onClick={() => setShowPolicyEditor(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Policy
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Backups Tab */}
        <TabsContent value="backups" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setShowBackupEditor(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Backup Config
            </Button>
          </div>

          {filteredBackups.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                <HardDrive className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No backup configurations</p>
                <Button className="mt-4" onClick={() => setShowBackupEditor(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Backup Config
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {filteredBackups.map(backup => (
                <Card key={backup.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        <HardDrive className="h-5 w-5 text-blue-600" />
                        {backup.name}
                      </CardTitle>
                      <Switch 
                        checked={backup.is_active}
                        onCheckedChange={(checked) => updateBackupMutation.mutate({ id: backup.id, data: { is_active: checked } })}
                      />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Type</span>
                        <Badge variant="outline">{backup.backup_type}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Frequency</span>
                        <span>{backup.frequency}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Retention</span>
                        <span>{backup.retention_days} days</span>
                      </div>
                      {backup.last_backup && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Last Backup</span>
                          <span>{format(new Date(backup.last_backup), "MMM d, HH:mm")}</span>
                        </div>
                      )}
                      {backup.last_backup_status && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Status</span>
                          <Badge className={
                            backup.last_backup_status === "success" ? "bg-green-100 text-green-700" :
                            backup.last_backup_status === "failed" ? "bg-red-100 text-red-700" :
                            "bg-amber-100 text-amber-700"
                          }>
                            {backup.last_backup_status}
                          </Badge>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="outline" onClick={() => { setEditingBackup(backup); setShowBackupEditor(true); }}>
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* AI Audit Tab */}
        <TabsContent value="audit" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">AI Security Audit History</h2>
              <p className="text-sm text-gray-500">Collapsible audit logs with roadmap integration</p>
            </div>
            <Button onClick={generateSecurityAudit} disabled={isGeneratingAudit} className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white">
              {isGeneratingAudit ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
              Run New Audit
            </Button>
          </div>

          {isGeneratingAudit && (
            <Card>
              <CardContent className="py-12 text-center">
                <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-purple-600" />
                <p className="font-medium">Running security audit...</p>
                <p className="text-sm text-gray-500 mt-2">Analyzing policies, events, and configurations</p>
              </CardContent>
            </Card>
          )}

          {!isGeneratingAudit && securityAudits.length > 0 && (
            <div className="space-y-3">
              {securityAudits.map((audit, index) => (
                <AuditLogCard
                  key={audit.id}
                  audit={audit}
                  onAddToRoadmap={addFindingToRoadmap}
                  roadmapItems={roadmapItems}
                  isAddingToRoadmap={isAddingToRoadmap}
                  defaultExpanded={index === 0}
                />
              ))}
            </div>
          )}

          {!isGeneratingAudit && securityAudits.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No security audits yet</p>
                <p className="text-sm mt-2">Run an AI security audit to get comprehensive analysis</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Policy Editor Dialog */}
      <Dialog open={showPolicyEditor} onOpenChange={setShowPolicyEditor}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingPolicy ? "Edit Security Policy" : "Create Security Policy"}</DialogTitle>
          </DialogHeader>
          <PolicyEditorForm 
            policy={editingPolicy}
            viewMode={viewMode}
            selectedTenantId={selectedTenantId}
            tenants={tenants}
            onSave={(data) => {
              if (editingPolicy) {
                updatePolicyMutation.mutate({ id: editingPolicy.id, data });
              } else {
                createPolicyMutation.mutate(data);
              }
            }}
            onCancel={() => { setShowPolicyEditor(false); setEditingPolicy(null); }}
          />
        </DialogContent>
      </Dialog>

      {/* Backup Editor Dialog */}
      <Dialog open={showBackupEditor} onOpenChange={setShowBackupEditor}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingBackup ? "Edit Backup Config" : "Create Backup Config"}</DialogTitle>
          </DialogHeader>
          <BackupEditorForm 
            backup={editingBackup}
            viewMode={viewMode}
            selectedTenantId={selectedTenantId}
            tenants={tenants}
            entityTemplates={entityTemplates}
            onSave={(data) => {
              if (editingBackup) {
                updateBackupMutation.mutate({ id: editingBackup.id, data });
              } else {
                createBackupMutation.mutate(data);
              }
            }}
            onCancel={() => { setShowBackupEditor(false); setEditingBackup(null); }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Policy Editor Form Component
function PolicyEditorForm({ policy, viewMode, selectedTenantId, tenants, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name: policy?.name || "",
    category: policy?.category || "authentication",
    description: policy?.description || "",
    enforcement: policy?.enforcement || "enforce",
    is_global: policy?.is_global ?? (viewMode === "global"),
    tenant_id: policy?.tenant_id || selectedTenantId || "",
    is_active: policy?.is_active ?? true
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-blue-600" />
          <Label>Global Policy</Label>
        </div>
        <Switch
          checked={formData.is_global}
          onCheckedChange={(v) => setFormData({ ...formData, is_global: v, tenant_id: v ? "" : formData.tenant_id })}
        />
      </div>

      {!formData.is_global && (
        <div>
          <Label>Tenant</Label>
          <Select value={formData.tenant_id} onValueChange={(v) => setFormData({ ...formData, tenant_id: v })}>
            <SelectTrigger>
              <SelectValue placeholder="Select tenant..." />
            </SelectTrigger>
            <SelectContent>
              {tenants.map(t => (
                <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div>
        <Label>Policy Name</Label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Password Strength Policy"
        />
      </div>

      <div>
        <Label>Category</Label>
        <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {policyCategories.map(c => (
              <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Description</Label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe the policy..."
          rows={3}
        />
      </div>

      <div>
        <Label>Enforcement Level</Label>
        <Select value={formData.enforcement} onValueChange={(v) => setFormData({ ...formData, enforcement: v })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="enforce">Enforce (Block violations)</SelectItem>
            <SelectItem value="warn">Warn (Allow with warning)</SelectItem>
            <SelectItem value="audit">Audit (Log only)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={() => onSave(formData)}>Save Policy</Button>
      </div>
    </div>
  );
}

// Backup Editor Form Component
function BackupEditorForm({ backup, viewMode, selectedTenantId, tenants, entityTemplates, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name: backup?.name || "",
    backup_type: backup?.backup_type || "full",
    frequency: backup?.frequency || "daily",
    retention_days: backup?.retention_days || 30,
    entities_included: backup?.entities_included || [],
    is_global: backup?.is_global ?? (viewMode === "global"),
    tenant_id: backup?.tenant_id || selectedTenantId || "",
    is_active: backup?.is_active ?? true
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-blue-600" />
          <Label>Global Backup</Label>
        </div>
        <Switch
          checked={formData.is_global}
          onCheckedChange={(v) => setFormData({ ...formData, is_global: v, tenant_id: v ? "" : formData.tenant_id })}
        />
      </div>

      {!formData.is_global && (
        <div>
          <Label>Tenant</Label>
          <Select value={formData.tenant_id} onValueChange={(v) => setFormData({ ...formData, tenant_id: v })}>
            <SelectTrigger>
              <SelectValue placeholder="Select tenant..." />
            </SelectTrigger>
            <SelectContent>
              {tenants.map(t => (
                <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div>
        <Label>Backup Name</Label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Daily Full Backup"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Backup Type</Label>
          <Select value={formData.backup_type} onValueChange={(v) => setFormData({ ...formData, backup_type: v })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="full">Full</SelectItem>
              <SelectItem value="incremental">Incremental</SelectItem>
              <SelectItem value="differential">Differential</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Frequency</Label>
          <Select value={formData.frequency} onValueChange={(v) => setFormData({ ...formData, frequency: v })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hourly">Hourly</SelectItem>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label>Retention (days)</Label>
        <Input
          type="number"
          value={formData.retention_days}
          onChange={(e) => setFormData({ ...formData, retention_days: parseInt(e.target.value) || 30 })}
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={() => onSave(formData)}>Save Backup Config</Button>
      </div>
    </div>
  );
}