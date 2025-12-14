import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Play, Search, Database, Layout, Zap, CheckCircle2, XCircle, 
  Circle, Loader2, RefreshCw, Eye, Lightbulb, ArrowRight, Edit,
  FlaskConical, Beaker, Trash2, AlertTriangle
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { toast } from "sonner";
import { PageHeader } from "@/components/sturij";

const statusIcons = {
  passed: <CheckCircle2 className="h-4 w-4 text-success" />,
  failed: <XCircle className="h-4 w-4 text-destructive" />,
  pending: <Circle className="h-4 w-4 text-muted-foreground" />,
  skipped: <Circle className="h-4 w-4 text-warning" />,
};

const typeIcons = {
  entity: <Database className="h-4 w-4 text-accent" />,
  page: <Layout className="h-4 w-4 text-info" />,
  feature: <Zap className="h-4 w-4 text-warning" />,
};

const itemStatusColors = {
  synced: "bg-muted text-muted-foreground",
  modified: "bg-info-50 text-info",
  testing: "bg-warning/10 text-warning",
  ready: "bg-success-50 text-success",
  promoted: "bg-accent-100 text-accent",
};

export default function PlaygroundSummary() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [activeTab, setActiveTab] = useState("overview");
  const [isSyncing, setIsSyncing] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [syncProgress, setSyncProgress] = useState({ current: 0, total: 0 });
  const [clearProgress, setClearProgress] = useState({ current: 0, total: 0 });

  const { data: playgroundItems = [], isLoading } = useQuery({
    queryKey: ["playgroundItems"],
    queryFn: () => base44.entities.PlaygroundItem.list("-created_date"),
  });

  const { data: conceptItems = [] } = useQuery({
    queryKey: ["conceptItems"],
    queryFn: () => base44.entities.ConceptItem.list("-created_date"),
  });

  const { data: entityTemplates = [], isLoading: loadingEntities } = useQuery({
    queryKey: ["entityTemplates"],
    queryFn: () => base44.entities.EntityTemplate.filter({ is_custom: false }),
  });

  const { data: pageTemplates = [], isLoading: loadingPages } = useQuery({
    queryKey: ["pageTemplates"],
    queryFn: () => base44.entities.PageTemplate.filter({ is_custom: false }),
  });

  const { data: featureTemplates = [], isLoading: loadingFeatures } = useQuery({
    queryKey: ["featureTemplates"],
    queryFn: () => base44.entities.FeatureTemplate.filter({ is_custom: false }),
  });

  const allLoading = isLoading || loadingEntities || loadingPages || loadingFeatures;

  // Helper: delay between API calls to avoid rate limits
  const delay = (ms) => new Promise(r => setTimeout(r, ms));

  // Clear all playground data
  const clearPlaygroundData = async () => {
    setIsClearing(true);
    setClearProgress({ current: 0, total: 0 });
    try {
      // Get all items to delete
      const allItems = await base44.entities.PlaygroundItem.list();
      const allTestData = await base44.entities.TestData.list();
      const total = allItems.length + allTestData.length;
      setClearProgress({ current: 0, total });
      
      let deleted = 0;
      
      // Delete all PlaygroundItems with delay
      for (const item of allItems) {
        await base44.entities.PlaygroundItem.delete(item.id);
        deleted++;
        setClearProgress({ current: deleted, total });
        await delay(100); // 100ms between deletes
      }
      
      // Delete all TestData with delay
      for (const td of allTestData) {
        await base44.entities.TestData.delete(td.id);
        deleted++;
        setClearProgress({ current: deleted, total });
        await delay(100);
      }
      
      queryClient.invalidateQueries({ queryKey: ["playgroundItems"] });
      queryClient.invalidateQueries({ queryKey: ["testData"] });
      toast.success("Playground data cleared");
    } catch (error) {
      toast.error("Failed to clear: " + error.message);
    } finally {
      setIsClearing(false);
      setClearProgress({ current: 0, total: 0 });
    }
  };

  // Sync library items to playground - checks by source_id to avoid duplicates
  const syncLibraryToPlayground = async () => {
    setIsSyncing(true);
    setSyncProgress({ current: 0, total: 0 });
    let added = 0;
    let failed = 0;

    // Get existing source_ids to prevent duplicates
    const existingSourceIds = new Set(
      playgroundItems.map(p => p.source_id)
    );

    const allTemplates = [
      ...entityTemplates.filter(t => !t.custom_project_id).map(t => ({ ...t, _type: "entity" })),
      ...pageTemplates.filter(t => !t.custom_project_id).map(t => ({ ...t, _type: "page" })),
      ...featureTemplates.filter(t => !t.custom_project_id).map(t => ({ ...t, _type: "feature" })),
    ].filter(t => !existingSourceIds.has(t.id));

    setSyncProgress({ current: 0, total: allTemplates.length });

    if (allTemplates.length === 0) {
      toast.info("Playground is up to date with library");
      setIsSyncing(false);
      return;
    }

    for (let i = 0; i < allTemplates.length; i++) {
      const template = allTemplates[i];
      
      // Retry logic for rate limits
      let retries = 3;
      let success = false;
      
      while (retries > 0 && !success) {
        try {
          await base44.entities.PlaygroundItem.create({
            source_type: template._type,
            source_id: template.id,
            source_name: template.name,
            group: template.group || template.category,
            item_origin: "library",
            status: "synced",
            current_version: 1,
            test_definition: generateDefaultTests(template._type, template),
          });
          added++;
          success = true;
        } catch (e) {
          if (e.message?.includes("Rate limit") && retries > 1) {
            // Wait longer on rate limit
            await delay(2000);
            retries--;
          } else {
            console.error("Failed to sync:", template.name, e.message);
            failed++;
            break;
          }
        }
      }
      
      setSyncProgress({ current: i + 1, total: allTemplates.length });
      
      // Add delay between creates to avoid rate limits
      await delay(150);
    }

    queryClient.invalidateQueries({ queryKey: ["playgroundItems"] });
    setIsSyncing(false);
    setSyncProgress({ current: 0, total: 0 });
    
    if (failed > 0) {
      toast.warning(`Synced ${added} items, ${failed} failed`);
    } else {
      toast.success(`Synced ${added} new items from library`);
    }
  };

  const generateDefaultTests = (type, template) => {
    if (type === "entity") {
      return {
        tests: [
          { name: "Has valid name", check: "name" },
          { name: "Has schema defined", check: "schema" },
          { name: "Schema has properties", check: "schema.properties" },
          { name: "Has required fields", check: "schema.required" },
        ]
      };
    } else if (type === "page") {
      return {
        tests: [
          { name: "Has valid name", check: "name" },
          { name: "Has category", check: "category" },
          { name: "Has components defined", check: "components" },
          { name: "Has entities assigned", check: "entities_used" },
          { name: "Has test data set", check: "test_data" },
        ]
      };
    } else if (type === "feature") {
      return {
        tests: [
          { name: "Has valid name", check: "name" },
          { name: "Has description", check: "description" },
          { name: "Has complexity defined", check: "complexity" },
          { name: "Has user stories", check: "user_stories" },
          { name: "Has test data set", check: "test_data" },
        ]
      };
    }
    return { tests: [] };
  };

  // Filter playground items
  const filteredItems = playgroundItems.filter(item => {
    const matchesSearch = item.source_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || item.source_type === filterType;
    const matchesStatus = filterStatus === "all" || item.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  // Items being actively worked on (modified, testing, ready)
  const activeItems = playgroundItems.filter(i => 
    ["modified", "testing", "ready"].includes(i.status)
  );

  // Concepts in progress
  const activeConcepts = conceptItems.filter(c => 
    ["draft", "review", "approved"].includes(c.status)
  );

  // Stats
  const stats = {
    total: playgroundItems.length,
    synced: playgroundItems.filter(i => i.status === "synced").length,
    modified: playgroundItems.filter(i => i.status === "modified").length,
    ready: playgroundItems.filter(i => i.status === "ready").length,
    concepts: conceptItems.filter(c => c.status !== "pushed_to_library").length,
    testsPassed: playgroundItems.filter(i => i.test_status === "passed").length,
    testsFailed: playgroundItems.filter(i => i.test_status === "failed").length,
  };

  const getDetailUrl = (item) => {
    if (item.source_type === "entity") return createPageUrl("PlaygroundEntity") + `?id=${item.id}`;
    if (item.source_type === "page") return createPageUrl("PlaygroundPage") + `?id=${item.id}`;
    if (item.source_type === "feature") return createPageUrl("PlaygroundFeature") + `?id=${item.id}`;
    return "#";
  };

  return (
    <div className="max-w-7xl mx-auto -mt-6 bg-background min-h-screen">
      <PageHeader 
        title="Development Playground"
        description="Test, modify, and validate templates before deployment"
      >
        <div className="flex gap-2">
          <Link to={createPageUrl("LivePreview")}>
            <Button variant="outline">
              <Eye className="h-4 w-4 mr-2" />
              View Live Pages
            </Button>
          </Link>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="text-destructive border-destructive-200 hover:bg-destructive-50" disabled={isClearing || playgroundItems.length === 0}>
                {isClearing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {clearProgress.total > 0 ? `${clearProgress.current}/${clearProgress.total}` : "Clearing..."}
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear All
                  </>
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  Clear Playground Data?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This will delete all {playgroundItems.length} playground items and their test data. 
                  Library templates will not be affected. You can re-sync from library afterwards.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={clearPlaygroundData} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                  Clear All Data
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button variant="outline" onClick={syncLibraryToPlayground} disabled={isSyncing || allLoading}>
            {isSyncing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {syncProgress.total > 0 ? `${syncProgress.current}/${syncProgress.total}` : "Syncing..."}
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Sync Library
              </>
            )}
          </Button>
          <Link to={createPageUrl("ConceptWorkbench")}>
            <Button className="bg-warning hover:bg-warning/90 text-warning-foreground">
              <Lightbulb className="h-4 w-4 mr-2" />
              New Concept
            </Button>
          </Link>
        </div>
      </PageHeader>

      {/* Progress Banner */}
      {(isSyncing || isClearing) && (syncProgress.total > 0 || clearProgress.total > 0) && (
        <Card className="mb-6 border-info/20 bg-info-50">
          <CardContent className="py-4">
            <div className="flex items-center gap-4">
              <Loader2 className="h-5 w-5 animate-spin text-info" />
              <div className="flex-1">
                <div className="flex justify-between mb-1 text-sm">
                  <span className="font-medium">
                    {isSyncing ? "Syncing library items..." : "Clearing playground data..."}
                  </span>
                  <span>
                    {isSyncing 
                      ? `${syncProgress.current} / ${syncProgress.total}`
                      : `${clearProgress.current} / ${clearProgress.total}`
                    }
                  </span>
                </div>
                <Progress 
                  value={isSyncing 
                    ? (syncProgress.current / syncProgress.total) * 100
                    : (clearProgress.current / clearProgress.total) * 100
                  } 
                  className="h-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="playground">
            Playground ({playgroundItems.length})
          </TabsTrigger>
          <TabsTrigger value="concepts">
            Concepts ({activeConcepts.length})
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold text-foreground">{stats.total}</div>
                <div className="text-sm text-muted-foreground">Library Items</div>
              </CardContent>
            </Card>
            <Card className="border-info/30 bg-info-50">
              <CardContent className="pt-4">
                <div className="text-2xl font-bold text-info">{stats.modified}</div>
                <div className="text-sm text-foreground">Being Modified</div>
              </CardContent>
            </Card>
            <Card className="border-success/30 bg-success-50">
              <CardContent className="pt-4">
                <div className="text-2xl font-bold text-success">{stats.ready}</div>
                <div className="text-sm text-primary">Ready to Promote</div>
              </CardContent>
            </Card>
            <Card className="border-warning/30 bg-warning/10">
              <CardContent className="pt-4">
                <div className="text-2xl font-bold text-warning">{stats.concepts}</div>
                <div className="text-sm text-secondary">Active Concepts</div>
              </CardContent>
            </Card>
          </div>

          {/* Active Work Summary */}
          <div className="grid grid-cols-2 gap-6">
            {/* Items Being Worked On */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Edit className="h-5 w-5 text-info" />
                  Items Being Modified ({activeItems.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activeItems.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No items currently being modified</p>
                ) : (
                  <div className="space-y-2">
                    {activeItems.slice(0, 5).map(item => (
                      <Link key={item.id} to={getDetailUrl(item)}>
                        <div className="flex items-center justify-between p-2 rounded hover:bg-muted">
                          <div className="flex items-center gap-2">
                            {typeIcons[item.source_type]}
                            <span className="font-medium">{item.source_name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={itemStatusColors[item.status]}>{item.status}</Badge>
                            {statusIcons[item.test_status]}
                          </div>
                        </div>
                      </Link>
                    ))}
                    {activeItems.length > 5 && (
                      <p className="text-sm text-muted-foreground text-center">+{activeItems.length - 5} more</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Active Concepts */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-warning" />
                  Active Concepts ({activeConcepts.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activeConcepts.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground mb-2">No concepts in progress</p>
                    <Link to={createPageUrl("ConceptWorkbench")}>
                      <Button size="sm" variant="outline">
                        <Lightbulb className="h-4 w-4 mr-2" />
                        Create New Concept
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {activeConcepts.slice(0, 5).map(concept => (
                      <Link key={concept.id} to={createPageUrl("ConceptWorkbench") + `?id=${concept.id}`}>
                        <div className="flex items-center justify-between p-2 rounded hover:bg-muted">
                          <div className="flex items-center gap-2">
                            {typeIcons[concept.item_type]}
                            <span className="font-medium">{concept.name}</span>
                          </div>
                          <Badge variant="outline">{concept.status}</Badge>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Workflow Guide */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Development Workflow</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm">
                <div className="flex flex-col items-center p-4 bg-warning/10 rounded-lg flex-1">
                  <Beaker className="h-8 w-8 text-warning mb-2" />
                  <span className="font-medium">Concept</span>
                  <span className="text-muted-foreground text-xs">New ideas</span>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
                <div className="flex flex-col items-center p-4 bg-accent-100 rounded-lg flex-1">
                  <FlaskConical className="h-8 w-8 text-accent mb-2" />
                  <span className="font-medium">Playground</span>
                  <span className="text-muted-foreground text-xs">Test & refine</span>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
                <div className="flex flex-col items-center p-4 bg-info-50 rounded-lg flex-1">
                  <Database className="h-8 w-8 text-info mb-2" />
                  <span className="font-medium">Library</span>
                  <span className="text-muted-foreground text-xs">Production ready</span>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
                <div className="flex flex-col items-center p-4 bg-success-50 rounded-lg flex-1">
                  <Play className="h-8 w-8 text-success mb-2" />
                  <span className="font-medium">Sprint</span>
                  <span className="text-muted-foreground text-xs">Implementation</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Playground Tab */}
        <TabsContent value="playground" className="space-y-4">
          {/* Filters */}
          <div className="flex gap-4 flex-wrap">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="entity">Entities</SelectItem>
                <SelectItem value="page">Pages</SelectItem>
                <SelectItem value="feature">Features</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="synced">Synced</SelectItem>
                <SelectItem value="modified">Modified</SelectItem>
                <SelectItem value="ready">Ready</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Items Grid */}
          {allLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FlaskConical className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No items match your filters</p>
              <Button variant="outline" className="mt-4" onClick={syncLibraryToPlayground}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Sync from Library
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map(item => (
                <Card key={item.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        {typeIcons[item.source_type]}
                        {item.source_name}
                      </CardTitle>
                      <div className="flex items-center gap-1">
                        <Badge className={itemStatusColors[item.status]}>{item.status}</Badge>
                        {statusIcons[item.test_status]}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                      <span>v{item.current_version || 1}</span>
                      {item.group && <Badge variant="outline">{item.group}</Badge>}
                    </div>
                    <Link to={getDetailUrl(item)}>
                      <Button size="sm" variant="outline" className="w-full">
                        <Eye className="h-3 w-3 mr-2" />
                        Open
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Concepts Tab */}
        <TabsContent value="concepts" className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-muted-foreground">New concepts being developed before adding to playground</p>
            <Link to={createPageUrl("ConceptWorkbench")}>
              <Button>
                <Lightbulb className="h-4 w-4 mr-2" />
                New Concept
              </Button>
            </Link>
          </div>

          {conceptItems.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No concepts yet</p>
              <p className="text-sm mt-1">Create a new entity, page, or feature concept</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {conceptItems.map(concept => (
                <Card key={concept.id} className="hover:shadow-md transition-shadow border-warning/20">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        {typeIcons[concept.item_type]}
                        {concept.name}
                      </CardTitle>
                      <Badge variant="outline">{concept.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{concept.description}</p>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center gap-2 mb-3">
                      {statusIcons[concept.test_status]}
                      <span className="text-xs text-muted-foreground">
                        {concept.test_status === "passed" ? "Tests passed" : 
                         concept.test_status === "failed" ? "Tests failed" : "Not tested"}
                      </span>
                    </div>
                    <Link to={createPageUrl("ConceptWorkbench") + `?id=${concept.id}`}>
                      <Button size="sm" variant="outline" className="w-full">
                        <Edit className="h-3 w-3 mr-2" />
                        Edit Concept
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}