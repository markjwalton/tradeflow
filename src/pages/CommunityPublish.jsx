import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTenant } from "@/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Database, Layout, Zap, FileText, CheckSquare, Workflow, Building2,
  Upload, Globe, RefreshCw, Package, ArrowUp, Loader2, Send, Eye
} from "lucide-react";
import { toast } from "sonner";

const itemTypeIcons = {
  entity: Database,
  page: Layout,
  feature: Zap,
  form: FileText,
  checklist: CheckSquare,
  workflow: Workflow,
  business_template: Building2
};

const itemTypeLabels = {
  entity: "Entity",
  page: "Page",
  feature: "Feature",
  form: "Form",
  checklist: "Checklist",
  workflow: "Workflow",
  business_template: "Business Template"
};

// Map item types to their source entities
const sourceEntityMap = {
  entity: "EntityTemplate",
  page: "PageTemplate",
  feature: "FeatureTemplate",
  form: "FormTemplate",
  checklist: "ChecklistTemplate",
  workflow: "Workflow",
  business_template: "BusinessTemplate"
};

export default function CommunityPublish() {
  const tenantContext = useTenant();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("entity");
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [publishForm, setPublishForm] = useState({
    change_notes: "",
    is_update: false
  });

  const isGlobalAdmin = tenantContext?.isGlobalAdmin;

  // Fetch all source templates
  const { data: entityTemplates = [] } = useQuery({
    queryKey: ["entityTemplates"],
    queryFn: () => base44.entities.EntityTemplate.list(),
  });

  const { data: pageTemplates = [] } = useQuery({
    queryKey: ["pageTemplates"],
    queryFn: () => base44.entities.PageTemplate.list(),
  });

  const { data: featureTemplates = [] } = useQuery({
    queryKey: ["featureTemplates"],
    queryFn: () => base44.entities.FeatureTemplate.list(),
  });

  const { data: formTemplates = [] } = useQuery({
    queryKey: ["formTemplates"],
    queryFn: () => base44.entities.FormTemplate.list(),
  });

  const { data: checklistTemplates = [] } = useQuery({
    queryKey: ["checklistTemplates"],
    queryFn: () => base44.entities.ChecklistTemplate.list(),
  });

  const { data: workflows = [] } = useQuery({
    queryKey: ["workflows"],
    queryFn: () => base44.entities.Workflow.list(),
  });

  const { data: businessTemplates = [] } = useQuery({
    queryKey: ["businessTemplates"],
    queryFn: () => base44.entities.BusinessTemplate.list(),
  });

  // Fetch existing community items
  const { data: communityItems = [] } = useQuery({
    queryKey: ["communityLibrary"],
    queryFn: () => base44.entities.CommunityLibraryItem.list(),
  });

  // Publish mutation
  const publishMutation = useMutation({
    mutationFn: async ({ item, itemType, changeNotes, isUpdate }) => {
      const existingCommunity = communityItems.find(
        c => c.source_id === item.id && c.item_type === itemType
      );

      if (existingCommunity && isUpdate) {
        // Update existing community item
        const newVersion = existingCommunity.version + 1;
        const versionHistory = existingCommunity.version_history || [];
        versionHistory.push({
          version: newVersion,
          published_date: new Date().toISOString(),
          change_notes: changeNotes,
          data_snapshot: item
        });

        await base44.entities.CommunityLibraryItem.update(existingCommunity.id, {
          version: newVersion,
          current_data: item,
          version_history: versionHistory,
          published_date: new Date().toISOString()
        });

        // Update all tenant items that have this installed
        const tenantItems = await base44.entities.TenantLibraryItem.filter({
          community_item_id: existingCommunity.id
        });

        for (const tenantItem of tenantItems) {
          await base44.entities.TenantLibraryItem.update(tenantItem.id, {
            latest_available_version: newVersion,
            has_update_available: true,
            status: tenantItem.is_custom ? "custom" : "update_available"
          });
        }

        return { action: "updated", version: newVersion };
      } else {
        // Create new community item
        await base44.entities.CommunityLibraryItem.create({
          name: item.name,
          description: item.description,
          item_type: itemType,
          source_id: item.id,
          version: 1,
          version_history: [{
            version: 1,
            published_date: new Date().toISOString(),
            change_notes: changeNotes || "Initial release",
            data_snapshot: item
          }],
          current_data: item,
          category: item.category || item.group,
          tags: item.tags || [],
          is_published: true,
          published_date: new Date().toISOString(),
          source_tenant_id: null,
          is_global: true
        });

        return { action: "published", version: 1 };
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["communityLibrary"] });
      toast.success(result.action === "updated" 
        ? `Updated to version ${result.version}` 
        : "Published to community library"
      );
      setShowPublishDialog(false);
      setSelectedItem(null);
      setPublishForm({ change_notes: "", is_update: false });
    },
    onError: (err) => toast.error(err.message)
  });

  const getTemplatesForType = (type) => {
    switch (type) {
      case "entity": return entityTemplates;
      case "page": return pageTemplates;
      case "feature": return featureTemplates;
      case "form": return formTemplates;
      case "checklist": return checklistTemplates;
      case "workflow": return workflows;
      case "business_template": return businessTemplates;
      default: return [];
    }
  };

  const isPublished = (item, itemType) => {
    return communityItems.some(c => c.source_id === item.id && c.item_type === itemType);
  };

  const getPublishedVersion = (item, itemType) => {
    const community = communityItems.find(c => c.source_id === item.id && c.item_type === itemType);
    return community?.version || 0;
  };

  const handlePublishClick = (item, itemType) => {
    const existing = communityItems.find(c => c.source_id === item.id && c.item_type === itemType);
    setSelectedItem({ item, itemType });
    setPublishForm({
      change_notes: "",
      is_update: !!existing
    });
    setShowPublishDialog(true);
  };

  const renderItemList = (items, itemType) => {
    const Icon = itemTypeIcons[itemType];
    
    return (
      <div className="grid gap-3">
        {items.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No {itemTypeLabels[itemType].toLowerCase()}s found
          </div>
        ) : (
          items.map(item => {
            const published = isPublished(item, itemType);
            const version = getPublishedVersion(item, itemType);
            
            return (
              <Card key={item.id} className={published ? "border-green-200" : ""}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${published ? "bg-green-100" : "bg-gray-100"}`}>
                        <Icon className={`h-5 w-5 ${published ? "text-green-600" : "text-gray-600"}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{item.name}</h3>
                          {published && (
                            <Badge className="bg-green-100 text-green-700 text-xs">
                              <Globe className="h-3 w-3 mr-1" />
                              v{version}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">{item.description}</p>
                      </div>
                    </div>
                    <Button 
                      size="sm"
                      variant={published ? "outline" : "default"}
                      onClick={() => handlePublishClick(item, itemType)}
                    >
                      {published ? (
                        <>
                          <ArrowUp className="h-4 w-4 mr-1" />
                          Publish Update
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-1" />
                          Publish
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    );
  };

  if (!isGlobalAdmin) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Only global admins can publish to the community library.</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Upload className="h-6 w-6" />
          Publish to Community
        </h1>
        <p className="text-gray-500">Share templates with all tenants</p>
      </div>

      <Card className="mb-6 bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Globe className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <strong>Publishing workflow:</strong>
              <ul className="mt-1 list-disc list-inside space-y-1">
                <li>New items are automatically available to all tenants</li>
                <li>Updates notify tenants but don't auto-apply</li>
                <li>Tenants can choose when to update</li>
                <li>Custom modifications won't be overwritten</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex-wrap">
          {Object.entries(itemTypeLabels).map(([key, label]) => {
            const Icon = itemTypeIcons[key];
            const count = getTemplatesForType(key).length;
            const publishedCount = communityItems.filter(c => c.item_type === key).length;
            return (
              <TabsTrigger key={key} value={key} className="gap-2">
                <Icon className="h-4 w-4" />
                {label}
                <Badge variant="secondary" className="text-xs">{publishedCount}/{count}</Badge>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {Object.keys(itemTypeLabels).map(key => (
          <TabsContent key={key} value={key} className="mt-4">
            {renderItemList(getTemplatesForType(key), key)}
          </TabsContent>
        ))}
      </Tabs>

      {/* Publish Dialog */}
      <Dialog open={showPublishDialog} onOpenChange={setShowPublishDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {publishForm.is_update ? "Publish Update" : "Publish to Community"}
            </DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  {React.createElement(itemTypeIcons[selectedItem.itemType], { className: "h-5 w-5" })}
                  <span className="font-medium">{selectedItem.item.name}</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">{selectedItem.item.description}</p>
              </div>

              <div>
                <Label>{publishForm.is_update ? "Change Notes *" : "Release Notes"}</Label>
                <Textarea
                  value={publishForm.change_notes}
                  onChange={(e) => setPublishForm({ ...publishForm, change_notes: e.target.value })}
                  placeholder={publishForm.is_update ? "What changed in this version?" : "Initial release notes..."}
                  rows={3}
                />
              </div>

              {publishForm.is_update && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                  <strong>Note:</strong> All tenants with this item installed will be notified of the update. 
                  They can choose to update or keep their current version.
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowPublishDialog(false)}>Cancel</Button>
                <Button 
                  onClick={() => publishMutation.mutate({
                    item: selectedItem.item,
                    itemType: selectedItem.itemType,
                    changeNotes: publishForm.change_notes,
                    isUpdate: publishForm.is_update
                  })}
                  disabled={publishMutation.isPending || (publishForm.is_update && !publishForm.change_notes.trim())}
                >
                  {publishMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  {publishForm.is_update ? "Publish Update" : "Publish"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}