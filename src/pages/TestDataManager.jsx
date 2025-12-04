import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  Database, Loader2, Sparkles, Layout, Zap, Play,
  CheckCircle2, AlertTriangle, Clock, Target, FlaskConical, 
  Settings, RefreshCw, Eye, XCircle
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

// Helper: safely get nested or flat property (single source of truth)
// Data from API comes with properties inside 'data' object
const get = (obj, key) => {
  if (!obj) return undefined;
  // First check data.key, then top-level key
  return obj.data?.[key] ?? obj[key];
};

export default function TestDataManager() {
  const queryClient = useQueryClient();
  
  // Simple state
  const [operation, setOperation] = useState({ type: null, progress: 0, total: 0, results: [] });
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

  // Build unified item list - SINGLE SOURCE OF TRUTH
  // TestData is now linked to LIBRARY items (source_id) not playground items
  const items = useMemo(() => {
    // Filter to pages and features only
    const previewable = playgroundItems.filter(p => {
      const type = get(p, "source_type");
      return type === "page" || type === "feature";
    });

    return previewable.map(item => {
      const type = get(item, "source_type");
      const name = get(item, "source_name");
      const sourceId = get(item, "source_id"); // This is the library template ID
      
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

      // Find test data by LIBRARY source_id (persists across playground syncs)
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

      return {
        id: item.id,
        sourceId, // Library template ID
        name,
        type,
        entityCount: entitiesUsed.length,
        recordCount,
        hasTestData: !!testData,
        testDataId: testData?.id,
        testStatus,
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
    return {
      total: items.length,
      withData,
      noData: items.length - withData,
      verified,
      pending
    };
  }, [items]);

  // Filtered items
  const filteredItems = useMemo(() => {
    switch (filter) {
      case "noData": return items.filter(i => !i.hasTestData);
      case "pending": return items.filter(i => i.hasTestData && i.testStatus === "pending");
      case "verified": return items.filter(i => i.testStatus === "verified");
      default: return items;
    }
  }, [items, filter]);

  // Refresh all data
  const refreshData = () => {
    refetchPlayground();
    refetchTestData();
  };

  // BULK VERIFY - with rate limit handling
  const bulkVerify = async () => {
    const toVerify = items.filter(i => i.hasTestData && i.testStatus !== "verified");
    if (toVerify.length === 0) {
      toast.info("Nothing to verify");
      return;
    }

    console.log("Starting bulk verify for", toVerify.length, "items");
    console.log("Items to verify:", toVerify.map(i => ({ name: i.name, testDataId: i.testDataId })));

    setOperation({ type: "verify", progress: 0, total: toVerify.length, results: [] });
    
    const results = [];
    const BATCH_SIZE = 5;
    const DELAY_BETWEEN_BATCHES = 2000; // 2 seconds between batches to avoid rate limit

    for (let i = 0; i < toVerify.length; i += BATCH_SIZE) {
      const batch = toVerify.slice(i, i + BATCH_SIZE);
      console.log(`Processing batch ${i / BATCH_SIZE + 1}, items:`, batch.map(b => b.name));
      
      for (const item of batch) {
        if (!item.testDataId) {
          console.log(`Skipping ${item.name} - no testDataId`);
          results.push({ id: item.id, name: item.name, success: false, error: "No test data ID" });
          setOperation(prev => ({ ...prev, progress: results.length, results: [...results] }));
          continue;
        }
        
        try {
          console.log(`Updating ${item.name} (testDataId: ${item.testDataId})`);
          await base44.entities.TestData.update(item.testDataId, { test_status: "verified" });
          console.log(`Success: ${item.name}`);
          results.push({ id: item.id, name: item.name, success: true });
        } catch (e) {
          console.log(`Failed: ${item.name}`, e.message);
          results.push({ id: item.id, name: item.name, success: false, error: e.message });
        }
        setOperation(prev => ({ ...prev, progress: results.length, results: [...results] }));
      }

      // Wait between batches to avoid rate limit
      if (i + BATCH_SIZE < toVerify.length) {
        console.log("Waiting 2 seconds before next batch...");
        await new Promise(r => setTimeout(r, DELAY_BETWEEN_BATCHES));
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;
    
    console.log(`Bulk verify complete: ${successCount} success, ${failCount} failed`);
    
    if (failCount > 0) {
      toast.warning(`${successCount} verified, ${failCount} failed`);
    } else {
      toast.success(`${successCount} items verified`);
    }

    setOperation({ type: "complete", progress: results.length, total: toVerify.length, results });
    refreshData();
  };

  // SINGLE VERIFY
  const verifySingle = async (item) => {
    if (!item.testDataId) {
      toast.error("No test data to verify");
      return;
    }
    try {
      await base44.entities.TestData.update(item.testDataId, { test_status: "verified" });
      toast.success(`${item.name} verified`);
      refreshData();
    } catch (e) {
      toast.error("Failed: " + e.message);
    }
  };

  // GENERATE TEST DATA - linked to library source, not playground item
  const generateTestData = async (item) => {
    setOperation({ type: "generating", progress: 0, total: 1, results: [], currentItem: item.name });
    
    try {
      if (item.entities.length === 0) {
        // No entities - create placeholder linked to library source
        await base44.entities.TestData.create({
          source_type: item.type,
          source_id: item.sourceId,
          source_name: item.name,
          name: "Default Test Data",
          entity_data: {},
          is_default: true,
          test_status: "pending"
        });
      } else {
        // Generate with AI
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

        await base44.entities.TestData.create({
          source_type: item.type,
          source_id: item.sourceId,
          source_name: item.name,
          name: "Default Test Data",
          entity_data: result.data || {},
          is_default: true,
          test_status: "pending"
        });
      }

      toast.success(`Generated test data for ${item.name}`);
      refreshData();
    } catch (e) {
      toast.error("Generation failed: " + e.message);
    }
    
    setOperation({ type: null, progress: 0, total: 0, results: [] });
  };

  // Close operation panel
  const closeOperation = () => {
    setOperation({ type: null, progress: 0, total: 0, results: [] });
  };

  const isLoading = loadingPlayground || loadingTestData;
  const isOperating = operation.type === "verify" || operation.type === "generating";

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
                <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>Test Data Manager</h1>
                <p className="text-white/80 mt-1">Manage test data for pages and features</p>
                <div className="flex gap-3 mt-4">
                  <Badge className="bg-white/20">{stats.total} Items</Badge>
                  <Badge className="bg-green-500/80">{stats.verified} Verified</Badge>
                  <Badge className="bg-amber-500/80">{stats.pending} Pending</Badge>
                  <Badge className="bg-red-500/80">{stats.noData} No Data</Badge>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="icon" onClick={refreshData}>
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button 
                onClick={bulkVerify}
                disabled={isOperating || stats.pending === 0}
                className="bg-white text-purple-700 hover:bg-purple-50"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Verify All ({stats.pending})
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Operation Progress */}
      {(operation.type === "verify" || operation.type === "complete") && (
        <Card className={operation.type === "complete" ? "border-green-200 bg-green-50" : ""}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                {operation.type === "verify" ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                )}
                {operation.type === "verify" ? "Verifying..." : "Verification Complete"}
              </CardTitle>
              {operation.type === "complete" && (
                <Button variant="ghost" size="sm" onClick={closeOperation}>Close</Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>{operation.progress} / {operation.total}</span>
                <span>{Math.round((operation.progress / operation.total) * 100)}%</span>
              </div>
              <Progress value={(operation.progress / operation.total) * 100} />
              
              {operation.type === "complete" && operation.results.some(r => !r.success) && (
                <div className="mt-3 max-h-40 overflow-auto border rounded p-2 bg-white">
                  <p className="text-sm font-medium text-red-600 mb-2">Failed Items:</p>
                  {operation.results.filter(r => !r.success).map((r, i) => (
                    <div key={i} className="text-sm text-red-600">• {r.name}: {r.error}</div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

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
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">
            {filter === "all" ? "All Items" : `${filter.charAt(0).toUpperCase() + filter.slice(1)} Items`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredItems.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle2 className="h-10 w-10 mx-auto mb-2 text-green-500" />
              <p>No items in this category</p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-3">Type</th>
                    <th className="text-left p-3">Name</th>
                    <th className="text-center p-3">Entities</th>
                    <th className="text-center p-3">Records</th>
                    <th className="text-center p-3">Status</th>
                    <th className="text-right p-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredItems.map(item => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="p-3">
                        {item.type === "page" ? (
                          <Layout className="h-4 w-4 text-blue-600" />
                        ) : (
                          <Zap className="h-4 w-4 text-amber-600" />
                        )}
                      </td>
                      <td className="p-3 font-medium">{item.name}</td>
                      <td className="p-3 text-center">{item.entityCount}</td>
                      <td className="p-3 text-center">{item.recordCount}</td>
                      <td className="p-3 text-center">
                        {!item.hasTestData ? (
                          <Badge variant="destructive" className="gap-1">
                            <XCircle className="h-3 w-3" /> No Data
                          </Badge>
                        ) : item.testStatus === "verified" ? (
                          <Badge className="bg-green-100 text-green-700 gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Verified
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="gap-1">
                            <Clock className="h-3 w-3" /> Pending
                          </Badge>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex justify-end gap-1">
                          <Link to={createPageUrl("LivePreview") + `?id=${item.id}`} target="_blank">
                            <Button size="sm" variant="ghost" title="Preview">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          {!item.hasTestData && (
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => generateTestData(item)}
                              disabled={isOperating}
                              title="Generate Data"
                            >
                              <Sparkles className="h-4 w-4" />
                            </Button>
                          )}
                          {item.hasTestData && item.testStatus !== "verified" && (
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => verifySingle(item)}
                              disabled={isOperating}
                              title="Verify"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}