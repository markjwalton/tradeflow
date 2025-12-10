import React from "react";
import { Link } from "react-router-dom";
import { clientNav } from "./navConfig";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export function ClientSidebar({ currentPath, sessionId }) {
  return (
    <aside className="hidden w-64 border-r border-slate-800 bg-slate-950/90 p-4 md:flex md:flex-col">
      <div className="mb-6 flex items-center gap-2">
        <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-emerald-400 to-sky-500" />
        <div>
          <div className="text-sm font-semibold tracking-tight">Trade-Flow</div>
          <div className="text-xs text-slate-400">Tenant Onboarding</div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <nav className="space-y-1">
          {clientNav.map((item) => {
            const Icon = item.icon;
            const active = currentPath.startsWith(item.path);
            const href = `${item.path}?session=${sessionId}`;

            return (
              <Link
                key={item.key}
                to={href}
                className={cn(
                  "flex items-center gap-2 rounded-md px-2 py-2 text-sm transition",
                  active
                    ? "bg-slate-800 text-slate-50"
                    : "text-slate-400 hover:bg-slate-900 hover:text-slate-100"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      <div className="mt-4 border-t border-slate-800 pt-3 text-xs text-slate-500">
        Need help? Contact support.
      </div>
    </aside>
  );
}