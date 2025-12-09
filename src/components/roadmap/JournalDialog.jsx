import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { Plus, Loader2, Sparkles, Copy, Trash2, Brain, HelpCircle, Lightbulb, MessageSquare, AlertTriangle, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import moment from "moment";

const entryTypes = [
  { value: "brainstorming", label: "Brainstorming", icon: Brain, color: "bg-[var(--color-accent)]/20 text-[var(--color-accent-dark)]" },
  { value: "question", label: "Question", icon: HelpCircle, color: "bg-[var(--color-info)]/20 text-[var(--color-info-dark)]" },
  { value: "advice", label: "Advice", icon: MessageSquare, color: "bg-[var(--color-success)]/20 text-[var(--color-success-dark)]" },
  { value: "idea", label: "Idea", icon: Lightbulb, color: "bg-[var(--color-warning)]/20 text-[var(--color-warning-dark)]" },
  { value: "decision", label: "Decision", icon: CheckCircle, color: "bg-[var(--color-primary)]/20 text-[var(--color-primary-dark)]" },
  { value: "update", label: "Update", icon: MessageSquare, color: "bg-[var(--color-charcoal)]/10 text-[var(--color-charcoal)]" },
  { value: "blocker", label: "Blocker", icon: AlertTriangle, color: "bg-[var(--color-destructive)]/20 text-[var(--color-destructive)]" },
];

export default function JournalDialog({ isOpen, onClose, item }) {
  const queryClient = useQueryClient();
  const [newEntry, setNewEntry] = useState("");
  const [entryType, setEntryType] = useState("update");
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["roadmapJournal", item?.id],
    queryFn: () => base44.entities.RoadmapJournal.filter({ roadmap_item_id: item.id }, "-created_date"),
    enabled: !!item?.id
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const entry = await base44.entities.RoadmapJournal.create({
        ...data,
        roadmap_item_id: item.id,
        entry_date: new Date().toISOString()
      });
      return entry;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roadmapJournal", item?.id] });
      setNewEntry("");
      toast.success("Journal entry added");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.RoadmapJournal.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roadmapJournal", item?.id] });
      toast.success("Entry deleted");
    }
  });

  const handleAddEntry = () => {
    if (!newEntry.trim()) return;
    createMutation.mutate({ content: newEntry, entry_type: entryType });
  };

  const generateAIPrompt = async (entry) => {
    setIsGeneratingPrompt(true);
    try {
      const prompt = await base44.integrations.Core.InvokeLLM({
        prompt: `You are helping a user continue a discussion about a software development roadmap item.

Roadmap Item: "${item.title}"
Description: ${item.description || "No description"}
Category: ${item.category}

Latest Journal Entry (${entry.entry_type}):
"${entry.content}"

Generate a concise, actionable prompt that the user can copy into a chat with an AI assistant to continue this discussion productively. The prompt should:
1. Provide context about what they're working on
2. Reference the key points from their journal entry
3. Ask specific questions or request specific outputs
4. Be ready to paste directly into a chat

Output only the prompt text, nothing else.`
      });
      
      await base44.entities.RoadmapJournal.update(entry.id, { ai_generated_prompt: prompt });
      queryClient.invalidateQueries({ queryKey: ["roadmapJournal", item?.id] });
      toast.success("AI prompt generated");
    } catch (error) {
      toast.error("Failed to generate prompt");
    } finally {
      setIsGeneratingPrompt(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const getTypeInfo = (type) => entryTypes.find(t => t.value === type) || entryTypes[5];

  if (!item) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Journal: {item.title}
          </DialogTitle>
        </DialogHeader>

        {/* New Entry Form */}
        <div className="space-y-3 border-b border-border pb-4">
          <div className="flex gap-2">
            <Select value={entryType} onValueChange={setEntryType}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {entryTypes.map(t => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Textarea
            value={newEntry}
            onChange={(e) => setNewEntry(e.target.value)}
            placeholder="Add a journal entry..."
            rows={3}
          />
          <Button onClick={handleAddEntry} disabled={!newEntry.trim() || createMutation.isPending}>
            {createMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
            Add Entry
          </Button>
        </div>

        {/* Entries List */}
        <ScrollArea className="flex-1 pr-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : entries.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No journal entries yet</p>
          ) : (
            <div className="space-y-4">
              {entries.map(entry => {
                const typeInfo = getTypeInfo(entry.entry_type);
                const TypeIcon = typeInfo.icon;
                return (
                  <div key={entry.id} className="border border-border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge className={typeInfo.color}>
                          <TypeIcon className="h-3 w-3 mr-1" />
                          {typeInfo.label}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {moment(entry.entry_date || entry.created_date).format("DD MMM YYYY, HH:mm")}
                        </span>
                      </div>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => deleteMutation.mutate(entry.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="text-sm whitespace-pre-wrap mb-3 text-foreground">{entry.content}</p>
                    
                    {/* AI Prompt Section */}
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => generateAIPrompt(entry)}
                        disabled={isGeneratingPrompt}
                      >
                        {isGeneratingPrompt ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Sparkles className="h-3 w-3 mr-1" />}
                        Generate Prompt
                      </Button>
                    </div>
                    
                    {entry.ai_generated_prompt && (
                      <div className="mt-3 bg-accent/10 border border-accent/30 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-accent">AI Generated Prompt</span>
                          <Button size="sm" variant="ghost" onClick={() => copyToClipboard(entry.ai_generated_prompt)}>
                            <Copy className="h-3 w-3 mr-1" /> Copy
                          </Button>
                        </div>
                        <p className="text-sm text-foreground whitespace-pre-wrap">{entry.ai_generated_prompt}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}