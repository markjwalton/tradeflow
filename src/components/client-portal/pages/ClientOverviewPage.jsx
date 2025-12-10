import React from "react";
import { CheckCircle, Clock, Circle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function ClientOverviewPage({ session }) {
  const milestones = [
    { 
      key: "discovery", 
      label: "Discovery Phase", 
      description: "Initial consultation and requirements gathering",
      completed: ["analysis", "proposal", "review", "approved"].includes(session.status)
    },
    { 
      key: "analysis", 
      label: "Analysis & Design", 
      description: "Solution architecture and technical planning",
      completed: ["proposal", "review", "approved"].includes(session.status)
    },
    { 
      key: "proposal", 
      label: "Proposal Review", 
      description: "Review and approve the proposed solution",
      completed: ["review", "approved"].includes(session.status)
    },
    { 
      key: "review", 
      label: "Contract & SLA", 
      description: "Legal agreements and service level definitions",
      completed: session.status === "approved"
    },
    { 
      key: "approved", 
      label: "Implementation", 
      description: "Development and deployment of your application",
      completed: false
    },
  ];

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-sm font-semibold text-slate-100">Onboarding milestones</h2>
        <p className="mt-1 text-xs text-slate-400">
          Track progress across discovery, analysis, proposal, review, and implementation.
        </p>
        <div className="mt-4 space-y-3">
          {milestones.map((milestone) => (
            <div
              key={milestone.key}
              className="flex items-start gap-4 rounded-xl border border-slate-800 bg-slate-900/40 p-4"
            >
              <div className="mt-1">
                {milestone.completed ? (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-950/40">
                    <CheckCircle className="h-4 w-4 text-emerald-400" />
                  </div>
                ) : session.status === milestone.key ? (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-800">
                    <Clock className="h-4 w-4 animate-pulse text-emerald-400" />
                  </div>
                ) : (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900">
                    <Circle className="h-4 w-4 text-slate-600" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-medium text-slate-100">{milestone.label}</h3>
                  {milestone.completed && (
                    <Badge className="bg-emerald-950/40 text-emerald-400 border-emerald-500/30">
                      Complete
                    </Badge>
                  )}
                  {session.status === milestone.key && (
                    <Badge className="border-emerald-500 text-emerald-400">Active</Badge>
                  )}
                </div>
                <p className="text-xs text-slate-400">{milestone.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {session.high_level_summary && (
        <section>
          <h2 className="text-sm font-semibold text-slate-100">Business summary</h2>
          <div className="mt-3 rounded-xl border border-slate-800 bg-slate-900/40 p-4 text-sm text-slate-200">
            <p className="whitespace-pre-wrap">{session.high_level_summary}</p>
          </div>
        </section>
      )}
    </div>
  );
}