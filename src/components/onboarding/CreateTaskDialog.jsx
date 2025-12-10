import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export default function CreateTaskDialog({ sessionId }) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    task_title: "",
    task_description: "",
    assigned_to: "",
    due_date: "",
    status: "todo",
    priority: "medium",
    category: "documentation"
  });

  const createTask = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.OnboardingTask.create({
        ...data,
        onboarding_session_id: sessionId
      });
    },
    onSuccess: () => {
      toast.success("Task created");
      queryClient.invalidateQueries(["sessionTasks", sessionId]);
      setOpen(false);
      setFormData({
        task_title: "",
        task_description: "",
        assigned_to: "",
        due_date: "",
        status: "todo",
        priority: "medium",
        category: "documentation"
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Task
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Task Title</label>
            <Input
              value={formData.task_title}
              onChange={(e) => setFormData({ ...formData, task_title: e.target.value })}
              placeholder="Enter task title..."
            />
          </div>
          
          <div>
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={formData.task_description}
              onChange={(e) => setFormData({ ...formData, task_description: e.target.value })}
              placeholder="Task details..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Priority</label>
              <Select value={formData.priority} onValueChange={(v) => setFormData({ ...formData, priority: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Category</label>
              <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="documentation">Documentation</SelectItem>
                  <SelectItem value="development">Development</SelectItem>
                  <SelectItem value="review">Review</SelectItem>
                  <SelectItem value="approval">Approval</SelectItem>
                  <SelectItem value="deployment">Deployment</SelectItem>
                  <SelectItem value="training">Training</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Assigned To</label>
            <Input
              value={formData.assigned_to}
              onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
              placeholder="Email address..."
            />
          </div>

          <div>
            <label className="text-sm font-medium">Due Date</label>
            <Input
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
            />
          </div>

          <Button 
            onClick={() => createTask.mutate(formData)} 
            className="w-full"
            disabled={createTask.isPending || !formData.task_title}
          >
            Create Task
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}