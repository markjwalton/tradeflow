import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/sturij/PageHeader';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ContentList } from '@/components/cms/ContentList';
import { ContentEditor } from '@/components/cms/ContentEditor';
import { MediaManager } from '@/components/cms/MediaManager';
import { TemplateLibrary } from '@/components/cms/TemplateLibrary';
import { PackageManager } from '@/components/cms/PackageManager';

export default function CMSManager() {
  const [activeTab, setActiveTab] = useState('pages');
  const [editingContent, setEditingContent] = useState(null);
  const [contentType, setContentType] = useState(null);

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

  if (editingContent) {
    return (
      <ContentEditor
        content={editingContent}
        contentType={contentType}
        onClose={handleClose}
      />
    );
  }

  return (
    <div>
      <PageHeader 
        title="Content Management" 
        description="Manage all your website content in one place"
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
        <TabsList>
          <TabsTrigger value="pages">Pages</TabsTrigger>
          <TabsTrigger value="blog">Blog Posts</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="sections">Sections</TabsTrigger>
          <TabsTrigger value="media">Media Library</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="packages">Packages</TabsTrigger>
        </TabsList>

        <TabsContent value="pages">
          <ContentList
            contentType="page"
            onEdit={(content) => handleEdit(content, 'page')}
            onCreate={() => handleCreate('page')}
          />
        </TabsContent>

        <TabsContent value="blog">
          <ContentList
            contentType="blog"
            onEdit={(content) => handleEdit(content, 'blog')}
            onCreate={() => handleCreate('blog')}
          />
        </TabsContent>

        <TabsContent value="products">
          <ContentList
            contentType="product"
            onEdit={(content) => handleEdit(content, 'product')}
            onCreate={() => handleCreate('product')}
          />
        </TabsContent>

        <TabsContent value="sections">
          <ContentList
            contentType="section"
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

        <TabsContent value="packages">
          <PackageManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}