import React, { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Send, Sparkles, BookOpen, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AIKnowledgeChat({ sessionId }) {
  const queryClient = useQueryClient();
  const [input, setInput] = useState("");
  const [isAsking, setIsAsking] = useState(false);
  const [conversation, setConversation] = useState([]);
  const messagesEndRef = useRef(null);

  const { data: knowledgeEntries = [] } = useQuery({
    queryKey: ["knowledgeEntries", sessionId],
    queryFn: () => base44.entities.KnowledgeEntry.filter({ 
      onboarding_session_id: sessionId,
      is_important: true 
    }),
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation]);

  const askQuestion = async () => {
    if (!input.trim() || isAsking) return;

    const question = input.trim();
    setInput("");
    setIsAsking(true);

    setConversation(prev => [...prev, { role: "user", content: question }]);

    try {
      const context = knowledgeEntries.map(e => `Q: ${e.question}\nA: ${e.answer}`).join("\n\n");
      
      const prompt = `You are an AI assistant helping with an onboarding project. Answer the user's question based on the knowledge base below.

Knowledge Base:
${context}

User Question: ${question}

Provide a helpful, concise answer. If the information isn't in the knowledge base, say so and offer general guidance.`;

      const result = await base44.integrations.Core.InvokeLLM({ prompt });
      
      setConversation(prev => [...prev, { role: "assistant", content: result }]);

      // Save to knowledge base
      await base44.entities.KnowledgeEntry.create({
        onboarding_session_id: sessionId,
        question,
        answer: result,
        source: "ai",
        is_important: false
      });

      queryClient.invalidateQueries({ queryKey: ["knowledgeEntries"] });
    } catch (error) {
      toast.error("Failed to get answer");
      setConversation(prev => [...prev, { 
        role: "assistant", 
        content: "Sorry, I encountered an error. Please try again." 
      }]);
    }

    setIsAsking(false);
  };

  return (
    <div className="space-y-6">
      <Card className="rounded-xl bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/10">
        <CardContent className="pt-6 pb-6">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-display text-primary mb-1">AI Assistant</h3>
              <p className="text-sm text-muted-foreground">Ask questions about your project, get instant answers</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        <Card className="rounded-xl">
          <CardHeader>
            <CardTitle className="text-lg">Knowledge Base</CardTitle>
            <p className="text-sm text-muted-foreground">{knowledgeEntries.length} important entries</p>
          </CardHeader>
          <CardContent>
            {knowledgeEntries.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-50" />
                <p className="text-sm text-muted-foreground">No knowledge entries yet</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {knowledgeEntries.map(entry => (
                  <div key={entry.id} className="p-3 border rounded-lg space-y-1">
                    <div className="font-medium text-sm">{entry.question}</div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{entry.answer}</p>
                    <div className="flex gap-1 flex-wrap">
                      {entry.tags?.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-xl">
          <CardHeader>
            <CardTitle className="text-lg">Chat with AI</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-80 overflow-y-auto space-y-3 p-4 bg-muted/20 rounded-lg">
              {conversation.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <p className="text-sm">Ask me anything about your project!</p>
                </div>
              ) : (
                <>
                  {conversation.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[80%] p-3 rounded-lg ${
                        msg.role === "user" 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-card border"
                      }`}>
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>
            
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && askQuestion()}
                placeholder="Ask a question..."
                disabled={isAsking}
              />
              <Button onClick={askQuestion} disabled={isAsking || !input.trim()}>
                {isAsking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}