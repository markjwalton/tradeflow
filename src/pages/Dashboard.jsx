import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Settings, LayoutGrid, RefreshCw } from "lucide-react";
import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import WidgetConfigEditor from "@/components/dashboard/WidgetConfigEditor";
import DashboardSettings from "@/components/dashboard/DashboardSettings";
import DashboardWidgetCard from "@/components/dashboard/DashboardWidgetCard";
import useDashboardSettings from "@/components/dashboard/useDashboardSettings";
import TechNewsWidget from "@/components/dashboard/TechNewsWidget";

export default function Dashboard() {
  const [configWidget, setConfigWidget] = useState(null);
  const [showSettings, setShowSettings] = useState(false);

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
      <div className="p-6 flex items-center justify-center h-64 bg-[var(--color-background)]">
        <RefreshCw className="h-6 w-6 animate-spin text-[var(--color-primary-400)]" />
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
    <div className={`p-6 bg-[var(--color-background)] min-h-screen ${settings.compactMode ? "space-y-4" : ""}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-h1">Dashboard</h1>
          <p className="text-[var(--color-charcoal-500)] mt-1">Welcome back! Here's what's happening.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowSettings(true)} className="gap-2">
            <Settings className="h-4 w-4" />
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
                className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 ${settings.compactMode ? "gap-3" : "gap-4"}`}
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
            <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 ${settings.compactMode ? "gap-3" : "gap-4"}`}>
              {statWidgets.map((widget, index) => renderWidgetCard(widget, index, false))}
            </div>
          )}

          {otherWidgets.length > 0 && (
            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 ${settings.compactMode ? "gap-4" : "gap-6"}`}>
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
      <WidgetConfigEditor
        widget={configWidget}
        isOpen={!!configWidget}
        onClose={() => setConfigWidget(null)}
        onSave={() => setConfigWidget(null)}
      />

      {/* Tech News Widget - Always visible */}
      <div className="mt-6">
        <TechNewsWidget />
      </div>

      {/* Dashboard Settings */}
      <DashboardSettings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onSettingsChange={setSettings}
        allWidgets={widgets}
        visibleWidgetIds={visibleWidgetIds || []}
        onVisibleWidgetsChange={setVisibleWidgetIds}
      />
    </div>
  );
}