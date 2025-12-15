import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { History, RotateCcw, Eye, Calendar, User } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export function VersionHistory({ contentType, contentId, onRestore }) {
  const [showDialog, setShowDialog] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [compareMode, setCompareMode] = useState(false);
  const [compareVersions, setCompareVersions] = useState([]);
  const queryClient = useQueryClient();

  const { data: versions = [], isLoading } = useQuery({
    queryKey: ['content-versions', contentType, contentId],
    queryFn: () => base44.entities.ContentVersion.filter({ 
      content_type: contentType, 
      content_id: contentId 
    }),
    enabled: !!contentId,
  });

  const rollbackMutation = useMutation({
    mutationFn: async (versionId) => {
      const version = versions.find(v => v.id === versionId);
      if (!version) throw new Error('Version not found');
      
      const snapshot = JSON.parse(version.content_snapshot);
      const entityMap = {
        page: 'CMSPage',
        blog: 'CMSBlogPost',
        product: 'CMSProduct',
        section: 'CMSSection',
      };
      
      return base44.entities[entityMap[contentType]].update(contentId, snapshot);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms', contentType] });
      toast.success('Content restored to selected version');
      setShowDialog(false);
      if (onRestore) onRestore();
    },
  });

  const publishVersionMutation = useMutation({
    mutationFn: (versionId) => base44.entities.ContentVersion.update(versionId, { published: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-versions'] });
      toast.success('Version published');
    },
  });

  const sortedVersions = [...versions].sort((a, b) => b.version_number - a.version_number);

  const handleCompareToggle = (versionId) => {
    if (compareVersions.includes(versionId)) {
      setCompareVersions(compareVersions.filter(id => id !== versionId));
    } else if (compareVersions.length < 2) {
      setCompareVersions([...compareVersions, versionId]);
    }
  };

  return (
    <>
      <Button variant="outline" onClick={() => setShowDialog(true)}>
        <History className="h-4 w-4 mr-2" />
        Version History ({versions.length})
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>Version History</DialogTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setCompareMode(!compareMode);
                  setCompareVersions([]);
                }}
              >
                {compareMode ? 'Exit Compare' : 'Compare Versions'}
              </Button>
            </div>
          </DialogHeader>

          {compareMode && compareVersions.length === 2 && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <VersionComparison 
                  versions={versions}
                  versionIds={compareVersions}
                />
              </CardContent>
            </Card>
          )}

          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-3">
              {sortedVersions.map((version) => (
                <Card 
                  key={version.id}
                  className={`transition-colors ${
                    compareVersions.includes(version.id) ? 'bg-blue-50 border-blue-300' : ''
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={version.published ? 'default' : 'secondary'}>
                            Version {version.version_number}
                          </Badge>
                          {version.published && (
                            <Badge variant="success">Published</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {version.change_summary}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(version.created_date), 'MMM d, yyyy HH:mm')}
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {version.created_by}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {compareMode && (
                          <Button
                            size="sm"
                            variant={compareVersions.includes(version.id) ? 'default' : 'outline'}
                            onClick={() => handleCompareToggle(version.id)}
                            disabled={compareVersions.length >= 2 && !compareVersions.includes(version.id)}
                          >
                            {compareVersions.includes(version.id) ? 'Selected' : 'Select'}
                          </Button>
                        )}
                        {!compareMode && (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setSelectedVersion(version)}
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                            {!version.published && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => publishVersionMutation.mutate(version.id)}
                              >
                                Publish
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                if (confirm('Restore this version? Current content will be overwritten.')) {
                                  rollbackMutation.mutate(version.id);
                                }
                              }}
                            >
                              <RotateCcw className="h-3 w-3 mr-1" />
                              Restore
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {selectedVersion && (
        <Dialog open={!!selectedVersion} onOpenChange={() => setSelectedVersion(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Version {selectedVersion.version_number} Preview</DialogTitle>
            </DialogHeader>
            <ScrollArea className="h-[500px]">
              <div className="prose prose-sm">
                <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto">
                  {JSON.stringify(JSON.parse(selectedVersion.content_snapshot), null, 2)}
                </pre>
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

function VersionComparison({ versions, versionIds }) {
  const [version1, version2] = versionIds.map(id => 
    versions.find(v => v.id === id)
  );

  if (!version1 || !version2) return null;

  const snapshot1 = JSON.parse(version1.content_snapshot);
  const snapshot2 = JSON.parse(version2.content_snapshot);

  const changedFields = [];
  const allKeys = new Set([...Object.keys(snapshot1), ...Object.keys(snapshot2)]);

  allKeys.forEach(key => {
    if (JSON.stringify(snapshot1[key]) !== JSON.stringify(snapshot2[key])) {
      changedFields.push({
        field: key,
        before: snapshot1[key],
        after: snapshot2[key],
      });
    }
  });

  return (
    <div>
      <h3 className="font-medium mb-4">
        Comparing Version {version1.version_number} vs Version {version2.version_number}
      </h3>
      {changedFields.length === 0 ? (
        <p className="text-sm text-muted-foreground">No differences found</p>
      ) : (
        <div className="space-y-3">
          {changedFields.map(({ field, before, after }) => (
            <div key={field} className="border-l-4 border-blue-500 pl-3">
              <div className="text-sm font-medium mb-1">{field}</div>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <div className="text-muted-foreground mb-1">Version {version1.version_number}</div>
                  <div className="bg-red-50 p-2 rounded">
                    {typeof before === 'object' ? JSON.stringify(before, null, 2) : String(before || '(empty)')}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground mb-1">Version {version2.version_number}</div>
                  <div className="bg-green-50 p-2 rounded">
                    {typeof after === 'object' ? JSON.stringify(after, null, 2) : String(after || '(empty)')}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}