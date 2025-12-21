import { AppHeader } from "./AppHeader";
import { AppSidebar } from "./AppSidebar";
import { AppFooter } from "./AppFooter";
import { AppContent } from "./AppContent";
import { MobileNav } from "./MobileNav";
import { useState } from "react";

export function AppShell({ children, user, tenant, navItems = [], currentPageName, onEditorToggle }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-background)]">
      {/* Header - always visible */}
      <AppHeader 
        user={user} 
        navItems={navItems}
        onMobileMenuClick={() => setMobileNavOpen(true)}
        currentPageName={currentPageName}
      />

      {/* Mobile Navigation Drawer */}
      <MobileNav 
        isOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        navItems={navItems}
        user={user}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 gap-0 md:gap-4 px-0 md:px-4 pt-0 md:pt-4 pb-0 md:pb-4">
        {/* Desktop Sidebar - hidden on mobile */}
        <AppSidebar navItems={navItems} onEditorToggle={onEditorToggle} />
        
        {/* Page Content - full width on mobile */}
        <div className="flex-1 flex flex-col overflow-hidden md:rounded-xl min-w-0 bg-card md:bg-transparent">
          <AppContent navItems={navItems} currentPageName={currentPageName}>{children}</AppContent>
        </div>
      </div>

      {/* Footer - hidden on mobile for more content space */}
      <div className="hidden md:block">
        <AppFooter tenant={tenant} />
      </div>
    </div>
  );
}