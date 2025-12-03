import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Settings, LayoutGrid, RefreshCw, TrendingUp, TrendingDown,
  Briefcase, CheckSquare, DollarSign, Users, Activity, Zap
} from "lucide-react";
import WidgetRenderer from "@/components/dashboard/WidgetRenderer";
import WidgetConfigEditor from "@/components/dashboard/WidgetConfigEditor";

export default function Dashboard() {
  const [configWidget, setConfigWidget] = useState(null);

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

  // Get widget placement from layout or use defaults
  const getWidgetColSpan = (widget) => {
    if (layout?.widgets) {
      const placement = layout.widgets.find(w => w.widget_id === widget.id);
      if (placement?.col_span) return placement.col_span;
    }
    return widget.default_col_span || 1;
  };

  // Sort widgets: stat_cards first, then others
  const sortedWidgets = [...widgets].sort((a, b) => {
    const order = { stat_card: 0, chart: 1, quick_action: 2, info_card: 3, table: 4, ai_insight: 5 };
    return (order[a.widget_type] ?? 99) - (order[b.widget_type] ?? 99);
  });

  // Separate stat cards from other widgets for the hero section
  const statWidgets = sortedWidgets.filter(w => w.widget_type === "stat_card");
  const otherWidgets = sortedWidgets.filter(w => w.widget_type !== "stat_card");

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1">Welcome back! Here's what's happening.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {widgets.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <LayoutGrid className="h-16 w-16 mx-auto mb-4 text-slate-300" />
            <h3 className="text-xl font-medium text-slate-700">No widgets yet</h3>
            <p className="text-slate-500 mt-2">
              Publish widgets from the Dashboard Manager to see them here
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {/* Stat Cards Row - Hero Section */}
          {statWidgets.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {statWidgets.map(widget => (
                <div key={widget.id} className="group relative">
                  <button
                    onClick={() => setConfigWidget(widget)}
                    className="absolute top-3 right-3 z-10 p-1.5 rounded-lg bg-white/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-white"
                  >
                    <Settings className="h-3.5 w-3.5 text-slate-500" />
                  </button>
                  <WidgetRenderer widget={widget} />
                </div>
              ))}
            </div>
          )}

          {/* Main Widgets Grid */}
          {otherWidgets.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {otherWidgets.map(widget => {
                const colSpan = getWidgetColSpan(widget);
                const spanClass = colSpan >= 2 ? "md:col-span-2" : "";
                
                return (
                  <div key={widget.id} className={`group relative ${spanClass}`}>
                    <button
                      onClick={() => setConfigWidget(widget)}
                      className="absolute top-3 right-3 z-10 p-1.5 rounded-lg bg-white/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-white"
                    >
                      <Settings className="h-3.5 w-3.5 text-slate-500" />
                    </button>
                    <WidgetRenderer widget={widget} />
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
        onSave={(updatedWidget) => {
          setConfigWidget(null);
        }}
      />
    </div>
  );
}