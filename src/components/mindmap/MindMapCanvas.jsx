import React, { useState, useRef, useEffect, useCallback } from "react";
import MindMapNodeComponent from "./MindMapNode";
import MindMapConnectionComponent from "./MindMapConnection";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, Maximize2, Minimize2, RotateCcw } from "lucide-react";

export default function MindMapCanvas({
  nodes,
  connections,
  allConnections,
  selectedNodeId,
  selectedConnectionId,
  onSelectNode,
  onSelectConnection,
  onUpdateNodePosition,
  onDoubleClickNode,
  onCanvasClick,
  onToggleCollapse,
}) {
  const canvasRef = useRef(null);
  const [dragging, setDragging] = useState(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isExpanded, setIsExpanded] = useState(false);

  // Use refs to track current values for the window event listener
  const draggingRef = useRef(null);
  const dragPositionRef = useRef({ x: 0, y: 0 });

  const handleDragStart = (e, node) => {
    e.preventDefault();
    const rect = canvasRef.current.getBoundingClientRect();
    const nodeX = node.position_x || 0;
    const nodeY = node.position_y || 0;
    setDragging(node.id);
    draggingRef.current = node.id;
    setDragPosition({ x: nodeX, y: nodeY });
    dragPositionRef.current = { x: nodeX, y: nodeY };
    setOffset({
      x: e.clientX - rect.left - pan.x - nodeX,
      y: e.clientY - rect.top - pan.y - nodeY,
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
    setDragPosition({ x: newX, y: newY });
    dragPositionRef.current = { x: newX, y: newY };
  };

  const handleMouseUp = () => {
    if (draggingRef.current && dragPositionRef.current) {
      onUpdateNodePosition(draggingRef.current, dragPositionRef.current.x, dragPositionRef.current.y);
    }
    setDragging(null);
    draggingRef.current = null;
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
  }, [onUpdateNodePosition]);

  // Zoom handlers
  const handleZoomIn = () => setZoom(z => Math.min(z + 0.1, 2));
  const handleZoomOut = () => setZoom(z => Math.max(z - 0.1, 0.3));
  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Fit all nodes to view or expand to see all
  const handleFitToView = useCallback(() => {
    if (nodes.length === 0 || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const padding = 80;
    
    // Calculate bounds of all nodes
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    nodes.forEach(node => {
      const x = node.position_x || 0;
      const y = node.position_y || 0;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x + 150); // approximate node width
      maxY = Math.max(maxY, y + 50);  // approximate node height
    });
    
    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;
    const viewWidth = rect.width - padding * 2;
    const viewHeight = rect.height - padding * 2;
    
    // Calculate zoom to fit
    const scaleX = viewWidth / contentWidth;
    const scaleY = viewHeight / contentHeight;
    const newZoom = Math.min(scaleX, scaleY, 1.5); // cap at 1.5x
    
    // Calculate pan to center
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const newPanX = rect.width / 2 - centerX * newZoom;
    const newPanY = rect.height / 2 - centerY * newZoom;
    
    setZoom(Math.max(newZoom, 0.3));
    setPan({ x: newPanX, y: newPanY });
    setIsExpanded(false);
  }, [nodes]);

  const handleExpandView = useCallback(() => {
    if (nodes.length === 0 || !canvasRef.current) return;
    
    // Calculate bounds and set zoom to show all at 100%
    let minX = Infinity, minY = Infinity;
    nodes.forEach(node => {
      const x = node.position_x || 0;
      const y = node.position_y || 0;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
    });
    
    // Pan to show content from top-left with some padding
    setZoom(1);
    setPan({ x: -minX + 50, y: -minY + 50 });
    setIsExpanded(true);
  }, [nodes]);

  // Mouse wheel zoom
  const handleWheel = (e) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setZoom(z => Math.max(0.3, Math.min(2, z + delta)));
    }
  };

  return (
    <div
      ref={canvasRef}
      className="relative w-full h-full overflow-hidden bg-slate-50"
      style={{ 
        backgroundImage: "radial-gradient(circle, #cbd5e1 1px, transparent 1px)",
        backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
      }}
      onMouseMove={handleMouseMove}
      onMouseDown={handleCanvasMouseDown}
      onWheel={handleWheel}
    >
      {/* Zoom Controls */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-white rounded-lg shadow-md border p-1">
        <Button
          size="sm"
          variant="ghost"
          onClick={handleZoomOut}
          className="h-8 w-8 p-0"
          title="Zoom Out"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <span className="text-xs font-medium w-12 text-center">{Math.round(zoom * 100)}%</span>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleZoomIn}
          className="h-8 w-8 p-0"
          title="Zoom In"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <div className="w-px h-5 bg-gray-200 mx-1" />
        <Button
          size="sm"
          variant="ghost"
          onClick={isExpanded ? handleFitToView : handleExpandView}
          className="h-8 w-8 p-0"
          title={isExpanded ? "Fit to View" : "Expand View"}
        >
          {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleResetView}
          className="h-8 w-8 p-0"
          title="Reset View"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      {/* SVG layer for connections */}
      <svg
        className="absolute inset-0 pointer-events-none"
        style={{ 
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: "0 0",
          width: "100%",
          height: "100%",
        }}
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
        style={{ 
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: "0 0",
        }}
      >
        {nodes.map((node) => {
          const displayNode = dragging === node.id 
            ? { ...node, position_x: dragPosition.x, position_y: dragPosition.y }
            : node;
          
          // Check if this node has children (use allConnections to include hidden ones)
          const hasChildren = (allConnections || connections).some(c => c.source_node_id === node.id);
          
          return (
            <MindMapNodeComponent
              key={node.id}
              node={displayNode}
              isSelected={selectedNodeId === node.id}
              onSelect={onSelectNode}
              onDragStart={handleDragStart}
              onDragEnd={handleMouseUp}
              onDoubleClick={onDoubleClickNode}
              hasChildren={hasChildren}
              onToggleCollapse={onToggleCollapse}
            />
          );
        })}
      </div>
    </div>
  );
}