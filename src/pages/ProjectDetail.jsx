import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Plus, Pencil, Trash2, Loader2, CheckCircle2, Clock } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";

const statusColors = {
  draft: "bg-muted text-muted-foreground",
  active: "bg-success-50 text-success",
  on_hold: "bg-warning/10 text-warning",
  completed: "bg-info-50 text-info",
  cancelled: "bg-destructive-50 text-destructive",
};

const taskStatusColors = {
  todo: "bg-muted text-muted-foreground",
  in_progress: "bg-info-50 text-info",
  review: "bg-accent-100 text-accent",
  completed: "bg-success-50 text-success",
};

export default function ProjectDetail() {
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const projectId = urlParams.get("id");

  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskForm, setTaskForm] = useState({ title: "", description: "", status: "todo", priority: "medium", due_date: "", assigned_to: "" });
  const [contactForm, setContactForm] = useState({ name: "", role: "client", email: "", phone: "", company: "", notes: "" });

  const { data: project, isLoading } = useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => {
      const projects = await base44.entities.Project.filter({ id: projectId });
      return projects[0];
    },
    enabled: !!projectId,
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ["projectTasks", projectId],
    queryFn: () => base44.entities.Task.filter({ project_id: projectId }),
    enabled: !!projectId,
  });

  const { data: contacts = [] } = useQuery({
    queryKey: ["projectContacts", projectId],
    queryFn: () => base44.entities.Contact.filter({ project_id: projectId }),
    enabled: !!projectId,
  });

  const { data: estimates = [] } = useQuery({
    queryKey: ["projectEstimates", projectId],
    queryFn: () => base44.entities.Estimate.filter({ project_id: projectId }),
    enabled: !!projectId,
  });

  const { data: customers = [] } = useQuery({ queryKey: ["customers"], queryFn: () => base44.entities.Customer.list() });
  const { data: teamMembers = [] } = useQuery({ queryKey: ["teamMembers"], queryFn: () => base44.entities.TeamMember.list() });

  const createTaskMutation = useMutation({
    mutationFn: (data) => base44.entities.Task.create({ ...data, project_id: projectId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projectTasks", projectId] });
      setShowTaskForm(false);
      setTaskForm({ title: "", description: "", status: "todo", priority: "medium", due_date: "", assigned_to: "" });
      toast.success("Task created");
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Task.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projectTasks", projectId] });
      setShowTaskForm(false);
      setEditingTask(null);
      toast.success("Task updated");
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (id) => base44.entities.Task.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projectTasks", projectId] });
      toast.success("Task deleted");
    },
  });

  const createContactMutation = useMutation({
    mutationFn: (data) => base44.entities.Contact.create({ ...data, project_id: projectId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projectContacts", projectId] });
      setShowContactForm(false);
      setContactForm({ name: "", role: "client", email: "", phone: "", company: "", notes: "" });
      toast.success("Contact added");
    },
  });

  const deleteContactMutation = useMutation({
    mutationFn: (id) => base44.entities.Contact.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projectContacts", projectId] });
      toast.success("Contact removed");
    },
  });

  const handleEditTask = (task) => {
    setEditingTask(task);
    setTaskForm({ title: task.title || "", description: task.description || "", status: task.status || "todo", priority: task.priority || "medium", due_date: task.due_date || "", assigned_to: task.assigned_to || "" });
    setShowTaskForm(true);
  };

  const handleSubmitTask = () => {
    if (editingTask) {
      updateTaskMutation.mutate({ id: editingTask.id, data: taskForm });
    } else {
      createTaskMutation.mutate(taskForm);
    }
  };

  const getCustomerName = (customerId) => customers.find((c) => c.id === customerId)?.name || "Unknown";
  const getTeamMemberName = (memberId) => teamMembers.find((m) => m.id === memberId)?.name || "Unassigned";

  if (isLoading) {
    return <div className="flex items-center justify-center h-64 bg-background"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (!project) {
    return (
      <div className="p-6 text-center bg-background">
        <p className="text-charcoal-700">Project not found</p>
        <Button asChild className="mt-4"><Link to={createPageUrl("Projects")}>Back to Projects</Link></Button>
      </div>
    );
  }

  const budgetProgress = project.budget > 0 ? (project.spend / project.budget) * 100 : 0;
  const completedTasks = tasks.filter((t) => t.status === "completed").length;
  const taskProgress = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;

  return (
    <div className="p-6 bg-background min-h-screen">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" asChild><Link to={createPageUrl("Projects")}><ArrowLeft className="h-4 w-4" /></Link></Button>
        <div className="flex-1">
          <h1 className="text-2xl font-light font-display text-midnight-900">{project.name}</h1>
          <p className="text-charcoal-700">Customer: {getCustomerName(project.customer_id)}</p>
        </div>
        <Badge className={statusColors[project.status]}>{project.status}</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="border-border bg-card">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-info-50 rounded-lg"><Clock className="h-5 w-5 text-info" /></div>
              <div><p className="text-sm text-charcoal-700">Tasks</p><p className="text-xl font-bold text-midnight-900">{tasks.length}</p></div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success-50 rounded-lg"><CheckCircle2 className="h-5 w-5 text-success" /></div>
              <div><p className="text-sm text-charcoal-700">Completed</p><p className="text-xl font-bold text-midnight-900">{completedTasks}</p></div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="pt-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm"><span className="text-charcoal-700">Budget</span><span>£{project.spend?.toLocaleString()} / £{project.budget?.toLocaleString()}</span></div>
              <Progress value={Math.min(budgetProgress, 100)} className="h-2" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="pt-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm"><span className="text-charcoal-700">Progress</span><span>{taskProgress.toFixed(0)}%</span></div>
              <Progress value={taskProgress} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="tasks">
        <TabsList>
          <TabsTrigger value="tasks">Tasks ({tasks.length})</TabsTrigger>
          <TabsTrigger value="contacts">Contacts ({contacts.length})</TabsTrigger>
          <TabsTrigger value="estimates">Estimates ({estimates.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="mt-4">
          <div className="flex justify-end mb-4">
            <Button onClick={() => { setEditingTask(null); setTaskForm({ title: "", description: "", status: "todo", priority: "medium", due_date: "", assigned_to: "" }); setShowTaskForm(true); }}>
              <Plus className="h-4 w-4 mr-2" />Add Task
            </Button>
          </div>
          <div className="space-y-2">
            {tasks.map((task) => (
              <Card key={task.id} className="border-border bg-card">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-midnight-900">{task.title}</span>
                      <Badge className={taskStatusColors[task.status]}>{task.status?.replace("_", " ")}</Badge>
                    </div>
                    <div className="flex gap-4 text-sm text-charcoal-700 mt-1">
                      <span>Assigned: {getTeamMemberName(task.assigned_to)}</span>
                      {task.due_date && <span>Due: {format(new Date(task.due_date), "MMM d")}</span>}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEditTask(task)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteTaskMutation.mutate(task.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {tasks.length === 0 && <p className="text-center py-8 text-charcoal-700">No tasks yet</p>}
          </div>
        </TabsContent>

        <TabsContent value="contacts" className="mt-4">
          <div className="flex justify-end mb-4">
            <Button onClick={() => { setContactForm({ name: "", role: "client", email: "", phone: "", company: "", notes: "" }); setShowContactForm(true); }}>
              <Plus className="h-4 w-4 mr-2" />Add Contact
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contacts.map((contact) => (
              <Card key={contact.id} className="border-border bg-card">
                <CardContent className="p-4">
                  <div className="flex justify-between">
                    <div><p className="font-medium text-midnight-900">{contact.name}</p><Badge variant="outline" className="mt-1">{contact.role}</Badge></div>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteContactMutation.mutate(contact.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                  {contact.company && <p className="text-sm text-charcoal-700 mt-2">{contact.company}</p>}
                  {contact.email && <p className="text-sm mt-1">{contact.email}</p>}
                  {contact.phone && <p className="text-sm">{contact.phone}</p>}
                </CardContent>
              </Card>
            ))}
            {contacts.length === 0 && <p className="text-center py-8 text-charcoal-700 col-span-3">No contacts yet</p>}
          </div>
        </TabsContent>

        <TabsContent value="estimates" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {estimates.map((estimate) => (
              <Card key={estimate.id} className="border-border bg-card">
                <CardContent className="p-4">
                  <p className="font-medium text-midnight-900">{estimate.title}</p>
                  <Badge className="mt-1">{estimate.status}</Badge>
                  <p className="text-lg font-bold mt-2 text-midnight-900">£{estimate.total?.toLocaleString()}</p>
                </CardContent>
              </Card>
            ))}
            {estimates.length === 0 && <p className="text-center py-8 text-charcoal-700 col-span-3">No estimates yet</p>}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={showTaskForm} onOpenChange={setShowTaskForm}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingTask ? "Edit Task" : "Add Task"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><label className="text-sm font-medium">Title</label><Input value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} /></div>
            <div><label className="text-sm font-medium">Description</label><Textarea value={taskForm.description} onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-medium">Status</label>
                <Select value={taskForm.status} onValueChange={(v) => setTaskForm({ ...taskForm, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="todo">To Do</SelectItem><SelectItem value="in_progress">In Progress</SelectItem><SelectItem value="review">Review</SelectItem><SelectItem value="completed">Completed</SelectItem></SelectContent>
                </Select>
              </div>
              <div><label className="text-sm font-medium">Priority</label>
                <Select value={taskForm.priority} onValueChange={(v) => setTaskForm({ ...taskForm, priority: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="low">Low</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="high">High</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-medium">Due Date</label><Input type="date" value={taskForm.due_date} onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })} /></div>
              <div><label className="text-sm font-medium">Assigned To</label>
                <Select value={taskForm.assigned_to} onValueChange={(v) => setTaskForm({ ...taskForm, assigned_to: v })}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>{teamMembers.map((m) => (<SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>))}</SelectContent>
                </Select>
              </div>
            </div>
            <Button className="w-full" onClick={handleSubmitTask} disabled={!taskForm.title}>{editingTask ? "Update Task" : "Create Task"}</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showContactForm} onOpenChange={setShowContactForm}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Contact</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><label className="text-sm font-medium">Name</label><Input value={contactForm.name} onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })} /></div>
            <div><label className="text-sm font-medium">Role</label>
              <Select value={contactForm.role} onValueChange={(v) => setContactForm({ ...contactForm, role: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="client">Client</SelectItem><SelectItem value="architect">Architect</SelectItem><SelectItem value="supplier">Supplier</SelectItem><SelectItem value="contractor">Contractor</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-medium">Email</label><Input value={contactForm.email} onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })} /></div>
              <div><label className="text-sm font-medium">Phone</label><Input value={contactForm.phone} onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })} /></div>
            </div>
            <div><label className="text-sm font-medium">Company</label><Input value={contactForm.company} onChange={(e) => setContactForm({ ...contactForm, company: e.target.value })} /></div>
            <Button className="w-full" onClick={() => createContactMutation.mutate(contactForm)} disabled={!contactForm.name}>Add Contact</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}