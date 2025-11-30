import React from "react";

export default function MindMapConnectionComponent({ 
  connection, 
  sourceNode, 
  targetNode,
  isSelected,
  onSelect 
}) {
  if (!sourceNode || !targetNode) return null;

  // Get node center positions
  const x1 = (sourceNode.position_x || 0) + 70;
  const y1 = (sourceNode.position_y || 0) + 20;
  const x2 = (targetNode.position_x || 0) + 70;
  const y2 = (targetNode.position_y || 0) + 20;

  // Simple straight line path
  const pathD = `M ${x1} ${y1} L ${x2} ${y2}`;
  const color = connection.color || "#94a3b8";

  return (
    <g onClick={(e) => { e.stopPropagation(); onSelect(connection.id); }}>
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth={isSelected ? 3 : 2}
        strokeDasharray={connection.style === "dashed" ? "5,5" : "none"}
        className="cursor-pointer transition-all"
      />
      {connection.label && (
        <text
          x={cx}
          y={cy}
          textAnchor="middle"
          className="text-xs fill-gray-500 pointer-events-none"
          dy="-5"
        >
          {connection.label}
        </text>
      )}
    </g>
  );
}