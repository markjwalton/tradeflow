import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy, Globe, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

export default function WebsiteTemplateManager() {
  const queryClient = useQueryClient();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [formData, setFormData] = useState({
    newWebsiteName: "",
    newWebsiteSlug: "",
    applyTheme: true
  });

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['websiteTemplates'],
    queryFn: () => base44.entities.WebsiteTemplate.list()
  });

  const { data: themes = [] } = useQuery({
    queryKey: ['websiteThemes'],
    queryFn: () => base44.entities.WebsiteTheme.filter({ is_library_theme: true })
  });

  const duplicateMutation = useMutation({
    mutationFn: async (data) => {
      const response = await base44.functions.invoke('duplicateWebsiteFromTemplate', data);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(`Website created successfully! ${data.pagesCreated} pages and ${data.assetsCreated} assets duplicated.`);
      queryClient.invalidateQueries({ queryKey: ['websiteFolders'] });
      setCreateDialogOpen(false);
      setFormData({ newWebsiteName: "", newWebsiteSlug: "", applyTheme: true });
    },
    onError: (error) => {
      toast.error('Failed to create website: ' + error.message);
    }
  });

  const handleDuplicate = () => {
    if (!selectedTemplate || !formData.newWebsiteName || !formData.newWebsiteSlug) {
      toast.error('Please fill in all required fields');
      return;
    }

    duplicateMutation.mutate({
      templateId: selectedTemplate.id,
      newWebsiteName: formData.newWebsiteName,
      newWebsiteSlug: formData.newWebsiteSlug,
      applyTheme: formData.applyTheme
    });
  };

  const getCategoryColor = (category) => {
    const colors = {
      business: 'bg-blue-100 text-blue-800',
      portfolio: 'bg-purple-100 text-purple-800',
      ecommerce: 'bg-green-100 text-green-800',
      blog: 'bg-yellow-100 text-yellow-800',
      landing: 'bg-pink-100 text-pink-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[category] || colors.other;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Website Templates</h1>
          <p className="text-muted-foreground">Create new websites from pre-built templates</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <Card key={template.id} className="hover:shadow-lg transition-shadow">
            {template.preview_image && (
              <div className="h-48 bg-muted overflow-hidden rounded-t-lg">
                <img 
                  src={template.preview_image} 
                  alt={template.template_name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-xl">{template.template_name}</CardTitle>
                <Badge className={getCategoryColor(template.category)}>
                  {template.category}
                </Badge>
              </div>
              <CardDescription>{template.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => {
                  setSelectedTemplate(template);
                  setCreateDialogOpen(true);
                }}
                className="w-full"
              >
                <Copy className="h-4 w-4 mr-2" />
                Create from Template
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {templates.length === 0 && (
        <div className="text-center py-12">
          <Globe className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No templates available</h3>
          <p className="text-muted-foreground">Templates will appear here once created</p>
        </div>
      )}

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Website from Template</DialogTitle>
            <DialogDescription>
              {selectedTemplate?.template_name} - Configure your new website
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="websiteName">Website Name *</Label>
              <Input
                id="websiteName"
                placeholder="My New Website"
                value={formData.newWebsiteName}
                onChange={(e) => setFormData({ ...formData, newWebsiteName: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="websiteSlug">Website Slug *</Label>
              <Input
                id="websiteSlug"
                placeholder="my-new-website"
                value={formData.newWebsiteSlug}
                onChange={(e) => setFormData({ ...formData, newWebsiteSlug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="applyTheme"
                checked={formData.applyTheme}
                onChange={(e) => setFormData({ ...formData, applyTheme: e.target.checked })}
                className="h-4 w-4"
              />
              <Label htmlFor="applyTheme">Apply default theme</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleDuplicate}
              disabled={duplicateMutation.isPending}
            >
              {duplicateMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Website
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}