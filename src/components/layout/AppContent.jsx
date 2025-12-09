import { AppBreadcrumb } from "./AppBreadcrumb";
import { useLocation } from "react-router-dom";

export function AppContent({ children, navItems = [] }) {
  const location = useLocation();
  const currentPage = location.pathname.split("/").pop();
  const showBreadcrumbs = currentPage !== ""; // Always show breadcrumbs except empty path

  return (
    <main className="flex-1 overflow-y-auto">
      {showBreadcrumbs && (
        <div className="px-4 pt-4 pb-2 md:px-8">
          <AppBreadcrumb organizedNavigation={navItems} />
        </div>
      )}
      <div className="px-4 py-6 md:px-8 md:py-8">
        {children}
      </div>
    </main>
  );
}