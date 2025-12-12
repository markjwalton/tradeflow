import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Loader2, Circle } from "lucide-react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";
import { PageLoader } from "@/components/common/LoadingStates";
import { QueryErrorState } from "@/components/common/QueryErrorState";

const statusColors = {
  todo: "bg-muted",
  in_progress: "bg-info",
  review: "bg-accent",
  completed: "bg-success",
};

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [filterProject, setFilterProject] = useState("all");

  const { data: tasks = [], isLoading: tasksLoading, error: tasksError, refetch: refetchTasks } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => base44.entities.Task.list(),
  });

  const { data: projects = [], isLoading: projectsLoading, error: projectsError, refetch: refetchProjects } = useQuery({
    queryKey: ["projects"],
    queryFn: () => base44.entities.Project.list(),
  });

  const { data: absences = [], isLoading: absencesLoading, error: absencesError, refetch: refetchAbsences } = useQuery({
    queryKey: ["absences"],
    queryFn: () => base44.entities.Absence.list(),
  });

  const { data: teamMembers = [], isLoading: teamLoading, error: teamError, refetch: refetchTeam } = useQuery({
    queryKey: ["teamMembers"],
    queryFn: () => base44.entities.TeamMember.list(),
  });

  const isLoading = tasksLoading || projectsLoading || absencesLoading || teamLoading;
  const error = tasksError || projectsError || absencesError || teamError;
  const refetch = () => {
    refetchTasks();
    refetchProjects();
    refetchAbsences();
    refetchTeam();
  };

  const filteredTasks = tasks.filter((t) => filterProject === "all" || t.project_id === filterProject);

  const getProjectName = (projectId) => projects.find((p) => p.id === projectId)?.name || "Unassigned";
  const getTeamMemberName = (memberId) => teamMembers.find((m) => m.id === memberId)?.name || "";

  const getTasksForDate = (date) => {
    return filteredTasks.filter((task) => {
      if (task.due_date && isSameDay(new Date(task.due_date), date)) return true;
      if (task.start_date && isSameDay(new Date(task.start_date), date)) return true;
      return false;
    });
  };

  const getAbsencesForDate = (date) => {
    return absences.filter((absence) => {
      const start = new Date(absence.start_date);
      const end = new Date(absence.end_date);
      return date >= start && date <= end;
    });
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const rows = [];
  let days = [];
  let day = startDate;

  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      const currentDay = day;
      const dayTasks = getTasksForDate(currentDay);
      const dayAbsences = getAbsencesForDate(currentDay);
      const isCurrentMonth = isSameMonth(currentDay, monthStart);
      const isToday = isSameDay(currentDay, new Date());
      const isSelected = selectedDate && isSameDay(currentDay, selectedDate);

      days.push(
        <div
        key={currentDay.toString()}
        className={`min-h-16 sm:min-h-24 border border-border p-0.5 sm:p-1 cursor-pointer transition-colors
          ${!isCurrentMonth ? "bg-muted text-muted-foreground" : "bg-card"}
          ${isToday ? "bg-primary/10" : ""}
          ${isSelected ? "ring-2 ring-primary" : ""}
          hover:bg-muted/50`}
        onClick={() => setSelectedDate(currentDay)}
        >
        <div className={`text-xs sm:text-sm font-medium mb-1 ${isToday ? "text-primary" : ""}`}>
          {format(currentDay, "d")}
        </div>
          <div className="space-y-0.5 sm:space-y-1">
            {dayTasks.slice(0, 2).map((task) => (
              <div key={task.id} className="text-[10px] sm:text-xs truncate px-0.5 sm:px-1 py-0.5 rounded border-l-2 border-primary/30 bg-card hidden sm:block">
                <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1 ${statusColors[task.status]}`} />
                {task.name}
              </div>
            ))}
            {dayTasks.length > 0 && (
              <div className="sm:hidden flex items-center justify-center">
                <span className={`w-1.5 h-1.5 rounded-full ${statusColors[dayTasks[0].status]}`} />
              </div>
            )}
            {dayTasks.length > 2 && <div className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">+{dayTasks.length - 2}</div>}
            {dayAbsences.map((absence) => (
              <div key={absence.id} className="text-[10px] sm:text-xs truncate px-0.5 sm:px-1 py-0.5 rounded bg-accent/10 text-accent hidden sm:block">
                {getTeamMemberName(absence.team_member_id)}
              </div>
            ))}
          </div>
        </div>
      );
      day = addDays(day, 1);
    }
    rows.push(<div key={day.toString()} className="grid grid-cols-7">{days}</div>);
    days = [];
  }

  const selectedDateTasks = selectedDate ? getTasksForDate(selectedDate) : [];
  const selectedDateAbsences = selectedDate ? getAbsencesForDate(selectedDate) : [];

  if (isLoading) {
    return <PageLoader message="Loading calendar data..." />;
  }

  if (error) {
    return <QueryErrorState error={error} onRetry={refetch} />;
  }

  return (
    <div className="p-3 sm:p-4 md:p-6 bg-background min-h-screen">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-light font-display text-foreground">Calendar</h1>
        <Select value={filterProject} onValueChange={setFilterProject}>
          <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="Filter by project" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            {projects.map((p) => (<SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
        <div className="flex-1">
          <Card className="bg-card">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <Button variant="ghost" size="icon" onClick={() => setCurrentDate(subMonths(currentDate, 1))}><ChevronLeft className="h-4 w-4" /></Button>
                <CardTitle className="text-foreground">{format(currentDate, "MMMM yyyy")}</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setCurrentDate(addMonths(currentDate, 1))}><ChevronRight className="h-4 w-4" /></Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 mb-2">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                  <div key={d} className="text-center text-sm font-medium text-muted-foreground py-2">{d}</div>
                ))}
              </div>
              <div className="border border-border rounded-lg overflow-hidden">{rows}</div>
            </CardContent>
          </Card>

          <div className="mt-4 flex gap-4 text-sm">
            <div className="flex items-center gap-2"><Circle className="h-3 w-3 fill-muted text-muted" /> To Do</div>
            <div className="flex items-center gap-2"><Circle className="h-3 w-3 fill-info text-info" /> In Progress</div>
            <div className="flex items-center gap-2"><Circle className="h-3 w-3 fill-accent text-accent" /> Review</div>
            <div className="flex items-center gap-2"><Circle className="h-3 w-3 fill-success text-success" /> Completed</div>
          </div>
        </div>

        <div className="w-full lg:w-80">
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg text-foreground">{selectedDate ? format(selectedDate, "EEEE, MMMM d") : "Select a date"}</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDate ? (
                <div className="space-y-4">
                  {selectedDateTasks.length > 0 ? (
                    <div>
                      <h3 className="text-sm font-medium mb-2 text-foreground">Tasks</h3>
                      <div className="space-y-2">
                        {selectedDateTasks.map((task) => (
                          <div key={task.id} className="p-2 bg-background rounded-lg">
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${statusColors[task.status]}`} />
                              <span className="font-medium text-sm text-foreground">{task.name}</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">{getProjectName(task.project_id)}</p>
                            <Badge className="mt-1 text-xs" variant="outline">{task.priority}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No tasks scheduled</p>
                  )}
                  {selectedDateAbsences.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium mb-2">Absences</h3>
                      <div className="space-y-2">
                        {selectedDateAbsences.map((absence) => (
                          <div key={absence.id} className="p-2 bg-accent/10 rounded-lg">
                            <span className="font-medium text-sm">{getTeamMemberName(absence.team_member_id)}</span>
                            <p className="text-xs text-accent capitalize">{absence.absence_type?.replace("_", " ")}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Click on a date to see details</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}