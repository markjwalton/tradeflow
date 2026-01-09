import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutDashboard, Layers, Target, FolderOpen, FileText, MessageSquare, Lightbulb } from "lucide-react";

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
    <div className="min-h-screen bg-[var(--color-background)] p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-[var(--text-4xl)] font-[var(--font-family-display)] font-[var(--font-weight-semibold)] text-[var(--color-text-primary)] mb-2">
            Master Project Management MVP
          </h1>
          <p className="text-[var(--text-lg)] text-[var(--color-text-secondary)]">
            Single source of truth for project evolution, insights, and technical specifications
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-7 w-full mb-6">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="versions" className="flex items-center gap-2">
              <Layers className="h-4 w-4" />
              <span className="hidden sm:inline">Versions</span>
            </TabsTrigger>
            <TabsTrigger value="sprints" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              <span className="hidden sm:inline">Sprints</span>
            </TabsTrigger>
            <TabsTrigger value="assets" className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Assets</span>
            </TabsTrigger>
            <TabsTrigger value="specs" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Specs</span>
            </TabsTrigger>
            <TabsTrigger value="discussions" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Discussions</span>
            </TabsTrigger>
            <TabsTrigger value="learnings" className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              <span className="hidden sm:inline">Learnings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <DashboardOverview projectId={masterProject.id} />
          </TabsContent>

          <TabsContent value="versions">
            <ProjectVersioning projectId={masterProject.id} />
          </TabsContent>

          <TabsContent value="sprints">
            <SprintManager projectId={masterProject.id} />
          </TabsContent>

          <TabsContent value="assets">
            <AssetLibrary projectId={masterProject.id} />
          </TabsContent>

          <TabsContent value="specs">
            <TechnicalSpecsEditor projectId={masterProject.id} />
          </TabsContent>

          <TabsContent value="discussions">
            <DiscussionFeed projectId={masterProject.id} />
          </TabsContent>

          <TabsContent value="learnings">
            <LearningsLog projectId={masterProject.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}