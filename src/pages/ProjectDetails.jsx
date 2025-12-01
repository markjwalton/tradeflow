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
    Planning: "bg-blue-100 text-blue-800 border-blue-200",
    Active: "bg-green-100 text-green-800 border-green-200",
    "On Hold": "bg-yellow-100 text-yellow-800 border-yellow-200",
    Completed: "bg-stone-100 text-stone-800 border-stone-200",
    Archived: "bg-stone-100 text-stone-600 border-stone-200",
  };

  const typeColors = {
    "New Build": "bg-indigo-100 text-indigo-800",
    Extension: "bg-purple-100 text-purple-800",
    Renovation: "bg-pink-100 text-pink-800",
    Conservation: "bg-amber-100 text-amber-800",
    Commercial: "bg-cyan-100 text-cyan-800",
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
            <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Project Not Found</h2>
            <p className="text-stone-500 mb-4">
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
              <h1 className="text-2xl lg:text-3xl font-bold text-stone-900">
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
                <span className="text-sm text-stone-500 font-mono">
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
        <TabsList className="bg-stone-100">
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
                    <p className="text-stone-600 whitespace-pre-wrap">{project.description}</p>
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
                    <span className="text-lg font-semibold text-stone-900">
                      {completionPercentage}%
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="p-3 bg-stone-50 rounded-lg text-center">
                      <p className="text-2xl font-bold text-stone-900">{taskStats.total}</p>
                      <p className="text-sm text-stone-500">Total</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg text-center">
                      <p className="text-2xl font-bold text-green-600">{taskStats.completed}</p>
                      <p className="text-sm text-stone-500">Completed</p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg text-center">
                      <p className="text-2xl font-bold text-blue-600">{taskStats.inProgress}</p>
                      <p className="text-sm text-stone-500">In Progress</p>
                    </div>
                    <div className="p-3 bg-red-50 rounded-lg text-center">
                      <p className="text-2xl font-bold text-red-600">{taskStats.blocked}</p>
                      <p className="text-sm text-stone-500">Blocked</p>
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
                    <p className="text-stone-600 whitespace-pre-wrap">{project.notes}</p>
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
                    <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                      <User className="h-5 w-5 text-amber-700" />
                    </div>
                    <div>
                      <p className="font-medium text-stone-900">{project.clientName}</p>
                    </div>
                  </div>
                  {project.clientEmail && (
                    <a
                      href={`mailto:${project.clientEmail}`}
                      className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                    >
                      <Mail className="h-4 w-4" />
                      {project.clientEmail}
                    </a>
                  )}
                  {project.clientPhone && (
                    <a
                      href={`tel:${project.clientPhone}`}
                      className="flex items-center gap-2 text-sm text-stone-600"
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
                      <MapPin className="h-5 w-5 text-stone-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-stone-500">Location</p>
                        <p className="text-stone-900">{project.location}</p>
                      </div>
                    </div>
                  )}
                  {project.startDate && (
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-stone-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-stone-500">Start Date</p>
                        <p className="text-stone-900">
                          {format(new Date(project.startDate), "MMMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                  )}
                  {project.estimatedEndDate && (
                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-stone-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-stone-500">Estimated End</p>
                        <p className="text-stone-900">
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
                      <PoundSterling className="h-5 w-5 text-stone-400" />
                      <span className="text-2xl font-bold text-stone-900">
                        £{project.budget.toLocaleString()}
                      </span>
                    </div>
                    {project.currentSpend !== undefined && project.currentSpend !== null && (
                      <>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-stone-500">Spent</span>
                          <span className="font-medium">
                            £{project.currentSpend.toLocaleString()}
                          </span>
                        </div>
                        <Progress
                          value={(project.currentSpend / project.budget) * 100}
                          className={`h-2 ${
                            project.currentSpend / project.budget > 0.9 ? "[&>div]:bg-red-500" : ""
                          }`}
                        />
                        <p className="text-xs text-stone-500 mt-2">
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