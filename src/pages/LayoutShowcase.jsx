import React from "react";
import ComponentShowcase from "./ComponentShowcase";

export default function LayoutShowcase() {
  React.useEffect(() => {
    const url = new URL(window.location);
    url.searchParams.set("tab", "layout");
    window.history.replaceState({}, "", url);
  }, []);

  return <ComponentShowcase />;
}