import React, { useState, useRef, useEffect } from "react";
import MindMapNodeComponent from "./MindMapNode";
import MindMapConnectionComponent from "./MindMapConnection";

export default function MindMapCanvas({
  nodes,
  connections,
  selectedNodeId,
  selectedConnectionId,
  onSelectNode,
  onSelectConnection,
  onUpdateNodePosition,
  onDoubleClickNode,
  onCanvasClick,
}) {
  const canvasRef = useRef(null);
  const [dragging, setDragging] = useState(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  const handleDragStart = (e, node) => {
    const rect = canvasRef.current.getBoundingClientRect();
    setDragging(node.id);
    setOffset({
      x: e.clientX - rect.left - pan.x - (node.position_x || 0),
      y: e.clientY - rect.top - pan.y - (node.position_y || 0),
    });
  };

  const handleMouseMove = (e) => {
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
      return;
    }
    
    if (!dragging) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const newX = e.clientX - rect.left - pan.x - offset.x;
    const newY = e.clientY - rect.top - pan.y - offset.y;
    onUpdateNodePosition(dragging, newX, newY);
  };

  const handleMouseUp = () => {
    setDragging(null);
    setIsPanning(false);
  };

  const handleCanvasMouseDown = (e) => {
    if (e.target === canvasRef.current || e.target.tagName === "svg") {
      if (e.button === 1 || (e.button === 0 && e.altKey)) {
        setIsPanning(true);
        setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      } else {
        onCanvasClick();
      }
    }
  };

  useEffect(() => {
    window.addEventListener("mouseup", handleMouseUp);
    return () => window.removeEventListener("mouseup", handleMouseUp);
  }, []);

  return (
    <div
      ref={canvasRef}
      className="relative w-full h-full overflow-hidden bg-slate-50"
      style={{ 
        backgroundImage: "radial-gradient(circle, #cbd5e1 1px, transparent 1px)",
        backgroundSize: "20px 20px",
      }}
      onMouseMove={handleMouseMove}
      onMouseDown={handleCanvasMouseDown}
    >
      {/* SVG layer for connections */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ transform: `translate(${pan.x}px, ${pan.y}px)` }}
      >
        <g className="pointer-events-auto">
          {connections.map((conn) => (
            <MindMapConnectionComponent
              key={conn.id}
              connection={conn}
              sourceNode={nodes.find((n) => n.id === conn.source_node_id)}
              targetNode={nodes.find((n) => n.id === conn.target_node_id)}
              isSelected={selectedConnectionId === conn.id}
              onSelect={onSelectConnection}
            />
          ))}
        </g>
      </svg>

      {/* Nodes layer */}
      <div
        className="absolute inset-0"
        style={{ transform: `translate(${pan.x}px, ${pan.y}px)` }}
      >
        {nodes.map((node) => (
          <MindMapNodeComponent
            key={node.id}
            node={node}
            isSelected={selectedNodeId === node.id}
            onSelect={onSelectNode}
            onDragStart={handleDragStart}
            onDragEnd={handleMouseUp}
            onDoubleClick={onDoubleClickNode}
          />
        ))}
      </div>
    </div>
  );
}