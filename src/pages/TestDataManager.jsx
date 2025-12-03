import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Database, Plus, Save, Loader2, Sparkles, Wand2,
  Trash2, Edit, Layout, Zap, Shield, Play, RefreshCw,
  ChevronDown, ChevronRight, CheckCircle2, AlertTriangle,
  Clock, Target, FlaskConical
} from "lucide-react";
import { toast } from "sonner";

// Import professional components
import TestDataDashboard from "@/components/test-data/TestDataDashboard";
import TestDataStatusTable from "@/components/test-data/TestDataStatusTable";
import SeedDataProgress from "@/components/test-data/SeedDataProgress";
import AIQualityReport from "@/components/test-data/AIQualityReport";
import EntitySchemaValidator from "@/components/test-data/EntitySchemaValidator";

export default function TestDataManager() {
  const queryClient = useQueryClient();
  
  // UI State
  const [activeTab, setActiveTab] = useState("overview");
  const [filterView, setFilterView] = useState(null); // null, "withData", "withoutData", "tested", "pending"
  const [showEditor, setShowEditor] = useState(false);
  const [editingData, setEditingData] = useState(null);
  const [showValidation, setShowValidation] = useState(false);
  const [validationResults, setValidationResults] = useState(null);
  
  // Generation State
  const [isGenerating, setIsGenerating] = useState(false);
  const [isInserting, setIsInserting] = useState(false);
  const [batchSize, setBatchSize] = useState(10);
  const [generationProgress, setGenerationProgress] = useState({
    current: 0,
    total: 0,
    items: [],
    phase: ""
  });
  
  // Form State
  const [formData, setFormData] = useState({
    name: "",
    entity_data: {},
    notes: ""
  });

  // Data Queries
  const { data: playgroundItems = [] } = useQuery({
    queryKey: ["playgroundItems"],
    queryFn: () => base44.entities.PlaygroundItem.list("-created_date"),
  });

  const { data: testDataSets = [], isLoading } = useQuery({
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

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.TestData.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["testData"] });
      toast.success("Test data created");
      setShowEditor(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.TestData.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["testData"] });
      toast.success("Test data updated");
      setShowEditor(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.TestData.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["testData"] });
      toast.success("Test data deleted");
    },
  });

  // Get entities for an item
  const getEntitiesForItem = (itemId) => {
    const item = playgroundItems.find(p => p.id === itemId);
    if (!item) return [];

    let entitiesUsed = [];
    if (item.source_type === "page") {
      const template = pageTemplates.find(t => t.id === item.source_id);
      entitiesUsed = item.working_data?.entities_used || template?.data?.entities_used || template?.entities_used || [];
    } else if (item.source_type === "feature") {
      const template = featureTemplates.find(t => t.id === item.source_id);
      entitiesUsed = item.working_data?.entities_used || template?.data?.entities_used || template?.entities_used || [];
    }

    return entitiesUsed.map(name => {
      const entity = entityTemplates.find(e => e.name === name || e.data?.name === name);
      if (entity) {
        return {
          name: entity.data?.name || entity.name || name,
          schema: entity.data?.schema || entity.schema || { properties: {} }
        };
      }
      return { name, schema: { properties: {} } };
    });
  };

  // Build page/feature status list
  const itemStatusList = useMemo(() => {
    const previewableItems = playgroundItems.filter(p => 
      p.source_type === "page" || p.source_type === "feature"
    );

    return previewableItems.map(item => {
      const entities = getEntitiesForItem(item.id);
      const testData = testDataSets.find(td => td.playground_item_id === item.id);
      const recordCount = testData ? 
        Object.values(testData.entity_data || {}).reduce((sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0), 0) : 0;

      return {
        id: item.id,
        name: item.source_name,
        type: item.source_type,
        entityCount: entities.length,
        recordCount,
        hasTestData: !!testData,
        testDataId: testData?.id,
        dataStatus: testData ? (recordCount > 0 ? "complete" : "pending") : "missing",
        testStatus: testData?.test_status || "pending",
        entities
      };
    });
  }, [playgroundItems, testDataSets, entityTemplates, pageTemplates, featureTemplates]);

  // Calculate stats
  const stats = useMemo(() => {
    const withTestData = itemStatusList.filter(i => i.hasTestData).length;
    const tested = itemStatusList.filter(i => i.testStatus === "verified").length;
    
    return {
      total: itemStatusList.length,
      withTestData,
      withoutTestData: itemStatusList.length - withTestData,
      tested,
      pending: withTestData - tested,
      qualityScore: null // Set by AI analysis
    };
  }, [itemStatusList]);

  // Filter items based on card click
  const getFilteredItems = () => {
    switch (filterView) {
      case "withData": return itemStatusList.filter(i => i.hasTestData);
      case "withoutData": return itemStatusList.filter(i => !i.hasTestData);
      case "tested": return itemStatusList.filter(i => i.testStatus === "verified");
      case "pending": return itemStatusList.filter(i => i.hasTestData && i.testStatus !== "verified");
      default: return itemStatusList;
    }
  };

  // Validate schemas
  const validateSchemas = () => {
    const results = {
      entities: [],
      totalEntities: entityTemplates.length,
      validEntities: 0,
      invalidEntities: 0,
      missingSchemas: 0,
      timestamp: new Date().toISOString()
    };

    entityTemplates.forEach(entity => {
      const name = entity.data?.name || entity.name;
      const schema = entity.data?.schema || entity.schema;
      const properties = schema?.properties || {};
      const propertyCount = Object.keys(properties).length;
      const requiredFields = schema?.required || [];
      
      const validation = {
        name,
        id: entity.id,
        hasSchema: !!schema,
        propertyCount,
        requiredFields: requiredFields.length,
        properties: Object.keys(properties),
        status: propertyCount > 0 ? "valid" : "missing_schema",
        issues: []
      };

      if (!schema) {
        validation.issues.push("No schema defined");
        validation.status = "missing_schema";
        results.missingSchemas++;
      } else if (propertyCount === 0) {
        validation.issues.push("Schema has no properties");
        validation.status = "empty_schema";
        results.missingSchemas++;
      } else {
        results.validEntities++;
      }

      if (validation.status !== "valid") {
        results.invalidEntities++;
      }

      results.entities.push(validation);
    });

    results.entities.sort((a, b) => {
      if (a.status === "valid" && b.status !== "valid") return 1;
      if (a.status !== "valid" && b.status === "valid") return -1;
      return a.name.localeCompare(b.name);
    });

    return results;
  };

  // Generate test data for items without data
  const startBulkGeneration = async () => {
    const itemsToProcess = itemStatusList
      .filter(i => !i.hasTestData && i.entityCount > 0)
      .slice(0, batchSize);

    if (itemsToProcess.length === 0) {
      toast.info("All items already have test data");
      return;
    }

    setIsGenerating(true);
    setActiveTab("progress");
    setGenerationProgress({
      current: 0,
      total: itemsToProcess.length,
      items: itemsToProcess.map(item => ({
        id: item.id,
        name: item.name,
        type: item.type,
        entityCount: item.entityCount,
        status: "pending"
      })),
      phase: "Generating Test Data"
    });

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < itemsToProcess.length; i++) {
      const item = itemsToProcess[i];
      
      setGenerationProgress(prev => ({
        ...prev,
        current: i,
        items: prev.items.map((it, idx) => 
          idx === i ? { ...it, status: "processing" } : it
        )
      }));

      const entitySchemas = item.entities.map(e => ({
        name: e.name,
        properties: e.schema?.properties || {},
        required: e.schema?.required || []
      }));

      try {
        const result = await base44.integrations.Core.InvokeLLM({
          prompt: `Generate realistic test data for "${item.name}". Create 3 records for EACH entity:
${entitySchemas.map(e => `Entity: ${e.name}\nProperties: ${JSON.stringify(e.properties)}`).join('\n---\n')}
Return as JSON with entity names as keys and arrays of records as values.`,
          response_json_schema: {
            type: "object",
            properties: {
              data: { type: "object", additionalProperties: { type: "array", items: { type: "object" } } }
            }
          }
        });

        const entityData = result.data || {};
        const recordsGenerated = Object.values(entityData).reduce((sum, arr) => 
          sum + (Array.isArray(arr) ? arr.length : 0), 0);

        await base44.entities.TestData.create({
          name: "Default Test Data",
          playground_item_id: item.id,
          entity_data: entityData,
          is_default: true,
          test_status: "pending"
        });

        successCount++;
        queryClient.invalidateQueries({ queryKey: ["testData"] });

        setGenerationProgress(prev => ({
          ...prev,
          current: i + 1,
          items: prev.items.map((it, idx) => 
            idx === i ? { ...it, status: "success", recordsGenerated } : it
          )
        }));
      } catch (e) {
        console.error(`Failed for ${item.name}:`, e);
        errorCount++;
        setGenerationProgress(prev => ({
          ...prev,
          current: i + 1,
          items: prev.items.map((it, idx) => 
            idx === i ? { ...it, status: "error", error: e.message } : it
          )
        }));
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    setIsGenerating(false);
    const remaining = itemStatusList.filter(i => !i.hasTestData && i.entityCount > 0).length - batchSize;
    if (remaining > 0) {
      toast.success(`Batch complete: ${successCount} succeeded, ${errorCount} failed. ${remaining} items remaining.`);
    } else {
      toast.success(`Generation complete: ${successCount} succeeded, ${errorCount} failed`);
    }
  };

  // Insert all successful items to real DB
  const insertAllToDb = async () => {
    setIsInserting(true);
    const successItems = generationProgress.items.filter(i => i.status === "success");
    let totalInserted = 0;
    let errors = [];
    
    const allTestData = await base44.entities.TestData.list();
    
    for (const item of successItems) {
      const testData = allTestData.find(td => td.playground_item_id === item.id);
      if (!testData?.entity_data) continue;
      
      for (const [entityName, records] of Object.entries(testData.entity_data)) {
        if (!Array.isArray(records) || records.length === 0) continue;
        try {
          if (base44.entities[entityName]) {
            await base44.entities[entityName].bulkCreate(records);
            totalInserted += records.length;
          } else {
            errors.push(`${entityName}: Entity not found`);
          }
        } catch (e) {
          errors.push(`${entityName}: ${e.message}`);
        }
      }
    }
    
    setIsInserting(false);
    if (errors.length > 0) {
      toast.error(`Inserted ${totalInserted} records. Errors: ${errors.slice(0, 3).join(", ")}`);
    } else if (totalInserted === 0) {
      toast.warning("No records to insert");
    } else {
      toast.success(`Inserted ${totalInserted} records into real database`);
    }
  };

  // Handle card clicks
  const handleCardClick = (cardId) => {
    setFilterView(filterView === cardId ? null : cardId);
    setActiveTab("status");
  };

  // Handle single item generation
  const handleGenerateForItem = async (item) => {
    setIsGenerating(true);
    
    const entitySchemas = item.entities.map(e => ({
      name: e.name,
      properties: e.schema?.properties || {},
      required: e.schema?.required || []
    }));

    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate realistic test data for "${item.name}". Create 3 records for EACH entity:
${entitySchemas.map(e => `Entity: ${e.name}\nProperties: ${JSON.stringify(e.properties)}`).join('\n---\n')}
Return as JSON with entity names as keys and arrays of records as values.`,
        response_json_schema: {
          type: "object",
          properties: {
            data: { type: "object", additionalProperties: { type: "array", items: { type: "object" } } }
          }
        }
      });

      await base44.entities.TestData.create({
        name: "Default Test Data",
        playground_item_id: item.id,
        entity_data: result.data || {},
        is_default: true,
        test_status: "pending"
      });

      queryClient.invalidateQueries({ queryKey: ["testData"] });
      toast.success(`Generated test data for ${item.name}`);
    } catch (e) {
      toast.error("Generation failed: " + e.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // Run validation
  const runValidation = () => {
    const results = validateSchemas();
    setValidationResults(results);
    setShowValidation(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Hero Header */}
      <Card className="bg-gradient-to-r from-purple-600 to-blue-600 text-white border-0">
        <CardContent className="py-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <FlaskConical className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Test Data Manager</h1>
                <p className="text-purple-100 mt-1 max-w-2xl">
                  Comprehensive test data generation and validation for functional & UI testing. 
                  Ensure every page and feature has realistic test data for complete application coverage.
                </p>
                <div className="flex gap-4 mt-4">
                  <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-lg">
                    <Target className="h-4 w-4" />
                    <span className="text-sm font-medium">{stats.total} Pages/Features</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-lg">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="text-sm font-medium">{stats.withTestData} With Data</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-lg">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm font-medium">{stats.withoutTestData} Missing</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Button variant="secondary" onClick={runValidation} className="bg-white text-purple-700 hover:bg-purple-50">
                <Shield className="h-4 w-4 mr-2" />
                Validate Schemas
              </Button>
              <Button 
                onClick={startBulkGeneration}
                disabled={isGenerating || stats.withoutTestData === 0}
                className="bg-white/20 hover:bg-white/30 border-white/30"
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                Generate All Missing
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dashboard Cards */}
      <TestDataDashboard stats={stats} onCardClick={handleCardClick} />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="status">Page Status</TabsTrigger>
          <TabsTrigger value="progress">
            Generation Progress
            {generationProgress.items.length > 0 && (
              <Badge className="ml-2 h-5 px-1.5" variant="secondary">
                {generationProgress.items.filter(i => i.status === "success").length}/{generationProgress.total}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="quality">AI Quality Report</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Items Without Data */}
            <TestDataStatusTable
              items={itemStatusList}
              title="Pages Without Test Data"
              description="These pages need test data generated"
              filter={(i) => !i.hasTestData}
              onGenerateData={handleGenerateForItem}
            />

            {/* Recently Generated */}
            <TestDataStatusTable
              items={itemStatusList}
              title="Pending Verification"
              description="Test data generated but not yet verified"
              filter={(i) => i.hasTestData && i.testStatus !== "verified"}
              onRunTest={(item) => toast.info("Test runner coming soon")}
            />
          </div>
        </TabsContent>

        <TabsContent value="status">
          <TestDataStatusTable
            items={getFilteredItems()}
            title={filterView ? `Filtered: ${filterView}` : "All Pages & Features"}
            description={filterView ? "Click dashboard cards to change filter" : "Complete status of all testable items"}
            onGenerateData={handleGenerateForItem}
            onRunTest={(item) => toast.info("Test runner coming soon")}
          />
        </TabsContent>

        <TabsContent value="progress">
          <SeedDataProgress
            isRunning={isGenerating}
            progress={generationProgress}
            onRetry={() => {
              const failedItems = generationProgress.items.filter(i => i.status === "error");
              toast.info(`Retry for ${failedItems.length} failed items coming soon`);
            }}
            onInsertToDb={insertAllToDb}
            isInserting={isInserting}
          />
        </TabsContent>

        <TabsContent value="quality">
          <AIQualityReport
            testDataSets={testDataSets}
            entityTemplates={entityTemplates}
            onReportGenerated={(report) => {
              // Could update stats.qualityScore here
            }}
          />
        </TabsContent>
      </Tabs>

      {/* Schema Validation Dialog */}
      <EntitySchemaValidator
        isOpen={showValidation}
        onClose={() => setShowValidation(false)}
        validationResults={validationResults}
        onRevalidate={runValidation}
      />
    </div>
  );
}