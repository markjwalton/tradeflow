import React from "react";
import { Settings, GripVertical } from "lucide-react";
import { Draggable } from "@hello-pangea/dnd";
import WidgetRenderer from "./WidgetRenderer";

/**
 * Resolves template values like {{projects.count}} from data context
 */
export function resolveTemplateValue(value, dataContext) {
  if (!value || typeof value !== "string") return value;
  return value.replace(/\{\{(\w+)\.(\w+)\}\}/g, (match, entity, field) => {
    return dataContext[entity]?.[field] ?? "—";
  });
}

/**
 * Individual widget card with optional drag handle and config button
 */
export default function DashboardWidgetCard({ 
  widget, 
  index, 
  isDraggable = false, 
  dataContext = {},
  onConfigClick 
}) {
  // Resolve any template values in the widget config
  const resolvedWidget = {
    ...widget,
    config: widget.config ? {
      ...widget.config,
      value: resolveTemplateValue(widget.config.value, dataContext)
    } : widget.config
  };

  const content = (
    <div className="group relative h-full">
      {isDraggable && (
        <div className="absolute top-3 left-3 z-10 p-1.5 rounded-lg bg-white/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity shadow-sm cursor-grab">
          <GripVertical className="h-3.5 w-3.5 text-slate-400" />
        </div>
      )}
      <button
        onClick={() => onConfigClick?.(widget)}
        className="absolute top-3 right-3 z-10 p-1.5 rounded-lg bg-white/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-white"
      >
        <Settings className="h-3.5 w-3.5 text-slate-500" />
      </button>
      <WidgetRenderer widget={resolvedWidget} />
    </div>
  );

  if (isDraggable) {
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

  return <div>{content}</div>;
}