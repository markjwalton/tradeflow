import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  LayoutDashboard, Settings, Sparkles, Plus, Eye, Edit, Save, 
  PanelLeftClose, PanelLeft, Loader2, Grid3X3, Columns, Package,
  ChevronDown, ChevronRight, Search
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { toast } from "sonner";

import DashboardGrid from "@/components/dashboard/DashboardGrid";
import WidgetLibrarySidebar from "@/components/dashboard/WidgetLibrarySidebar";
import WidgetStaging from "@/components/dashboard/WidgetStaging";
import AIWidgetGenerator from "@/components/dashboard/AIWidgetGenerator";

export default function DashboardManager() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isEditing, setIsEditing] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [columns, setColumns] = useState(4);

  // Fetch widgets
  const { data: widgets = [], isLoading: widgetsLoading } = useQuery({
    queryKey: ["dashboardWidgets"],
    queryFn: () => base44.entities.DashboardWidget.list("-created_date"),
  });

  // Fetch layouts
  const { data: layouts = [] } = useQuery({
    queryKey: ["dashboardLayouts"],
    queryFn: () => base44.entities.DashboardLayout.list(),
  });

  // Fetch context for AI
  const { data: entities = [] } = useQuery({
    queryKey: ["entityTemplates"],
    queryFn: () => base44.entities.EntityTemplate.list(),
  });

  const { data: pages = [] } = useQuery({
    queryKey: ["pageTemplates"],
    queryFn: () => base44.entities.PageTemplate.list(),
  });

  const { data: features = [] } = useQuery({
    queryKey: ["featureTemplates"],
    queryFn: () => base44.entities.FeatureTemplate.list(),
  });

  // Get or create default layout
  const defaultLayout = layouts.find(l => l.is_default) || layouts[0];
  const [currentLayout, setCurrentLayout] = useState(null);

  useEffect(() => {
    if (defaultLayout && !currentLayout) {
      setCurrentLayout(defaultLayout);
      if (defaultLayout.sidebar_collapsed_default) {
        setSidebarCollapsed(true);
      }
      if (defaultLayout.columns) {
        setColumns(defaultLayout.columns);
      }
    }
  }, [defaultLayout]);

  const layoutMutation = useMutation({
    mutationFn: async (layoutData) => {
      if (currentLayout?.id) {
        return base44.entities.DashboardLayout.update(currentLayout.id, layoutData);
      } else {
        return base44.entities.DashboardLayout.create({
          name: "Default Dashboard",
          is_default: true,
          ...layoutData
        });
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["dashboardLayouts"] });
      setCurrentLayout(result);
      toast.success("Layout saved");
    }
  });

  const handleLayoutChange = (newLayout) => {
    setCurrentLayout(newLayout);
  };

  const handleSaveLayout = () => {
    layoutMutation.mutate({
      ...currentLayout,
      columns,
      sidebar_collapsed_default: sidebarCollapsed
    });
    setIsEditing(false);
  };

  const handleAddWidget = (widget) => {
    const newWidgets = [
      ...(currentLayout?.widgets || []),
      {
        widget_id: widget.id,
        group_id: null,
        col_span: widget.default_col_span || 1,
        order: (currentLayout?.widgets?.length || 0)
      }
    ];
    setCurrentLayout({ ...currentLayout, widgets: newWidgets });
  };

  const publishedWidgets = widgets.filter(w => w.status === "published");

  return (
    <div className="h-[calc(100vh-56px)] flex flex-col">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <LayoutDashboard className="h-5 w-5 text-primary" />
          <h1 className="text-h4">Dashboard Manager</h1>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="h-8">
              <TabsTrigger value="dashboard" className="text-xs px-3">
                <Eye className="h-3 w-3 mr-1" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="staging" className="text-xs px-3">
                <Sparkles className="h-3 w-3 mr-1" />
                Staging
                {widgets.filter(w => ["draft", "staging", "approved"].includes(w.status)).length > 0 && (
                  <Badge className="ml-1 h-4 px-1 text-xs bg-warning">
                    {widgets.filter(w => ["draft", "staging", "approved"].includes(w.status)).length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="library" className="text-xs px-3">
                <Package className="h-3 w-3 mr-1" />
                Library
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === "dashboard" && (
            <>
              <Select value={columns.toString()} onValueChange={(v) => setColumns(parseInt(v))}>
                <SelectTrigger className="w-24 h-8">
                  <Grid3X3 className="h-3 w-3 mr-1" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 cols</SelectItem>
                  <SelectItem value="3">3 cols</SelectItem>
                  <SelectItem value="4">4 cols</SelectItem>
                  <SelectItem value="6">6 cols</SelectItem>
                </SelectContent>
              </Select>
              
              {isEditing ? (
                <>
                  <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSaveLayout} disabled={layoutMutation.isPending}>
                    {layoutMutation.isPending && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                    <Save className="h-3 w-3 mr-1" />
                    Save
                  </Button>
                </>
              ) : (
                <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                  <Edit className="h-3 w-3 mr-1" />
                  Edit Layout
                </Button>
              )}
            </>
          )}

          <Button 
            size="sm" 
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={() => setShowAIGenerator(true)}
          >
            <Sparkles className="h-3 w-3 mr-1" />
            AI Generate
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {activeTab === "dashboard" && (
          <>
            {/* Widget Sidebar */}
            {isEditing && (
              <WidgetLibrarySidebar
                widgets={publishedWidgets}
                isCollapsed={sidebarCollapsed}
                onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
                onAddWidget={handleAddWidget}
                onGenerateAI={() => setShowAIGenerator(true)}
              />
            )}

            {/* Dashboard Grid */}
            <div className="flex-1 overflow-auto p-6 bg-background">
              {widgetsLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : publishedWidgets.length === 0 && !currentLayout?.widgets?.length ? (
                <Card className="max-w-lg mx-auto mt-12">
                  <CardContent className="py-12 text-center">
                    <LayoutDashboard className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-h4 mb-2 text-foreground">No Widgets Yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Create widgets in the staging area or use AI to generate recommendations.
                    </p>
                    <div className="flex justify-center gap-2">
                      <Button variant="outline" onClick={() => setActiveTab("staging")}>
                        <Plus className="h-4 w-4 mr-1" />
                        Create Widget
                      </Button>
                      <Button 
                        className="bg-primary hover:bg-primary/90 text-primary-foreground"
                        onClick={() => setShowAIGenerator(true)}
                      >
                        <Sparkles className="h-4 w-4 mr-1" />
                        AI Generate
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <DashboardGrid
                  layout={currentLayout}
                  widgets={publishedWidgets}
                  onLayoutChange={handleLayoutChange}
                  isEditing={isEditing}
                  columns={columns}
                />
              )}
            </div>
          </>
        )}

        {activeTab === "staging" && (
          <div className="flex-1 overflow-auto p-6 bg-background">
            <WidgetStaging 
              widgets={widgets}
              onEdit={(widget) => {
                // TODO: Open widget editor
                toast.info("Widget editor coming soon");
              }}
            />
          </div>
        )}

        {activeTab === "library" && (
          <div className="flex-1 overflow-auto p-6 bg-background">
            <WidgetLibraryManager widgets={widgets} />
          </div>
        )}
      </div>

      {/* AI Generator Dialog */}
      <AIWidgetGenerator
        isOpen={showAIGenerator}
        onClose={() => setShowAIGenerator(false)}
        entities={entities}
        pages={pages}
        features={features}
      />
    </div>
  );
}

// Widget Library Manager Component
function WidgetLibraryManager({ widgets }) {
  const [collapsedCategories, setCollapsedCategories] = useState({});
  const [search, setSearch] = useState("");
  
  const publishedWidgets = widgets.filter(w => w.status === "published");
  const filteredWidgets = publishedWidgets.filter(w => 
    !search || 
    w.name?.toLowerCase().includes(search.toLowerCase()) ||
    w.description?.toLowerCase().includes(search.toLowerCase())
  );
  
  const grouped = filteredWidgets.reduce((acc, w) => {
    const cat = w.category || "Uncategorized";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(w);
    return acc;
  }, {});

  const categories = Object.keys(grouped).sort();

  const toggleCategory = (cat) => {
    setCollapsedCategories(prev => ({
      ...prev,
      [cat]: !prev[cat]
    }));
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search widgets..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {publishedWidgets.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No published widgets yet</p>
            <p className="text-sm mt-1">Approve widgets from the staging area to publish them</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {categories.map(category => {
            const catWidgets = grouped[category];
            const isOpen = !collapsedCategories[category];

            return (
              <Card key={category} className="border-border">
                <Collapsible open={isOpen} onOpenChange={() => toggleCategory(category)}>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {isOpen ? (
                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                          )}
                          <CardTitle className="text-lg">{category}</CardTitle>
                          <Badge variant="outline">{catWidgets.length}</Badge>
                        </div>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="space-y-3 pt-0 p-4">
                      {catWidgets.map(widget => (
                        <Card key={widget.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="text-h3">{widget.name}</h3>
                                  <Badge variant="outline">v{widget.version || 1}</Badge>
                                </div>
                                {widget.description && (
                                  <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                                    {widget.description}
                                  </p>
                                )}
                                <div className="flex items-center gap-2">
                                  <Badge variant="secondary">{widget.widget_type}</Badge>
                                  {widget.ai_generated && (
                                    <Badge className="bg-accent-100 text-accent">
                                      <Sparkles className="h-3 w-3 mr-1" />
                                      AI
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}