import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Upload, File, Image, FileText, Code, Video, Search } from "lucide-react";

export default function AssetLibrary({ projectId }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [uploading, setUploading] = useState(false);

  const queryClient = useQueryClient();

  const { data: assets = [] } = useQuery({
    queryKey: ['assets', projectId],
    queryFn: () => base44.entities.Asset.filter({ project_id: projectId }),
  });

  const createAssetMutation = useMutation({
    mutationFn: (assetData) => base44.entities.Asset.create(assetData),
    onSuccess: () => {
      queryClient.invalidateQueries(['assets', projectId]);
    },
  });

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      const assetType = file.type.startsWith('image/') ? 'image' 
        : file.type.startsWith('video/') ? 'video'
        : file.type.includes('pdf') ? 'document'
        : 'other';

      await createAssetMutation.mutateAsync({
        project_id: projectId,
        name: file.name,
        file_url,
        type: assetType,
        file_size: file.size,
        description: ''
      });
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const getAssetIcon = (type) => {
    const icons = {
      image: Image,
      document: FileText,
      code_snippet: Code,
      video: Video,
      other: File
    };
    const IconComponent = icons[type] || File;
    return <IconComponent className="h-6 w-6" />;
  };

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || asset.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search assets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm"
          >
            <option value="all">All Types</option>
            <option value="image">Images</option>
            <option value="document">Documents</option>
            <option value="code_snippet">Code</option>
            <option value="video">Videos</option>
          </select>
          <Button className="bg-[var(--color-primary)] text-white" disabled={uploading}>
            <label className="flex items-center gap-2 cursor-pointer">
              <Upload className="h-4 w-4" />
              {uploading ? 'Uploading...' : 'Upload'}
              <input 
                type="file" 
                className="hidden" 
                onChange={handleFileUpload}
                disabled={uploading}
              />
            </label>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAssets.map(asset => (
          <Card key={asset.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-[var(--color-muted)] rounded-lg">
                  {getAssetIcon(asset.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="card-heading-default truncate mb-1">
                    {asset.name}
                  </h3>
                  {asset.description && (
                    <p className="text-xs text-[var(--color-text-secondary)] line-clamp-2 mb-2">
                      {asset.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">{asset.type}</Badge>
                    {asset.file_size && (
                      <span className="text-xs text-[var(--color-text-muted)]">
                        {(asset.file_size / 1024).toFixed(1)} KB
                      </span>
                    )}
                  </div>
                  {asset.file_url && (
                    <a 
                      href={asset.file_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-[var(--color-primary)] hover:underline mt-2 block"
                    >
                      View Asset
                    </a>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAssets.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Upload className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-[var(--color-text-secondary)]">
              {searchTerm || filterType !== 'all' 
                ? 'No assets match your filters' 
                : 'No assets yet. Upload your first asset to get started.'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}