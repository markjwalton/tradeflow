import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Globe, Server, Shield, AlertTriangle, CheckCircle2, XCircle,
  ArrowRight, Zap, Database, Layout, Workflow, FileText,
  Bell, Clock, BarChart3, Sparkles, Link2, Upload, Settings,
  Users, Lock, RefreshCw, Package, Flag, Info
} from "lucide-react";

// Shared Functions categorization
const SHARED_FUNCTIONS = {
  canSync: [
    { name: "Entity Templates", icon: Database, complexity: "low", notes: "Full schema sync supported" },
    { name: "Page Templates", icon: Layout, complexity: "medium", notes: "Component definitions sync, not runtime code" },
    { name: "Feature Templates", icon: Zap, complexity: "medium", notes: "Specifications sync, implementation separate" },
    { name: "Workflow Definitions", icon: Workflow, complexity: "high", notes: "Step definitions sync, triggers local" },
    { name: "Form Templates", icon: FileText, complexity: "low", notes: "Full form schema sync" },
    { name: "Checklist Templates", icon: CheckCircle2, complexity: "low", notes: "Full checklist sync" },
    { name: "Dashboard Widgets", icon: BarChart3, complexity: "medium", notes: "Config syncs, data sources local" },
    { name: "Design System Tokens", icon: Settings, complexity: "low", notes: "CSS variables and colors" },
    { name: "Navigation Configs", icon: Layout, complexity: "low", notes: "Structure syncs, pages must exist locally" },
    { name: "Development Rules", icon: Flag, complexity: "low", notes: "Full rule sync for AI context" },
    { name: "Community Library Items", icon: Package, complexity: "medium", notes: "Templates and specs" },
  ],
  cannotSync: [
    { name: "User Sessions/Auth", icon: Lock, reason: "Security - each instance manages own auth" },
    { name: "OAuth Tokens", icon: Shield, reason: "Security - tokens bound to instance" },
    { name: "Backend Functions (execution)", icon: Zap, reason: "Code runs locally, share templates only" },
    { name: "File Uploads/Assets", icon: Upload, reason: "Storage is instance-specific, share URLs" },
    { name: "WebSocket Connections", icon: RefreshCw, reason: "Real-time requires direct connection" },
    { name: "Scheduled Tasks", icon: Clock, reason: "Cron jobs run locally" },
    { name: "Webhooks", icon: Link2, reason: "Endpoint URLs instance-specific" },
    { name: "Environment Secrets", icon: Lock, reason: "Security - never transmitted" },
    { name: "Audit Logs", icon: FileText, reason: "Compliance - local only" },
    { name: "Live Data/Records", icon: Database, reason: "Privacy - only templates sync" },
  ],
  potentialIssues: [
    { issue: "Schema Version Conflicts", severity: "high", mitigation: "Version tracking + migration scripts" },
    { issue: "Network Latency", severity: "medium", mitigation: "Async sync with retry logic" },
    { issue: "Rate Limiting", severity: "medium", mitigation: "Queue-based batch processing" },
    { issue: "Authentication Expiry", severity: "high", mitigation: "Auto-refresh tokens + alerts" },
    { issue: "Data Integrity", severity: "critical", mitigation: "Checksums + verification tests" },
    { issue: "Feature Dependencies", severity: "medium", mitigation: "Dependency resolver before sync" },
    { issue: "Breaking Changes", severity: "critical", mitigation: "7-day notice + rollback plan" },
    { issue: "Partial Sync Failures", severity: "high", mitigation: "Transaction-like rollback" },
  ]
};

export default function StandaloneAPIStrategy() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="p-6 bg-[var(--color-background)] min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-light flex items-center gap-2 text-foreground font-heading">
          <Globe className="h-6 w-6 text-primary" />
          Multi-Tenant Standalone API Strategy
        </h1>
        <p className="text-muted-foreground">
          Architecture for sharing functionality between main app and standalone Base44 instances
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sync-features">What Can Sync</TabsTrigger>
          <TabsTrigger value="limitations">Limitations</TabsTrigger>
          <TabsTrigger value="issues">Potential Issues</TabsTrigger>
          <TabsTrigger value="architecture">Architecture</TabsTrigger>
          <TabsTrigger value="wizard">Setup Wizard</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <Card className="border-primary-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5 text-[var(--color-primary)]" />
                Strategy Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                This strategy enables standalone Base44 tenant instances to receive functionality updates 
                from the main application through secure API connectivity. Each standalone instance 
                maintains its own data while syncing templates, configurations, and design system updates.
              </p>
              
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <CheckCircle2 className="h-8 w-8 text-green-600 mb-2" />
                  <h4 className="font-semibold text-green-800">Can Sync</h4>
                  <p className="text-sm text-green-700">{SHARED_FUNCTIONS.canSync.length} feature types</p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <XCircle className="h-8 w-8 text-red-600 mb-2" />
                  <h4 className="font-semibold text-red-800">Cannot Sync</h4>
                  <p className="text-sm text-red-700">{SHARED_FUNCTIONS.cannotSync.length} feature types</p>
                </div>
                <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <AlertTriangle className="h-8 w-8 text-amber-600 mb-2" />
                  <h4 className="font-semibold text-amber-800">Potential Issues</h4>
                  <p className="text-sm text-amber-700">{SHARED_FUNCTIONS.potentialIssues.length} identified risks</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Key Components */}
          <div className="grid grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Main App Components</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-[var(--color-background)] rounded-lg">
                  <Server className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Standalone Instance Manager</p>
                    <p className="text-sm text-muted-foreground">Configure and monitor all connected instances</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-[var(--color-background)] rounded-lg">
                  <BarChart3 className="h-5 w-5 text-[var(--color-secondary)]" />
                  <div>
                    <p className="font-medium">API Performance Dashboard</p>
                    <p className="text-sm text-muted-foreground">Monitor all tenant API calls and latency</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-[var(--color-background)] rounded-lg">
                  <Bell className="h-5 w-5 text-accent-400" />
                  <div>
                    <p className="font-medium">Feature Notification System</p>
                    <p className="text-sm text-muted-foreground">Notify instances of new available features</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-[var(--color-background)] rounded-lg">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="font-medium">AI Problem Analyzer</p>
                    <p className="text-sm text-muted-foreground">Diagnose connectivity and performance issues</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Standalone Instance Components</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-[var(--color-background)] rounded-lg">
                  <Settings className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Connection Setup Wizard</p>
                    <p className="text-sm text-muted-foreground">Step-by-step API connection and verification</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-[var(--color-background)] rounded-lg">
                  <BarChart3 className="h-5 w-5 text-[var(--color-secondary)]" />
                  <div>
                    <p className="font-medium">Local Performance Monitor</p>
                    <p className="text-sm text-muted-foreground">Track API health and sync status</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-[var(--color-background)] rounded-lg">
                  <Package className="h-5 w-5 text-[var(--color-accent)]" />
                  <div>
                    <p className="font-medium">Feature Availability Browser</p>
                    <p className="text-sm text-muted-foreground">View and deploy available features</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-[var(--color-background)] rounded-lg">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="font-medium">AI Troubleshooter</p>
                    <p className="text-sm text-muted-foreground">Diagnose and resolve local issues</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Sync Features Tab */}
        <TabsContent value="sync-features" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <CheckCircle2 className="h-5 w-5" />
                Features That CAN Sync via API
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {SHARED_FUNCTIONS.canSync.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.name} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">{item.notes}</p>
                        </div>
                      </div>
                      <Badge className={
                        item.complexity === "low" ? "bg-green-100 text-green-700" :
                        item.complexity === "medium" ? "bg-amber-100 text-amber-700" :
                        "bg-red-100 text-red-700"
                      }>
                        {item.complexity} complexity
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Limitations Tab */}
        <TabsContent value="limitations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <XCircle className="h-5 w-5" />
                Features That CANNOT Sync via API
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {SHARED_FUNCTIONS.cannotSync.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.name} className="flex items-center justify-between p-3 border border-red-200 rounded-lg bg-red-50">
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5 text-red-600" />
                        <div>
                          <p className="font-medium text-red-800">{item.name}</p>
                          <p className="text-sm text-red-700">{item.reason}</p>
                        </div>
                      </div>
                      <Badge className="bg-red-100 text-red-700">Not Supported</Badge>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-800 flex items-center gap-2">
                  <Info className="h-4 w-4 text-info" />
                  Workarounds Available
                </h4>
                <ul className="mt-2 space-y-1 text-sm text-blue-700">
                  <li>• Backend function CODE can be shared as templates, deployed separately</li>
                  <li>• Assets: sync metadata + provide download URLs</li>
                  <li>• Webhooks: document manual configuration steps</li>
                  <li>• OAuth: provide setup guides for each provider</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Potential Issues Tab */}
        <TabsContent value="issues" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-700">
                <AlertTriangle className="h-5 w-5" />
                Potential Issues & Mitigations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {SHARED_FUNCTIONS.potentialIssues.map((item) => (
                  <div key={item.issue} className={`p-4 border rounded-lg ${
                    item.severity === "critical" ? "border-red-300 bg-red-50" :
                    item.severity === "high" ? "border-orange-300 bg-orange-50" :
                    "border-amber-300 bg-amber-50"
                  }`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{item.issue}</h4>
                          <Badge className={
                            item.severity === "critical" ? "bg-red-600 text-white" :
                            item.severity === "high" ? "bg-orange-600 text-white" :
                            "bg-amber-600 text-white"
                          }>
                            {item.severity}
                          </Badge>
                        </div>
                        <p className="text-sm mt-1 text-muted-foreground">
                          <strong>Mitigation:</strong> {item.mitigation}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Architecture Tab */}
        <TabsContent value="architecture" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Architecture</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-6">
                {/* Main App */}
                <div className="p-4 border-2 border-[var(--color-primary)] rounded-lg">
                  <h4 className="font-semibold text-[var(--color-primary)] mb-4 flex items-center gap-2">
                    <Server className="h-5 w-5" />
                    Main App (Hub)
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="p-2 bg-[var(--color-background)] rounded">• Template Libraries</div>
                    <div className="p-2 bg-[var(--color-background)] rounded">• Feature Repository</div>
                    <div className="p-2 bg-[var(--color-background)] rounded">• API Gateway</div>
                    <div className="p-2 bg-[var(--color-background)] rounded">• Performance Monitor</div>
                    <div className="p-2 bg-[var(--color-background)] rounded">• AI Analyzer</div>
                    <div className="p-2 bg-[var(--color-background)] rounded">• Notification Service</div>
                  </div>
                </div>

                {/* API Layer */}
                <div className="p-4 border-2 border-[var(--color-secondary)] rounded-lg">
                  <h4 className="font-semibold text-[var(--color-secondary)] mb-4 flex items-center gap-2">
                    <Link2 className="h-5 w-5 text-secondary-400" />
                    API Layer
                    </h4>
                  <div className="space-y-2 text-sm">
                    <div className="p-2 bg-[var(--color-background)] rounded flex items-center gap-2">
                      <ArrowRight className="h-4 w-4" />
                      Authentication
                    </div>
                    <div className="p-2 bg-[var(--color-background)] rounded flex items-center gap-2">
                      <ArrowRight className="h-4 w-4" />
                      Rate Limiting
                    </div>
                    <div className="p-2 bg-[var(--color-background)] rounded flex items-center gap-2">
                      <ArrowRight className="h-4 w-4" />
                      Request Logging
                    </div>
                    <div className="p-2 bg-[var(--color-background)] rounded flex items-center gap-2">
                      <ArrowRight className="h-4 w-4" />
                      Data Validation
                    </div>
                    <div className="p-2 bg-[var(--color-background)] rounded flex items-center gap-2">
                      <ArrowRight className="h-4 w-4" />
                      Versioning
                    </div>
                  </div>
                </div>

                {/* Standalone Instance */}
                <div className="p-4 border-2 border-[var(--color-accent)] rounded-lg">
                  <h4 className="font-semibold text-[var(--color-accent-dark)] mb-4 flex items-center gap-2">
                    <Globe className="h-5 w-5 text-accent-400" />
                    Standalone Instance
                    </h4>
                  <div className="space-y-2 text-sm">
                    <div className="p-2 bg-[var(--color-background)] rounded">• Local Data Store</div>
                    <div className="p-2 bg-[var(--color-background)] rounded">• API Connector</div>
                    <div className="p-2 bg-[var(--color-background)] rounded">• Sync Manager</div>
                    <div className="p-2 bg-[var(--color-background)] rounded">• Local Monitor</div>
                    <div className="p-2 bg-[var(--color-background)] rounded">• Feature Browser</div>
                    <div className="p-2 bg-[var(--color-background)] rounded">• Setup Wizard</div>
                  </div>
                </div>
              </div>

              {/* Data Flow */}
              <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-4">Data Flow</h4>
                <div className="flex items-center justify-center gap-4 text-sm">
                  <div className="p-3 bg-[var(--color-primary)]/10 rounded-lg text-center">
                    <p className="font-medium">Main App</p>
                    <p className="text-xs text-muted-foreground">Source of Truth</p>
                  </div>
                  <ArrowRight className="h-6 w-6 text-gray-400" />
                  <div className="p-3 bg-[var(--color-secondary)]/10 rounded-lg text-center">
                    <p className="font-medium">API Request</p>
                    <p className="text-xs text-muted-foreground">Authenticated + Logged</p>
                  </div>
                  <ArrowRight className="h-6 w-6 text-gray-400" />
                  <div className="p-3 bg-[var(--color-accent)]/20 rounded-lg text-center">
                    <p className="font-medium">Standalone</p>
                    <p className="text-xs text-muted-foreground">Receives Templates</p>
                  </div>
                  <ArrowRight className="h-6 w-6 text-gray-400" />
                  <div className="p-3 bg-green-100 rounded-lg text-center">
                    <p className="font-medium">Local Deploy</p>
                    <p className="text-xs text-muted-foreground">Uses Locally</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Wizard Tab */}
        <TabsContent value="wizard" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-[var(--color-primary)]" />
                Connection Setup Wizard Steps
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { step: 1, title: "Instance Registration", desc: "Enter standalone instance URL and create API credentials" },
                  { step: 2, title: "API Key Configuration", desc: "Securely store API key in standalone instance secrets" },
                  { step: 3, title: "Connectivity Test", desc: "Verify basic ping and authentication works" },
                  { step: 4, title: "Latency Test", desc: "Measure response times and validate thresholds" },
                  { step: 5, title: "Data Sync Test", desc: "Send small payload and verify integrity" },
                  { step: 6, title: "Feature Selection", desc: "Choose which features to enable for sync" },
                  { step: 7, title: "Performance Thresholds", desc: "Configure warning and critical alert levels" },
                  { step: 8, title: "Notification Settings", desc: "Enable alerts for new features and issues" },
                  { step: 9, title: "Verification Suite", desc: "Run full test suite and generate report" },
                  { step: 10, title: "Activation", desc: "Mark connection as active and start monitoring" },
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-4 p-3 border rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                      {item.step}
                    </div>
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Monitoring Tab */}
        <TabsContent value="monitoring" className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Main App Dashboard Requirements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 border rounded-lg">
                  <p className="font-medium">Standalone API Health Widget</p>
                  <p className="text-sm text-muted-foreground">Shows all instances with connection status, latency, and alerts</p>
                </div>
                <div className="p-3 border rounded-lg">
                  <p className="font-medium">API Performance by Tenant Page</p>
                  <p className="text-sm text-muted-foreground">Detailed metrics per tenant with graphs and AI analysis</p>
                </div>
                <div className="p-3 border rounded-lg">
                  <p className="font-medium">Feature Deployment Tracker</p>
                  <p className="text-sm text-muted-foreground">Which features are deployed to which instances</p>
                </div>
                <div className="p-3 border rounded-lg">
                  <p className="font-medium">AI Problem Detector</p>
                  <p className="text-sm text-muted-foreground">Auto-detect degradation, generate recommendations</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Standalone Instance Dashboard</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 border rounded-lg">
                  <p className="font-medium">Connection Health Indicator</p>
                  <p className="text-sm text-muted-foreground">Real-time status with last ping time</p>
                </div>
                <div className="p-3 border rounded-lg">
                  <p className="font-medium">Local API Performance</p>
                  <p className="text-sm text-muted-foreground">Latency graphs and error rates</p>
                </div>
                <div className="p-3 border rounded-lg">
                  <p className="font-medium">Available Features List</p>
                  <p className="text-sm text-muted-foreground">New features with deploy option</p>
                </div>
                <div className="p-3 border rounded-lg">
                  <p className="font-medium">AI Troubleshooter</p>
                  <p className="text-sm text-muted-foreground">Diagnose local issues with solutions</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-700">
                <Sparkles className="h-5 w-5" />
                AI Analysis Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-medium text-purple-800 mb-2">Main App AI Capabilities</h4>
                  <ul className="text-sm text-purple-700 space-y-1">
                    <li>• Detect performance degradation patterns</li>
                    <li>• Correlate issues across instances</li>
                    <li>• Recommend infrastructure improvements</li>
                    <li>• Predict capacity needs</li>
                    <li>• Auto-generate RoadmapItems for issues</li>
                  </ul>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-medium text-purple-800 mb-2">Standalone AI Capabilities</h4>
                  <ul className="text-sm text-purple-700 space-y-1">
                    <li>• Diagnose connection failures</li>
                    <li>• Suggest configuration fixes</li>
                    <li>• Identify local bottlenecks</li>
                    <li>• Recommend feature deployments</li>
                    <li>• Generate troubleshooting guides</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}