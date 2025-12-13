import { AppBreadcrumb } from "./AppBreadcrumb";
import { useLocation } from "react-router-dom";

export function AppContent({ children, navItems = [] }) {
  const location = useLocation();

  return (
    <main className="flex-1 overflow-y-auto px-4 md:px-6">
      {children}
    </main>
  );
}