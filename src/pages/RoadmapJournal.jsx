import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  ArrowLeft, Plus, Loader2, Sparkles, Copy, Trash2, 
  Brain, HelpCircle, Lightbulb, MessageSquare, AlertTriangle, CheckCircle, Code,
  Paperclip, X, FileText, Send, Pencil, Check, ThumbsUp, ThumbsDown, RotateCcw,
  Play, Pause, Archive
} from "lucide-react";
import { toast } from "sonner";
import moment from "moment";

const entryTypes = [
  { value: "brainstorming", label: "Brainstorming", icon: Brain, color: "bg-purple-100 text-purple-800" },
  { value: "question", label: "Question", icon: HelpCircle, color: "bg-blue-100 text-blue-800" },
  { value: "advice", label: "Advice", icon: MessageSquare, color: "bg-green-100 text-green-800" },
  { value: "idea", label: "Idea", icon: Lightbulb, color: "bg-yellow-100 text-yellow-800" },
  { value: "decision", label: "Decision", icon: CheckCircle, color: "bg-emerald-100 text-emerald-800" },
  { value: "update", label: "Update", icon: MessageSquare, color: "bg-gray-100 text-gray-800" },
  { value: "blocker", label: "Blocker", icon: AlertTriangle, color: "bg-red-100 text-red-800" },
];

const contextCategories = [
  "UX", "Page Layout", "Data Model", "API", "Integration", 
  "Security", "Performance", "Accessibility", "Business Logic", "Other"
];

const statuses = [
  { value: "backlog", label: "Backlog" },
  { value: "planned", label: "Planned" },
  { value: "ai_review", label: "AI Review" },
  { value: "ready", label: "Ready" },
  { value: "in_sprint", label: "In Sprint" },
  { value: "in_progress", label: "In Progress" },
  { value: "testing", label: "Testing" },
  { value: "completed", label: "Completed" },
  { value: "archived", label: "Archived" },
  { value: "on_hold", label: "On Hold" },
];

export default function RoadmapJournal() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const itemId = urlParams.get("item");

  const [newEntry, setNewEntry] = useState("");
  const [entryType, setEntryType] = useState("update");
  const [continueFromEntry, setContinueFromEntry] = useState(null);
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const [isGeneratingDevPrompt, setIsGeneratingDevPrompt] = useState(false);
  const [isGeneratingReview, setIsGeneratingReview] = useState(false);
  const [devPrompt, setDevPrompt] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [editingAttachmentIndex, setEditingAttachmentIndex] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [newContextCategory, setNewContextCategory] = useState("UX");
  const [newContextContent, setNewContextContent] = useState("");
  const [activeTab, setActiveTab] = useState("journal");

  const { data: item, isLoading: itemLoading } = useQuery({
    queryKey: ["roadmapItem", itemId],
    queryFn: async () => {
      const items = await base44.entities.RoadmapItem.filter({ id: itemId });
      return items[0];
    },
    enabled: !!itemId
  });

  const { data: entries = [], isLoading: entriesLoading } = useQuery({
    queryKey: ["roadmapJournal", itemId],
    queryFn: () => base44.entities.RoadmapJournal.filter({ roadmap_item_id: itemId }, "-created_date"),
    enabled: !!itemId
  });

  const { data: sprints = [] } = useQuery({
    queryKey: ["sprints"],
    queryFn: () => base44.entities.DevelopmentSprint.list("-created_date"),
  });

  const updateItemMutation = useMutation({
    mutationFn: (data) => base44.entities.RoadmapItem.update(itemId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roadmapItem", itemId] });
      queryClient.invalidateQueries({ queryKey: ["roadmapItems"] });
      toast.success("Item updated");
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      return base44.entities.RoadmapJournal.create({
        ...data,
        roadmap_item_id: itemId,
        parent_entry_id: continueFromEntry?.id || null,
        attachments: attachments.length > 0 ? attachments : null,
        entry_date: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roadmapJournal", itemId] });
      setNewEntry("");
      setContinueFromEntry(null);
      setAttachments([]);
      toast.success("Journal entry added");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.RoadmapJournal.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roadmapJournal", itemId] });
      toast.success("Entry deleted");
    }
  });

  const handleAddEntry = () => {
    if (!newEntry.trim()) return;
    createMutation.mutate({ content: newEntry, entry_type: entryType });
  };

  const handleStatusChange = (newStatus) => {
    updateItemMutation.mutate({ status: newStatus });
  };

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

  const startEditingName = (index) => {
    setEditingAttachmentIndex(index);
    setEditingName(attachments[index].friendly_name);
  };

  const saveAttachmentName = () => {
    if (editingAttachmentIndex !== null) {
      setAttachments(prev => prev.map((att, i) => 
        i === editingAttachmentIndex ? { ...att, friendly_name: editingName } : att
      ));
      setEditingAttachmentIndex(null);
      setEditingName("");
    }
  };

  const addContextItem = () => {
    if (!newContextContent.trim()) return;
    const currentContext = item?.context_items || [];
    updateItemMutation.mutate({
      context_items: [...currentContext, { category: newContextCategory, content: newContextContent }]
    });
    setNewContextContent("");
  };

  const removeContextItem = (index) => {
    const currentContext = item?.context_items || [];
    updateItemMutation.mutate({
      context_items: currentContext.filter((_, i) => i !== index)
    });
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
      queryClient.invalidateQueries({ queryKey: ["roadmapJournal", itemId] });
      toast.success("AI prompt generated");
    } catch (error) {
      toast.error("Failed to generate prompt");
    } finally {
      setIsGeneratingPrompt(false);
    }
  };

  const generateDevPrompt = async () => {
    setIsGeneratingDevPrompt(true);
    try {
      if (item && item.status === "backlog") {
        await base44.entities.RoadmapItem.update(item.id, { status: "planned" });
        queryClient.invalidateQueries({ queryKey: ["roadmapItem", itemId] });
      }

      const allAttachments = entries.flatMap(e => e.attachments || []);
      
      const journalContext = entries.length > 0 
        ? entries.map(e => {
            let entryText = `[${e.entry_type}] ${e.content}`;
            if (e.attachments?.length > 0) {
              entryText += `\n  Attachments: ${e.attachments.map(a => a.friendly_name).join(", ")}`;
            }
            return entryText;
          }).join("\n\n")
        : "No journal entries";

      const contextItemsText = item?.context_items?.length > 0
        ? `\n\nContext Items:\n${item.context_items.map(c => `[${c.category}] ${c.content}`).join("\n")}`
        : "";

      const attachmentContext = allAttachments.length > 0
        ? `\n\nAttachments for reference (${allAttachments.length} files):\n${allAttachments.map(a => `- ${a.friendly_name} (${a.url})`).join("\n")}`
        : "";

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are helping structure a development task for an AI coding assistant.

Roadmap Item: "${item.title}"
Description: ${item.description || "No description provided"}
Category: ${item.category}
Priority: ${item.priority}
Target Phase: ${item.target_phase || "Not specified"}

Journal History:
${journalContext}${contextItemsText}${attachmentContext}

Generate a comprehensive, well-structured development prompt that can be pasted into an AI coding assistant chat. The prompt should:

1. Start with clear context about the project/feature
2. List specific requirements and acceptance criteria
3. Reference any decisions or insights from the journal
4. Include technical considerations if mentioned
5. Reference any attached files/documents that should be reviewed
6. Consider the context items provided (UX, Page Layout, etc.)
7. Specify what deliverables are expected
8. Be actionable and ready to implement

Format the prompt clearly with sections. Output only the prompt text.`
      });
      
      setDevPrompt(result);
      updateItemMutation.mutate({ development_prompt: result });
      toast.success("Prompt generated - status set to Planned");
    } catch (error) {
      toast.error("Failed to generate prompt");
    } finally {
      setIsGeneratingDevPrompt(false);
    }
  };

  const generateAIReview = async () => {
    setIsGeneratingReview(true);
    try {
      const promptToReview = devPrompt || item?.development_prompt;
      if (!promptToReview) {
        toast.error("Generate a development prompt first");
        return;
      }

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a senior software architect reviewing a development prompt before implementation.

Development Prompt to Review:
${promptToReview}

Roadmap Item: "${item.title}"
Description: ${item.description || "No description"}

Analyze this prompt and provide:
1. Overall assessment (is it ready for development?)
2. Any missed opportunities or improvements
3. Potential risks or considerations
4. Suggestions for clarity or completeness

Return as JSON:
{
  "status": "accepted" | "needs_work",
  "reasoning": "Overall assessment...",
  "recommendations": [
    {"type": "improvement", "content": "..."},
    {"type": "missed_opportunity", "content": "..."},
    {"type": "risk", "content": "..."},
    {"type": "clarification", "content": "..."}
  ]
}`,
        response_json_schema: {
          type: "object",
          properties: {
            status: { type: "string", enum: ["accepted", "needs_work"] },
            reasoning: { type: "string" },
            recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  type: { type: "string" },
                  content: { type: "string" },
                  accepted: { type: "boolean" }
                }
              }
            }
          }
        }
      });

      updateItemMutation.mutate({ 
        ai_review: { ...result, status: "pending" },
        status: "ai_review"
      });
      toast.success("AI review completed");
    } catch (error) {
      toast.error("Failed to generate review");
    } finally {
      setIsGeneratingReview(false);
    }
  };

  const handleRecommendationAction = (index, accepted) => {
    const currentReview = item?.ai_review || {};
    const updatedRecs = [...(currentReview.recommendations || [])];
    updatedRecs[index] = { ...updatedRecs[index], accepted };
    updateItemMutation.mutate({
      ai_review: { ...currentReview, recommendations: updatedRecs }
    });
  };

  const acceptAndProceed = async () => {
    // Generate final detailed prompt
    const acceptedRecs = (item?.ai_review?.recommendations || [])
      .filter(r => r.accepted)
      .map(r => r.content)
      .join("\n- ");

    const finalPrompt = item?.development_prompt + 
      (acceptedRecs ? `\n\nAdditional considerations:\n- ${acceptedRecs}` : "");

    updateItemMutation.mutate({
      development_prompt: finalPrompt,
      status: "ready",
      ai_review: { ...item?.ai_review, status: "accepted" }
    });
    toast.success("Marked as Ready for development");
  };

  const sendBackToRoadmap = () => {
    updateItemMutation.mutate({ status: "backlog" });
    toast.success("Moved back to roadmap for further work");
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const sendToChat = (prompt) => {
    const allAttachments = entries.flatMap(e => e.attachments || []);
    let message = prompt;
    if (allAttachments.length > 0) {
      message += `\n\n---\nAttachments to review:\n${allAttachments.map(a => `- ${a.friendly_name}: ${a.url}`).join("\n")}`;
    }
    navigator.clipboard.writeText(message);
    toast.success("Copied to clipboard with attachments - paste into Base44 chat");
  };

  const getTypeInfo = (type) => entryTypes.find(t => t.value === type) || entryTypes[5];

  if (!itemId) {
    return (
      <div className="p-6">
        <p className="text-gray-500">No roadmap item selected.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Go Back
        </Button>
      </div>
    );
  }

  if (itemLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const currentPrompt = devPrompt || item?.development_prompt || "";

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{item?.title}</h1>
            <p className="text-gray-500">{item?.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select value={item?.status || "backlog"} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statuses.map(s => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="journal">Journal</TabsTrigger>
          <TabsTrigger value="development">Development</TabsTrigger>
          <TabsTrigger value="context">Context Items</TabsTrigger>
        </TabsList>

        {/* Journal Tab */}
        <TabsContent value="journal" className="space-y-6">
          {/* New Entry Form */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Add Journal Entry</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-3 flex-wrap">
                <Select value={entryType} onValueChange={setEntryType}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {entryTypes.map(t => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select 
                  value={continueFromEntry?.id || "none"} 
                  onValueChange={(v) => setContinueFromEntry(v === "none" ? null : entries.find(e => e.id === v))}
                >
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Continue from..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">New thread</SelectItem>
                    {entries.map(e => (
                      <SelectItem key={e.id} value={e.id}>
                        {e.content.substring(0, 40)}...
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {continueFromEntry && (
                <div className="bg-slate-50 border-l-4 border-slate-300 p-3 rounded text-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-500 font-medium">Continuing from:</span>
                    <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={() => setContinueFromEntry(null)}>
                      Clear
                    </Button>
                  </div>
                  <p className="text-slate-700">{continueFromEntry.content.substring(0, 150)}{continueFromEntry.content.length > 150 ? "..." : ""}</p>
                </div>
              )}
              
              <Textarea
                value={newEntry}
                onChange={(e) => setNewEntry(e.target.value)}
                placeholder={continueFromEntry ? "Continue the discussion..." : "Add a journal entry..."}
                rows={4}
              />
              
              {/* Attachments */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
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
                      <div key={index} className="flex items-center gap-1 bg-slate-100 rounded px-2 py-1 text-sm">
                        <FileText className="h-3 w-3 text-slate-500" />
                        {editingAttachmentIndex === index ? (
                          <>
                            <Input
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              className="h-6 w-32 text-xs"
                              onKeyDown={(e) => e.key === "Enter" && saveAttachmentName()}
                            />
                            <Button variant="ghost" size="icon" className="h-5 w-5" onClick={saveAttachmentName}>
                              <Check className="h-3 w-3" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <span>{att.friendly_name}</span>
                            <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => startEditingName(index)}>
                              <Pencil className="h-3 w-3" />
                            </Button>
                          </>
                        )}
                        <Button variant="ghost" size="icon" className="h-5 w-5 text-red-500" onClick={() => removeAttachment(index)}>
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <Button onClick={handleAddEntry} disabled={!newEntry.trim() || createMutation.isPending}>
                {createMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                {continueFromEntry ? "Add Follow-up" : "Add Entry"}
              </Button>
            </CardContent>
          </Card>

          {/* Entries List */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Journal Entries ({entries.length})</h2>
            
            {entriesLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : entries.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No journal entries yet</p>
            ) : (
              entries.map(entry => {
                const typeInfo = getTypeInfo(entry.entry_type);
                const TypeIcon = typeInfo.icon;
                const isFollowUp = !!entry.parent_entry_id;
                const parentEntry = isFollowUp ? entries.find(e => e.id === entry.parent_entry_id) : null;
                
                return (
                  <Card key={entry.id} className={isFollowUp ? "ml-8 border-l-4 border-l-slate-300" : ""}>
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className={typeInfo.color}>
                            <TypeIcon className="h-3 w-3 mr-1" />
                            {typeInfo.label}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {moment(entry.entry_date || entry.created_date).format("DD MMM YYYY, HH:mm")}
                          </span>
                          {isFollowUp && parentEntry && (
                            <span className="text-xs text-slate-500 italic">
                              ↳ follows: "{parentEntry.content.substring(0, 30)}..."
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="h-8 px-2 text-xs"
                            onClick={() => setContinueFromEntry(entry)}
                          >
                            Continue
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-red-500 hover:text-red-700" 
                            onClick={() => deleteMutation.mutate(entry.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <p className="text-sm whitespace-pre-wrap mb-3">{entry.content}</p>
                      
                      {entry.attachments?.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {entry.attachments.map((att, i) => (
                            <a 
                              key={i} 
                              href={att.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 bg-blue-50 text-blue-700 rounded px-2 py-1 text-sm hover:bg-blue-100"
                            >
                              <FileText className="h-3 w-3" />
                              {att.friendly_name}
                            </a>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => generateAIPrompt(entry)}
                          disabled={isGeneratingPrompt}
                          title="Generate a prompt to continue this specific discussion thread"
                        >
                          {isGeneratingPrompt ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Sparkles className="h-3 w-3 mr-1" />}
                          Continue with AI
                        </Button>
                      </div>
                      
                      {entry.ai_generated_prompt && (
                        <div className="mt-4 bg-purple-50 border border-purple-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-purple-700">Prompt to continue this discussion</span>
                            <div className="flex gap-1">
                              <Button size="sm" variant="ghost" onClick={() => copyToClipboard(entry.ai_generated_prompt)}>
                                <Copy className="h-3 w-3 mr-1" /> Copy
                              </Button>
                              <Button size="sm" variant="ghost" className="text-purple-700" onClick={() => sendToChat(entry.ai_generated_prompt)}>
                                <Send className="h-3 w-3 mr-1" /> Send
                              </Button>
                            </div>
                          </div>
                          <p className="text-sm text-purple-900 whitespace-pre-wrap">{entry.ai_generated_prompt}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>

        {/* Development Tab */}
        <TabsContent value="development" className="space-y-6">
          {/* Development Prompt Section */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Code className="h-5 w-5" />
                Development Prompt
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={generateDevPrompt} disabled={isGeneratingDevPrompt}>
                {isGeneratingDevPrompt ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                {currentPrompt ? "Regenerate Prompt" : "Generate Development Prompt"}
              </Button>
              
              {currentPrompt && (
                <>
                  <div className="bg-slate-50 border rounded-lg p-4">
                    <Textarea
                      value={devPrompt || item?.development_prompt || ""}
                      onChange={(e) => setDevPrompt(e.target.value)}
                      rows={12}
                      className="font-mono text-sm"
                    />
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Button onClick={() => copyToClipboard(currentPrompt)} variant="outline">
                      <Copy className="h-4 w-4 mr-2" /> Copy
                    </Button>
                    <Button onClick={() => sendToChat(currentPrompt)} className="bg-purple-600 hover:bg-purple-700">
                      <Send className="h-4 w-4 mr-2" /> Send to Chat
                    </Button>
                    <Button onClick={generateAIReview} disabled={isGeneratingReview} variant="secondary">
                      {isGeneratingReview ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Brain className="h-4 w-4 mr-2" />}
                      AI Reasoning Review
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* AI Review Section */}
          {item?.ai_review && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  AI Review
                  <Badge className={item.ai_review.status === "accepted" ? "bg-green-100 text-green-800" : item.ai_review.status === "needs_work" ? "bg-orange-100 text-orange-800" : "bg-blue-100 text-blue-800"}>
                    {item.ai_review.status === "accepted" ? "Accepted" : item.ai_review.status === "needs_work" ? "Needs Work" : "Pending Review"}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Overall Assessment</h4>
                  <p className="text-sm text-gray-700">{item.ai_review.reasoning}</p>
                </div>

                {item.ai_review.recommendations?.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium">Recommendations</h4>
                    {item.ai_review.recommendations.map((rec, index) => (
                      <div key={index} className={`border rounded-lg p-3 ${rec.accepted === true ? "bg-green-50 border-green-200" : rec.accepted === false ? "bg-gray-50 border-gray-200 opacity-60" : "bg-white"}`}>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <Badge variant="outline" className="mb-2">{rec.type}</Badge>
                            <p className="text-sm">{rec.content}</p>
                          </div>
                          {rec.accepted === undefined && (
                            <div className="flex gap-1">
                              <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600" onClick={() => handleRecommendationAction(index, true)}>
                                <ThumbsUp className="h-4 w-4" />
                              </Button>
                              <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600" onClick={() => handleRecommendationAction(index, false)}>
                                <ThumbsDown className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                          {rec.accepted !== undefined && (
                            <Badge className={rec.accepted ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}>
                              {rec.accepted ? "Accepted" : "Rejected"}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2 pt-4 border-t">
                  <Button onClick={acceptAndProceed} className="bg-green-600 hover:bg-green-700">
                    <CheckCircle className="h-4 w-4 mr-2" /> Accept & Mark Ready
                  </Button>
                  <Button onClick={sendBackToRoadmap} variant="outline">
                    <RotateCcw className="h-4 w-4 mr-2" /> Back to Roadmap
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Sprint Assignment */}
          {item?.status === "ready" && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Sprint Assignment</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 mb-4">This item is ready for development. Assign it to a sprint.</p>
                {item?.sprints?.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium mb-2">Assigned Sprints:</h4>
                    <div className="flex flex-wrap gap-2">
                      {item.sprints.map((s, i) => (
                        <Badge key={i} variant="secondary">{s.sprint_name}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                <Select onValueChange={(sprintId) => {
                  const sprint = sprints.find(s => s.id === sprintId);
                  if (sprint) {
                    const currentSprints = item?.sprints || [];
                    updateItemMutation.mutate({
                      sprints: [...currentSprints, { sprint_id: sprint.id, sprint_name: sprint.name, added_date: new Date().toISOString() }],
                      status: "in_sprint"
                    });
                  }
                }}>
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Add to sprint..." />
                  </SelectTrigger>
                  <SelectContent>
                    {sprints.filter(s => s.status !== "completed").map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Context Items Tab */}
        <TabsContent value="context" className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Context Items for AI</CardTitle>
              <p className="text-sm text-gray-500">Add specific context items for the AI to consider when generating prompts</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Select value={newContextCategory} onValueChange={setNewContextCategory}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {contextCategories.map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  value={newContextContent}
                  onChange={(e) => setNewContextContent(e.target.value)}
                  placeholder="Context details..."
                  className="flex-1"
                />
                <Button onClick={addContextItem} disabled={!newContextContent.trim()}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {item?.context_items?.length > 0 ? (
                <div className="space-y-2">
                  {item.context_items.map((ctx, index) => (
                    <div key={index} className="flex items-start gap-2 bg-slate-50 p-3 rounded-lg">
                      <Badge variant="outline">{ctx.category}</Badge>
                      <p className="text-sm flex-1">{ctx.content}</p>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500" onClick={() => removeContextItem(index)}>
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">No context items added yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}