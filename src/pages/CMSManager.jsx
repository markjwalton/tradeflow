import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/sturij/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Package } from 'lucide-react';
import { ContentList } from '@/components/cms/ContentList';
import { ContentEditor } from '@/components/cms/ContentEditor';
import { MediaManager } from '@/components/cms/MediaManager';
import { TemplateLibrary } from '@/components/cms/TemplateLibrary';
import { PackageManager } from '@/components/cms/PackageManager';
import { ScheduleManager } from '@/components/cms/ScheduleManager';
import PageTemplateGenerator from '@/components/cms/PageTemplateGenerator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function CMSManager() {
  const [activeTab, setActiveTab] = useState('pages');
  const [editingContent, setEditingContent] = useState(null);
  const [contentType, setContentType] = useState(null);
  const [selectedWebsite, setSelectedWebsite] = useState(null);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [templateData, setTemplateData] = useState({
    template_name: '',
    description: '',
    category: 'other'
  });
  const queryClient = useQueryClient();

  const { data: websiteFolders = [] } = useQuery({
    queryKey: ['websiteFolders'],
    queryFn: () => base44.entities.WebsiteFolder.list(),
  });

  const handleEdit = (content, type) => {
    setEditingContent(content);
    setContentType(type);
  };

  const handleCreate = (type) => {
    setEditingContent({ content_type: type });
    setContentType(type);
  };

  const handleClose = () => {
    setEditingContent(null);
    setContentType(null);
  };

  const createTemplateMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.WebsiteTemplate.create(data);
    },
    onSuccess: () => {
      toast.success('Website template created successfully!');
      queryClient.invalidateQueries({ queryKey: ['websiteTemplates'] });
      setTemplateDialogOpen(false);
      setTemplateData({ template_name: '', description: '', category: 'other' });
    },
    onError: (error) => {
      toast.error('Failed to create template: ' + error.message);
    }
  });

  const handleCreateTemplate = () => {
    if (!selectedWebsite || !templateData.template_name) {
      toast.error('Please fill in template name');
      return;
    }

    createTemplateMutation.mutate({
      template_name: templateData.template_name,
      description: templateData.description,
      source_folder_id: selectedWebsite.id,
      category: templateData.category,
      is_public: true
    });
  };

  if (editingContent) {
    return (
      <ContentEditor
        content={editingContent}
        contentType={contentType}
        websiteFolderId={selectedWebsite?.id}
        onClose={handleClose}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Content Management" 
        description="Manage all your website content in one place"
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Website</CardTitle>
          {selectedWebsite && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setTemplateDialogOpen(true)}
            >
              <Package className="h-4 w-4 mr-2" />
              Save as Template
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <Select 
            value={selectedWebsite?.id} 
            onValueChange={(id) => {
              const website = websiteFolders.find(w => w.id === id);
              setSelectedWebsite(website);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a website to manage..." />
            </SelectTrigger>
            <SelectContent>
              {websiteFolders.map((website) => (
                <SelectItem key={website.id} value={website.id}>
                  {website.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {!selectedWebsite ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Select a website to view and manage content
          </CardContent>
        </Card>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pages">Pages</TabsTrigger>
          <TabsTrigger value="blog">Blog Posts</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="sections">Sections</TabsTrigger>
          <TabsTrigger value="media">Media Library</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="generator">AI Generator</TabsTrigger>
          <TabsTrigger value="packages">Packages</TabsTrigger>
          <TabsTrigger value="schedules">Schedules</TabsTrigger>
        </TabsList>

        <TabsContent value="pages">
          <ContentList
            contentType="page"
            websiteFolderId={selectedWebsite.id}
            onEdit={(content) => handleEdit(content, 'page')}
            onCreate={() => handleCreate('page')}
          />
        </TabsContent>

        <TabsContent value="blog">
          <ContentList
            contentType="blog"
            websiteFolderId={selectedWebsite.id}
            onEdit={(content) => handleEdit(content, 'blog')}
            onCreate={() => handleCreate('blog')}
          />
        </TabsContent>

        <TabsContent value="products">
          <ContentList
            contentType="product"
            websiteFolderId={selectedWebsite.id}
            onEdit={(content) => handleEdit(content, 'product')}
            onCreate={() => handleCreate('product')}
          />
        </TabsContent>

        <TabsContent value="sections">
          <ContentList
            contentType="section"
            websiteFolderId={selectedWebsite.id}
            onEdit={(content) => handleEdit(content, 'section')}
            onCreate={() => handleCreate('section')}
          />
        </TabsContent>

        <TabsContent value="media">
          <MediaManager />
        </TabsContent>

        <TabsContent value="templates">
          <TemplateLibrary />
        </TabsContent>

        <TabsContent value="generator">
          <PageTemplateGenerator />
        </TabsContent>

        <TabsContent value="packages">
          <PackageManager websiteFolderId={selectedWebsite.id} />
        </TabsContent>

        <TabsContent value="schedules">
          <ScheduleManager />
        </TabsContent>
      </Tabs>
      )}

      <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save as Website Template</DialogTitle>
            <DialogDescription>
              Create a reusable template from {selectedWebsite?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="templateName">Template Name *</Label>
              <Input
                id="templateName"
                placeholder="Modern Business Template"
                value={templateData.template_name}
                onChange={(e) => setTemplateData({ ...templateData, template_name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="A modern, professional template for businesses..."
                value={templateData.description}
                onChange={(e) => setTemplateData({ ...templateData, description: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select 
                value={templateData.category}
                onValueChange={(value) => setTemplateData({ ...templateData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="portfolio">Portfolio</SelectItem>
                  <SelectItem value="ecommerce">E-commerce</SelectItem>
                  <SelectItem value="blog">Blog</SelectItem>
                  <SelectItem value="landing">Landing Page</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setTemplateDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateTemplate}
              disabled={createTemplateMutation.isPending}
            >
              Create Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}