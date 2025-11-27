import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Database, Layout, Zap, Copy, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function GeneratedSpecDialog({
  open,
  onOpenChange,
  spec,
  onCreateEntities,
  isCreating,
}) {
  const [selectedEntities, setSelectedEntities] = useState([]);
  const [copiedJson, setCopiedJson] = useState(null);

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

  const handleCreateSelected = () => {
    const entitiesToCreate = entities.filter((e) =>
      selectedEntities.includes(e.name)
    );
    onCreateEntities(entitiesToCreate);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle>Generated App Specification</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="entities" className="flex-1">
          <TabsList className="grid w-full grid-cols-3">
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
              <Button
                onClick={handleCreateSelected}
                disabled={selectedEntities.length === 0 || isCreating}
                size="sm"
              >
                {isCreating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Create Selected Entities
              </Button>
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
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}