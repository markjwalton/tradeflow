import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, TrendingDown, Minus, ExternalLink, BarChart3, 
  PieChart, LineChart, Table, Sparkles, Info, ArrowRight
} from "lucide-react";

// Stat Card Widget
function StatCard({ config }) {
  const { title, value, change, changeType, icon, color = "blue" } = config || {};
  const TrendIcon = changeType === "up" ? TrendingUp : changeType === "down" ? TrendingDown : Minus;
  const trendColor = changeType === "up" ? "text-green-600" : changeType === "down" ? "text-red-600" : "text-gray-500";
  
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    amber: "bg-amber-50 text-amber-600",
    red: "bg-red-50 text-red-600"
  };

  return (
    <Card className="h-full">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {change && (
              <div className={`flex items-center gap-1 mt-1 text-sm ${trendColor}`}>
                <TrendIcon className="h-4 w-4" />
                <span>{change}</span>
              </div>
            )}
          </div>
          {icon && (
            <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
              <BarChart3 className="h-6 w-6" />
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
    default: "bg-white",
    info: "bg-blue-50 border-blue-200",
    success: "bg-green-50 border-green-200",
    warning: "bg-amber-50 border-amber-200",
    error: "bg-red-50 border-red-200"
  };

  return (
    <Card className={`h-full ${variantClasses[variant]}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Info className="h-4 w-4" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600">{content}</p>
      </CardContent>
    </Card>
  );
}

// Quick Action Widget
function QuickActionCard({ config }) {
  const { title, description, actions = [] } = config || {};

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
        {description && <p className="text-sm text-gray-500">{description}</p>}
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {actions.map((action, i) => (
            <Button 
              key={i} 
              variant="outline" 
              className="w-full justify-between"
              onClick={() => action.url && (window.location.href = action.url)}
            >
              {action.label}
              <ArrowRight className="h-4 w-4" />
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
    <Card className="h-full border-purple-200 bg-gradient-to-br from-purple-50 to-white">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-purple-600" />
          {title || "AI Insight"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-700">{insight}</p>
        {confidence && (
          <div className="mt-3 flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {Math.round(confidence * 100)}% confidence
            </Badge>
            {source && <span className="text-xs text-gray-500">Based on {source}</span>}
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
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <ChartIcon className="h-4 w-4" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-32 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
          <ChartIcon className="h-12 w-12" />
        </div>
      </CardContent>
    </Card>
  );
}

// Table Widget
function TableCard({ config }) {
  const { title, columns = [], rows = [] } = config || {};

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Table className="h-4 w-4" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                {columns.map((col, i) => (
                  <th key={i} className="text-left py-2 px-2 font-medium text-gray-600">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 5).map((row, i) => (
                <tr key={i} className="border-b last:border-0">
                  {row.map((cell, j) => (
                    <td key={j} className="py-2 px-2">{cell}</td>
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