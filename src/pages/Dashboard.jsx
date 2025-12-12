import React, { useState, lazy, Suspense, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Settings, LayoutGrid, RefreshCw, Loader2 } from "lucide-react";
import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import DashboardWidgetCard from "@/components/dashboard/DashboardWidgetCard";
import useDashboardSettings from "@/components/dashboard/useDashboardSettings";

// Lazy load heavy components
const WidgetConfigEditor = lazy(() => import("@/components/dashboard/WidgetConfigEditor"));
const DashboardSettings = lazy(() => import("@/components/dashboard/DashboardSettings"));
const TechNewsWidget = lazy(() => import("@/components/dashboard/TechNewsWidget"));

export default function Dashboard() {
  const queryClient = useQueryClient();
  const [configWidget, setConfigWidget] = useState(null);
  const [showSettings, setShowSettings] = useState(false);

  // Prefetch common data on idle
  useEffect(() => {
    const prefetchTimer = setTimeout(() => {
      queryClient.prefetchQuery({
        queryKey: ['entityTemplates'],
        queryFn: () => base44.entities.EntityTemplate.list(),
        staleTime: 60000,
      });
      queryClient.prefetchQuery({
        queryKey: ['pageTemplates'],
        queryFn: () => base44.entities.PageTemplate.list(),
        staleTime: 60000,
      });
    }, 2000);

    return () => clearTimeout(prefetchTimer);
  }, [queryClient]);

  // Fetch published widgets
  const { data: widgets = [], isLoading, refetch } = useQuery({
    queryKey: ["publishedWidgets"],
    queryFn: () => base44.entities.DashboardWidget.filter({ status: "published" }),
  });

  // Fetch real data counts
  const { data: projects = [] } = useQuery({
    queryKey: ["projectsCount"],
    queryFn: () => base44.entities.Project.list("-created_date", 1000),
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ["tasksCount"],
    queryFn: () => base44.entities.Task.list("-created_date", 1000),
  });

  const { data: customers = [] } = useQuery({
    queryKey: ["customersCount"],
    queryFn: () => base44.entities.Customer.list("-created_date", 1000),
  });

  // Data context for resolving template values
  const dataContext = {
    projects: { count: projects.length },
    tasks: { count: tasks.length, active: tasks.filter(t => t.status === "in_progress").length },
    customers: { count: customers.length }
  };

  // Use custom hook for dashboard settings
  const {
    settings,
    setSettings,
    visibleWidgetIds,
    setVisibleWidgetIds,
    displayWidgets,
    handleDragEnd,
  } = useDashboardSettings(widgets);

  const statWidgets = displayWidgets.filter(w => w.widget_type === "stat_card");
  const otherWidgets = displayWidgets.filter(w => w.widget_type !== "stat_card");

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center h-64 bg-background">
        <RefreshCw className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  const renderWidgetCard = (widget, index, isDraggable) => (
    <DashboardWidgetCard
      key={widget.id}
      widget={widget}
      index={index}
      isDraggable={isDraggable}
      dataContext={dataContext}
      onConfigClick={setConfigWidget}
    />
  );

  return (
    <div className={`p-3 sm:p-4 md:p-6 bg-background min-h-screen ${settings.compactMode ? "space-y-4" : ""}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 sm:mb-8">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-h1">Dashboard</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">Welcome back! Here's what's happening.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2 flex-1 sm:flex-none">
            <RefreshCw className="h-4 w-4" />
            <span className="sm:inline hidden">Refresh</span>
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowSettings(true)} className="gap-2 flex-1 sm:flex-none">
            <Settings className="h-4 w-4" />
            <span className="sm:inline hidden">Settings</span>
          </Button>
        </div>
      </div>

      {displayWidgets.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <LayoutGrid className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-h3">No widgets visible</h3>
            <p className="text-muted-foreground mt-2">
              Click the settings button to add widgets
            </p>
          </CardContent>
        </Card>
      ) : settings.enableDragDrop ? (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="dashboard">
            {(provided) => (
              <div 
                {...provided.droppableProps} 
                ref={provided.innerRef}
                className={`grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 ${settings.compactMode ? "gap-2 sm:[gap:var(--spacing-3)]" : "gap-3 sm:[gap:var(--spacing-4)]"}`}
              >
                {displayWidgets.map((widget, index) => renderWidgetCard(widget, index, true))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      ) : (
        <div className={`space-y-${settings.compactMode ? "4" : "8"}`}>
          {statWidgets.length > 0 && (
            <div className={`grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 ${settings.compactMode ? "gap-2 sm:[gap:var(--spacing-3)]" : "gap-3 sm:[gap:var(--spacing-4)]"}`}>
              {statWidgets.map((widget, index) => renderWidgetCard(widget, index, false))}
            </div>
          )}

          {otherWidgets.length > 0 && (
            <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 ${settings.compactMode ? "gap-3 sm:[gap:var(--spacing-4)]" : "gap-4 sm:[gap:var(--spacing-6)]"}`}>
              {otherWidgets.map((widget, index) => {
                const colSpan = widget.default_col_span >= 2 ? "md:col-span-2" : "";
                return (
                  <div key={widget.id} className={colSpan}>
                    {renderWidgetCard(widget, index, false)}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Widget Config Editor */}
      <Suspense fallback={null}>
        <WidgetConfigEditor
          widget={configWidget}
          isOpen={!!configWidget}
          onClose={() => setConfigWidget(null)}
          onSave={() => setConfigWidget(null)}
        />
      </Suspense>

      {/* Tech News Widget - Always visible */}
      <Suspense fallback={
        <Card className="mt-6">
          <CardContent className="py-8 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      }>
        <div className="mt-6">
          <TechNewsWidget />
        </div>
      </Suspense>

      {/* Dashboard Settings */}
      <Suspense fallback={null}>
        <DashboardSettings
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          settings={settings}
          onSettingsChange={setSettings}
          allWidgets={widgets}
          visibleWidgetIds={visibleWidgetIds || []}
          onVisibleWidgetsChange={setVisibleWidgetIds}
        />
      </Suspense>
    </div>
  );
}