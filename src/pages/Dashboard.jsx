import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Settings, LayoutGrid, RefreshCw, GripVertical
} from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import WidgetRenderer from "@/components/dashboard/WidgetRenderer";
import WidgetConfigEditor from "@/components/dashboard/WidgetConfigEditor";
import DashboardSettings from "@/components/dashboard/DashboardSettings";

const SETTINGS_KEY = "dashboard_user_settings";

export default function Dashboard() {
  const [configWidget, setConfigWidget] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem(SETTINGS_KEY);
    return saved ? JSON.parse(saved) : { enableDragDrop: false, compactMode: false };
  });
  const [visibleWidgetIds, setVisibleWidgetIds] = useState(null);
  const [widgetOrder, setWidgetOrder] = useState([]);

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

  // Initialize visible widgets when data loads - include any new widgets
  useEffect(() => {
    if (widgets.length > 0) {
      const savedIds = localStorage.getItem(`${SETTINGS_KEY}_visible`);
      if (savedIds) {
        const parsed = JSON.parse(savedIds);
        // Add any new widgets that aren't in the saved list
        const allWidgetIds = widgets.map(w => w.id);
        const newWidgetIds = allWidgetIds.filter(id => !parsed.includes(id));
        if (newWidgetIds.length > 0) {
          const updated = [...parsed, ...newWidgetIds];
          setVisibleWidgetIds(updated);
        } else if (visibleWidgetIds === null) {
          setVisibleWidgetIds(parsed);
        }
      } else {
        setVisibleWidgetIds(widgets.map(w => w.id));
      }
    }
  }, [widgets]);

  // Initialize order
  useEffect(() => {
    if (widgets.length > 0 && widgetOrder.length === 0) {
      const savedOrder = localStorage.getItem(`${SETTINGS_KEY}_order`);
      if (savedOrder) {
        setWidgetOrder(JSON.parse(savedOrder));
      } else {
        setWidgetOrder(widgets.map(w => w.id));
      }
    }
  }, [widgets, widgetOrder]);

  // Save settings
  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    if (visibleWidgetIds !== null) {
      localStorage.setItem(`${SETTINGS_KEY}_visible`, JSON.stringify(visibleWidgetIds));
    }
  }, [visibleWidgetIds]);

  useEffect(() => {
    if (widgetOrder.length > 0) {
      localStorage.setItem(`${SETTINGS_KEY}_order`, JSON.stringify(widgetOrder));
    }
  }, [widgetOrder]);

  // Resolve template values like {{projects.count}}
  const resolveValue = (value) => {
    if (!value || typeof value !== "string") return value;
    return value.replace(/\{\{(\w+)\.(\w+)\}\}/g, (match, entity, field) => {
      return dataContext[entity]?.[field] ?? "—";
    });
  };

  // Get ordered and filtered widgets
  const getDisplayWidgets = () => {
    if (!visibleWidgetIds) return [];
    
    const visibleWidgets = widgets.filter(w => visibleWidgetIds.includes(w.id));
    
    // Sort by saved order
    if (widgetOrder.length > 0) {
      return visibleWidgets.sort((a, b) => {
        const aIdx = widgetOrder.indexOf(a.id);
        const bIdx = widgetOrder.indexOf(b.id);
        if (aIdx === -1) return 1;
        if (bIdx === -1) return -1;
        return aIdx - bIdx;
      });
    }
    
    // Default sort
    const order = { stat_card: 0, chart: 1, quick_action: 2, info_card: 3, table: 4, ai_insight: 5 };
    return visibleWidgets.sort((a, b) => (order[a.widget_type] ?? 99) - (order[b.widget_type] ?? 99));
  };

  const displayWidgets = getDisplayWidgets();
  const statWidgets = displayWidgets.filter(w => w.widget_type === "stat_card");
  const otherWidgets = displayWidgets.filter(w => w.widget_type !== "stat_card");

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    const items = Array.from(widgetOrder.length > 0 ? widgetOrder : widgets.map(w => w.id));
    const [reordered] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reordered);
    
    setWidgetOrder(items);
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  const renderWidget = (widget, index, isDraggable = false) => {
    const resolvedWidget = {
      ...widget,
      config: widget.config ? {
        ...widget.config,
        value: resolveValue(widget.config.value)
      } : widget.config
    };

    const content = (
      <div className="group relative h-full">
        {isDraggable && settings.enableDragDrop && (
          <div className="absolute top-3 left-3 z-10 p-1.5 rounded-lg bg-white/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity shadow-sm cursor-grab">
            <GripVertical className="h-3.5 w-3.5 text-slate-400" />
          </div>
        )}
        <button
          onClick={() => setConfigWidget(widget)}
          className="absolute top-3 right-3 z-10 p-1.5 rounded-lg bg-white/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-white"
        >
          <Settings className="h-3.5 w-3.5 text-slate-500" />
        </button>
        <WidgetRenderer widget={resolvedWidget} />
      </div>
    );

    if (isDraggable && settings.enableDragDrop) {
      return (
        <Draggable key={widget.id} draggableId={widget.id} index={index}>
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
            >
              {content}
            </div>
          )}
        </Draggable>
      );
    }

    return <div key={widget.id}>{content}</div>;
  };

  return (
    <div className={`p-6 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen ${settings.compactMode ? "space-y-4" : ""}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1">Welcome back! Here's what's happening.</p>
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
            <LayoutGrid className="h-16 w-16 mx-auto mb-4 text-slate-300" />
            <h3 className="text-xl font-medium text-slate-700">No widgets visible</h3>
            <p className="text-slate-500 mt-2">
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
                {displayWidgets.map((widget, index) => renderWidget(widget, index, true))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      ) : (
        <div className={`space-y-${settings.compactMode ? "4" : "8"}`}>
          {statWidgets.length > 0 && (
            <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 ${settings.compactMode ? "gap-3" : "gap-4"}`}>
              {statWidgets.map((widget, index) => renderWidget(widget, index, false))}
            </div>
          )}

          {otherWidgets.length > 0 && (
            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 ${settings.compactMode ? "gap-4" : "gap-6"}`}>
              {otherWidgets.map((widget, index) => {
                const colSpan = widget.default_col_span >= 2 ? "md:col-span-2" : "";
                return (
                  <div key={widget.id} className={colSpan}>
                    {renderWidget(widget, index, false)}
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