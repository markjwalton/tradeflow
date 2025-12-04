import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Upload, Folder, FolderPlus, Image, FileText, Video, Music,
  Trash2, Copy, Search, Grid, List, Loader2, X
} from "lucide-react";
import { toast } from "sonner";

export default function CMSAssetManager({ tenantId }) {
  const queryClient = useQueryClient();
  const [currentFolder, setCurrentFolder] = useState("/");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [isUploading, setIsUploading] = useState(false);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [selectedAsset, setSelectedAsset] = useState(null);

  const { data: assets = [], isLoading } = useQuery({
    queryKey: ["cmsAssets", tenantId],
    queryFn: () => base44.entities.CMSAsset.filter(tenantId ? { tenant_id: tenantId } : {}, "-created_date")
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.CMSAsset.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cmsAssets"] });
      toast.success("Asset uploaded");
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.CMSAsset.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cmsAssets"] });
      toast.success("Asset updated");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.CMSAsset.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cmsAssets"] });
      toast.success("Asset deleted");
      setSelectedAsset(null);
    }
  });

  // Get unique folders
  const folders = [...new Set(assets.map(a => a.folder || "/"))].sort();
  const subFolders = folders.filter(f => {
    if (currentFolder === "/") {
      return f !== "/" && !f.substring(1).includes("/");
    }
    return f.startsWith(currentFolder + "/") && 
           f.substring(currentFolder.length + 1).split("/").length === 1;
  });

  // Filter assets
  const filteredAssets = assets.filter(asset => {
    const inFolder = asset.folder === currentFolder || (!asset.folder && currentFolder === "/");
    const matchesSearch = !searchQuery || 
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return inFolder && matchesSearch;
  });

  const handleUpload = async (e) => {
    const files = e.target.files;
    if (!files?.length) return;

    setIsUploading(true);
    for (const file of files) {
      try {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        
        const fileType = file.type.startsWith("image/") ? "image" :
                        file.type.startsWith("video/") ? "video" :
                        file.type.startsWith("audio/") ? "audio" :
                        file.type.includes("pdf") || file.type.includes("document") ? "document" : "other";

        await createMutation.mutateAsync({
          tenant_id: tenantId,
          name: file.name,
          file_url,
          file_type: fileType,
          mime_type: file.type,
          size_bytes: file.size,
          folder: currentFolder
        });
      } catch (error) {
        toast.error(`Failed to upload ${file.name}`);
      }
    }
    setIsUploading(false);
  };

  const createFolder = () => {
    if (!newFolderName.trim()) return;
    const folderPath = currentFolder === "/" 
      ? `/${newFolderName}` 
      : `${currentFolder}/${newFolderName}`;
    // Create a placeholder asset to establish the folder
    createMutation.mutate({
      tenant_id: tenantId,
      name: ".folder",
      file_url: "",
      file_type: "other",
      folder: folderPath
    });
    setShowNewFolder(false);
    setNewFolderName("");
  };

  const copyUrl = (url) => {
    navigator.clipboard.writeText(url);
    toast.success("URL copied");
  };

  const getFileIcon = (type) => {
    switch (type) {
      case "image": return Image;
      case "video": return Video;
      case "audio": return Music;
      default: return FileText;
    }
  };

  const formatSize = (bytes) => {
    if (!bytes) return "";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const breadcrumbs = currentFolder.split("/").filter(Boolean);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Image className="h-5 w-5" />
          Asset Library
        </CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowNewFolder(true)}>
            <FolderPlus className="h-4 w-4 mr-2" />
            New Folder
          </Button>
          <Button className="relative" disabled={isUploading}>
            {isUploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
            Upload
            <input
              type="file"
              multiple
              accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={handleUpload}
            />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Toolbar */}
        <div className="flex items-center gap-4 mb-4">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-1 text-sm">
            <button 
              className="text-[var(--color-primary)] hover:underline"
              onClick={() => setCurrentFolder("/")}
            >
              Root
            </button>
            {breadcrumbs.map((crumb, i) => (
              <React.Fragment key={i}>
                <span className="text-[var(--color-charcoal)]">/</span>
                <button
                  className="text-[var(--color-primary)] hover:underline"
                  onClick={() => setCurrentFolder("/" + breadcrumbs.slice(0, i + 1).join("/"))}
                >
                  {crumb}
                </button>
              </React.Fragment>
            ))}
          </div>
          <div className="flex-1" />
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex border rounded-lg">
            <Button 
              variant={viewMode === "grid" ? "secondary" : "ghost"} 
              size="icon"
              onClick={() => setViewMode("grid")}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button 
              variant={viewMode === "list" ? "secondary" : "ghost"} 
              size="icon"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[var(--color-charcoal)]" />
          </div>
        ) : (
          <>
            {/* Subfolders */}
            {subFolders.length > 0 && (
              <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                  {subFolders.map(folder => (
                    <button
                      key={folder}
                      className="flex items-center gap-2 px-3 py-2 bg-[var(--color-secondary)]/10 rounded-lg hover:bg-[var(--color-secondary)]/20"
                      onClick={() => setCurrentFolder(folder)}
                    >
                      <Folder className="h-4 w-4 text-[var(--color-secondary)]" />
                      <span className="text-sm font-medium text-[var(--color-midnight)]">{folder.split("/").pop()}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Assets Grid/List */}
            {filteredAssets.filter(a => a.name !== ".folder").length === 0 ? (
              <div className="text-center py-12 text-[var(--color-charcoal)]">
                <Image className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No assets in this folder</p>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {filteredAssets.filter(a => a.name !== ".folder").map(asset => {
                  const Icon = getFileIcon(asset.file_type);
                  return (
                    <div
                      key={asset.id}
                      className="border border-[var(--color-background-muted)] rounded-lg p-2 cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => setSelectedAsset(asset)}
                    >
                      <div className="aspect-square bg-[var(--color-background)] rounded flex items-center justify-center mb-2 overflow-hidden">
                        {asset.file_type === "image" ? (
                          <img src={asset.file_url} alt={asset.name} className="w-full h-full object-cover" />
                        ) : (
                          <Icon className="h-8 w-8 text-[var(--color-charcoal)]" />
                        )}
                      </div>
                      <p className="text-xs font-medium truncate text-[var(--color-midnight)]">{asset.name}</p>
                      <p className="text-xs text-[var(--color-charcoal)]">{formatSize(asset.size_bytes)}</p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-1">
                {filteredAssets.filter(a => a.name !== ".folder").map(asset => {
                  const Icon = getFileIcon(asset.file_type);
                  return (
                    <div
                      key={asset.id}
                      className="flex items-center gap-3 p-2 rounded hover:bg-[var(--color-background)] cursor-pointer"
                      onClick={() => setSelectedAsset(asset)}
                    >
                      <div className="w-10 h-10 bg-[var(--color-background)] rounded flex items-center justify-center overflow-hidden">
                        {asset.file_type === "image" ? (
                          <img src={asset.file_url} alt={asset.name} className="w-full h-full object-cover" />
                        ) : (
                          <Icon className="h-5 w-5 text-[var(--color-charcoal)]" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm text-[var(--color-midnight)]">{asset.name}</p>
                        <p className="text-xs text-[var(--color-charcoal)]">{formatSize(asset.size_bytes)}</p>
                      </div>
                      <Badge variant="outline">{asset.file_type}</Badge>
                      <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); copyUrl(asset.file_url); }}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </CardContent>

      {/* New Folder Dialog */}
      <Dialog open={showNewFolder} onOpenChange={setShowNewFolder}>
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
                placeholder="My Folder"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowNewFolder(false)}>Cancel</Button>
              <Button onClick={createFolder} className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white">Create</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Asset Detail Dialog */}
      <Dialog open={!!selectedAsset} onOpenChange={(o) => !o && setSelectedAsset(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Asset Details</DialogTitle>
          </DialogHeader>
          {selectedAsset && (
            <div className="space-y-4">
              {selectedAsset.file_type === "image" && (
                <div className="aspect-video bg-[var(--color-background)] rounded-lg overflow-hidden">
                  <img src={selectedAsset.file_url} alt={selectedAsset.name} className="w-full h-full object-contain" />
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Name</Label>
                  <Input
                    value={selectedAsset.name}
                    onChange={(e) => setSelectedAsset({ ...selectedAsset, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Alt Text</Label>
                  <Input
                    value={selectedAsset.alt_text || ""}
                    onChange={(e) => setSelectedAsset({ ...selectedAsset, alt_text: e.target.value })}
                    placeholder="Image description..."
                  />
                </div>
              </div>
              <div>
                <Label>URL</Label>
                <div className="flex gap-2">
                  <Input value={selectedAsset.file_url} readOnly className="font-mono text-xs" />
                  <Button variant="outline" onClick={() => copyUrl(selectedAsset.file_url)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex justify-between">
                <Button 
                  variant="ghost" 
                  className="text-[var(--color-destructive)]"
                  onClick={() => {
                    if (confirm("Delete this asset?")) {
                      deleteMutation.mutate(selectedAsset.id);
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
                <Button onClick={() => {
                  updateMutation.mutate({ id: selectedAsset.id, data: selectedAsset });
                  setSelectedAsset(null);
                }} className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white">
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}