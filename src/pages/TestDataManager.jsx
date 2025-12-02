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
} from "@/components/ui/dialog";
import { 
  ArrowLeft, Database, Plus, Save, Loader2, Sparkles, Wand2,
  Trash2, Edit, Layout, Zap, Eye, Copy
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { toast } from "sonner";

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
      entitiesUsed = item.working_data?.entities_used || template?.entities_used || [];
    } else if (item.source_type === "feature") {
      const template = featureTemplates.find(t => t.id === item.source_id);
      entitiesUsed = item.working_data?.entities_used || template?.entities_used || [];
    }

    return entitiesUsed.map(name => {
      const entity = entityTemplates.find(e => e.name === name);
      return entity || { name, schema: { properties: {} } };
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
      const allData = {};
      for (const entity of selectedEntities) {
        const schema = entity.schema || {};
        const result = await base44.integrations.Core.InvokeLLM({
          prompt: `Generate 3 realistic sample records for "${entity.name}".
Schema: ${JSON.stringify(schema.properties || {})}
Return as JSON array.`,
          response_json_schema: {
            type: "object",
            properties: {
              records: { type: "array", items: { type: "object" } }
            }
          }
        });
        allData[entity.name] = result.records || [];
      }

      setFormData(prev => ({
        ...prev,
        entity_data: allData
      }));
      toast.success("Generated all test data");
    } catch (error) {
      toast.error("Failed to generate test data");
    } finally {
      setIsGenerating(false);
    }
  };

  const previewableItems = playgroundItems.filter(p => 
    p.source_type === "page" || p.source_type === "feature"
  );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(createPageUrl("LivePreview"))}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Database className="h-6 w-6 text-blue-600" />
              Test Data Manager
            </h1>
            <p className="text-gray-500">Configure test data for live previews</p>
          </div>
        </div>
      </div>

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
            <h2 className="text-lg font-semibold">Test Data Sets</h2>
            <Button onClick={() => openEditor()} disabled={selectedEntities.length === 0}>
              <Plus className="h-4 w-4 mr-2" />
              New Test Data
            </Button>
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
                    <div className="flex gap-2">
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
            <p>Select a page or feature to manage its test data</p>
          </CardContent>
        </Card>
      )}

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
              <Button variant="outline" onClick={generateAllTestData} disabled={isGenerating || selectedEntities.length === 0}>
                {isGenerating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                AI Generate All
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