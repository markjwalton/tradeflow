import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Settings, Palette, Database, RefreshCw, Eye } from "lucide-react";

// Config schema definitions per widget type
const widgetConfigSchemas = {
  stat_card: {
    display: [
      { key: "title", label: "Title", type: "text" },
      { key: "value", label: "Value Template", type: "text", placeholder: "{{entity.count}}" },
      { key: "change", label: "Change Text", type: "text" },
      { key: "changeType", label: "Change Direction", type: "select", options: ["up", "down", "neutral"] },
      { key: "color", label: "Color", type: "select", options: ["blue", "green", "amber", "red", "purple", "gray"] },
    ],
    data: [
      { key: "dataSource", label: "Data Source Entity", type: "text" },
      { key: "filterField", label: "Filter Field", type: "text" },
      { key: "filterValue", label: "Filter Value", type: "text" },
    ],
    settings: [
      { key: "refreshInterval", label: "Refresh Interval (sec)", type: "number" },
    ]
  },
  info_card: {
    display: [
      { key: "title", label: "Title", type: "text" },
      { key: "content", label: "Content", type: "textarea" },
      { key: "variant", label: "Variant", type: "select", options: ["default", "info", "success", "warning", "error"] },
      { key: "showIcon", label: "Show Icon", type: "boolean" },
    ],
    data: [],
    settings: []
  },
  quick_action: {
    display: [
      { key: "title", label: "Title", type: "text" },
      { key: "description", label: "Description", type: "text" },
    ],
    data: [],
    settings: [
      { key: "actions", label: "Actions (JSON)", type: "json" },
    ]
  },
  chart: {
    display: [
      { key: "title", label: "Title", type: "text" },
      { key: "chartType", label: "Chart Type", type: "select", options: ["bar", "line", "pie", "area"] },
      { key: "showLegend", label: "Show Legend", type: "boolean" },
    ],
    data: [
      { key: "dataSource", label: "Data Source Entity", type: "text" },
      { key: "aggregation", label: "Aggregation", type: "select", options: ["count", "sum", "avg"] },
      { key: "field", label: "Value Field", type: "text" },
      { key: "groupBy", label: "Group By", type: "text" },
    ],
    settings: [
      { key: "colors", label: "Colors (comma-separated)", type: "text" },
    ]
  },
  table: {
    display: [
      { key: "title", label: "Title", type: "text" },
    ],
    data: [
      { key: "dataSource", label: "Data Source Entity", type: "text" },
      { key: "columns", label: "Columns (comma-separated)", type: "text" },
      { key: "limit", label: "Row Limit", type: "number" },
      { key: "sortBy", label: "Sort By Field", type: "text" },
      { key: "sortOrder", label: "Sort Order", type: "select", options: ["asc", "desc"] },
    ],
    settings: []
  },
  ai_insight: {
    display: [
      { key: "title", label: "Title", type: "text" },
      { key: "insight", label: "Insight Text", type: "textarea" },
      { key: "confidence", label: "Confidence (0-1)", type: "number" },
      { key: "source", label: "Data Source", type: "text" },
    ],
    data: [],
    settings: [
      { key: "refreshDaily", label: "Refresh Daily", type: "boolean" },
    ]
  }
};

export default function WidgetConfigEditor({ widget, isOpen, onClose, onSave }) {
  const [config, setConfig] = useState({});
  const [activeSection, setActiveSection] = useState("display");

  useEffect(() => {
    if (widget?.config) {
      setConfig({ ...widget.config });
    }
  }, [widget]);

  const schema = widgetConfigSchemas[widget?.widget_type] || { display: [], data: [], settings: [] };

  const handleChange = (key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    onSave({ ...widget, config });
  };

  const renderField = (field) => {
    const value = config[field.key];

    switch (field.type) {
      case "text":
        return (
          <Input
            value={value || ""}
            onChange={(e) => handleChange(field.key, e.target.value)}
            placeholder={field.placeholder}
          />
        );
      case "textarea":
        return (
          <Textarea
            value={value || ""}
            onChange={(e) => handleChange(field.key, e.target.value)}
            rows={3}
          />
        );
      case "number":
        return (
          <Input
            type="number"
            value={value || ""}
            onChange={(e) => handleChange(field.key, parseFloat(e.target.value) || 0)}
          />
        );
      case "boolean":
        return (
          <Switch
            checked={value || false}
            onCheckedChange={(v) => handleChange(field.key, v)}
          />
        );
      case "select":
        return (
          <Select value={value || ""} onValueChange={(v) => handleChange(field.key, v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              {field.options.map(opt => (
                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case "json":
        return (
          <Textarea
            value={typeof value === "object" ? JSON.stringify(value, null, 2) : value || ""}
            onChange={(e) => {
              try {
                handleChange(field.key, JSON.parse(e.target.value));
              } catch {
                // Keep as string if invalid JSON
              }
            }}
            rows={4}
            className="font-mono text-sm"
          />
        );
      default:
        return null;
    }
  };

  const renderSection = (fields, icon, title) => {
    if (fields.length === 0) return null;
    
    return (
      <AccordionItem value={title.toLowerCase()}>
        <AccordionTrigger className="text-sm">
          <div className="flex items-center gap-2">
            {icon}
            {title}
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4 pt-2">
            {fields.map(field => (
              <div key={field.key}>
                <Label className="text-xs text-[var(--color-charcoal)]">{field.label}</Label>
                {renderField(field)}
              </div>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Widget Settings: {widget?.name}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          <Accordion type="multiple" defaultValue={["display"]} className="w-full">
            {renderSection(schema.display, <Eye className="h-4 w-4" />, "Display")}
            {renderSection(schema.data, <Database className="h-4 w-4" />, "Data Source")}
            {renderSection(schema.settings, <RefreshCw className="h-4 w-4" />, "Settings")}
          </Accordion>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-[var(--color-background-muted)]">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white">Save Changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}