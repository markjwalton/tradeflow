import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Layers, Calendar } from "lucide-react";

export default function ProjectVersioning({ projectId }) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newVersion, setNewVersion] = useState({
    version_number: '',
    description: '',
    key_changes: []
  });

  const queryClient = useQueryClient();

  const { data: versions = [] } = useQuery({
    queryKey: ['versions', projectId],
    queryFn: () => base44.entities.ProjectVersion.filter({ project_id: projectId }),
  });

  const createVersionMutation = useMutation({
    mutationFn: (versionData) => base44.entities.ProjectVersion.create({
      ...versionData,
      project_id: projectId,
      snapshot_date: new Date().toISOString(),
      status: 'active'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['versions', projectId]);
      setShowCreateDialog(false);
      setNewVersion({ version_number: '', description: '', key_changes: [] });
    },
  });

  const handleCreateVersion = () => {
    if (newVersion.version_number && newVersion.description) {
      createVersionMutation.mutate(newVersion);
    }
  };

  const sortedVersions = [...versions].sort((a, b) => 
    new Date(b.snapshot_date) - new Date(a.snapshot_date)
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="page-section-title">Project Versions</h2>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-[var(--color-primary)] text-white">
              <Plus className="h-4 w-4 mr-2" />
              New Version
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Version</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Version number (e.g., 1.0, MVP-Iteration-2)"
                value={newVersion.version_number}
                onChange={(e) => setNewVersion({ ...newVersion, version_number: e.target.value })}
              />
              <Textarea
                placeholder="Version description and summary of changes"
                value={newVersion.description}
                onChange={(e) => setNewVersion({ ...newVersion, description: e.target.value })}
                rows={4}
              />
              <Button onClick={handleCreateVersion} className="w-full" disabled={!newVersion.version_number || !newVersion.description}>
                Create Version
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {sortedVersions.map(version => (
          <Card key={version.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="card-heading-default flex items-center gap-3">
                  <Layers className="h-5 w-5 text-[var(--color-primary)]" />
                  Version {version.version_number}
                  <Badge className={
                    version.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }>
                    {version.status}
                  </Badge>
                </CardTitle>
                <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                  <Calendar className="h-4 w-4" />
                  {new Date(version.snapshot_date).toLocaleDateString()}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-[var(--color-text-primary)] mb-4">{version.description}</p>
              {version.key_changes && version.key_changes.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-[var(--color-text-secondary)] mb-2">Key Changes:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {version.key_changes.map((change, idx) => (
                      <li key={idx} className="text-sm text-[var(--color-text-primary)]">{change}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {sortedVersions.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Layers className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-[var(--color-text-secondary)]">No versions yet. Create your first version to track project evolution.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}