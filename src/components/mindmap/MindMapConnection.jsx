import React from "react";

export default function MindMapConnectionComponent({ 
  connection, 
  sourceNode, 
  targetNode,
  isSelected,
  onSelect 
}) {
  if (!sourceNode || !targetNode) return null;

  // Node positions are already the center point (nodes use transform: translate(-50%, -50%))
  const x1 = sourceNode.position_x || 0;
  const y1 = sourceNode.position_y || 0;
  const x2 = targetNode.position_x || 0;
  const y2 = targetNode.position_y || 0;

  // Calculate control points for a curved line
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  
  // Create a gentle curve
  const curvature = 0.15;
  const cx = midX - dy * curvature;
  const cy = midY + dx * curvature;

  const pathD = `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`;
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