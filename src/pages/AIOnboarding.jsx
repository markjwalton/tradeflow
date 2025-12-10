import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Mic, Send, Loader2, Sparkles, User, Bot } from "lucide-react";
import { toast } from "sonner";
import { useTenant } from "@/Layout";

export default function AIOnboarding() {
  const { tenantId } = useTenant();
  const queryClient = useQueryClient();
  const [userInput, setUserInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState(null);

  // Fetch or create onboarding session
  const { data: sessions = [] } = useQuery({
    queryKey: ["onboardingSessions", tenantId],
    queryFn: () => base44.entities.OnboardingSession.filter({ tenant_id: tenantId }),
    enabled: !!tenantId,
  });

  useEffect(() => {
    if (sessions.length > 0) {
      const activeSession = sessions.find(s => s.status !== "approved" && s.status !== "implementation");
      if (activeSession) {
        setCurrentSessionId(activeSession.id);
        setMessages(activeSession.conversation_history || []);
      }
    }
  }, [sessions]);

  // Create new session
  const createSessionMutation = useMutation({
    mutationFn: async () => {
      const initialMessage = {
        role: "assistant",
        content: "Hello! I'm your AI App Coach. I'm here to understand your business and help design the perfect solution for you. Let's start with a few key questions.\n\nFirst, can you tell me about your business? What industry are you in, and what does your company do?",
        timestamp: new Date().toISOString()
      };
      
      const session = await base44.entities.OnboardingSession.create({
        tenant_id: tenantId,
        status: "discovery",
        conversation_history: [initialMessage]
      });
      
      return session;
    },
    onSuccess: (session) => {
      setCurrentSessionId(session.id);
      setMessages(session.conversation_history);
      queryClient.invalidateQueries({ queryKey: ["onboardingSessions"] });
    }
  });

  // Send message to AI
  const sendMessageMutation = useMutation({
    mutationFn: async (userMessage) => {
      // Add user message to conversation
      const updatedMessages = [
        ...messages,
        {
          role: "user",
          content: userMessage,
          timestamp: new Date().toISOString()
        }
      ];

      // Get AI response
      const aiPrompt = `You are an expert business consultant helping a new client design their business application. 

Previous conversation:
${updatedMessages.slice(-10).map(m => `${m.role}: ${m.content}`).join('\n\n')}

Your goal is to:
1. Understand their business, industry, and primary challenges
2. Identify their key operational processes and pain points
3. Discover what they want to achieve with the application
4. Ask clarifying questions to get specific details
5. Be conversational, empathetic, and consultative

Respond naturally and ask ONE focused follow-up question at a time. Keep responses concise (2-3 paragraphs max).`;

      const aiResponse = await base44.integrations.Core.InvokeLLM({
        prompt: aiPrompt,
      });

      const finalMessages = [
        ...updatedMessages,
        {
          role: "assistant",
          content: aiResponse,
          timestamp: new Date().toISOString()
        }
      ];

      // Update session
      await base44.entities.OnboardingSession.update(currentSessionId, {
        conversation_history: finalMessages
      });

      return finalMessages;
    },
    onSuccess: (finalMessages) => {
      setMessages(finalMessages);
      setUserInput("");
      queryClient.invalidateQueries({ queryKey: ["onboardingSessions"] });
    },
    onError: () => {
      toast.error("Failed to send message");
    }
  });

  const handleSendMessage = () => {
    if (!userInput.trim()) return;
    if (!currentSessionId) {
      toast.error("Please start a session first");
      return;
    }
    sendMessageMutation.mutate(userInput);
  };

  const handleVoiceInput = async () => {
    if (!('webkitSpeechRecognition' in window)) {
      toast.error("Voice input not supported in this browser");
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsRecording(true);
    recognition.onend = () => setIsRecording(false);
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setUserInput(transcript);
    };

    recognition.start();
  };

  const currentSession = sessions.find(s => s.id === currentSessionId);

  return (
    <div className="p-6 max-w-4xl mx-auto min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-display text-primary mb-2">AI App Coach</h1>
        <p className="text-muted-foreground">
          Let's design the perfect application for your business together
        </p>
      </div>

      {/* Status Badge */}
      {currentSession && (
        <Badge className="mb-4 capitalize">
          {currentSession.status.replace('_', ' ')}
        </Badge>
      )}

      {/* Chat Container */}
      <Card className="rounded-xl mb-4" style={{ height: "500px", display: "flex", flexDirection: "column" }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Discovery Session
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto space-y-4">
          {messages.length === 0 && !currentSessionId ? (
            <div className="text-center py-12">
              <Button
                onClick={() => createSessionMutation.mutate()}
                disabled={createSessionMutation.isPending}
                className="bg-primary hover:bg-primary/90"
              >
                {createSessionMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                Start Onboarding Session
              </Button>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-xl p-4 ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
                {msg.role === "user" && (
                  <div className="h-8 w-8 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 text-secondary" />
                  </div>
                )}
              </div>
            ))
          )}
          {sendMessageMutation.isPending && (
            <div className="flex gap-3 justify-start">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <div className="bg-muted rounded-xl p-4">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Input Area */}
      <div className="flex gap-2">
        <Textarea
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          placeholder="Type your response or click the mic to speak..."
          className="min-h-[80px] resize-none"
          disabled={!currentSessionId || sendMessageMutation.isPending}
        />
        <div className="flex flex-col gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleVoiceInput}
            disabled={!currentSessionId || sendMessageMutation.isPending || isRecording}
            className="h-10 w-10"
          >
            <Mic className={`h-4 w-4 ${isRecording ? "text-destructive animate-pulse" : ""}`} />
          </Button>
          <Button
            size="icon"
            onClick={handleSendMessage}
            disabled={!currentSessionId || !userInput.trim() || sendMessageMutation.isPending}
            className="h-10 w-10 bg-primary hover:bg-primary/90"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}