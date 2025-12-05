import React from "react";
import ComponentShowcase from "./ComponentShowcase";

export default function CardsShowcase() {
  React.useEffect(() => {
    const url = new URL(window.location);
    url.searchParams.set("tab", "cards");
    window.history.replaceState({}, "", url);
  }, []);

  return <ComponentShowcase />;
}