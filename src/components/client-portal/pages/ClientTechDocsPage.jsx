import React from "react";
import { Database, Layout, Zap, FileCode } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createPageUrl } from "@/utils";

export function ClientTechDocsPage({ sessionId }) {
  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-base font-semibold text-slate-50">Technical Documentation</h1>
        <p className="mt-1 text-xs text-slate-400">
          Review architecture, specifications, and implementation details
        </p>
      </section>

      <div className="grid gap-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Database className="h-5 w-5 text-emerald-400" />
              <h2 className="text-sm font-semibold text-slate-100">System Architecture</h2>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <a href={createPageUrl("OnboardingSpecifications") + `?session=${sessionId}`} target="_blank">
                View Specs
              </a>
            </Button>
          </div>
          <p className="text-xs text-slate-400 mb-3">
            Complete technical specifications including entities, pages, and features
          </p>
          <div className="flex gap-2 flex-wrap">
            <Badge variant="outline" className="text-xs"><Database className="h-3 w-3 mr-1" />Entities</Badge>
            <Badge variant="outline" className="text-xs"><Layout className="h-3 w-3 mr-1" />Pages</Badge>
            <Badge variant="outline" className="text-xs"><Zap className="h-3 w-3 mr-1" />Features</Badge>
            <Badge variant="outline" className="text-xs"><FileCode className="h-3 w-3 mr-1" />Integrations</Badge>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
          <h2 className="text-sm font-semibold text-slate-100 mb-3">Implementation Phases</h2>
          <div className="space-y-2">
            {["Data models and entities", "Core pages and navigation", "Business logic", "Integrations", "Testing"].map((phase, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs">
                <Badge className="text-xs">Phase {idx + 1}</Badge>
                <span className="text-slate-400">{phase}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
          <h2 className="text-sm font-semibold text-slate-100 mb-3">Technical Recommendations</h2>
          <div className="space-y-2 text-xs text-slate-400">
            <div className="flex items-start gap-2">
              <span className="text-emerald-400">•</span>
              <p>Database indexing for optimal performance</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-emerald-400">•</span>
              <p>Caching strategies for read-heavy operations</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-emerald-400">•</span>
              <p>Progressive Web App support for mobile</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-emerald-400">•</span>
              <p>Automated backups and disaster recovery</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}