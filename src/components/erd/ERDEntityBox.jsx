import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Key, Link2, ChevronDown, ChevronRight } from "lucide-react";

const fieldTypeColors = {
  string: "text-green-600",
  number: "text-blue-600",
  boolean: "text-orange-600",
  array: "text-purple-600",
  object: "text-pink-600",
};

export default function ERDEntityBox({
  entity,
  position,
  isSelected,
  isConnecting,
  onSelect,
  onDragStart,
  onDoubleClick,
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const properties = entity.schema?.properties || {};
  const required = entity.schema?.required || [];
  const fields = Object.entries(properties);

  return (
    <div
      className={`absolute bg-white rounded-lg shadow-lg border-2 cursor-pointer select-none transition-all ${
        isSelected
          ? "border-indigo-500 ring-2 ring-indigo-200"
          : isConnecting
          ? "border-green-400 hover:border-green-500"
          : "border-gray-200 hover:border-gray-300"
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
        className={`bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-3 py-2 ${isExpanded ? 'rounded-t-md' : 'rounded-md'} flex items-center justify-between`}
        onClick={(e) => {
          e.stopPropagation();
          setIsExpanded(!isExpanded);
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
        <Badge variant="secondary" className="bg-white/20 text-white text-xs">
          {fields.length}
        </Badge>
      </div>

      {/* Fields - Collapsible */}
      {isExpanded && (
        <>
          <div className="p-2 max-h-64 overflow-auto">
            {fields.length === 0 ? (
              <p className="text-xs text-gray-400 italic p-2">No fields defined</p>
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
                        className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                      >
                        <td className="py-1.5 pr-2">
                          <div className="flex items-center gap-1">
                            {isPrimaryKey && (
                              <Key className="h-3 w-3 text-yellow-500" />
                            )}
                            {isForeignKey && !isPrimaryKey && (
                              <Link2 className="h-3 w-3 text-blue-400" />
                            )}
                            <span className={`font-medium ${isRequired ? "text-gray-900" : "text-gray-600"}`}>
                              {fieldName}
                            </span>
                            {isRequired && <span className="text-red-400">*</span>}
                          </div>
                        </td>
                        <td className={`py-1.5 text-right ${fieldTypeColors[fieldDef.type] || "text-gray-500"}`}>
                          {fieldDef.type}
                          {fieldDef.enum && (
                            <span className="text-gray-400 ml-1">
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