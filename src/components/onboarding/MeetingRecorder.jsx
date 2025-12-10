import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Mic, Square, Loader2, Save } from "lucide-react";
import { toast } from "sonner";

export default function MeetingRecorder({ sessionId }) {
  const queryClient = useQueryClient();
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [processing, setProcessing] = useState(false);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        await processRecording(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      toast.success("Recording started");
    } catch (error) {
      toast.error("Failed to start recording");
      console.error(error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setProcessing(true);
    }
  };

  const processRecording = async (audioBlob) => {
    try {
      // Convert audio to text using speech-to-text
      const formData = new FormData();
      formData.append("audio", audioBlob);
      
      // Call your speech-to-text function
      const result = await base44.functions.invoke("speechToText", { audio: audioBlob });
      setTranscription(result.transcription);
      
      // Generate meeting summary
      const summary = await base44.integrations.Core.InvokeLLM({
        prompt: `Summarize this meeting transcription into key points, action items, and decisions:

${result.transcription}

Provide:
1. Meeting summary
2. Key discussion points
3. Action items
4. Decisions made`,
        response_json_schema: {
          type: "object",
          properties: {
            summary: { type: "string" },
            key_points: { type: "array", items: { type: "string" } },
            action_items: { type: "array", items: { type: "string" } },
            decisions: { type: "array", items: { type: "string" } }
          }
        }
      });

      setTranscription(JSON.stringify(summary, null, 2));
      toast.success("Meeting processed successfully");
    } catch (error) {
      toast.error("Failed to process recording");
      console.error(error);
    }
    setProcessing(false);
  };

  const saveMeetingNote = useMutation({
    mutationFn: async () => {
      return await base44.entities.KnowledgeEntry.create({
        onboarding_session_id: sessionId,
        question: "Meeting Recording",
        answer: transcription,
        source: "human",
        is_important: true,
        tags: ["meeting", "recording"]
      });
    },
    onSuccess: () => {
      toast.success("Meeting notes saved");
      setTranscription("");
      queryClient.invalidateQueries(["knowledgeEntries", sessionId]);
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Mic className="h-4 w-4" />
          Meeting Recorder
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          {!isRecording ? (
            <Button 
              onClick={startRecording} 
              className="flex-1"
              disabled={processing}
            >
              <Mic className="mr-2 h-4 w-4" />
              Start Recording
            </Button>
          ) : (
            <Button 
              onClick={stopRecording} 
              variant="destructive" 
              className="flex-1"
            >
              <Square className="mr-2 h-4 w-4" />
              Stop Recording
            </Button>
          )}
        </div>

        {processing && (
          <div className="flex items-center justify-center py-4 text-sm text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing recording...
          </div>
        )}

        {transcription && (
          <>
            <Textarea
              value={transcription}
              onChange={(e) => setTranscription(e.target.value)}
              rows={8}
              placeholder="Meeting transcription and summary..."
            />
            <Button 
              onClick={() => saveMeetingNote.mutate()} 
              size="sm" 
              className="w-full"
              disabled={saveMeetingNote.isPending}
            >
              <Save className="mr-2 h-4 w-4" />
              Save Meeting Notes
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}