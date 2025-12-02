import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import AIInputAssistant from "./AIInputAssistant";

export default function AIInputTrigger({
  onApply,
  contextType = "general",
  fieldLabel = "Input",
  currentValue = "",
  className = ""
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={`h-8 w-8 text-purple-600 hover:text-purple-700 hover:bg-purple-50 ${className}`}
        onClick={() => setIsOpen(true)}
        title="AI Input Assistant"
      >
        <Sparkles className="h-4 w-4" />
      </Button>

      <AIInputAssistant
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onApply={onApply}
        contextType={contextType}
        fieldLabel={fieldLabel}
        currentValue={currentValue}
      />
    </>
  );
}