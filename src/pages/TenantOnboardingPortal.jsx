import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, Upload, MessageSquare, CheckSquare, FileSignature, 
  Settings, Loader2, AlertCircle 
} from "lucide-react";
import { useTenant } from "@/Layout";

import PortalOverview from "@/components/onboarding/portal/PortalOverview";
import DocumentManager from "@/components/onboarding/portal/DocumentManager";
import AIKnowledgeChat from "@/components/onboarding/portal/AIKnowledgeChat";
import TaskManager from "@/components/onboarding/portal/TaskManager";
import ContractApprovalFlow from "@/components/onboarding/portal/ContractApprovalFlow";
import TechnicalDocs from "@/components/onboarding/portal/TechnicalDocs";

export default function TenantOnboardingPortal() {
  const urlParams = new URLSearchParams(window.location.search);
  const sessionId = urlParams.get("session");
  const { tenantId } = useTenant();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => {});
  }, []);

  const { data: sessions = [], isLoading: sessionsLoading } = useQuery({
    queryKey: ["onboardingSessions", tenantId],
    queryFn: () => base44.entities.OnboardingSession.filter({ tenant_id: tenantId }),
    enabled: !!tenantId && !sessionId,
  });

  const { data: directSession, isLoading: directLoading } = useQuery({
    queryKey: ["onboardingSession", sessionId],
    queryFn: () => base44.entities.OnboardingSession.filter({ id: sessionId }).then(r => r[0]),
    enabled: !!sessionId,
  });

  const isLoading = sessionId ? directLoading : sessionsLoading;
  const activeSession = sessionId ? directSession : (sessions.find(s => s.status !== "implementation") || sessions[0]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!activeSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 p-6">
        <div className="max-w-4xl mx-auto mt-20">
          <div className="text-center p-12 bg-card rounded-xl shadow-lg">
            <AlertCircle className="h-16 w-16 text-warning mx-auto mb-4" />
            <h1 className="text-3xl font-display mb-4">Welcome to Your Onboarding Portal</h1>
            <p className="text-muted-foreground mb-6">
              Your onboarding session will be started by our team. Please check back soon or contact your account manager.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const getProgressPercentage = () => {
    const stages = ["discovery", "analysis", "proposal", "review", "approved"];
    const currentIndex = stages.indexOf(activeSession.status);
    return ((currentIndex + 1) / stages.length) * 100;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="border-b bg-card shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-display text-primary">Onboarding Portal</h1>
              <p className="text-sm text-muted-foreground">Welcome back, {currentUser?.full_name}</p>
            </div>
            <Badge variant={activeSession.status === "approved" ? "default" : "secondary"} className="text-sm">
              {activeSession.status.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Overall Progress</span>
              <span>{Math.round(getProgressPercentage())}%</span>
            </div>
            <Progress value={getProgressPercentage()} className="h-2" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid grid-cols-6 w-full">
            <TabsTrigger value="overview" className="gap-2">
              <FileText className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="documents" className="gap-2">
              <Upload className="h-4 w-4" />
              Documents
            </TabsTrigger>
            <TabsTrigger value="technical" className="gap-2">
              <FileText className="h-4 w-4" />
              Tech Docs
            </TabsTrigger>
            <TabsTrigger value="chat" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              AI Assistant
            </TabsTrigger>
            <TabsTrigger value="tasks" className="gap-2">
              <CheckSquare className="h-4 w-4" />
              Tasks
            </TabsTrigger>
            <TabsTrigger value="contracts" className="gap-2">
              <FileSignature className="h-4 w-4" />
              Contracts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <PortalOverview session={activeSession} />
          </TabsContent>

          <TabsContent value="documents">
            <DocumentManager sessionId={activeSession.id} />
          </TabsContent>

          <TabsContent value="technical">
            <TechnicalDocs session={activeSession} />
          </TabsContent>

          <TabsContent value="chat">
            <AIKnowledgeChat sessionId={activeSession.id} />
          </TabsContent>

          <TabsContent value="tasks">
            <TaskManager sessionId={activeSession.id} currentUser={currentUser} />
          </TabsContent>

          <TabsContent value="contracts">
            <ContractApprovalFlow sessionId={activeSession.id} currentUser={currentUser} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}