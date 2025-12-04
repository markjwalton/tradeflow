import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

const statusIcons = {
  passed: <CheckCircle2 className="h-4 w-4 text-green-600" />,
  failed: <XCircle className="h-4 w-4 text-red-600" />,
  pending: <Circle className="h-4 w-4 text-gray-400" />,
  skipped: <Circle className="h-4 w-4 text-yellow-500" />,
};

const typeIcons = {
  entity: <Database className="h-4 w-4 text-purple-600" />,
  page: <Layout className="h-4 w-4 text-blue-600" />,
  feature: <Zap className="h-4 w-4 text-amber-600" />,
};

const itemStatusColors = {
  synced: "bg-gray-100 text-gray-700",
  modified: "bg-blue-100 text-blue-700",
  testing: "bg-yellow-100 text-yellow-700",
  ready: "bg-green-100 text-green-700",
  promoted: "bg-purple-100 text-purple-700",
};

export default function PlaygroundSummary() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [activeTab, setActiveTab] = useState("overview");
  const [isSyncing, setIsSyncing] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const { data: playgroundItems = [], isLoading } = useQuery({
    queryKey: ["playgroundItems"],
    queryFn: () => base44.entities.PlaygroundItem.list("-created_date"),
  });

  const { data: conceptItems = [] } = useQuery({
    queryKey: ["conceptItems"],
    queryFn: () => base44.entities.ConceptItem.list("-created_date"),
  });

  const { data: entityTemplates = [] } = useQuery({
    queryKey: ["entityTemplates"],
    queryFn: () => base44.entities.EntityTemplate.filter({ is_custom: false }),
  });

  const { data: pageTemplates = [] } = useQuery({
    queryKey: ["pageTemplates"],
    queryFn: () => base44.entities.PageTemplate.filter({ is_custom: false }),
  });

  const { data: featureTemplates = [] } = useQuery({
    queryKey: ["featureTemplates"],
    queryFn: () => base44.entities.FeatureTemplate.filter({ is_custom: false }),
  });

  // Clear all playground data
  const clearPlaygroundData = async () => {
    setIsClearing(true);
    try {
      // Delete all PlaygroundItems
      const allItems = await base44.entities.PlaygroundItem.list();
      for (const item of allItems) {
        await base44.entities.PlaygroundItem.delete(item.id);
      }
      
      // Delete all TestData
      const allTestData = await base44.entities.TestData.list();
      for (const td of allTestData) {
        await base44.entities.TestData.delete(td.id);
      }
      
      queryClient.invalidateQueries({ queryKey: ["playgroundItems"] });
      queryClient.invalidateQueries({ queryKey: ["testData"] });
      toast.success("Playground data cleared");
    } catch (error) {
      toast.error("Failed to clear: " + error.message);
    } finally {
      setIsClearing(false);
    }
  };

  // Sync library items to playground - checks by source_id to avoid duplicates
  const syncLibraryToPlayground = async () => {
    setIsSyncing(true);
    let added = 0;

    // Get existing source_ids to prevent duplicates
    const existingSourceIds = new Set(
      playgroundItems.map(p => p.source_id)
    );

    const BATCH_SIZE = 10;
    const DELAY = 500; // ms between batches

    const allTemplates = [
      ...entityTemplates.filter(t => !t.custom_project_id).map(t => ({ ...t, _type: "entity" })),
      ...pageTemplates.filter(t => !t.custom_project_id).map(t => ({ ...t, _type: "page" })),
      ...featureTemplates.filter(t => !t.custom_project_id).map(t => ({ ...t, _type: "feature" })),
    ].filter(t => !existingSourceIds.has(t.id));

    for (let i = 0; i < allTemplates.length; i += BATCH_SIZE) {
      const batch = allTemplates.slice(i, i + BATCH_SIZE);
      
      for (const template of batch) {
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
        } catch (e) {
          console.error("Failed to sync:", template.name, e.message);
        }
      }
      
      // Delay between batches to avoid rate limits
      if (i + BATCH_SIZE < allTemplates.length) {
        await new Promise(r => setTimeout(r, DELAY));
      }
    }

    queryClient.invalidateQueries({ queryKey: ["playgroundItems"] });
    setIsSyncing(false);
    if (added > 0) {
      toast.success(`Synced ${added} new items from library`);
    } else {
      toast.info("Playground is up to date with library");
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
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FlaskConical className="h-6 w-6 text-purple-600" />
            Development Playground
          </h1>
          <p className="text-gray-500">Test, modify, and validate templates before deployment</p>
        </div>
        <div className="flex gap-2">
          <Link to={createPageUrl("LivePreview")}>
            <Button variant="outline">
              <Eye className="h-4 w-4 mr-2" />
              View Live Pages
            </Button>
          </Link>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" disabled={isClearing || playgroundItems.length === 0}>
                {isClearing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
                Clear All
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  Clear Playground Data?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This will delete all {playgroundItems.length} playground items and their test data. 
                  Library templates will not be affected. You can re-sync from library afterwards.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={clearPlaygroundData} className="bg-red-600 hover:bg-red-700">
                  Clear All Data
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button variant="outline" onClick={syncLibraryToPlayground} disabled={isSyncing}>
            {isSyncing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Sync Library
          </Button>
          <Link to={createPageUrl("ConceptWorkbench")}>
            <Button className="bg-amber-600 hover:bg-amber-700">
              <Lightbulb className="h-4 w-4 mr-2" />
              New Concept
            </Button>
          </Link>
        </div>
      </div>

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
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-sm text-gray-500">Library Items</div>
              </CardContent>
            </Card>
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="pt-4">
                <div className="text-2xl font-bold text-blue-700">{stats.modified}</div>
                <div className="text-sm text-blue-600">Being Modified</div>
              </CardContent>
            </Card>
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-4">
                <div className="text-2xl font-bold text-green-700">{stats.ready}</div>
                <div className="text-sm text-green-600">Ready to Promote</div>
              </CardContent>
            </Card>
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="pt-4">
                <div className="text-2xl font-bold text-amber-700">{stats.concepts}</div>
                <div className="text-sm text-amber-600">Active Concepts</div>
              </CardContent>
            </Card>
          </div>

          {/* Active Work Summary */}
          <div className="grid grid-cols-2 gap-6">
            {/* Items Being Worked On */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Edit className="h-5 w-5 text-blue-600" />
                  Items Being Modified ({activeItems.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activeItems.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No items currently being modified</p>
                ) : (
                  <div className="space-y-2">
                    {activeItems.slice(0, 5).map(item => (
                      <Link key={item.id} to={getDetailUrl(item)}>
                        <div className="flex items-center justify-between p-2 rounded hover:bg-gray-50">
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
                      <p className="text-sm text-gray-500 text-center">+{activeItems.length - 5} more</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Active Concepts */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-amber-600" />
                  Active Concepts ({activeConcepts.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activeConcepts.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-gray-500 mb-2">No concepts in progress</p>
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
                        <div className="flex items-center justify-between p-2 rounded hover:bg-gray-50">
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
                <div className="flex flex-col items-center p-4 bg-amber-50 rounded-lg flex-1">
                  <Beaker className="h-8 w-8 text-amber-600 mb-2" />
                  <span className="font-medium">Concept</span>
                  <span className="text-gray-500 text-xs">New ideas</span>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400" />
                <div className="flex flex-col items-center p-4 bg-purple-50 rounded-lg flex-1">
                  <FlaskConical className="h-8 w-8 text-purple-600 mb-2" />
                  <span className="font-medium">Playground</span>
                  <span className="text-gray-500 text-xs">Test & refine</span>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400" />
                <div className="flex flex-col items-center p-4 bg-blue-50 rounded-lg flex-1">
                  <Database className="h-8 w-8 text-blue-600 mb-2" />
                  <span className="font-medium">Library</span>
                  <span className="text-gray-500 text-xs">Production ready</span>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400" />
                <div className="flex flex-col items-center p-4 bg-green-50 rounded-lg flex-1">
                  <Play className="h-8 w-8 text-green-600 mb-2" />
                  <span className="font-medium">Sprint</span>
                  <span className="text-gray-500 text-xs">Implementation</span>
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
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
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
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
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
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
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
            <p className="text-gray-500">New concepts being developed before adding to playground</p>
            <Link to={createPageUrl("ConceptWorkbench")}>
              <Button>
                <Lightbulb className="h-4 w-4 mr-2" />
                New Concept
              </Button>
            </Link>
          </div>

          {conceptItems.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No concepts yet</p>
              <p className="text-sm mt-1">Create a new entity, page, or feature concept</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {conceptItems.map(concept => (
                <Card key={concept.id} className="hover:shadow-md transition-shadow border-amber-200">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        {typeIcons[concept.item_type]}
                        {concept.name}
                      </CardTitle>
                      <Badge variant="outline">{concept.status}</Badge>
                    </div>
                    <p className="text-sm text-gray-500">{concept.description}</p>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center gap-2 mb-3">
                      {statusIcons[concept.test_status]}
                      <span className="text-xs text-gray-500">
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