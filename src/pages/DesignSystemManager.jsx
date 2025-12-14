import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  Package, Plus, Sparkles, Loader2, GitBranch, Users, 
  CheckCircle2, AlertCircle, RefreshCw, Download, Upload,
  Eye, Edit, Copy, Trash2, Building2, Mail, Clock, Zap,
  FileCode, Palette, Database, TrendingUp, Shield
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import ThemeCreatorDialog from "@/components/design-system/ThemeCreatorDialog";
import { PageHeader } from "@/components/sturij";

export default function DesignSystemManager() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("packages");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showThemeCreator, setShowThemeCreator] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [formData, setFormData] = useState({
    package_name: "",
    package_code: "",
    package_type: "core",
    version: "1.0.0",
    customer_name: "",
    customer_email: "",
    customer_company: "",
    description: "",
    parent_package_id: null
  });

  const { data: packages = [], isLoading } = useQuery({
    queryKey: ["designSystemPackages"],
    queryFn: () => base44.entities.DesignSystemPackage.list("-created_date")
  });

  const { data: recommendations = [] } = useQuery({
    queryKey: ["packageRecommendations"],
    queryFn: () => base44.entities.PackageUpdateRecommendation.list("-created_date")
  });

  const { data: components = [] } = useQuery({
    queryKey: ["componentSpecs"],
    queryFn: () => base44.entities.ComponentSpecification.list()
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      // Capture current design system state
      const cssContent = document.querySelector('style')?.textContent || '';
      
      return base44.entities.DesignSystemPackage.create({
        ...data,
        css_content: cssContent,
        tailwind_version: "3.4.0",
        base44_compatible: true,
        changelog: [{
          version: data.version,
          date: new Date().toISOString(),
          changes: ["Initial package creation"],
          breaking_changes: false
        }],
        last_sync_check: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["designSystemPackages"] });
      toast.success("Package created");
      setShowCreateDialog(false);
      setFormData({
        package_name: "",
        package_code: "",
        package_type: "core",
        version: "1.0.0",
        customer_name: "",
        customer_email: "",
        customer_company: "",
        description: "",
        parent_package_id: null
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.DesignSystemPackage.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["designSystemPackages"] });
      toast.success("Package updated");
    }
  });

  // AI Analysis: Check for updates and generate recommendations
  const analyzePackageUpdates = async () => {
    setIsAnalyzing(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a design system architect. Analyze the current state and provide update recommendations.

CURRENT PACKAGES: ${packages.length}
- Core packages: ${packages.filter(p => p.package_type === "core").length}
- Customer themes: ${packages.filter(p => p.package_type === "customer_theme").length}

TAILWIND CSS:
- Current version in use: 3.4.0
- Latest stable: Check and recommend if update needed

ANALYSIS NEEDED:
1. Check if Tailwind CSS has updates available
2. Review design token consistency across packages
3. Identify component library improvements
4. Check accessibility compliance updates
5. Review performance optimization opportunities
6. Identify breaking changes in dependencies

For each recommendation, provide:
- Type of update
- Impact level (low/medium/high/critical)
- Effort required (low/medium/high)
- Whether it's a breaking change
- Specific benefits
- Potential risks
- Code changes required (if applicable)`,
        response_json_schema: {
          type: "object",
          properties: {
            recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  type: { type: "string" },
                  title: { type: "string" },
                  description: { type: "string" },
                  reasoning: { type: "string" },
                  impact: { type: "string" },
                  effort: { type: "string" },
                  breaking_change: { type: "boolean" },
                  benefits: { type: "array", items: { type: "string" } },
                  risks: { type: "array", items: { type: "string" } },
                  current_version: { type: "string" },
                  recommended_version: { type: "string" }
                }
              }
            }
          }
        }
      });

      // Create recommendation records
      for (const rec of result.recommendations) {
        await base44.entities.PackageUpdateRecommendation.create({
          package_id: packages[0]?.id || null,
          recommendation_type: rec.type || "token_change",
          current_version: rec.current_version || "1.0.0",
          recommended_version: rec.recommended_version || "1.1.0",
          title: rec.title,
          description: rec.description,
          reasoning: rec.reasoning,
          impact: rec.impact || "medium",
          effort: rec.effort || "medium",
          breaking_change: rec.breaking_change || false,
          benefits: rec.benefits || [],
          risks: rec.risks || [],
          status: "pending_review",
          ai_confidence: 85
        });
      }

      queryClient.invalidateQueries({ queryKey: ["packageRecommendations"] });
      toast.success(`Generated ${result.recommendations.length} recommendations`);
    } catch (error) {
      toast.error("Failed to analyze packages");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCreatePackage = () => {
    if (!formData.package_name.trim()) {
      toast.error("Package name is required");
      return;
    }
    if (!formData.package_code.trim()) {
      toast.error("Package code is required");
      return;
    }
    createMutation.mutate(formData);
  };

  const handleAcceptRecommendation = async (rec) => {
    // Add to roadmap
    const roadmapItem = await base44.entities.RoadmapItem.create({
      title: rec.title,
      description: rec.description,
      category: "improvement",
      priority: rec.impact === "critical" ? "critical" : rec.impact === "high" ? "high" : "medium",
      status: "backlog",
      source: "ai_assistant",
      notes: rec.reasoning,
      tags: ["design-system", rec.recommendation_type]
    });

    // Update recommendation
    await base44.entities.PackageUpdateRecommendation.update(rec.id, {
      status: "accepted",
      roadmap_item_id: roadmapItem.id,
      reviewed_date: new Date().toISOString()
    });

    queryClient.invalidateQueries({ queryKey: ["packageRecommendations"] });
    queryClient.invalidateQueries({ queryKey: ["roadmapItems"] });
    toast.success("Added to roadmap");
  };

  const handleRejectRecommendation = async (rec) => {
    await base44.entities.PackageUpdateRecommendation.update(rec.id, {
      status: "rejected",
      reviewed_date: new Date().toISOString()
    });
    queryClient.invalidateQueries({ queryKey: ["packageRecommendations"] });
    toast.success("Recommendation rejected");
  };

  const corePackages = packages.filter(p => p.package_type === "core");
  const customerPackages = packages.filter(p => p.package_type === "customer_theme");
  const pendingRecs = recommendations.filter(r => r.status === "pending_review");

  const impactColors = {
    low: "bg-info-50 text-info",
    medium: "bg-warning/10 text-warning",
    high: "bg-accent-100 text-accent",
    critical: "bg-destructive-50 text-destructive"
  };

  return (
    <div className="max-w-4xl mx-auto min-h-screen -mt-6">
      <PageHeader 
        title="Design System Manager"
        description="Version control, package distribution, and AI-assisted updates"
      >
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={analyzePackageUpdates}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            AI Analyze Updates
          </Button>
          <Button 
            variant="outline"
            onClick={() => setShowCreateDialog(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Core Package
          </Button>
          <Button 
            onClick={() => setShowThemeCreator(true)}
          >
            <Palette className="h-4 w-4 mr-2" />
            Create Custom Theme
          </Button>
        </div>
      </PageHeader>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-0">
        <TabsList className="mb-4">
          <TabsTrigger value="packages">
            <Package className="h-4 w-4 mr-2" />
            Packages ({packages.length})
          </TabsTrigger>
          <TabsTrigger value="components">
            <FileCode className="h-4 w-4 mr-2" />
            Components ({components.length})
          </TabsTrigger>
          <TabsTrigger value="recommendations">
            <Sparkles className="h-4 w-4 mr-2" />
            AI Recommendations
            {pendingRecs.length > 0 && (
              <Badge className="ml-2 bg-warning text-white">
                {pendingRecs.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="customers">
            <Users className="h-4 w-4 mr-2" />
            Customers ({customerPackages.length})
          </TabsTrigger>
        </TabsList>

        {/* Packages Tab */}
        <TabsContent value="packages" className="mt-4">
          <Card className="border-border">
            <CardContent className="p-6">
              <div className="space-y-4">
            {pendingRecs.length > 0 && (
              <Card className="border-warning/30 bg-warning/5">
                <CardContent className="py-4">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-warning" />
                    <div className="flex-1">
                      <p className="font-medium text-foreground">
                        {pendingRecs.length} update recommendations pending review
                      </p>
                      <p className="text-sm text-muted-foreground">
                        AI has identified improvements for your design system
                      </p>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setActiveTab("recommendations")}
                    >
                      Review Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <h2 className="text-h3">
              Core Packages
            </h2>
            <div className="space-y-4">
              {corePackages.map(pkg => (
                <Card key={pkg.id} className="border-border">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-foreground flex items-center gap-2">
                          <Palette className="h-5 w-5 text-primary" />
                          {pkg.package_name}
                        </CardTitle>
                        <code className="text-xs text-muted-foreground">{pkg.package_code}</code>
                      </div>
                      <Badge className="bg-success-50 text-success">
                        v{pkg.version}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {pkg.description}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                      <span>Tailwind {pkg.tailwind_version}</span>
                      <span>{pkg.component_list?.length || 0} components</span>
                    </div>
                    <div className="flex gap-2">
                      <Link to={createPageUrl("PackageDetail") + `?id=${pkg.id}`}>
                        <Button size="sm" variant="outline">
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                      </Link>
                      <Link to={createPageUrl("PackageExport") + `?id=${pkg.id}`}>
                        <Button size="sm" variant="outline">
                          <Download className="h-3 w-3 mr-1" />
                          Export
                        </Button>
                      </Link>
                      <Button size="sm" variant="outline">
                        <Copy className="h-3 w-3 mr-1" />
                        Clone
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {corePackages.length === 0 && (
                <Card className="border-dashed border-border">
                  <CardContent className="py-12 text-center">
                    <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground">No core packages yet</p>
                    <Button 
                      className="mt-4"
                      onClick={() => setShowCreateDialog(true)}
                    >
                      Create Sturij Core Package
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Customer Theme Packages */}
            {customerPackages.length > 0 && (
              <>
                <h2 className="text-h3">
                  Customer Theme Packages
                </h2>
              <div className="space-y-4">
                {customerPackages.map(pkg => (
                  <Card key={pkg.id} className="border-border">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-foreground flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-secondary" />
                            {pkg.package_name}
                          </CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <code className="text-xs text-muted-foreground">{pkg.package_code}</code>
                            {pkg.update_available && (
                              <Badge className="bg-warning/10 text-warning">
                                Update Available
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Badge className="bg-info-50 text-info">
                          v{pkg.version}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">{pkg.customer_company}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">{pkg.customer_email}</span>
                        </div>
                        {pkg.parent_package_id && (
                          <div className="flex items-center gap-2 text-sm">
                            <GitBranch className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">
                              Based on {packages.find(p => p.id === pkg.parent_package_id)?.package_name} v{pkg.parent_version}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {pkg.update_available && (
                          <Button size="sm" className="bg-warning hover:bg-warning/90 text-white">
                            <RefreshCw className="h-3 w-3 mr-1" />
                            Update
                          </Button>
                        )}
                        <Link to={createPageUrl("PackageDetail") + `?id=${pkg.id}`}>
                          <Button size="sm" variant="outline">
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                        </Link>
                        <Button size="sm" variant="outline">
                          <Mail className="h-3 w-3 mr-1" />
                          Notify
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                </div>
              </>
            )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Components Tab */}
        <TabsContent value="components" className="mt-4">
          <Card className="border-border">
            <CardContent className="p-6">
              <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-h3">
                Component Library
              </h2>
            <Link to={createPageUrl("ComponentShowcase")}>
              <Button variant="outline">
                <Eye className="h-4 w-4 mr-2" />
                View Showcase
              </Button>
            </Link>
            </div>

            {components.length === 0 ? (
            <Card className="border-border">
              <CardContent className="py-12 text-center">
                <FileCode className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">No component specifications yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Components will be cataloged when you create packages
                </p>
              </CardContent>
            </Card>
            ) : (
              <div className="space-y-3">
                {components.map(comp => (
                <Card key={comp.id} className="border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base text-foreground">
                      {comp.component_name}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">{comp.category}</Badge>
                      <Badge className="bg-muted text-muted-foreground text-xs">
                        v{comp.version}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      {comp.description}
                    </p>
                    <div className="text-xs text-muted-foreground">
                      {comp.design_tokens_used?.length || 0} tokens used
                    </div>
                  </CardContent>
                </Card>
              ))}
              </div>
            )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="mt-4">
          <Card className="border-border">
            <CardContent className="p-6">
              <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-h3">
                AI Update Recommendations
              </h2>
            <Button 
              onClick={analyzePackageUpdates}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              Run Analysis
            </Button>
            </div>

            {recommendations.length === 0 ? (
            <Card className="border-border">
              <CardContent className="py-12 text-center">
                <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">No recommendations yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Run AI analysis to get update recommendations
                </p>
              </CardContent>
            </Card>
            ) : (
              <div className="space-y-3">
                {recommendations.map(rec => (
                <Card 
                  key={rec.id}
                  className={rec.status === "accepted" ? "opacity-60 border-border" : "border-border"}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-base text-foreground">
                            {rec.title}
                          </CardTitle>
                          <Badge className={impactColors[rec.impact]}>
                            {rec.impact}
                          </Badge>
                          {rec.breaking_change && (
                            <Badge className="bg-destructive-50 text-destructive">
                              Breaking
                            </Badge>
                          )}
                        </div>
                        <Badge variant="outline" className="text-xs">{rec.recommendation_type}</Badge>
                      </div>
                      <Badge 
                        variant="outline"
                        className={
                          rec.status === "pending_review" ? "border-warning" :
                          rec.status === "accepted" ? "border-success" :
                          "border-border"
                        }
                      >
                        {rec.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {rec.description}
                      </p>
                      {rec.reasoning && (
                        <div className="bg-accent-100 p-3 rounded-md text-sm">
                          <p className="font-medium text-foreground mb-1">AI Reasoning:</p>
                          <p className="text-muted-foreground">{rec.reasoning}</p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground font-medium">Current:</span>
                        <span className="text-foreground">{rec.current_version}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground font-medium">Recommended:</span>
                        <span className="text-foreground">{rec.recommended_version}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground font-medium">Effort:</span>
                        <Badge className="bg-muted text-muted-foreground">
                          {rec.effort}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground font-medium">Impact:</span>
                        <Badge className={impactColors[rec.impact]}>
                          {rec.impact}
                        </Badge>
                      </div>
                    </div>

                    {rec.benefits?.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-foreground mb-1">Benefits:</p>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {rec.benefits.map((b, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                              {b}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {rec.status === "pending_review" && (
                      <div className="flex gap-2 pt-2 border-t border-border">
                        <Button 
                          size="sm"
                          onClick={() => handleAcceptRecommendation(rec)}
                          className="bg-success hover:bg-success/90 text-success-foreground"
                        >
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Accept & Add to Roadmap
                        </Button>
                        <Button 
                          size="sm"
                          variant="outline"
                          onClick={() => handleRejectRecommendation(rec)}
                        >
                          Reject
                        </Button>
                      </div>
                    )}

                    {rec.roadmap_item_id && (
                      <div className="pt-2 border-t border-border">
                        <Link to={createPageUrl("RoadmapManager")}>
                          <Badge className="bg-info-50 text-info cursor-pointer">
                            <Zap className="h-3 w-3 mr-1" />
                            View in Roadmap
                          </Badge>
                        </Link>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
              </div>
            )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Customers Tab */}
        <TabsContent value="customers" className="mt-4">
          <Card className="border-border">
            <CardContent className="p-6">
              <div className="space-y-4">
            {customerPackages.map(pkg => (
              <Card key={pkg.id} className="border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">
                    {pkg.customer_company || pkg.customer_name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">Package</p>
                    <p className="text-sm text-muted-foreground">{pkg.package_name} v{pkg.version}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Contact</p>
                    <p className="text-sm text-muted-foreground">{pkg.customer_email}</p>
                  </div>
                  {pkg.parent_package_id && (
                    <div>
                      <p className="text-sm font-medium text-foreground">Based On</p>
                      <p className="text-sm text-muted-foreground">
                        {packages.find(p => p.id === pkg.parent_package_id)?.package_name} v{pkg.parent_version}
                      </p>
                    </div>
                  )}
                  {pkg.last_sync_check && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      Last checked: {format(new Date(pkg.last_sync_check), "MMM d, yyyy")}
                    </div>
                  )}
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="outline">
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Check Updates
                    </Button>
                    <Button size="sm" variant="outline">
                      <Mail className="h-3 w-3 mr-1" />
                      Contact
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {customerPackages.length === 0 && (
              <Card className="border-dashed border-border">
                <CardContent className="py-12 text-center">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">No customer packages yet</p>
                </CardContent>
              </Card>
            )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Package Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-foreground">Create Design System Package</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground">Package Name *</label>
                <Input
                  value={formData.package_name}
                  onChange={(e) => setFormData({ ...formData, package_name: e.target.value })}
                  placeholder="e.g., Sturij Core"
                />
              </div>
              <div>
                <label className="text-body-small text-foreground">Package Code *</label>
                <Input
                  value={formData.package_code}
                  onChange={(e) => setFormData({ ...formData, package_code: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                  placeholder="e.g., sturij-core"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-body-small text-foreground">Package Type</label>
                <Select 
                  value={formData.package_type} 
                  onValueChange={(v) => setFormData({ ...formData, package_type: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="core">Core Package</SelectItem>
                    <SelectItem value="customer_theme">Customer Theme</SelectItem>
                    <SelectItem value="component_library">Component Library</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-body-small text-foreground">Version</label>
                <Input
                  value={formData.version}
                  onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                  placeholder="1.0.0"
                />
              </div>
            </div>

            {formData.package_type === "customer_theme" && (
              <>
                <div className="border-t border-border pt-4">
                  <h4 className="text-lg font-medium mb-3">
                    Customer Information
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-body-small text-foreground">Customer Name</label>
                      <Input
                        value={formData.customer_name}
                        onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                        placeholder="John Smith"
                      />
                    </div>
                    <div>
                      <label className="text-body-small text-foreground">Company</label>
                      <Input
                        value={formData.customer_company}
                        onChange={(e) => setFormData({ ...formData, customer_company: e.target.value })}
                        placeholder="Acme Corp"
                      />
                    </div>
                    <div>
                      <label className="text-body-small text-foreground">Email</label>
                      <Input
                        type="email"
                        value={formData.customer_email}
                        onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                        placeholder="contact@acmecorp.com"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-body-small text-foreground">Based On Package</label>
                  <Select 
                    value={formData.parent_package_id || ""} 
                    onValueChange={(v) => setFormData({ 
                      ...formData, 
                      parent_package_id: v,
                      parent_version: corePackages.find(p => p.id === v)?.version
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select parent package..." />
                    </SelectTrigger>
                    <SelectContent>
                      {corePackages.map(p => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.package_name} v{p.version}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            <div>
              <label className="text-body-small text-foreground">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Package description..."
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreatePackage}
                disabled={createMutation.isPending}
              >
                {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Create Package
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Theme Creator Dialog */}
      <ThemeCreatorDialog
        open={showThemeCreator}
        onOpenChange={setShowThemeCreator}
        parentPackages={corePackages}
      />
    </div>
  );
}