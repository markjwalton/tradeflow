import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  AlertTriangle,
  GripVertical
} from "lucide-react";
import { format, addDays, differenceInDays, startOfWeek, eachDayOfInterval, isWeekend, isSameDay, parseISO, addWeeks, subWeeks } from "date-fns";
import { toast } from "sonner";

const statusColors = {
  "To Do": "bg-muted-foreground",
  "In Progress": "bg-info",
  "Blocked": "bg-destructive",
  "Completed": "bg-success",
  "Snagging": "bg-warning",
};

const priorityBorders = {
  Low: "border-l-muted-foreground",
  Medium: "border-l-warning",
  High: "border-l-warning",
  Critical: "border-l-destructive",
};

const typeColors = {
  Design: "bg-accent-100",
  Manufacturing: "bg-info-50",
  "Site Work": "bg-success-50",
  Procurement: "bg-warning/10",
  Inspection: "bg-accent-100",
  Snagging: "bg-destructive-50",
  "Client Communication": "bg-info-50",
  Other: "bg-muted",
};

export default function GanttChart({ tasks = [], project, isLoading }) {
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState("week");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [draggedTask, setDraggedTask] = useState(null);

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Task.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task updated");
    },
  });

  const dateRange = useMemo(() => {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 });
    const end = addDays(start, viewMode === "week" ? 13 : 27);
    return eachDayOfInterval({ start, end });
  }, [currentDate, viewMode]);

  const dayWidth = viewMode === "week" ? 60 : 30;
  const chartWidth = dateRange.length * dayWidth;

  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate) - new Date(b.dueDate);
    });
  }, [tasks]);

  const getTaskPosition = (task) => {
    if (!task.dueDate) return null;
    
    const taskEnd = parseISO(task.dueDate);
    const estimatedDays = task.estimatedHours ? Math.ceil(task.estimatedHours / 8) : 1;
    const taskStart = addDays(taskEnd, -estimatedDays + 1);
    
    const rangeStart = dateRange[0];
    const rangeEnd = dateRange[dateRange.length - 1];
    
    if (taskEnd < rangeStart || taskStart > rangeEnd) return null;
    
    const startOffset = Math.max(0, differenceInDays(taskStart, rangeStart));
    const endOffset = Math.min(dateRange.length - 1, differenceInDays(taskEnd, rangeStart));
    
    const left = startOffset * dayWidth;
    const width = Math.max(dayWidth, (endOffset - startOffset + 1) * dayWidth - 4);
    
    return { left, width, taskStart, taskEnd, estimatedDays };
  };

  const handleNavigate = (direction) => {
    const weeks = viewMode === "week" ? 1 : 2;
    setCurrentDate(direction === "prev" ? subWeeks(currentDate, weeks) : addWeeks(currentDate, weeks));
  };

  const handleTaskDrag = (task, e) => {
    e.preventDefault();
    setDraggedTask(task);
  };

  const handleDrop = (e, dayIndex) => {
    if (!draggedTask) return;
    
    const newDueDate = dateRange[dayIndex];
    const position = getTaskPosition(draggedTask);
    
    if (position) {
      const daysDiff = position.estimatedDays - 1;
      const adjustedDueDate = addDays(newDueDate, daysDiff);
      
      updateTaskMutation.mutate({
        id: draggedTask.id,
        data: { dueDate: format(adjustedDueDate, "yyyy-MM-dd") }
      });
    }
    
    setDraggedTask(null);
  };

  const today = new Date();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Gantt Chart
        </CardTitle>
        <div className="flex items-center gap-2">
          <Select value={viewMode} onValueChange={setViewMode}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">2 Weeks</SelectItem>
              <SelectItem value="month">4 Weeks</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center border rounded-lg">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleNavigate("prev")}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="px-2 text-sm font-medium">
              {format(dateRange[0], "MMM d")} - {format(dateRange[dateRange.length - 1], "MMM d, yyyy")}
            </span>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleNavigate("next")}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
            Today
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <div style={{ minWidth: `${chartWidth + 250}px` }}>
            {/* Header - Days */}
            <div className="flex border-b sticky top-0 bg-white z-10">
              <div className="w-[250px] flex-shrink-0 p-3 border-r bg-muted/50 font-medium text-sm text-muted-foreground">
                Task
              </div>
              <div className="flex">
                {dateRange.map((date, idx) => (
                  <div
                    key={idx}
                    className={`flex-shrink-0 text-center border-r p-1 ${
                      isWeekend(date) ? "bg-muted/50" : "bg-background"
                    } ${isSameDay(date, today) ? "bg-primary/10" : ""}`}
                    style={{ width: dayWidth }}
                  >
                    <div className="text-xs text-muted-foreground">{format(date, "EEE")}</div>
                    <div className={`text-sm font-medium ${isSameDay(date, today) ? "text-primary" : "text-foreground"}`}>
                      {format(date, "d")}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tasks */}
            {sortedTasks.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Calendar className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
                <p>No tasks with due dates to display</p>
              </div>
            ) : (
              sortedTasks.map((task) => {
                const position = getTaskPosition(task);
                
                return (
                  <div key={task.id} className="flex border-b hover:bg-muted/30">
                    {/* Task Name Column */}
                    <div className={`w-[250px] flex-shrink-0 p-3 border-r border-l-4 ${priorityBorders[task.priority] || "border-l-border"}`}>
                      <div className="flex items-center gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="font-medium text-sm text-foreground truncate cursor-default">
                                {task.name}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="font-medium">{task.name}</p>
                              {task.description && <p className="text-xs text-muted-foreground mt-1">{task.description}</p>}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        {task.status === "Blocked" && (
                          <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        {task.type && (
                          <Badge variant="outline" className={`text-xs ${typeColors[task.type] || typeColors.Other}`}>
                            {task.type}
                          </Badge>
                        )}
                        <span className={`h-2 w-2 rounded-full ${statusColors[task.status]}`} />
                      </div>
                    </div>

                    {/* Timeline Column */}
                    <div 
                      className="flex relative"
                      style={{ width: chartWidth }}
                      onDragOver={(e) => e.preventDefault()}
                    >
                      {/* Day grid background */}
                      {dateRange.map((date, idx) => (
                        <div
                          key={idx}
                          className={`flex-shrink-0 border-r h-full ${
                            isWeekend(date) ? "bg-muted/30" : ""
                          } ${isSameDay(date, today) ? "bg-primary/10" : ""}`}
                          style={{ width: dayWidth }}
                          onDrop={(e) => handleDrop(e, idx)}
                          onDragOver={(e) => e.preventDefault()}
                        />
                      ))}

                      {/* Task Bar */}
                      {position && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div
                                className={`absolute top-2 h-8 rounded cursor-move flex items-center px-2 text-white text-xs font-medium shadow-sm transition-all ${statusColors[task.status]} hover:opacity-90`}
                                style={{
                                  left: position.left + 2,
                                  width: position.width,
                                }}
                                draggable
                                onDragStart={(e) => handleTaskDrag(task, e)}
                                onDragEnd={() => setDraggedTask(null)}
                              >
                                <GripVertical className="h-3 w-3 mr-1 opacity-50" />
                                <span className="truncate">{task.name}</span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="text-xs space-y-1">
                                <p className="font-medium">{task.name}</p>
                                <p>Due: {format(position.taskEnd, "MMM d, yyyy")}</p>
                                <p>Duration: {position.estimatedDays} day{position.estimatedDays > 1 ? "s" : ""}</p>
                                <p>Status: {task.status}</p>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}

                      {/* No date indicator */}
                      {!position && !task.dueDate && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xs text-muted-foreground italic">No due date</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}

            {/* Project Timeline Summary */}
            {project?.startDate && project?.estimatedEndDate && (
              <div className="flex border-t-2 border-primary/20 bg-primary/10">
                <div className="w-[250px] flex-shrink-0 p-3 border-r font-medium text-sm text-primary">
                  📅 Project Timeline
                </div>
                <div className="flex relative" style={{ width: chartWidth }}>
                  {dateRange.map((date, idx) => {
                    const projectStart = parseISO(project.startDate);
                    const projectEnd = parseISO(project.estimatedEndDate);
                    const isInProject = date >= projectStart && date <= projectEnd;
                    
                    return (
                      <div
                        key={idx}
                        className={`flex-shrink-0 border-r h-12 ${isInProject ? "bg-primary/20" : ""}`}
                        style={{ width: dayWidth }}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}