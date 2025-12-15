import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit, Trash2, Eye, Calendar, Clock, Copy, CheckSquare } from 'lucide-react';
import { format } from 'date-fns';
import { ScheduleDialog } from './ScheduleDialog';
import { BulkActionsBar } from './BulkActionsBar';
import { Checkbox } from '@/components/ui/checkbox';

const entityMap = {
  page: 'CMSPage',
  blog: 'CMSBlogPost',
  product: 'CMSProduct',
  section: 'CMSSection',
};

export function ContentList({ contentType, websiteFolderId, onEdit, onCreate }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const queryClient = useQueryClient();

  const entityName = entityMap[contentType];

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['cms', contentType, websiteFolderId],
    queryFn: () => websiteFolderId 
      ? base44.entities[entityName].filter({ website_folder_id: websiteFolderId })
      : base44.entities[entityName].list(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities[entityName].delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms', contentType] });
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: async (item) => {
      const { id, created_date, updated_date, created_by, ...rest } = item;
      return base44.entities[entityName].create({
        ...rest,
        title: rest.title ? `${rest.title} (Copy)` : undefined,
        name: rest.name ? `${rest.name} (Copy)` : undefined,
        slug: rest.slug ? `${rest.slug}-copy` : undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms', contentType] });
    },
  });

  const bulkUpdateMutation = useMutation({
    mutationFn: async ({ ids, data }) => {
      await Promise.all(
        ids.map((id) => base44.entities[entityName].update(id, data))
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms', contentType] });
      setSelectedIds([]);
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids) => {
      await Promise.all(
        ids.map((id) => base44.entities[entityName].delete(id))
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms', contentType] });
      setSelectedIds([]);
    },
  });

  const filteredItems = items.filter((item) =>
    item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={`Search ${contentType}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          {selectedIds.length > 0 && (
            <Button variant="outline" onClick={() => setSelectedIds([])}>
              Clear ({selectedIds.length})
            </Button>
          )}
          <Button onClick={onCreate}>
            <Plus className="h-4 w-4 mr-2" />
            New {contentType}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredItems.map((item) => (
          <Card key={item.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={selectedIds.includes(item.id)}
                  onCheckedChange={(checked) => {
                    setSelectedIds(
                      checked
                        ? [...selectedIds, item.id]
                        : selectedIds.filter((id) => id !== item.id)
                    );
                  }}
                  className="mt-1"
                />
                <div className="flex-1 flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">
                    {item.title || item.name}
                  </CardTitle>
                  {item.slug && (
                    <CardDescription className="mt-1">
                      /{item.slug}
                    </CardDescription>
                  )}
                </div>
                <Badge variant={item.is_published ? 'default' : 'secondary'}>
                  {item.is_published ? 'Published' : 'Draft'}
                </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {item.description && (
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {item.description}
                </p>
              )}
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                <Calendar className="h-3 w-3" />
                Updated {format(new Date(item.updated_date), 'MMM d, yyyy')}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(item)}
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => duplicateMutation.mutate(item)}
                >
                  <Copy className="h-3 w-3" />
                </Button>
                <ScheduleDialog 
                  contentType={contentType}
                  contentId={item.id}
                  triggerButton={
                    <Button variant="ghost" size="sm">
                      <Clock className="h-3 w-3" />
                    </Button>
                  }
                />
                {item.preview_url && (
                  <Button variant="ghost" size="sm" asChild>
                    <a href={item.preview_url} target="_blank" rel="noopener noreferrer">
                      <Eye className="h-3 w-3 mr-1" />
                      Preview
                    </a>
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (confirm('Delete this item?')) {
                      deleteMutation.mutate(item.id);
                    }
                  }}
                >
                  <Trash2 className="h-3 w-3 text-destructive" />
                </Button>
              </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No {contentType} found. Create your first one!
            </p>
            </div>
            )}

            <BulkActionsBar
            selectedCount={selectedIds.length}
            onPublish={() => bulkUpdateMutation.mutate({ ids: selectedIds, data: { is_published: true } })}
            onArchive={() => bulkUpdateMutation.mutate({ ids: selectedIds, data: { is_published: false } })}
            onDelete={() => {
            if (confirm(`Delete ${selectedIds.length} items?`)) {
              bulkDeleteMutation.mutate(selectedIds);
            }
            }}
            onClear={() => setSelectedIds([])}
            />
            </div>
            );
            }