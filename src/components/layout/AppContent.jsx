import { AppBreadcrumb } from "./AppBreadcrumb";

export function AppContent({ children, navItems = [] }) {
  return (
    <main className="flex-1 overflow-y-auto">
      <div className="px-4 py-6 md:px-8 md:py-8">
        <AppBreadcrumb organizedNavigation={navItems} />
        {children}
      </div>
    </main>
  );
}