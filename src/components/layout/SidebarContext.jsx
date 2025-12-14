import React, { createContext, useContext, useState, useMemo, useEffect } from "react";
import { base44 } from "@/api/base44Client";

const SidebarContext = createContext(null);

export function SidebarProvider({ children }) {
  const [mode, setMode] = useState("expanded");

  useEffect(() => {
    const loadInitialNavigationMode = async () => {
      try {
        const user = await base44.auth.me();
        if (user?.site_settings?.defaultNavigationMode) {
          setMode(user.site_settings.defaultNavigationMode);
        }
      } catch (e) {
        console.error("Failed to load navigation mode:", e);
      }
    };

    loadInitialNavigationMode();

    const handlePageSettingsSaved = (event) => {
      if (event.detail?.navigationMode) {
        setMode(event.detail.navigationMode);
      }
    };

    window.addEventListener('page-settings-saved', handlePageSettingsSaved);
    
    return () => {
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