import React from "react";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

const statusOrder = [
  "discovery",
  "analysis",
  "proposal",
  "review",
  "approved",
  "implementation",
];

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

export function ClientHeader({ session, currentUser }) {
  const progress = computeProgress(session.status);

  return (
    <header className="sticky top-0 z-20 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-semibold text-slate-50">
              {session.tenant_id}
            </h1>
            <Badge variant="outline" className="border-emerald-500 text-emerald-400">
              {statusLabel[session.status] || session.status}
            </Badge>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Welcome back, {currentUser?.full_name || "Guest"}
          </p>
        </div>
        <div className="hidden items-center gap-3 sm:flex">
          <span className="text-xs text-slate-400">
            Progress: {Math.round(progress)}%
          </span>
        </div>
      </div>
      <Separator className="border-slate-800" />
      <div className="mx-auto max-w-7xl px-4 pb-3 sm:px-6 lg:px-8">
        <Progress value={progress} className="h-1 bg-slate-900" />
      </div>
    </header>
  );
}