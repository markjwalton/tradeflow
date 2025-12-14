import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { 
  Plus, Loader2, Play, Pause, CheckCircle, Copy, Send, 
  Calendar, Code, Trash2, Archive
} from "lucide-react";
import { toast } from "sonner";
import moment from "moment";
import { PageHeader } from "@/components/sturij";

export default function SprintManager() {
  const queryClient = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const [editingSprint, setEditingSprint] = useState(null);
  const [formData, setFormData] = useState({ name: "", description: "", status: "planning" });

  const { data: sprints = [], isLoading } = useQuery({
    queryKey: ["sprints"],
    queryFn: () => base44.entities.DevelopmentSprint.list("-created_date"),
  });

  const { data: roadmapItems = [] } = useQuery({
    queryKey: ["roadmapItems"],
    queryFn: () => base44.entities.RoadmapItem.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.DevelopmentSprint.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sprints"] });
      toast.success("Sprint created");
      setShowDialog(false);
      setFormData({ name: "", description: "", status: "planning" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.DevelopmentSprint.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sprints"] });
      toast.success("Sprint updated");
      setShowDialog(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.DevelopmentSprint.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sprints"] });
      toast.success("Sprint deleted");
    },
  });

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (editingSprint) {
      updateMutation.mutate({ id: editingSprint.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const openDialog = (sprint = null) => {
    if (sprint) {
      setEditingSprint(sprint);
      setFormData(sprint);
    } else {
      setEditingSprint(null);
      setFormData({ name: "", description: "", status: "planning" });
    }
    setShowDialog(true);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const sendToChat = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied - paste into Base44 chat");
  };

  const getSprintItems = (sprint) => {
    return roadmapItems.filter(item => 
      item.sprints?.some(s => s.sprint_id === sprint.id)
    );
  };

  const statusColors = {
    planning: "bg-info-50 text-info",
    active: "bg-success-50 text-success",
    completed: "bg-muted text-muted-foreground",
    cancelled: "bg-destructive-50 text-destructive",
  };

  const activeSprints = sprints.filter(s => s.status === "active");
  const planningSprints = sprints.filter(s => s.status === "planning");
  const completedSprints = sprints.filter(s => s.status === "completed");

  return (
    <div className="max-w-7xl mx-auto -mt-6 min-h-screen">
      <PageHeader 
        title="Sprint Manager"
        description="Manage development sprints and track progress"
      />

      <Card className="border-border mb-4">
        <CardContent className="px-2 py-1">
          <div className="flex gap-2">
            <Button 
              variant="ghost"
              className="hover:bg-[#e9efeb] hover:text-[#273e2d]"
              onClick={() => openDialog()}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Sprint
            </Button>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="space-y-8">
          {/* Active Sprints */}
          {activeSprints.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-foreground">
                <Play className="h-5 w-5 text-success" />
                Active Sprints
              </h2>
              <div className="grid gap-4">
                {activeSprints.map(sprint => (
                  <SprintCard 
                    key={sprint.id} 
                    sprint={sprint} 
                    items={getSprintItems(sprint)}
                    onEdit={() => openDialog(sprint)}
                    onDelete={() => deleteMutation.mutate(sprint.id)}
                    onStatusChange={(status) => updateMutation.mutate({ id: sprint.id, data: { ...sprint, status } })}
                    onCopy={copyToClipboard}
                    onSend={sendToChat}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Planning Sprints */}
          {planningSprints.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-info" />
                Planning
              </h2>
              <div className="grid gap-4">
                {planningSprints.map(sprint => (
                  <SprintCard 
                    key={sprint.id} 
                    sprint={sprint} 
                    items={getSprintItems(sprint)}
                    onEdit={() => openDialog(sprint)}
                    onDelete={() => deleteMutation.mutate(sprint.id)}
                    onStatusChange={(status) => updateMutation.mutate({ id: sprint.id, data: { ...sprint, status } })}
                    onCopy={copyToClipboard}
                    onSend={sendToChat}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Completed Sprints */}
          {completedSprints.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-muted-foreground" />
                Completed
              </h2>
              <div className="grid gap-4">
                {completedSprints.map(sprint => (
                  <SprintCard 
                    key={sprint.id} 
                    sprint={sprint} 
                    items={getSprintItems(sprint)}
                    onEdit={() => openDialog(sprint)}
                    onDelete={() => deleteMutation.mutate(sprint.id)}
                    onStatusChange={(status) => updateMutation.mutate({ id: sprint.id, data: { ...sprint, status } })}
                    onCopy={copyToClipboard}
                    onSend={sendToChat}
                  />
                ))}
              </div>
            </div>
          )}

          {sprints.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Play className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No sprints yet. Create your first sprint!</p>
            </div>
          )}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingSprint ? "Edit Sprint" : "New Sprint"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Sprint name..."
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Sprint goals..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Start Date</label>
                <Input
                  type="date"
                  value={formData.start_date || ""}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">End Date</label>
                <Input
                  type="date"
                  value={formData.end_date || ""}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
              <Button onClick={handleSave}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SprintCard({ sprint, items, onEdit, onDelete, onStatusChange, onCopy, onSend }) {
  const [expanded, setExpanded] = useState(false);

  const statusColors = {
    planning: "bg-info-50 text-info",
    active: "bg-success-50 text-success",
    completed: "bg-muted text-muted-foreground",
    cancelled: "bg-destructive-50 text-destructive",
  };

  const combinedPrompt = items
    .filter(i => i.development_prompt)
    .map(i => `## ${i.title}\n\n${i.development_prompt}`)
    .join("\n\n---\n\n");

  return (
    <Card className="border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="text-lg">{sprint.name}</CardTitle>
            <Badge className={statusColors[sprint.status]}>{sprint.status}</Badge>
            <Badge variant="outline">{items.length} items</Badge>
          </div>
          <div className="flex items-center gap-2">
            {sprint.status === "planning" && (
              <Button size="sm" variant="outline" onClick={() => onStatusChange("active")}>
                <Play className="h-3 w-3 mr-1" /> Start
              </Button>
            )}
            {sprint.status === "active" && (
              <Button size="sm" variant="outline" onClick={() => onStatusChange("completed")}>
                <CheckCircle className="h-3 w-3 mr-1" /> Complete
              </Button>
            )}
            <Button size="sm" variant="ghost" onClick={onEdit}>Edit</Button>
            <Button size="sm" variant="ghost" className="text-destructive" onClick={onDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {sprint.description && (
          <p className="text-sm text-muted-foreground mt-1">{sprint.description}</p>
        )}
        {(sprint.start_date || sprint.end_date) && (
          <p className="text-xs text-muted-foreground mt-1">
            {sprint.start_date && moment(sprint.start_date).format("MMM D")}
            {sprint.start_date && sprint.end_date && " - "}
            {sprint.end_date && moment(sprint.end_date).format("MMM D, YYYY")}
          </p>
        )}
      </CardHeader>
      <CardContent>
        {items.length > 0 && (
          <div className="space-y-3">
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setExpanded(!expanded)}>
                <Code className="h-3 w-3 mr-1" /> {expanded ? "Hide" : "Show"} Items
              </Button>
              {combinedPrompt && (
                <>
                  <Button size="sm" variant="outline" onClick={() => onCopy(combinedPrompt)}>
                    <Copy className="h-3 w-3 mr-1" /> Copy All
                  </Button>
                  <Button size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground" onClick={() => onSend(combinedPrompt)}>
                    <Send className="h-3 w-3 mr-1" /> Send to Chat
                  </Button>
                </>
              )}
            </div>

            {expanded && (
              <div className="space-y-2 mt-3">
                {items.map(item => (
                  <div key={item.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">{item.title}</span>
                      <Badge variant="outline">{item.status}</Badge>
                    </div>
                    {item.development_prompt && (
                      <div className="bg-muted rounded p-2 mt-2">
                        <pre className="text-xs whitespace-pre-wrap font-mono">{item.development_prompt.substring(0, 200)}...</pre>
                        <div className="flex gap-2 mt-2">
                          <Button size="sm" variant="ghost" onClick={() => onCopy(item.development_prompt)}>
                            <Copy className="h-3 w-3 mr-1" /> Copy
                          </Button>
                          <Button size="sm" variant="ghost" className="text-accent" onClick={() => onSend(item.development_prompt)}>
                            <Send className="h-3 w-3 mr-1" /> Send
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {items.length === 0 && (
          <p className="text-sm text-muted-foreground">No items in this sprint yet</p>
        )}
      </CardContent>
    </Card>
  );
}