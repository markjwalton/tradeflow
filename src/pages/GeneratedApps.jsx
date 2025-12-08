import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Search, 
  Loader2, 
  Package, 
  MoreVertical, 
  Trash2, 
  Eye, 
  Copy, 
  Database, 
  Layout, 
  Zap,
  GitBranch,
  Check
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

const statusColors = {
  draft: "bg-warning/10 text-warning-foreground",
  ready: "bg-info-50 text-info-foreground",
  building: "bg-accent-100 text-accent-700",
  deployed: "bg-success-50 text-success-foreground",
};

export default function GeneratedApps() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedApp, setSelectedApp] = useState(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);

  const { data: generatedApps = [], isLoading } = useQuery({
    queryKey: ["generatedApps"],
    queryFn: () => base44.entities.GeneratedApp.list("-created_date"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.GeneratedApp.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["generatedApps"] });
      toast.success("Generated app deleted");
    },
  });

  const filteredApps = generatedApps.filter(app => 
    !search || 
    app.name?.toLowerCase().includes(search.toLowerCase()) ||
    app.mind_map_name?.toLowerCase().includes(search.toLowerCase())
  );

  const copyFullSpec = (app) => {
    navigator.clipboard.writeText(JSON.stringify(app.specification, null, 2));
    toast.success("Full specification copied to clipboard");
  };

  const copyForChat = (app) => {
    const spec = app.specification || {};
    const entities = spec.entities || [];
    const pages = spec.pages || [];
    const features = spec.features || [];
    
    const message = `Please build an app based on this specification:

## App: ${app.name}
${app.description || ""}

### Entities (${entities.length})
${entities.map(e => `
#### ${e.name}
${e.description}

\`\`\`json
${JSON.stringify(e.schema, null, 2)}
\`\`\`
`).join("\n")}

### Pages (${pages.length})
${pages.map(p => `- **${p.name}**: ${p.description} (Uses: ${p.entities_used?.join(", ") || "none"})`).join("\n")}

### Features (${features.length})
${features.map(f => `- **${f.name}**: ${f.description}`).join("\n")}
`;
    
    navigator.clipboard.writeText(message);
    toast.success("Copied! Paste into a new Base44 chat to build this app");
  };

  const openDetail = (app) => {
    setSelectedApp(app);
    setShowDetailDialog(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 bg-[var(--color-background)]">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--color-charcoal)]" />
      </div>
    );
  }

  return (
    <div className="p-6 bg-[var(--color-background)] min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-light font-display text-[var(--color-midnight)]">Generated Apps</h1>
          <p className="text-[var(--color-charcoal)]">App specifications generated from mind maps</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search generated apps..."
          className="pl-10"
        />
      </div>

      {/* Apps Grid */}
      {filteredApps.length === 0 ? (
        <div className="text-center py-12 text-[var(--color-charcoal)]">
          <Package className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p>No generated apps yet.</p>
          <p className="text-sm">Generate an app from a mind map to see it here.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredApps.map((app) => {
            const spec = app.specification || {};
            const entityCount = spec.entities?.length || 0;
            const pageCount = spec.pages?.length || 0;
            const featureCount = spec.features?.length || 0;
            
            return (
              <Card key={app.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{app.name}</CardTitle>
                      {app.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {app.description}
                        </p>
                      )}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openDetail(app)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => copyFullSpec(app)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy JSON
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => copyForChat(app)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy for Chat
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => deleteMutation.mutate(app.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge className={statusColors[app.status || "draft"]}>
                      {app.status || "draft"}
                    </Badge>
                    {app.mind_map_name && (
                      <Badge variant="outline" className="gap-1">
                        <GitBranch className="h-3 w-3" />
                        {app.mind_map_name}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Database className="h-4 w-4" />
                      {entityCount} entities
                    </div>
                    <div className="flex items-center gap-1">
                      <Layout className="h-4 w-4" />
                      {pageCount} pages
                    </div>
                    <div className="flex items-center gap-1">
                      <Zap className="h-4 w-4" />
                      {featureCount} features
                    </div>
                  </div>
                  
                  <div className="text-xs text-muted-foreground mt-3">
                    Created {format(new Date(app.created_date), "MMM d, yyyy")}
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => openDetail(app)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button 
                      size="sm" 
                      className="flex-1 bg-success hover:bg-success/90 text-success-foreground"
                      onClick={() => copyForChat(app)}
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Copy for Chat
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Detail Dialog */}
      <GeneratedAppDetailDialog
        open={showDetailDialog}
        onOpenChange={setShowDetailDialog}
        app={selectedApp}
      />
    </div>
  );
}

function GeneratedAppDetailDialog({ open, onOpenChange, app }) {
  const [copiedJson, setCopiedJson] = useState(null);

  if (!app) return null;

  const spec = app.specification || {};
  const entities = spec.entities || [];
  const pages = spec.pages || [];
  const features = spec.features || [];

  const copySchema = (entity) => {
    navigator.clipboard.writeText(JSON.stringify(entity.schema, null, 2));
    setCopiedJson(entity.name);
    setTimeout(() => setCopiedJson(null), 2000);
    toast.success(`${entity.name} schema copied`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle>{app.name}</DialogTitle>
          {app.description && (
            <p className="text-sm text-muted-foreground">{app.description}</p>
          )}
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
            <ScrollArea className="h-[400px]">
              <div className="space-y-3 pr-4">
                {entities.map((entity) => (
                  <Card key={entity.name}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        {entity.name}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => copySchema(entity)}
                        >
                          {copiedJson === entity.name ? (
                            <Check className="h-3 w-3 text-success-foreground" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">{entity.description}</p>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="bg-muted rounded p-2 text-xs font-mono overflow-x-auto">
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
            <ScrollArea className="h-[400px]">
              <div className="space-y-3 pr-4">
                {pages.map((page) => (
                  <Card key={page.name}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{page.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{page.description}</p>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-2">
                      {page.features?.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          <span className="text-xs text-muted-foreground mr-1">Features:</span>
                          {page.features.map((f) => (
                            <Badge key={f} variant="secondary" className="text-xs">
                              {f}
                            </Badge>
                          ))}
                        </div>
                      )}
                      {page.entities_used?.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          <span className="text-xs text-muted-foreground mr-1">Uses:</span>
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
            <ScrollArea className="h-[400px]">
              <div className="space-y-3 pr-4">
                {features.map((feature, idx) => (
                  <Card key={idx}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{feature.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-2">
                      {feature.page && (
                        <div className="text-xs">
                          <span className="text-muted-foreground">Page: </span>
                          <Badge variant="secondary">{feature.page}</Badge>
                        </div>
                      )}
                      {feature.entities?.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          <span className="text-xs text-muted-foreground mr-1">Entities:</span>
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