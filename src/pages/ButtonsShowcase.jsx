import React from "react";
import ComponentShowcase from "./ComponentShowcase";

export default function ButtonsShowcase() {
  React.useEffect(() => {
    const url = new URL(window.location);
    url.searchParams.set("tab", "buttons");
    window.history.replaceState({}, "", url);
  }, []);

  return <ComponentShowcase />;
}