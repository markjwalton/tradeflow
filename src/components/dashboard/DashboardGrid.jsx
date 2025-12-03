import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronRight, GripVertical, Settings, Trash2 } from "lucide-react";
import WidgetRenderer from "./WidgetRenderer";

export default function DashboardGrid({ 
  layout, 
  widgets, 
  onLayoutChange, 
  isEditing = false,
  columns = 4 
}) {
  const [collapsedGroups, setCollapsedGroups] = useState(() => {
    const collapsed = new Set();
    layout?.groups?.forEach(g => {
      if (g.collapsed_default) collapsed.add(g.id);
    });
    return collapsed;
  });

  const toggleGroup = (groupId) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  };

  // Get widgets for a group
  const getGroupWidgets = (groupId) => {
    return (layout?.widgets || [])
      .filter(w => w.group_id === groupId)
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .map(placement => ({
        ...placement,
        widget: widgets.find(w => w.id === placement.widget_id)
      }))
      .filter(w => w.widget);
  };

  // Get ungrouped widgets
  const getUngroupedWidgets = () => {
    return (layout?.widgets || [])
      .filter(w => !w.group_id)
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .map(placement => ({
        ...placement,
        widget: widgets.find(w => w.id === placement.widget_id)
      }))
      .filter(w => w.widget);
  };

  const handleDragEnd = (result) => {
    if (!result.destination || !onLayoutChange) return;

    const { source, destination, draggableId } = result;
    const sourceGroupId = source.droppableId === "ungrouped" ? null : source.droppableId;
    const destGroupId = destination.droppableId === "ungrouped" ? null : destination.droppableId;

    // Clone layout widgets
    const newWidgets = [...(layout?.widgets || [])];
    const widgetIndex = newWidgets.findIndex(w => w.widget_id === draggableId);
    
    if (widgetIndex === -1) return;

    // Update the widget's group and order
    newWidgets[widgetIndex] = {
      ...newWidgets[widgetIndex],
      group_id: destGroupId,
      order: destination.index
    };

    // Recalculate orders for all widgets in destination group
    const destWidgets = newWidgets.filter(w => w.group_id === destGroupId);
    destWidgets.sort((a, b) => (a.order || 0) - (b.order || 0));
    destWidgets.forEach((w, i) => {
      const idx = newWidgets.findIndex(nw => nw.widget_id === w.widget_id);
      if (idx !== -1) newWidgets[idx].order = i;
    });

    // Auto-span logic: fill gaps
    const autoSpannedWidgets = applyAutoSpan(newWidgets, destGroupId, columns);

    onLayoutChange({ ...layout, widgets: autoSpannedWidgets });
  };

  // Auto-span to fill gaps
  const applyAutoSpan = (layoutWidgets, groupId, cols) => {
    const groupWidgets = layoutWidgets.filter(w => w.group_id === groupId);
    let currentRow = 0;
    let currentCol = 0;

    groupWidgets.sort((a, b) => (a.order || 0) - (b.order || 0));

    return layoutWidgets.map(w => {
      if (w.group_id !== groupId) return w;

      const widget = widgets.find(wg => wg.id === w.widget_id);
      const minSpan = widget?.min_col_span || 1;
      const maxSpan = widget?.max_col_span || cols;
      let span = w.col_span || widget?.default_col_span || 1;

      // If widget doesn't fit on current row, move to next
      if (currentCol + span > cols) {
        // Check if we can expand previous widget to fill gap
        const remainingSpace = cols - currentCol;
        if (remainingSpace > 0) {
          // Find last widget on this row and expand it if possible
          const prevWidget = groupWidgets.find(gw => gw.order === w.order - 1);
          if (prevWidget) {
            const prevWidgetDef = widgets.find(wg => wg.id === prevWidget.widget_id);
            const prevMax = prevWidgetDef?.max_col_span || cols;
            const canExpand = (prevWidget.col_span || 1) + remainingSpace <= prevMax;
            if (canExpand) {
              prevWidget.col_span = (prevWidget.col_span || 1) + remainingSpace;
            }
          }
        }
        currentRow++;
        currentCol = 0;
      }

      // Auto-expand to fill remaining space if it's the last widget in row
      const remainingInRow = cols - currentCol - span;
      if (remainingInRow > 0 && remainingInRow < minSpan) {
        // Expand this widget to fill the gap
        const newSpan = Math.min(span + remainingInRow, maxSpan);
        span = newSpan;
      }

      currentCol += span;
      if (currentCol >= cols) {
        currentRow++;
        currentCol = 0;
      }

      return { ...w, col_span: span };
    });
  };

  const renderWidgetGrid = (widgetPlacements, droppableId) => (
    <Droppable droppableId={droppableId}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className={`grid gap-4 ${snapshot.isDraggingOver ? "bg-blue-50/50 rounded-lg p-2" : ""}`}
          style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
        >
          {widgetPlacements.map((placement, index) => {
            const span = Math.min(placement.col_span || placement.widget?.default_col_span || 1, columns);
            return (
              <Draggable 
                key={placement.widget_id} 
                draggableId={placement.widget_id} 
                index={index}
                isDragDisabled={!isEditing}
              >
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={`${snapshot.isDragging ? "opacity-70 z-50" : ""}`}
                    style={{
                      gridColumn: snapshot.isDragging ? 'span 1' : `span ${span}`,
                      ...provided.draggableProps.style,
                    }}
                  >
                    <div className="relative group h-full">
                      {isEditing && (
                        <div 
                          {...provided.dragHandleProps}
                          className="absolute -top-2 -left-2 z-10 p-1.5 bg-white rounded-lg shadow-md opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing transition-opacity"
                        >
                          <GripVertical className="h-4 w-4 text-gray-500" />
                        </div>
                      )}
                      {isEditing && (
                        <div className="absolute -top-2 -right-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button size="icon" variant="outline" className="h-6 w-6 bg-white shadow-sm">
                            <Settings className="h-3 w-3" />
                          </Button>
                          <Button size="icon" variant="outline" className="h-6 w-6 bg-white text-red-500 shadow-sm">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                      <WidgetRenderer 
                        widget={placement.widget} 
                        customConfig={placement.custom_config}
                      />
                    </div>
                  </div>
                )}
              </Draggable>
            );
          })}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );

  const groups = (layout?.groups || []).sort((a, b) => (a.order || 0) - (b.order || 0));
  const ungroupedWidgets = getUngroupedWidgets();

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="space-y-6">
        {/* Ungrouped widgets */}
        {ungroupedWidgets.length > 0 && (
          <div>
            {renderWidgetGrid(ungroupedWidgets, "ungrouped")}
          </div>
        )}

        {/* Grouped widgets */}
        {groups.map(group => {
          const groupWidgets = getGroupWidgets(group.id);
          const isCollapsed = collapsedGroups.has(group.id);
          const groupSpan = group.col_span || columns;

          return (
            <div 
              key={group.id}
              className={`${isCollapsed ? "" : "bg-gray-50/50 rounded-lg p-4"}`}
              style={{ gridColumn: groupSpan < columns ? `span ${groupSpan}` : undefined }}
            >
              <button
                onClick={() => toggleGroup(group.id)}
                className="flex items-center gap-2 mb-3 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                {isCollapsed ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
                {group.name}
                <Badge variant="secondary" className="text-xs">
                  {groupWidgets.length}
                </Badge>
              </button>
              {!isCollapsed && renderWidgetGrid(groupWidgets, group.id)}
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
}