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
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 transform border-r border-slate-200 bg-white transition-transform lg:relative lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-full flex-col">
          {/* Logo area */}
          <div className="flex h-16 items-center justify-between border-b border-slate-200 px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-slate-900 to-slate-700">
                <span className="text-sm font-bold text-white">TF</span>
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900">Trade-Flow</div>
                <div className="text-xs text-slate-500">Onboarding</div>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(false)}>
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
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      active
                        ? "bg-slate-100 text-slate-900"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
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
          <div className="border-t border-slate-200 p-4">
            <div className="rounded-lg bg-slate-50 p-3">
              <p className="text-xs font-medium text-slate-900">Need help?</p>
              <p className="mt-1 text-xs text-slate-600">Contact your account manager</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/50 lg:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex min-h-screen flex-1 flex-col">
        {/* Header */}
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur-sm">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
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
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-semibold text-slate-900">{session.tenant_id}</h1>
                  <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100">
                    {statusLabel[session.status] || session.status}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500">
                  Welcome back, {currentUser?.full_name || "Guest"}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden items-center gap-2 sm:flex">
                <span className="text-xs text-slate-500">Progress:</span>
                <span className="text-xs font-medium text-slate-900">{Math.round(progress)}%</span>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="px-4 pb-3 sm:px-6 lg:px-8">
            <Progress value={progress} className="h-1" />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-slate-50">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            {renderContent()}
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-200 bg-white">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="font-medium text-slate-700">Current Stage:</span>
              <span className="uppercase tracking-wide">{session.status}</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span>Questions about next steps?</span>
              <Button size="sm" variant="outline">
                Contact Support
              </Button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}