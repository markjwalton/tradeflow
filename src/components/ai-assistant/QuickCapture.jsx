import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Loader2, Brain, HelpCircle, Lightbulb, 
  MessageSquare, AlertTriangle, CheckCircle, Code,
  Zap, Save, Paperclip, X, FileText, Sparkles, ClipboardPaste
} from "lucide-react";
import { toast } from "sonner";

const entryTypes = [
  { value: "brainstorming", label: "Brainstorming", icon: Brain, color: "bg-[var(--color-accent)]/20 text-[var(--color-accent-dark)] border-[var(--color-accent)]/50" },
  { value: "question", label: "Question", icon: HelpCircle, color: "bg-[var(--color-info)]/20 text-[var(--color-info-dark)] border-[var(--color-info)]/50" },
  { value: "advice", label: "Advice", icon: MessageSquare, color: "bg-[var(--color-success)]/20 text-[var(--color-success-dark)] border-[var(--color-success)]/50" },
  { value: "idea", label: "Idea", icon: Lightbulb, color: "bg-[var(--color-warning)]/20 text-[var(--color-warning-dark)] border-[var(--color-warning)]/50" },
  { value: "decision", label: "Decision", icon: CheckCircle, color: "bg-[var(--color-primary)]/20 text-[var(--color-primary-dark)] border-[var(--color-primary)]/50" },
  { value: "update", label: "Update", icon: Code, color: "bg-[var(--color-charcoal)]/10 text-[var(--color-charcoal)] border-[var(--color-charcoal)]/30" },
  { value: "blocker", label: "Blocker", icon: AlertTriangle, color: "bg-[var(--color-destructive)]/20 text-[var(--color-destructive)] border-[var(--color-destructive)]/50" },
];

export default function QuickCapture({ isOpen, onClose }) {
  const queryClient = useQueryClient();
  const [content, setContent] = useState("");
  const [entryType, setEntryType] = useState("update");
  const [selectedRoadmapItem, setSelectedRoadmapItem] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isAICapturing, setIsAICapturing] = useState(false);

  // Remember last used roadmap item
  useEffect(() => {
    const lastItem = localStorage.getItem("quickCapture_lastRoadmapItem");
    if (lastItem) setSelectedRoadmapItem(lastItem);
  }, [isOpen]);

  const { data: roadmapItems = [] } = useQuery({
    queryKey: ["roadmapItems"],
    queryFn: () => base44.entities.RoadmapItem.list("-created_date"),
  });

  // Find or create "Live Chat Journal" item
  const liveJournalItem = roadmapItems.find(i => i.title === "Live Chat Journal" && i.category === "discussion_note");
  
  // Get focused item first, then starred items, then others (excluding hidden live journal from general list)
  const sortedItems = [...roadmapItems].sort((a, b) => {
    // Live Chat Journal always first
    if (a.title === "Live Chat Journal" && a.category === "discussion_note") return -1;
    if (b.title === "Live Chat Journal" && b.category === "discussion_note") return 1;
    if (a.is_focused && !b.is_focused) return -1;
    if (!a.is_focused && b.is_focused) return 1;
    if (a.is_starred && !b.is_starred) return -1;
    if (!a.is_starred && b.is_starred) return 1;
    return 0;
  });

  // Auto-create Live Chat Journal if it doesn't exist
  useEffect(() => {
    const createLiveJournal = async () => {
      if (isOpen && roadmapItems.length > 0 && !liveJournalItem) {
        try {
          await base44.entities.RoadmapItem.create({
            title: "Live Chat Journal",
            description: "Captures from live AI chat sessions - hidden from main roadmap",
            category: "discussion_note",
            priority: "medium",
            status: "on_hold",
            source: "user",
            tags: ["live-chat", "hidden"],
            is_starred: false,
            is_focused: false
          });
          queryClient.invalidateQueries({ queryKey: ["roadmapItems"] });
        } catch (e) {
          // Ignore if already exists
        }
      }
    };
    createLiveJournal();
  }, [isOpen, roadmapItems.length, liveJournalItem]);

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    setIsUploading(true);
    try {
      for (const file of files) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        setAttachments(prev => [...prev, {
          url: file_url,
          friendly_name: file.name.replace(/\.[^/.]+$/, ""),
          original_name: file.name
        }]);
      }
    } catch (error) {
      toast.error("Failed to upload file");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  // AI Capture from clipboard
  const handleAICapture = async () => {
    setIsAICapturing(true);
    try {
      // Read from clipboard
      const clipboardText = await navigator.clipboard.readText();
      
      if (!clipboardText.trim()) {
        toast.error("Clipboard is empty. Copy some chat content first!");
        setIsAICapturing(false);
        return;
      }

      // Use AI to analyze and summarize
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are analyzing content from a development chat session. Create a clear, concise journal entry from this content.

Content to analyze:
${clipboardText}

Instructions:
1. Determine the most appropriate type: brainstorming, question, advice, idea, decision, update, or blocker
2. Write a clear, actionable summary (2-4 sentences) that captures the key points
3. Focus on what was discussed, decided, or needs to be done

Return as JSON:
{
  "type": "brainstorming|question|advice|idea|decision|update|blocker",
  "content": "Clear summary of the key points..."
}`,
        response_json_schema: {
          type: "object",
          properties: {
            type: { type: "string" },
            content: { type: "string" }
          }
        }
      });

      setEntryType(result.type || "update");
      setContent(result.content || "");
      toast.success("AI captured and summarized from clipboard!");
    } catch (error) {
      if (error.name === "NotAllowedError") {
        toast.error("Clipboard access denied. Please allow clipboard access.");
      } else {
        toast.error("Failed to capture from clipboard");
      }
    } finally {
      setIsAICapturing(false);
    }
  };

  const handleSave = async () => {
    if (!content.trim()) {
      toast.error("Please enter content");
      return;
    }
    if (!selectedRoadmapItem) {
      toast.error("Please select a roadmap item");
      return;
    }

    setIsSaving(true);
    try {
      await base44.entities.RoadmapJournal.create({
        roadmap_item_id: selectedRoadmapItem,
        content: content.trim(),
        entry_type: entryType,
        entry_date: new Date().toISOString(),
        attachments: attachments.length > 0 ? attachments : null
      });

      localStorage.setItem("quickCapture_lastRoadmapItem", selectedRoadmapItem);
      queryClient.invalidateQueries({ queryKey: ["roadmapJournal"] });
      queryClient.invalidateQueries({ queryKey: ["allRoadmapJournals"] });
      toast.success("Saved to journal");
      setContent("");
      setAttachments([]);
      onClose();
    } catch (error) {
      toast.error("Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setContent("");
    setAttachments([]);
    onClose();
  };

  const selectedType = entryTypes.find(t => t.value === entryType);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-[var(--color-warning)]" />
            Quick Capture
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Roadmap Item Selector */}
          <div>
            <label className="text-sm font-medium mb-2 block text-[var(--color-midnight)]">Roadmap Item</label>
            <Select value={selectedRoadmapItem} onValueChange={setSelectedRoadmapItem}>
              <SelectTrigger>
                <SelectValue placeholder="Select item..." />
              </SelectTrigger>
              <SelectContent>
                {sortedItems.map((item, index) => {
                  const isLiveJournal = item.title === "Live Chat Journal" && item.category === "discussion_note";
                  
                  if (isLiveJournal) {
                    return (
                      <div key={item.id}>
                        <SelectItem value={item.id}>
                          <div className="flex items-center gap-2">
                            <MessageSquare className="h-3 w-3 text-[var(--color-info)]" />
                            <span className="font-medium text-[var(--color-info)]">Live Chat Journal</span>
                          </div>
                        </SelectItem>
                        {sortedItems.length > 1 && (
                          <div className="px-2 py-1 text-xs text-[var(--color-charcoal)] border-b border-[var(--color-background-muted)] mb-1">Other Items</div>
                        )}
                      </div>
                    );
                  }
                  
                  return (
                    <SelectItem key={item.id} value={item.id}>
                      <div className="flex items-center gap-2">
                        {item.is_focused && <span className="text-[var(--color-accent)]">●</span>}
                        {item.is_starred && <span className="text-[var(--color-warning)]">★</span>}
                        {item.title}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* AI Capture Button */}
          <div className="bg-gradient-to-r from-[var(--color-accent)]/10 to-[var(--color-primary)]/10 border border-[var(--color-accent)]/30 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-[var(--color-midnight)] flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  AI Capture from Clipboard
                </h4>
                <p className="text-sm text-[var(--color-charcoal)] mt-1">
                  Copy chat content, then click to auto-summarize
                </p>
              </div>
              <Button 
                onClick={handleAICapture}
                disabled={isAICapturing}
                className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-dark)]"
              >
                {isAICapturing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <ClipboardPaste className="h-4 w-4 mr-2" />
                )}
                {isAICapturing ? "Analyzing..." : "Capture & Summarize"}
              </Button>
            </div>
          </div>

          {/* Entry Type Pills */}
          <div>
            <label className="text-sm font-medium mb-2 block text-[var(--color-midnight)]">Type</label>
            <div className="flex flex-wrap gap-2">
              {entryTypes.map(type => {
                const Icon = type.icon;
                const isSelected = entryType === type.value;
                return (
                  <button
                    key={type.value}
                    onClick={() => setEntryType(type.value)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm transition-all ${
                      isSelected 
                        ? type.color + " border-2 font-medium" 
                        : "bg-[var(--color-background-paper)] text-[var(--color-charcoal)] border-[var(--color-background-muted)] hover:bg-[var(--color-background)]"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {type.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content - now shows AI result or manual entry */}
          <div>
            <label className="text-sm font-medium mb-2 block text-[var(--color-midnight)]">Content {content && "(AI generated - edit as needed)"}</label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Click 'Capture & Summarize' above or type manually..."
              rows={6}
            />
          </div>

          {/* Attachments */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <label className="cursor-pointer">
                <input 
                  type="file" 
                  multiple 
                  className="hidden" 
                  onChange={handleFileUpload}
                  disabled={isUploading}
                />
                <Button variant="outline" size="sm" asChild disabled={isUploading}>
                  <span>
                    {isUploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Paperclip className="h-4 w-4 mr-2" />}
                    Attach Files
                  </span>
                </Button>
              </label>
            </div>
            
            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {attachments.map((att, index) => (
                  <div key={index} className="flex items-center gap-1 bg-[var(--color-background)] rounded px-2 py-1 text-sm">
                    <FileText className="h-3 w-3 text-[var(--color-charcoal)]" />
                    <span className="max-w-32 truncate text-[var(--color-midnight)]">{att.friendly_name}</span>
                    <Button variant="ghost" size="icon" className="h-5 w-5 text-[var(--color-destructive)]" onClick={() => removeAttachment(index)}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Save Button */}
          <Button 
            onClick={handleSave} 
            disabled={isSaving || !content.trim() || !selectedRoadmapItem}
            className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save to Journal
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}