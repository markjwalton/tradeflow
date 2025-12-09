import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  ArrowLeft,
  Pencil,
  MapPin,
  Calendar,
  User,
  Phone,
  Mail,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ListTodo,
  Users,
  FileText,
  ClipboardList,
  PoundSterling,
  GanttChartSquare
} from "lucide-react";
import { format } from "date-fns";

import TaskList from "@/components/project/TaskList";
import ContactList from "@/components/project/ContactList";
import DocumentList from "@/components/project/DocumentList";
import SiteVisitList from "@/components/project/SiteVisitList";
import ProjectTeam from "@/components/project/ProjectTeam";
import ClientAccessManager from "@/components/project/ClientAccessManager";
import GanttChart from "@/components/project/GanttChart";

export default function ProjectDetails() {
  const urlParams = new URLSearchParams(window.location.search);
  const projectId = urlParams.get("id");
  const [activeTab, setActiveTab] = useState("overview");

  const { data: projectData, isLoading: loadingProject } = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => base44.entities.Project.filter({ id: projectId }),
    enabled: !!projectId,
  });

  const project = projectData?.[0];

  const { data: tasks = [], isLoading: loadingTasks } = useQuery({
    queryKey: ["tasks", projectId],
    queryFn: () => base44.entities.Task.filter({ projectId }),
    enabled: !!projectId,
  });

  const { data: contacts = [], isLoading: loadingContacts } = useQuery({
    queryKey: ["contacts", projectId],
    queryFn: () => base44.entities.ClientContact.filter({ projectId }),
    enabled: !!projectId,
  });

  const { data: documents = [], isLoading: loadingDocuments } = useQuery({
    queryKey: ["documents", projectId],
    queryFn: () => base44.entities.ProjectDocument.filter({ projectId }),
    enabled: !!projectId,
  });

  const { data: siteVisits = [], isLoading: loadingSiteVisits } = useQuery({
    queryKey: ["siteVisits", projectId],
    queryFn: () => base44.entities.SiteVisitReport.filter({ projectId }),
    enabled: !!projectId,
  });

  const { data: allocations = [], isLoading: loadingAllocations } = useQuery({
    queryKey: ["allocations", projectId],
    queryFn: () => base44.entities.TeamAllocation.filter({ projectId }),
    enabled: !!projectId,
  });

  const statusColors = {
    Planning: "bg-info-50 text-info-foreground border-primary-200",
    Active: "bg-success-50 text-success-foreground border-success",
    "On Hold": "bg-warning/10 text-warning-foreground border-warning/20",
    Completed: "bg-muted text-muted-foreground border-border",
    Archived: "bg-muted text-muted-foreground border-border",
  };

  const typeColors = {
    "New Build": "bg-info-50 text-info",
    Extension: "bg-accent/10 text-accent",
    Renovation: "bg-accent/20 text-accent",
    Conservation: "bg-warning/10 text-warning",
    Commercial: "bg-info-50 text-info",
  };

  // Calculate task stats
  const taskStats = {
    total: tasks.length,
    completed: tasks.filter((t) => t.status === "Completed").length,
    inProgress: tasks.filter((t) => t.status === "In Progress").length,
    blocked: tasks.filter((t) => t.status === "Blocked").length,
  };
  const completionPercentage = taskStats.total > 0
    ? Math.round((taskStats.completed / taskStats.total) * 100)
    : 0;

  if (loadingProject) {
    return (
      <div className="p-6 lg:p-8">
        <div className="flex items-center gap-4 mb-6">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Skeleton className="h-64 rounded-lg" />
          </div>
          <Skeleton className="h-64 rounded-lg" />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-6 lg:p-8">
        <Card>
          <CardContent className="py-12 text-center">
            <AlertTriangle className="h-12 w-12 text-warning-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Project Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The project you're looking for doesn't exist or has been deleted.
            </p>
            <Link to={createPageUrl("ProjectsOverview")}>
              <Button>Back to Projects</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div className="flex items-start gap-4">
          <Link to={createPageUrl("ProjectsOverview")}>
            <Button variant="ghost" size="icon" className="mt-1">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
                {project.name}
              </h1>
              {project.isHighPriority && (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  High Priority
                </Badge>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {project.projectRef && (
                <span className="text-sm text-muted-foreground font-mono">
                  {project.projectRef}
                </span>
              )}
              <Badge className={`${statusColors[project.status]} border`}>
                {project.status}
              </Badge>
              {project.projectType && (
                <Badge className={typeColors[project.projectType]}>
                  {project.projectType}
                </Badge>
              )}
            </div>
          </div>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link to={createPageUrl(`ProjectForm?id=${projectId}`)}>
                <Button variant="outline">
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit Project
                </Button>
              </Link>
            </TooltipTrigger>
            <TooltipContent>
              <p>Edit project details</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-muted">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="tasks" className="flex items-center gap-2">
            <ListTodo className="h-4 w-4" />
            <span className="hidden sm:inline">Tasks</span>
            {taskStats.total > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                {taskStats.total}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="gantt" className="flex items-center gap-2">
            <GanttChartSquare className="h-4 w-4" />
            <span className="hidden sm:inline">Gantt</span>
          </TabsTrigger>
          <TabsTrigger value="contacts" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Contacts</span>
            {contacts.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                {contacts.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Documents</span>
            {documents.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                {documents.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="sitevisits" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span className="hidden sm:inline">Site Visits</span>
            {siteVisits.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                {siteVisits.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="team" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Team</span>
            {allocations.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                {allocations.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="client" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Client Portal</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              {project.description && (
                <Card>
                  <CardHeader>
                    <CardTitle>Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground whitespace-pre-wrap">{project.description}</p>
                  </CardContent>
                </Card>
              )}

              {/* Task Progress */}
              <Card>
                <CardHeader>
                  <CardTitle>Task Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex-1">
                      <Progress value={completionPercentage} className="h-3" />
                    </div>
                    <span className="text-lg font-semibold text-foreground">
                      {completionPercentage}%
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="p-3 bg-muted rounded-lg text-center">
                      <p className="text-2xl font-bold text-foreground">{taskStats.total}</p>
                      <p className="text-sm text-muted-foreground">Total</p>
                    </div>
                    <div className="p-3 bg-success-50 rounded-lg text-center">
                      <p className="text-2xl font-bold text-success-foreground">{taskStats.completed}</p>
                      <p className="text-sm text-muted-foreground">Completed</p>
                    </div>
                    <div className="p-3 bg-info-50 rounded-lg text-center">
                      <p className="text-2xl font-bold text-info-foreground">{taskStats.inProgress}</p>
                      <p className="text-sm text-muted-foreground">In Progress</p>
                    </div>
                    <div className="p-3 bg-destructive-50 rounded-lg text-center">
                      <p className="text-2xl font-bold text-destructive">{taskStats.blocked}</p>
                      <p className="text-sm text-muted-foreground">Blocked</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Notes */}
              {project.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle>Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground whitespace-pre-wrap">{project.notes}</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Client Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Client</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-warning/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-warning-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{project.clientName}</p>
                    </div>
                  </div>
                  {project.clientEmail && (
                    <a
                      href={`mailto:${project.clientEmail}`}
                      className="flex items-center gap-2 text-sm text-info-foreground hover:underline"
                    >
                      <Mail className="h-4 w-4" />
                      {project.clientEmail}
                    </a>
                  )}
                  {project.clientPhone && (
                    <a
                      href={`tel:${project.clientPhone}`}
                      className="flex items-center gap-2 text-sm text-muted-foreground"
                    >
                      <Phone className="h-4 w-4" />
                      {project.clientPhone}
                    </a>
                  )}
                </CardContent>
              </Card>

              {/* Project Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {project.location && (
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Location</p>
                        <p className="text-foreground">{project.location}</p>
                      </div>
                    </div>
                  )}
                  {project.startDate && (
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Start Date</p>
                        <p className="text-foreground">
                          {format(new Date(project.startDate), "MMMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                  )}
                  {project.estimatedEndDate && (
                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Estimated End</p>
                        <p className="text-foreground">
                          {format(new Date(project.estimatedEndDate), "MMMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Budget */}
              {project.budget && (
                <Card>
                  <CardHeader>
                    <CardTitle>Budget</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 mb-2">
                      <PoundSterling className="h-5 w-5 text-muted-foreground" />
                      <span className="text-2xl font-bold text-foreground">
                        £{project.budget.toLocaleString()}
                      </span>
                    </div>
                    {project.currentSpend !== undefined && project.currentSpend !== null && (
                      <>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-muted-foreground">Spent</span>
                          <span className="font-medium">
                            £{project.currentSpend.toLocaleString()}
                          </span>
                        </div>
                        <Progress
                          value={(project.currentSpend / project.budget) * 100}
                          className={`h-2 ${
                            project.currentSpend / project.budget > 0.9 ? "[&>div]:bg-destructive" : ""
                          }`}
                        />
                        <p className="text-xs text-muted-foreground mt-2">
                          £{(project.budget - project.currentSpend).toLocaleString()} remaining
                        </p>
                      </>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks">
          <TaskList tasks={tasks} projectId={projectId} isLoading={loadingTasks} />
        </TabsContent>

        {/* Gantt Chart Tab */}
        <TabsContent value="gantt">
          <GanttChart tasks={tasks} project={project} isLoading={loadingTasks} />
        </TabsContent>

        {/* Contacts Tab */}
        <TabsContent value="contacts">
          <ContactList contacts={contacts} projectId={projectId} isLoading={loadingContacts} />
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents">
          <DocumentList documents={documents} projectId={projectId} isLoading={loadingDocuments} />
        </TabsContent>

        {/* Site Visits Tab */}
        <TabsContent value="sitevisits">
          <SiteVisitList reports={siteVisits} projectId={projectId} isLoading={loadingSiteVisits} />
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team">
          <ProjectTeam projectId={projectId} tasks={tasks} isLoading={loadingAllocations} />
        </TabsContent>

        {/* Client Portal Tab */}
        <TabsContent value="client">
          <ClientAccessManager projectId={projectId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}