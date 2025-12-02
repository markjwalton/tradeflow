import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sparkles, BookOpen, Mic } from "lucide-react";
import AIInputAssistant from "./AIInputAssistant";
import ChatHighlightCapture from "./ChatHighlightCapture";

export default function GlobalAIAssistant() {
  const [isInputOpen, setIsInputOpen] = useState(false);
  const [isCaptureOpen, setIsCaptureOpen] = useState(false);
  const [lastOutput, setLastOutput] = useState("");

  const handleApply = (text) => {
    setLastOutput(text);
    navigator.clipboard.writeText(text);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-purple-600 hover:bg-purple-700 z-50"
            size="icon"
          >
            <Sparkles className="h-6 w-6" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="mb-2">
          <DropdownMenuItem onClick={() => setIsInputOpen(true)}>
            <Mic className="h-4 w-4 mr-2" />
            Voice Input
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setIsCaptureOpen(true)}>
            <BookOpen className="h-4 w-4 mr-2" />
            Capture Chat Highlights
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AIInputAssistant
        isOpen={isInputOpen}
        onClose={() => setIsInputOpen(false)}
        onApply={handleApply}
        contextType="general"
        fieldLabel="General Input (copied to clipboard)"
        currentValue=""
      />

      <ChatHighlightCapture
        isOpen={isCaptureOpen}
        onClose={() => setIsCaptureOpen(false)}
      />
    </>
  );
}