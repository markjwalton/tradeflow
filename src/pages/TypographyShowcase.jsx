import React from "react";
import ComponentShowcase from "./ComponentShowcase";

export default function TypographyShowcase() {
  React.useEffect(() => {
    const url = new URL(window.location);
    url.searchParams.set("tab", "typography");
    window.history.replaceState({}, "", url);
  }, []);

  return <ComponentShowcase />;
}