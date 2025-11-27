import React from "react";

const nodeTypeStyles = {
  central: "bg-blue-600 text-white font-bold px-6 py-3 rounded-lg shadow-lg border-2 border-blue-700",
  main_branch: "bg-white border-2 px-4 py-2 rounded-lg shadow-md font-semibold",
  sub_branch: "bg-gray-50 border px-3 py-1.5 rounded-md shadow-sm text-sm",
  feature: "bg-green-50 border border-green-300 px-3 py-1.5 rounded-md text-sm text-green-800",
  entity: "bg-purple-50 border border-purple-300 px-3 py-1.5 rounded-md text-sm text-purple-800",
  page: "bg-orange-50 border border-orange-300 px-3 py-1.5 rounded-md text-sm text-orange-800",
  note: "bg-yellow-50 border border-yellow-200 px-2 py-1 rounded text-xs text-yellow-800 italic",
};

export default function MindMapNodeComponent({ 
  node, 
  isSelected, 
  onSelect, 
  onDragStart,
  onDragEnd,
  onDoubleClick 
}) {
  const baseStyle = nodeTypeStyles[node.node_type] || nodeTypeStyles.sub_branch;
  const borderColor = node.color || "#3b82f6";
  
  return (
    <div
      className={`absolute cursor-move select-none transition-shadow ${baseStyle} ${
        isSelected ? "ring-2 ring-blue-500 ring-offset-2" : ""
      }`}
      style={{
        left: node.position_x || 0,
        top: node.position_y || 0,
        borderColor: node.node_type === "main_branch" ? borderColor : undefined,
        transform: "translate(-50%, -50%)",
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(node.id);
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        onDoubleClick(node);
      }}
      onMouseDown={(e) => {
        if (e.button === 0) {
          onDragStart(e, node);
        }
      }}
    >
      {node.text}
    </div>
  );
}