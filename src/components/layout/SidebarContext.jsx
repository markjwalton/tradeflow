import React, { createContext, useContext, useState, useMemo } from "react";

const SidebarContext = createContext(null);

export function SidebarProvider({ children }) {
  const [mode, setMode] = useState("expanded");

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