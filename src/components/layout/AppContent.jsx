import { AppBreadcrumb } from "./AppBreadcrumb";
import { useLocation } from "react-router-dom";
import { createContext, useContext } from "react";

const BreadcrumbContext = createContext(null);

export function AppContent({ children, navItems = [], currentPageName }) {
  return (
    <BreadcrumbContext.Provider value={{ navItems, currentPageName }}>
      <main className="flex-1 overflow-y-auto px-4 sm:px-5 md:px-6 py-4 sm:py-5 md:py-6">
        {children}
      </main>
    </BreadcrumbContext.Provider>
  );
}

export function useBreadcrumb() {
  return useContext(BreadcrumbContext);
}