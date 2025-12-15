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
  const [currentPath, setCurrentPath] = useState('');
  const [newFolderName, setNewFolderName] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const queryClient = useQueryClient();

  const { data: websiteFolders = [], isLoading: foldersLoading } = useQuery({
    queryKey: ['website-folders'],
    queryFn: () => base44.entities.WebsiteFolder.list(),
  });

  const { data: assets = [], isLoading: assetsLoading } = useQuery({
    queryKey: ['website-assets', selectedFolder?.id, currentPath],
    queryFn: () => {
      if (!selectedFolder) return Promise.resolve([]);
      return base44.entities.WebsiteAsset.filter({ website_folder_id: selectedFolder.id });
    },
    enabled: !!selectedFolder,
  });

  const filteredAssets = assets.filter(asset => {
    if (asset.file_name === '.folder') return false;
    if (!currentPath) {
      return !asset.file_path.includes('/') || asset.file_path.split('/').length === 1;
    }
    const isInCurrentPath = asset.file_path.startsWith(currentPath + '/');
    const relativePath = asset.file_path.slice(currentPath.length + 1);
    const isDirectChild = relativePath.split('/').length === 1;
    return isInCurrentPath && isDirectChild;
  });

  const createFolderMutation = useMutation({
    mutationFn: async (folderName) => {
      const folderPath = currentPath ? `${currentPath}/${folderName}` : folderName;
      return base44.entities.WebsiteAsset.create({
        website_folder_id: selectedFolder.id,
        file_name: '.folder',
        file_path: folderPath + '/.folder',
        file_url: '',
        file_type: 'other',
        file_size: 0,
        mime_type: 'application/x-folder',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['website-assets'] });
      setNewFolderName('');
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

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    createFolderMutation.mutate(newFolderName);
  };

  const handleFileUpload = async (files) => {
    if (!files || files.length === 0 || !selectedFolder) return;

    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      const totalFiles = files.length;
      for (let i = 0; i < totalFiles; i++) {
        const file = files[i];
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        
        const extension = file.name.split('.').pop()?.toLowerCase();
        const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'];
        const fileType = imageExtensions.includes(extension) ? 'image' : 'other';

        const filePath = currentPath ? `${currentPath}/${file.name}` : file.name;

        await base44.entities.WebsiteAsset.create({
          website_folder_id: selectedFolder.id,
          file_name: file.name,
          file_path: filePath,
          file_url,
          file_type: fileType,
          file_size: file.size,
          mime_type: file.type,
        });

        setUploadProgress(Math.round(((i + 1) / totalFiles) * 100));
      }
      
      queryClient.invalidateQueries({ queryKey: ['website-assets'] });
      toast.success(`${totalFiles} file(s) uploaded`);
    } catch (error) {
      toast.error('Upload failed: ' + error.message);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleFileUpload(files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleZipUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !selectedFolder) return;

    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      setUploadProgress(50);

      const response = await base44.functions.invoke('unpackZip', {
        zipFileUrl: file_url,
        websiteFolderId: selectedFolder.id,
        currentPath: currentPath,
      });
      
      setUploadProgress(100);
      queryClient.invalidateQueries({ queryKey: ['website-assets'] });
      toast.success(`Unpacked ${response.data.uploaded_count || 'multiple'} files from zip`);
    } catch (error) {
      toast.error('Zip upload failed: ' + error.message);
    } finally {
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const subfolders = Array.from(new Set(
    assets
      .map(a => {
        const relativePath = currentPath 
          ? (a.file_path.startsWith(currentPath + '/') ? a.file_path.slice(currentPath.length + 1) : '')
          : a.file_path;
        if (!relativePath) return null;
        const parts = relativePath.split('/');
        return parts.length > 1 ? parts[0] : null;
      })
      .filter(Boolean)
  ));

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
              New Website
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Website Folder</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              const name = e.target.name.value;
              const slug = e.target.slug.value;
              base44.entities.WebsiteFolder.create({ name, slug, is_active: true })
                .then(() => {
                  queryClient.invalidateQueries({ queryKey: ['website-folders'] });
                  toast.success('Website folder created');
                  e.target.reset();
                });
            }} className="space-y-4">
              <div>
                <Label>Website Name</Label>
                <Input
                  name="name"
                  placeholder="e.g., Radiant Website"
                  required
                />
              </div>
              <div>
                <Label>Slug</Label>
                <Input
                  name="slug"
                  placeholder="e.g., radiant"
                  required
                />
              </div>
              <Button type="submit">Create Website</Button>
            </form>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle>Select Website</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedFolder?.id} onValueChange={(id) => {
            const folder = websiteFolders.find(f => f.id === id);
            setSelectedFolder(folder);
            setCurrentPath('');
          }}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a website folder..." />
            </SelectTrigger>
            <SelectContent>
              {websiteFolders.map((folder) => (
                <SelectItem key={folder.id} value={folder.id}>
                  {folder.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedFolder && (
        <div className="space-y-4">
          {isUploading && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Uploading files...</span>
                  <span className="text-sm text-muted-foreground">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Assets - {selectedFolder.name}</CardTitle>
                  <div className="text-sm text-muted-foreground mt-1">
                    {currentPath ? `/${currentPath}` : '/'}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <FolderPlus className="h-4 w-4 mr-2" />
                        New Folder
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create Folder</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Folder Name</Label>
                          <Input
                            value={newFolderName}
                            onChange={(e) => setNewFolderName(e.target.value)}
                            placeholder="e.g., images"
                            onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
                          />
                        </div>
                        <Button onClick={handleCreateFolder}>Create</Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Label htmlFor="file-upload" className="cursor-pointer">
                    <Button variant="outline" disabled={isUploading} asChild>
                      <span>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Files
                      </span>
                    </Button>
                  </Label>
                  <Input
                    id="file-upload"
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => handleFileUpload(Array.from(e.target.files || []))}
                  />

                  <Label htmlFor="zip-upload" className="cursor-pointer">
                    <Button variant="outline" disabled={isUploading} asChild>
                      <span>
                        <FileArchive className="h-4 w-4 mr-2" />
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
              </div>
            </CardHeader>
            <CardContent>
              {currentPath && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const parts = currentPath.split('/');
                    parts.pop();
                    setCurrentPath(parts.join('/'));
                  }}
                  className="mb-4"
                >
                  ← Back
                </Button>
              )}

              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                  isDragging ? 'border-primary bg-primary-50' : 'border-gray-300'
                }`}
              >
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Drag and drop files here, or click Upload Files above
                </p>
              </div>

              {subfolders.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium mb-3">Folders</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {subfolders.map((folder) => (
                      <button
                        key={folder}
                        onClick={() => setCurrentPath(currentPath ? `${currentPath}/${folder}` : folder)}
                        className="flex items-center gap-2 p-3 rounded-lg border hover:bg-gray-50 transition-colors text-left"
                      >
                        <FolderPlus className="h-5 w-5 text-primary-600" />
                        <span className="text-sm font-medium truncate">{folder}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {filteredAssets.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium mb-3">Files</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredAssets.map((asset) => (
                      <Card key={asset.id} className="overflow-hidden">
                        <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
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
                        <CardContent className="p-2">
                          <div className="text-xs font-medium truncate" title={asset.file_name}>
                            {asset.file_name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {(asset.file_size / 1024).toFixed(1)} KB
                          </div>
                          <div className="flex gap-1 mt-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyToClipboard(asset.file_url)}
                              className="flex-1 h-7 text-xs"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteAssetMutation.mutate(asset.id)}
                              className="h-7"
                            >
                              <Trash2 className="h-3 w-3 text-destructive" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {filteredAssets.length === 0 && subfolders.length === 0 && !assetsLoading && (
                <div className="text-center py-8 text-muted-foreground">
                  No files or folders yet. Upload files or create a folder to get started.
                </div>
              )}

              {assetsLoading && (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}