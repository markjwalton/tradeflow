import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Trash2, Loader2, GripVertical, Edit, Settings } from "lucide-react";
import { toast } from "sonner";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

export default function InterestOptionsManager() {
  const queryClient = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const [editingOption, setEditingOption] = useState(null);
  const [form, setForm] = useState({ label: "", value: "", order: 0, isActive: true });

  const { data: options = [], isLoading } = useQuery({
    queryKey: ["interestOptions"],
    queryFn: () => base44.entities.InterestOption.list(),
  });

  const sortedOptions = [...options].sort((a, b) => (a.order || 0) - (b.order || 0));

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.InterestOption.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["interestOptions"] });
      setShowDialog(false);
      setForm({ label: "", value: "", order: 0, isActive: true });
      toast.success("Option created");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.InterestOption.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["interestOptions"] });
      setShowDialog(false);
      setEditingOption(null);
      setForm({ label: "", value: "", order: 0, isActive: true });
      toast.success("Option updated");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.InterestOption.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["interestOptions"] });
      toast.success("Option deleted");
    },
  });

  const handleSubmit = () => {
    if (!form.label) {
      toast.error("Label is required");
      return;
    }
    const data = {
      ...form,
      value: form.value || form.label.toLowerCase().replace(/\s+/g, "_"),
    };
    if (editingOption) {
      updateMutation.mutate({ id: editingOption.id, data });
    } else {
      data.order = options.length;
      createMutation.mutate(data);
    }
  };

  const handleEdit = (option) => {
    setEditingOption(option);
    setForm({
      label: option.label,
      value: option.value,
      order: option.order || 0,
      isActive: option.isActive !== false,
    });
    setShowDialog(true);
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    
    const items = Array.from(sortedOptions);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);

    // Update order for all items
    for (let i = 0; i < items.length; i++) {
      if (items[i].order !== i) {
        await base44.entities.InterestOption.update(items[i].id, { order: i });
      }
    }
    queryClient.invalidateQueries({ queryKey: ["interestOptions"] });
  };

  const toggleActive = async (option) => {
    await base44.entities.InterestOption.update(option.id, { isActive: !option.isActive });
    queryClient.invalidateQueries({ queryKey: ["interestOptions"] });
  };

  return (
    <div className="p-6 max-w-3xl mx-auto bg-[var(--color-background)] min-h-screen">
      <Card className="border-[var(--color-background-muted)] bg-[var(--color-background-paper)]">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-[var(--color-midnight)]">
              <Settings className="h-5 w-5" />
              Interest Options
            </CardTitle>
            <p className="text-sm text-[var(--color-charcoal)] mt-1">
              Manage the dropdown options shown on the enquiry form
            </p>
          </div>
          <Button onClick={() => { setEditingOption(null); setForm({ label: "", value: "", order: 0, isActive: true }); setShowDialog(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Option
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-[var(--color-charcoal)]" />
            </div>
          ) : options.length === 0 ? (
            <div className="text-center py-8 text-[var(--color-charcoal)]">
              No options configured. Add your first option above.
            </div>
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="options">
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps}>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-8"></TableHead>
                          <TableHead>Label</TableHead>
                          <TableHead>Value</TableHead>
                          <TableHead>Active</TableHead>
                          <TableHead className="w-24">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sortedOptions.map((option, index) => (
                          <Draggable key={option.id} draggableId={option.id} index={index}>
                            {(provided) => (
                              <TableRow
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                              >
                                <TableCell>
                                  <div {...provided.dragHandleProps}>
                                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                                  </div>
                                </TableCell>
                                <TableCell className="font-medium text-[var(--color-midnight)]">{option.label}</TableCell>
                                <TableCell className="text-[var(--color-charcoal)]">{option.value}</TableCell>
                                <TableCell>
                                  <Switch
                                    checked={option.isActive !== false}
                                    onCheckedChange={() => toggleActive(option)}
                                  />
                                </TableCell>
                                <TableCell>
                                  <div className="flex gap-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleEdit(option)}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-destructive"
                                      onClick={() => deleteMutation.mutate(option.id)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingOption ? "Edit Option" : "Add Option"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Label *</Label>
              <Input
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
                placeholder="e.g., Fitted Wardrobes"
              />
            </div>
            <div>
              <Label>Value (auto-generated if empty)</Label>
              <Input
                value={form.value}
                onChange={(e) => setForm({ ...form, value: e.target.value })}
                placeholder="e.g., fitted_wardrobes"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Active</Label>
              <Switch
                checked={form.isActive}
                onCheckedChange={(v) => setForm({ ...form, isActive: v })}
              />
            </div>
            <Button
              className="w-full"
              onClick={handleSubmit}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {(createMutation.isPending || updateMutation.isPending) && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              {editingOption ? "Update Option" : "Create Option"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}