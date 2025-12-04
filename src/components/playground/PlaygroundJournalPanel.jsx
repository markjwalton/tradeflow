import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  BookOpen, Plus, Loader2, Trash2, Sparkles, 
  AlertCircle, Lightbulb, Bug, MessageSquare, Wand2, History
} from "lucide-react";
import { toast } from "sonner";
import moment from "moment";

const entryTypes = [
  { value: "change_request", label: "Change Request", icon: AlertCircle, color: "bg-[var(--color-secondary)]/20 text-[var(--color-secondary-dark)]" },
  { value: "enhancement", label: "Enhancement", icon: Lightbulb, color: "bg-[var(--color-warning)]/20 text-[var(--color-warning-dark)]" },
  { value: "bug", label: "Bug", icon: Bug, color: "bg-[var(--color-destructive)]/20 text-[var(--color-destructive)]" },
  { value: "note", label: "Note", icon: MessageSquare, color: "bg-[var(--color-charcoal)]/10 text-[var(--color-charcoal)]" },
  { value: "ai_suggestion", label: "AI Suggestion", icon: Wand2, color: "bg-[var(--color-accent)]/20 text-[var(--color-accent-dark)]" },
  { value: "version_note", label: "Version Note", icon: History, color: "bg-[var(--color-info)]/20 text-[var(--color-info-dark)]" },
];

export default function PlaygroundJournalPanel({ playgroundItemId, currentVersion }) {
  const queryClient = useQueryClient();
  const [newEntry, setNewEntry] = useState("");
  const [entryType, setEntryType] = useState("note");

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["playgroundJournal", playgroundItemId],
    queryFn: () => base44.entities.PlaygroundJournal.filter(
      { playground_item_id: playgroundItemId }, 
      "-created_date"
    ),
    enabled: !!playgroundItemId
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.PlaygroundJournal.create({
      ...data,
      playground_item_id: playgroundItemId,
      version_reference: currentVersion,
      entry_date: new Date().toISOString()
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playgroundJournal", playgroundItemId] });
      setNewEntry("");
      toast.success("Journal entry added");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.PlaygroundJournal.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playgroundJournal", playgroundItemId] });
      toast.success("Entry deleted");
    }
  });

  const handleAdd = () => {
    if (!newEntry.trim()) return;
    createMutation.mutate({ content: newEntry, entry_type: entryType });
  };

  const getTypeInfo = (type) => entryTypes.find(t => t.value === type) || entryTypes[3];

  return (
    <Card className="border-[var(--color-background-muted)]">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2 text-[var(--color-midnight)]">
          <BookOpen className="h-5 w-5" />
          Playground Journal
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Entry */}
        <div className="space-y-2">
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
            <span className="text-sm text-[var(--color-charcoal)] self-center">v{currentVersion}</span>
          </div>
          <Textarea
            value={newEntry}
            onChange={(e) => setNewEntry(e.target.value)}
            placeholder="Add a change request, enhancement idea, or note..."
            rows={3}
          />
          <Button onClick={handleAdd} disabled={!newEntry.trim() || createMutation.isPending} size="sm" className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white">
            {createMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
            Add Entry
          </Button>
        </div>

        {/* Entries List */}
        <ScrollArea className="h-64">
          {isLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : entries.length === 0 ? (
            <p className="text-[var(--color-charcoal)] text-center py-4 text-sm">No journal entries yet</p>
          ) : (
            <div className="space-y-2">
              {entries.map(entry => {
                const typeInfo = getTypeInfo(entry.entry_type);
                const TypeIcon = typeInfo.icon;
                return (
                  <div key={entry.id} className="p-3 border border-[var(--color-background-muted)] rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge className={typeInfo.color}>
                          <TypeIcon className="h-3 w-3 mr-1" />
                          {typeInfo.label}
                        </Badge>
                        {entry.version_reference && (
                          <Badge variant="outline" className="text-xs">v{entry.version_reference}</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[var(--color-charcoal)]">
                          {moment(entry.entry_date || entry.created_date).format("DD MMM, HH:mm")}
                        </span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 text-[var(--color-destructive)]"
                          onClick={() => deleteMutation.mutate(entry.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm whitespace-pre-wrap text-[var(--color-midnight)]">{entry.content}</p>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}