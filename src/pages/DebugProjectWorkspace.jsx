import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  Pencil,
  MapPin,
  Calendar,
  User,
  Phone,
  Mail,
  AlertTriangle,
  Clock,
  ListTodo,
  Users,
  FileText,
  ClipboardList,
  PoundSterling,
  GanttChartSquare
} from "lucide-react";
import { format } from "date-fns";

// Mock data - no database calls
const mockProject = {
  id: "debug-proj-1",
  name: "Garden Room – Oak Frame",
  description: "Bespoke oak-framed garden room with glazed gables and slate roof. Including electrical installation, underfloor heating, and landscaping integration.",
  projectRef: "PRJ-2025-DEBUG",
  status: "Active",
  projectType: "New Build",
  isHighPriority: true,
  clientName: "Jane Smith",
  clientEmail: "jane@example.com",
  clientPhone: "01onal 567890",
  location: "12 Oak Lane, Greenfield, GL5 4AB",
  startDate: "2025-01-15",
  estimatedEndDate: "2025-06-30",
  budget: 38000,
  currentSpend: 15200,
  notes: "Planning permission submitted. Client excited about the project!\n\nKey milestones:\n- Foundations: Feb 2025\n- Frame erection: March 2025\n- Completion: June 2025"
};

const mockTasks = [
  { id: "t1", title: "Site Survey", status: "Completed", priority: "High", dueDate: "2025-01-20" },
  { id: "t2", title: "Planning Application", status: "Completed", priority: "High", dueDate: "2025-01-25" },
  { id: "t3", title: "Foundation Excavation", status: "In Progress", priority: "High", dueDate: "2025-02-15" },
  { id: "t4", title: "Oak Frame Delivery", status: "Pending", priority: "Medium", dueDate: "2025-03-01" },
  { id: "t5", title: "Frame Erection", status: "Pending", priority: "High", dueDate: "2025-03-15" },
  { id: "t6", title: "Roofing", status: "Pending", priority: "Medium", dueDate: "2025-04-01" },
  { id: "t7", title: "Electrical First Fix", status: "Pending", priority: "Medium", dueDate: "2025-04-15" },
  { id: "t8", title: "Client Sign-off Meeting", status: "Blocked", priority: "Low", dueDate: "2025-02-28" },
];

const mockContacts = [
  { id: "c1", name: "Jane Smith", role: "Owner", email: "jane@example.com", phone: "01234 567890" },
  { id: "c2", name: "Tom Smith", role: "Co-Owner", email: "tom@example.com", phone: "01234 567891" },
  { id: "c3", name: "Mark Builder", role: "Site Manager", email: "mark@builders.co.uk", phone: "07700 900123" },
];

const mockDocuments = [
  { id: "d1", name: "Planning Application.pdf", category: "Planning", uploadedDate: "2025-01-18" },
  { id: "d2", name: "Site Survey Report.pdf", category: "Survey", uploadedDate: "2025-01-20" },
  { id: "d3", name: "Oak Frame Drawings.dwg", category: "Design", uploadedDate: "2025-01-22" },
];

const mockSiteVisits = [
  { id: "sv1", visitDate: "2025-01-18", attendees: ["Mark Builder", "Jane Smith"], notes: "Initial site assessment. Ground conditions good.", actionItems: ["Submit planning", "Order materials"] },
  { id: "sv2", visitDate: "2025-02-01", attendees: ["Mark Builder"], notes: "Foundation layout marked. Ready for excavation.", actionItems: ["Confirm concrete delivery"] },
];

const mockAllocations = [
  { id: "a1", memberName: "Mark Johnson", role: "Lead Carpenter", hoursAllocated: 120 },
  { id: "a2", memberName: "Steve Williams", role: "Site Manager", hoursAllocated: 80 },
  { id: "a3", memberName: "Dave Brown", role: "Electrician", hoursAllocated: 40 },
];

export default function DebugProjectWorkspace() {
  const [activeTab, setActiveTab] = useState("overview");

  const statusColors = {
    Planning: "bg-info-50 text-info border-primary/20",
    Active: "bg-success-50 text-success border-success/20",
    "On Hold": "bg-warning/10 text-warning border-warning/20",
    Completed: "bg-muted text-muted-foreground border-border",
  };

  const typeColors = {
    "New Build": "bg-info-50 text-info",
    Extension: "bg-accent-100 text-accent",
    Renovation: "bg-accent-200 text-accent",
    Conservation: "bg-warning/10 text-warning",
    Commercial: "bg-info-50 text-info",
  };

  const taskStats = {
    total: mockTasks.length,
    completed: mockTasks.filter((t) => t.status === "Completed").length,
    inProgress: mockTasks.filter((t) => t.status === "In Progress").length,
    blocked: mockTasks.filter((t) => t.status === "Blocked").length,
  };
  const completionPercentage = Math.round((taskStats.completed / taskStats.total) * 100);

  return (
    <div className="p-6 lg:p-8">
      {/* Debug Banner */}
      <div className="mb-4 p-3 bg-warning/10 border border-warning/20 rounded-lg flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-warning" />
        <span className="text-warning font-medium">DEBUG MODE</span>
        <span className="text-secondary text-sm">– Using static mock data, no database calls</span>
      </div>

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
              <h1 className="text-2xl lg:text-3xl font-bold text-midnight-900">
                {mockProject.name}
              </h1>
              {mockProject.isHighPriority && (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  High Priority
                </Badge>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground font-mono">
                {mockProject.projectRef}
              </span>
              <Badge className={`${statusColors[mockProject.status]} border`}>
                {mockProject.status}
              </Badge>
              <Badge className={typeColors[mockProject.projectType]}>
                {mockProject.projectType}
              </Badge>
            </div>
          </div>
        </div>
        <Link to={createPageUrl("DebugProjectEditor")}>
          <Button variant="outline">
            <Pencil className="h-4 w-4 mr-2" />
            Edit Project
          </Button>
        </Link>
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
            <Badge variant="secondary" className="ml-1 h-5 px-1.5">{taskStats.total}</Badge>
          </TabsTrigger>
          <TabsTrigger value="gantt" className="flex items-center gap-2">
            <GanttChartSquare className="h-4 w-4" />
            <span className="hidden sm:inline">Gantt</span>
          </TabsTrigger>
          <TabsTrigger value="contacts" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Contacts</span>
            <Badge variant="secondary" className="ml-1 h-5 px-1.5">{mockContacts.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Documents</span>
            <Badge variant="secondary" className="ml-1 h-5 px-1.5">{mockDocuments.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="sitevisits" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span className="hidden sm:inline">Site Visits</span>
            <Badge variant="secondary" className="ml-1 h-5 px-1.5">{mockSiteVisits.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="team" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Team</span>
            <Badge variant="secondary" className="ml-1 h-5 px-1.5">{mockAllocations.length}</Badge>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              <Card>
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-charcoal-700 whitespace-pre-wrap">{mockProject.description}</p>
                </CardContent>
              </Card>

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
                    <span className="text-lg font-semibold text-midnight-900">
                      {completionPercentage}%
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="p-3 bg-muted rounded-lg text-center">
                      <p className="text-2xl font-bold text-midnight-900">{taskStats.total}</p>
                      <p className="text-sm text-muted-foreground">Total</p>
                    </div>
                    <div className="p-3 bg-success-50 rounded-lg text-center">
                      <p className="text-2xl font-bold text-success">{taskStats.completed}</p>
                      <p className="text-sm text-muted-foreground">Completed</p>
                    </div>
                    <div className="p-3 bg-info-50 rounded-lg text-center">
                      <p className="text-2xl font-bold text-info">{taskStats.inProgress}</p>
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
              <Card>
                <CardHeader>
                  <CardTitle>Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-charcoal-700 whitespace-pre-wrap">{mockProject.notes}</p>
                </CardContent>
              </Card>
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
                    <div className="h-10 w-10 rounded-full bg-secondary-100 flex items-center justify-center">
                      <User className="h-5 w-5 text-secondary" />
                    </div>
                    <p className="font-medium text-midnight-900">{mockProject.clientName}</p>
                  </div>
                  <a href={`mailto:${mockProject.clientEmail}`} className="flex items-center gap-2 text-sm text-info hover:underline">
                    <Mail className="h-4 w-4" />
                    {mockProject.clientEmail}
                  </a>
                  <a href={`tel:${mockProject.clientPhone}`} className="flex items-center gap-2 text-sm text-charcoal-700">
                    <Phone className="h-4 w-4" />
                    {mockProject.clientPhone}
                  </a>
                </CardContent>
              </Card>

              {/* Project Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Location</p>
                      <p className="text-midnight-900">{mockProject.location}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Start Date</p>
                      <p className="text-midnight-900">
                        {format(new Date(mockProject.startDate), "MMMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Estimated End</p>
                      <p className="text-midnight-900">
                        {format(new Date(mockProject.estimatedEndDate), "MMMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Budget */}
              <Card>
                <CardHeader>
                  <CardTitle>Budget</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 mb-2">
                    <PoundSterling className="h-5 w-5 text-muted-foreground" />
                    <span className="text-2xl font-bold text-midnight-900">
                      £{mockProject.budget.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Spent</span>
                    <span className="font-medium">£{mockProject.currentSpend.toLocaleString()}</span>
                  </div>
                  <Progress value={(mockProject.currentSpend / mockProject.budget) * 100} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-2">
                    £{(mockProject.budget - mockProject.currentSpend).toLocaleString()} remaining
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks">
          <Card>
            <CardHeader>
              <CardTitle>Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{task.title}</p>
                      <p className="text-sm text-muted-foreground">Due: {task.dueDate}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={task.priority === "High" ? "destructive" : "secondary"}>{task.priority}</Badge>
                      <Badge className={
                        task.status === "Completed" ? "bg-success-50 text-success" :
                        task.status === "In Progress" ? "bg-info-50 text-info" :
                        task.status === "Blocked" ? "bg-destructive-50 text-destructive" :
                        "bg-muted text-muted-foreground"
                      }>{task.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Gantt Tab */}
        <TabsContent value="gantt">
          <Card>
            <CardContent className="py-12 text-center">
              <GanttChartSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Gantt chart visualization would appear here</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contacts Tab */}
        <TabsContent value="contacts">
          <Card>
            <CardHeader>
              <CardTitle>Contacts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockContacts.map((contact) => (
                  <div key={contact.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                        <User className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{contact.name}</p>
                        <p className="text-sm text-muted-foreground">{contact.role}</p>
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      <p className="text-info">{contact.email}</p>
                      <p className="text-muted-foreground">{contact.phone}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockDocuments.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{doc.name}</p>
                        <p className="text-sm text-muted-foreground">{doc.category}</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{doc.uploadedDate}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Site Visits Tab */}
        <TabsContent value="sitevisits">
          <Card>
            <CardHeader>
              <CardTitle>Site Visits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockSiteVisits.map((visit) => (
                  <div key={visit.id} className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{visit.visitDate}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">Attendees: {visit.attendees.join(", ")}</p>
                    <p className="text-charcoal-700 mb-2">{visit.notes}</p>
                    <div className="text-sm">
                      <span className="font-medium text-charcoal-700">Actions:</span>
                      <ul className="list-disc list-inside ml-2">
                        {visit.actionItems.map((item, i) => (
                          <li key={i} className="text-muted-foreground">{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team">
          <Card>
            <CardHeader>
              <CardTitle>Team Allocations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockAllocations.map((alloc) => (
                  <div key={alloc.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-secondary-100 flex items-center justify-center">
                        <User className="h-5 w-5 text-secondary" />
                      </div>
                      <div>
                        <p className="font-medium">{alloc.memberName}</p>
                        <p className="text-sm text-muted-foreground">{alloc.role}</p>
                      </div>
                    </div>
                    <Badge variant="outline">{alloc.hoursAllocated} hrs</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}