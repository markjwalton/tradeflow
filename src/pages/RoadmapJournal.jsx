import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  ArrowLeft, Plus, Loader2, Sparkles, Copy, Trash2, 
  Brain, HelpCircle, Lightbulb, MessageSquare, AlertTriangle, CheckCircle, Code 
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

export default function RoadmapJournal() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const itemId = urlParams.get("item");

  const [newEntry, setNewEntry] = useState("");
  const [entryType, setEntryType] = useState("update");
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const [isGeneratingDevPrompt, setIsGeneratingDevPrompt] = useState(false);
  const [devPrompt, setDevPrompt] = useState("");

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

  const createMutation = useMutation({
    mutationFn: async (data) => {
      return base44.entities.RoadmapJournal.create({
        ...data,
        roadmap_item_id: itemId,
        entry_date: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roadmapJournal", itemId] });
      setNewEntry("");
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
      const journalContext = entries.length > 0 
        ? entries.map(e => `[${e.entry_type}] ${e.content}`).join("\n\n")
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
      
      setDevPrompt(result);
    } catch (error) {
      toast.error("Failed to generate prompt");
    } finally {
      setIsGeneratingDevPrompt(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
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

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{item?.title}</h1>
          <p className="text-gray-500">{item?.description}</p>
        </div>
      </div>

      {/* Dev Prompt Section */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Code className="h-5 w-5" />
            Development Prompt
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={generateDevPrompt} disabled={isGeneratingDevPrompt} className="mb-3">
            {isGeneratingDevPrompt ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            Generate Development Prompt
          </Button>
          {devPrompt && (
            <>
              <Textarea
                value={devPrompt}
                onChange={(e) => setDevPrompt(e.target.value)}
                rows={10}
                className="font-mono text-sm mb-3"
              />
              <Button onClick={() => copyToClipboard(devPrompt)} variant="outline">
                <Copy className="h-4 w-4 mr-2" /> Copy to Clipboard
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* New Entry Form */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Add Journal Entry</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
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
          <Textarea
            value={newEntry}
            onChange={(e) => setNewEntry(e.target.value)}
            placeholder="Add a journal entry..."
            rows={4}
          />
          <Button onClick={handleAddEntry} disabled={!newEntry.trim() || createMutation.isPending}>
            {createMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
            Add Entry
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
            return (
              <Card key={entry.id}>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Badge className={typeInfo.color}>
                        <TypeIcon className="h-3 w-3 mr-1" />
                        {typeInfo.label}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {moment(entry.entry_date || entry.created_date).format("DD MMM YYYY, HH:mm")}
                      </span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-red-500 hover:text-red-700" 
                      onClick={() => deleteMutation.mutate(entry.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <p className="text-sm whitespace-pre-wrap mb-4">{entry.content}</p>
                  
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
                    <div className="mt-4 bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-purple-700">AI Generated Prompt</span>
                        <Button size="sm" variant="ghost" onClick={() => copyToClipboard(entry.ai_generated_prompt)}>
                          <Copy className="h-3 w-3 mr-1" /> Copy
                        </Button>
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
    </div>
  );
}