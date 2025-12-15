import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PageHeader } from '@/components/sturij/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Upload, FolderPlus, FileImage, Trash2, Copy, Download, FileArchive, Loader2 } from 'lucide-react';

export default function AssetManager() {
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderSlug, setNewFolderSlug] = useState('');
  const [uploadingZip, setUploadingZip] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(false);

  const queryClient = useQueryClient();

  const { data: folders = [], isLoading: foldersLoading } = useQuery({
    queryKey: ['website-folders'],
    queryFn: () => base44.entities.WebsiteFolder.list(),
  });

  const { data: assets = [], isLoading: assetsLoading } = useQuery({
    queryKey: ['website-assets', selectedFolder?.id],
    queryFn: () => selectedFolder 
      ? base44.entities.WebsiteAsset.filter({ website_folder_id: selectedFolder.id })
      : Promise.resolve([]),
    enabled: !!selectedFolder,
  });

  const createFolderMutation = useMutation({
    mutationFn: (data) => base44.entities.WebsiteFolder.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['website-folders'] });
      setNewFolderName('');
      setNewFolderSlug('');
      toast.success('Folder created');
    },
  });

  const deleteAssetMutation = useMutation({
    mutationFn: (id) => base44.entities.WebsiteAsset.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['website-assets'] });
      toast.success('Asset deleted');
    },
  });

  const handleCreateFolder = (e) => {
    e.preventDefault();
    createFolderMutation.mutate({
      name: newFolderName,
      slug: newFolderSlug,
      is_active: true,
    });
  };

  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || !selectedFolder) return;

    setUploadingFiles(true);
    try {
      for (const file of files) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        
        const extension = file.name.split('.').pop()?.toLowerCase();
        const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'];
        const fileType = imageExtensions.includes(extension) ? 'image' : 'other';

        await base44.entities.WebsiteAsset.create({
          website_folder_id: selectedFolder.id,
          file_name: file.name,
          file_path: file.name,
          file_url,
          file_type: fileType,
          file_size: file.size,
          mime_type: file.type,
        });
      }
      
      queryClient.invalidateQueries({ queryKey: ['website-assets'] });
      toast.success(`${files.length} file(s) uploaded`);
    } catch (error) {
      toast.error('Upload failed: ' + error.message);
    } finally {
      setUploadingFiles(false);
    }
  };

  const handleZipUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !selectedFolder) return;

    setUploadingZip(true);
    try {
      const formData = new FormData();
      formData.append('zipFile', file);
      formData.append('websiteFolderId', selectedFolder.id);

      const response = await base44.functions.invoke('unpackZip', formData);
      
      queryClient.invalidateQueries({ queryKey: ['website-assets'] });
      toast.success(`Unpacked ${response.data.uploaded_count} files from zip`);
    } catch (error) {
      toast.error('Zip upload failed: ' + error.message);
    } finally {
      setUploadingZip(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const groupedAssets = assets.reduce((acc, asset) => {
    const folder = asset.file_path.includes('/') 
      ? asset.file_path.split('/')[0] 
      : 'root';
    if (!acc[folder]) acc[folder] = [];
    acc[folder].push(asset);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Asset Manager" 
        description="Manage website assets and upload files organized by website folders"
      >
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <FolderPlus className="h-4 w-4 mr-2" />
              New Website Folder
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Website Folder</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateFolder} className="space-y-4">
              <div>
                <Label>Folder Name</Label>
                <Input
                  value={newFolderName}
                  onChange={(e) => {
                    setNewFolderName(e.target.value);
                    setNewFolderSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'));
                  }}
                  placeholder="e.g., Radiant Website"
                  required
                />
              </div>
              <div>
                <Label>Slug</Label>
                <Input
                  value={newFolderSlug}
                  onChange={(e) => setNewFolderSlug(e.target.value)}
                  placeholder="e.g., radiant"
                  required
                />
              </div>
              <Button type="submit">Create Folder</Button>
            </form>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Website Folders</CardTitle>
          </CardHeader>
          <CardContent>
            {foldersLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : folders.length === 0 ? (
              <p className="text-sm text-muted-foreground">No folders yet. Create one to get started.</p>
            ) : (
              <div className="space-y-2">
                {folders.map((folder) => (
                  <button
                    key={folder.id}
                    onClick={() => setSelectedFolder(folder)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      selectedFolder?.id === folder.id
                        ? 'bg-primary-100 text-primary-700'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <div className="font-medium text-sm">{folder.name}</div>
                    <div className="text-xs text-muted-foreground">/{folder.slug}</div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {selectedFolder ? `Assets - ${selectedFolder.name}` : 'Select a folder'}
              </CardTitle>
              {selectedFolder && (
                <div className="flex gap-2">
                  <Label htmlFor="file-upload" className="cursor-pointer">
                    <Button variant="outline" disabled={uploadingFiles} asChild>
                      <span>
                        {uploadingFiles ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Upload className="h-4 w-4 mr-2" />
                        )}
                        Upload Files
                      </span>
                    </Button>
                  </Label>
                  <Input
                    id="file-upload"
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileUpload}
                  />

                  <Label htmlFor="zip-upload" className="cursor-pointer">
                    <Button variant="outline" disabled={uploadingZip} asChild>
                      <span>
                        {uploadingZip ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <FileArchive className="h-4 w-4 mr-2" />
                        )}
                        Upload Zip
                      </span>
                    </Button>
                  </Label>
                  <Input
                    id="zip-upload"
                    type="file"
                    accept=".zip"
                    className="hidden"
                    onChange={handleZipUpload}
                  />
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!selectedFolder ? (
              <div className="text-center py-12 text-muted-foreground">
                Select a website folder to view and manage assets
              </div>
            ) : assetsLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : assets.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No assets yet. Upload files to get started.
              </div>
            ) : (
              <Tabs defaultValue={Object.keys(groupedAssets)[0] || 'root'}>
                <TabsList>
                  {Object.keys(groupedAssets).map((folder) => (
                    <TabsTrigger key={folder} value={folder}>
                      {folder} ({groupedAssets[folder].length})
                    </TabsTrigger>
                  ))}
                </TabsList>
                {Object.entries(groupedAssets).map(([folder, folderAssets]) => (
                  <TabsContent key={folder} value={folder} className="mt-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {folderAssets.map((asset) => (
                        <Card key={asset.id} className="overflow-hidden">
                          <div className="aspect-video bg-gray-100 flex items-center justify-center overflow-hidden">
                            {asset.file_type === 'image' ? (
                              <img
                                src={asset.file_url}
                                alt={asset.file_name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <FileImage className="h-12 w-12 text-gray-400" />
                            )}
                          </div>
                          <CardContent className="p-3">
                            <div className="text-sm font-medium truncate" title={asset.file_name}>
                              {asset.file_name}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {asset.file_path}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {(asset.file_size / 1024).toFixed(1)} KB
                            </div>
                            <div className="flex gap-2 mt-3">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => copyToClipboard(asset.file_url)}
                                className="flex-1"
                              >
                                <Copy className="h-3 w-3 mr-1" />
                                Copy URL
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.open(asset.file_url, '_blank')}
                              >
                                <Download className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => deleteAssetMutation.mutate(asset.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}