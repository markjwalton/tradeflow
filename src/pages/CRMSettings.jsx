import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Plus, Trash2, GripVertical, Save, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { CRMAppShell, CRMPageHeader } from '../components/crm/CRMAppShell';

export default function CRMSettings() {
  const queryClient = useQueryClient();
  const [editingSet, setEditingSet] = useState(null);
  const [newOption, setNewOption] = useState({ value: '', label: '' });

  const { data: optionSets = [], isLoading } = useQuery({
    queryKey: ['dropdownOptionSets'],
    queryFn: () => base44.entities.DropdownOptionSet.list(),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.DropdownOptionSet.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dropdownOptionSets'] });
      toast.success('Option set updated');
      setEditingSet(null);
    },
  });

  const handleAddOption = () => {
    if (!newOption.value || !newOption.label) return;
    const updatedOptions = [
      ...editingSet.options,
      {
        value: newOption.value,
        label: newOption.label,
        order: editingSet.options.length + 1,
        is_active: true,
      },
    ];
    setEditingSet({ ...editingSet, options: updatedOptions });
    setNewOption({ value: '', label: '' });
  };

  const handleRemoveOption = (index) => {
    const updatedOptions = editingSet.options.filter((_, i) => i !== index);
    setEditingSet({ ...editingSet, options: updatedOptions });
  };

  const handleToggleActive = (index) => {
    const updatedOptions = editingSet.options.map((opt, i) =>
      i === index ? { ...opt, is_active: !opt.is_active } : opt
    );
    setEditingSet({ ...editingSet, options: updatedOptions });
  };

  const handleSave = () => {
    updateMutation.mutate({
      id: editingSet.id,
      data: { options: editingSet.options },
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <CRMAppShell currentPage="CRMSettings" breadcrumbs={[{ label: 'Settings' }]}>
      <CRMPageHeader
        title="CRM Settings"
        description="Manage dropdown options for your CRM system"
        icon={Settings}
      />

      <Accordion type="single" collapsible className="space-y-4">
        {optionSets.map((set) => (
          <AccordionItem key={set.id} value={set.id} className="border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <span className="font-medium">{set.name}</span>
                <Badge variant="secondary">{set.options?.length || 0} options</Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="pt-2 pb-4">
                <p className="text-sm text-muted-foreground mb-4">{set.description}</p>
                <div className="space-y-2 mb-4">
                  {set.options
                    ?.sort((a, b) => (a.order || 0) - (b.order || 0))
                    .map((option, index) => (
                      <div
                        key={index}
                        className={`flex items-center justify-between p-2 rounded border ${
                          option.is_active ? 'bg-background' : 'bg-muted opacity-60'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <GripVertical className="h-4 w-4 text-muted-foreground" />
                          <span>{option.label}</span>
                          <span className="text-xs text-muted-foreground">({option.value})</span>
                        </div>
                        {!option.is_active && (
                          <Badge variant="outline" className="text-xs">Inactive</Badge>
                        )}
                      </div>
                    ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingSet({ ...set })}
                >
                  Edit Options
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <Dialog open={!!editingSet} onOpenChange={() => setEditingSet(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit {editingSet?.name}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              {editingSet?.options
                ?.sort((a, b) => (a.order || 0) - (b.order || 0))
                .map((option, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 border rounded"
                  >
                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                    <div className="flex-1">
                      <span className="font-medium">{option.label}</span>
                      <span className="text-xs text-muted-foreground ml-2">({option.value})</span>
                    </div>
                    <Switch
                      checked={option.is_active}
                      onCheckedChange={() => handleToggleActive(index)}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => handleRemoveOption(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
            </div>

            <div className="border-t pt-4">
              <Label className="text-sm font-medium">Add New Option</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  placeholder="Value (e.g., NewType)"
                  value={newOption.value}
                  onChange={(e) => setNewOption({ ...newOption, value: e.target.value })}
                />
                <Input
                  placeholder="Label (e.g., New Type)"
                  value={newOption.label}
                  onChange={(e) => setNewOption({ ...newOption, label: e.target.value })}
                />
                <Button variant="outline" size="icon" onClick={handleAddOption}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingSet(null)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={updateMutation.isPending}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CRMAppShell>
  );
}