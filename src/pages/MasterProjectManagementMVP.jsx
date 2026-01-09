import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { UnderlinedTabs, UnderlinedTabsContent } from "@/components/ui/underlined-tabs";
import { LayoutDashboard, Layers, Target, FolderOpen, FileText, MessageSquare, Lightbulb } from "lucide-react";
import { PageHeader } from "@/components/sturij/PageHeader";

import DashboardOverview from "@/components/project-mvp/DashboardOverview";
import ProjectVersioning from "@/components/project-mvp/ProjectVersioning";
import SprintManager from "@/components/project-mvp/SprintManager";
import AssetLibrary from "@/components/project-mvp/AssetLibrary";
import TechnicalSpecsEditor from "@/components/project-mvp/TechnicalSpecsEditor";
import DiscussionFeed from "@/components/project-mvp/DiscussionFeed";
import LearningsLog from "@/components/project-mvp/LearningsLog";

export default function MasterProjectManagementMVP() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [masterProject, setMasterProject] = useState(null);

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
      />

      <UnderlinedTabs 
        defaultValue={activeTab}
        value={activeTab}
        onValueChange={setActiveTab}
        tabs={[
          { value: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { value: 'versions', label: 'Versions', icon: Layers },
          { value: 'sprints', label: 'Sprints', icon: Target },
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
          <ProjectVersioning projectId={masterProject.id} />
        </UnderlinedTabsContent>

        <UnderlinedTabsContent value="sprints">
          <SprintManager projectId={masterProject.id} />
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