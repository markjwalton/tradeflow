import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Star, Folder, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function CustomProjectSelector({ 
  selectedProjectId, 
  onSelectProject,
  showCreateOption = true 
}) {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["customProjects"],
    queryFn: () => base44.entities.CustomProject.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.CustomProject.create(data),
    onSuccess: (newProject) => {
      queryClient.invalidateQueries({ queryKey: ["customProjects"] });
      onSelectProject(newProject.id);
      setShowCreate(false);
      setNewName("");
      setNewDescription("");
      toast.success("Project created");
    },
  });

  const handleCreate = () => {
    if (!newName.trim()) {
      toast.error("Name is required");
      return;
    }
    createMutation.mutate({
      name: newName,
      description: newDescription,
      category: "Custom",
      is_starred: false
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Select value={selectedProjectId || "default"} onValueChange={(v) => onSelectProject(v === "default" ? null : v)}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Select project" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="default">
            <span className="flex items-center gap-2">
              <Folder className="h-3 w-3" />
              Default Library
            </span>
          </SelectItem>
          {projects.map((project) => (
            <SelectItem key={project.id} value={project.id}>
              <span className="flex items-center gap-2">
                {project.is_starred && <Star className="h-3 w-3 text-[var(--color-warning)] fill-[var(--color-warning)]" />}
                {project.name}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {showCreateOption && (
        <Button variant="outline" size="icon" onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4" />
        </Button>
      )}

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Custom Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-[var(--color-midnight)]">Project Name *</label>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g., My Construction App"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[var(--color-midnight)]">Description</label>
              <Input
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Project description..."
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button onClick={handleCreate} disabled={createMutation.isPending} className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white">
                {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Create Project
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}