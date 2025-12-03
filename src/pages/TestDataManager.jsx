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
  Clock, Target, FlaskConical, Settings, X
} from "lucide-react";
import { toast } from "sonner";

// Import professional components
import TestDataDashboard from "@/components/test-data/TestDataDashboard";
import TestDataStatusTable from "@/components/test-data/TestDataStatusTable";
import SeedDataProgress from "@/components/test-data/SeedDataProgress";
import AIQualityReport from "@/components/test-data/AIQualityReport";
import EntitySchemaValidator from "@/components/test-data/EntitySchemaValidator";
import TestDataSettingsDialog from "@/components/test-data/TestDataSettingsDialog";
import TestVerificationDialog from "@/components/test-data/TestVerificationDialog";
import BulkVerificationDialog from "@/components/test-data/BulkVerificationDialog";

export default function TestDataManager() {
  const queryClient = useQueryClient();
  
  // Settings with localStorage persistence
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem("testDataManagerSettings");
    return saved ? JSON.parse(saved) : {
      batchSize: 10,
      recordsPerEntity: 3,
      expandCategoriesByDefault: false,
      compactView: false,
      defaultTab: "overview",
      confirmBeforeSeed: true,
      autoSeedOnGeneration: false
    };
  });
  
  // UI State
  const [activeTab, setActiveTab] = useState(settings.defaultTab || "overview");
  const [filterView, setFilterView] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [editingData, setEditingData] = useState(null);
  const [showValidation, setShowValidation] = useState(false);
  const [validationResults, setValidationResults] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [verifyingItem, setVerifyingItem] = useState(null);
    const [bulkVerificationReport, setBulkVerificationReport] = useState(null);
    const [isVerifyingBulk, setIsVerifyingBulk] = useState(false);
  
  // Save settings to localStorage
  const handleSettingsChange = (newSettings) => {
    setSettings(newSettings);
    localStorage.setItem("testDataManagerSettings", JSON.stringify(newSettings));
  };
  
  // Generation State
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedQueue, setSeedQueue] = useState([]);
  const [seedSuccess, setSeedSuccess] = useState(null);

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

  // Build page/feature status list
  const itemStatusList = useMemo(() => {
    // Get entities for an item (inline to avoid stale closure)
    const getEntitiesForItem = (item) => {
      if (!item) return [];

      let entitiesUsed = [];
      if (item.source_type === "page") {
            const sourceId = item.source_id || item.data?.source_id;
            const template = pageTemplates.find(t => t.id === sourceId);
            entitiesUsed = item.working_data?.entities_used 
              || item.data?.working_data?.entities_used
              || template?.data?.entities_used 
              || [];
      } else if (item.source_type === "feature") {
            const sourceId = item.source_id || item.data?.source_id;
            const template = featureTemplates.find(t => t.id === sourceId);
            entitiesUsed = item.working_data?.entities_used 
              || item.data?.working_data?.entities_used
              || template?.data?.entities_used 
              || [];
      }

      // Debug: log what we found
      if (entitiesUsed.length === 0) {
        console.log(`No entities found for ${item.source_name}:`, {
          source_type: item.source_type,
          source_id: item.source_id,
          working_data: item.working_data,
          templateFound: item.source_type === "page" 
            ? pageTemplates.find(t => t.id === item.source_id)
            : featureTemplates.find(t => t.id === item.source_id)
        });
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

    const previewableItems = playgroundItems.filter(p => 
      p.source_type === "page" || p.source_type === "feature"
    );

    return previewableItems.map(item => {
            const entities = getEntitiesForItem(item);
            const testData = testDataSets.find(td => td.playground_item_id === item.id);
            const recordCount = testData ? 
              Object.values(testData.entity_data || {}).reduce((sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0), 0) : 0;

            // Get test status from TestData record
            const testStatus = testData?.test_status || "pending";

            return {
              id: item.id,
              name: item.source_name,
              type: item.source_type,
              entityCount: entities.length,
              recordCount,
              hasTestData: !!testData,
              testDataId: testData?.id,
              dataStatus: testData ? (recordCount > 0 || entities.length === 0 ? "complete" : "pending") : "missing",
              testStatus: testStatus,
              entities
            };
          });
  }, [playgroundItems, testDataSets, entityTemplates, pageTemplates, featureTemplates]);

  // Calculate stats
      const stats = useMemo(() => {
        const withTestData = itemStatusList.filter(i => i.hasTestData).length;
        const tested = itemStatusList.filter(i => i.testStatus === "verified").length;
        const errors = itemStatusList.filter(i => i.testStatus === "failed").length;

        return {
          total: itemStatusList.length,
          withTestData,
          withoutTestData: itemStatusList.length - withTestData,
          tested,
          pending: withTestData - tested - errors,
          errors
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

  // Add items to seed queue when generation completes
  const addToSeedQueue = (items) => {
    setSeedQueue(prev => [...prev, ...items.filter(i => !prev.some(p => p.id === i.id))]);
  };

  // Generate test data for items without data
  const startBulkGeneration = async () => {
    // Debug: Log all items and their test data status
    console.log("All itemStatusList:", itemStatusList.slice(0, 5).map(i => ({
      name: i.name, 
      hasTestData: i.hasTestData, 
      testDataId: i.testDataId
    })));
    console.log("testDataSets count:", testDataSets.length);
    
    // Include items even if entityCount is 0 - we'll generate placeholder data
    const itemsToProcess = itemStatusList
      .filter(i => !i.hasTestData)
      .slice(0, settings.batchSize);

    console.log("itemsToProcess", itemsToProcess);

    if (itemsToProcess.length === 0) {
      toast.info("All items already have test data");
      return;
    }

    // Enrich items with entities before starting
    const enrichedItems = itemsToProcess.map(item => ({
      ...item,
      entities: item.entities || getEntitiesForItemById(item.id)
    }));

    console.log("Setting isGenerating to true, enrichedItems:", enrichedItems.length);
    setIsGenerating(true);
    console.log("isGenerating set, setting progress...");
    setGenerationProgress({
      current: 0,
      total: enrichedItems.length,
      items: enrichedItems.map(item => ({
        id: item.id,
        name: item.name,
        type: item.type,
        entityCount: item.entityCount,
        status: "pending"
      })),
      phase: "Generating Test Data"
    });
    
    console.log("Progress set, starting loop...");

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < enrichedItems.length; i++) {
      const item = enrichedItems[i];
      console.log(`Processing item ${i}: ${item.name}, entities:`, item.entities?.length || 0);
      
      setGenerationProgress(prev => ({
        ...prev,
        current: i,
        items: prev.items.map((it, idx) => 
          idx === i ? { ...it, status: "processing" } : it
        )
      }));

      const entities = item.entities || [];
      if (entities.length === 0) {
        console.log(`Item ${item.name} has no entities, creating placeholder`);
        // Create placeholder test data for items without entities
        try {
          await base44.entities.TestData.create({
            name: "Default Test Data",
            playground_item_id: item.id,
            entity_data: {},
            is_default: true,
            test_status: "pending",
            notes: "No entities defined for this item"
          });
          successCount++;
          queryClient.invalidateQueries({ queryKey: ["testData"] });
          setGenerationProgress(prev => ({
            ...prev,
            current: i + 1,
            items: prev.items.map((it, idx) => 
              idx === i ? { ...it, status: "success", recordsGenerated: 0 } : it
            )
          }));
        } catch (e) {
          errorCount++;
          setGenerationProgress(prev => ({
            ...prev,
            current: i + 1,
            items: prev.items.map((it, idx) => 
              idx === i ? { ...it, status: "error", error: e.message } : it
            )
          }));
        }
        continue;
      }

      const entitySchemas = entities.map(e => ({
        name: e.name,
        properties: e.schema?.properties || {},
        required: e.schema?.required || []
      }));

      try {
        console.log(`Calling InvokeLLM for ${item.name}...`);
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

        // Add to seed queue
        addToSeedQueue([{ id: item.id, name: item.name }]);

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
      // Clear progress after a delay so user can see final state
      setTimeout(() => {
        setGenerationProgress({ current: 0, total: 0, items: [], phase: "" });
      }, 5000);
      queryClient.invalidateQueries({ queryKey: ["testData"] });
      const remaining = itemStatusList.filter(i => !i.hasTestData).length - settings.batchSize;
      if (remaining > 0) {
        toast.success(`Batch complete: ${successCount} succeeded, ${errorCount} failed. ${remaining} items remaining.`);
      } else {
        toast.success(`Generation complete: ${successCount} succeeded, ${errorCount} failed`);
      }
  };

  // Seed database in batches (background-friendly)
  const seedDatabase = async () => {
    if (seedQueue.length === 0) return;
    
    setIsSeeding(true);
    setSeedSuccess(null);
    
    let totalInserted = 0;
    let entityCount = 0;
    let errors = [];
    const batchSize = 5; // Process 5 items at a time
    
    const allTestData = await base44.entities.TestData.list();
    const itemsToSeed = [...seedQueue];
    
    for (let i = 0; i < itemsToSeed.length; i += batchSize) {
      const batch = itemsToSeed.slice(i, i + batchSize);
      
      for (const item of batch) {
        const testData = allTestData.find(td => td.playground_item_id === item.id);
        if (!testData?.entity_data) continue;
        
        for (const [entityName, records] of Object.entries(testData.entity_data)) {
          if (!Array.isArray(records) || records.length === 0) continue;
          try {
            if (base44.entities[entityName]) {
              await base44.entities[entityName].bulkCreate(records);
              totalInserted += records.length;
              entityCount++;
            } else {
              errors.push(`${entityName}: Entity not found`);
            }
          } catch (e) {
            errors.push(`${entityName}: ${e.message}`);
          }
        }
      }
      
      // Small delay between batches to prevent overwhelming the API
      if (i + batchSize < itemsToSeed.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    setIsSeeding(false);
    setSeedQueue([]); // Clear the queue
    
    if (errors.length > 0) {
      toast.error(`Seeded ${totalInserted} records with some errors`);
    } else if (totalInserted > 0) {
      setSeedSuccess({ totalRecords: totalInserted, entityCount });
    }
  };

  // Handle card clicks
  const handleCardClick = (cardId) => {
    setFilterView(filterView === cardId ? null : cardId);
    setActiveTab("status");
  };

  // Helper to get entities for a single item (for generation)
  const getEntitiesForItemById = (itemId) => {
    const item = playgroundItems.find(p => p.id === itemId);
    if (!item) {
      console.log(`getEntitiesForItemById: item not found for id ${itemId}`);
      return [];
    }

    let entitiesUsed = [];
    if (item.source_type === "page") {
      const template = pageTemplates.find(t => t.id === item.source_id);
      entitiesUsed = item.working_data?.entities_used || template?.data?.entities_used || template?.entities_used || [];
      console.log(`getEntitiesForItemById (page): ${item.source_name}`, { 
        working_data: item.working_data,
        template: template ? { entities_used: template.entities_used, data: template.data } : null,
        entitiesUsed 
      });
    } else if (item.source_type === "feature") {
      const template = featureTemplates.find(t => t.id === item.source_id);
      entitiesUsed = item.working_data?.entities_used || template?.data?.entities_used || template?.entities_used || [];
      console.log(`getEntitiesForItemById (feature): ${item.source_name}`, { 
        working_data: item.working_data,
        template: template ? { entities_used: template.entities_used, data: template.data } : null,
        entitiesUsed 
      });
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

  // Handle single item generation
  const handleGenerateForItem = async (item) => {
    setIsGenerating(true);
    
    const entities = item.entities || getEntitiesForItemById(item.id);
    const entitySchemas = entities.map(e => ({
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

      // Add to seed queue
      addToSeedQueue([{ id: item.id, name: item.name }]);

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
              <div className="flex gap-2">
                <Button variant="secondary" onClick={runValidation} className="bg-white text-purple-700 hover:bg-purple-50">
                                        <Shield className="h-4 w-4 mr-2" />
                                        Validate Schemas
                                      </Button>
                                      <Button 
                                        variant="secondary" 
                                        onClick={() => setIsVerifyingBulk(true)}
                                        disabled={stats.withTestData === 0}
                                        className="bg-white text-purple-700 hover:bg-purple-50"
                                      >
                                        <Play className="h-4 w-4 mr-2" />
                                        Bulk Verify ({stats.withTestData})
                                      </Button>
                <Button 
                  variant="secondary" 
                  onClick={() => setShowSettings(true)} 
                  className="bg-white/20 hover:bg-white/30 text-white"
                  size="icon"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
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

              {/* Seed Database Button or Success Notification */}
              {seedSuccess ? (
                <div className="flex items-center gap-2 bg-green-500 text-white px-3 py-2 rounded-lg">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    Seeded {seedSuccess.totalRecords} records
                  </span>
                  <button 
                    onClick={() => setSeedSuccess(null)}
                    className="ml-auto hover:bg-green-600 rounded p-0.5"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : seedQueue.length > 0 && (
                <Button 
                  onClick={seedDatabase}
                  disabled={isSeeding}
                  className="bg-green-500 hover:bg-green-600 text-white"
                >
                  {isSeeding ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Database className="h-4 w-4 mr-2" />
                  )}
                  Seed Database ({seedQueue.length} items)
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dashboard Cards */}
      <TestDataDashboard stats={stats} onCardClick={handleCardClick} />

      {/* Progress Card - Shows when generating or has progress items */}
          {(isGenerating || generationProgress.items.length > 0) && (
            <SeedDataProgress
          isRunning={isGenerating}
          progress={generationProgress}
          onRetry={() => {
            const failedItems = generationProgress.items.filter(i => i.status === "error");
            toast.info(`Retry for ${failedItems.length} failed items coming soon`);
          }}
          seedQueueCount={seedQueue.length}
        />
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="status">Page Status</TabsTrigger>
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
              defaultExpanded={settings.expandCategoriesByDefault}
            />

            {/* Recently Generated */}
            <TestDataStatusTable
              items={itemStatusList}
              title="Pending Verification"
              description="Test data generated but not yet verified"
              filter={(i) => i.hasTestData && i.testStatus !== "verified"}
              onRunTest={(item) => setVerifyingItem(item)}
              defaultExpanded={settings.expandCategoriesByDefault}
            />
          </div>
        </TabsContent>

        <TabsContent value="status">
          <TestDataStatusTable
            items={getFilteredItems()}
            title={filterView ? `Filtered: ${filterView}` : "All Pages & Features"}
            description={filterView ? "Click dashboard cards to change filter" : "Complete status of all testable items"}
            onGenerateData={handleGenerateForItem}
            onRunTest={(item) => setVerifyingItem(item)}
            groupByCategory={true}
            defaultExpanded={settings.expandCategoriesByDefault}
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

      {/* Settings Dialog */}
      <TestDataSettingsDialog
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onSettingsChange={handleSettingsChange}
      />

      {/* Verification Dialog */}
                  <TestVerificationDialog
                    isOpen={!!verifyingItem}
                    onClose={() => setVerifyingItem(null)}
                    item={verifyingItem}
                    testData={testDataSets.find(td => td.playground_item_id === verifyingItem?.id)}
                    entityTemplates={entityTemplates}
                    onVerified={() => {
                      queryClient.invalidateQueries({ queryKey: ["testData"] });
                      setVerifyingItem(null);
                    }}
                  />

                  {/* Bulk Verification Dialog */}
                  <BulkVerificationDialog
                    isOpen={isVerifyingBulk}
                    onClose={() => setIsVerifyingBulk(false)}
                    items={itemStatusList}
                    testDataSets={testDataSets}
                    entityTemplates={entityTemplates}
                    onComplete={() => {
                      queryClient.invalidateQueries({ queryKey: ["testData"] });
                    }}
                  />
    </div>
  );
}