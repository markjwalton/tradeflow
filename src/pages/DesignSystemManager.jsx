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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { 
  Package, Plus, Sparkles, Loader2, GitBranch, Users, 
  CheckCircle2, AlertCircle, RefreshCw, Download, Upload,
  Eye, Edit, Copy, Trash2, Building2, Mail, Clock, Zap,
  FileCode, Palette, Database, TrendingUp, Shield, ChevronDown,
  Layout, Type, Pipette, ArrowRight, LayoutGrid, Boxes
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import ThemeCreatorDialog from "@/components/design-system/ThemeCreatorDialog";
import { PageHeader } from "@/components/sturij";
import PageSectionHeader from "@/components/common/PageSectionHeader";

// IMPORTANT: Update this to match your actual Tailwind CSS version from package.json
const TAILWIND_VERSION = "4.0.0";

export default function DesignSystemManager() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showThemeCreator, setShowThemeCreator] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [expandedRecs, setExpandedRecs] = useState({});
  const [selectedBgColor, setSelectedBgColor] = useState("--background-100");
  const [selectedCategory, setSelectedCategory] = useState("all");
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

  const categories = ["all", ...new Set(components.map(c => c.category))];
  const filteredComponents = selectedCategory === "all" 
    ? components 
    : components.filter(c => c.category === selectedCategory);
  
  const componentsByCategory = categories.reduce((acc, cat) => {
    acc[cat] = cat === "all" ? components.length : components.filter(c => c.category === cat).length;
    return acc;
  }, {});

  const createMutation = useMutation({
    mutationFn: async (data) => {
      // Capture current design system state
      const cssContent = document.querySelector('style')?.textContent || '';
      
      return base44.entities.DesignSystemPackage.create({
        ...data,
        css_content: cssContent,
        tailwind_version: TAILWIND_VERSION,
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
- Current version in use: ${TAILWIND_VERSION}
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

  const tokenColors = [
    { label: "Background 50 (Lightest)", value: "--background-50", hex: "#fdfcf9" },
    { label: "Background 100", value: "--background-100", hex: "#f5f2ed" },
    { label: "Background 200", value: "--background-200", hex: "#ebe5da" },
    { label: "Background 300", value: "--background-300", hex: "#ddd5c8" },
    { label: "Background 400", value: "--background-400", hex: "#c9bfae" },
    { label: "Primary 50", value: "--primary-50", hex: "#f6f8f7" },
    { label: "Primary 100", value: "--primary-100", hex: "#e9efeb" },
    { label: "Primary 200", value: "--primary-200", hex: "#d4e0d8" },
    { label: "Primary 300", value: "--primary-300", hex: "#a9c3b3" },
    { label: "Primary 400", value: "--primary-400", hex: "#75a086" },
    { label: "Primary 500", value: "--primary-500", hex: "#4a6d55" },
    { label: "Primary 600", value: "--primary-600", hex: "#3d5946" },
    { label: "Primary 700", value: "--primary-700", hex: "#324839" },
    { label: "Primary 800", value: "--primary-800", hex: "#283a2f" },
    { label: "Primary 900", value: "--primary-900", hex: "#213027" },
    { label: "Secondary 50", value: "--secondary-50", hex: "#fdfbf8" },
    { label: "Secondary 100", value: "--secondary-100", hex: "#f8f4ee" },
    { label: "Secondary 200", value: "--secondary-200", hex: "#ede5d9" },
    { label: "Secondary 300", value: "--secondary-300", hex: "#ddc9b0" },
    { label: "Secondary 400", value: "--secondary-400", hex: "#c4a37d" },
    { label: "Secondary 500", value: "--secondary-500", hex: "#af8a62" },
    { label: "Accent 50", value: "--accent-50", hex: "#fdfbfb" },
    { label: "Accent 100", value: "--accent-100", hex: "#f9f4f4" },
    { label: "Accent 200", value: "--accent-200", hex: "#ede5e5" },
    { label: "Accent 300", value: "--accent-300", hex: "#d9c4c4" },
    { label: "Accent 400", value: "--accent-400", hex: "#c19f9f" },
    { label: "Midnight 50", value: "--midnight-50", hex: "#f7f8f9" },
    { label: "Midnight 100", value: "--midnight-100", hex: "#e8eaed" },
    { label: "Midnight 200", value: "--midnight-200", hex: "#d0d5da" },
    { label: "Midnight 300", value: "--midnight-300", hex: "#a8b2bd" },
    { label: "Midnight 400", value: "--midnight-400", hex: "#78879a" },
    { label: "Midnight 500", value: "--midnight-500", hex: "#576c82" },
    { label: "Midnight 600", value: "--midnight-600", hex: "#475d73" },
    { label: "Midnight 700", value: "--midnight-700", hex: "#394e62" },
    { label: "Midnight 800", value: "--midnight-800", hex: "#2f4254" },
    { label: "Midnight 900 (Darkest)", value: "--midnight-900", hex: "#1f2d3b" },
    { label: "Charcoal 50", value: "--charcoal-50", hex: "#f9f9f9" },
    { label: "Charcoal 100", value: "--charcoal-100", hex: "#efefef" },
    { label: "Charcoal 200", value: "--charcoal-200", hex: "#dedede" },
    { label: "Charcoal 300", value: "--charcoal-300", hex: "#c3c3c3" },
    { label: "Charcoal 400", value: "--charcoal-400", hex: "#a3a3a3" },
    { label: "Charcoal 500", value: "--charcoal-500", hex: "#838383" },
    { label: "Charcoal 600", value: "--charcoal-600", hex: "#676767" },
    { label: "Charcoal 700", value: "--charcoal-700", hex: "#525252" },
    { label: "Charcoal 800", value: "--charcoal-800", hex: "#434343" },
    { label: "Charcoal 900 (Dark)", value: "--charcoal-900", hex: "#373737" },
  ];

  const handleBackgroundChange = async (colorVar) => {
    setSelectedBgColor(colorVar);
    
    const selectedColor = tokenColors.find(c => c.value === colorVar);
    const hexFallback = selectedColor?.hex || "#f5f2ed";
    
    // Apply immediately to DOM
    document.documentElement.style.setProperty('--color-background', hexFallback);
    document.body.style.backgroundColor = hexFallback;
    
    toast.success(`Background changed to ${selectedColor?.label}`);
  };

  return (
    <div className="max-w-4xl mx-auto min-h-screen -mt-6">
      <PageHeader 
        title="Design System Manager"
        description="Version control, package distribution, and AI-assisted updates"
      />
      
      <Card className="border-border mb-4">
        <CardContent className="px-2 py-1">
          <div className="flex gap-2 items-center flex-wrap">
            <Button 
              variant="ghost"
              className="hover:bg-[#e9efeb] hover:text-[#273e2d]"
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
              variant="ghost"
              className="hover:bg-[#e9efeb] hover:text-[#273e2d]"
              onClick={() => setShowCreateDialog(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Core Package
            </Button>
            <Button 
              variant="ghost"
              className="hover:bg-[#e9efeb] hover:text-[#273e2d]"
              onClick={() => setShowThemeCreator(true)}
            >
              <Palette className="h-4 w-4 mr-2" />
              Create Custom Theme
            </Button>
            
            <div className="ml-auto flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Background:</span>
              <Select value={selectedBgColor} onValueChange={handleBackgroundChange}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tokenColors.map(color => (
                    <SelectItem key={color.value} value={color.value}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="h-4 w-4 rounded border border-border" 
                          style={{ backgroundColor: color.hex }}
                        />
                        {color.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="[margin-top:var(--spacing-4)]">
        <TabsList>
          <TabsTrigger value="overview">
            <TrendingUp className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="packages">
            <Package className="h-4 w-4 mr-2" />
            Packages
          </TabsTrigger>
          <TabsTrigger value="components">
            <FileCode className="h-4 w-4 mr-2" />
            Components
          </TabsTrigger>
          <TabsTrigger value="recommendations">
            <Sparkles className="h-4 w-4 mr-2" />
            AI Recommendations
          </TabsTrigger>
          <TabsTrigger value="customers">
            <Users className="h-4 w-4 mr-2" />
            Customers
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="[margin-top:var(--spacing-4)]">
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="border-border">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Package className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <div className="text-2xl font-bold text-foreground">{packages.length}</div>
                    <p className="text-sm text-muted-foreground">Total Packages</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-border">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Building2 className="h-8 w-8 mx-auto mb-2 text-secondary" />
                    <div className="text-2xl font-bold text-foreground">{customerPackages.length}</div>
                    <p className="text-sm text-muted-foreground">Customer Themes</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-border">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <FileCode className="h-8 w-8 mx-auto mb-2 text-accent" />
                    <div className="text-2xl font-bold text-foreground">{components.length}</div>
                    <p className="text-sm text-muted-foreground">Components</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-border">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Sparkles className="h-8 w-8 mx-auto mb-2 text-warning" />
                    <div className="text-2xl font-bold text-foreground">{pendingRecs.length}</div>
                    <p className="text-sm text-muted-foreground">AI Recommendations</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Access Cards */}
            <div>
              <h2 className="text-h3 mb-4">Design System Tools</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <Link to={createPageUrl("ThemeBuilder")}>
                  <Card className="border-border hover:shadow-md transition-shadow cursor-pointer h-full">
                    <CardContent className="pt-6">
                      <Palette className="h-10 w-10 text-primary mb-3" />
                      <h3 className="font-heading font-medium text-foreground mb-2">Theme Builder</h3>
                      <p className="text-sm text-muted-foreground mb-3">Create complete design themes with colors and fonts</p>
                      <div className="flex items-center text-primary text-sm font-medium">
                        View Tool <ArrowRight className="h-4 w-4 ml-1" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>

                <Link to={createPageUrl("FontManager")}>
                  <Card className="border-border hover:shadow-md transition-shadow cursor-pointer h-full">
                    <CardContent className="pt-6">
                      <Type className="h-10 w-10 text-secondary mb-3" />
                      <h3 className="font-heading font-medium text-foreground mb-2">Font Manager</h3>
                      <p className="text-sm text-muted-foreground mb-3">Manage typography and font families</p>
                      <div className="flex items-center text-primary text-sm font-medium">
                        View Tool <ArrowRight className="h-4 w-4 ml-1" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>

                <Link to={createPageUrl("OklchColorPicker")}>
                  <Card className="border-border hover:shadow-md transition-shadow cursor-pointer h-full">
                    <CardContent className="pt-6">
                      <Pipette className="h-10 w-10 text-accent mb-3" />
                      <h3 className="font-heading font-medium text-foreground mb-2">Color Tools</h3>
                      <p className="text-sm text-muted-foreground mb-3">OKLCH color picker, palettes, and gradients</p>
                      <div className="flex items-center text-primary text-sm font-medium">
                        View Tool <ArrowRight className="h-4 w-4 ml-1" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>

                <Link to={createPageUrl("LayoutPatternManager")}>
                  <Card className="border-border hover:shadow-md transition-shadow cursor-pointer h-full">
                    <CardContent className="pt-6">
                      <LayoutGrid className="h-10 w-10 text-info mb-3" />
                      <h3 className="font-heading font-medium text-foreground mb-2">Layout Patterns</h3>
                      <p className="text-sm text-muted-foreground mb-3">Manage reusable layout templates</p>
                      <div className="flex items-center text-primary text-sm font-medium">
                        View Tool <ArrowRight className="h-4 w-4 ml-1" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>

                <Link to={createPageUrl("UXShowcase")}>
                  <Card className="border-border hover:shadow-md transition-shadow cursor-pointer h-full">
                    <CardContent className="pt-6">
                      <Boxes className="h-10 w-10 text-success mb-3" />
                      <h3 className="font-heading font-medium text-foreground mb-2">UI Library & Styles Inspector</h3>
                      <p className="text-sm text-muted-foreground mb-3">Browse components, UX patterns, and inspect computed styles</p>
                      <div className="flex items-center text-primary text-sm font-medium">
                        View Showcase <ArrowRight className="h-4 w-4 ml-1" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>

                <Link to={createPageUrl("StyleEditor")}>
                  <Card className="border-border hover:shadow-md transition-shadow cursor-pointer h-full">
                    <CardContent className="pt-6">
                      <Palette className="h-10 w-10 text-accent mb-3" />
                      <h3 className="font-heading font-medium text-foreground mb-2">Advanced Style Editor</h3>
                      <p className="text-sm text-muted-foreground mb-3">Edit design tokens with live preview and instance tracking</p>
                      <div className="flex items-center text-primary text-sm font-medium">
                        Open Editor <ArrowRight className="h-4 w-4 ml-1" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>

                <Link to={createPageUrl("BrandIdentity")}>
                  <Card className="border-border hover:shadow-md transition-shadow cursor-pointer h-full">
                    <CardContent className="pt-6">
                      <Shield className="h-10 w-10 text-primary mb-3" />
                      <h3 className="font-heading font-medium text-foreground mb-2">Brand Identity</h3>
                      <p className="text-sm text-muted-foreground mb-3">View brand guidelines and design principles</p>
                      <div className="flex items-center text-primary text-sm font-medium">
                        View Docs <ArrowRight className="h-4 w-4 ml-1" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            </div>

            {/* AI Recommendations Preview */}
            {pendingRecs.length > 0 && (
              <Card className="border-warning/30 bg-warning/5">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-warning" />
                      <CardTitle className="text-foreground">Pending AI Recommendations</CardTitle>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setActiveTab("recommendations")}
                    >
                      View All ({pendingRecs.length})
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {pendingRecs.slice(0, 3).map(rec => (
                      <div key={rec.id} className="flex items-center justify-between p-3 bg-background rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-foreground text-sm">{rec.title}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">{rec.description}</p>
                        </div>
                        <Badge className={impactColors[rec.impact]}>
                          {rec.impact}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Packages Tab */}
        <TabsContent value="packages" className="[margin-top:var(--spacing-4)]">
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
        <TabsContent value="components" className="[margin-top:var(--spacing-4)]">
          <Card className="border-border">
            <CardContent className="p-6 pb-0">
              <PageSectionHeader
                title="Component Library"
                tabs={categories.map(cat => ({
                  name: cat === "all" ? "All" : cat.charAt(0).toUpperCase() + cat.slice(1),
                  href: `#${cat}`,
                  current: selectedCategory === cat
                }))}
                actions={[
                  {
                    label: "View Showcase",
                    onClick: () => window.location.href = createPageUrl("ComponentShowcase")
                  }
                ]}
                onTabChange={(tab) => {
                  const catName = tab.name === "All" ? "all" : tab.name.toLowerCase();
                  setSelectedCategory(catName);
                }}
              />
            </CardContent>
            <CardContent className="p-6">
              <div className="space-y-4">

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
                {filteredComponents.map(comp => (
                <Card key={comp.id} className="border-border">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base text-foreground">
                        {comp.component_name}
                      </CardTitle>
                      <Badge variant="outline" className="text-xs">
                        {componentsByCategory[comp.category]} in {comp.category}
                      </Badge>
                    </div>
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
        <TabsContent value="recommendations" className="[margin-top:var(--spacing-4)]">
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
                <Collapsible
                  key={rec.id}
                  open={expandedRecs[rec.id]}
                  onOpenChange={(open) => setExpandedRecs({ ...expandedRecs, [rec.id]: open })}
                >
                <Card 
                  className={rec.status === "accepted" ? "opacity-60 border-border" : "border-border"}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CollapsibleTrigger className="flex items-center gap-2 hover:opacity-70">
                            <ChevronDown className={`h-4 w-4 transition-transform ${expandedRecs[rec.id] ? 'rotate-180' : ''}`} />
                            <CardTitle className="text-base text-foreground">
                              {rec.title}
                            </CardTitle>
                          </CollapsibleTrigger>
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
                  <CollapsibleContent>
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
                  </CollapsibleContent>
                </Card>
                </Collapsible>
              ))}
              </div>
            )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Customers Tab */}
        <TabsContent value="customers" className="[margin-top:var(--spacing-4)]">
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