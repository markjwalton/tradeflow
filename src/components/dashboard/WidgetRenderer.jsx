import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, TrendingDown, Minus, ExternalLink, BarChart3, 
  PieChart, LineChart, Table, Sparkles, Info, ArrowRight
} from "lucide-react";
import TestDataCoverageWidget from "./TestDataCoverageWidget";

// Stat Card Widget
function StatCard({ config }) {
  const { title, value, change, changeType, icon, color = "blue" } = config || {};
  const TrendIcon = changeType === "up" ? TrendingUp : changeType === "down" ? TrendingDown : Minus;
  const trendColor = changeType === "up" ? "text-emerald-600" : changeType === "down" ? "text-red-500" : "text-slate-500";
  const trendBg = changeType === "up" ? "bg-emerald-50" : changeType === "down" ? "bg-red-50" : "bg-slate-50";
  
  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    green: "from-emerald-500 to-emerald-600",
    purple: "from-purple-500 to-purple-600",
    amber: "from-amber-500 to-amber-600",
    red: "from-red-500 to-red-600",
    indigo: "from-indigo-500 to-indigo-600",
    cyan: "from-cyan-500 to-cyan-600"
  };

  return (
    <Card className="h-full overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow">
      <CardContent className="p-0">
        <div className={`h-1.5 bg-gradient-to-r ${colorClasses[color] || colorClasses.blue}`} />
        <div className="p-5">
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">{title}</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">{value || "—"}</p>
          {change && (
            <div className={`inline-flex items-center gap-1 mt-3 px-2 py-1 rounded-full text-xs font-medium ${trendBg} ${trendColor}`}>
              <TrendIcon className="h-3 w-3" />
              <span>{change}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Info Card Widget
function InfoCard({ config }) {
  const { title, content, variant = "default" } = config || {};
  
  const variantClasses = {
    default: "bg-white border-0 shadow-lg",
    info: "bg-blue-50 border-blue-200 shadow-lg",
    success: "bg-emerald-50 border-emerald-200 shadow-lg",
    warning: "bg-amber-50 border-amber-200 shadow-lg",
    error: "bg-red-50 border-red-200 shadow-lg"
  };

  return (
    <Card className={`h-full ${variantClasses[variant]}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <Info className="h-4 w-4 text-slate-500" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-slate-600 leading-relaxed">{content}</p>
      </CardContent>
    </Card>
  );
}

// Quick Action Widget
function QuickActionCard({ config }) {
  const { title, description, actions = [] } = config || {};

  return (
    <Card className="h-full border-0 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-slate-900">{title}</CardTitle>
        {description && <p className="text-sm text-slate-500">{description}</p>}
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {actions.map((action, i) => (
            <Button 
              key={i} 
              variant="outline" 
              className="w-full justify-between hover:bg-slate-50 border-slate-200"
              onClick={() => action.url && (window.location.href = action.url)}
            >
              {action.label}
              <ArrowRight className="h-4 w-4 text-slate-400" />
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// AI Insight Widget
function AIInsightCard({ config }) {
  const { title, insight, confidence, source, generatedAt } = config || {};

  return (
    <Card className="h-full border-0 shadow-lg bg-gradient-to-br from-purple-50 via-white to-indigo-50 overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-purple-500 to-indigo-500" />
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-600" />
          {title || "AI Insight"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-slate-700 leading-relaxed">{insight}</p>
        {confidence && (
          <div className="mt-4 flex items-center gap-2">
            <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">
              {Math.round(confidence * 100)}% confidence
            </Badge>
            {source && <span className="text-xs text-slate-500">Based on {source}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Chart Placeholder Widget
function ChartCard({ config }) {
  const { title, chartType = "bar", data } = config || {};
  const ChartIcon = chartType === "pie" ? PieChart : chartType === "line" ? LineChart : BarChart3;

  return (
    <Card className="h-full border-0 shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <ChartIcon className="h-4 w-4 text-slate-500" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-48 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl flex items-center justify-center">
          <ChartIcon className="h-16 w-16 text-slate-300" />
        </div>
      </CardContent>
    </Card>
  );
}

// Table Widget
function TableCard({ config }) {
  const { title, columns = [], rows = [] } = config || {};

  return (
    <Card className="h-full border-0 shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <Table className="h-4 w-4 text-slate-500" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                {columns.map((col, i) => (
                  <th key={i} className="text-left py-3 px-4 font-semibold text-slate-700">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.slice(0, 5).map((row, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  {row.map((cell, j) => (
                    <td key={j} className="py-3 px-4 text-slate-600">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

// Main Widget Renderer
export default function WidgetRenderer({ widget, customConfig }) {
  const config = { ...widget.config, ...customConfig };
  
  // Special handling for test data coverage widget
  if (config?.dataSource === "test_data_coverage") {
    return <TestDataCoverageWidget />;
  }
  
  switch (widget.widget_type) {
    case "stat_card":
      return <StatCard config={config} />;
    case "info_card":
      return <InfoCard config={config} />;
    case "quick_action":
      return <QuickActionCard config={config} />;
    case "ai_insight":
      return <AIInsightCard config={config} />;
    case "chart":
      return <ChartCard config={config} />;
    case "table":
      return <TableCard config={config} />;
    default:
      return (
        <Card className="h-full">
          <CardContent className="pt-6 text-center text-gray-500">
            Unknown widget type: {widget.widget_type}
          </CardContent>
        </Card>
      );
  }
}