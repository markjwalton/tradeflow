import React, { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Mic, MicOff, Send, Loader2, Sparkles, Check, X, RotateCcw } from "lucide-react";
import { toast } from "sonner";

export default function AIInputAssistant({ 
  isOpen, 
  onClose, 
  onApply, 
  contextType = "general",
  fieldLabel = "Input",
  currentValue = ""
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [aiOutput, setAiOutput] = useState("");
  const [selectedPromptId, setSelectedPromptId] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const { data: prompts = [] } = useQuery({
    queryKey: ["promptTemplates", contextType],
    queryFn: async () => {
      const all = await base44.entities.PromptTemplate.filter({ is_active: true });
      return all.filter(p => p.context_type === contextType || p.context_type === "general");
    },
    enabled: isOpen
  });

  useEffect(() => {
    if (prompts.length > 0 && !selectedPromptId) {
      const defaultPrompt = prompts.find(p => p.is_default && p.context_type === contextType) 
        || prompts.find(p => p.context_type === contextType)
        || prompts[0];
      if (defaultPrompt) setSelectedPromptId(defaultPrompt.id);
    }
  }, [prompts, contextType, selectedPromptId]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        stream.getTracks().forEach(track => track.stop());
        await processAudio();
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      toast.error("Could not access microphone");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processAudio = async () => {
    if (audioChunksRef.current.length === 0) return;
    
    setIsProcessing(true);
    try {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');

      const response = await base44.functions.invoke('speechToText', formData);
      
      if (response.data?.transcript) {
        setTranscript(prev => prev ? `${prev} ${response.data.transcript}` : response.data.transcript);
      } else if (response.data?.error) {
        toast.error(response.data.error);
      }
    } catch (error) {
      toast.error("Failed to process audio");
    } finally {
      setIsProcessing(false);
    }
  };

  const generateOutput = async () => {
    if (!transcript.trim()) {
      toast.error("Please provide some input first");
      return;
    }

    const selectedPrompt = prompts.find(p => p.id === selectedPromptId);
    if (!selectedPrompt) {
      toast.error("Please select a prompt template");
      return;
    }

    setIsGenerating(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `${selectedPrompt.system_prompt}

Current field value (if any): ${currentValue || "Empty"}
Field context: ${fieldLabel}

User's voice/text input:
"${transcript}"

Generate the appropriate output for this field.`,
      });

      setAiOutput(result);
    } catch (error) {
      toast.error("Failed to generate output");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApply = () => {
    onApply(aiOutput);
    handleClose();
  };

  const handleClose = () => {
    setTranscript("");
    setAiOutput("");
    onClose();
  };

  const handleReset = () => {
    setTranscript("");
    setAiOutput("");
  };

  const selectedPrompt = prompts.find(p => p.id === selectedPromptId);

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <SheetContent className="w-[450px] sm:max-w-[450px] flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[var(--color-accent)]" />
            AI Input Assistant
          </SheetTitle>
          <p className="text-sm text-[var(--color-charcoal)]">For: {fieldLabel}</p>
        </SheetHeader>

        <div className="flex-1 flex flex-col gap-4 mt-4">
          {/* Prompt Selector */}
          <div>
            <label className="text-sm font-medium mb-1 block text-[var(--color-midnight)]">Reasoning Prompt</label>
            <Select value={selectedPromptId || ""} onValueChange={setSelectedPromptId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a prompt..." />
              </SelectTrigger>
              <SelectContent>
                {prompts.map((prompt) => (
                  <SelectItem key={prompt.id} value={prompt.id}>
                    <div className="flex items-center gap-2">
                      {prompt.name}
                      {prompt.is_default && <Badge variant="secondary" className="text-xs">Default</Badge>}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedPrompt && (
              <p className="text-xs text-[var(--color-charcoal)] mt-1">{selectedPrompt.description}</p>
            )}
          </div>

          {/* Voice Input */}
          <div className="flex items-center justify-center gap-4 py-4">
            <Button
              size="lg"
              variant={isRecording ? "destructive" : "default"}
              className={`rounded-full h-16 w-16 ${isRecording ? "animate-pulse" : ""}`}
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : isRecording ? (
                <MicOff className="h-6 w-6" />
              ) : (
                <Mic className="h-6 w-6" />
              )}
            </Button>
          </div>
          <p className="text-center text-sm text-[var(--color-charcoal)]">
            {isRecording ? "Recording... Click to stop" : isProcessing ? "Processing audio..." : "Click to start recording"}
          </p>

          {/* Transcript */}
          <div>
            <label className="text-sm font-medium mb-1 block text-[var(--color-midnight)]">Your Input</label>
            <Textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Speak or type your input here..."
              rows={4}
            />
          </div>

          {/* Generate Button */}
          <Button onClick={generateOutput} disabled={!transcript.trim() || isGenerating} className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white">
            {isGenerating ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            Generate Output
          </Button>

          {/* AI Output */}
          {aiOutput && (
            <div className="flex-1">
              <label className="text-sm font-medium mb-1 block text-[var(--color-midnight)]">AI Output</label>
              <ScrollArea className="h-32 border border-[var(--color-background-muted)] rounded-md p-3 bg-[var(--color-background)]">
                <p className="text-sm whitespace-pre-wrap text-[var(--color-midnight)]">{aiOutput}</p>
              </ScrollArea>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t border-[var(--color-background-muted)] mt-4">
          <Button variant="outline" onClick={handleReset} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
          <Button variant="outline" onClick={handleClose} className="gap-2">
            <X className="h-4 w-4" />
            Cancel
          </Button>
          <Button onClick={handleApply} disabled={!aiOutput} className="flex-1 gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white">
            <Check className="h-4 w-4" />
            Apply to Field
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}