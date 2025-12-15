import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sparkles, BookOpen, Mic, Zap } from "lucide-react";
import AIInputAssistant from "./AIInputAssistant";
import ChatHighlightCapture from "./ChatHighlightCapture";
import QuickCapture from "./QuickCapture";

import { toast } from "sonner";

export default function GlobalAIAssistant() {
  const [isInputOpen, setIsInputOpen] = useState(false);
  const [isCaptureOpen, setIsCaptureOpen] = useState(false);
  const [isQuickCaptureOpen, setIsQuickCaptureOpen] = useState(false);
  const [lastOutput, setLastOutput] = useState("");
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const handlePreferencesChange = (event) => {
      setIsVisible(event.detail.showAIAssistant ?? true);
    };

    const loadPreferences = async () => {
      try {
        const { base44 } = await import("@/api/base44Client");
        const user = await base44.auth.me();
        if (user?.ui_preferences?.showAIAssistant !== undefined) {
          setIsVisible(user.ui_preferences.showAIAssistant);
        }
      } catch (e) {
        // User not logged in or error - show by default
      }
    };

    loadPreferences();
    window.addEventListener('ui-preferences-changed', handlePreferencesChange);
    return () => window.removeEventListener('ui-preferences-changed', handlePreferencesChange);
  }, []);

  // Reminder timer every 10 minutes
  useEffect(() => {
    const showReminder = () => {
      toast("📝 Capture Reminder", {
        description: "Time to save any chat highlights to your journal!",
        action: {
          label: "Quick Capture",
          onClick: () => setIsQuickCaptureOpen(true)
        },
        duration: 15000
      });
    };

    // Show first reminder after 10 minutes, then every 10 minutes
    const initialTimeout = setTimeout(() => {
      showReminder();
    }, 10 * 60 * 1000);

    const interval = setInterval(showReminder, 10 * 60 * 1000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, []);

  const handleApply = (text) => {
    setLastOutput(text);
    navigator.clipboard.writeText(text);
  };

  if (!isVisible) return null;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-2xl border-2 border-white"
            style={{ zIndex: 1050, backgroundColor: 'rgba(185, 150, 119, 0.9)' }}
            size="icon"
          >
            <Sparkles className="h-6 w-6 text-white" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="mb-2">
          <DropdownMenuItem onClick={() => setIsQuickCaptureOpen(true)}>
            <Zap className="h-4 w-4 mr-2" />
            Quick Capture
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setIsCaptureOpen(true)}>
            <BookOpen className="h-4 w-4 mr-2" />
            AI Chat Analysis
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setIsInputOpen(true)}>
            <Mic className="h-4 w-4 mr-2" />
            Voice Input
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

      <QuickCapture
        isOpen={isQuickCaptureOpen}
        onClose={() => setIsQuickCaptureOpen(false)}
      />
    </>
  );
}