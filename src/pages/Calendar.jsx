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

const statusColors = {
  todo: "bg-muted",
  in_progress: "bg-info-foreground",
  review: "bg-accent-400",
  completed: "bg-success-foreground",
};

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [filterProject, setFilterProject] = useState("all");

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => base44.entities.Task.list(),
  });

  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: () => base44.entities.Project.list(),
  });

  const { data: absences = [] } = useQuery({
    queryKey: ["absences"],
    queryFn: () => base44.entities.Absence.list(),
  });

  const { data: teamMembers = [] } = useQuery({
    queryKey: ["teamMembers"],
    queryFn: () => base44.entities.TeamMember.list(),
  });

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
          className={`min-h-24 border border-border p-1 cursor-pointer transition-colors
            ${!isCurrentMonth ? "bg-muted text-muted-foreground" : "bg-card"}
            ${isToday ? "bg-info-50" : ""}
            ${isSelected ? "ring-2 ring-primary" : ""}
            hover:bg-muted`}
          onClick={() => setSelectedDate(currentDay)}
        >
          <div className={`text-sm font-medium mb-1 ${isToday ? "text-info-foreground" : ""}`}>
            {format(currentDay, "d")}
          </div>
          <div className="space-y-1">
            {dayTasks.slice(0, 3).map((task) => (
              <div key={task.id} className="text-xs truncate px-1 py-0.5 rounded border-l-2 border-info-foreground bg-card">
                <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1 ${statusColors[task.status]}`} />
                {task.title}
              </div>
            ))}
            {dayTasks.length > 3 && <div className="text-xs text-muted-foreground">+{dayTasks.length - 3} more</div>}
            {dayAbsences.map((absence) => (
              <div key={absence.id} className="text-xs truncate px-1 py-0.5 rounded bg-accent-50 text-accent-700">
                {getTeamMemberName(absence.team_member_id)} - {absence.absence_type}
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
    return <div className="flex items-center justify-center h-64 bg-[var(--color-background)]"><Loader2 className="h-8 w-8 animate-spin text-[var(--color-charcoal)]" /></div>;
  }

  return (
    <div className="p-6 bg-[var(--color-background)] min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-light font-display text-[var(--color-midnight)]">Calendar</h1>
        <Select value={filterProject} onValueChange={setFilterProject}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Filter by project" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            {projects.map((p) => (<SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-6">
        <div className="flex-1">
          <Card className="border-background-muted bg-card">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <Button variant="ghost" size="icon" onClick={() => setCurrentDate(subMonths(currentDate, 1))}><ChevronLeft className="h-4 w-4" /></Button>
                <CardTitle className="text-[var(--color-midnight)]">{format(currentDate, "MMMM yyyy")}</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setCurrentDate(addMonths(currentDate, 1))}><ChevronRight className="h-4 w-4" /></Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 mb-2">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                  <div key={d} className="text-center text-sm font-medium text-[var(--color-charcoal)] py-2">{d}</div>
                ))}
              </div>
              <div className="border border-background-muted rounded-lg overflow-hidden">{rows}</div>
            </CardContent>
          </Card>

          <div className="mt-4 flex gap-4 text-sm">
            <div className="flex items-center gap-2"><Circle className="h-3 w-3 fill-muted text-muted" /> To Do</div>
            <div className="flex items-center gap-2"><Circle className="h-3 w-3 fill-info-foreground text-info-foreground" /> In Progress</div>
            <div className="flex items-center gap-2"><Circle className="h-3 w-3 fill-accent-400 text-accent-400" /> Review</div>
            <div className="flex items-center gap-2"><Circle className="h-3 w-3 fill-success-foreground text-success-foreground" /> Completed</div>
          </div>
        </div>

        <div className="w-80">
          <Card className="border-background-muted bg-card">
            <CardHeader>
              <CardTitle className="text-lg text-[var(--color-midnight)]">{selectedDate ? format(selectedDate, "EEEE, MMMM d") : "Select a date"}</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDate ? (
                <div className="space-y-4">
                  {selectedDateTasks.length > 0 ? (
                    <div>
                      <h3 className="text-sm font-medium mb-2 text-[var(--color-midnight)]">Tasks</h3>
                      <div className="space-y-2">
                        {selectedDateTasks.map((task) => (
                          <div key={task.id} className="p-2 bg-background rounded-lg">
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${statusColors[task.status]}`} />
                              <span className="font-medium text-sm text-[var(--color-midnight)]">{task.title}</span>
                            </div>
                            <p className="text-xs text-[var(--color-charcoal)] mt-1">{getProjectName(task.project_id)}</p>
                            <Badge className="mt-1 text-xs" variant="outline">{task.priority}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-[var(--color-charcoal)]">No tasks scheduled</p>
                  )}
                  {selectedDateAbsences.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium mb-2">Absences</h3>
                      <div className="space-y-2">
                        {selectedDateAbsences.map((absence) => (
                          <div key={absence.id} className="p-2 bg-accent-100 rounded-lg">
                            <span className="font-medium text-sm">{getTeamMemberName(absence.team_member_id)}</span>
                            <p className="text-xs text-accent-800 capitalize">{absence.absence_type?.replace("_", " ")}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-[var(--color-charcoal)]">Click on a date to see details</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}