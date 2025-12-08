import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Package, ArrowLeft, Save, Palette, Type, Maximize, Layers,
  GitBranch, Clock, Building2, Mail, Download, Eye, Loader2,
  CheckCircle2, AlertCircle, RefreshCw, Copy, Trash2
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import ThemeTokenEditor from "@/components/design-system/ThemeTokenEditor";

export default function PackageDetail() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const packageId = urlParams.get("id");
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(null);

  const { data: pkg, isLoading } = useQuery({
    queryKey: ["designSystemPackage", packageId],
    queryFn: async () => {
      const packages = await base44.entities.DesignSystemPackage.filter({ id: packageId });
      return packages[0] || null;
    },
    enabled: !!packageId
  });

  const { data: parentPkg } = useQuery({
    queryKey: ["parentPackage", pkg?.parent_package_id],
    queryFn: async () => {
      if (!pkg?.parent_package_id) return null;
      const packages = await base44.entities.DesignSystemPackage.filter({ id: pkg.parent_package_id });
      return packages[0] || null;
    },
    enabled: !!pkg?.parent_package_id
  });

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.DesignSystemPackage.update(packageId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["designSystemPackage", packageId] });
      toast.success("Package updated");
      setIsEditing(false);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: () => base44.entities.DesignSystemPackage.delete(packageId),
    onSuccess: () => {
      toast.success("Package deleted");
      navigate(createPageUrl("DesignSystemManager"));
    }
  });

  React.useEffect(() => {
    if (pkg && !formData) {
      setFormData({
        package_name: pkg.package_name,
        description: pkg.description,
        status: pkg.status,
        customer_name: pkg.customer_name,
        customer_email: pkg.customer_email,
        customer_company: pkg.customer_company
      });
    }
  }, [pkg]);

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  const handleTokensSave = (tokens) => {
    updateMutation.mutate({ design_tokens: tokens });
  };

  const handlePublish = () => {
    const newVersion = incrementVersion(pkg.version);
    updateMutation.mutate({
      status: "published",
      version: newVersion,
      changelog: [
        ...(pkg.changelog || []),
        {
          version: newVersion,
          date: new Date().toISOString(),
          changes: ["Published package"],
          breaking_changes: false
        }
      ]
    });
  };

  const incrementVersion = (version) => {
    const parts = version.split(".");
    parts[2] = String(parseInt(parts[2]) + 1);
    return parts.join(".");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!pkg) {
    return (
      <div className="p-6 bg-background min-h-screen">
        <Card className="max-w-md mx-auto border-border">
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-warning" />
            <h2 className="text-lg font-heading text-midnight-900">Package Not Found</h2>
            <p className="text-muted-foreground mt-2">The requested package could not be found.</p>
            <Link to={createPageUrl("DesignSystemManager")}>
              <Button className="mt-4">Back to Manager</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusColors = {
    draft: "bg-muted text-muted-foreground",
    published: "bg-success-50 text-success",
    deprecated: "bg-warning/10 text-warning"
  };

  return (
    <div className="p-6 bg-background min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link to={createPageUrl("DesignSystemManager")}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <Package className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-heading text-midnight-900">
                {pkg.package_name}
              </h1>
              <Badge className={statusColors[pkg.status]}>{pkg.status}</Badge>
              <Badge variant="outline">v{pkg.version}</Badge>
            </div>
            <p className="text-muted-foreground mt-1">
              <code className="text-sm">{pkg.package_code}</code>
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {pkg.status === "draft" && (
            <Button 
              onClick={handlePublish}
              className="bg-success hover:bg-success/90 text-success-foreground"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Publish
            </Button>
          )}
          <Link to={createPageUrl("PackageExport") + `?id=${packageId}`}>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </Link>
          <Link to={createPageUrl("TokenPreview") + `?id=${packageId}`}>
            <Button variant="outline">
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
          </Link>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tokens">Design Tokens</TabsTrigger>
          <TabsTrigger value="versions">Version History</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Package Info */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-midnight-900">Package Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <>
                    <div className="space-y-2">
                      <Label>Package Name</Label>
                      <Input
                        value={formData?.package_name || ""}
                        onChange={(e) => setFormData({ ...formData, package_name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        value={formData?.description || ""}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleSave} disabled={updateMutation.isPending}>
                        {updateMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Save
                      </Button>
                      <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <Label className="text-muted-foreground">Description</Label>
                      <p className="text-midnight-900">{pkg.description || "No description"}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-muted-foreground">Type</Label>
                        <p className="text-midnight-900 capitalize">{pkg.package_type?.replace("_", " ")}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Tailwind</Label>
                        <p className="text-midnight-900">{pkg.tailwind_version}</p>
                      </div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Created</Label>
                      <p className="text-midnight-900">
                        {pkg.created_date ? format(new Date(pkg.created_date), "PPP") : "Unknown"}
                      </p>
                    </div>
                    <Button variant="outline" onClick={() => setIsEditing(true)}>
                      Edit Details
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Parent Package / Customer Info */}
            <div className="space-y-4">
              {parentPkg && (
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="text-midnight-900 flex items-center gap-2">
                      <GitBranch className="h-4 w-4" />
                      Based On
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      <Package className="h-8 w-8 text-primary" />
                      <div>
                        <p className="font-medium text-midnight-900">{parentPkg.package_name}</p>
                        <p className="text-sm text-muted-foreground">v{pkg.parent_version}</p>
                      </div>
                    </div>
                    {pkg.update_available && (
                      <div className="mt-3 p-2 bg-warning/10 rounded-lg flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-warning" />
                        <span className="text-sm text-warning">Update available</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {pkg.package_type === "customer_theme" && (
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="text-midnight-900 flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Customer
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <Label className="text-muted-foreground">Company</Label>
                      <p className="text-midnight-900">{pkg.customer_company || "Not set"}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Contact</Label>
                      <p className="text-midnight-900">{pkg.customer_name || "Not set"}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Email</Label>
                      <p className="text-midnight-900">{pkg.customer_email || "Not set"}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Token Summary */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-midnight-900">Token Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-background rounded-lg text-center">
                      <Palette className="h-5 w-5 mx-auto mb-1 text-primary" />
                      <p className="text-lg font-medium text-midnight-900">
                        {Object.keys(pkg.design_tokens?.colors || {}).length}
                      </p>
                      <p className="text-xs text-muted-foreground">Colors</p>
                    </div>
                    <div className="p-3 bg-background rounded-lg text-center">
                      <Type className="h-5 w-5 mx-auto mb-1 text-secondary" />
                      <p className="text-lg font-medium text-midnight-900">
                        {Object.keys(pkg.design_tokens?.typography || {}).length}
                      </p>
                      <p className="text-xs text-muted-foreground">Typography</p>
                    </div>
                    <div className="p-3 bg-background rounded-lg text-center">
                      <Maximize className="h-5 w-5 mx-auto mb-1 text-accent" />
                      <p className="text-lg font-medium text-midnight-900">
                        {Object.keys(pkg.design_tokens?.spacing || {}).length}
                      </p>
                      <p className="text-xs text-muted-foreground">Spacing</p>
                    </div>
                    <div className="p-3 bg-background rounded-lg text-center">
                      <Layers className="h-5 w-5 mx-auto mb-1 text-info" />
                      <p className="text-lg font-medium text-midnight-900">
                        {Object.keys(pkg.design_tokens?.effects || {}).length}
                      </p>
                      <p className="text-xs text-muted-foreground">Effects</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Tokens Tab */}
        <TabsContent value="tokens">
          <ThemeTokenEditor
            packageData={pkg}
            onSave={handleTokensSave}
            isSaving={updateMutation.isPending}
          />
        </TabsContent>

        {/* Versions Tab */}
        <TabsContent value="versions">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-midnight-900">Version History</CardTitle>
            </CardHeader>
            <CardContent>
              {(pkg.changelog || []).length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No version history yet</p>
              ) : (
                <div className="space-y-4">
                  {[...(pkg.changelog || [])].reverse().map((entry, idx) => (
                    <div 
                      key={idx} 
                      className="flex gap-4 p-4 border border-border rounded-lg"
                    >
                      <div className="flex-shrink-0">
                        <Badge className="bg-primary-100 text-primary">
                          v{entry.version}
                        </Badge>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground">
                          {entry.date ? format(new Date(entry.date), "PPP") : "Unknown date"}
                        </p>
                        <ul className="mt-2 space-y-1">
                          {(entry.changes || []).map((change, i) => (
                            <li key={i} className="text-sm text-midnight-900">• {change}</li>
                          ))}
                        </ul>
                        {entry.breaking_changes && (
                          <Badge className="mt-2 bg-destructive-50 text-destructive">
                            Breaking Changes
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-midnight-900">Package Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Status</Label>
...
              </div>

              <div className="pt-4 border-t border-border">
                <h4 className="font-medium text-midnight-900 mb-2">Danger Zone</h4>
                <Button 
                  variant="destructive"
                  onClick={() => {
                    if (confirm("Are you sure you want to delete this package?")) {
                      deleteMutation.mutate();
                    }
                  }}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Package
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}