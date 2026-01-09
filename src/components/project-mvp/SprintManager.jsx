import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Target, Calendar, CheckCircle2 } from "lucide-react";
import { AccordionContainer } from "@/components/common/AccordionContainer";

export default function SprintManager({ projectId, onNewSprintClick }) {
  const [openSprints, setOpenSprints] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const queryClient = useQueryClient();

  const { data: sprints = [] } = useQuery({
    queryKey: ['sprints', projectId],
    queryFn: () => base44.entities.Sprint.filter({ project_id: projectId }),
  });

  const { data: allTasks = [] } = useQuery({
    queryKey: ['all-tasks'],
    queryFn: () => base44.entities.Task.list(),
  });

  const updateSprintMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Sprint.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['sprints', projectId]);
    },
  });

  const sortedSprints = [...sprints].sort((a, b) => 
    new Date(b.start_date) - new Date(a.start_date)
  );

  const totalPages = Math.ceil(sortedSprints.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSprints = sortedSprints.slice(startIndex, startIndex + itemsPerPage);

  const toggleSprint = (sprintId) => {
    setOpenSprints(prev => ({
      ...prev,
      [sprintId]: !prev[sprintId]
    }));
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
    <AccordionContainer title="Sprints" defaultCollapsed={true}>
      <div className="space-y-4">
        {sortedSprints.length === 0 ? (
          <p className="text-muted-foreground">No sprints yet. Create your first sprint to get started.</p>
        ) : (
          <>
            {paginatedSprints.map(sprint => {
              const tasks = getSprintTasks(sprint.id);
              const completedTasks = tasks.filter(t => t.status === 'Completed').length;
              const completionPercentage = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

              return (
                <Collapsible 
                  key={sprint.id}
                  open={openSprints[sprint.id]}
                  onOpenChange={() => toggleSprint(sprint.id)}
                >
                  <Card>
                    <CollapsibleTrigger className="w-full">
                      <div className="cursor-pointer hover:bg-[var(--color-muted)] transition-colors p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="card-heading-default flex items-center gap-3 mb-2">
                              <Target className="h-5 w-5 text-[var(--color-primary)]" />
                              {sprint.name}
                              <Badge className={getStatusColor(sprint.status)}>{sprint.status}</Badge>
                            </div>
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
                          <div className="flex items-center gap-3">
                            {sprint.status === 'planning' && (
                              <Button 
                                size="sm" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateSprintMutation.mutate({ id: sprint.id, data: { status: 'active' } });
                                }}
                              >
                                Start Sprint
                              </Button>
                            )}
                            {sprint.status === 'active' && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateSprintMutation.mutate({ id: sprint.id, data: { status: 'completed' } });
                                }}
                              >
                                Complete Sprint
                              </Button>
                            )}
                            <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${openSprints[sprint.id] ? 'rotate-180' : ''}`} />
                          </div>
                        </div>
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="pt-0 space-y-4">
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
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              );
            })}

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </AccordionContainer>
  );
}