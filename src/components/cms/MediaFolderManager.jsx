import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Folder, FolderPlus, Edit2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export function MediaFolderManager({ currentFolder, onFolderChange, folders = [] }) {
  const [newFolderName, setNewFolderName] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const createFolderMutation = useMutation({
    mutationFn: async (folderName) => {
      const folderPath = currentFolder ? `${currentFolder}/${folderName}` : folderName;
      await base44.entities.MediaLibrary.create({
        file_name: folderName,
        file_type: 'folder',
        folder: folderPath,
        file_url: '',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
      toast.success('Folder created');
      setNewFolderName('');
      setDialogOpen(false);
    },
  });

  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="flex items-center gap-1 text-sm text-muted-foreground">
        <Folder className="h-4 w-4" />
        <button
          onClick={() => onFolderChange(null)}
          className="hover:text-foreground"
        >
          Media
        </button>
        {currentFolder && (
          <>
            {currentFolder.split('/').map((part, idx, arr) => (
              <React.Fragment key={idx}>
                <span>/</span>
                <button
                  onClick={() => onFolderChange(arr.slice(0, idx + 1).join('/'))}
                  className="hover:text-foreground"
                >
                  {part}
                </button>
              </React.Fragment>
            ))}
          </>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button size="sm" variant="outline">
            <FolderPlus className="h-4 w-4 mr-2" />
            New Folder
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Folder</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Folder name..."
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newFolderName.trim()) {
                  createFolderMutation.mutate(newFolderName.trim());
                }
              }}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => createFolderMutation.mutate(newFolderName.trim())}
                disabled={!newFolderName.trim() || createFolderMutation.isPending}
              >
                Create
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}