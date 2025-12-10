import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Save, Plus, Calendar, Mic, FileText, CheckSquare, 
  MessageSquare, Users, Clock, ArrowRight, Settings
} from "lucide-react";
import { toast } from "sonner";
import CreateTaskDialog from "@/components/onboarding/CreateTaskDialog";
import MeetingRecorder from "@/components/onboarding/MeetingRecorder";
import DiaryNotes from "@/components/onboarding/DiaryNotes";
import MeetingScheduler from "@/components/onboarding/MeetingScheduler";
import WorkflowProgress from "@/components/onboarding/WorkflowProgress";

export default function OnboardingWorkflow() {
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const existingSessionId = urlParams.get("session");

  const [sessionId, setSessionId] = useState(existingSessionId);
  const [tenantName, setTenantName] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  const { data: session, isLoading } = useQuery({
    queryKey: ["onboardingSession", sessionId],
    queryFn: () => base44.entities.OnboardingSession.filter({ id: sessionId }).then(r => r[0]),
    enabled: !!sessionId,
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ["sessionTasks", sessionId],
    queryFn: () => base44.entities.OnboardingTask.filter({ onboarding_session_id: sessionId }),
    enabled: !!sessionId,
  });

  const createSessionMutation = useMutation({
    mutationFn: async (tenantId) => {
      return await base44.entities.OnboardingSession.create({
        tenant_id: tenantId,
        status: "discovery",
        conversation_history: [],
      });
    },
    onSuccess: (data) => {
      toast.success("Onboarding session created");
      // Redirect to tenant setup
      navigate(createPageUrl("TenantSetup") + `?session=${data.id}&tenant=${data.tenant_id}`);
    },
  });

  const updateSessionMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      return await base44.entities.OnboardingSession.update(id, data);
    },
    onSuccess: () => {
      toast.success("Session updated");
      queryClient.invalidateQueries(["onboardingSession", sessionId]);
    },
  });

  const handleCreateSession = async () => {
    if (!tenantName.trim()) {
      toast.error("Please enter a tenant name");
      return;
    }
    createSessionMutation.mutate(tenantName);
  };

  const handleAdvanceStage = async () => {
    const stages = ["discovery", "analysis", "proposal", "review", "approved", "implementation"];
    const currentIndex = stages.indexOf(session.status);
    const nextStage = stages[currentIndex + 1];
    
    if (nextStage) {
      await updateSessionMutation.mutateAsync({
        id: sessionId,
        data: { status: nextStage }
      });
    }
  };

  if (!sessionId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Start New Onboarding</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Tenant Name</label>
              <Input
                value={tenantName}
                onChange={(e) => setTenantName(e.target.value)}
                placeholder="Enter tenant name..."
                className="mt-2"
              />
            </div>
            <Button 
              onClick={handleCreateSession} 
              className="w-full"
              disabled={createSessionMutation.isPending}
            >
              {createSessionMutation.isPending ? "Creating..." : "Create Onboarding Session"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">
            Onboarding: {session?.tenant_id || "Unnamed"}
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <Badge variant="outline">{session?.status}</Badge>
            <span className="text-sm text-muted-foreground">
              Started {new Date(session?.created_date).toLocaleDateString()}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <a href={createPageUrl("TenantSetup") + `?session=${sessionId}&tenant=${session.tenant_id}`}>
              <Settings className="mr-2 h-4 w-4" />
              Edit Profile
            </a>
          </Button>
          <Button variant="outline" onClick={handleAdvanceStage}>
            Advance Stage
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button asChild>
            <a href={`/TenantOnboardingPortal?session=${sessionId}`} target="_blank" rel="noopener noreferrer">
              <Users className="mr-2 h-4 w-4" />
              Tenant Portal
            </a>
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <WorkflowProgress status={session?.status} />

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="overview">
                <FileText className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="tasks">
                <CheckSquare className="h-4 w-4 mr-2" />
                Tasks
              </TabsTrigger>
              <TabsTrigger value="meetings">
                <Calendar className="h-4 w-4 mr-2" />
                Meetings
              </TabsTrigger>
              <TabsTrigger value="notes">
                <MessageSquare className="h-4 w-4 mr-2" />
                Notes
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Business Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={session?.high_level_summary || ""}
                    onChange={(e) => updateSessionMutation.mutate({
                      id: sessionId,
                      data: { high_level_summary: e.target.value }
                    })}
                    placeholder="Enter business summary..."
                    rows={6}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Single Source of Truth</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={session?.single_source_of_truth || ""}
                    onChange={(e) => updateSessionMutation.mutate({
                      id: sessionId,
                      data: { single_source_of_truth: e.target.value }
                    })}
                    placeholder="Core requirements definition..."
                    rows={8}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tasks">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Tasks ({tasks.length})</CardTitle>
                  <CreateTaskDialog sessionId={sessionId} />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {tasks.map((task) => (
                      <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">{task.task_title}</p>
                          <p className="text-sm text-muted-foreground">
                            {task.assigned_to} • Due: {new Date(task.due_date).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge>{task.status}</Badge>
                      </div>
                    ))}
                    {tasks.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">No tasks yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="meetings">
              <MeetingScheduler sessionId={sessionId} />
            </TabsContent>

            <TabsContent value="notes">
              <DiaryNotes sessionId={sessionId} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <MeetingRecorder sessionId={sessionId} />
          
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Plus className="mr-2 h-4 w-4" />
                Add Reminder
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Users className="mr-2 h-4 w-4" />
                Invite Stakeholder
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <FileText className="mr-2 h-4 w-4" />
                Upload Document
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Session Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Tasks</span>
                <span className="font-medium">{tasks.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Completed</span>
                <span className="font-medium">{tasks.filter(t => t.status === "completed").length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Days Active</span>
                <span className="font-medium">
                  {Math.floor((new Date() - new Date(session?.created_date)) / (1000 * 60 * 60 * 24))}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}