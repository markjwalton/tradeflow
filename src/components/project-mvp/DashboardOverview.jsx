import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, CheckCircle2, Clock, FileText, MessageSquare, Lightbulb } from "lucide-react";

export default function DashboardOverview({ projectId }) {
  const { data: sprints = [] } = useQuery({
    queryKey: ['sprints', projectId],
    queryFn: () => base44.entities.Sprint.filter({ project_id: projectId }),
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks', projectId],
    queryFn: () => base44.entities.Task.filter({ projectId }),
  });

  const { data: assets = [] } = useQuery({
    queryKey: ['assets', projectId],
    queryFn: () => base44.entities.Asset.filter({ project_id: projectId }),
  });

  const { data: learnings = [] } = useQuery({
    queryKey: ['learnings', projectId],
    queryFn: () => base44.entities.Learning.filter({ project_id: projectId }),
  });

  const activeSprint = sprints.find(s => s.status === 'active');
  const completedTasks = tasks.filter(t => t.status === 'Completed').length;
  const totalTasks = tasks.length;
  const recentAssets = assets.slice(-3);
  const recentLearnings = learnings.slice(-3);

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[var(--color-text-secondary)]">Active Sprint</CardTitle>
            <Target className="h-4 w-4 text-[var(--color-primary)]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[var(--color-text-primary)]">
              {activeSprint ? activeSprint.name : 'None'}
            </div>
            {activeSprint && (
              <p className="text-xs text-[var(--color-text-muted)] mt-1">
                {activeSprint.completion_percentage || 0}% complete
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[var(--color-text-secondary)]">Tasks</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[var(--color-text-primary)]">
              {completedTasks} / {totalTasks}
            </div>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}% completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[var(--color-text-secondary)]">Assets</CardTitle>
            <FileText className="h-4 w-4 text-[var(--color-primary)]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[var(--color-text-primary)]">
              {assets.length}
            </div>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              Total uploaded
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[var(--color-text-secondary)]">Learnings</CardTitle>
            <Lightbulb className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[var(--color-text-primary)]">
              {learnings.length}
            </div>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              Insights captured
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Active Sprint Detail */}
      {activeSprint && (
        <Card>
          <CardHeader>
            <CardTitle className="page-section-title flex items-center gap-2">
              <Target className="h-5 w-5 text-[var(--color-primary)]" />
              Current Sprint: {activeSprint.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-[var(--color-text-secondary)] mb-1">Goals:</p>
                <p className="text-[var(--color-text-primary)]">{activeSprint.goals}</p>
              </div>
              <div className="flex gap-4 text-sm">
                <div>
                  <span className="text-[var(--color-text-secondary)]">Start: </span>
                  <span className="text-[var(--color-text-primary)]">{new Date(activeSprint.start_date).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="text-[var(--color-text-secondary)]">End: </span>
                  <span className="text-[var(--color-text-primary)]">{new Date(activeSprint.end_date).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Assets */}
        <Card>
          <CardHeader>
            <CardTitle className="page-section-title">Recent Assets</CardTitle>
          </CardHeader>
          <CardContent>
            {recentAssets.length > 0 ? (
              <div className="space-y-3">
                {recentAssets.map(asset => (
                  <div key={asset.id} className="flex items-center justify-between p-3 bg-[var(--color-muted)] rounded-lg">
                    <div>
                      <p className="font-medium text-[var(--color-text-primary)]">{asset.name}</p>
                      <p className="text-xs text-[var(--color-text-muted)]">{asset.type}</p>
                    </div>
                    <Badge variant="outline">{asset.type}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[var(--color-text-muted)]">No assets yet</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Learnings */}
        <Card>
          <CardHeader>
            <CardTitle className="page-section-title">Recent Learnings</CardTitle>
          </CardHeader>
          <CardContent>
            {recentLearnings.length > 0 ? (
              <div className="space-y-3">
                {recentLearnings.map(learning => (
                  <div key={learning.id} className="p-3 bg-[var(--color-muted)] rounded-lg">
                    <p className="font-medium text-[var(--color-text-primary)] mb-1">{learning.title}</p>
                    <p className="text-xs text-[var(--color-text-secondary)] line-clamp-2">{learning.description}</p>
                    <Badge variant="outline" className="mt-2">{learning.category}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[var(--color-text-muted)]">No learnings yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}