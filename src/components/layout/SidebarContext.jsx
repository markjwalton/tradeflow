import React, { createContext, useContext, useState, useMemo, useEffect } from "react";
import { base44 } from "@/api/base44Client";

const SidebarContext = createContext(null);

export function SidebarProvider({ children }) {
  const [mode, setMode] = useState("expanded");

  useEffect(() => {
    const loadPageNavigationMode = async () => {
      try {
        const pageName = window.location.pathname.split('/').pop() || 'Dashboard';
        const pages = await base44.entities.UIPage.filter({ slug: pageName });
        
        if (pages.length > 0 && pages[0].navigation_mode) {
          setMode(pages[0].navigation_mode);
        } else {
          // Fallback to site-wide default if page has no specific setting
          const user = await base44.auth.me();
          if (user?.site_settings?.defaultNavigationMode) {
            setMode(user.site_settings.defaultNavigationMode);
          }
        }
      } catch (e) {
        console.error("Failed to load navigation mode:", e);
      }
    };

    loadPageNavigationMode();

    const handlePageChange = () => {
      loadPageNavigationMode();
    };

    const handlePageSettingsSaved = (event) => {
      if (event.detail?.navigationMode) {
        setMode(event.detail.navigationMode);
      }
    };

    window.addEventListener('popstate', handlePageChange);
    window.addEventListener('page-settings-saved', handlePageSettingsSaved);
    
    return () => {
      window.removeEventListener('popstate', handlePageChange);
      window.removeEventListener('page-settings-saved', handlePageSettingsSaved);
    };
  }, []);

  const cycleMode = () => {
    setMode((prev) =>
      prev === "expanded" ? "icons" : prev === "icons" ? "hidden" : "expanded"
    );
  };

  const value = useMemo(
    () => ({
      mode,
      setMode,
      cycleMode,
      isExpanded: mode === "expanded",
      isIconsOnly: mode === "icons",
      isHidden: mode === "hidden",
    }),
    [mode]
  );

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  );
}

export function useAppSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error("useAppSidebar must be used within SidebarProvider");
  return ctx;
}