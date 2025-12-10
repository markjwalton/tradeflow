import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckSquare, Clock, AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function TaskManager({ sessionId, currentUser }) {
  const queryClient = useQueryClient();

  const { data: tasks = [] } = useQuery({
    queryKey: ["onboardingTasks", sessionId],
    queryFn: () => base44.entities.OnboardingTask.filter({ onboarding_session_id: sessionId }),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.OnboardingTask.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["onboardingTasks"] });
      toast.success("Task updated");
    }
  });

  const myTasks = tasks.filter(t => t.assigned_to === currentUser?.email);
  const allTasks = tasks;

  const getStatusIcon = (status) => {
    switch(status) {
      case "completed": return <CheckCircle className="h-4 w-4 text-success" />;
      case "in_progress": return <Clock className="h-4 w-4 text-primary" />;
      case "blocked": return <AlertCircle className="h-4 w-4 text-destructive" />;
      default: return <CheckSquare className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case "critical": return "bg-destructive";
      case "high": return "bg-warning";
      case "medium": return "bg-primary";
      default: return "bg-secondary";
    }
  };

  return (
    <div className="space-y-6">
      <Card className="rounded-xl bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/10">
        <CardContent className="pt-6 pb-6">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <CheckSquare className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-display text-primary mb-1">Task Management</h3>
              <p className="text-sm text-muted-foreground">Track action items, deliverables, and project milestones</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="rounded-xl">
          <CardHeader>
            <CardTitle className="text-lg">My Tasks</CardTitle>
            <p className="text-sm text-muted-foreground">{myTasks.length} assigned to you</p>
          </CardHeader>
        <CardContent>
          {myTasks.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No tasks assigned to you</p>
          ) : (
            <div className="space-y-3">
              {myTasks.map(task => (
                <div key={task.id} className="p-4 border rounded-lg space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(task.status)}
                      <div className="font-semibold">{task.task_title}</div>
                    </div>
                    <Badge className={getPriorityColor(task.priority)}>
                      {task.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{task.task_description}</p>
                  {task.status !== "completed" && (
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateStatusMutation.mutate({ id: task.id, status: "in_progress" })}
                        disabled={task.status === "in_progress"}
                      >
                        Start
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => updateStatusMutation.mutate({ id: task.id, status: "completed" })}
                        className="bg-success hover:bg-success/90"
                      >
                        Complete
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

        <Card className="rounded-xl">
          <CardHeader>
            <CardTitle className="text-lg">All Tasks</CardTitle>
            <p className="text-sm text-muted-foreground">{allTasks.length} total task{allTasks.length !== 1 ? 's' : ''}</p>
          </CardHeader>
        <CardContent>
          {allTasks.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No tasks created yet</p>
          ) : (
            <div className="space-y-3">
              {allTasks.map(task => (
                <div key={task.id} className="p-4 border rounded-lg space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(task.status)}
                      <div className="font-semibold">{task.task_title}</div>
                    </div>
                    <Badge className={getPriorityColor(task.priority)}>
                      {task.priority}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline">{task.category}</Badge>
                    {task.assigned_to && <span>• Assigned to {task.assigned_to}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
        </Card>
      </div>
    </div>
  );
}