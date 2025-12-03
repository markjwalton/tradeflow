import React from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Settings, GripVertical, BarChart3, Info, Zap, Sparkles, PieChart, Table } from "lucide-react";

const widgetTypeIcons = {
  stat_card: BarChart3,
  info_card: Info,
  quick_action: Zap,
  ai_insight: Sparkles,
  chart: PieChart,
  table: Table
};

export default function DashboardSettings({
  isOpen,
  onClose,
  settings,
  onSettingsChange,
  allWidgets = [],
  visibleWidgetIds = [],
  onVisibleWidgetsChange
}) {
  const handleToggle = (key) => {
    onSettingsChange({ ...settings, [key]: !settings[key] });
  };

  const handleWidgetToggle = (widgetId) => {
    if (visibleWidgetIds.includes(widgetId)) {
      onVisibleWidgetsChange(visibleWidgetIds.filter(id => id !== widgetId));
    } else {
      onVisibleWidgetsChange([...visibleWidgetIds, widgetId]);
    }
  };

  const handleSelectAll = () => {
    onVisibleWidgetsChange(allWidgets.map(w => w.id));
  };

  const handleDeselectAll = () => {
    onVisibleWidgetsChange([]);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Dashboard Settings
          </SheetTitle>
          <SheetDescription>
            Customize your dashboard layout and visible widgets
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Layout Options */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-slate-900">Layout Options</h3>
            
            <div className="flex items-center justify-between py-2">
              <div>
                <Label htmlFor="drag-drop" className="font-medium">Enable Drag & Drop</Label>
                <p className="text-sm text-slate-500">Rearrange widgets by dragging</p>
              </div>
              <Switch
                id="drag-drop"
                checked={settings.enableDragDrop || false}
                onCheckedChange={() => handleToggle("enableDragDrop")}
              />
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <Label htmlFor="compact" className="font-medium">Compact Mode</Label>
                <p className="text-sm text-slate-500">Reduce spacing between widgets</p>
              </div>
              <Switch
                id="compact"
                checked={settings.compactMode || false}
                onCheckedChange={() => handleToggle("compactMode")}
              />
            </div>
          </div>

          {/* Widget Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm text-slate-900">Visible Widgets</h3>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={handleSelectAll}>
                  Select All
                </Button>
                <Button variant="ghost" size="sm" onClick={handleDeselectAll}>
                  Clear
                </Button>
              </div>
            </div>
            
            <ScrollArea className="h-[300px] border rounded-lg p-2">
              <div className="space-y-2">
                {allWidgets.map(widget => {
                  const Icon = widgetTypeIcons[widget.widget_type] || Info;
                  const isChecked = visibleWidgetIds.includes(widget.id);
                  
                  return (
                    <div 
                      key={widget.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                        isChecked ? "bg-slate-50 border-slate-300" : "bg-white border-slate-200"
                      }`}
                    >
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={() => handleWidgetToggle(widget.id)}
                      />
                      <Icon className="h-4 w-4 text-slate-500" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{widget.name}</p>
                        <p className="text-xs text-slate-500 truncate">{widget.category}</p>
                      </div>
                      {settings.enableDragDrop && (
                        <GripVertical className="h-4 w-4 text-slate-300" />
                      )}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}