import React, { createContext, useContext, useState, useMemo, useEffect } from "react";
import { base44 } from "@/api/base44Client";

const SidebarContext = createContext(null);

export function SidebarProvider({ children }) {
  const [mode, setMode] = useState("expanded");

  useEffect(() => {
    const loadDefaultMode = async () => {
      try {
        const user = await base44.auth.me();
        if (user?.site_settings?.defaultNavigationMode) {
          setMode(user.site_settings.defaultNavigationMode);
        }
      } catch (e) {
        // User not logged in - use default
      }
    };

    loadDefaultMode();

    const handleSiteSettingsChange = (event) => {
      if (event.detail.defaultNavigationMode) {
        setMode(event.detail.defaultNavigationMode);
      }
    };

    window.addEventListener('site-settings-changed', handleSiteSettingsChange);
    return () => window.removeEventListener('site-settings-changed', handleSiteSettingsChange);
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