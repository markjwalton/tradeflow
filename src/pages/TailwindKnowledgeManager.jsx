import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { 
  RefreshCw, Download, Sparkles, Search, ExternalLink,
  CheckCircle2, AlertCircle, Clock, Loader2, BookOpen,
  GitBranch, Zap, FileText, ArrowUp, X
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

const TAILWIND_DOCS_CATEGORIES = [
  { id: "core_concepts", name: "Core Concepts", topics: ["Utility-First", "Hover/Focus States", "Responsive Design", "Dark Mode", "Theme Variables", "Colors", "Custom Styles"] },
  { id: "layout", name: "Layout", topics: ["Aspect Ratio", "Container", "Columns", "Break After", "Break Before", "Break Inside", "Box Decoration", "Box Sizing", "Display", "Floats", "Clear", "Isolation", "Object Fit", "Object Position", "Overflow", "Position", "Visibility", "Z-Index"] },
  { id: "flexbox_grid", name: "Flexbox & Grid", topics: ["Flex Basis", "Flex Direction", "Flex Wrap", "Flex", "Flex Grow", "Flex Shrink", "Order", "Grid Template Columns", "Grid Column Start/End", "Grid Template Rows", "Grid Row Start/End", "Grid Auto Flow", "Grid Auto Columns", "Grid Auto Rows", "Gap", "Justify Content", "Justify Items", "Justify Self", "Align Content", "Align Items", "Align Self", "Place Content", "Place Items", "Place Self"] },
  { id: "spacing", name: "Spacing", topics: ["Padding", "Margin", "Space Between"] },
  { id: "sizing", name: "Sizing", topics: ["Width", "Min-Width", "Max-Width", "Height", "Min-Height", "Max-Height", "Size"] },
  { id: "typography", name: "Typography", topics: ["Font Family", "Font Size", "Font Smoothing", "Font Style", "Font Weight", "Font Variant", "Letter Spacing", "Line Clamp", "Line Height", "List Style Image", "List Style Position", "List Style Type", "Text Align", "Text Color", "Text Decoration", "Text Transform", "Text Overflow", "Text Wrap", "Text Indent", "Vertical Align", "Whitespace", "Word Break", "Hyphens", "Content"] },
  { id: "backgrounds", name: "Backgrounds", topics: ["Background Attachment", "Background Clip", "Background Color", "Background Origin", "Background Position", "Background Repeat", "Background Size", "Background Image", "Gradient Color Stops"] },
  { id: "borders", name: "Borders", topics: ["Border Radius", "Border Width", "Border Color", "Border Style", "Divide Width", "Divide Color", "Divide Style", "Outline Width", "Outline Color", "Outline Style", "Outline Offset", "Ring Width", "Ring Color", "Ring Offset"] },
  { id: "effects", name: "Effects", topics: ["Box Shadow", "Box Shadow Color", "Opacity", "Mix Blend Mode", "Background Blend Mode"] },
  { id: "transitions", name: "Transitions & Animation", topics: ["Transition Property", "Transition Duration", "Transition Timing", "Transition Delay", "Animation"] }
];

export default function TailwindKnowledgeManager() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("releases");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVersion, setSelectedVersion] = useState("4.1");
  const [syncing, setSyncing] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [syncProgress, setSyncProgress] = useState({ current: 0, total: 0, message: "" });

  const { data: releases = [], isLoading: loadingReleases } = useQuery({
    queryKey: ["tailwindReleases"],
    queryFn: () => base44.entities.TailwindRelease.list("-version")
  });

  const { data: knowledge = [], isLoading: loadingKnowledge } = useQuery({
    queryKey: ["tailwindKnowledge", selectedVersion],
    queryFn: () => base44.entities.TailwindKnowledge.filter({ version: selectedVersion })
  });

  const { data: recommendations = [] } = useQuery({
    queryKey: ["packageRecommendations"],
    queryFn: () => base44.entities.PackageUpdateRecommendation.filter({ recommendation_type: "tailwind_update" })
  });

  const createReleaseMutation = useMutation({
    mutationFn: (data) => base44.entities.TailwindRelease.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tailwindReleases"] });
      toast.success("Release added");
    }
  });

  const createKnowledgeMutation = useMutation({
    mutationFn: (data) => base44.entities.TailwindKnowledge.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tailwindKnowledge"] });
    }
  });

  const handleSyncDocs = async () => {
    setSyncing(true);
    const categoriesToSync = TAILWIND_DOCS_CATEGORIES.slice(0, 3); // Start with first 3 categories
    setSyncProgress({ current: 0, total: categoriesToSync.length, message: "Starting sync..." });
    
    try {
      // Use AI to extract knowledge from Tailwind docs
      for (let i = 0; i < categoriesToSync.length; i++) {
        const category = categoriesToSync[i];
        setSyncProgress({ 
          current: i, 
          total: categoriesToSync.length, 
          message: `Syncing ${category.name}...` 
        });
        
        const result = await base44.integrations.Core.InvokeLLM({
          prompt: `Extract Tailwind CSS v${selectedVersion} documentation for the "${category.name}" category.
          
Topics to cover: ${category.topics.join(", ")}

For each topic, provide:
1. A brief description of what it does
2. The most common utility classes with their CSS output
3. One practical code example

Return as JSON array with structure:
{
  "topics": [
    {
      "topic": "string",
      "description": "string", 
      "utility_classes": [{"class_name": "string", "css_output": "string", "description": "string"}],
      "code_example": {"description": "string", "html": "string", "classes_used": ["string"]}
    }
  ]
}`,
          response_json_schema: {
            type: "object",
            properties: {
              topics: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    topic: { type: "string" },
                    description: { type: "string" },
                    utility_classes: { type: "array", items: { type: "object" } },
                    code_example: { type: "object" }
                  }
                }
              }
            }
          }
        });

        // Save each topic to knowledge base
        const topics = result.topics || [];
        for (let t = 0; t < topics.length; t++) {
          const topicData = topics[t];
          setSyncProgress({ 
            current: i, 
            total: categoriesToSync.length, 
            message: `${category.name}: Saving ${topicData.topic} (${t + 1}/${topics.length})` 
          });
          await createKnowledgeMutation.mutateAsync({
            version: selectedVersion,
            category: category.id,
            topic: topicData.topic,
            content: topicData.description,
            utility_classes: topicData.utility_classes,
            code_examples: topicData.code_example ? [topicData.code_example] : [],
            source_url: `https://tailwindcss.com/docs/${topicData.topic.toLowerCase().replace(/\s+/g, "-")}`,
            last_synced: new Date().toISOString()
          });
        }
        setSyncProgress({ 
          current: i + 1, 
          total: categoriesToSync.length, 
          message: `Completed ${category.name}` 
        });
      }
      setSyncProgress({ current: categoriesToSync.length, total: categoriesToSync.length, message: "Complete!" });
      toast.success("Knowledge base synced successfully");
      setTimeout(() => setSyncProgress({ current: 0, total: 0, message: "" }), 2000);
    } catch (error) {
      toast.error("Failed to sync: " + error.message);
      setSyncProgress({ current: 0, total: 0, message: "" });
    }
    setSyncing(false);
  };

  const handleAnalyzeRelease = async (release) => {
    setAnalyzing(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze Tailwind CSS ${release.version} release for a UI component library.

New Features: ${JSON.stringify(release.new_features || [])}
Breaking Changes: ${JSON.stringify(release.breaking_changes || [])}

Our library uses: Sturij Design System with custom color tokens, typography, spacing, and shadcn/ui components.

Provide:
1. Summary of what's new
2. Specific recommendations for our library
3. Impact assessment (high/medium/low)
4. Priority updates we should make
5. Any components that need updating`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            summary: { type: "string" },
            recommendations: { type: "array", items: { type: "string" } },
            impact_on_library: { type: "string" },
            priority_updates: { type: "array", items: { type: "string" } }
          }
        }
      });

      await base44.entities.TailwindRelease.update(release.id, {
        ai_analysis: result,
        status: "reviewed"
      });

      queryClient.invalidateQueries({ queryKey: ["tailwindReleases"] });
      toast.success("Analysis complete");
    } catch (error) {
      toast.error("Analysis failed: " + error.message);
    }
    setAnalyzing(false);
  };

  const handleCheckNewReleases = async () => {
    setSyncing(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `What is the latest Tailwind CSS version as of today? Include:
1. Version number
2. Release date (approximate)
3. Major new features (up to 5)
4. Any breaking changes
5. Link to changelog if known`,
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

      // Check if we already have this version
      const existing = releases.find(r => r.version === result.version);
      if (!existing) {
        await createReleaseMutation.mutateAsync({
          version: result.version,
          release_date: result.release_date,
          new_features: result.new_features,
          breaking_changes: result.breaking_changes,
          changelog_url: result.changelog_url,
          is_major: result.version.endsWith(".0"),
          status: "new"
        });
        toast.success(`Found new release: Tailwind ${result.version}`);
      } else {
        toast.info(`Already tracking Tailwind ${result.version}`);
      }
    } catch (error) {
      toast.error("Failed to check releases: " + error.message);
    }
    setSyncing(false);
  };

  const filteredKnowledge = knowledge.filter(k => 
    !searchQuery || 
    k.topic?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    k.content?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedKnowledge = filteredKnowledge.reduce((acc, item) => {
    const cat = item.category || "other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  return (
    <div className="p-6 bg-[var(--color-background)] min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-heading text-[var(--color-midnight)] flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-[var(--color-primary)]" />
            Tailwind Knowledge Manager
          </h1>
          <p className="text-[var(--color-charcoal)]">
            Keep your UI library current with Tailwind CSS updates
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleCheckNewReleases} disabled={syncing}>
            {syncing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Check for Updates
          </Button>
          <Button 
            onClick={handleSyncDocs} 
            disabled={syncing}
            className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white"
          >
            {syncing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
            Sync Documentation
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      {syncProgress.total > 0 && (
        <div className="mb-4 p-4 bg-white border border-[var(--color-background-muted)] rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-[var(--color-primary)]" />
              <span className="text-sm font-medium text-[var(--color-midnight)]">
                {syncProgress.message}
              </span>
            </div>
            <span className="text-sm text-[var(--color-charcoal)]">
              {syncProgress.current} / {syncProgress.total} categories
            </span>
          </div>
          <Progress 
            value={(syncProgress.current / syncProgress.total) * 100} 
            className="h-2"
          />
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="releases" className="gap-1">
            <GitBranch className="h-4 w-4" />
            Releases
          </TabsTrigger>
          <TabsTrigger value="knowledge" className="gap-1">
            <FileText className="h-4 w-4" />
            Knowledge Base
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="gap-1">
            <Sparkles className="h-4 w-4" />
            AI Recommendations
          </TabsTrigger>
        </TabsList>

        {/* Releases Tab */}
        <TabsContent value="releases" className="space-y-4">
          {loadingReleases ? (
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-[var(--color-charcoal)]" />
            </div>
          ) : releases.length === 0 ? (
            <Card className="border-[var(--color-background-muted)]">
              <CardContent className="py-12 text-center">
                <GitBranch className="h-12 w-12 mx-auto mb-4 text-[var(--color-charcoal)]" />
                <h3 className="text-lg font-medium text-[var(--color-midnight)]">No Releases Tracked</h3>
                <p className="text-[var(--color-charcoal)] mt-2">Click "Check for Updates" to find the latest Tailwind CSS releases</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {releases.map((release) => (
                <Card key={release.id} className="border-[var(--color-background-muted)]">
                  <CardHeader className="flex flex-row items-start justify-between">
                    <div>
                      <CardTitle className="text-[var(--color-midnight)] flex items-center gap-2">
                        Tailwind CSS v{release.version}
                        {release.is_major && (
                          <Badge className="bg-[var(--color-primary)]/20 text-[var(--color-primary)]">Major</Badge>
                        )}
                        <Badge className={
                          release.status === "new" ? "bg-[var(--color-warning)]/20 text-[var(--color-warning-dark)]" :
                          release.status === "reviewed" ? "bg-[var(--color-info)]/20 text-[var(--color-info)]" :
                          release.status === "adopted" ? "bg-[var(--color-success)]/20 text-[var(--color-success)]" :
                          "bg-[var(--color-charcoal)]/20 text-[var(--color-charcoal)]"
                        }>
                          {release.status}
                        </Badge>
                      </CardTitle>
                      <p className="text-sm text-[var(--color-charcoal)]">
                        Released: {release.release_date || "Unknown"}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {release.changelog_url && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={release.changelog_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Changelog
                          </a>
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        onClick={() => handleAnalyzeRelease(release)}
                        disabled={analyzing}
                        className="bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-dark)] text-white"
                      >
                        {analyzing ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Sparkles className="h-3 w-3 mr-1" />}
                        Analyze Impact
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* New Features */}
                    {release.new_features?.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-[var(--color-midnight)] mb-2 flex items-center gap-1">
                          <Zap className="h-4 w-4 text-[var(--color-success)]" />
                          New Features
                        </h4>
                        <div className="grid md:grid-cols-2 gap-2">
                          {release.new_features.map((feature, idx) => (
                            <div key={idx} className="p-2 bg-[var(--color-background)] rounded-lg">
                              <p className="font-medium text-sm text-[var(--color-midnight)]">{feature.name}</p>
                              <p className="text-xs text-[var(--color-charcoal)]">{feature.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* AI Analysis */}
                    {release.ai_analysis && (
                      <div className="p-4 bg-[var(--color-primary)]/5 rounded-lg border border-[var(--color-primary)]/20">
                        <h4 className="text-sm font-medium text-[var(--color-midnight)] mb-2 flex items-center gap-1">
                          <Sparkles className="h-4 w-4 text-[var(--color-primary)]" />
                          AI Analysis
                        </h4>
                        <p className="text-sm text-[var(--color-charcoal)] mb-3">{release.ai_analysis.summary}</p>
                        
                        {release.ai_analysis.priority_updates?.length > 0 && (
                          <div className="mb-2">
                            <p className="text-xs font-medium text-[var(--color-midnight)] mb-1">Priority Updates:</p>
                            <ul className="text-xs text-[var(--color-charcoal)] space-y-1">
                              {release.ai_analysis.priority_updates.map((update, i) => (
                                <li key={i} className="flex items-start gap-1">
                                  <ArrowUp className="h-3 w-3 mt-0.5 text-[var(--color-warning)]" />
                                  {update}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        <Badge className={
                          release.ai_analysis.impact_on_library?.includes("high") ? "bg-[var(--color-destructive)]/20 text-[var(--color-destructive)]" :
                          release.ai_analysis.impact_on_library?.includes("medium") ? "bg-[var(--color-warning)]/20 text-[var(--color-warning-dark)]" :
                          "bg-[var(--color-success)]/20 text-[var(--color-success)]"
                        }>
                          Impact: {release.ai_analysis.impact_on_library || "Unknown"}
                        </Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Knowledge Base Tab */}
        <TabsContent value="knowledge" className="space-y-4">
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-charcoal)]" />
              <Input
                placeholder="Search knowledge base..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedVersion} onValueChange={setSelectedVersion}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="4.1">v4.1</SelectItem>
                <SelectItem value="4.0">v4.0</SelectItem>
                <SelectItem value="3.4">v3.4</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loadingKnowledge ? (
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-[var(--color-charcoal)]" />
            </div>
          ) : Object.keys(groupedKnowledge).length === 0 ? (
            <Card className="border-[var(--color-background-muted)]">
              <CardContent className="py-12 text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 text-[var(--color-charcoal)]" />
                <h3 className="text-lg font-medium text-[var(--color-midnight)]">No Knowledge Synced</h3>
                <p className="text-[var(--color-charcoal)] mt-2">Click "Sync Documentation" to extract Tailwind CSS knowledge</p>
              </CardContent>
            </Card>
          ) : (
            <ScrollArea className="h-[600px]">
              <div className="space-y-6">
                {Object.entries(groupedKnowledge).map(([category, items]) => (
                  <Card key={category} className="border-[var(--color-background-muted)]">
                    <CardHeader>
                      <CardTitle className="text-[var(--color-midnight)] capitalize">
                        {category.replace(/_/g, " ")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-3">
                        {items.map((item) => (
                          <div key={item.id} className="p-3 bg-[var(--color-background)] rounded-lg">
                            <h4 className="font-medium text-[var(--color-midnight)]">{item.topic}</h4>
                            <p className="text-sm text-[var(--color-charcoal)] line-clamp-2">{item.content}</p>
                            {item.utility_classes?.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {item.utility_classes.slice(0, 4).map((uc, i) => (
                                  <code key={i} className="text-xs px-1.5 py-0.5 bg-[var(--color-midnight)] text-white rounded">
                                    {uc.class_name}
                                  </code>
                                ))}
                                {item.utility_classes.length > 4 && (
                                  <span className="text-xs text-[var(--color-charcoal)]">+{item.utility_classes.length - 4} more</span>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </TabsContent>

        {/* AI Recommendations Tab */}
        <TabsContent value="recommendations">
          <Card className="border-[var(--color-background-muted)]">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-[var(--color-midnight)]">AI-Generated Recommendations</CardTitle>
              <Button 
                onClick={handleGenerateRecommendations}
                disabled={analyzing || releases.length === 0}
                className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white"
              >
                {analyzing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                Generate Recommendations
              </Button>
            </CardHeader>
            <CardContent>
              {recommendations.length === 0 ? (
                <div className="text-center py-8">
                  <Sparkles className="h-12 w-12 mx-auto mb-4 text-[var(--color-charcoal)]" />
                  <p className="text-[var(--color-charcoal)]">
                    {releases.length === 0 
                      ? "Check for releases first, then generate recommendations"
                      : "Click 'Generate Recommendations' to analyze releases for your UI library"
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recommendations.map((rec) => (
                    <div key={rec.id} className="p-4 border border-[var(--color-background-muted)] rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-[var(--color-midnight)]">{rec.title}</h4>
                          <p className="text-sm text-[var(--color-charcoal)]">{rec.description}</p>
                        </div>
                        <Badge className={
                          rec.impact === "high" ? "bg-[var(--color-destructive)]/20 text-[var(--color-destructive)]" :
                          rec.impact === "medium" ? "bg-[var(--color-warning)]/20 text-[var(--color-warning-dark)]" :
                          "bg-[var(--color-success)]/20 text-[var(--color-success)]"
                        }>
                          {rec.impact} impact
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}