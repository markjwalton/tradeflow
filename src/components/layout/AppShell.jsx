import { AppHeader } from "./AppHeader";
import { AppSidebar } from "./AppSidebar";
import { AppFooter } from "./AppFooter";
import { AppContent } from "./AppContent";

export function AppShell({ children, user, tenant, navItems = [] }) {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-background)]">
      <AppHeader user={user} navItems={navItems} />

      <div className="flex flex-1 overflow-hidden">
        <AppSidebar navItems={navItems} />
        <div className="flex-1 flex flex-col">
          <AppContent navItems={navItems}>{children}</AppContent>
        </div>
      </div>

      <AppFooter tenant={tenant} />
    </div>
  );
}