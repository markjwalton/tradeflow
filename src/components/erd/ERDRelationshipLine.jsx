import React, { useState } from "react";
import { Trash2 } from "lucide-react";

export default function ERDRelationshipLine({
  relationship,
  points,
  onDelete,
}) {
  const [isHovered, setIsHovered] = useState(false);
  const { startX, startY, endX, endY } = points;

  // Calculate midpoint for label
  const midX = (startX + endX) / 2;
  const midY = (startY + endY) / 2;

  // Calculate control points for curved line
  const dx = endX - startX;
  const dy = endY - startY;
  const cx1 = startX + dx * 0.5;
  const cy1 = startY;
  const cx2 = startX + dx * 0.5;
  const cy2 = endY;

  // Determine marker based on relationship type
  const getMarker = () => {
    if (relationship.relationshipType === "many-to-many") {
      return "url(#arrowhead-many)";
    }
    return "url(#arrowhead)";
  };

  // Get relationship symbol
  const getRelSymbol = () => {
    switch (relationship.relationshipType) {
      case "one-to-one":
        return "1:1";
      case "one-to-many":
        return "1:N";
      case "many-to-many":
        return "N:N";
      default:
        return "→";
    }
  };

  return (
    <g
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="cursor-pointer"
    >
      {/* Invisible wider path for easier hover */}
      <path
        d={`M ${startX} ${startY} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${endX} ${endY}`}
        stroke="transparent"
        strokeWidth="20"
        fill="none"
      />
      
      {/* Visible path */}
      <path
        d={`M ${startX} ${startY} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${endX} ${endY}`}
        stroke={isHovered ? "#4f46e5" : "#6366f1"}
        strokeWidth={isHovered ? "3" : "2"}
        fill="none"
        markerEnd={getMarker()}
        className="transition-all"
      />

      {/* Label background */}
      <rect
        x={midX - 24}
        y={midY - 10}
        width="48"
        height="20"
        rx="4"
        fill={isHovered ? "#4f46e5" : "white"}
        stroke="#6366f1"
        strokeWidth="1"
      />

      {/* Relationship type label */}
      <text
        x={midX}
        y={midY + 4}
        textAnchor="middle"
        className={`text-xs font-medium ${isHovered ? "fill-white" : "fill-indigo-600"}`}
      >
        {getRelSymbol()}
      </text>

      {/* Field name label (below main label) */}
      {relationship.fieldName && (
        <>
          <rect
            x={midX - 40}
            y={midY + 14}
            width="80"
            height="16"
            rx="2"
            fill="white"
            fillOpacity="0.9"
          />
          <text
            x={midX}
            y={midY + 25}
            textAnchor="middle"
            className="text-[10px] fill-gray-500"
          >
            {relationship.fieldName}
          </text>
        </>
      )}

      {/* Delete button on hover */}
      {isHovered && (
        <g
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="cursor-pointer"
        >
          <circle
            cx={midX + 35}
            cy={midY}
            r="10"
            fill="#ef4444"
            className="hover:fill-red-600"
          />
          <text
            x={midX + 35}
            y={midY + 4}
            textAnchor="middle"
            className="text-xs fill-white font-bold"
          >
            ×
          </text>
        </g>
      )}
    </g>
  );
}