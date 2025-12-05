import React, { useState, useMemo, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Database, Loader2, Sparkles, Layout, Zap, Play,
  CheckCircle2, AlertTriangle, Clock, FlaskConical, 
  RefreshCw, Eye, XCircle, GitBranch, Settings,
  RotateCcw, Trash2, Link2, Link2Off
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";
import { testingDataService } from "@/components/testing/TestingDataService";

// Helper: safely get nested property
const get = (obj, key) => obj?.data?.[key] ?? obj?.[key];

export default function TestingHub() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("items");
  const [operation, setOperation] = useState({ type: null, progress: 0, total: 0, message: "" });
  const [filter, setFilter] = useState("all");

  // Data Queries
  const { data: playgroundItems = [], isLoading: loadingPlayground, refetch: refetchPlayground } = useQuery({
    queryKey: ["playgroundItems"],
    queryFn: () => base44.entities.PlaygroundItem.list("-created_date"),
  });

  const { data: testDataSets = [], isLoading: loadingTestData, refetch: refetchTestData } = useQuery({
    queryKey: ["testData"],
    queryFn: () => base44.entities.TestData.list("-created_date"),
  });

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

  // Refresh all data
  const refreshData = useCallback(() => {
    refetchPlayground();
    refetchTestData();
  }, [refetchPlayground, refetchTestData]);

  // Build unified view with relationship status
  const items = useMemo(() => {
    const previewable = playgroundItems.filter(p => {
      const type = get(p, "source_type");
      return type === "page" || type === "feature";
    });

    return previewable.map(item => {
      const type = get(item, "source_type");
      const name = get(item, "source_name");
      const sourceId = get(item, "source_id");
      const syncStatus = get(item, "sync_status") || "synced";
      
      // Find entities used
      let entitiesUsed = [];
      const workingData = get(item, "working_data");
      if (type === "page") {
        const template = pageTemplates.find(t => t.id === sourceId);
        entitiesUsed = workingData?.entities_used || get(template, "entities_used") || [];
      } else if (type === "feature") {
        const template = featureTemplates.find(t => t.id === sourceId);
        entitiesUsed = workingData?.entities_used || get(template, "entities_used") || [];
      }

      // Find test data by LIBRARY source_id (stable link)
      const testData = testDataSets.find(td => {
        const tdSourceId = get(td, "source_id");
        const tdSourceType = get(td, "source_type");
        return tdSourceId === sourceId && tdSourceType === type;
      });
      
      const entityData = get(testData, "entity_data") || {};
      const recordCount = Object.values(entityData).reduce(
        (sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0), 0
      );
      const testStatus = get(testData, "test_status") || "pending";
      const testDataVersion = get(testData, "version") || 1;
      const previousVersions = get(testData, "previous_versions") || [];

      return {
        id: item.id,
        sourceId,
        name,
        type,
        syncStatus,
        entityCount: entitiesUsed.length,
        recordCount,
        hasTestData: !!testData,
        testDataId: testData?.id,
        testStatus,
        testDataVersion,
        canRollback: previousVersions.length > 0,
        entities: entitiesUsed.map(eName => {
          const entity = entityTemplates.find(e => get(e, "name") === eName);
          return { name: eName, schema: get(entity, "schema") || {} };
        })
      };
    });
  }, [playgroundItems, testDataSets, entityTemplates, pageTemplates, featureTemplates]);

  // Stats
  const stats = useMemo(() => {
    const withData = items.filter(i => i.hasTestData).length;
    const verified = items.filter(i => i.testStatus === "verified").length;
    const pending = items.filter(i => i.hasTestData && i.testStatus === "pending").length;
    const orphaned = items.filter(i => i.syncStatus === "orphaned").length;
    return { total: items.length, withData, noData: items.length - withData, verified, pending, orphaned };
  }, [items]);

  // Filtered items
  const filteredItems = useMemo(() => {
    switch (filter) {
      case "noData": return items.filter(i => !i.hasTestData);
      case "pending": return items.filter(i => i.hasTestData && i.testStatus === "pending");
      case "verified": return items.filter(i => i.testStatus === "verified");
      case "orphaned": return items.filter(i => i.syncStatus === "orphaned");
      default: return items;
    }
  }, [items, filter]);

  // BULK VERIFY with rate limiting
  const bulkVerify = async () => {
    const toVerify = items.filter(i => i.hasTestData && i.testDataId && i.testStatus !== "verified");
    if (toVerify.length === 0) {
      toast.info("Nothing to verify");
      return;
    }

    setOperation({ type: "verify", progress: 0, total: toVerify.length, message: "Verifying..." });

    const results = await testingDataService.bulkVerify(
      toVerify.map(i => i.testDataId),
      (progress, total) => {
        setOperation(prev => ({ ...prev, progress, total }));
      }
    );

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    if (failCount > 0) {
      toast.warning(`${successCount} verified, ${failCount} failed`);
    } else {
      toast.success(`${successCount} items verified`);
    }

    setOperation({ type: null, progress: 0, total: 0, message: "" });
    refreshData();
  };

  // SINGLE VERIFY
  const verifySingle = async (item) => {
    if (!item.testDataId) return;
    try {
      await testingDataService.verifyTestData(item.testDataId);
      toast.success(`${item.name} verified`);
      refreshData();
    } catch (e) {
      toast.error("Failed: " + e.message);
    }
  };

  // GENERATE TEST DATA
  const generateTestData = async (item) => {
    setOperation({ type: "generating", progress: 0, total: 1, message: `Generating for ${item.name}...` });
    
    try {
      let entityData = {};
      let entitySchemas = {};
      
      if (item.entities.length > 0) {
        // Build schema snapshot
        item.entities.forEach(e => {
          entitySchemas[e.name] = e.schema;
        });
        
        const result = await base44.integrations.Core.InvokeLLM({
          prompt: `Generate realistic test data for "${item.name}". Create 3 records for EACH entity:
${item.entities.map(e => `Entity: ${e.name}\nSchema: ${JSON.stringify(e.schema?.properties || {})}`).join('\n---\n')}
Return JSON with entity names as keys and arrays of records as values.`,
          response_json_schema: {
            type: "object",
            properties: {
              data: { type: "object", additionalProperties: { type: "array", items: { type: "object" } } }
            }
          }
        });
        entityData = result.data || {};
      }

      await testingDataService.upsertTestData(
        item.type,
        item.sourceId,
        item.name,
        entityData,
        {
          playgroundItemId: item.id,
          entitySchemas,
          generationMethod: "ai_generated"
        }
      );

      toast.success(`Generated test data for ${item.name}`);
      refreshData();
    } catch (e) {
      toast.error("Generation failed: " + e.message);
    }
    
    setOperation({ type: null, progress: 0, total: 0, message: "" });
  };

  // BULK GENERATE TEST DATA
  const bulkGenerate = async () => {
    const toGenerate = items.filter(i => !i.hasTestData);
    if (toGenerate.length === 0) {
      toast.info("All items have test data");
      return;
    }

    setOperation({ type: "generating", progress: 0, total: toGenerate.length, message: "Generating test data..." });

    let success = 0, failed = 0;
    
    for (let i = 0; i < toGenerate.length; i++) {
      const item = toGenerate[i];
      setOperation(prev => ({ ...prev, progress: i + 1, message: `Generating for ${item.name}...` }));
      
      try {
        let entityData = {};
        
        if (item.entities.length > 0) {
          const result = await base44.integrations.Core.InvokeLLM({
            prompt: `Generate realistic test data for "${item.name}". Create 3 records for EACH entity:
${item.entities.map(e => `Entity: ${e.name}\nSchema: ${JSON.stringify(e.schema?.properties || {})}`).join('\n---\n')}
Return JSON with entity names as keys and arrays of records as values.`,
            response_json_schema: {
              type: "object",
              properties: {
                data: { type: "object", additionalProperties: { type: "array", items: { type: "object" } } }
              }
            }
          });
          entityData = result.data || {};
        }

        await base44.entities.TestData.create({
          source_type: item.type,
          source_id: item.sourceId,
          source_name: item.name,
          name: "Default Test Data",
          entity_data: entityData,
          is_default: true,
          test_status: "pending",
          generation_method: "ai_generated"
        });
        
        success++;
      } catch (e) {
        console.error(`Failed for ${item.name}:`, e);
        failed++;
      }
      
      // Rate limit delay
      await new Promise(r => setTimeout(r, 1000));
    }

    if (failed > 0) {
      toast.warning(`Generated ${success}, failed ${failed}`);
    } else {
      toast.success(`Generated test data for ${success} items`);
    }
    
    setOperation({ type: null, progress: 0, total: 0, message: "" });
    refreshData();
  };

  // CLEAR ALL PLAYGROUND
  const clearAllPlayground = async () => {
    if (!confirm("Clear all playground items? Test data will be preserved.")) return;
    
    setOperation({ type: "clearing", progress: 0, total: playgroundItems.length, message: "Clearing playground..." });
    
    try {
      let deleted = 0;
      for (const item of playgroundItems) {
        await base44.entities.PlaygroundItem.delete(item.id);
        deleted++;
        setOperation(prev => ({ ...prev, progress: deleted }));
      }
      toast.success(`Cleared ${deleted} items`);
      refreshData();
    } catch (e) {
      toast.error("Clear failed: " + e.message);
    }
    
    setOperation({ type: null, progress: 0, total: 0, message: "" });
  };

  // SYNC FROM LIBRARY
  const syncFromLibrary = async (sourceType) => {
    setOperation({ type: "syncing", progress: 0, total: 0, message: `Syncing ${sourceType}s from library...` });
    
    try {
      const templates = sourceType === "page" ? pageTemplates : featureTemplates;
      
      // Get existing playground items for this type
      const existingItems = playgroundItems.filter(p => get(p, "source_type") === sourceType);
      const existingBySourceId = new Map();
      existingItems.forEach(item => {
        const sid = get(item, "source_id");
        if (sid) existingBySourceId.set(sid, item);
      });
      
      let created = 0, updated = 0;
      
      for (let i = 0; i < templates.length; i++) {
        const template = templates[i];
        setOperation(prev => ({ ...prev, progress: i + 1, total: templates.length }));
        
        const existing = existingBySourceId.get(template.id);
        
        if (existing) {
          // UPDATE existing
          await base44.entities.PlaygroundItem.update(existing.id, {
            source_name: template.name,
            working_data: template,
            sync_status: "synced",
            last_sync_date: new Date().toISOString()
          });
          updated++;
        } else {
          // CREATE new
          await base44.entities.PlaygroundItem.create({
            source_type: sourceType,
            source_id: template.id,
            source_name: template.name,
            working_data: template,
            item_origin: "library",
            sync_status: "synced",
            last_sync_date: new Date().toISOString(),
            status: "synced"
          });
          created++;
        }
        
        await new Promise(r => setTimeout(r, 50)); // Small delay
      }

      toast.success(`Synced: ${created} new, ${updated} updated`);
      refreshData();
    } catch (e) {
      toast.error("Sync failed: " + e.message);
    }
    
    setOperation({ type: null, progress: 0, total: 0, message: "" });
  };

  const isLoading = loadingPlayground || loadingTestData;
  const isOperating = !!operation.type;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 bg-[var(--color-background)]">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--color-charcoal)]" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-[var(--color-background)] min-h-screen">
      {/* Header */}
      <Card className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-midnight)] text-white border-0">
        <CardContent className="py-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <FlaskConical className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold font-heading">Testing Hub v2</h1>
                <p className="text-white/80 mt-1">Robust data management with preserved relationships</p>
                <div className="flex gap-3 mt-4">
                  <Badge className="bg-white/20">{stats.total} Items</Badge>
                  <Badge className="bg-green-500/80">{stats.verified} Verified</Badge>
                  <Badge className="bg-amber-500/80">{stats.pending} Pending</Badge>
                  <Badge className="bg-red-500/80">{stats.noData} No Data</Badge>
                  {stats.orphaned > 0 && (
                    <Badge className="bg-purple-500/80">{stats.orphaned} Orphaned</Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="icon" onClick={refreshData} disabled={isOperating}>
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button 
                onClick={bulkVerify}
                disabled={isOperating || stats.pending === 0}
                className="bg-white text-[var(--color-primary)] hover:bg-white/90"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Verify All ({stats.pending})
              </Button>
              <Button 
                onClick={bulkGenerate}
                disabled={isOperating || stats.noData === 0}
                className="bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-dark)] text-white"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Generate All ({stats.noData})
              </Button>
              <Button 
                variant="destructive"
                onClick={clearAllPlayground}
                disabled={isOperating || stats.total === 0}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Operation Progress */}
      {isOperating && (
        <Card className="border-[var(--color-primary)]/30 bg-[var(--color-primary)]/5">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-[var(--color-primary)]" />
              <div className="flex-1">
                <p className="font-medium text-[var(--color-midnight)]">{operation.message}</p>
                {operation.total > 0 && (
                  <div className="mt-2">
                    <Progress value={(operation.progress / operation.total) * 100} className="h-2" />
                    <p className="text-sm text-[var(--color-charcoal)] mt-1">
                      {operation.progress} / {operation.total}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="items">Test Items</TabsTrigger>
          <TabsTrigger value="data">Test Data</TabsTrigger>
          <TabsTrigger value="sync">Sync & Relationships</TabsTrigger>
        </TabsList>

        {/* Items Tab */}
        <TabsContent value="items" className="space-y-4">
          {/* Filters */}
          <div className="flex gap-2">
            {[
              { key: "all", label: "All", count: stats.total },
              { key: "noData", label: "No Data", count: stats.noData, color: "text-red-600" },
              { key: "pending", label: "Pending", count: stats.pending, color: "text-amber-600" },
              { key: "verified", label: "Verified", count: stats.verified, color: "text-green-600" },
            ].map(f => (
              <Button
                key={f.key}
                variant={filter === f.key ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(f.key)}
                className={filter !== f.key ? f.color : ""}
              >
                {f.label} ({f.count})
              </Button>
            ))}
          </div>

          {/* Items Table */}
          <Card className="border-[var(--color-background-muted)]">
            <CardContent className="p-0">
              {filteredItems.length === 0 ? (
                <div className="text-center py-12 text-[var(--color-charcoal)]">
                  <CheckCircle2 className="h-10 w-10 mx-auto mb-2 text-green-500" />
                  <p>No items in this category</p>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-[var(--color-background)]">
                    <tr>
                      <th className="text-left p-3">Type</th>
                      <th className="text-left p-3">Name</th>
                      <th className="text-center p-3">Link</th>
                      <th className="text-center p-3">Entities</th>
                      <th className="text-center p-3">Records</th>
                      <th className="text-center p-3">Status</th>
                      <th className="text-right p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-background-muted)]">
                    {filteredItems.map(item => (
                      <tr key={item.id} className="hover:bg-[var(--color-background)]">
                        <td className="p-3">
                          {item.type === "page" ? (
                            <Layout className="h-4 w-4 text-blue-600" />
                          ) : (
                            <Zap className="h-4 w-4 text-amber-600" />
                          )}
                        </td>
                        <td className="p-3 font-medium text-[var(--color-midnight)]">{item.name}</td>
                        <td className="p-3 text-center">
                          {item.syncStatus === "orphaned" ? (
                            <Link2Off className="h-4 w-4 mx-auto text-purple-500" title="Orphaned" />
                          ) : (
                            <Link2 className="h-4 w-4 mx-auto text-green-500" title="Linked" />
                          )}
                        </td>
                        <td className="p-3 text-center text-[var(--color-charcoal)]">{item.entityCount}</td>
                        <td className="p-3 text-center text-[var(--color-charcoal)]">
                          {item.recordCount}
                          {item.canRollback && (
                            <RotateCcw className="h-3 w-3 inline ml-1 text-[var(--color-charcoal)]" title="Has versions" />
                          )}
                        </td>
                        <td className="p-3 text-center">
                          {!item.hasTestData ? (
                            <Badge className="bg-red-100 text-red-700">No Data</Badge>
                          ) : item.testStatus === "verified" ? (
                            <Badge className="bg-green-100 text-green-700">Verified</Badge>
                          ) : (
                            <Badge className="bg-amber-100 text-amber-700">Pending</Badge>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex justify-end gap-1">
                            <Link to={createPageUrl("LivePreview") + `?id=${item.id}`} target="_blank">
                              <Button size="sm" variant="ghost"><Eye className="h-4 w-4" /></Button>
                            </Link>
                            {!item.hasTestData && (
                              <Button size="sm" variant="ghost" onClick={() => generateTestData(item)} disabled={isOperating}>
                                <Sparkles className="h-4 w-4" />
                              </Button>
                            )}
                            {item.hasTestData && item.testStatus !== "verified" && (
                              <Button size="sm" variant="ghost" onClick={() => verifySingle(item)} disabled={isOperating}>
                                <CheckCircle2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Test Data Tab */}
        <TabsContent value="data" className="space-y-4">
          <Card className="border-[var(--color-background-muted)]">
            <CardHeader>
              <CardTitle className="text-[var(--color-midnight)]">Test Data Records</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                {testDataSets.length === 0 ? (
                  <p className="text-center py-8 text-[var(--color-charcoal)]">No test data yet</p>
                ) : (
                  <div className="space-y-3">
                    {testDataSets.map(td => {
                      const entityData = get(td, "entity_data") || {};
                      const recordCount = Object.values(entityData).reduce((s, a) => s + (Array.isArray(a) ? a.length : 0), 0);
                      const version = get(td, "version") || 1;
                      const prevVersions = get(td, "previous_versions") || [];
                      
                      return (
                        <div key={td.id} className="p-4 border border-[var(--color-background-muted)] rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-[var(--color-midnight)]">{get(td, "source_name")}</p>
                              <p className="text-sm text-[var(--color-charcoal)]">
                                {get(td, "source_type")} • {recordCount} records • v{version}
                                {prevVersions.length > 0 && ` (${prevVersions.length} previous)`}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={
                                get(td, "test_status") === "verified" ? "bg-green-100 text-green-700" :
                                get(td, "test_status") === "stale" ? "bg-purple-100 text-purple-700" :
                                "bg-amber-100 text-amber-700"
                              }>
                                {get(td, "test_status")}
                              </Badge>
                              <Badge variant="outline">{get(td, "generation_method") || "ai"}</Badge>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sync Tab */}
        <TabsContent value="sync" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="border-[var(--color-background-muted)]">
              <CardHeader>
                <CardTitle className="text-[var(--color-midnight)] flex items-center gap-2">
                  <Layout className="h-5 w-5 text-blue-600" />
                  Pages
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-[var(--color-charcoal)] mb-4">
                  {pageTemplates.length} pages in library
                </p>
                <Button onClick={() => syncFromLibrary("page")} disabled={isOperating}>
                  <GitBranch className="h-4 w-4 mr-2" />
                  Sync from Library
                </Button>
              </CardContent>
            </Card>

            <Card className="border-[var(--color-background-muted)]">
              <CardHeader>
                <CardTitle className="text-[var(--color-midnight)] flex items-center gap-2">
                  <Zap className="h-5 w-5 text-amber-600" />
                  Features
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-[var(--color-charcoal)] mb-4">
                  {featureTemplates.length} features in library
                </p>
                <Button onClick={() => syncFromLibrary("feature")} disabled={isOperating}>
                  <GitBranch className="h-4 w-4 mr-2" />
                  Sync from Library
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card className="border-[var(--color-background-muted)]">
            <CardHeader>
              <CardTitle className="text-[var(--color-midnight)]">Relationship Architecture</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-[var(--color-charcoal)] space-y-4">
                <div className="p-4 bg-[var(--color-background)] rounded-lg font-mono text-xs">
                  <pre>{`
Library Templates (Source of Truth)
├── EntityTemplate
├── PageTemplate  ─────────────────┐
└── FeatureTemplate ───────────────┼──→ source_id (stable key)
                                   │
PlaygroundItem (Working Copy) ←────┘
├── source_id → Library
├── sync_status: synced | outdated | orphaned
└── working_data (local copy)

TestData (Test Artifacts) ←── Linked by source_id, NOT playground_id!
├── source_id → Library (STABLE)
├── playground_item_id → Current session (optional)
├── entity_data → Mock records
├── previous_versions → Rollback history
└── test_status: pending | verified | stale
                  `}</pre>
                </div>
                <p>
                  <strong>Key Design:</strong> TestData links to Library source_id, not PlaygroundItem.id. 
                  This means clearing/resyncing playground does NOT delete test data.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}