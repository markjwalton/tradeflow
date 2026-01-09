import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { AccordionContainer } from "@/components/common/AccordionContainer";

export default function TaskManager({ projectId }) {
  const [openTasks, setOpenTasks] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const { data: sprints = [] } = useQuery({
    queryKey: ['sprints', projectId],
    queryFn: () => base44.entities.Sprint.filter({ project_id: projectId }),
  });

  const { data: allTasks = [], isLoading } = useQuery({
    queryKey: ['all-tasks'],
    queryFn: () => base44.entities.Task.list(),
  });

  // Filter tasks that belong to sprints in this project
  const sprintIds = sprints.map(s => s.id);
  const projectTasks = allTasks.filter(task => sprintIds.includes(task.sprint_id));

  const sortedTasks = [...projectTasks].sort((a, b) => 
    new Date(b.created_date) - new Date(a.created_date)
  );

  const totalPages = Math.ceil(sortedTasks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTasks = sortedTasks.slice(startIndex, startIndex + itemsPerPage);

  const toggleTask = (taskId) => {
    setOpenTasks(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'In Progress':
        return <Clock className="h-5 w-5 text-blue-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'To Do': 'bg-gray-100 text-gray-800',
      'In Progress': 'bg-blue-100 text-blue-800',
      'Completed': 'bg-green-100 text-green-800'
    };
    return colors[status] || colors['To Do'];
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'Low': 'bg-gray-100 text-gray-800',
      'Medium': 'bg-yellow-100 text-yellow-800',
      'High': 'bg-orange-100 text-orange-800',
      'Urgent': 'bg-red-100 text-red-800'
    };
    return colors[priority] || colors['Medium'];
  };

  const getSprintName = (sprintId) => {
    const sprint = sprints.find(s => s.id === sprintId);
    return sprint?.name || 'No Sprint';
  };

  return (
    <AccordionContainer title="Tasks" defaultCollapsed={true}>
      <div className="space-y-4">
        {isLoading ? (
          <p>Loading tasks...</p>
        ) : sortedTasks.length === 0 ? (
          <p className="text-muted-foreground">No tasks yet for this project's sprints.</p>
        ) : (
          <>
            {paginatedTasks.map((task) => (
              <Collapsible 
                key={task.id}
                open={openTasks[task.id]}
                onOpenChange={() => toggleTask(task.id)}
              >
                <Card>
                  <CollapsibleTrigger className="w-full">
                    <div className="cursor-pointer hover:bg-[var(--color-muted)] transition-colors p-6">
                      <div className="flex items-start justify-between">
                        <div className="card-heading-default flex items-center gap-3">
                          {getStatusIcon(task.status)}
                          {task.title}
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={getStatusColor(task.status)}>
                            {task.status}
                          </Badge>
                          {task.priority && (
                            <Badge className={getPriorityColor(task.priority)}>
                              {task.priority}
                            </Badge>
                          )}
                          <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${openTasks[task.id] ? 'rotate-180' : ''}`} />
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground mt-2 text-left">
                        Sprint: {getSprintName(task.sprint_id)}
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      {task.description && (
                        <p className="text-[var(--color-text-primary)] mb-3">{task.description}</p>
                      )}
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        {task.assignee && (
                          <div>
                            <span className="font-medium">Assigned to:</span> {task.assignee}
                          </div>
                        )}
                        {task.dueDate && (
                          <div>
                            <span className="font-medium">Due:</span> {new Date(task.dueDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            ))}

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