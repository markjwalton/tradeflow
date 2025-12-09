import React from "react";
import { Badge } from "@/components/ui/badge";
import { Key, Link2, ChevronDown, ChevronRight } from "lucide-react";

const fieldTypeColors = {
  string: "text-success",
  number: "text-info",
  boolean: "text-warning",
  array: "text-accent",
  object: "text-accent",
};

export default function ERDEntityBox({
  entity,
  position,
  isSelected,
  isConnecting,
  isExpanded,
  onToggleExpand,
  onSelect,
  onDragStart,
  onDoubleClick,
}) {
  const properties = entity.schema?.properties || {};
  const required = entity.schema?.required || [];
  const fields = Object.entries(properties);

  return (
    <div
      className={`absolute bg-card rounded-lg shadow-lg border-2 cursor-pointer select-none transition-all ${
        isSelected
          ? "border-primary ring-2 ring-primary/20"
          : isConnecting
          ? "border-success hover:border-success"
          : "border-border hover:border-border"
      }`}
      style={{
        left: position.x,
        top: position.y,
        width: 280,
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        onDoubleClick();
      }}
      onMouseDown={(e) => {
        if (e.button === 0 && !isConnecting) {
          e.stopPropagation();
          onDragStart(e);
        }
      }}
    >
      {/* Entity Header */}
      <div 
        className={`bg-gradient-to-r from-primary to-accent text-primary-foreground px-3 py-2 ${isExpanded ? 'rounded-t-md' : 'rounded-md'} flex items-center justify-between`}
        onClick={(e) => {
          e.stopPropagation();
          onToggleExpand();
          onSelect();
        }}
      >
        <div className="flex items-center gap-1">
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
          <span className="font-semibold text-sm">{entity.name}</span>
        </div>
        <Badge variant="secondary" className="bg-primary-foreground/20 text-primary-foreground text-xs">
          {fields.length}
        </Badge>
      </div>

      {/* Fields - Collapsible */}
      {isExpanded && (
        <>
          <div className="p-2 max-h-64 overflow-auto">
            {fields.length === 0 ? (
              <p className="text-xs text-muted-foreground italic p-2">No fields defined</p>
            ) : (
              <table className="w-full text-xs">
                <tbody>
                  {fields.map(([fieldName, fieldDef]) => {
                    const isRequired = required.includes(fieldName);
                    const isPrimaryKey = fieldName === "id";
                    const isForeignKey = fieldName.endsWith("_id") || fieldName.endsWith("Id");
                    
                    return (
                      <tr 
                        key={fieldName} 
                        className="border-b border-border last:border-0 hover:bg-muted"
                      >
                        <td className="py-1.5 pr-2">
                          <div className="flex items-center gap-1">
                            {isPrimaryKey && (
                              <Key className="h-3 w-3 text-warning" />
                            )}
                            {isForeignKey && !isPrimaryKey && (
                              <Link2 className="h-3 w-3 text-info" />
                            )}
                            <span className={`font-medium ${isRequired ? "" : "text-muted-foreground"}`}>
                              {fieldName}
                            </span>
                            {isRequired && <span className="text-destructive">*</span>}
                          </div>
                        </td>
                        <td className={`py-1.5 text-right ${fieldTypeColors[fieldDef.type] || "text-muted-foreground"}`}>
                          {fieldDef.type}
                          {fieldDef.enum && (
                            <span className="text-muted-foreground ml-1">
                              [{fieldDef.enum.length}]
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Relationships indicator */}
          {entity.relationships?.length > 0 && (
            <div className="px-2 pb-2">
              <div className="flex flex-wrap gap-1">
                {entity.relationships.map((rel, idx) => (
                  <Badge 
                    key={idx} 
                    variant="outline" 
                    className="text-[10px] px-1.5 py-0"
                  >
                    → {rel.target_entity}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}