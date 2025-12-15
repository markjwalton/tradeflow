import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { VersionHistory } from './VersionHistory';
import { SaveAsTemplateDialog } from './SaveAsTemplateDialog';
import { ApplyTemplateDialog } from './ApplyTemplateDialog';

const entityMap = {
  page: 'CMSPage',
  blog: 'CMSBlogPost',
  product: 'CMSProduct',
  section: 'CMSSection',
};

export function ContentEditor({ content, contentType, websiteFolderId, onClose }) {
  const [formData, setFormData] = useState(content || {});
  const queryClient = useQueryClient();

  const entityName = entityMap[contentType];

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      const payload = { ...data, website_folder_id: websiteFolderId };
      let result;
      if (content?.id) {
        result = await base44.entities[entityName].update(content.id, payload);
        await base44.functions.invoke('autoSaveContentVersion', {
          contentType,
          contentId: content.id,
          changeSummary: 'Manual save',
        });
      } else {
        result = await base44.entities[entityName].create(payload);
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms', contentType] });
      queryClient.invalidateQueries({ queryKey: ['content-versions'] });
      onClose();
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" onClick={onClose}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to list
        </Button>
        <div className="flex gap-2">
          {!content?.id && (
            <ApplyTemplateDialog
              contentType={contentType}
              onApply={(templateData) => setFormData({ ...templateData, id: undefined })}
            />
          )}
          {content?.id && (
            <>
              <SaveAsTemplateDialog
                content={formData}
                contentType={contentType}
              />
              <VersionHistory 
                contentType={contentType}
                contentId={content.id}
                onRestore={() => {
                  queryClient.invalidateQueries({ queryKey: ['cms', contentType] });
                  onClose();
                }}
              />
            </>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {content?.id ? 'Edit' : 'Create'} {contentType}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                value={formData.slug || ''}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="url-friendly-slug"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div>
              <Label>Content *</Label>
              <ReactQuill
                value={formData.content || ''}
                onChange={(value) => setFormData({ ...formData, content: value })}
                className="bg-white"
              />
            </div>

            {contentType === 'product' && (
              <>
                <div>
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price || ''}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="sku">SKU</Label>
                  <Input
                    id="sku"
                    value={formData.sku || ''}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  />
                </div>
              </>
            )}

            <div className="flex items-center space-x-2">
              <Switch
                id="published"
                checked={formData.is_published || false}
                onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
              />
              <Label htmlFor="published">Published</Label>
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={saveMutation.isPending}>
                <Save className="h-4 w-4 mr-2" />
                {saveMutation.isPending ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}