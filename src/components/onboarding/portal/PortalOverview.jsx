import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, Circle, Sparkles } from "lucide-react";

export default function PortalOverview({ session }) {
  const milestones = [
    { 
      key: "discovery", 
      label: "Discovery Phase", 
      description: "Initial consultation and requirements gathering",
      completed: ["analysis", "proposal", "review", "approved"].includes(session.status)
    },
    { 
      key: "analysis", 
      label: "Analysis & Design", 
      description: "Solution architecture and technical planning",
      completed: ["proposal", "review", "approved"].includes(session.status)
    },
    { 
      key: "proposal", 
      label: "Proposal Review", 
      description: "Review and approve the proposed solution",
      completed: ["review", "approved"].includes(session.status)
    },
    { 
      key: "review", 
      label: "Contract & SLA", 
      description: "Legal agreements and service level definitions",
      completed: session.status === "approved"
    },
    { 
      key: "approved", 
      label: "Implementation", 
      description: "Development and deployment of your application",
      completed: false
    },
  ];

  return (
    <div className="space-y-6">
      <Card className="rounded-xl bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 border-primary/10">
        <CardContent className="pt-8 pb-8">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-display text-primary mb-2">Welcome to Your Onboarding Journey</h2>
              <p className="text-muted-foreground leading-relaxed">
                We'll guide you through each step of bringing your application to life. Track your progress, access technical documentation, and collaborate with our team throughout the process.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-xl">
        <CardHeader>
          <CardTitle className="text-lg">Project Milestones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {milestones.map((milestone, idx) => (
              <div
                key={milestone.key}
                className="flex items-start gap-4 p-4 rounded-lg border hover:border-primary/30 transition-colors"
              >
                <div className="mt-1">
                  {milestone.completed ? (
                    <div className="h-6 w-6 rounded-full bg-success/10 flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-success" />
                    </div>
                  ) : session.status === milestone.key ? (
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                      <Clock className="h-4 w-4 text-primary animate-pulse" />
                    </div>
                  ) : (
                    <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center">
                      <Circle className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium text-sm">{milestone.label}</h3>
                    {milestone.completed && (
                      <Badge className="bg-success/10 text-success hover:bg-success/20">Complete</Badge>
                    )}
                    {session.status === milestone.key && (
                      <Badge>Active</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{milestone.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {session.high_level_summary && (
        <Card className="rounded-xl">
          <CardHeader>
            <CardTitle>Your Business Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-muted-foreground">{session.high_level_summary}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}