import React from "react";
import { ClientSidebar } from "./ClientSidebar";
import { ClientHeader } from "./ClientHeader";
import { ClientFooter } from "./ClientFooter";

export function ClientAppShell({ children, session, currentUser, currentPath }) {
  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-50">
      <ClientSidebar currentPath={currentPath} sessionId={session.id} />
      
      <div className="flex min-h-screen flex-1 flex-col border-l border-slate-800 bg-slate-950/80">
        <ClientHeader session={session} currentUser={currentUser} />
        
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
        
        <ClientFooter status={session.status} />
      </div>
    </div>
  );
}