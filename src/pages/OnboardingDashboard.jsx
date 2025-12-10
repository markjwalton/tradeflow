import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Plus, Users, TrendingUp, AlertTriangle, Clock, CheckCircle2, 
  Calendar, Sparkles
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import AIInsightsPanel from "@/components/onboarding/AIInsightsPanel";
import OnboardingMetrics from "@/components/onboarding/OnboardingMetrics";
import RiskAlerts from "@/components/onboarding/RiskAlerts";

export default function OnboardingDashboard() {
  const [selectedView, setSelectedView] = useState("all");

  const { data: sessions = [] } = useQuery({
    queryKey: ["onboardingSessions"],
    queryFn: () => base44.entities.OnboardingSession.list("-updated_date"),
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ["onboardingTasks"],
    queryFn: () => base44.entities.OnboardingTask.list("-created_date"),
  });

  const activeSessions = sessions.filter(s => !["approved", "implementation"].includes(s.status));
  const completedSessions = sessions.filter(s => s.status === "approved");
  const overdueTasks = tasks.filter(t => t.status !== "completed" && t.due_date && new Date(t.due_date) < new Date());

  const getStatusColor = (status) => {
    const colors = {
      discovery: "bg-blue-500",
      analysis: "bg-purple-500",
      proposal: "bg-yellow-500",
      review: "bg-orange-500",
      approved: "bg-green-500",
      implementation: "bg-teal-500"
    };
    return colors[status] || "bg-gray-500";
  };

  const getProgressPercentage = (status) => {
    const stages = ["discovery", "analysis", "proposal", "review", "approved", "implementation"];
    const index = stages.indexOf(status);
    return ((index + 1) / stages.length) * 100;
  };

  return (
    <div className="pb-[var(--spacing-6)] max-w-4xl mx-auto min-h-screen">
      {/* Page Header */}
      <div className="bg-white [margin-bottom:var(--spacing-6)] -mx-6 px-6 pt-2 pb-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display text-[var(--color-text-primary)] [margin-bottom:var(--spacing-2)]">
              Onboarding Dashboard
            </h1>
            <p className="text-[var(--color-text-muted)]">
              Manage and monitor all tenant onboarding processes
            </p>
          </div>
          <Link to={createPageUrl("OnboardingWorkflow")}>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Onboarding
            </Button>
          </Link>
        </div>
      </div>

      {/* Background Container */}
      <div className="bg-[var(--color-background)] rounded-xl -mx-6 px-6 py-6 min-h-screen">
        <div className="space-y-6">

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Onboardings</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSessions.length}</div>
            <p className="text-xs text-muted-foreground">In progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedSessions.length}</div>
            <p className="text-xs text-muted-foreground">This quarter</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Overdue Tasks</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{overdueTasks.length}</div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg. Time to Complete</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12.5</div>
            <p className="text-xs text-muted-foreground">Days</p>
          </CardContent>
        </Card>
      </div>

        <Tabs value={selectedView} onValueChange={setSelectedView}>
        <TabsList>
          <TabsTrigger value="all">All Onboardings</TabsTrigger>
          <TabsTrigger value="insights">
            <Sparkles className="h-4 w-4 mr-2" />
            AI Insights
          </TabsTrigger>
          <TabsTrigger value="risks">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Risks & Issues
          </TabsTrigger>
          <TabsTrigger value="metrics">
            <TrendingUp className="h-4 w-4 mr-2" />
            Performance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {/* Active Sessions */}
          <Card>
            <CardHeader>
              <CardTitle>Active Onboarding Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              {activeSessions.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No active onboarding sessions</p>
                  <Link to={createPageUrl("OnboardingWorkflow")}>
                    <Button className="mt-4" variant="outline">Start New Onboarding</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeSessions.map((session) => (
                    <div key={session.id} className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg">
                              {session.tenant_id ? `Tenant: ${session.tenant_id}` : "Unnamed Session"}
                            </h3>
                            <Badge className={getStatusColor(session.status)}>
                              {session.status}
                            </Badge>
                          </div>
                          {session.high_level_summary && (
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                              {session.high_level_summary}
                            </p>
                          )}
                          <div className="flex items-center gap-6 text-sm">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span>Updated {new Date(session.updated_date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Progress value={getProgressPercentage(session.status)} className="w-32" />
                              <span>{Math.round(getProgressPercentage(session.status))}%</span>
                            </div>
                          </div>
                        </div>
                        <Link to={createPageUrl("OnboardingWorkflow") + `?session=${session.id}`}>
                          <Button variant="outline" size="sm">
                            Manage
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Overdue Tasks */}
          {overdueTasks.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-destructive flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Overdue Tasks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {overdueTasks.slice(0, 5).map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{task.task_title}</p>
                        <p className="text-sm text-muted-foreground">
                          Due: {new Date(task.due_date).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="destructive">{task.priority || "medium"}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="insights">
          <AIInsightsPanel sessions={sessions} tasks={tasks} />
        </TabsContent>

        <TabsContent value="risks">
          <RiskAlerts sessions={sessions} tasks={tasks} />
        </TabsContent>

        <TabsContent value="metrics">
          <OnboardingMetrics sessions={sessions} />
        </TabsContent>
        </Tabs>
        </div>
      </div>
    </div>
  );
}