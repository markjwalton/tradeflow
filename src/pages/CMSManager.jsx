import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, ShoppingBag, BookOpen, FormInput, Key, 
  Plus, Eye, Pencil, Trash2, Copy, Loader2, Inbox,
  Navigation, Image, Layout
} from "lucide-react";
import { toast } from "sonner";
import { useTenant } from "@/Layout";
import CMSPageEditor from "@/components/cms/CMSPageEditor";
import CMSProductEditor from "@/components/cms/CMSProductEditor";
import CMSBlogEditor from "@/components/cms/CMSBlogEditor";
import CMSFormEditor from "@/components/cms/CMSFormEditor";
import CMSApiKeyManager from "@/components/cms/CMSApiKeyManager";
import CMSSubmissions from "@/components/cms/CMSSubmissions";
import CMSNavigationEditor from "@/components/cms/CMSNavigationEditor";
import CMSAssetManager from "@/components/cms/CMSAssetManager";
import CMSTemplateManager from "@/components/cms/CMSTemplateManager";
import CMSTenantSelector from "@/components/cms/CMSTenantSelector";

export default function CMSManager() {
  const { tenantId: contextTenantId, isGlobalAdmin } = useTenant() || {};
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("pages");
  const [editingItem, setEditingItem] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [selectedTenantId, setSelectedTenantId] = useState(contextTenantId || "");
  
  // Use selected tenant for global admins, context tenant otherwise
  const tenantId = isGlobalAdmin ? (selectedTenantId === "__all__" ? null : selectedTenantId) : contextTenantId;

  const { data: pages = [], isLoading: loadingPages } = useQuery({
    queryKey: ["cmsPages", tenantId],
    queryFn: () => base44.entities.CMSPage.filter(tenantId ? { tenant_id: tenantId } : {}),
    enabled: activeTab === "pages"
  });

  const { data: products = [], isLoading: loadingProducts } = useQuery({
    queryKey: ["cmsProducts", tenantId],
    queryFn: () => base44.entities.CMSProduct.filter(tenantId ? { tenant_id: tenantId } : {}),
    enabled: activeTab === "products"
  });

  const { data: posts = [], isLoading: loadingPosts } = useQuery({
    queryKey: ["cmsPosts", tenantId],
    queryFn: () => base44.entities.CMSBlogPost.filter(tenantId ? { tenant_id: tenantId } : {}, "-created_date"),
    enabled: activeTab === "blog"
  });

  const { data: forms = [], isLoading: loadingForms } = useQuery({
    queryKey: ["cmsForms", tenantId],
    queryFn: () => base44.entities.CMSForm.filter(tenantId ? { tenant_id: tenantId } : {}),
    enabled: activeTab === "forms"
  });

  const deletePageMutation = useMutation({
    mutationFn: (id) => base44.entities.CMSPage.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cmsPages"] });
      toast.success("Page deleted");
    }
  });

  const deleteProductMutation = useMutation({
    mutationFn: (id) => base44.entities.CMSProduct.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cmsProducts"] });
      toast.success("Product deleted");
    }
  });

  const deletePostMutation = useMutation({
    mutationFn: (id) => base44.entities.CMSBlogPost.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cmsPosts"] });
      toast.success("Post deleted");
    }
  });

  const deleteFormMutation = useMutation({
    mutationFn: (id) => base44.entities.CMSForm.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cmsForms"] });
      toast.success("Form deleted");
    }
  });

  const openEditor = (item = null) => {
    setEditingItem(item);
    setShowEditor(true);
  };

  const closeEditor = () => {
    setEditingItem(null);
    setShowEditor(false);
  };

  const statusBadge = (status) => {
    const colors = {
      draft: "bg-muted text-muted-foreground",
      published: "bg-success-50 text-success",
      archived: "bg-destructive-50 text-destructive",
      active: "bg-success-50 text-success",
      inactive: "bg-muted text-muted-foreground"
    };
    return <Badge className={colors[status] || "bg-muted"}>{status}</Badge>;
  };

  const renderList = (items, type, isLoading, deleteMutation) => {
    if (isLoading) {
      return (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      );
    }

    if (items.length === 0) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          <p>No {type} yet</p>
          <Button className="mt-4" onClick={() => openEditor()}>
            <Plus className="h-4 w-4 mr-2" />
            Create {type.slice(0, -1)}
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {items.map(item => (
          <div key={item.id} className="flex items-center justify-between p-4 bg-card rounded-lg border border-border hover:shadow-sm transition-shadow">
            <div>
              <h3 className="font-medium text-foreground">{item.title || item.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-muted-foreground">/{item.slug}</span>
                {statusBadge(item.status)}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" onClick={() => openEditor(item)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-destructive"
                onClick={() => {
                  if (confirm("Delete this item?")) {
                    deleteMutation.mutate(item.id);
                  }
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="p-6 bg-background min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-light text-foreground font-heading">CMS</h1>
          <p className="text-muted-foreground">Manage content for external websites</p>
        </div>
        {isGlobalAdmin && (
          <CMSTenantSelector 
            value={selectedTenantId} 
            onChange={setSelectedTenantId} 
          />
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="pages" className="gap-2">
            <FileText className="h-4 w-4" />
            Pages
          </TabsTrigger>
          <TabsTrigger value="products" className="gap-2">
            <ShoppingBag className="h-4 w-4" />
            Products
          </TabsTrigger>
          <TabsTrigger value="blog" className="gap-2">
            <BookOpen className="h-4 w-4" />
            Blog
          </TabsTrigger>
          <TabsTrigger value="forms" className="gap-2">
            <FormInput className="h-4 w-4" />
            Forms
          </TabsTrigger>
          <TabsTrigger value="submissions" className="gap-2">
            <Inbox className="h-4 w-4" />
            Submissions
          </TabsTrigger>
          <TabsTrigger value="navigation" className="gap-2">
            <Navigation className="h-4 w-4" />
            Navigation
          </TabsTrigger>
          <TabsTrigger value="assets" className="gap-2">
            <Image className="h-4 w-4" />
            Assets
          </TabsTrigger>
          <TabsTrigger value="templates" className="gap-2">
            <Layout className="h-4 w-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="api" className="gap-2">
            <Key className="h-4 w-4" />
            API Keys
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pages">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Pages</CardTitle>
              <Button onClick={() => openEditor()}>
                <Plus className="h-4 w-4 mr-2" />
                New Page
              </Button>
            </CardHeader>
            <CardContent>
              {renderList(pages, "pages", loadingPages, deletePageMutation)}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Products</CardTitle>
              <Button onClick={() => openEditor()}>
                <Plus className="h-4 w-4 mr-2" />
                New Product
              </Button>
            </CardHeader>
            <CardContent>
              {renderList(products, "products", loadingProducts, deleteProductMutation)}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="blog">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Blog Posts</CardTitle>
              <Button onClick={() => openEditor()}>
                <Plus className="h-4 w-4 mr-2" />
                New Post
              </Button>
            </CardHeader>
            <CardContent>
              {renderList(posts, "posts", loadingPosts, deletePostMutation)}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forms">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Forms</CardTitle>
              <Button onClick={() => openEditor()}>
                <Plus className="h-4 w-4 mr-2" />
                New Form
              </Button>
            </CardHeader>
            <CardContent>
              {renderList(forms, "forms", loadingForms, deleteFormMutation)}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="submissions">
          <CMSSubmissions tenantId={tenantId} />
        </TabsContent>

        <TabsContent value="navigation">
          <CMSNavigationEditor tenantId={tenantId} />
        </TabsContent>

        <TabsContent value="assets">
          <CMSAssetManager tenantId={tenantId} />
        </TabsContent>

        <TabsContent value="templates">
          <CMSTemplateManager tenantId={tenantId} />
        </TabsContent>

        <TabsContent value="api">
          <CMSApiKeyManager tenantId={tenantId} />
        </TabsContent>
      </Tabs>

      {/* Editors */}
      {showEditor && activeTab === "pages" && (
        <CMSPageEditor 
          page={editingItem} 
          tenantId={tenantId}
          onClose={closeEditor} 
        />
      )}
      {showEditor && activeTab === "products" && (
        <CMSProductEditor 
          product={editingItem} 
          tenantId={tenantId}
          onClose={closeEditor} 
        />
      )}
      {showEditor && activeTab === "blog" && (
        <CMSBlogEditor 
          post={editingItem} 
          tenantId={tenantId}
          onClose={closeEditor} 
        />
      )}
      {showEditor && activeTab === "forms" && (
        <CMSFormEditor 
          form={editingItem} 
          tenantId={tenantId}
          onClose={closeEditor} 
        />
      )}
    </div>
  );
}