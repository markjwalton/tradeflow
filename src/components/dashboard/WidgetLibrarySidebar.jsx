import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ChevronLeft, ChevronRight, Search, Plus, Sparkles,
  BarChart3, Info, Zap, Table, PieChart, ArrowRight,
  ChevronDown, Folder, FolderOpen
} from "lucide-react";

const widgetTypeIcons = {
  stat_card: BarChart3,
  info_card: Info,
  quick_action: Zap,
  ai_insight: Sparkles,
  chart: PieChart,
  table: Table,
  custom: ArrowRight
};

export default function WidgetLibrarySidebar({ 
  widgets, 
  isCollapsed, 
  onToggleCollapse, 
  onAddWidget,
  onGenerateAI 
}) {
  const [search, setSearch] = useState("");
  const [expandedCategories, setExpandedCategories] = useState(new Set(["Quick Actions"]));

  const toggleCategory = (cat) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  // Filter and group widgets
  const filteredWidgets = widgets.filter(w => 
    w.status === "published" &&
    (w.name.toLowerCase().includes(search.toLowerCase()) ||
     w.widget_type.toLowerCase().includes(search.toLowerCase()))
  );

  const grouped = filteredWidgets.reduce((acc, w) => {
    const cat = w.category || "Uncategorized";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(w);
    return acc;
  }, {});

  const categories = Object.keys(grouped).sort();

  if (isCollapsed) {
    return (
      <div className="w-12 bg-[var(--color-background-paper)] border-r border-[var(--color-background-muted)] flex flex-col items-center py-4 flex-shrink-0">
        <Button variant="ghost" size="icon" onClick={onToggleCollapse}>
          <ChevronRight className="h-4 w-4 text-[var(--color-charcoal)]" />
        </Button>
        <div className="mt-4 space-y-2">
          {Object.values(widgetTypeIcons).slice(0, 5).map((Icon, i) => (
            <div key={i} className="p-2 text-[var(--color-charcoal)]">
              <Icon className="h-4 w-4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-64 bg-[var(--color-background-paper)] border-r border-[var(--color-background-muted)] flex flex-col flex-shrink-0">
      {/* Header */}
      <div className="p-3 border-b border-[var(--color-background-muted)] flex items-center justify-between">
        <h3 className="font-medium text-sm text-[var(--color-midnight)]">Widget Library</h3>
        <Button variant="ghost" size="icon" onClick={onToggleCollapse}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>

      {/* Search */}
      <div className="p-3 border-b border-[var(--color-background-muted)]">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-charcoal)]" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search widgets..."
            className="pl-8 h-8 text-sm"
          />
        </div>
      </div>

      {/* AI Generate Button */}
      <div className="p-3 border-b border-[var(--color-background-muted)]">
        <Button 
          onClick={onGenerateAI} 
          className="w-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-dark)] text-white text-sm"
          size="sm"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          AI Recommend Widgets
        </Button>
      </div>

      {/* Widget List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {categories.map(category => {
            const catWidgets = grouped[category];
            const isExpanded = expandedCategories.has(category);

            return (
              <div key={category}>
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded hover:bg-[var(--color-background)]"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-3 w-3 text-[var(--color-charcoal)]" />
                  ) : (
                    <ChevronRight className="h-3 w-3 text-[var(--color-charcoal)]" />
                  )}
                  {isExpanded ? (
                    <FolderOpen className="h-3 w-3 text-[var(--color-secondary)]" />
                  ) : (
                    <Folder className="h-3 w-3 text-[var(--color-secondary)]" />
                  )}
                  <span className="flex-1 text-left font-medium text-[var(--color-midnight)]">{category}</span>
                  <Badge variant="secondary" className="text-xs h-5">
                    {catWidgets.length}
                  </Badge>
                </button>

                {isExpanded && (
                  <div className="ml-4 mt-1 space-y-1">
                    {catWidgets.map(widget => {
                      const Icon = widgetTypeIcons[widget.widget_type] || Info;
                      return (
                        <div
                          key={widget.id}
                          className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-[var(--color-background)] cursor-pointer group"
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData("widget_id", widget.id);
                          }}
                        >
                          <Icon className="h-3 w-3 text-[var(--color-charcoal)]" />
                          <span className="text-sm flex-1 truncate text-[var(--color-midnight)]">{widget.name}</span>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-5 w-5 opacity-0 group-hover:opacity-100"
                            onClick={() => onAddWidget(widget)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {categories.length === 0 && (
            <div className="text-center py-8 text-[var(--color-charcoal)] text-sm">
              No widgets found
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}