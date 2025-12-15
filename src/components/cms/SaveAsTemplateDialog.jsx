import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { FileText } from 'lucide-react';
import { toast } from 'sonner';

export function SaveAsTemplateDialog({ content, contentType, triggerButton }) {
  const [open, setOpen] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [isGlobal, setIsGlobal] = useState(false);
  const queryClient = useQueryClient();

  const saveTemplateMutation = useMutation({
    mutationFn: (templateData) => base44.entities.ContentTemplate.create(templateData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-templates'] });
      toast.success('Template saved successfully');
      setOpen(false);
      resetForm();
    },
  });

  const resetForm = () => {
    setTemplateName('');
    setCategory('');
    setDescription('');
    setIsGlobal(false);
  };

  const handleSave = () => {
    if (!templateName.trim()) {
      toast.error('Please enter a template name');
      return;
    }

    const templateData = {
      name: templateName,
      template_type: contentType,
      category: category || 'Uncategorized',
      description,
      template_data: JSON.stringify(content),
      is_global: isGlobal,
    };

    saveTemplateMutation.mutate(templateData);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Save as Template
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save as Template</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="template-name">Template Name *</Label>
            <Input
              id="template-name"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="e.g., Product Landing Page"
            />
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g., Landing Page, Blog Post"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe this template..."
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="global"
              checked={isGlobal}
              onCheckedChange={setIsGlobal}
            />
            <Label htmlFor="global">Make available to all tenants</Label>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              disabled={saveTemplateMutation.isPending}
            >
              {saveTemplateMutation.isPending ? 'Saving...' : 'Save Template'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}