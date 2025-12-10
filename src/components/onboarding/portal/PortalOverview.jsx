import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, AlertTriangle } from "lucide-react";

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
      <Card className="rounded-xl border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
        <CardHeader>
          <CardTitle className="text-2xl">Your Onboarding Journey</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Welcome to your personalized onboarding portal. We'll guide you through each step of bringing your application to life.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {milestones.map((milestone, idx) => (
          <Card key={milestone.key} className="rounded-xl">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {milestone.completed ? (
                    <CheckCircle className="h-5 w-5 text-success" />
                  ) : session.status === milestone.key ? (
                    <Clock className="h-5 w-5 text-primary animate-pulse" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-muted-foreground" />
                  )}
                  <div>
                    <CardTitle className="text-base">{milestone.label}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">{milestone.description}</p>
                  </div>
                </div>
                {milestone.completed && (
                  <Badge variant="default" className="bg-success">Complete</Badge>
                )}
                {session.status === milestone.key && (
                  <Badge variant="default">In Progress</Badge>
                )}
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

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