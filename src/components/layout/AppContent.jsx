import { AppBreadcrumb } from "./AppBreadcrumb";
import { useLocation } from "react-router-dom";

export function AppContent({ children, navItems = [] }) {
  const location = useLocation();

  return (
    <main className="flex-1 overflow-y-auto bg-card rounded-xl border border-border shadow-sm">
      <div className="sticky top-0 z-20 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 border-b border-border rounded-t-xl">
        <div className="px-4 py-3 md:px-6">
          <AppBreadcrumb organizedNavigation={navItems} />
        </div>
      </div>
      <div className="px-4 py-6 md:px-6 md:py-8">
        {children}
      </div>
    </main>
  );
}