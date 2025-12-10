import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Save, Calendar } from "lucide-react";
import { toast } from "sonner";

export default function DiaryNotes({ sessionId }) {
  const queryClient = useQueryClient();
  const [newNote, setNewNote] = useState("");
  const [noteTitle, setNoteTitle] = useState("");

  const { data: notes = [] } = useQuery({
    queryKey: ["diaryNotes", sessionId],
    queryFn: () => base44.entities.KnowledgeEntry.filter({
      onboarding_session_id: sessionId,
      tags: { $contains: "diary" }
    }),
  });

  const createNote = useMutation({
    mutationFn: async () => {
      return await base44.entities.KnowledgeEntry.create({
        onboarding_session_id: sessionId,
        question: noteTitle || "Diary Note",
        answer: newNote,
        source: "human",
        tags: ["diary", "note"]
      });
    },
    onSuccess: () => {
      toast.success("Note saved");
      setNewNote("");
      setNoteTitle("");
      queryClient.invalidateQueries(["diaryNotes", sessionId]);
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Diary Notes & Reminders</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <Input
            value={noteTitle}
            onChange={(e) => setNoteTitle(e.target.value)}
            placeholder="Note title..."
          />
          <Textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Add a diary note or reminder..."
            rows={4}
          />
          <Button 
            onClick={() => createNote.mutate()} 
            size="sm" 
            disabled={!newNote.trim() || createNote.isPending}
          >
            <Save className="mr-2 h-4 w-4" />
            Save Note
          </Button>
        </div>

        <div className="space-y-2 border-t pt-4">
          {notes.map((note) => (
            <div key={note.id} className="p-3 border rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <p className="font-medium">{note.question}</p>
                <Badge variant="outline" className="text-xs">
                  {new Date(note.created_date).toLocaleDateString()}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{note.answer}</p>
            </div>
          ))}
          {notes.length === 0 && (
            <p className="text-center text-muted-foreground py-4">No notes yet</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}