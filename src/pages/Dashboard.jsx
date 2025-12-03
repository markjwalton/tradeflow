import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, ChevronDown, ChevronRight, Maximize2, Minimize2,
  LayoutGrid, RefreshCw
} from "lucide-react";
import WidgetRenderer from "@/components/dashboard/WidgetRenderer";
import WidgetConfigEditor from "@/components/dashboard/WidgetConfigEditor";

export default function Dashboard() {
  const [collapsedGroups, setCollapsedGroups] = useState(new Set());
  const [configWidget, setConfigWidget] = useState(null);
  const [isCompact, setIsCompact] = useState(false);

  // Fetch published widgets
  const { data: widgets = [], isLoading, refetch } = useQuery({
    queryKey: ["publishedWidgets"],
    queryFn: () => base44.entities.DashboardWidget.filter({ status: "published" }),
  });

  // Fetch user's dashboard layout (if exists)
  const { data: layouts = [] } = useQuery({
    queryKey: ["dashboardLayouts"],
    queryFn: () => base44.entities.DashboardLayout.filter({ is_default: true }),
  });

  const layout = layouts[0];

  // Group widgets by category
  const groupedWidgets = widgets.reduce((acc, widget) => {
    const category = widget.category || "General";
    if (!acc[category]) acc[category] = [];
    acc[category].push(widget);
    return acc;
  }, {});

  // Get widget placement from layout or use defaults
  const getWidgetColSpan = (widget) => {
    if (layout?.widgets) {
      const placement = layout.widgets.find(w => w.widget_id === widget.id);
      if (placement?.col_span) return placement.col_span;
    }
    return widget.default_col_span || 1;
  };

  const toggleGroup = (category) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  };

  const colSpanClasses = {
    1: "col-span-1",
    2: "col-span-2",
    3: "col-span-3",
    4: "col-span-4",
    5: "col-span-5",
    6: "col-span-6",
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500">Welcome back! Here's your overview.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsCompact(!isCompact)}
          >
            {isCompact ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Widget Grid */}
      {Object.keys(groupedWidgets).length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <LayoutGrid className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg">No widgets available</p>
          <p className="text-sm mt-1">Widgets will appear here once published</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedWidgets).map(([category, categoryWidgets]) => {
            const isCollapsed = collapsedGroups.has(category);
            
            return (
              <div key={category} className="bg-white rounded-xl shadow-sm border overflow-hidden">
                {/* Group Header */}
                <button
                  onClick={() => toggleGroup(category)}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {isCollapsed ? (
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    )}
                    <h2 className="font-semibold text-gray-900">{category}</h2>
                    <Badge variant="secondary" className="text-xs">
                      {categoryWidgets.length}
                    </Badge>
                  </div>
                </button>

                {/* Widgets Grid */}
                {!isCollapsed && (
                  <div className={`p-4 pt-0 grid grid-cols-6 gap-4 ${isCompact ? "gap-2" : ""}`}>
                    {categoryWidgets.map(widget => {
                      const colSpan = getWidgetColSpan(widget);
                      return (
                        <div 
                          key={widget.id} 
                          className={`${colSpanClasses[colSpan]} group relative`}
                        >
                          {/* Settings button overlay */}
                          <button
                            onClick={() => setConfigWidget(widget)}
                            className="absolute top-2 right-2 z-10 p-1.5 rounded-lg bg-white/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-white"
                            title="Widget Settings"
                          >
                            <Settings className="h-3.5 w-3.5 text-gray-500" />
                          </button>
                          
                          <WidgetRenderer 
                            widget={widget} 
                            compact={isCompact}
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Widget Config Editor */}
      <WidgetConfigEditor
        widget={configWidget}
        isOpen={!!configWidget}
        onClose={() => setConfigWidget(null)}
        onSave={(updatedWidget) => {
          // For the dashboard view, we just close - actual saving would need mutation
          setConfigWidget(null);
        }}
      />
    </div>
  );
}