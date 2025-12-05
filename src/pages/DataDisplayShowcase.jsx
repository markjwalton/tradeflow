import React from "react";
import ComponentShowcase from "./ComponentShowcase";

export default function DataDisplayShowcase() {
  React.useEffect(() => {
    const url = new URL(window.location);
    url.searchParams.set("tab", "data");
    window.history.replaceState({}, "", url);
  }, []);

  return <ComponentShowcase />;
}