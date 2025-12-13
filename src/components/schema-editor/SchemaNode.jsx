import React from "react";
import { Handle, Position } from "reactflow";
import { Database } from "lucide-react";

export default function SchemaNode({ data }) {
  return (
    <div className="px-6 py-4 shadow-lg rounded-lg bg-primary text-primary-foreground border-2 border-primary min-w-[200px]">
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      <div className="flex items-center gap-2 mb-2">
        <Database className="h-5 w-5" />
        <div className="text-lg font-semibold">{data.label}</div>
      </div>
      <div className="text-xs opacity-80">{data.type}</div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  );
}