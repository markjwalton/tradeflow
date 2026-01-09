import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { UnderlinedTabs, UnderlinedTabsContent } from "@/components/ui/underlined-tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Layers, Target, FolderOpen, FileText, MessageSquare, Lightbulb, Plus, CheckSquare } from "lucide-react";
import { PageHeader } from "@/components/sturij/PageHeader";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import DashboardOverview from "@/components/project-mvp/DashboardOverview";
import ProjectVersioning from "@/components/project-mvp/ProjectVersioning";
import SprintManager from "@/components/project-mvp/SprintManager";
import TaskManager from "@/components/project-mvp/TaskManager";
import AssetLibrary from "@/components/project-mvp/AssetLibrary";
import TechnicalSpecsEditor from "@/components/project-mvp/TechnicalSpecsEditor";
import DiscussionFeed from "@/components/project-mvp/DiscussionFeed";
import LearningsLog from "@/components/project-mvp/LearningsLog";

export default function MasterProjectManagementMVP() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [masterProject, setMasterProject] = useState(null);
  const [newVersionDialogOpen, setNewVersionDialogOpen] = useState(false);
  const [newVersion, setNewVersion] = useState({
    version_number: "",
    description: "",
    key_changes: ""
  });

  const queryClient = useQueryClient();

  const createVersionMutation = useMutation({
    mutationFn: (versionData) => base44.entities.ProjectVersion.create({
      project_id: masterProject.id,
      ...versionData,
      snapshot_date: new Date().toISOString()
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectVersions', masterProject.id] });
      setNewVersionDialogOpen(false);
      setNewVersion({ version_number: "", description: "", key_changes: "" });
      setActiveTab("versions");
    }
  });

  const handleVersionSubmit = (e) => {
    e.preventDefault();
    const changes = newVersion.key_changes
      .split('\n')
      .filter(line => line.trim())
      .map(line => line.trim());
    
    createVersionMutation.mutate({
      ...newVersion,
      key_changes: changes
    });
  };

  // Fetch or create the master project
  useEffect(() => {
    const initializeMasterProject = async () => {
      try {
        const projects = await base44.entities.Project.filter({ 
          name: "Master Project Management MVP" 
        });
        
        if (projects.length > 0) {
          setMasterProject(projects[0]);
        } else {
          // Create the master project
          const newProject = await base44.entities.Project.create({
            name: "Master Project Management MVP",
            description: "Single source of truth for project evolution, insights, and technical specifications",
            status: "active",
            isHighPriority: true
          });
          setMasterProject(newProject);
        }
      } catch (error) {
        console.error("Failed to initialize master project:", error);
      }
    };

    initializeMasterProject();
  }, []);

  if (!masterProject) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[var(--color-primary)] border-r-transparent mb-4"></div>
          <p className="text-[var(--color-text-secondary)]">Initializing Master Project...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Master Project Management MVP"
        description="Single source of truth for project evolution, insights, and technical specifications"
      >
        <Button onClick={() => setNewVersionDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Version
        </Button>
      </PageHeader>

      <Dialog open={newVersionDialogOpen} onOpenChange={setNewVersionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Version</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleVersionSubmit} className="space-y-4">
            <div>
              <Label>Version Number</Label>
              <Input
                value={newVersion.version_number}
                onChange={(e) => setNewVersion({ ...newVersion, version_number: e.target.value })}
                placeholder="e.g., 1.0, MVP-Iteration-2"
                required
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={newVersion.description}
                onChange={(e) => setNewVersion({ ...newVersion, description: e.target.value })}
                placeholder="Summary of changes/focus for this version"
                required
              />
            </div>
            <div>
              <Label>Key Changes (one per line)</Label>
              <Textarea
                value={newVersion.key_changes}
                onChange={(e) => setNewVersion({ ...newVersion, key_changes: e.target.value })}
                placeholder="- First change&#10;- Second change&#10;- Third change"
                rows={6}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setNewVersionDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Version</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <UnderlinedTabs 
        defaultValue={activeTab}
        value={activeTab}
        onValueChange={setActiveTab}
        tabs={[
          { value: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { value: 'versions', label: 'Versions', icon: Layers },
          { value: 'sprints', label: 'Sprints', icon: Target },
          { value: 'tasks', label: 'Tasks', icon: CheckSquare },
          { value: 'assets', label: 'Assets', icon: FolderOpen },
          { value: 'specs', label: 'Specs', icon: FileText },
          { value: 'discussions', label: 'Discussions', icon: MessageSquare },
          { value: 'learnings', label: 'Learnings', icon: Lightbulb }
        ]}
      >
        <UnderlinedTabsContent value="dashboard">
          <DashboardOverview projectId={masterProject.id} />
        </UnderlinedTabsContent>

        <UnderlinedTabsContent value="versions">
          <ProjectVersioning 
            projectId={masterProject.id}
            onNewVersionClick={() => setNewVersionDialogOpen(true)}
          />
        </UnderlinedTabsContent>

        <UnderlinedTabsContent value="sprints">
          <SprintManager projectId={masterProject.id} />
        </UnderlinedTabsContent>

        <UnderlinedTabsContent value="tasks">
          <TaskManager projectId={masterProject.id} />
        </UnderlinedTabsContent>

        <UnderlinedTabsContent value="assets">
          <AssetLibrary projectId={masterProject.id} />
        </UnderlinedTabsContent>

        <UnderlinedTabsContent value="specs">
          <TechnicalSpecsEditor projectId={masterProject.id} />
        </UnderlinedTabsContent>

        <UnderlinedTabsContent value="discussions">
          <DiscussionFeed projectId={masterProject.id} />
        </UnderlinedTabsContent>

        <UnderlinedTabsContent value="learnings">
          <LearningsLog projectId={masterProject.id} />
        </UnderlinedTabsContent>
      </UnderlinedTabs>
    </div>
  );
}