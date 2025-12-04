import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Folder, Database, Layout, Zap, Loader2, Check } from "lucide-react";
import { toast } from "sonner";

export default function AddGroupToProjectDialog({
  open,
  onOpenChange,
  groupName,
  entities = [],
  pages = [],
  features = [],
  projects = [],
  allEntities = [],
  allPages = [],
  allFeatures = [],
}) {
  const queryClient = useQueryClient();
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [isAdding, setIsAdding] = useState(false);

  const handleAddGroup = async () => {
    if (!selectedProjectId) return;
    
    setIsAdding(true);
    const projectName = projects.find(p => p.id === selectedProjectId)?.name;
    
    // Get existing items in project to avoid duplicates
    const existingEntities = allEntities.filter(e => e.custom_project_id === selectedProjectId).map(e => e.name);
    const existingPages = allPages.filter(p => p.custom_project_id === selectedProjectId).map(p => p.name);
    const existingFeatures = allFeatures.filter(f => f.custom_project_id === selectedProjectId).map(f => f.name);
    
    let addedCount = 0;
    let skippedCount = 0;
    
    try {
      // Add entities
      for (const entity of entities) {
        if (!existingEntities.includes(entity.name)) {
          const copy = { ...entity, custom_project_id: selectedProjectId, is_custom: true, category: "Custom" };
          delete copy.id;
          delete copy.created_date;
          delete copy.updated_date;
          await base44.entities.EntityTemplate.create(copy);
          addedCount++;
        } else {
          skippedCount++;
        }
      }
      
      // Add pages
      for (const page of pages) {
        if (!existingPages.includes(page.name)) {
          const copy = { ...page, custom_project_id: selectedProjectId, is_custom: true, category: "Custom" };
          delete copy.id;
          delete copy.created_date;
          delete copy.updated_date;
          await base44.entities.PageTemplate.create(copy);
          addedCount++;
        } else {
          skippedCount++;
        }
      }
      
      // Add features
      for (const feature of features) {
        if (!existingFeatures.includes(feature.name)) {
          const copy = { ...feature, custom_project_id: selectedProjectId, is_custom: true, category: "Custom" };
          delete copy.id;
          delete copy.created_date;
          delete copy.updated_date;
          await base44.entities.FeatureTemplate.create(copy);
          addedCount++;
        } else {
          skippedCount++;
        }
      }
      
      queryClient.invalidateQueries({ queryKey: ["entityTemplates"] });
      queryClient.invalidateQueries({ queryKey: ["pageTemplates"] });
      queryClient.invalidateQueries({ queryKey: ["featureTemplates"] });
      
      if (addedCount > 0 && skippedCount > 0) {
        toast.success(`Added ${addedCount} items to ${projectName} (${skippedCount} already existed)`);
      } else if (addedCount > 0) {
        toast.success(`Added ${addedCount} items to ${projectName}`);
      } else {
        toast.info(`All items already exist in ${projectName}`);
      }
      
      onOpenChange(false);
      setSelectedProjectId(null);
    } catch (error) {
      toast.error("Failed to add group");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) setSelectedProjectId(null); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Folder className="h-5 w-5 text-[var(--color-primary)]" />
            Add "{groupName}" Group to Project
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Summary of what will be added */}
          <div className="bg-[var(--color-background)] rounded-lg p-3 space-y-2">
            <p className="text-sm font-medium text-[var(--color-midnight)]">This will add:</p>
            <div className="flex flex-wrap gap-2">
              {entities.length > 0 && (
                <Badge variant="outline" className="gap-1">
                  <Database className="h-3 w-3 text-[var(--color-accent-dark)]" />
                  {entities.length} entities
                </Badge>
              )}
              {pages.length > 0 && (
                <Badge variant="outline" className="gap-1">
                  <Layout className="h-3 w-3 text-[var(--color-info)]" />
                  {pages.length} pages
                </Badge>
              )}
              {features.length > 0 && (
                <Badge variant="outline" className="gap-1">
                  <Zap className="h-3 w-3 text-[var(--color-secondary)]" />
                  {features.length} features
                </Badge>
              )}
            </div>
          </div>

          {/* Project Selection */}
          {!selectedProjectId ? (
            <>
              <p className="text-sm text-[var(--color-charcoal)]">Select a project:</p>
              <div className="space-y-2 max-h-48 overflow-auto">
                {projects.map((project) => (
                  <Button
                    key={project.id}
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setSelectedProjectId(project.id)}
                  >
                    <Folder className="h-4 w-4 mr-2" />
                    {project.name}
                  </Button>
                ))}
                {projects.length === 0 && (
                  <p className="text-sm text-[var(--color-charcoal)] italic">No custom projects. Create one first.</p>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 text-sm text-[var(--color-charcoal)] bg-[var(--color-primary)]/10 p-2 rounded">
                <Check className="h-4 w-4 text-[var(--color-primary)]" />
                Adding to: <strong className="text-[var(--color-midnight)]">{projects.find(p => p.id === selectedProjectId)?.name}</strong>
                <Button variant="ghost" size="sm" className="ml-auto h-6 text-xs" onClick={() => setSelectedProjectId(null)}>
                  Change
                </Button>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => { onOpenChange(false); setSelectedProjectId(null); }}>
                  Cancel
                </Button>
                <Button className="flex-1 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white" onClick={handleAddGroup} disabled={isAdding}>
                  {isAdding && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Add Group
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}