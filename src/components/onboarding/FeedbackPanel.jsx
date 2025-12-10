import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MessageSquare, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function FeedbackPanel({ sessionId, currentFeedback }) {
  const queryClient = useQueryClient();
  const [feedback, setFeedback] = useState(currentFeedback || "");

  const saveFeedbackMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.OnboardingSession.update(sessionId, {
        feedback_notes: feedback
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["onboardingSession"] });
      toast.success("Feedback saved");
    }
  });

  return (
    <Card className="rounded-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          Provide Feedback
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Share your thoughts on the proposed solution... What would you like to change? What concerns do you have?"
            className="min-h-[120px]"
          />
          <div className="flex justify-end">
            <Button
              onClick={() => saveFeedbackMutation.mutate()}
              disabled={saveFeedbackMutation.isPending || !feedback.trim()}
              className="bg-primary hover:bg-primary/90"
            >
              {saveFeedbackMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Save Feedback
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}