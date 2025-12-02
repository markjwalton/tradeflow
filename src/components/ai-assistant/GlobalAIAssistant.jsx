import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import AIInputAssistant from "./AIInputAssistant";

export default function GlobalAIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [lastOutput, setLastOutput] = useState("");

  const handleApply = (text) => {
    setLastOutput(text);
    // Copy to clipboard for easy pasting
    navigator.clipboard.writeText(text);
  };

  return (
    <>
      {/* Floating Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-purple-600 hover:bg-purple-700 z-50"
        size="icon"
      >
        <Sparkles className="h-6 w-6" />
      </Button>

      <AIInputAssistant
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onApply={handleApply}
        contextType="general"
        fieldLabel="General Input (copied to clipboard)"
        currentValue=""
      />
    </>
  );
}