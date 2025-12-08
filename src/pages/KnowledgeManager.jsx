import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { 
  RefreshCw, Download, Sparkles, Search, ExternalLink,
  CheckCircle2, Loader2, BookOpen, GitBranch, Zap, 
  FileText, ArrowUp, Plus, Expand, Eye, Layers,
  Component, Box, Palette, Database, Newspaper
} from "lucide-react";
import { toast } from "sonner";

// Import reference components
import ShadcnReference from "@/components/knowledge/ShadcnReference";
import TailwindReference from "@/components/knowledge/TailwindReference";
import ReactReference from "@/components/knowledge/ReactReference";
import LucideReference from "@/components/knowledge/LucideReference";
import Base44Reference from "@/components/knowledge/Base44Reference";
import NewsFeed from "@/components/knowledge/NewsFeed";

// Technology configurations
const TECH_CONFIGS = {
  tailwind: {
    name: "Tailwind CSS",
    icon: Palette,
    color: "text-info",
    bgColor: "bg-info-50",
    categories: [
      { id: "core_concepts", name: "Core Concepts" },
      { id: "layout", name: "Layout" },
      { id: "flexbox_grid", name: "Flexbox & Grid" },
      { id: "spacing", name: "Spacing" },
      { id: "typography", name: "Typography" },
      { id: "backgrounds", name: "Backgrounds" },
      { id: "borders", name: "Borders" },
      { id: "effects", name: "Effects" },
      { id: "transitions", name: "Transitions" }
    ]
  },
  react: {
    name: "React",
    icon: Component,
    color: "text-info",
    bgColor: "bg-info-50",
    categories: [
      { id: "hooks", name: "Hooks" },
      { id: "components", name: "Components" },
      { id: "patterns", name: "Patterns" },
      { id: "performance", name: "Performance" },
      { id: "state_management", name: "State Management" },
      { id: "server_components", name: "Server Components" }
    ]
  },
  shadcn: {
    name: "shadcn/ui",
    icon: Box,
    color: "text-accent",
    bgColor: "bg-accent-100",
    categories: [
      { id: "form", name: "Form Components" },
      { id: "data_display", name: "Data Display" },
      { id: "feedback", name: "Feedback" },
      { id: "navigation", name: "Navigation" },
      { id: "overlay", name: "Overlay" },
      { id: "layout", name: "Layout" }
    ],
    components: [
      "Accordion", "Alert", "AlertDialog", "AspectRatio", "Avatar", "Badge",
      "Breadcrumb", "Button", "Calendar", "Card", "Carousel", "Chart",
      "Checkbox", "Collapsible", "Combobox", "Command", "ContextMenu",
      "DataTable", "DatePicker", "Dialog", "Drawer", "DropdownMenu",
      "Form", "HoverCard", "Input", "InputOTP", "Label", "Menubar",
      "NavigationMenu", "Pagination", "Popover", "Progress", "RadioGroup",
      "ResizablePanels", "ScrollArea", "Select", "Separator", "Sheet",
      "Skeleton", "Slider", "Sonner", "Switch", "Table", "Tabs",
      "Textarea", "Toast", "Toggle", "ToggleGroup", "Tooltip"
    ]
  },
  lucide: {
    name: "Lucide Icons",
    icon: Sparkles,
    color: "text-secondary",
    bgColor: "bg-secondary-100",
    categories: []
  },
  base44: {
    name: "Base44",
    icon: Database,
    color: "text-success",
    bgColor: "bg-success-50",
    categories: [
      { id: "entities", name: "Entity Operations" },
      { id: "auth", name: "Authentication" },
      { id: "integrations", name: "Integrations" },
      { id: "functions", name: "Backend Functions" },
      { id: "agents", name: "AI Agents" }
    ]
  }
};

export default function KnowledgeManager() {
  const queryClient = useQueryClient();
  const [activeTech, setActiveTech] = useState("tailwind");
  const [activeTab, setActiveTab] = useState("releases");
  const [searchQuery, setSearchQuery] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzingImpl, setAnalyzingImpl] = useState(false);
  const [syncProgress, setSyncProgress] = useState({ current: 0, total: 0, message: "" });
  const [roadmapDialog, setRoadmapDialog] = useState({ open: false, rec: null });
  const [roadmapPriority, setRoadmapPriority] = useState("medium");
  const [expandingRec, setExpandingRec] = useState(null);

  // Fetch releases for current tech
  const { data: releases = [], isLoading: loadingReleases } = useQuery({
    queryKey: ["techReleases", activeTech],
    queryFn: () => base44.entities.TailwindRelease.filter({ 
      version: { $regex: activeTech === "tailwind" ? "^4" : activeTech === "react" ? "^18|^19" : "^" }
    })
  });

  // Fetch knowledge base
  const { data: knowledge = [], isLoading: loadingKnowledge } = useQuery({
    queryKey: ["techKnowledge", activeTech],
    queryFn: () => base44.entities.TailwindKnowledge.filter({ 
      source_url: { $regex: activeTech }
    })
  });

  // Fetch recommendations
  const { data: recommendations = [] } = useQuery({
    queryKey: ["techRecommendations", activeTech],
    queryFn: () => base44.entities.PackageUpdateRecommendation.filter({ 
      package_id: { $regex: activeTech }
    })
  });

  // Fetch RuleBook for context
  const { data: rules = [] } = useQuery({
    queryKey: ["developmentRules"],
    queryFn: () => base44.entities.DevelopmentRule.filter({ is_active: true })
  });

  // Fetch our component specs for comparison
  const { data: ourComponents = [] } = useQuery({
    queryKey: ["componentSpecs"],
    queryFn: () => base44.entities.ComponentSpecification.list()
  });

  const createReleaseMutation = useMutation({
    mutationFn: (data) => base44.entities.TailwindRelease.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["techReleases"] })
  });

  const createKnowledgeMutation = useMutation({
    mutationFn: (data) => base44.entities.TailwindKnowledge.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["techKnowledge"] })
  });

  const techConfig = TECH_CONFIGS[activeTech];
  const TechIcon = techConfig.icon;

  // Build RuleBook context for AI
  const getRuleBookContext = () => {
    const relevantRules = rules.filter(r => 
      r.category === "ui_ux" || 
      r.category === "architecture" || 
      r.category === "accessibility" ||
      r.tags?.some(t => ["component", "design", "ui", activeTech].includes(t.toLowerCase()))
    );
    return relevantRules.map(r => `- ${r.title}: ${r.description}`).join("\n");
  };

  const handleCheckNewReleases = async () => {
    setSyncing(true);
    try {
      const prompts = {
        tailwind: "What is the latest Tailwind CSS version? Include version, release date, top 5 features, breaking changes.",
        react: "What is the latest React version? Include version, release date, top 5 features, breaking changes, new hooks.",
        shadcn: "What are the latest shadcn/ui component updates? Include any new components, updated components, and breaking changes."
      };

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: prompts[activeTech],
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            version: { type: "string" },
            release_date: { type: "string" },
            new_features: { 
              type: "array", 
              items: { 
                type: "object",
                properties: {
                  name: { type: "string" },
                  description: { type: "string" },
                  impact: { type: "string" }
                }
              }
            },
            breaking_changes: { type: "array", items: { type: "object" } },
            changelog_url: { type: "string" }
          }
        }
      });

      await createReleaseMutation.mutateAsync({
        version: `${activeTech}-${result.version}`,
        release_date: result.release_date,
        new_features: result.new_features,
        breaking_changes: result.breaking_changes,
        changelog_url: result.changelog_url,
        is_major: result.version?.endsWith(".0"),
        status: "new"
      });
      toast.success(`Found ${techConfig.name} ${result.version}`);
    } catch (error) {
      toast.error("Failed: " + error.message);
    }
    setSyncing(false);
  };

  const handleSyncComponents = async () => {
    if (activeTech !== "shadcn") {
      toast.info("Component sync is for shadcn/ui");
      return;
    }
    setSyncing(true);
    const components = TECH_CONFIGS.shadcn.components;
    setSyncProgress({ current: 0, total: components.length, message: "Starting..." });

    try {
      for (let i = 0; i < components.length; i += 5) {
        const batch = components.slice(i, i + 5);
        setSyncProgress({ 
          current: i, 
          total: components.length, 
          message: `Syncing ${batch.join(", ")}...` 
        });

        const result = await base44.integrations.Core.InvokeLLM({
          prompt: `Get the latest shadcn/ui component details for: ${batch.join(", ")}

For each component provide:
1. Current version/status
2. Key props and their types
3. Accessibility features
4. Common use patterns
5. Any recent changes or updates`,
          add_context_from_internet: true,
          response_json_schema: {
            type: "object",
            properties: {
              components: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    description: { type: "string" },
                    props: { type: "array", items: { type: "string" } },
                    accessibility: { type: "string" },
                    recent_changes: { type: "string" }
                  }
                }
              }
            }
          }
        });

        for (const comp of result.components || []) {
          await createKnowledgeMutation.mutateAsync({
            version: "latest",
            category: "shadcn_component",
            topic: comp.name,
            content: comp.description,
            utility_classes: comp.props?.map(p => ({ class_name: p, description: "" })),
            code_examples: comp.accessibility ? [{ description: "Accessibility", html: comp.accessibility }] : [],
            source_url: `https://ui.shadcn.com/docs/components/${comp.name.toLowerCase()}`,
            last_synced: new Date().toISOString()
          });
        }
      }
      setSyncProgress({ current: components.length, total: components.length, message: "Complete!" });
      toast.success("Components synced");
      setTimeout(() => setSyncProgress({ current: 0, total: 0, message: "" }), 2000);
    } catch (error) {
      toast.error("Sync failed: " + error.message);
      setSyncProgress({ current: 0, total: 0, message: "" });
    }
    setSyncing(false);
  };

  const handleGenerateRecommendations = async () => {
    setAnalyzing(true);
    try {
      const ruleContext = getRuleBookContext();
      const latestRelease = releases[0];
      
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze ${techConfig.name} updates and generate recommendations for our UI library.

Latest Release: ${JSON.stringify(latestRelease?.new_features || [])}

Our RuleBook Guidelines:
${ruleContext || "No specific rules defined yet."}

Our Implementation:
- Sturij Design System with CSS custom properties
- Color tokens: --color-primary, --color-secondary, --color-accent
- Typography: --font-heading, --font-body
- Spacing scale: --spacing-1 through --spacing-32
- shadcn/ui components customized with our tokens

Generate 3-5 actionable recommendations that:
1. Align with our RuleBook guidelines
2. Leverage new ${techConfig.name} features
3. Improve our component library
4. Maintain consistency with our design tokens`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  impact: { type: "string" },
                  effort: { type: "string" },
                  rulebook_alignment: { type: "string" }
                }
              }
            }
          }
        }
      });

      for (const rec of result.recommendations || []) {
        await base44.entities.PackageUpdateRecommendation.create({
          package_id: activeTech,
          recommendation_type: `${activeTech}_update`,
          title: rec.title,
          description: rec.description,
          impact: rec.impact,
          effort: rec.effort,
          reasoning: rec.rulebook_alignment,
          status: "pending_review"
        });
      }

      queryClient.invalidateQueries({ queryKey: ["techRecommendations"] });
      toast.success(`Generated ${result.recommendations?.length || 0} recommendations`);
    } catch (error) {
      toast.error("Failed: " + error.message);
    }
    setAnalyzing(false);
  };

  const handleCompareComponents = async () => {
    setAnalyzingImpl(true);
    try {
      const ruleContext = getRuleBookContext();
      const ourComponentNames = ourComponents.map(c => c.component_name).join(", ");
      
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Compare our component library with the latest shadcn/ui components and identify improvements.

Our Components: ${ourComponentNames || "PageHeader, StatCard, StatusBadge, FeatureCard, DataRow, ContentSection"}

Latest shadcn/ui Components: ${TECH_CONFIGS.shadcn.components.join(", ")}

Our RuleBook Guidelines:
${ruleContext || "No specific rules defined."}

Our Token System:
- Colors: --color-primary (#4A5D4E), --color-secondary (#D4A574), --color-accent (#d9b4a7)
- Full scales (50-900) for brand colors
- Typography: Degular Display (headings), Mrs Eaves XL Serif (body)
- Consistent spacing, shadows, radii

Identify:
1. New shadcn/ui components we should adopt
2. Updates to existing components we're using
3. Accessibility improvements we're missing
4. Pattern improvements from latest versions
5. Any conflicts with our RuleBook that need resolution`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  impact: { type: "string" },
                  effort: { type: "string" },
                  component_affected: { type: "string" },
                  rulebook_note: { type: "string" }
                }
              }
            }
          }
        }
      });

      for (const rec of result.recommendations || []) {
        await base44.entities.PackageUpdateRecommendation.create({
          package_id: `${activeTech}-comparison`,
          recommendation_type: `${activeTech}_update`,
          title: `[Compare] ${rec.title}`,
          description: rec.description,
          impact: rec.impact,
          effort: rec.effort,
          reasoning: rec.rulebook_note ? `Component: ${rec.component_affected}\nRuleBook: ${rec.rulebook_note}` : rec.component_affected,
          status: "pending_review"
        });
      }

      queryClient.invalidateQueries({ queryKey: ["techRecommendations"] });
      toast.success(`Generated ${result.recommendations?.length || 0} comparison insights`);
    } catch (error) {
      toast.error("Comparison failed: " + error.message);
    }
    setAnalyzingImpl(false);
  };

  const handleExpandRecommendation = async (rec) => {
    setExpandingRec(rec.id);
    try {
      const ruleContext = getRuleBookContext();
      
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Expand this recommendation into a detailed development prompt.

Recommendation: ${rec.title}
Description: ${rec.description}

Our RuleBook Guidelines:
${ruleContext || "No specific rules."}

Our Token Implementation:
- CSS Variables: --color-primary, --color-secondary, --color-accent (with 50-900 scales)
- HSL tokens: --sturij-primary: 135 12% 33%
- Typography: --font-heading, --font-body, --font-size-* scale
- Spacing: --spacing-1 through --spacing-32
- Effects: --shadow-*, --radius-*, --transition-*

Create a development prompt that:
1. References specific RuleBook guidelines that apply
2. Shows exactly how to implement using our tokens
3. Lists specific files/components affected
4. Provides code examples with our CSS variables
5. Highlights any RuleBook rules that may conflict`,
        response_json_schema: {
          type: "object",
          properties: {
            development_prompt: { type: "string" },
            rulebook_references: { type: "array", items: { type: "string" } },
            affected_components: { type: "array", items: { type: "string" } },
            code_examples: { type: "array", items: { type: "string" } }
          }
        }
      });

      await base44.entities.PackageUpdateRecommendation.update(rec.id, {
        reasoning: `${result.development_prompt}\n\n**RuleBook References:**\n${result.rulebook_references?.join("\n") || "None"}`,
        code_changes_required: result.affected_components?.map(c => ({ description: c })) || []
      });

      queryClient.invalidateQueries({ queryKey: ["techRecommendations"] });
      toast.success("Expanded with RuleBook context");
    } catch (error) {
      toast.error("Failed: " + error.message);
    }
    setExpandingRec(null);
  };

  const handleAddToRoadmap = async () => {
    const rec = roadmapDialog.rec;
    if (!rec) return;
    
    try {
      await base44.entities.RoadmapItem.create({
        title: rec.title,
        description: rec.description + (rec.reasoning ? `\n\n**Development Prompt:**\n${rec.reasoning}` : ""),
        category: "improvement",
        priority: roadmapPriority,
        status: "backlog",
        source: "ai_assistant",
        tags: [activeTech, "design-system", "component-library"]
      });

      await base44.entities.PackageUpdateRecommendation.update(rec.id, { status: "accepted" });
      queryClient.invalidateQueries({ queryKey: ["techRecommendations"] });
      toast.success("Added to roadmap");
      setRoadmapDialog({ open: false, rec: null });
    } catch (error) {
      toast.error("Failed: " + error.message);
    }
  };

  const filteredKnowledge = knowledge.filter(k => 
    !searchQuery || 
    k.topic?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    k.content?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 bg-background min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-h2 flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            Knowledge Manager
          </h1>
          <p className="text-charcoal-700">
            Track updates across Tailwind, React, and shadcn/ui with RuleBook integration
          </p>
        </div>
      </div>

      {/* Technology Selector */}
      <div className="flex gap-2 mb-6">
        {Object.entries(TECH_CONFIGS).map(([key, config]) => {
          const Icon = config.icon;
          return (
            <Button
              key={key}
              variant={activeTech === key ? "default" : "outline"}
              onClick={() => setActiveTech(key)}
              className={activeTech === key ? "bg-primary" : ""}
            >
              <Icon className="h-4 w-4 mr-2" />
              {config.name}
            </Button>
          );
        })}
      </div>

      {/* Progress Bar */}
      {syncProgress.total > 0 && (
        <div className="mb-4 p-4 bg-card border border-border rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span className="text-sm font-medium">{syncProgress.message}</span>
            </div>
            <span className="text-sm text-charcoal-700">
              {syncProgress.current} / {syncProgress.total}
            </span>
          </div>
          <Progress value={(syncProgress.current / syncProgress.total) * 100} className="h-2" />
        </div>
      )}

      {/* RuleBook Status */}
      <div className="mb-4 p-3 bg-primary-50 border border-primary/20 rounded-lg flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          <span className="text-sm text-midnight-900">
            RuleBook: {rules.length} active rules loaded for AI reasoning
          </span>
        </div>
        <Badge className="bg-primary-100 text-primary">
          {rules.filter(r => r.category === "ui_ux").length} UI/UX rules
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="releases" className="gap-1">
            <GitBranch className="h-4 w-4" />
            Releases
          </TabsTrigger>
          <TabsTrigger value="components" className="gap-1">
            <Layers className="h-4 w-4" />
            Components
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="gap-1">
            <Sparkles className="h-4 w-4" />
            AI Recommendations
          </TabsTrigger>
          <TabsTrigger value="reference" className="gap-1">
            <FileText className="h-4 w-4" />
            Quick Reference
          </TabsTrigger>
          <TabsTrigger value="news" className="gap-1">
            <Newspaper className="h-4 w-4" />
            News Feed
          </TabsTrigger>
        </TabsList>

        {/* Releases Tab */}
        <TabsContent value="releases" className="space-y-4">
          <div className="flex justify-end gap-2 mb-4">
            <Button variant="outline" onClick={handleCheckNewReleases} disabled={syncing}>
              {syncing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
              Check for Updates
            </Button>
          </div>

          {loadingReleases ? (
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            </div>
          ) : releases.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <TechIcon className={`h-12 w-12 mx-auto mb-4 ${techConfig.color}`} />
                <h3 className="text-h4">No {techConfig.name} Releases Tracked</h3>
                <p className="text-charcoal-700 mt-2">Click "Check for Updates" to find the latest releases</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {releases.map((release) => (
                <Card key={release.id}>
                  <CardHeader className="flex flex-row items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <TechIcon className={`h-5 w-5 ${techConfig.color}`} />
                        {release.version}
                        {release.is_major && <Badge>Major</Badge>}
                        <Badge variant="outline">{release.status}</Badge>
                      </CardTitle>
                      <p className="text-sm text-charcoal-700">Released: {release.release_date || "Unknown"}</p>
                    </div>
                    {release.changelog_url && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={release.changelog_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Changelog
                        </a>
                      </Button>
                    )}
                  </CardHeader>
                  <CardContent>
                    {release.new_features?.length > 0 && (
                      <div className="grid md:grid-cols-2 gap-2">
                        {release.new_features.map((feature, idx) => (
                          <div key={idx} className={`p-2 ${techConfig.bgColor} rounded-lg`}>
                            <p className="text-body-small">{feature.name}</p>
                            <p className="text-xs text-charcoal-700">{feature.description}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Components Tab */}
        <TabsContent value="components" className="space-y-4">
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal-700" />
              <Input
                placeholder="Search components..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSyncComponents} disabled={syncing || activeTech !== "shadcn"}>
              {syncing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
              Sync shadcn/ui Components
            </Button>
          </div>

          {activeTech === "shadcn" && (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {TECH_CONFIGS.shadcn.components.map((comp) => {
                const synced = filteredKnowledge.some(k => k.topic === comp);
                return (
                  <div
                    key={comp}
                    className={`p-3 rounded-lg border text-center ${
                      synced 
                        ? "bg-success-50 border-success/30" 
                        : "bg-white border-border"
                    }`}
                  >
                    <p className="text-body-small">{comp}</p>
                    {synced && <CheckCircle2 className="h-3 w-3 mx-auto mt-1 text-success" />}
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>AI Recommendations with RuleBook Context</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleCompareComponents} disabled={analyzingImpl}>
                  {analyzingImpl ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Eye className="h-4 w-4 mr-2" />}
                  Compare Components
                </Button>
                <Button 
                  onClick={handleGenerateRecommendations} 
                  disabled={analyzing}
                  >
                  {analyzing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                  Generate from Releases
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {recommendations.length === 0 ? (
                <div className="text-center py-8">
                  <Sparkles className="h-12 w-12 mx-auto mb-4" />
                  <p className="text-charcoal-700">
                    Generate recommendations to get AI insights with RuleBook alignment
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recommendations.map((rec) => (
                    <div key={rec.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="text-h6">{rec.title}</h4>
                            {rec.status === "accepted" && (
                              <Badge className="bg-success-50 text-success">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                In Roadmap
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-charcoal-700">{rec.description}</p>
                        </div>
                        <div className="flex gap-2">
                          <Badge className={
                            rec.impact === "high" ? "bg-destructive-50 text-destructive" :
                            rec.impact === "medium" ? "bg-warning/10 text-warning" :
                            "bg-success-50 text-success"
                          }>
                            {rec.impact}
                          </Badge>
                          {rec.effort && <Badge variant="outline">{rec.effort}</Badge>}
                        </div>
                      </div>

                      {rec.reasoning && (
                        <div className="mt-3 p-3 bg-primary-50 rounded-lg">
                          <p className="text-xs font-medium mb-1">Development Prompt & RuleBook Context:</p>
                          <p className="text-sm text-charcoal-700 whitespace-pre-wrap">{rec.reasoning}</p>
                        </div>
                      )}

                      <div className="flex gap-2 mt-3">
                        <Button size="sm" variant="outline" onClick={() => handleExpandRecommendation(rec)} disabled={expandingRec === rec.id}>
                          {expandingRec === rec.id ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Expand className="h-3 w-3 mr-1" />}
                          Expand with RuleBook
                        </Button>
                        {rec.status !== "accepted" && (
                          <Button size="sm" variant="outline" onClick={() => setRoadmapDialog({ open: true, rec })}>
                            <Plus className="h-3 w-3 mr-1" />
                            Add to Roadmap
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Quick Reference Tab */}
        <TabsContent value="reference" className="space-y-4">
          {activeTech === "shadcn" && <ShadcnReference />}
          {activeTech === "tailwind" && <TailwindReference />}
          {activeTech === "react" && <ReactReference />}
          {activeTech === "lucide" && <LucideReference />}
          {activeTech === "base44" && <Base44Reference />}
        </TabsContent>

        {/* News Feed Tab */}
        <TabsContent value="news" className="space-y-4">
          <NewsFeed />
        </TabsContent>
      </Tabs>

      {/* Add to Roadmap Dialog */}
      <Dialog open={roadmapDialog.open} onOpenChange={(open) => setRoadmapDialog({ open, rec: roadmapDialog.rec })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add to Roadmap</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Recommendation</Label>
              <p className="text-sm text-charcoal-700 mt-1">{roadmapDialog.rec?.title}</p>
            </div>
            <div>
              <Label>Priority</Label>
              <Select value={roadmapPriority} onValueChange={setRoadmapPriority}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoadmapDialog({ open: false, rec: null })}>Cancel</Button>
            <Button onClick={handleAddToRoadmap}>
              <Plus className="h-4 w-4 mr-2" />
              Add to Roadmap
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}