import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTenant } from "@/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  Search, Download, Upload, RefreshCw, Package, Star, Clock, ArrowUp,
  Globe, Users, Loader2, Eye, Plus
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

export default function CommunityLibrary() {
  const tenantContext = useTenant();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [activeTab, setActiveTab] = useState("available");
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);

  const isGlobalAdmin = tenantContext?.isGlobalAdmin;
  const tenantId = tenantContext?.tenantId;

  // Fetch community items
  const { data: communityItems = [], isLoading: loadingCommunity } = useQuery({
    queryKey: ["communityLibrary"],
    queryFn: () => base44.entities.CommunityLibraryItem.filter({ is_published: true }),
  });

  // Fetch tenant's installed items
  const { data: tenantItems = [], isLoading: loadingTenant } = useQuery({
    queryKey: ["tenantLibrary", tenantId],
    queryFn: () => base44.entities.TenantLibraryItem.filter({ tenant_id: tenantId }),
    enabled: !!tenantId,
  });

  // Import item to tenant
  const importMutation = useMutation({
    mutationFn: async (communityItem) => {
      const existing = tenantItems.find(t => t.community_item_id === communityItem.id);
      if (existing) {
        throw new Error("Item already installed");
      }
      return base44.entities.TenantLibraryItem.create({
        tenant_id: tenantId,
        community_item_id: communityItem.id,
        name: communityItem.name,
        description: communityItem.description,
        item_type: communityItem.item_type,
        installed_version: communityItem.version,
        latest_available_version: communityItem.version,
        has_update_available: false,
        is_custom: false,
        is_tenant_created: false,
        local_data: communityItem.current_data,
        original_community_data: communityItem.current_data,
        status: "synced",
        last_synced: new Date().toISOString(),
        category: communityItem.category,
        tags: communityItem.tags
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenantLibrary", tenantId] });
      toast.success("Item imported successfully");
    },
    onError: (err) => toast.error(err.message)
  });

  // Update item to latest version
  const updateMutation = useMutation({
    mutationFn: async (tenantItem) => {
      const communityItem = communityItems.find(c => c.id === tenantItem.community_item_id);
      if (!communityItem) throw new Error("Community item not found");
      
      return base44.entities.TenantLibraryItem.update(tenantItem.id, {
        installed_version: communityItem.version,
        latest_available_version: communityItem.version,
        has_update_available: false,
        local_data: communityItem.current_data,
        original_community_data: communityItem.current_data,
        status: "synced",
        last_synced: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenantLibrary", tenantId] });
      toast.success("Item updated to latest version");
    }
  });

  // Filter items
  const filteredCommunity = communityItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || item.item_type === filterType;
    return matchesSearch && matchesType;
  });

  // Get items with updates available
  const itemsWithUpdates = tenantItems.filter(item => item.has_update_available);
  
  // Get installed item IDs for quick lookup
  const installedIds = new Set(tenantItems.map(t => t.community_item_id));

  // New items (not installed yet)
  const newItems = filteredCommunity.filter(item => !installedIds.has(item.id));

  const renderItemCard = (item, isInstalled = false, tenantItem = null) => {
    const Icon = itemTypeIcons[item.item_type] || Package;
    const hasUpdate = tenantItem?.has_update_available;
    
    return (
      <Card key={item.id} className={`hover:shadow-md transition-shadow ${hasUpdate ? "border-amber-300" : ""}`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${item.is_global ? "bg-info-50" : "bg-accent-100"}`}>
                <Icon className={`h-5 w-5 ${item.is_global ? "text-info" : "text-accent-700"}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium truncate">{item.name}</h3>
                  <Badge variant="outline" className="text-xs">v{item.version}</Badge>
                  {item.is_global ? (
                    <Globe className="h-3 w-3 text-info" title="Global" />
                  ) : (
                    <Users className="h-3 w-3 text-accent-700" title="Community" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground truncate">{item.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className="text-xs bg-muted text-muted-foreground">
                    {itemTypeLabels[item.item_type]}
                  </Badge>
                  {item.category && (
                    <Badge variant="outline" className="text-xs">{item.category}</Badge>
                  )}
                  {hasUpdate && (
                    <Badge className="bg-warning/10 text-warning-foreground text-xs gap-1">
                      <ArrowUp className="h-3 w-3" />
                      Update Available (v{tenantItem.latest_available_version})
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => { setSelectedItem(item); setShowDetailDialog(true); }}
              >
                <Eye className="h-4 w-4" />
              </Button>
              {isInstalled ? (
                hasUpdate && (
                  <Button 
                    size="sm" 
                    onClick={() => updateMutation.mutate(tenantItem)}
                    disabled={updateMutation.isPending}
                  >
                    <RefreshCw className={`h-4 w-4 mr-1 ${updateMutation.isPending ? "animate-spin" : ""}`} />
                    Update
                  </Button>
                )
              ) : (
                <Button 
                  size="sm" 
                  onClick={() => importMutation.mutate(item)}
                  disabled={importMutation.isPending}
                >
                  <Download className={`h-4 w-4 mr-1 ${importMutation.isPending ? "animate-spin" : ""}`} />
                  Import
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loadingCommunity || loadingTenant) {
    return (
      <div className="flex justify-center items-center h-64 bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-charcoal-700" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto bg-background min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-light flex items-center gap-2 text-midnight-900 font-heading">
            <Package className="h-6 w-6" />
            Community Library
          </h1>
          <p className="text-charcoal-700">Browse and import shared templates</p>
        </div>
        {itemsWithUpdates.length > 0 && (
          <Badge className="bg-warning/10 text-warning-foreground text-sm py-1 px-3">
            <ArrowUp className="h-4 w-4 mr-1" />
            {itemsWithUpdates.length} Updates Available
          </Badge>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search library..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {Object.entries(itemTypeLabels).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="available" className="gap-2">
            <Plus className="h-4 w-4" />
            New Items ({newItems.length})
          </TabsTrigger>
          <TabsTrigger value="updates" className="gap-2">
            <ArrowUp className="h-4 w-4" />
            Updates ({itemsWithUpdates.length})
          </TabsTrigger>
          <TabsTrigger value="installed" className="gap-2">
            <CheckSquare className="h-4 w-4" />
            Installed ({tenantItems.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="mt-4">
          {newItems.length === 0 ? (
            <div className="text-center py-12 text-charcoal-700">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>No new items available</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {newItems.map(item => renderItemCard(item, false))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="updates" className="mt-4">
          {itemsWithUpdates.length === 0 ? (
            <div className="text-center py-12 text-charcoal-700">
              <RefreshCw className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>All items are up to date</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {itemsWithUpdates.map(tenantItem => {
                const communityItem = communityItems.find(c => c.id === tenantItem.community_item_id);
                if (!communityItem) return null;
                return renderItemCard(communityItem, true, tenantItem);
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="installed" className="mt-4">
          {tenantItems.length === 0 ? (
            <div className="text-center py-12 text-charcoal-700">
              <Download className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>No items installed yet</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {tenantItems
                .filter(item => {
                  const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
                  const matchesType = filterType === "all" || item.item_type === filterType;
                  return matchesSearch && matchesType;
                })
                .map(tenantItem => {
                  const communityItem = communityItems.find(c => c.id === tenantItem.community_item_id);
                  return (
                    <Card key={tenantItem.id} className={tenantItem.has_update_available ? "border-amber-300" : ""}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${tenantItem.is_custom ? "bg-accent-100" : "bg-info-50"}`}>
                              {React.createElement(itemTypeIcons[tenantItem.item_type] || Package, {
                                className: `h-5 w-5 ${tenantItem.is_custom ? "text-accent-700" : "text-info"}`
                              })}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-medium">{tenantItem.name}</h3>
                                <Badge variant="outline" className="text-xs">v{tenantItem.installed_version}</Badge>
                                {tenantItem.is_custom && (
                                  <Badge className="bg-accent-100 text-accent-700 text-xs">Custom</Badge>
                                )}
                                {tenantItem.status === "synced" && (
                                  <Badge className="bg-success-50 text-success-foreground text-xs">Synced</Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">{tenantItem.description}</p>
                              {tenantItem.has_update_available && (
                                <Badge className="bg-warning/10 text-warning-foreground text-xs mt-2 gap-1">
                                  <ArrowUp className="h-3 w-3" />
                                  v{tenantItem.latest_available_version} available
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {tenantItem.has_update_available && (
                              <Button 
                                size="sm" 
                                onClick={() => updateMutation.mutate(tenantItem)}
                                disabled={updateMutation.isPending}
                              >
                                <RefreshCw className="h-4 w-4 mr-1" />
                                Update
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedItem && React.createElement(itemTypeIcons[selectedItem.item_type] || Package, { className: "h-5 w-5" })}
              {selectedItem?.name}
              <Badge variant="outline">v{selectedItem?.version}</Badge>
            </DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              <p className="text-muted-foreground">{selectedItem.description}</p>
              <div className="flex gap-2 flex-wrap">
                <Badge>{itemTypeLabels[selectedItem.item_type]}</Badge>
                {selectedItem.category && <Badge variant="outline">{selectedItem.category}</Badge>}
                {selectedItem.tags?.map(tag => (
                  <Badge key={tag} variant="secondary">{tag}</Badge>
                ))}
              </div>
              {selectedItem.version_history?.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Version History</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {selectedItem.version_history.map((v, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm p-2 bg-muted rounded">
                        <Badge variant="outline">v{v.version}</Badge>
                        <span className="text-muted-foreground">{new Date(v.published_date).toLocaleDateString()}</span>
                        <span className="flex-1">{v.change_notes}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowDetailDialog(false)}>Close</Button>
                {!installedIds.has(selectedItem.id) && (
                  <Button onClick={() => { importMutation.mutate(selectedItem); setShowDetailDialog(false); }}>
                    <Download className="h-4 w-4 mr-2" />
                    Import
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}