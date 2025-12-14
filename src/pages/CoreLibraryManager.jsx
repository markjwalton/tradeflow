import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Database,
  Layout,
  Zap,
  Package,
  Plus,
  Pencil,
  Copy,
  Download,
  Upload,
  Trash2,
  ArrowRight
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/sturij";

export default function CoreLibraryManager() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("components");
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});

  // Fetch core library items (tenant_id = '__global__')
  const { data: components = [] } = useQuery({
    queryKey: ["coreComponents"],
    queryFn: () => base44.entities.ComponentLibrary.filter({ tenant_id: "__global__" })
  });

  const { data: entityTemplates = [] } = useQuery({
    queryKey: ["coreEntityTemplates"],
    queryFn: () => base44.entities.EntityTemplate.filter({ tenant_id: "__global__" })
  });

  const { data: pageTemplates = [] } = useQuery({
    queryKey: ["corePageTemplates"],
    queryFn: () => base44.entities.PageTemplate.filter({ tenant_id: "__global__" })
  });

  const { data: featureTemplates = [] } = useQuery({
    queryKey: ["coreFeatureTemplates"],
    queryFn: () => base44.entities.FeatureTemplate.filter({ tenant_id: "__global__" })
  });

  const { data: tenants = [] } = useQuery({
    queryKey: ["tenants"],
    queryFn: () => base44.entities.Tenant.list()
  });

  // Mutations
  const saveComponentMutation = useMutation({
    mutationFn: (data) => {
      if (editingItem) {
        return base44.entities.ComponentLibrary.update(editingItem.id, data);
      }
      return base44.entities.ComponentLibrary.create({ ...data, tenant_id: "__global__" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["coreComponents"]);
      closeSheet();
      toast.success("Component saved");
    }
  });

  const saveEntityMutation = useMutation({
    mutationFn: (data) => {
      if (editingItem) {
        return base44.entities.EntityTemplate.update(editingItem.id, data);
      }
      return base44.entities.EntityTemplate.create({ ...data, tenant_id: "__global__" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["coreEntityTemplates"]);
      closeSheet();
      toast.success("Entity template saved");
    }
  });

  const savePageMutation = useMutation({
    mutationFn: (data) => {
      if (editingItem) {
        return base44.entities.PageTemplate.update(editingItem.id, data);
      }
      return base44.entities.PageTemplate.create({ ...data, tenant_id: "__global__" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["corePageTemplates"]);
      closeSheet();
      toast.success("Page template saved");
    }
  });

  const saveFeatureMutation = useMutation({
    mutationFn: (data) => {
      if (editingItem) {
        return base44.entities.FeatureTemplate.update(editingItem.id, data);
      }
      return base44.entities.FeatureTemplate.create({ ...data, tenant_id: "__global__" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["coreFeatureTemplates"]);
      closeSheet();
      toast.success("Feature template saved");
    }
  });

  const deleteItemMutation = useMutation({
    mutationFn: ({ entity, id }) => {
      const entityMap = {
        component: base44.entities.ComponentLibrary,
        entity: base44.entities.EntityTemplate,
        page: base44.entities.PageTemplate,
        feature: base44.entities.FeatureTemplate
      };
      return entityMap[entity].delete(id);
    },
    onSuccess: (_, { entity }) => {
      const queryMap = {
        component: "coreComponents",
        entity: "coreEntityTemplates",
        page: "corePageTemplates",
        feature: "coreFeatureTemplates"
      };
      queryClient.invalidateQueries([queryMap[entity]]);
      toast.success("Deleted");
    }
  });

  const distributeToTenantMutation = useMutation({
    mutationFn: async ({ item, itemType, tenantId }) => {
      const data = { ...item, tenant_id: tenantId };
      delete data.id;
      delete data.created_date;
      delete data.updated_date;
      delete data.created_by;

      const entityMap = {
        component: base44.entities.ComponentLibrary,
        entity: base44.entities.EntityTemplate,
        page: base44.entities.PageTemplate,
        feature: base44.entities.FeatureTemplate
      };
      
      return entityMap[itemType].create(data);
    },
    onSuccess: () => {
      toast.success("Distributed to tenant");
    }
  });

  const openSheet = (type, item = null) => {
    setEditingItem(item);
    if (item) {
      setFormData(item);
    } else {
      setFormData({});
    }
  };

  const closeSheet = () => {
    setEditingItem(null);
    setFormData({});
  };

  const handleSave = () => {
    const mutationMap = {
      components: saveComponentMutation,
      entities: saveEntityMutation,
      pages: savePageMutation,
      features: saveFeatureMutation
    };
    mutationMap[activeTab].mutate(formData);
  };

  const handleDistribute = (item, itemType, tenantId) => {
    distributeToTenantMutation.mutate({ item, itemType, tenantId });
  };

  const renderLibraryItems = (items, itemType) => {
    return items.length === 0 ? (
      <Card className="rounded-xl">
        <CardContent className="py-12 text-center">
          <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground mb-4">No items in core library</p>
          <Button onClick={() => openSheet(itemType)}>
            <Plus className="mr-2 h-4 w-4" />
            Add {itemType === "component" ? "Component" : itemType === "entity" ? "Entity" : itemType === "page" ? "Page" : "Feature"}
          </Button>
        </CardContent>
      </Card>
    ) : (
      <div className="space-y-4">
        {items.map((item) => (
          <Card key={item.id} className="rounded-xl">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">
                    {item.component_name || item.template_name || item.feature_name}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <Badge>{item.category || item.page_type}</Badge>
                    {item.version && <Badge variant="outline">v{item.version}</Badge>}
                    {item.usage_count > 0 && (
                      <Badge variant="outline">{item.usage_count} uses</Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={() => openSheet(itemType, item)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteItemMutation.mutate({ entity: itemType, id: item.id })}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Select onValueChange={(tenantId) => handleDistribute(item, itemType, tenantId)}>
                    <SelectTrigger className="w-[140px] h-9">
                      <SelectValue placeholder="Distribute" />
                    </SelectTrigger>
                    <SelectContent>
                      {tenants.map((tenant) => (
                        <SelectItem key={tenant.id} value={tenant.id}>
                          {tenant.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto -mt-6">
      <PageHeader 
        title="Core Library Manager"
        description="Manage and distribute reusable components, entities, pages, and features"
      >
        <Button onClick={() => openSheet(activeTab.slice(0, -1))}>
          <Plus className="mr-2 h-4 w-4" />
          Add New
        </Button>
      </PageHeader>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          <TabsTrigger value="components">
            <Package className="h-4 w-4 mr-2" />
            Components ({components.length})
          </TabsTrigger>
          <TabsTrigger value="entities">
            <Database className="h-4 w-4 mr-2" />
            Entities ({entityTemplates.length})
          </TabsTrigger>
          <TabsTrigger value="pages">
            <Layout className="h-4 w-4 mr-2" />
            Pages ({pageTemplates.length})
          </TabsTrigger>
          <TabsTrigger value="features">
            <Zap className="h-4 w-4 mr-2" />
            Features ({featureTemplates.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="components">
          {renderLibraryItems(components, "component")}
        </TabsContent>

        <TabsContent value="entities">
          {renderLibraryItems(entityTemplates, "entity")}
        </TabsContent>

        <TabsContent value="pages">
          {renderLibraryItems(pageTemplates, "page")}
        </TabsContent>

        <TabsContent value="features">
          {renderLibraryItems(featureTemplates, "feature")}
        </TabsContent>
      </Tabs>

      <Sheet open={!!editingItem || Object.keys(formData).length > 0} onOpenChange={(open) => !open && closeSheet()}>
        <SheetContent className="w-[600px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {editingItem ? "Edit" : "Add"} {activeTab === "components" ? "Component" : activeTab === "entities" ? "Entity" : activeTab === "pages" ? "Page" : "Feature"}
            </SheetTitle>
          </SheetHeader>
          <div className="space-y-4 mt-6">
            <div>
              <Label>Name *</Label>
              <Input
                value={formData.component_name || formData.template_name || formData.feature_name || ""}
                onChange={(e) => setFormData({
                  ...formData,
                  [activeTab === "components" ? "component_name" : activeTab === "features" ? "feature_name" : "template_name"]: e.target.value
                })}
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div>
              <Label>Category *</Label>
              <Input
                value={formData.category || formData.page_type || ""}
                onChange={(e) => setFormData({
                  ...formData,
                  [activeTab === "pages" ? "page_type" : "category"]: e.target.value
                })}
              />
            </div>
            <div>
              <Label>Version</Label>
              <Input
                value={formData.version || ""}
                onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                placeholder="1.0.0"
              />
            </div>
          </div>
          <SheetFooter className="mt-6">
            <Button variant="outline" onClick={closeSheet}>Cancel</Button>
            <Button onClick={handleSave}>Save</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}