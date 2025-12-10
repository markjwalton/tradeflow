import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Loader2, AlertCircle } from "lucide-react";

import { ClientAppShell } from "@/components/client-portal/ClientAppShell";
import { ClientOverviewPage } from "@/components/client-portal/pages/ClientOverviewPage";
import { ClientDocumentsPage } from "@/components/client-portal/pages/ClientDocumentsPage";
import { ClientTechDocsPage } from "@/components/client-portal/pages/ClientTechDocsPage";
import { ClientAiAssistantPage } from "@/components/client-portal/pages/ClientAiAssistantPage";
import { ClientTasksPage } from "@/components/client-portal/pages/ClientTasksPage";
import { ClientContractsPage } from "@/components/client-portal/pages/ClientContractsPage";

export default function ClientOnboardingPortal() {
  const location = useLocation();
  const urlParams = new URLSearchParams(window.location.search);
  const sessionId = urlParams.get("session");
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => {});
  }, []);

  const { data: session, isLoading } = useQuery({
    queryKey: ["clientSession", sessionId],
    queryFn: () => base44.entities.OnboardingSession.filter({ id: sessionId }).then(r => r[0]),
    enabled: !!sessionId,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
      </div>
    );
  }

  if (!sessionId || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 p-6">
        <div className="max-w-md text-center">
          <AlertCircle className="mx-auto mb-4 h-16 w-16 text-amber-400" />
          <h1 className="mb-2 text-2xl font-semibold text-slate-50">Welcome</h1>
          <p className="text-sm text-slate-400">
            Your onboarding session will be started by our team. Please check back soon.
          </p>
        </div>
      </div>
    );
  }

  const basePath = "/client-portal";

  return (
    <ClientAppShell session={session} currentUser={currentUser} currentPath={location.pathname}>
      <Routes>
        <Route path="/" element={<Navigate to={`${basePath}/overview?session=${sessionId}`} replace />} />
        <Route path="/overview" element={<ClientOverviewPage session={session} />} />
        <Route path="/documents" element={<ClientDocumentsPage sessionId={session.id} currentUser={currentUser} />} />
        <Route path="/tech-docs" element={<ClientTechDocsPage sessionId={session.id} />} />
        <Route path="/ai-assistant" element={<ClientAiAssistantPage sessionId={session.id} />} />
        <Route path="/tasks" element={<ClientTasksPage sessionId={session.id} currentUser={currentUser} />} />
        <Route path="/contracts" element={<ClientContractsPage sessionId={session.id} currentUser={currentUser} />} />
      </Routes>
    </ClientAppShell>
  );
}