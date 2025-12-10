import React from "react";
import { Button } from "@/components/ui/button";

export function ClientFooter({ status }) {
  return (
    <footer className="border-t border-slate-800 bg-slate-950/90">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 text-xs text-slate-400 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <span className="font-medium text-slate-200">Stage:</span>
          <span className="uppercase tracking-wide text-slate-400">
            {status}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span>Need to move to the next stage?</span>
          <Button size="sm" variant="outline">
            Contact onboarding
          </Button>
        </div>
      </div>
    </footer>
  );
}