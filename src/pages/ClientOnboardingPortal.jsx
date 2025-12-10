import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Loader2, AlertCircle, Menu, X, ChevronDown } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

import { clientNav } from "@/components/client-portal/navConfig";
import { ClientOverviewPage } from "@/components/client-portal/pages/ClientOverviewPage";
import { ClientDocumentsPage } from "@/components/client-portal/pages/ClientDocumentsPage";
import { ClientTechDocsPage } from "@/components/client-portal/pages/ClientTechDocsPage";
import { ClientAiAssistantPage } from "@/components/client-portal/pages/ClientAiAssistantPage";
import { ClientTasksPage } from "@/components/client-portal/pages/ClientTasksPage";
import { ClientContractsPage } from "@/components/client-portal/pages/ClientContractsPage";

const statusOrder = ["discovery", "analysis", "proposal", "review", "approved", "implementation"];
const statusLabel = {
  discovery: "Discovery",
  analysis: "Analysis",
  proposal: "Proposal",
  review: "Review",
  approved: "Approved",
  implementation: "Implementation",
};

function computeProgress(status) {
  const idx = statusOrder.indexOf(status);
  if (idx === -1) return 0;
  return ((idx + 1) / statusOrder.length) * 100;
}

export default function ClientOnboardingPortal() {
  const urlParams = new URLSearchParams(window.location.search);
  const sessionId = urlParams.get("session");
  const hash = window.location.hash.replace('#', '') || 'overview';
  
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState(hash);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => {});
  }, []);

  useEffect(() => {
    setActiveTab(hash);
  }, [hash]);

  const { data: session, isLoading } = useQuery({
    queryKey: ["clientSession", sessionId],
    queryFn: () => base44.entities.OnboardingSession.filter({ id: sessionId }).then(r => r[0]),
    enabled: !!sessionId,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!sessionId || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white p-6">
        <div className="max-w-md text-center">
          <AlertCircle className="mx-auto mb-4 h-16 w-16 text-amber-500" />
          <h1 className="mb-2 text-2xl font-semibold text-slate-900">Welcome to Your Onboarding Portal</h1>
          <p className="text-sm text-slate-600">
            Your onboarding session will be started by our team. Please check back soon or contact your account manager.
          </p>
        </div>
      </div>
    );
  }

  const progress = computeProgress(session.status);

  const renderContent = () => {
    switch(activeTab) {
      case 'documents': return <ClientDocumentsPage sessionId={session.id} currentUser={currentUser} />;
      case 'tech-docs': return <ClientTechDocsPage sessionId={session.id} />;
      case 'ai-assistant': return <ClientAiAssistantPage sessionId={session.id} />;
      case 'tasks': return <ClientTasksPage sessionId={session.id} currentUser={currentUser} />;
      case 'contracts': return <ClientContractsPage sessionId={session.id} currentUser={currentUser} />;
      default: return <ClientOverviewPage session={session} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 transform bg-slate-900 transition-transform lg:relative lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-full flex-col">
          {/* Logo area */}
          <div className="flex h-20 items-center justify-between px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-white/10">
                <span className="text-base font-bold text-white">TF</span>
              </div>
              <div>
                <div className="text-base font-semibold text-white">Trade-Flow</div>
                <div className="text-xs text-slate-400">Onboarding Portal</div>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="lg:hidden text-white" onClick={() => setSidebarOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 px-4 py-6">
            <nav className="space-y-1">
              {clientNav.map((item) => {
                const Icon = item.icon;
                const active = activeTab === item.key;

                return (
                  <a
                    key={item.key}
                    href={`#${item.key}`}
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveTab(item.key);
                      window.location.hash = item.key;
                      setSidebarOpen(false);
                    }}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-4 py-3 text-sm font-medium transition-all",
                      active
                        ? "bg-white/10 text-white"
                        : "text-slate-400 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </a>
                );
              })}
            </nav>
          </ScrollArea>

          {/* Footer help */}
          <div className="border-t border-slate-800 p-6">
            <div className="rounded-md bg-slate-800 p-4">
              <p className="text-xs font-semibold text-white">Need assistance?</p>
              <p className="mt-2 text-xs text-slate-400">Reach out to your dedicated account manager for support.</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/80 lg:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex min-h-screen flex-1 flex-col bg-white">
        {/* Header */}
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
          <div className="flex h-16 items-center justify-between px-6 lg:px-10">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon" 
                className="lg:hidden" 
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-base font-semibold text-slate-900">{session.tenant_id}</h1>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge variant="outline" className="text-xs border-slate-300">
                    {statusLabel[session.status] || session.status}
                  </Badge>
                  <span className="text-xs text-slate-500">
                    {Math.round(progress)}% complete
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-xs text-slate-600">
                {currentUser?.full_name || "Guest"}
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-1 bg-slate-100">
            <div 
              className="h-full bg-slate-900 transition-all" 
              style={{ width: `${progress}%` }}
            />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-6xl px-6 py-10 lg:px-10">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}