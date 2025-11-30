import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Database, Layout, Zap, Copy, Check, Save, Loader2, Navigation, Settings } from "lucide-react";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import AppNavigationManager from "@/components/generated-app/AppNavigationManager";
import DependencyResolver from "@/components/generated-app/DependencyResolver";
import SystemFunctionManager from "@/components/generated-app/SystemFunctionManager";

export default function GeneratedSpecDialog({
  open,
  onOpenChange,
  spec,
  mindMap,
}) {
  const [selectedEntities, setSelectedEntities] = useState([]);
  const [copiedJson, setCopiedJson] = useState(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [saveDescription, setSaveDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("entities");
  const [navigationConfig, setNavigationConfig] = useState({ items: [], settings: {} });
  const [systemFunctions, setSystemFunctions] = useState(["navigation-manager"]);
  const [resolvedDependencies, setResolvedDependencies] = useState(null);

  if (!spec) return null;

  const { entities = [], pages = [], features = [] } = spec;

  const toggleEntity = (name) => {
    setSelectedEntities((prev) =>
      prev.includes(name)
        ? prev.filter((n) => n !== name)
        : [...prev, name]
    );
  };

  const selectAllEntities = () => {
    if (selectedEntities.length === entities.length) {
      setSelectedEntities([]);
    } else {
      setSelectedEntities(entities.map((e) => e.name));
    }
  };

  const copySchema = (entity) => {
    navigator.clipboard.writeText(JSON.stringify(entity.schema, null, 2));
    setCopiedJson(entity.name);
    setTimeout(() => setCopiedJson(null), 2000);
    toast.success(`${entity.name} schema copied`);
  };

  const copyAllSchemas = () => {
    const schemas = entities
      .filter((e) => selectedEntities.length === 0 || selectedEntities.includes(e.name))
      .map((e) => ({
        name: e.name,
        description: e.description,
        schema: e.schema
      }));
    navigator.clipboard.writeText(JSON.stringify(schemas, null, 2));
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
    toast.success(`Copied ${schemas.length} entity schemas`);
  };

  const copyFullSpec = () => {
    navigator.clipboard.writeText(JSON.stringify(spec, null, 2));
    toast.success("Full specification copied to clipboard");
  };

  const copyForChat = () => {
    const entitiesToCopy = selectedEntities.length > 0 
      ? entities.filter(e => selectedEntities.includes(e.name))
      : entities;
    
    const message = `Please create these entities for my app:

${entitiesToCopy.map(e => `## ${e.name}
${e.description}

\`\`\`json
${JSON.stringify(e.schema, null, 2)}
\`\`\``).join("\n\n")}`;
    
    navigator.clipboard.writeText(message);
    toast.success("Copied! Paste into chat to create entities");
  };

  const handleSaveGeneratedApp = async () => {
    if (!saveName.trim()) {
      toast.error("Please enter a name");
      return;
    }
    
    setIsSaving(true);
    try {
      await base44.entities.GeneratedApp.create({
        mind_map_id: mindMap?.id,
        mind_map_name: mindMap?.name,
        mind_map_version: mindMap?.version || 1,
        name: saveName,
        description: saveDescription,
        specification: spec,
        status: "draft"
      });
      
      toast.success("Generated app saved!");
      setShowSaveForm(false);
      setSaveName("");
      setSaveDescription("");
    } catch (error) {
      toast.error("Failed to save: " + (error.message || "Unknown error"));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Generated App Specification</span>
            {!showSaveForm && (
              <Button 
                onClick={() => {
                  setSaveName(mindMap?.name ? `${mindMap.name} App` : "New App");
                  setShowSaveForm(true);
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Save className="h-4 w-4 mr-2" />
                Save as Generated App
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>

        {showSaveForm && (
          <div className="border rounded-lg p-4 bg-blue-50 space-y-3 mb-4">
            <div>
              <label className="text-sm font-medium">App Name</label>
              <Input
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                placeholder="Enter a name for this generated app..."
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description (optional)</label>
              <Textarea
                value={saveDescription}
                onChange={(e) => setSaveDescription(e.target.value)}
                placeholder="Describe this generated app..."
                rows={2}
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleSaveGeneratedApp}
                disabled={isSaving || !saveName.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Save
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowSaveForm(false);
                  setSaveName("");
                  setSaveDescription("");
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="entities" className="gap-2">
              <Database className="h-4 w-4" />
              Entities ({entities.length})
            </TabsTrigger>
            <TabsTrigger value="pages" className="gap-2">
              <Layout className="h-4 w-4" />
              Pages ({pages.length})
            </TabsTrigger>
            <TabsTrigger value="features" className="gap-2">
              <Zap className="h-4 w-4" />
              Features ({features.length})
            </TabsTrigger>
            <TabsTrigger value="navigation" className="gap-2">
              <Navigation className="h-4 w-4" />
              Navigation
            </TabsTrigger>
            <TabsTrigger value="admin" className="gap-2">
              <Settings className="h-4 w-4" />
              Admin
            </TabsTrigger>
          </TabsList>

          <TabsContent value="entities" className="mt-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectedEntities.length === entities.length && entities.length > 0}
                  onCheckedChange={selectAllEntities}
                />
                <span className="text-sm text-gray-600">
                  {selectedEntities.length} selected
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={copyAllSchemas}
                  variant="outline"
                  size="sm"
                >
                  {copiedAll ? (
                    <Check className="h-4 w-4 mr-1 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4 mr-1" />
                  )}
                  Copy {selectedEntities.length > 0 ? "Selected" : "All"} Schemas
                </Button>
                <Button
                  onClick={copyForChat}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Copy className="h-4 w-4 mr-1" />
                  Copy for Chat
                </Button>
              </div>
            </div>

            <ScrollArea className="h-[400px]">
              <div className="space-y-3 pr-4">
                {entities.map((entity) => (
                  <Card key={entity.name} className="relative">
                    <CardHeader className="pb-2">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={selectedEntities.includes(entity.name)}
                          onCheckedChange={() => toggleEntity(entity.name)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <CardTitle className="text-base flex items-center gap-2">
                            {entity.name}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => copySchema(entity)}
                            >
                              {copiedJson === entity.name ? (
                                <Check className="h-3 w-3 text-green-500" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </Button>
                          </CardTitle>
                          <p className="text-sm text-gray-500 mt-1">
                            {entity.description}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="bg-slate-50 rounded p-2 text-xs font-mono overflow-x-auto">
                        <pre>
                          {JSON.stringify(entity.schema?.properties || {}, null, 2)}
                        </pre>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="pages" className="mt-4">
            <ScrollArea className="h-[450px]">
              <div className="space-y-3 pr-4">
                {pages.map((page) => (
                  <Card key={page.name}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{page.name}</CardTitle>
                      <p className="text-sm text-gray-500">{page.description}</p>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-2">
                      {page.features?.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          <span className="text-xs text-gray-500 mr-1">Features:</span>
                          {page.features.map((f) => (
                            <Badge key={f} variant="secondary" className="text-xs">
                              {f}
                            </Badge>
                          ))}
                        </div>
                      )}
                      {page.entities_used?.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          <span className="text-xs text-gray-500 mr-1">Uses:</span>
                          {page.entities_used.map((e) => (
                            <Badge key={e} variant="outline" className="text-xs">
                              {e}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="features" className="mt-4">
            <ScrollArea className="h-[450px]">
              <div className="space-y-3 pr-4">
                {features.map((feature, idx) => (
                  <Card key={idx}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{feature.name}</CardTitle>
                      <p className="text-sm text-gray-500">{feature.description}</p>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-2">
                      {feature.page && (
                        <div className="text-xs">
                          <span className="text-gray-500">Page: </span>
                          <Badge variant="secondary">{feature.page}</Badge>
                        </div>
                      )}
                      {feature.entities?.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          <span className="text-xs text-gray-500 mr-1">Entities:</span>
                          {feature.entities.map((e) => (
                            <Badge key={e} variant="outline" className="text-xs">
                              {e}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="navigation" className="mt-4">
            <ScrollArea className="h-[450px]">
              <AppNavigationManager
                navigationConfig={navigationConfig}
                pages={pages}
                onUpdate={setNavigationConfig}
                onSave={(config) => {
                  setNavigationConfig(config);
                  toast.success("Navigation configured");
                }}
              />
            </ScrollArea>
          </TabsContent>

          <TabsContent value="admin" className="mt-4">
            <ScrollArea className="h-[450px]">
              <div className="space-y-4 pr-4">
                <DependencyResolver
                  selectedEntities={entities}
                  availablePages={pages}
                  availableFeatures={features}
                  onResolveDependencies={(deps) => {
                    setResolvedDependencies(deps);
                    toast.success(`Added ${deps.pages.length} pages, ${deps.features.length} features, ${deps.autoGeneratedPages.length} auto-gen pages`);
                  }}
                />
                <SystemFunctionManager
                  selectedFunctions={systemFunctions}
                  onUpdate={setSystemFunctions}
                />
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}