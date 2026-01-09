import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Target, Calendar, CheckCircle2, AlertCircle } from "lucide-react";

export default function SprintManager({ projectId }) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newSprint, setNewSprint] = useState({
    name: '',
    start_date: '',
    end_date: '',
    goals: '',
    status: 'planning'
  });

  const queryClient = useQueryClient();

  const { data: sprints = [] } = useQuery({
    queryKey: ['sprints', projectId],
    queryFn: () => base44.entities.Sprint.filter({ project_id: projectId }),
  });

  const { data: allTasks = [] } = useQuery({
    queryKey: ['all-tasks'],
    queryFn: () => base44.entities.Task.list(),
  });

  const createSprintMutation = useMutation({
    mutationFn: (sprintData) => base44.entities.Sprint.create({ ...sprintData, project_id: projectId }),
    onSuccess: () => {
      queryClient.invalidateQueries(['sprints', projectId]);
      setShowCreateDialog(false);
      setNewSprint({ name: '', start_date: '', end_date: '', goals: '', status: 'planning' });
    },
  });

  const updateSprintMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Sprint.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['sprints', projectId]);
    },
  });

  const handleCreateSprint = () => {
    if (newSprint.name && newSprint.start_date && newSprint.end_date) {
      createSprintMutation.mutate(newSprint);
    }
  };

  const getSprintTasks = (sprintId) => {
    return allTasks.filter(task => task.sprint_id === sprintId);
  };

  const getStatusColor = (status) => {
    const colors = {
      planning: 'bg-slate-100 text-slate-800',
      active: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      archived: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || colors.planning;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">Sprints</h2>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-[var(--color-primary)] text-white">
              <Plus className="h-4 w-4 mr-2" />
              New Sprint
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Sprint</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Sprint name"
                value={newSprint.name}
                onChange={(e) => setNewSprint({ ...newSprint, name: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-[var(--color-text-secondary)] mb-1 block">Start Date</label>
                  <Input
                    type="date"
                    value={newSprint.start_date}
                    onChange={(e) => setNewSprint({ ...newSprint, start_date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm text-[var(--color-text-secondary)] mb-1 block">End Date</label>
                  <Input
                    type="date"
                    value={newSprint.end_date}
                    onChange={(e) => setNewSprint({ ...newSprint, end_date: e.target.value })}
                  />
                </div>
              </div>
              <Textarea
                placeholder="Sprint goals and objectives"
                value={newSprint.goals}
                onChange={(e) => setNewSprint({ ...newSprint, goals: e.target.value })}
                rows={4}
              />
              <Button onClick={handleCreateSprint} className="w-full" disabled={!newSprint.name || !newSprint.start_date || !newSprint.end_date}>
                Create Sprint
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {sprints.map(sprint => {
          const tasks = getSprintTasks(sprint.id);
          const completedTasks = tasks.filter(t => t.status === 'Completed').length;
          const completionPercentage = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

          return (
            <Card key={sprint.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-3 mb-2">
                      <Target className="h-5 w-5 text-[var(--color-primary)]" />
                      {sprint.name}
                      <Badge className={getStatusColor(sprint.status)}>{sprint.status}</Badge>
                    </CardTitle>
                    <div className="flex items-center gap-4 text-sm text-[var(--color-text-secondary)]">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(sprint.start_date).toLocaleDateString()} - {new Date(sprint.end_date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4" />
                        {completedTasks} / {tasks.length} tasks
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {sprint.status === 'planning' && (
                      <Button 
                        size="sm" 
                        onClick={() => updateSprintMutation.mutate({ id: sprint.id, data: { status: 'active' } })}
                      >
                        Start Sprint
                      </Button>
                    )}
                    {sprint.status === 'active' && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => updateSprintMutation.mutate({ id: sprint.id, data: { status: 'completed' } })}
                      >
                        Complete Sprint
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sprint.goals && (
                    <div>
                      <p className="text-sm font-medium text-[var(--color-text-secondary)] mb-1">Goals:</p>
                      <p className="text-[var(--color-text-primary)]">{sprint.goals}</p>
                    </div>
                  )}
                  
                  {sprint.output_summary && (
                    <div>
                      <p className="text-sm font-medium text-[var(--color-text-secondary)] mb-1">Outputs:</p>
                      <p className="text-[var(--color-text-primary)]">{sprint.output_summary}</p>
                    </div>
                  )}

                  {/* Progress Bar */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-[var(--color-text-secondary)]">Progress</span>
                      <span className="text-[var(--color-text-primary)] font-medium">{completionPercentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-[var(--color-primary)] h-2 rounded-full transition-all duration-300"
                        style={{ width: `${completionPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {sprints.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Target className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-[var(--color-text-secondary)]">No sprints yet. Create your first sprint to get started.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}