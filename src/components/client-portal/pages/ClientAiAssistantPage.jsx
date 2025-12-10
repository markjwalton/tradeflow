import React, { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Send, Loader2, BookOpen } from "lucide-react";
import { toast } from "sonner";

export function ClientAiAssistantPage({ sessionId }) {
  const queryClient = useQueryClient();
  const [input, setInput] = useState("");
  const [conversation, setConversation] = useState([]);
  const messagesEndRef = useRef(null);

  const { data: knowledge = [] } = useQuery({
    queryKey: ["clientKnowledge", sessionId],
    queryFn: () => base44.entities.KnowledgeEntry.filter({ 
      onboarding_session_id: sessionId,
      is_important: true 
    }),
  });

  const askMutation = useMutation({
    mutationFn: async (question) => {
      const context = knowledge.map(e => `Q: ${e.question}\nA: ${e.answer}`).join("\n\n");
      const prompt = `Answer based on this knowledge base:\n\n${context}\n\nUser: ${question}`;
      return await base44.integrations.Core.InvokeLLM({ prompt });
    },
    onSuccess: (answer, question) => {
      setConversation(prev => [...prev, { role: "assistant", content: answer }]);
      base44.entities.KnowledgeEntry.create({
        onboarding_session_id: sessionId,
        question,
        answer,
        source: "ai",
        is_important: false
      });
      queryClient.invalidateQueries(["clientKnowledge"]);
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation]);

  function handleAsk(e) {
    e.preventDefault();
    if (!input.trim() || askMutation.isPending) return;
    const question = input.trim();
    setInput("");
    setConversation(prev => [...prev, { role: "user", content: question }]);
    askMutation.mutate(question);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
        <h2 className="mb-3 text-sm font-semibold text-slate-100">AI Assistant</h2>
        <div className="h-[400px] overflow-y-auto rounded-md bg-slate-950/60 p-3">
          {conversation.length === 0 && (
            <p className="py-8 text-center text-xs text-slate-500">Ask me anything!</p>
          )}
          {conversation.map((msg, idx) => (
            <div key={idx} className={`mb-3 flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-lg p-3 text-xs ${
                msg.role === "user" 
                  ? "bg-emerald-950/40 text-emerald-100" 
                  : "bg-slate-800 text-slate-200"
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <form onSubmit={handleAsk} className="mt-3 flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            className="text-xs"
            disabled={askMutation.isPending}
          />
          <Button size="sm" disabled={askMutation.isPending || !input.trim()}>
            {askMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">
          Key Knowledge
        </h3>
        {knowledge.length === 0 ? (
          <div className="py-8 text-center">
            <BookOpen className="mx-auto mb-2 h-8 w-8 text-slate-600" />
            <p className="text-xs text-slate-500">No entries yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {knowledge.map(entry => (
              <div key={entry.id} className="rounded-lg border border-slate-800 bg-slate-950/40 p-3">
                <div className="text-xs font-medium text-slate-200 mb-1">{entry.question}</div>
                <p className="text-[11px] text-slate-400 line-clamp-2">{entry.answer}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}