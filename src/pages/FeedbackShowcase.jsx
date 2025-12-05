import React from "react";
import ComponentShowcase from "./ComponentShowcase";

export default function FeedbackShowcase() {
  React.useEffect(() => {
    const url = new URL(window.location);
    url.searchParams.set("tab", "feedback");
    window.history.replaceState({}, "", url);
  }, []);

  return <ComponentShowcase />;
}