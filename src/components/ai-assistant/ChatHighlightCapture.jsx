import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  Loader2, Sparkles, Brain, HelpCircle, Lightbulb, 
  MessageSquare, AlertTriangle, CheckCircle, Code,
  BookOpen, Save
} from "lucide-react";
import { toast } from "sonner";

const entryTypes = [
  { value: "brainstorming", label: "Brainstorming", icon: Brain, color: "bg-purple-100 text-purple-800" },
  { value: "question", label: "Question", icon: HelpCircle, color: "bg-blue-100 text-blue-800" },
  { value: "advice", label: "Advice", icon: MessageSquare, color: "bg-green-100 text-green-800" },
  { value: "idea", label: "Idea", icon: Lightbulb, color: "bg-yellow-100 text-yellow-800" },
  { value: "decision", label: "Decision", icon: CheckCircle, color: "bg-emerald-100 text-emerald-800" },
  { value: "update", label: "Update", icon: Code, color: "bg-gray-100 text-gray-800" },
  { value: "blocker", label: "Blocker", icon: AlertTriangle, color: "bg-red-100 text-red-800" },
];

export default function ChatHighlightCapture({ isOpen, onClose }) {
  const queryClient = useQueryClient();
  const [chatContent, setChatContent] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [selectedRoadmapItem, setSelectedRoadmapItem] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const { data: roadmapItems = [] } = useQuery({
    queryKey: ["roadmapItems"],
    queryFn: () => base44.entities.RoadmapItem.list("-created_date"),
  });

  const analyzeChat = async () => {
    if (!chatContent.trim()) {
      toast.error("Please paste chat content first");
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are analyzing a chat conversation from a development session. Extract the key highlights and categorize them.

Chat Content:
${chatContent}

Analyze this chat and extract distinct highlights. For each highlight:
1. Determine the type: brainstorming, question, advice, idea, decision, update, or blocker
2. Write a clear, concise summary of the highlight
3. Suggest which roadmap item it might relate to (if any obvious connection)

Return as JSON:
{
  "highlights": [
    {
      "type": "brainstorming|question|advice|idea|decision|update|blocker",
      "content": "Clear summary of the highlight...",
      "suggested_topic": "Optional: what feature/area this relates to"
    }
  ],
  "overall_summary": "Brief summary of the chat session"
}`,
        response_json_schema: {
          type: "object",
          properties: {
            highlights: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  type: { type: "string" },
                  content: { type: "string" },
                  suggested_topic: { type: "string" }
                }
              }
            },
            overall_summary: { type: "string" }
          }
        }
      });

      setAnalysis(result);
    } catch (error) {
      toast.error("Failed to analyze chat");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const saveHighlights = async () => {
    if (!analysis?.highlights?.length) {
      toast.error("No highlights to save");
      return;
    }

    if (!selectedRoadmapItem) {
      toast.error("Please select a roadmap item");
      return;
    }

    setIsSaving(true);
    try {
      for (const highlight of analysis.highlights) {
        await base44.entities.RoadmapJournal.create({
          roadmap_item_id: selectedRoadmapItem,
          content: highlight.content,
          entry_type: highlight.type,
          entry_date: new Date().toISOString()
        });
      }

      queryClient.invalidateQueries({ queryKey: ["roadmapJournal"] });
      queryClient.invalidateQueries({ queryKey: ["allRoadmapJournals"] });
      toast.success(`Saved ${analysis.highlights.length} highlights to journal`);
      handleClose();
    } catch (error) {
      toast.error("Failed to save highlights");
    } finally {
      setIsSaving(false);
    }
  };

  const removeHighlight = (index) => {
    setAnalysis(prev => ({
      ...prev,
      highlights: prev.highlights.filter((_, i) => i !== index)
    }));
  };

  const updateHighlightType = (index, newType) => {
    setAnalysis(prev => ({
      ...prev,
      highlights: prev.highlights.map((h, i) => i === index ? { ...h, type: newType } : h)
    }));
  };

  const handleClose = () => {
    setChatContent("");
    setAnalysis(null);
    setSelectedRoadmapItem("");
    onClose();
  };

  const getTypeInfo = (type) => entryTypes.find(t => t.value === type) || entryTypes[5];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Capture Chat Highlights
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!analysis ? (
            <>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Paste your chat conversation
                </label>
                <Textarea
                  value={chatContent}
                  onChange={(e) => setChatContent(e.target.value)}
                  placeholder="Paste the chat content you want to capture highlights from..."
                  rows={10}
                  className="font-mono text-sm"
                />
              </div>

              <Button onClick={analyzeChat} disabled={isAnalyzing || !chatContent.trim()} className="w-full">
                {isAnalyzing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                Analyze & Extract Highlights
              </Button>
            </>
          ) : (
            <>
              {analysis.overall_summary && (
                <div className="bg-slate-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-slate-700">Session Summary</p>
                  <p className="text-sm text-slate-600">{analysis.overall_summary}</p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Save to Roadmap Item *
                </label>
                <Select value={selectedRoadmapItem} onValueChange={setSelectedRoadmapItem}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select roadmap item..." />
                  </SelectTrigger>
                  <SelectContent>
                    {roadmapItems.map(item => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium">Extracted Highlights ({analysis.highlights?.length || 0})</p>
                {analysis.highlights?.map((highlight, index) => {
                  const typeInfo = getTypeInfo(highlight.type);
                  const TypeIcon = typeInfo.icon;
                  return (
                    <div key={index} className="border rounded-lg p-3 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Select 
                            value={highlight.type} 
                            onValueChange={(v) => updateHighlightType(index, v)}
                          >
                            <SelectTrigger className="w-40 h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {entryTypes.map(t => (
                                <SelectItem key={t.value} value={t.value}>
                                  <div className="flex items-center gap-2">
                                    <t.icon className="h-3 w-3" />
                                    {t.label}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {highlight.suggested_topic && (
                            <Badge variant="outline" className="text-xs">
                              {highlight.suggested_topic}
                            </Badge>
                          )}
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-500 h-8"
                          onClick={() => removeHighlight(index)}
                        >
                          Remove
                        </Button>
                      </div>
                      <p className="text-sm">{highlight.content}</p>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setAnalysis(null)} className="flex-1">
                  Re-analyze
                </Button>
                <Button 
                  onClick={saveHighlights} 
                  disabled={isSaving || !selectedRoadmapItem}
                  className="flex-1"
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save to Journal
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}