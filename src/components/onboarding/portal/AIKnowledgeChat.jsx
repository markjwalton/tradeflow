import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Send, Loader2, Star, BookOpen } from "lucide-react";
import { toast } from "sonner";

export default function AIKnowledgeChat({ sessionId }) {
  const queryClient = useQueryClient();
  const [input, setInput] = useState("");
  const [isAsking, setIsAsking] = useState(false);
  const messagesEndRef = useRef(null);

  const { data: session } = useQuery({
    queryKey: ["onboardingSession", sessionId],
    queryFn: () => base44.entities.OnboardingSession.filter({ id: sessionId }).then(r => r[0]),
  });

  const { data: knowledgeEntries = [] } = useQuery({
    queryKey: ["knowledgeEntries", sessionId],
    queryFn: () => base44.entities.KnowledgeEntry.filter({ onboarding_session_id: sessionId }),
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [knowledgeEntries]);

  const askQuestion = async () => {
    if (!input.trim()) return;
    
    setIsAsking(true);
    const question = input;
    setInput("");

    try {
      // Build context from conversation and knowledge base
      const conversationContext = session?.conversation_history
        ?.map(m => `${m.role}: ${m.content}`)
        .join('\n\n') || '';
      
      const knowledgeContext = knowledgeEntries
        .filter(e => e.is_important)
        .map(e => `Q: ${e.question}\nA: ${e.answer}`)
        .join('\n\n');

      const prompt = `You are an AI assistant helping with a tenant onboarding process. Answer the following question based on the context provided.

CONVERSATION HISTORY:
${conversationContext}

IMPORTANT KNOWLEDGE:
${knowledgeContext}

CUSTOMER QUESTION:
${question}

Provide a helpful, clear answer. If you need more information, ask clarifying questions.`;

      const answer = await base44.integrations.Core.InvokeLLM({ prompt });

      // Save to knowledge base
      await base44.entities.KnowledgeEntry.create({
        onboarding_session_id: sessionId,
        question,
        answer,
        source: "ai",
        is_important: false,
        tags: []
      });

      queryClient.invalidateQueries({ queryKey: ["knowledgeEntries"] });
      
      // Check if we should create a task from this interaction
      const shouldCreateTask = await base44.integrations.Core.InvokeLLM({
        prompt: `Based on this Q&A, determine if an onboarding task should be created:

Question: ${question}
Answer: ${answer}

Return JSON with: should_create_task (boolean), task_title, task_description, task_category (documentation/development/review/approval/deployment/training)`,
        response_json_schema: {
          type: "object",
          properties: {
            should_create_task: { type: "boolean" },
            task_title: { type: "string" },
            task_description: { type: "string" },
            task_category: { type: "string" }
          }
        }
      });

      if (shouldCreateTask.should_create_task) {
        await base44.entities.OnboardingTask.create({
          onboarding_session_id: sessionId,
          task_title: shouldCreateTask.task_title,
          task_description: shouldCreateTask.task_description,
          category: shouldCreateTask.task_category,
          status: "todo",
          priority: "medium"
        });
        queryClient.invalidateQueries({ queryKey: ["onboardingTasks"] });
        toast.success("Task created from this conversation");
      }
    } catch (error) {
      toast.error("Failed to get answer");
      console.error(error);
    } finally {
      setIsAsking(false);
    }
  };

  const toggleImportant = useMutation({
    mutationFn: ({ id, isImportant }) => 
      base44.entities.KnowledgeEntry.update(id, { is_important: !isImportant }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knowledgeEntries"] });
    }
  });

  return (
    <div className="space-y-6">
      <Card className="rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Knowledge Assistant
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-[400px] overflow-y-auto space-y-3 p-4 bg-muted/30 rounded-lg">
              {knowledgeEntries.length === 0 ? (
                <div className="text-center text-muted-foreground py-12">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Ask me anything about your onboarding process</p>
                </div>
              ) : (
                knowledgeEntries.map(entry => (
                  <div key={entry.id} className="space-y-2">
                    <div className="bg-primary/10 p-3 rounded-lg ml-12">
                      <div className="text-xs text-muted-foreground mb-1">You</div>
                      <p className="text-sm">{entry.question}</p>
                    </div>
                    <div className="bg-card p-3 rounded-lg mr-12 border">
                      <div className="flex items-center justify-between mb-1">
                        <div className="text-xs text-muted-foreground">AI Assistant</div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleImportant.mutate({ id: entry.id, isImportant: entry.is_important })}
                          className="h-6 w-6 p-0"
                        >
                          <Star className={`h-3 w-3 ${entry.is_important ? 'fill-warning text-warning' : ''}`} />
                        </Button>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{entry.answer}</p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && askQuestion()}
                placeholder="Ask a question about your project..."
                disabled={isAsking}
              />
              <Button onClick={askQuestion} disabled={isAsking || !input.trim()}>
                {isAsking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}