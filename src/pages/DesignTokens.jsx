import React from "react";
import ComponentShowcase from "./ComponentShowcase";

export default function DesignTokens() {
  // Set the tab param for the shared component
  React.useEffect(() => {
    const url = new URL(window.location);
    url.searchParams.set("tab", "tokens");
    window.history.replaceState({}, "", url);
  }, []);

  return <ComponentShowcase />;
}