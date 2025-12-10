import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, AlertCircle, CheckSquare } from "lucide-react";
import { toast } from "sonner";

export function ClientTasksPage({ sessionId, currentUser }) {
  const queryClient = useQueryClient();

  const { data: tasks = [] } = useQuery({
    queryKey: ["clientTasks", sessionId],
    queryFn: () => base44.entities.OnboardingTask.filter({ onboarding_session_id: sessionId }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.OnboardingTask.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries(["clientTasks"]);
      toast.success("Task updated");
    },
  });

  const myTasks = tasks.filter(t => t.assigned_to === currentUser?.email);

  function getStatusIcon(status) {
    switch(status) {
      case "completed": return <CheckCircle className="h-4 w-4 text-emerald-400" />;
      case "in_progress": return <Clock className="h-4 w-4 text-sky-400" />;
      case "blocked": return <AlertCircle className="h-4 w-4 text-rose-400" />;
      default: return <CheckSquare className="h-4 w-4 text-slate-500" />;
    }
  }

  function getPriorityBadge(priority) {
    const colors = {
      critical: "border-rose-500 text-rose-400 bg-rose-950/40",
      high: "border-amber-500 text-amber-400 bg-amber-950/40",
      medium: "border-sky-500 text-sky-400 bg-sky-950/40",
      low: "border-slate-500 text-slate-400 bg-slate-950/40"
    };
    return (
      <Badge variant="outline" className={colors[priority]}>
        {priority}
      </Badge>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
        <h2 className="text-sm font-semibold text-slate-100 mb-3">My Tasks</h2>
        <p className="text-xs text-slate-400 mb-4">{myTasks.length} assigned to you</p>
        {myTasks.length === 0 ? (
          <p className="py-8 text-center text-xs text-slate-500">No tasks assigned</p>
        ) : (
          <div className="space-y-3">
            {myTasks.map(task => (
              <div key={task.id} className="rounded-lg border border-slate-800 bg-slate-950/40 p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(task.status)}
                    <div className="text-sm font-medium text-slate-100">{task.task_title}</div>
                  </div>
                  {getPriorityBadge(task.priority)}
                </div>
                <p className="text-xs text-slate-400 mb-3">{task.task_description}</p>
                {task.status !== "completed" && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateMutation.mutate({ id: task.id, status: "in_progress" })}
                      disabled={task.status === "in_progress"}
                    >
                      Start
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => updateMutation.mutate({ id: task.id, status: "completed" })}
                      className="bg-emerald-950/40 text-emerald-400 hover:bg-emerald-950/60"
                    >
                      Complete
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
        <h2 className="text-sm font-semibold text-slate-100 mb-3">All Tasks</h2>
        <p className="text-xs text-slate-400 mb-4">{tasks.length} total</p>
        <div className="space-y-3">
          {tasks.map(task => (
            <div key={task.id} className="rounded-lg border border-slate-800 bg-slate-950/40 p-4">
              <div className="flex items-start justify-between mb-1">
                <div className="flex items-center gap-2">
                  {getStatusIcon(task.status)}
                  <div className="text-sm font-medium text-slate-100">{task.task_title}</div>
                </div>
                {getPriorityBadge(task.priority)}
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Badge variant="outline" className="text-xs">{task.category}</Badge>
                {task.assigned_to && <span>• {task.assigned_to}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}