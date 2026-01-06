import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/sturij";
import { 
  Activity, Shield, Gauge, Code, FileCode2, AlertTriangle
} from "lucide-react";

// Import tab content components
import DevToolsTab from "@/components/system-monitor/DevToolsTab";
import PerformanceTab from "@/components/system-monitor/PerformanceTab";
import SecurityDashboardTab from "@/components/system-monitor/SecurityDashboardTab";
import SecurityMonitorTab from "@/components/system-monitor/SecurityMonitorTab";
import SystemHealthTab from "@/components/system-monitor/SystemHealthTab";
import ViolationReportTab from "@/components/system-monitor/ViolationReportTab";

export default function SystemMonitor() {
  const [activeTab, setActiveTab] = useState("health");

  return (
    <div className="max-w-7xl mx-auto -mt-6">
      <PageHeader 
        title="System Monitor"
        description="Development tools, performance monitoring, and security oversight"
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="health" className="gap-2">
            <Gauge className="h-4 w-4" />
            Health
          </TabsTrigger>
          <TabsTrigger value="performance" className="gap-2">
            <Activity className="h-4 w-4" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="security-dashboard" className="gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="security-monitor" className="gap-2">
            <FileCode2 className="h-4 w-4" />
            Events
          </TabsTrigger>
          <TabsTrigger value="violations" className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            Violations
          </TabsTrigger>
          <TabsTrigger value="dev-tools" className="gap-2">
            <Code className="h-4 w-4" />
            Dev Tools
          </TabsTrigger>
        </TabsList>

        <TabsContent value="health" className="mt-6">
          <SystemHealthTab />
        </TabsContent>

        <TabsContent value="performance" className="mt-6">
          <PerformanceTab />
        </TabsContent>

        <TabsContent value="security-dashboard" className="mt-6">
          <SecurityDashboardTab />
        </TabsContent>

        <TabsContent value="security-monitor" className="mt-6">
          <SecurityMonitorTab />
        </TabsContent>

        <TabsContent value="violations" className="mt-6">
          <ViolationReportTab />
        </TabsContent>

        <TabsContent value="dev-tools" className="mt-6">
          <DevToolsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}