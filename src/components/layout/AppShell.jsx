import { AppHeader } from "./AppHeader";
import { AppSidebar } from "./AppSidebar";
import { AppFooter } from "./AppFooter";
import { AppContent } from "./AppContent";
import { MobileNav } from "./MobileNav";
import { useState } from "react";

export function AppShell({ children, user, tenant, navItems = [], currentPageName, onEditorToggle }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // AppSidebar builds its own hierarchy from flat items
  // Just pass the flat array directly
  
  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-background)]">
      <AppHeader 
        user={user} 
        navItems={navItems}
        onMobileMenuClick={() => setMobileNavOpen(true)}
        currentPageName={currentPageName}
      />

      <MobileNav 
        isOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        navItems={navItems}
      />

      <div className="flex flex-1 gap-4 pl-2 sm:pl-4 pr-2 sm:pr-4 pt-2 sm:pt-4 pb-2 sm:pb-4">
        <AppSidebar navItems={navItems} onEditorToggle={onEditorToggle} />
        <div className="flex-1 flex flex-col overflow-hidden rounded-xl">
          <AppContent navItems={navItems} currentPageName={currentPageName}>{children}</AppContent>
        </div>
      </div>

      <AppFooter tenant={tenant} />
    </div>
  );
}