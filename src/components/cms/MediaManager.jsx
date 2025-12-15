import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Upload, Search, Trash2, Image as ImageIcon } from 'lucide-react';

export function MediaManager() {
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  const { data: media = [], isLoading } = useQuery({
    queryKey: ['media'],
    queryFn: () => base44.entities.MediaLibrary.list(),
  });

  const uploadMutation = useMutation({
    mutationFn: async (file) => {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      return base44.entities.MediaLibrary.create({
        file_name: file.name,
        file_url,
        file_type: file.type.startsWith('image/') ? 'image' : 'other',
        mime_type: file.type,
        file_size: file.size,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.MediaLibrary.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
    },
  });

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadMutation.mutate(file);
    }
  };

  const filteredMedia = media.filter((item) =>
    item.file_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search media..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button asChild>
          <label className="cursor-pointer">
            <Upload className="h-4 w-4 mr-2" />
            Upload Media
            <input
              type="file"
              className="hidden"
              onChange={handleFileUpload}
              accept="image/*,video/*,audio/*"
            />
          </label>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-6">
        {filteredMedia.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            <div className="aspect-square bg-muted relative group">
              {item.file_type === 'image' ? (
                <img
                  src={item.file_url}
                  alt={item.file_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    if (confirm('Delete this media?')) {
                      deleteMutation.mutate(item.id);
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="p-2">
              <p className="text-xs truncate">{item.file_name}</p>
            </div>
          </Card>
        ))}
      </div>

      {filteredMedia.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No media found</p>
        </div>
      )}
    </div>
  );
}