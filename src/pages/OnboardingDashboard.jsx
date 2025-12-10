import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, FileText, Send, Loader2 } from "lucide-react";
import { useTenant } from "@/Layout";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

import SessionStepper from "@/components/onboarding/SessionStepper";
import AnalysisView from "@/components/onboarding/AnalysisView";
import DataExtractionView from "@/components/onboarding/DataExtractionView";
import FeedbackPanel from "@/components/onboarding/FeedbackPanel";

export default function OnboardingDashboard() {
  const { tenantId } = useTenant();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isGenerating, setIsGenerating] = useState(false);

  // Fetch sessions
  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ["onboardingSessions", tenantId],
    queryFn: () => base44.entities.OnboardingSession.filter({ tenant_id: tenantId }),
    enabled: !!tenantId,
  });

  const activeSession = sessions.find(s => s.status !== "approved" && s.status !== "implementation") || sessions[0];

  // Generate AI Analysis
  const generateAnalysis = async () => {
    if (!activeSession) return;
    
    setIsGenerating(true);
    try {
      // Extract conversation context
      const conversationContext = activeSession.conversation_history
        ?.map(m => `${m.role}: ${m.content}`)
        .join('\n\n') || '';

      // Generate high-level summary
      const summaryPrompt = `Based on this onboarding conversation, create a concise high-level summary of the business, their key challenges, and what they want to achieve:

${conversationContext}

Provide a 2-3 paragraph executive summary.`;

      const summary = await base44.integrations.Core.InvokeLLM({
        prompt: summaryPrompt,
      });

      // Generate solution architecture
      const architecturePrompt = `Based on this business analysis, propose a solution architecture:

${conversationContext}

Provide a JSON structure with:
- entities: array of entity names needed (e.g., ["Customer", "Project", "Invoice"])
- pages: array of page names (e.g., ["Dashboard", "CustomerManagement", "ProjectTracking"])
- integrations: array of integrations needed (e.g., ["QuickBooks", "Email", "SMS"])
- workflows: brief description of key workflows`;

      const architecture = await base44.integrations.Core.InvokeLLM({
        prompt: architecturePrompt,
        response_json_schema: {
          type: "object",
          properties: {
            entities: { type: "array", items: { type: "string" } },
            pages: { type: "array", items: { type: "string" } },
            integrations: { type: "array", items: { type: "string" } },
            workflows: { type: "string" }
          }
        }
      });

      // Generate development plan
      const planPrompt = `Based on the solution architecture, create a phased development plan:

Architecture:
${JSON.stringify(architecture, null, 2)}

Provide a detailed development plan with phases, tasks, and estimated timelines.`;

      const plan = await base44.integrations.Core.InvokeLLM({
        prompt: planPrompt,
      });

      // Generate technical recommendations
      const techPrompt = `Based on the business requirements and proposed solution, provide technical and security recommendations:

${conversationContext}

Architecture:
${JSON.stringify(architecture, null, 2)}

Cover: data security, performance optimization, scalability considerations, and best practices.`;

      const recommendations = await base44.integrations.Core.InvokeLLM({
        prompt: techPrompt,
      });

      // Update session with analysis
      await base44.entities.OnboardingSession.update(activeSession.id, {
        high_level_summary: summary,
        proposed_architecture: architecture,
        development_plan: plan,
        technical_recommendations: recommendations,
        status: "proposal"
      });

      queryClient.invalidateQueries({ queryKey: ["onboardingSessions"] });
      toast.success("Analysis generated successfully");
    } catch (error) {
      toast.error("Failed to generate analysis");
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Approve and move to implementation
  const approveMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.OnboardingSession.update(activeSession.id, {
        status: "approved"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["onboardingSessions"] });
      toast.success("Onboarding approved! Ready for implementation.");
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!activeSession) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Card className="rounded-xl">
          <CardHeader>
            <CardTitle>No Active Onboarding Session</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Start a new onboarding session to design your application.
            </p>
            <Button onClick={() => navigate(createPageUrl("AIOnboarding"))}>
              Start Onboarding
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-display text-primary mb-2">Onboarding Dashboard</h1>
        <p className="text-muted-foreground">Review and manage your application design</p>
      </div>

      <SessionStepper currentStatus={activeSession.status} />

      <Tabs defaultValue="analysis" className="space-y-4">
        <TabsList>
          <TabsTrigger value="conversation" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            Conversation
          </TabsTrigger>
          <TabsTrigger value="analysis" className="gap-2">
            <FileText className="h-4 w-4" />
            Analysis & Proposal
          </TabsTrigger>
          <TabsTrigger value="data" className="gap-2">
            <FileText className="h-4 w-4" />
            Structured Data
          </TabsTrigger>
          <TabsTrigger value="feedback" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            Feedback
          </TabsTrigger>
        </TabsList>

        <TabsContent value="conversation">
          <Card className="rounded-xl">
            <CardHeader>
              <CardTitle>Conversation History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {activeSession.conversation_history?.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg ${
                      msg.role === "user" ? "bg-primary/10 ml-12" : "bg-muted mr-12"
                    }`}
                  >
                    <div className="text-xs text-muted-foreground mb-1 capitalize">
                      {msg.role}
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Button
                  variant="outline"
                  onClick={() => navigate(createPageUrl("AIOnboarding"))}
                >
                  Continue Conversation
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis">
          <AnalysisView
            session={activeSession}
            onGenerateAnalysis={generateAnalysis}
            isGenerating={isGenerating}
          />

          {activeSession.status === "proposal" && (
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={() => navigate(createPageUrl("AIOnboarding"))}>
                Request Changes
              </Button>
              <Button
                onClick={() => approveMutation.mutate()}
                disabled={approveMutation.isPending}
                className="bg-success hover:bg-success/90"
              >
                {approveMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Approve & Begin Implementation
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="data">
          <DataExtractionView sessionId={activeSession.id} />
        </TabsContent>

        <TabsContent value="feedback">
          <FeedbackPanel
            sessionId={activeSession.id}
            currentFeedback={activeSession.feedback_notes}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}