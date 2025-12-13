import React from "react";
import { Handle, Position } from "@xyflow/react";
import { Type, Hash, CheckSquare, Calendar, List } from "lucide-react";

const typeIcons = {
  string: Type,
  number: Hash,
  boolean: CheckSquare,
  date: Calendar,
  array: List,
};

const typeColors = {
  string: "bg-blue-50 border-blue-300 text-blue-900",
  number: "bg-green-50 border-green-300 text-green-900",
  boolean: "bg-purple-50 border-purple-300 text-purple-900",
  date: "bg-orange-50 border-orange-300 text-orange-900",
  array: "bg-pink-50 border-pink-300 text-pink-900",
  object: "bg-indigo-50 border-indigo-300 text-indigo-900",
};

export default function PropertyNode({ data }) {
  const Icon = typeIcons[data.propertyType] || Type;
  const colorClass = typeColors[data.propertyType] || "bg-gray-50 border-gray-300 text-gray-900";

  return (
    <div className={`px-4 py-3 shadow-md rounded-lg border-2 min-w-[160px] ${colorClass}`}>
      <Handle type="target" position={Position.Top} className="w-2 h-2" />
      <div className="flex items-center gap-2 mb-1">
        <Icon className="h-4 w-4" />
        <div className="font-medium text-sm">{data.label}</div>
      </div>
      <div className="text-xs opacity-70">{data.propertyType}</div>
      {data.required && (
        <div className="text-xs mt-1 font-semibold">Required</div>
      )}
      {data.description && (
        <div className="text-xs mt-1 opacity-60 line-clamp-2">{data.description}</div>
      )}
      <Handle type="source" position={Position.Bottom} className="w-2 h-2" />
    </div>
  );
}