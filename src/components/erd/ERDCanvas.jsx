import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, Maximize2, RotateCcw } from "lucide-react";
import ERDEntityBox from "./ERDEntityBox";
import ERDRelationshipLine from "./ERDRelationshipLine";

// Track expanded state globally so canvas can access it
const expandedEntities = new Set();

export default function ERDCanvas({
  entities,
  relationships,
  positions,
  selectedEntityId,
  isConnecting,
  onSelectEntity,
  onUpdatePosition,
  onDoubleClickEntity,
  onDeleteRelationship,
}) {
  const canvasRef = useRef(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [expandedEntityIds, setExpandedEntityIds] = useState(new Set());

  const handleToggleExpand = (entityId) => {
    setExpandedEntityIds(prev => {
      const next = new Set(prev);
      if (next.has(entityId)) {
        next.delete(entityId);
      } else {
        next.add(entityId);
      }
      return next;
    });
  };

  // Get entity position (from positions map or default)
  const getEntityPosition = (entityId, index) => {
    if (positions[entityId]) {
      return positions[entityId];
    }
    // Default grid layout
    const cols = Math.ceil(Math.sqrt(entities.length));
    const col = index % cols;
    const row = Math.floor(index / cols);
    return {
      x: 100 + col * 320,
      y: 100 + row * 280,
    };
  };

  // Handle canvas pan
  const handleMouseDown = (e) => {
    if (e.target === canvasRef.current || e.target.tagName === "svg") {
      if (e.button === 0) {
        setIsPanning(true);
        setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      }
    }
  };

  const handleMouseMove = (e) => {
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    }
    
    if (dragging) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - pan.x) / zoom - dragOffset.x;
      const y = (e.clientY - rect.top - pan.y) / zoom - dragOffset.y;
      onUpdatePosition(dragging, x, y);
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setDragging(null);
  };

  // Handle entity drag
  const handleEntityDragStart = (entityId, e) => {
    const entityIndex = entities.findIndex(ent => ent.id === entityId);
    const pos = getEntityPosition(entityId, entityIndex);
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left - pan.x) / zoom;
    const mouseY = (e.clientY - rect.top - pan.y) / zoom;
    
    setDragging(entityId);
    setDragOffset({
      x: mouseX - pos.x,
      y: mouseY - pos.y,
    });
  };

  // Zoom handlers
  const handleZoomIn = () => setZoom(z => Math.min(z + 0.1, 2));
  const handleZoomOut = () => setZoom(z => Math.max(z - 0.1, 0.3));
  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleWheel = (e) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setZoom(z => Math.max(0.3, Math.min(2, z + delta)));
    }
  };

  // Calculate connection points for relationships
  const getConnectionPoints = (sourceEntity, targetEntity, sourceIndex, targetIndex) => {
    const sourcePos = getEntityPosition(sourceEntity.id, sourceIndex);
    const targetPos = getEntityPosition(targetEntity.id, targetIndex);
    
    const sourceWidth = 280;
    const sourceExpanded = expandedEntityIds.has(sourceEntity.id);
    const targetExpanded = expandedEntityIds.has(targetEntity.id);
    const sourceHeight = sourceExpanded ? 40 + Object.keys(sourceEntity.schema?.properties || {}).length * 28 : 36;
    const targetWidth = 280;
    const targetHeight = targetExpanded ? 40 + Object.keys(targetEntity.schema?.properties || {}).length * 28 : 36;
    
    const sourceCenterX = sourcePos.x + sourceWidth / 2;
    const sourceCenterY = sourcePos.y + sourceHeight / 2;
    const targetCenterX = targetPos.x + targetWidth / 2;
    const targetCenterY = targetPos.y + targetHeight / 2;
    
    // Determine which sides to connect
    const dx = targetCenterX - sourceCenterX;
    const dy = targetCenterY - sourceCenterY;
    
    let startX, startY, endX, endY;
    
    if (Math.abs(dx) > Math.abs(dy)) {
      // Horizontal connection
      if (dx > 0) {
        startX = sourcePos.x + sourceWidth;
        endX = targetPos.x;
      } else {
        startX = sourcePos.x;
        endX = targetPos.x + targetWidth;
      }
      startY = sourceCenterY;
      endY = targetCenterY;
    } else {
      // Vertical connection
      if (dy > 0) {
        startY = sourcePos.y + sourceHeight;
        endY = targetPos.y;
      } else {
        startY = sourcePos.y;
        endY = targetPos.y + targetHeight;
      }
      startX = sourceCenterX;
      endX = targetCenterX;
    }
    
    return { startX, startY, endX, endY };
  };

  return (
    <div
      ref={canvasRef}
      className="relative w-full h-full overflow-hidden bg-slate-100"
      style={{
        backgroundImage: "radial-gradient(circle, #cbd5e1 1px, transparent 1px)",
        backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
        cursor: isPanning ? "grabbing" : isConnecting ? "crosshair" : "default",
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      {/* Zoom Controls */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-white rounded-lg shadow-md border p-1">
        <Button size="sm" variant="ghost" onClick={handleZoomOut} className="h-8 w-8 p-0">
          <ZoomOut className="h-4 w-4" />
        </Button>
        <span className="text-xs font-medium w-12 text-center">{Math.round(zoom * 100)}%</span>
        <Button size="sm" variant="ghost" onClick={handleZoomIn} className="h-8 w-8 p-0">
          <ZoomIn className="h-4 w-4" />
        </Button>
        <div className="w-px h-5 bg-gray-200 mx-1" />
        <Button size="sm" variant="ghost" onClick={handleResetView} className="h-8 w-8 p-0">
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      {/* SVG layer for relationship lines */}
      <svg
        className="absolute inset-0 pointer-events-none"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: "0 0",
          width: "5000px",
          height: "5000px",
        }}
      >
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="#6366f1" />
          </marker>
          <marker
            id="arrowhead-many"
            markerWidth="12"
            markerHeight="10"
            refX="11"
            refY="5"
            orient="auto"
          >
            <path d="M 0 0 L 10 5 L 0 10 M 5 0 L 5 10" stroke="#6366f1" fill="none" strokeWidth="1.5" />
          </marker>
        </defs>
        <g className="pointer-events-auto">
          {relationships.map((rel) => {
            const sourceEntity = entities.find(e => e.name === rel.sourceEntity);
            const targetEntity = entities.find(e => e.name === rel.targetEntity);
            if (!sourceEntity || !targetEntity) return null;
            
            // Only show relationship if both entities are expanded
            const bothExpanded = expandedEntityIds.has(sourceEntity.id) && expandedEntityIds.has(targetEntity.id);
            if (!bothExpanded) return null;
            
            const sourceIndex = entities.findIndex(e => e.id === sourceEntity.id);
            const targetIndex = entities.findIndex(e => e.id === targetEntity.id);
            const points = getConnectionPoints(sourceEntity, targetEntity, sourceIndex, targetIndex);
            
            return (
              <ERDRelationshipLine
                key={rel.id}
                relationship={rel}
                points={points}
                onDelete={() => onDeleteRelationship(rel.sourceEntityId, rel.targetEntity, rel.fieldName)}
              />
            );
          })}
        </g>
      </svg>

      {/* Entity boxes layer */}
      <div
        className="absolute inset-0"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: "0 0",
        }}
      >
        {entities.map((entity, index) => {
          const pos = getEntityPosition(entity.id, index);
          return (
            <ERDEntityBox
              key={entity.id}
              entity={entity}
              position={pos}
              isSelected={selectedEntityId === entity.id}
              isConnecting={isConnecting}
              isExpanded={expandedEntityIds.has(entity.id)}
              onToggleExpand={() => handleToggleExpand(entity.id)}
              onSelect={() => onSelectEntity(entity.id)}
              onDragStart={(e) => handleEntityDragStart(entity.id, e)}
              onDoubleClick={() => onDoubleClickEntity(entity.id)}
            />
          );
        })}
      </div>
    </div>
  );
}