import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, TrendingDown, Minus, BarChart3, 
  PieChart, LineChart, Table, Sparkles, Info, ArrowRight
} from "lucide-react";
import TestDataCoverageWidget from "./TestDataCoverageWidget";

// Stat Card Widget
const StatCard = React.memo(({ config }) => {
  const { title, value, change, changeType, icon, color = "primary" } = config || {};
  const TrendIcon = changeType === "up" ? TrendingUp : changeType === "down" ? TrendingDown : Minus;
  const trendColor = changeType === "up" ? "text-[var(--color-success)]" : changeType === "down" ? "text-[var(--color-destructive-600)]" : "text-[var(--color-charcoal-500)]";
  const trendBg = changeType === "up" ? "bg-[var(--color-primary-100)]" : changeType === "down" ? "bg-[var(--color-destructive-100)]" : "bg-[var(--color-background-200)]";
  
  const colorClasses = {
    primary: "from-[var(--color-primary-400)] to-[var(--color-primary-600)]",
    secondary: "from-[var(--color-secondary-400)] to-[var(--color-secondary-600)]",
    accent: "from-[var(--color-accent-400)] to-[var(--color-accent-600)]",
    midnight: "from-[var(--color-midnight-400)] to-[var(--color-midnight-600)]",
    blue: "from-[var(--color-info)] to-[var(--color-midnight-600)]",
    green: "from-[var(--color-success)] to-[var(--color-primary-600)]",
    amber: "from-[var(--color-warning)] to-[var(--color-secondary-600)]",
    red: "from-[var(--color-destructive-500)] to-[var(--color-destructive-700)]"
  };

  return (
    <Card className="h-full overflow-hidden border border-[var(--color-background-300)] bg-[var(--color-background-50)] shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-0">
        <div className={`h-1.5 bg-gradient-to-r ${colorClasses[color] || colorClasses.primary}`} />
        <div className="p-5">
          <p className="text-sm font-medium text-[var(--color-charcoal-500)] uppercase tracking-wide">{title}</p>
          <p className="text-3xl font-light text-[var(--color-midnight-900)] mt-2" style={{ fontFamily: 'var(--font-family-display)' }}>{value || "—"}</p>
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
});

// Info Card Widget
const InfoCard = React.memo(({ config }) => {
  const { title, content, variant = "default" } = config || {};
  
  const variantClasses = {
    default: "bg-[var(--color-background-50)] border border-[var(--color-background-300)] shadow-sm",
    info: "bg-[var(--color-midnight-50)] border border-[var(--color-midnight-200)] shadow-sm",
    success: "bg-[var(--color-primary-50)] border border-[var(--color-primary-200)] shadow-sm",
    warning: "bg-[var(--color-secondary-50)] border border-[var(--color-secondary-200)] shadow-sm",
    error: "bg-[var(--color-destructive-50)] border border-[var(--color-destructive-200)] shadow-sm"
  };

  return (
    <Card className={`h-full ${variantClasses[variant]}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium text-[var(--color-midnight-900)] flex items-center gap-2" style={{ fontFamily: 'var(--font-family-display)' }}>
          <Info className="h-4 w-4 text-[var(--color-charcoal-500)]" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-[var(--color-charcoal-600)] leading-relaxed">{content}</p>
      </CardContent>
    </Card>
  );
});

// Quick Action Widget
const QuickActionCard = React.memo(({ config }) => {
  const { title, description, actions = [] } = config || {};

  return (
    <Card className="h-full border border-[var(--color-background-300)] bg-[var(--color-background-50)] shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium text-[var(--color-midnight-900)]" style={{ fontFamily: 'var(--font-family-display)' }}>{title}</CardTitle>
        {description && <p className="text-sm text-[var(--color-charcoal-500)]">{description}</p>}
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {actions.map((action, i) => (
            <Button 
              key={i} 
              variant="outline" 
              className="w-full justify-between hover:bg-[var(--color-primary-50)] border-[var(--color-background-300)] text-[var(--color-midnight-800)]"
              onClick={() => action.url && (window.location.href = action.url)}
            >
              {action.label}
              <ArrowRight className="h-4 w-4 text-[var(--color-charcoal-400)]" />
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
});

// AI Insight Widget
const AIInsightCard = React.memo(({ config }) => {
  const { title, insight, confidence, source, generatedAt } = config || {};

  return (
    <Card className="h-full border border-[var(--color-accent-200)] bg-gradient-to-br from-[var(--color-accent-50)] via-[var(--color-background-50)] to-[var(--color-primary-50)] overflow-hidden shadow-sm">
      <div className="h-1 bg-gradient-to-r from-[var(--color-accent-400)] to-[var(--color-primary-400)]" />
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium text-[var(--color-midnight-900)] flex items-center gap-2" style={{ fontFamily: 'var(--font-family-display)' }}>
          <Sparkles className="h-5 w-5 text-[var(--color-accent-500)]" />
          {title || "AI Insight"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-[var(--color-charcoal-700)] leading-relaxed">{insight}</p>
        {confidence && (
          <div className="mt-4 flex items-center gap-2">
            <Badge className="bg-[var(--color-accent-100)] text-[var(--color-accent-700)] hover:bg-[var(--color-accent-100)]">
              {Math.round(confidence * 100)}% confidence
            </Badge>
            {source && <span className="text-xs text-[var(--color-charcoal-500)]">Based on {source}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
});

// Chart Placeholder Widget
const ChartCard = React.memo(({ config }) => {
  const { title, chartType = "bar", data } = config || {};
  const ChartIcon = chartType === "pie" ? PieChart : chartType === "line" ? LineChart : BarChart3;

  return (
    <Card className="h-full border border-[var(--color-background-300)] bg-[var(--color-background-50)] shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium text-[var(--color-midnight-900)] flex items-center gap-2" style={{ fontFamily: 'var(--font-family-display)' }}>
          <ChartIcon className="h-4 w-4 text-[var(--color-charcoal-500)]" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-48 bg-gradient-to-br from-[var(--color-background-100)] to-[var(--color-background-200)] rounded-xl flex items-center justify-center">
          <ChartIcon className="h-16 w-16 text-[var(--color-background-400)]" />
        </div>
      </CardContent>
    </Card>
  );
});

// Table Widget
const TableCard = React.memo(({ config }) => {
  const { title, columns = [], rows = [] } = config || {};

  return (
    <Card className="h-full border border-[var(--color-background-300)] bg-[var(--color-background-50)] shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium text-[var(--color-midnight-900)] flex items-center gap-2" style={{ fontFamily: 'var(--font-family-display)' }}>
          <Table className="h-4 w-4 text-[var(--color-charcoal-500)]" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-lg border border-[var(--color-background-300)]">
          <table className="w-full text-sm">
            <thead className="bg-[var(--color-background-100)]">
              <tr>
                {columns.map((col, i) => (
                  <th key={i} className="text-left py-3 px-4 font-medium text-[var(--color-midnight-700)]">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-background-200)]">
              {rows.slice(0, 5).map((row, i) => (
                <tr key={i} className="hover:bg-[var(--color-primary-50)] transition-colors">
                  {row.map((cell, j) => (
                    <td key={j} className="py-3 px-4 text-[var(--color-charcoal-600)]">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
});

// Main Widget Renderer
const WidgetRenderer = ({ widget, customConfig }) => {
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
        <Card className="h-full border border-[var(--color-background-300)] bg-[var(--color-background-50)]">
          <CardContent className="pt-6 text-center text-[var(--color-charcoal-500)]">
            Unknown widget type: {widget.widget_type}
          </CardContent>
        </Card>
      );
  }
};

export default React.memo(WidgetRenderer, (prevProps, nextProps) => {
  return (
    prevProps.widget.id === nextProps.widget.id &&
    JSON.stringify(prevProps.widget.config) === JSON.stringify(nextProps.widget.config) &&
    JSON.stringify(prevProps.customConfig) === JSON.stringify(nextProps.customConfig)
  );
});