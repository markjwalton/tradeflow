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
  Plus, Calendar, FileText, CheckSquare, 
  MessageSquare, Users, ArrowRight, Settings, Sparkles, Loader2, Database, ExternalLink
} from "lucide-react";
import { createPageUrl } from "@/utils";
import { toast } from "sonner";
import CreateTaskDialog from "@/components/onboarding/CreateTaskDialog";
import MeetingRecorder from "@/components/onboarding/MeetingRecorder";
import DiaryNotes from "@/components/onboarding/DiaryNotes";
import MeetingScheduler from "@/components/onboarding/MeetingScheduler";
import WorkflowProgress from "@/components/onboarding/WorkflowProgress";
import BuildApplicationButton from "@/components/onboarding/BuildApplicationButton";

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

  const { data: tenantProfile } = useQuery({
    queryKey: ["tenantProfile", session?.tenant_id],
    queryFn: () => base44.entities.TenantProfile.filter({ tenant_id: session.tenant_id }).then(r => r[0]),
    enabled: !!session?.tenant_id,
  });

  const { data: businessProfile } = useQuery({
    queryKey: ["businessProfile", sessionId],
    queryFn: () => base44.entities.BusinessProfile.filter({ onboarding_session_id: sessionId }).then(r => r[0]),
    enabled: !!sessionId,
  });

  const { data: processes = [] } = useQuery({
    queryKey: ["processes", sessionId],
    queryFn: () => base44.entities.OperationalProcess.filter({ onboarding_session_id: sessionId }),
    enabled: !!sessionId,
  });

  const { data: requirements = [] } = useQuery({
    queryKey: ["requirements", sessionId],
    queryFn: () => base44.entities.Requirement.filter({ onboarding_session_id: sessionId }),
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
      toast.success("Session created!");
      window.location.href = createPageUrl("OnboardingWorkflow") + `?session=${data.id}`;
    },
    onError: (error) => {
      toast.error("Failed to create session: " + error.message);
    }
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

  const generateArchitectureMutation = useMutation({
    mutationFn: async () => {
      return await base44.functions.invoke('generateArchitecture', { sessionId });
    },
    onSuccess: (response) => {
      const counts = response.data.counts;
      toast.success(`Generated ${counts.entities} entities, ${counts.pages} pages, ${counts.features} features, ${counts.integrations} integrations`);
      queryClient.invalidateQueries(["entitySchemas", sessionId]);
      queryClient.invalidateQueries(["pageSchemas", sessionId]);
      queryClient.invalidateQueries(["featureSchemas", sessionId]);
      queryClient.invalidateQueries(["integrationSchemas", sessionId]);
    },
    onError: (error) => {
      toast.error("Architecture generation failed: " + error.message);
    }
  });

  const createTestDataMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('createTestData', { sessionId });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(`✅ Created: Tenant Profile + Business Profile + ${data.processes} Processes + ${data.requirements} Requirements`);
      queryClient.invalidateQueries(["tenantProfile"]);
      queryClient.invalidateQueries(["businessProfile"]);
      queryClient.invalidateQueries(["processes"]);
      queryClient.invalidateQueries(["requirements"]);
    },
    onError: (error) => {
      toast.error("Failed: " + error.message);
    }
  });

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
    <div className="h-screen flex flex-col bg-slate-50">
      {/* Fixed Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-slate-900 flex items-center justify-center">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-slate-900">
                  {session?.tenant_id || "Unnamed Tenant"}
                </h1>
                <div className="flex items-center gap-3 mt-1">
                  <Badge variant="outline" className="text-xs">{session?.status}</Badge>
                  <span className="text-xs text-slate-500">
                    Started {new Date(session?.created_date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" asChild>
                  <a href={createPageUrl("ClientOnboardingPortal") + `?session=${sessionId}`} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-3 w-3" />
                    Portal
                  </a>
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <a href={createPageUrl("TenantSetup") + `?session=${sessionId}&tenant=${session.tenant_id}`}>
                    <Settings className="mr-2 h-3 w-3" />
                    Profile
                  </a>
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => generateArchitectureMutation.mutate()}
                  disabled={generateArchitectureMutation.isPending}
                >
                  {generateArchitectureMutation.isPending ? (
                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-3 w-3" />
                  )}
                  Generate
                </Button>
                <BuildApplicationButton sessionId={sessionId} />
                <Button size="sm" variant="outline" asChild>
                  <a href={createPageUrl("OnboardingSpecifications") + `?session=${sessionId}`}>
                    <Database className="mr-2 h-3 w-3" />
                    Specs
                  </a>
                </Button>
                <Button size="sm" onClick={handleAdvanceStage}>
                  Next Stage
                  <ArrowRight className="ml-2 h-3 w-3" />
                </Button>
              </div>
          </div>
          
          <WorkflowProgress status={session?.status} />
        </div>
      </div>

      {/* Scrollable Content */}
      <ScrollArea className="flex-1">
        <div className="p-6">
          <div className="max-w-7xl mx-auto grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 w-full bg-slate-100">
                  <TabsTrigger value="overview" className="data-[state=active]:bg-white">
                    <FileText className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Overview</span>
                  </TabsTrigger>
                  <TabsTrigger value="tasks" className="data-[state=active]:bg-white">
                    <CheckSquare className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Tasks</span>
                  </TabsTrigger>
                  <TabsTrigger value="meetings" className="data-[state=active]:bg-white">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Meetings</span>
                  </TabsTrigger>
                  <TabsTrigger value="notes" className="data-[state=active]:bg-white">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Notes</span>
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
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start"
                onClick={() => {
                  console.log('Creating test data for session:', sessionId);
                  createTestDataMutation.mutate();
                }}
                disabled={createTestDataMutation.isPending}
              >
                {createTestDataMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Create Test Data
                  </>
                )}
              </Button>
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

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Test Data Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tenant Profile</span>
                <Badge variant={tenantProfile ? "default" : "outline"}>
                  {tenantProfile ? "✓" : "—"}
                </Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Business Profile</span>
                <Badge variant={businessProfile ? "default" : "outline"}>
                  {businessProfile ? "✓" : "—"}
                </Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Processes</span>
                <span className="font-medium">{processes.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Requirements</span>
                <span className="font-medium">{requirements.length}</span>
              </div>
            </CardContent>
          </Card>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}