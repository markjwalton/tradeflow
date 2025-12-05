import React from "react";
import ComponentShowcase from "./ComponentShowcase";

export default function NavigationShowcase() {
  React.useEffect(() => {
    const url = new URL(window.location);
    url.searchParams.set("tab", "navigation");
    window.history.replaceState({}, "", url);
  }, []);

  return <ComponentShowcase />;
}