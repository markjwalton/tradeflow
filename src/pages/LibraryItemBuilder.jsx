import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ArrowLeft, Database, Layout, Zap } from "lucide-react";
import { toast } from "sonner";
import EntityBuilder from "@/components/library/EntityBuilder";
import PageBuilder from "@/components/library/PageBuilder";
import FeatureBuilder from "@/components/library/FeatureBuilder";
import { PageHeader } from "@/components/sturij";

export default function LibraryItemBuilder() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const defaultType = urlParams.get("type") || "entity";
  const itemId = urlParams.get("id");
  const projectId = urlParams.get("project");
  
  const [activeTab, setActiveTab] = useState(defaultType);

  const { data: entities = [] } = useQuery({
    queryKey: ["entityTemplates"],
    queryFn: () => base44.entities.EntityTemplate.list(),
  });

  const { data: pages = [] } = useQuery({
    queryKey: ["pageTemplates"],
    queryFn: () => base44.entities.PageTemplate.list(),
  });

  const { data: features = [] } = useQuery({
    queryKey: ["featureTemplates"],
    queryFn: () => base44.entities.FeatureTemplate.list(),
  });

  const { data: projects = [] } = useQuery({
    queryKey: ["customProjects"],
    queryFn: () => base44.entities.CustomProject.list(),
  });

  const currentProject = projects.find(p => p.id === projectId);
  const availableGroups = [...new Set(entities.filter(e => e.group).map(e => e.group))].sort();

  const editingItem = itemId 
    ? (activeTab === "entity" ? entities.find(e => e.id === itemId) :
       activeTab === "page" ? pages.find(p => p.id === itemId) :
       features.find(f => f.id === itemId))
    : null;

  const entityCreateMutation = useMutation({
    mutationFn: (data) => base44.entities.EntityTemplate.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entityTemplates"] });
      toast.success("Entity saved");
      navigate(createPageUrl("Library"));
    },
  });

  const entityUpdateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.EntityTemplate.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entityTemplates"] });
      toast.success("Entity updated");
      navigate(createPageUrl("Library"));
    },
  });

  const pageCreateMutation = useMutation({
    mutationFn: (data) => base44.entities.PageTemplate.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pageTemplates"] });
      toast.success("Page saved");
      navigate(createPageUrl("Library"));
    },
  });

  const pageUpdateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.PageTemplate.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pageTemplates"] });
      toast.success("Page updated");
      navigate(createPageUrl("Library"));
    },
  });

  const featureCreateMutation = useMutation({
    mutationFn: (data) => base44.entities.FeatureTemplate.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["featureTemplates"] });
      toast.success("Feature saved");
      navigate(createPageUrl("Library"));
    },
  });

  const featureUpdateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.FeatureTemplate.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["featureTemplates"] });
      toast.success("Feature updated");
      navigate(createPageUrl("Library"));
    },
  });

  const handleSave = (itemData) => {
    const dataToSave = {
      ...itemData,
      custom_project_id: projectId || null,
      is_custom: !!projectId,
      category: projectId ? "Custom" : itemData.category
    };

    if (editingItem?.id) {
      if (activeTab === "entity") {
        entityUpdateMutation.mutate({ id: editingItem.id, data: dataToSave });
      } else if (activeTab === "page") {
        pageUpdateMutation.mutate({ id: editingItem.id, data: dataToSave });
      } else {
        featureUpdateMutation.mutate({ id: editingItem.id, data: dataToSave });
      }
    } else {
      if (activeTab === "entity") {
        entityCreateMutation.mutate(dataToSave);
      } else if (activeTab === "page") {
        pageCreateMutation.mutate(dataToSave);
      } else {
        featureCreateMutation.mutate(dataToSave);
      }
    }
  };

  const isSaving = entityCreateMutation.isPending || entityUpdateMutation.isPending ||
                   pageCreateMutation.isPending || pageUpdateMutation.isPending ||
                   featureCreateMutation.isPending || featureUpdateMutation.isPending;

  return (
    <div className="max-w-5xl mx-auto -mt-6 min-h-screen">
      <PageHeader 
        title={editingItem ? `Edit ${activeTab}` : `Create ${activeTab}`}
        description={currentProject ? `Project: ${currentProject.name}` : "Template Library"}
      >
        <Button variant="ghost" onClick={() => navigate(createPageUrl("Library"))}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Library
        </Button>
      </PageHeader>

      <Card>
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="entity">
                <Database className="h-4 w-4 mr-2" />
                Entity
              </TabsTrigger>
              <TabsTrigger value="page">
                <Layout className="h-4 w-4 mr-2" />
                Page
              </TabsTrigger>
              <TabsTrigger value="feature">
                <Zap className="h-4 w-4 mr-2" />
                Feature
              </TabsTrigger>
            </TabsList>

            <TabsContent value="entity" className="mt-6">
              <EntityBuilder
                initialData={activeTab === "entity" ? editingItem : null}
                onSave={handleSave}
                onCancel={() => navigate(createPageUrl("Library"))}
                isSaving={isSaving}
                existingGroups={availableGroups}
              />
            </TabsContent>

            <TabsContent value="page" className="mt-6">
              <PageBuilder
                initialData={activeTab === "page" ? editingItem : null}
                entities={entities}
                onSave={handleSave}
                onCancel={() => navigate(createPageUrl("Library"))}
                isSaving={isSaving}
              />
            </TabsContent>

            <TabsContent value="feature" className="mt-6">
              <FeatureBuilder
                initialData={activeTab === "feature" ? editingItem : null}
                entities={entities}
                onSave={handleSave}
                onCancel={() => navigate(createPageUrl("Library"))}
                isSaving={isSaving}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}