import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  DialogDescription,
} from "@/components/ui/dialog";
import { 
  ArrowLeft, Database, Plus, Save, Loader2, Sparkles, Wand2,
  Trash2, Edit, Layout, Zap, Eye, Copy, CheckCircle2, XCircle, Circle,
  AlertTriangle, Shield, RefreshCw
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { toast } from "sonner";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function TestDataManager() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const preselectedItemId = urlParams.get("item");

  const [selectedItemId, setSelectedItemId] = useState(preselectedItemId || "");
  const [showEditor, setShowEditor] = useState(false);
  const [editingData, setEditingData] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    entity_data: {},
    notes: ""
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [showBulkGeneration, setShowBulkGeneration] = useState(false);
  const [bulkProgress, setBulkProgress] = useState({ current: 0, total: 0, items: [] });
  const [batchSize, setBatchSize] = useState(10);
  const [isInserting, setIsInserting] = useState(false);

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

  // Get entities used by selected item
  const getEntitiesForItem = (itemId) => {
    const item = playgroundItems.find(p => p.id === itemId);
    if (!item) return [];

    let entitiesUsed = [];
    if (item.source_type === "page") {
      const template = pageTemplates.find(t => t.id === item.source_id);
      // Page templates store entities_used in data object
      entitiesUsed = item.working_data?.entities_used || template?.data?.entities_used || template?.entities_used || [];
    } else if (item.source_type === "feature") {
      const template = featureTemplates.find(t => t.id === item.source_id);
      // Feature templates store entities_used in data object
      entitiesUsed = item.working_data?.entities_used || template?.data?.entities_used || template?.entities_used || [];
    }

    return entitiesUsed.map(name => {
      // EntityTemplates store schema in data.schema
      const entity = entityTemplates.find(e => e.name === name || e.data?.name === name);
      if (entity) {
        // Normalize the structure - schema is in entity.data.schema
        return {
          name: entity.data?.name || entity.name || name,
          schema: entity.data?.schema || entity.schema || { properties: {} }
        };
      }
      return { name, schema: { properties: {} } };
    });
  };

  const selectedEntities = selectedItemId ? getEntitiesForItem(selectedItemId) : [];
  const filteredTestData = selectedItemId 
    ? testDataSets.filter(td => td.playground_item_id === selectedItemId)
    : testDataSets;

  const openEditor = (testData = null) => {
    if (testData) {
      setEditingData(testData);
      setFormData({
        name: testData.name,
        entity_data: testData.entity_data || {},
        notes: testData.notes || ""
      });
    } else {
      setEditingData(null);
      // Initialize with empty arrays for each entity
      const initialData = {};
      selectedEntities.forEach(entity => {
        initialData[entity.name] = [];
      });
      setFormData({
        name: "Default Test Data",
        entity_data: initialData,
        notes: ""
      });
    }
    setShowEditor(true);
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (editingData) {
      updateMutation.mutate({ id: editingData.id, data: formData });
    } else {
      createMutation.mutate({
        ...formData,
        playground_item_id: selectedItemId,
        is_default: filteredTestData.length === 0
      });
    }
  };

  const generateTestData = async (entityName, entity) => {
    if (isGenerating) return;
    setIsGenerating(true);

    try {
      const schema = entity.schema || {};
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate 3 realistic sample records for an entity called "${entityName}".

Schema properties: ${JSON.stringify(schema.properties || {}, null, 2)}
Required fields: ${JSON.stringify(schema.required || [])}

Generate realistic, varied test data. Return as a JSON array of 3 objects.`,
        response_json_schema: {
          type: "object",
          properties: {
            records: {
              type: "array",
              items: { type: "object" }
            }
          }
        }
      });

      setFormData(prev => ({
        ...prev,
        entity_data: {
          ...prev.entity_data,
          [entityName]: result.records || []
        }
      }));
      toast.success(`Generated test data for ${entityName}`);
    } catch (error) {
      if (error.message?.includes("Rate limit")) {
        toast.error("Please wait before generating again");
      } else {
        toast.error("Failed to generate test data");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const generateAllTestData = async () => {
    if (isGenerating) return;
    setIsGenerating(true);

    try {
      // Build a combined prompt for all entities for efficiency
      const entitySchemas = selectedEntities.map(entity => {
        // Try to get schema from entity template or working_data
        const schema = entity.schema || entity.working_data?.schema || {};
        return {
          name: entity.name,
          properties: schema.properties || {},
          required: schema.required || []
        };
      });

      // Check if we have any valid schemas
      const hasValidSchemas = entitySchemas.some(e => Object.keys(e.properties).length > 0);
      
      if (!hasValidSchemas) {
        // Generate generic test data if no schemas defined
        toast.info("No entity schemas found - generating generic sample data");
      }

      const prompt = hasValidSchemas 
        ? `Generate realistic test data for a business application. Create 3 sample records for EACH entity below.

Entities to generate data for:
${entitySchemas.map(e => `
Entity: ${e.name}
Properties: ${JSON.stringify(e.properties, null, 2)}
Required fields: ${JSON.stringify(e.required)}
`).join('\n---\n')}

Requirements:
- Generate 3 realistic, varied records per entity
- Fill ALL required fields
- Fill optional fields with realistic data where appropriate
- Use consistent relationships
- Use realistic names, dates, numbers, and statuses

Return as JSON with entity names as keys and arrays of records as values.`
        : `Generate realistic test data for these entities: ${entitySchemas.map(e => e.name).join(", ")}.

For each entity, create 3 sample records with typical fields you'd expect (id, name, description, status, dates, etc.).

Return as JSON with entity names as keys and arrays of records as values.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            data: {
              type: "object",
              additionalProperties: {
                type: "array",
                items: { type: "object" }
              }
            }
          }
        }
      });

      const allData = result.data || result || {};
      
      // Ensure all entities have at least an empty array
      selectedEntities.forEach(entity => {
        if (!allData[entity.name]) {
          allData[entity.name] = [];
        }
      });

      const recordCount = Object.values(allData).reduce((sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0), 0);
      
      if (recordCount === 0) {
        toast.error("AI returned no data - try again");
      } else {
        setFormData(prev => ({
          ...prev,
          entity_data: allData
        }));
        toast.success(`Generated ${recordCount} records for ${Object.keys(allData).length} entities`);
      }
    } catch (error) {
      console.error("AI generation error:", error);
      toast.error("Failed to generate: " + (error.message || "Unknown error"));
    } finally {
      setIsGenerating(false);
    }
  };

  const previewableItems = playgroundItems.filter(p => 
    p.source_type === "page" || p.source_type === "feature"
  );

  return (
    <div className="p-6">

      {/* Item Selector */}
      <Card className="mb-6">
        <CardContent className="pt-4">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium">Select Page/Feature:</label>
            <Select value={selectedItemId} onValueChange={setSelectedItemId}>
              <SelectTrigger className="w-80">
                <SelectValue placeholder="Choose an item..." />
              </SelectTrigger>
              <SelectContent>
                {previewableItems.map(item => (
                  <SelectItem key={item.id} value={item.id}>
                    <div className="flex items-center gap-2">
                      {item.source_type === "page" ? (
                        <Layout className="h-4 w-4 text-blue-600" />
                      ) : (
                        <Zap className="h-4 w-4 text-amber-600" />
                      )}
                      {item.source_name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedItemId && (
              <Link to={createPageUrl("LivePreview") + `?id=${selectedItemId}`}>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  View Preview
                </Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedItemId && (
        <>
          {/* Entities Used */}
          <Card className="mb-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Entities Used ({selectedEntities.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {selectedEntities.map((entity, i) => (
                  <Badge key={i} variant="secondary" className="py-1">
                    <Database className="h-3 w-3 mr-1" />
                    {entity.name}
                  </Badge>
                ))}
                {selectedEntities.length === 0 && (
                  <p className="text-gray-500 text-sm">No entities defined for this item</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Test Data Sets */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold">Test Data Sets</h2>
              <p className="text-sm text-gray-500">For Live Preview testing. Use "Insert to Real DB" to add data to actual entities.</p>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={async () => {
                  openEditor();
                  // Small delay to let the editor open, then auto-generate
                  setTimeout(() => generateAllTestData(), 100);
                }} 
                disabled={selectedEntities.length === 0 || isGenerating}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isGenerating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                AI Generate for Preview
              </Button>
              <Button onClick={() => openEditor()} disabled={selectedEntities.length === 0}>
                <Plus className="h-4 w-4 mr-2" />
                New Test Data
              </Button>
            </div>
          </div>

          {filteredTestData.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No test data configured</p>
                <Button className="mt-4" onClick={() => openEditor()} disabled={selectedEntities.length === 0}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Test Data
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTestData.map(td => (
                <Card key={td.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{td.name}</CardTitle>
                      {td.is_default && <Badge className="bg-green-100 text-green-800">Default</Badge>}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {Object.entries(td.entity_data || {}).map(([name, records]) => (
                        <Badge key={name} variant="outline" className="text-xs">
                          {name}: {Array.isArray(records) ? records.length : 0} records
                        </Badge>
                      ))}
                    </div>
                    {td.notes && <p className="text-sm text-gray-500 mb-3">{td.notes}</p>}
                    <div className="flex flex-wrap gap-2">
                      <Button 
                        size="sm" 
                        className="bg-green-600 hover:bg-green-700"
                        onClick={async () => {
                          const entityData = td.entity_data || {};
                          let totalInserted = 0;
                          let errors = [];
                          
                          for (const [entityName, records] of Object.entries(entityData)) {
                            if (!Array.isArray(records) || records.length === 0) continue;
                            try {
                              await base44.entities[entityName].bulkCreate(records);
                              totalInserted += records.length;
                            } catch (e) {
                              errors.push(`${entityName}: ${e.message}`);
                            }
                          }
                          
                          if (errors.length > 0) {
                            toast.error(`Inserted ${totalInserted} records. Errors: ${errors.join(", ")}`);
                          } else {
                            toast.success(`Inserted ${totalInserted} records into real database`);
                          }
                        }}
                      >
                        <Database className="h-3 w-3 mr-1" />
                        Insert to Real DB
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => openEditor(td)}>
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button size="sm" variant="ghost" className="text-red-500" onClick={() => deleteMutation.mutate(td.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {!selectedItemId && (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="mb-4">Select a page or feature to manage its test data</p>
            <p className="text-sm mb-6">Or generate test data for all playground items at once:</p>
            <Button 
              onClick={() => setShowBulkGeneration(true)}
              disabled={isGenerating}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              AI Generate All Test Data
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Bulk Generation Dialog */}
      <Dialog open={showBulkGeneration} onOpenChange={(o) => !isGenerating && setShowBulkGeneration(o)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              AI Generate All Test Data
            </DialogTitle>
          </DialogHeader>
          
          {bulkProgress.total === 0 ? (
            <div className="space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-amber-800 text-sm font-medium mb-1">For Live Preview Only</p>
                <p className="text-amber-700 text-sm">
                  This generates mock data for the Live Preview feature. To insert data into real database entities, 
                  use the "Insert to Real DB" button on individual test data sets after generation.
                </p>
              </div>
              <p className="text-gray-600">
                Generates test data only for pages/features that don't have test data yet.
                Items are saved immediately - completed items won't be reprocessed if you run again.
              </p>
              
              <div className="flex items-center gap-4 p-3 bg-blue-50 rounded-lg">
                <label className="text-sm font-medium">Batch Size:</label>
                <Select value={batchSize.toString()} onValueChange={(v) => setBatchSize(parseInt(v))}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 items</SelectItem>
                    <SelectItem value="10">10 items</SelectItem>
                    <SelectItem value="25">25 items</SelectItem>
                    <SelectItem value="50">50 items</SelectItem>
                    <SelectItem value="100">100 items</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-xs text-gray-500">Smaller batches are safer but slower</span>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm font-medium mb-2">Items to process (without test data):</p>
                <div className="max-h-60 overflow-y-auto space-y-1">
                  {previewableItems.filter(item => {
                    const entities = getEntitiesForItem(item.id);
                    const hasTestData = testDataSets.some(td => td.playground_item_id === item.id);
                    return entities.length > 0 && !hasTestData;
                  }).map(item => (
                    <div key={item.id} className="flex items-center gap-2 text-sm">
                      {item.source_type === "page" ? (
                        <Layout className="h-3 w-3 text-blue-600" />
                      ) : (
                        <Zap className="h-3 w-3 text-amber-600" />
                      )}
                      {item.source_name}
                    </div>
                  ))}
                  {previewableItems.filter(item => {
                    const entities = getEntitiesForItem(item.id);
                    const hasTestData = testDataSets.some(td => td.playground_item_id === item.id);
                    return entities.length > 0 && !hasTestData;
                  }).length === 0 && (
                    <p className="text-gray-500">All items already have test data!</p>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowBulkGeneration(false)}>
                  Cancel
                </Button>
                <Button 
                  className="bg-purple-600 hover:bg-purple-700"
                  onClick={async () => {
                    const itemsToProcess = previewableItems.filter(item => {
                      const entities = getEntitiesForItem(item.id);
                      const hasTestData = testDataSets.some(td => td.playground_item_id === item.id);
                      return entities.length > 0 && !hasTestData;
                    });
                    
                    if (itemsToProcess.length === 0) {
                      toast.info("All items already have test data");
                      setShowBulkGeneration(false);
                      return;
                    }

                    // Apply batch size limit
                    const batchedItems = itemsToProcess.slice(0, batchSize);
                    const remainingCount = itemsToProcess.length - batchSize;

                    setIsGenerating(true);
                    setBulkProgress({
                      current: 0,
                      total: batchedItems.length,
                      items: batchedItems.map(item => ({
                        id: item.id,
                        name: item.source_name,
                        type: item.source_type,
                        status: "pending"
                      })),
                      remaining: remainingCount > 0 ? remainingCount : 0
                    });

                    let successCount = 0;
                    let errorCount = 0;

                    for (let i = 0; i < batchedItems.length; i++) {
                      const item = batchedItems[i];
                      
                      setBulkProgress(prev => ({
                        ...prev,
                        current: i,
                        items: prev.items.map((it, idx) => 
                          idx === i ? { ...it, status: "processing" } : it
                        )
                      }));

                      const entities = getEntitiesForItem(item.id);
                      const entitySchemas = entities.map(e => ({
                        name: e.name,
                        properties: e.schema?.properties || {},
                        required: e.schema?.required || []
                      }));

                      try {
                        const result = await base44.integrations.Core.InvokeLLM({
                          prompt: `Generate realistic test data for "${item.source_name}". Create 3 records for EACH entity:
${entitySchemas.map(e => `Entity: ${e.name}\nProperties: ${JSON.stringify(e.properties)}`).join('\n---\n')}
Return as JSON with entity names as keys and arrays of records as values.`,
                          response_json_schema: {
                            type: "object",
                            properties: {
                              data: { type: "object", additionalProperties: { type: "array", items: { type: "object" } } }
                            }
                          }
                        });

                        // Save immediately after each successful generation
                        await base44.entities.TestData.create({
                          name: "Default Test Data",
                          playground_item_id: item.id,
                          entity_data: result.data || {},
                          is_default: true
                        });

                        successCount++;
                        
                        // Invalidate after each save so data persists even if page refreshes
                        queryClient.invalidateQueries({ queryKey: ["testData"] });

                        setBulkProgress(prev => ({
                          ...prev,
                          current: i + 1,
                          items: prev.items.map((it, idx) => 
                            idx === i ? { ...it, status: "success" } : it
                          )
                        }));
                      } catch (e) {
                        console.error(`Failed for ${item.source_name}:`, e);
                        errorCount++;
                        setBulkProgress(prev => ({
                          ...prev,
                          current: i + 1,
                          items: prev.items.map((it, idx) => 
                            idx === i ? { ...it, status: "error", error: e.message } : it
                          )
                        }));
                        
                        // Add a small delay after errors to avoid rate limits
                        await new Promise(resolve => setTimeout(resolve, 1000));
                      }
                    }

                    setIsGenerating(false);
                    const remaining = itemsToProcess.length - batchSize;
                    if (remaining > 0) {
                      toast.success(`Batch complete: ${successCount} succeeded, ${errorCount} failed. ${remaining} items remaining - run again to continue.`);
                    } else {
                      toast.success(`All done: ${successCount} succeeded, ${errorCount} failed`);
                    }
                  }}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Start Generation
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Progress Bar */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Progress</span>
                  <span>{bulkProgress.current} / {bulkProgress.total}</span>
                </div>
                <Progress value={(bulkProgress.current / bulkProgress.total) * 100} className="h-3" />
              </div>

              {/* Items List with Status */}
              <div className="max-h-80 overflow-y-auto border rounded-lg">
                {bulkProgress.items.map((item, idx) => (
                  <div 
                    key={item.id} 
                    className={`flex items-center justify-between p-3 border-b last:border-b-0 ${
                      item.status === "processing" ? "bg-blue-50" : 
                      item.status === "success" ? "bg-green-50" :
                      item.status === "error" ? "bg-red-50" : ""
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {item.type === "page" ? (
                        <Layout className="h-4 w-4 text-blue-600" />
                      ) : (
                        <Zap className="h-4 w-4 text-amber-600" />
                      )}
                      <span className="font-medium">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.status === "pending" && (
                        <Circle className="h-4 w-4 text-gray-400" />
                      )}
                      {item.status === "processing" && (
                        <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
                      )}
                      {item.status === "success" && (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      )}
                      {item.status === "error" && (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Done / Continue Buttons */}
              {!isGenerating && (
                <div className="flex justify-between items-center">
                  {bulkProgress.remaining > 0 && (
                    <p className="text-sm text-amber-600">
                      {bulkProgress.remaining} items remaining
                    </p>
                  )}
                  <div className="flex gap-2 ml-auto">
                    <Button 
                      className="bg-green-600 hover:bg-green-700"
                      disabled={isInserting}
                      onClick={async () => {
                        setIsInserting(true);
                        try {
                          // Get all successfully generated items and insert their data
                          const successItems = bulkProgress.items.filter(i => i.status === "success");
                          let totalInserted = 0;
                          let errors = [];
                          
                          // Refetch test data to get the latest
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
                          
                          if (errors.length > 0) {
                            toast.error(`Inserted ${totalInserted} records. Errors: ${errors.slice(0, 3).join(", ")}${errors.length > 3 ? "..." : ""}`);
                          } else if (totalInserted === 0) {
                            toast.warning("No records to insert - generate test data first");
                          } else {
                            toast.success(`Inserted ${totalInserted} records into real database`);
                          }
                        } catch (e) {
                          console.error("Insert error:", e);
                          toast.error("Insert failed: " + e.message);
                        } finally {
                          setIsInserting(false);
                        }
                      }}
                    >
                      {isInserting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Database className="h-4 w-4 mr-2" />}
                      {isInserting ? "Inserting..." : "Insert All to Real DB"}
                    </Button>
                    {bulkProgress.remaining > 0 && (
                      <Button 
                        variant="outline"
                        onClick={() => {
                          setBulkProgress({ current: 0, total: 0, items: [] });
                        }}
                      >
                        Run Next Batch
                      </Button>
                    )}
                    <Button onClick={() => {
                      setShowBulkGeneration(false);
                      setBulkProgress({ current: 0, total: 0, items: [] });
                    }}>
                      Done
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Editor Dialog */}
      <Dialog open={showEditor} onOpenChange={setShowEditor}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>{editingData ? "Edit Test Data" : "New Test Data"}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Default Test Data"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Notes</label>
                <Input
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Optional notes..."
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button 
                onClick={generateAllTestData} 
                disabled={isGenerating || selectedEntities.length === 0}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isGenerating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                AI Generate All Test Data
              </Button>
            </div>

            {/* Entity Data Editors */}
            {selectedEntities.map(entity => (
              <Card key={entity.name}>
                <CardHeader className="py-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Database className="h-4 w-4 text-purple-600" />
                      {entity.name}
                      <Badge variant="outline">
                        {(formData.entity_data[entity.name] || []).length} records
                      </Badge>
                    </CardTitle>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => generateTestData(entity.name, entity)}
                      disabled={isGenerating}
                    >
                      <Wand2 className="h-3 w-3 mr-1" />
                      Generate
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <Textarea
                    value={JSON.stringify(formData.entity_data[entity.name] || [], null, 2)}
                    onChange={(e) => {
                      try {
                        const parsed = JSON.parse(e.target.value);
                        setFormData(prev => ({
                          ...prev,
                          entity_data: { ...prev.entity_data, [entity.name]: parsed }
                        }));
                      } catch {}
                    }}
                    rows={6}
                    className="font-mono text-sm"
                    placeholder="[]"
                  />
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowEditor(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending}>
              {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}