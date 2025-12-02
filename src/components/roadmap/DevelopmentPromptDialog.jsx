import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Sparkles, Copy, Code } from "lucide-react";
import { toast } from "sonner";

export default function DevelopmentPromptDialog({ isOpen, onClose, item, journalEntries = [] }) {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const generateDevPrompt = async () => {
    setIsGenerating(true);
    try {
      const journalContext = journalEntries.length > 0 
        ? journalEntries.map(e => `[${e.entry_type}] ${e.content}`).join("\n\n")
        : "No journal entries";

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are helping structure a development task for an AI coding assistant.

Roadmap Item: "${item.title}"
Description: ${item.description || "No description provided"}
Category: ${item.category}
Priority: ${item.priority}
Target Phase: ${item.target_phase || "Not specified"}

Journal History:
${journalContext}

Generate a comprehensive, well-structured development prompt that can be pasted into an AI coding assistant chat. The prompt should:

1. Start with clear context about the project/feature
2. List specific requirements and acceptance criteria
3. Reference any decisions or insights from the journal
4. Include technical considerations if mentioned
5. Specify what deliverables are expected
6. Be actionable and ready to implement

Format the prompt clearly with sections. Output only the prompt text.`
      });
      
      setPrompt(result);
    } catch (error) {
      toast.error("Failed to generate prompt");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(prompt);
    toast.success("Prompt copied to clipboard");
  };

  if (!item) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Development Prompt: {item.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Button onClick={generateDevPrompt} disabled={isGenerating} className="w-full">
            {isGenerating ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            Generate Development Prompt
          </Button>

          {prompt && (
            <>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={15}
                className="font-mono text-sm"
              />
              <Button onClick={copyToClipboard} variant="outline" className="w-full">
                <Copy className="h-4 w-4 mr-2" />
                Copy to Clipboard
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}