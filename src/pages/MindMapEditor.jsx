import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

import MindMapCanvas from "@/components/mindmap/MindMapCanvas";
import MindMapToolbar from "@/components/mindmap/MindMapToolbar";

export default function MindMapEditor() {
  const queryClient = useQueryClient();
  const [selectedMindMapId, setSelectedMindMapId] = useState(null);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [selectedConnectionId, setSelectedConnectionId] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionSource, setConnectionSource] = useState(null);
  const [showNewMapDialog, setShowNewMapDialog] = useState(false);
  const [showEditNodeDialog, setShowEditNodeDialog] = useState(false);
  const [showBusinessContext, setShowBusinessContext] = useState(false);
  const [editingNode, setEditingNode] = useState(null);
  const [newMapName, setNewMapName] = useState("");
  const [newMapDescription, setNewMapDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // Fetch mindmaps
  const { data: mindMaps = [], isLoading: loadingMaps } = useQuery({
    queryKey: ["mindmaps"],
    queryFn: () => base44.entities.MindMap.list(),
  });

  // Fetch nodes for selected mindmap
  const { data: nodes = [], isLoading: loadingNodes } = useQuery({
    queryKey: ["mindmapNodes", selectedMindMapId],
    queryFn: () => base44.entities.MindMapNode.filter({ mind_map_id: selectedMindMapId }),
    enabled: !!selectedMindMapId,
  });

  // Fetch connections for selected mindmap
  const { data: connections = [], isLoading: loadingConnections } = useQuery({
    queryKey: ["mindmapConnections", selectedMindMapId],
    queryFn: () => base44.entities.MindMapConnection.filter({ mind_map_id: selectedMindMapId }),
    enabled: !!selectedMindMapId,
  });

  const selectedMindMap = mindMaps.find((m) => m.id === selectedMindMapId);
  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  // Mutations
  const createMapMutation = useMutation({
    mutationFn: (data) => base44.entities.MindMap.create(data),
    onSuccess: (newMap) => {
      queryClient.invalidateQueries({ queryKey: ["mindmaps"] });
      setSelectedMindMapId(newMap.id);
      setShowNewMapDialog(false);
      setNewMapName("");
      setNewMapDescription("");
      toast.success("Mind map created");
    },
  });

  const createNodeMutation = useMutation({
    mutationFn: (data) => base44.entities.MindMapNode.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mindmapNodes", selectedMindMapId] });
    },
  });

  const updateNodeMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.MindMapNode.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mindmapNodes", selectedMindMapId] });
    },
  });

  const deleteNodeMutation = useMutation({
    mutationFn: (id) => base44.entities.MindMapNode.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mindmapNodes", selectedMindMapId] });
      queryClient.invalidateQueries({ queryKey: ["mindmapConnections", selectedMindMapId] });
      setSelectedNodeId(null);
    },
  });

  const createConnectionMutation = useMutation({
    mutationFn: (data) => base44.entities.MindMapConnection.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mindmapConnections", selectedMindMapId] });
      setIsConnecting(false);
      setConnectionSource(null);
    },
  });

  const deleteConnectionMutation = useMutation({
    mutationFn: (id) => base44.entities.MindMapConnection.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mindmapConnections", selectedMindMapId] });
      setSelectedConnectionId(null);
    },
  });

  // Handlers
  const handleAddNode = () => {
    if (!selectedMindMapId) return;
    createNodeMutation.mutate({
      mind_map_id: selectedMindMapId,
      text: "New Node",
      node_type: "sub_branch",
      position_x: 400 + Math.random() * 100,
      position_y: 300 + Math.random() * 100,
      color: "#3b82f6",
    });
  };

  const handleUpdateNodePosition = (nodeId, x, y) => {
    updateNodeMutation.mutate({ id: nodeId, data: { position_x: x, position_y: y } });
  };

  const handleSelectNode = (nodeId) => {
    if (isConnecting && connectionSource) {
      if (nodeId !== connectionSource) {
        createConnectionMutation.mutate({
          mind_map_id: selectedMindMapId,
          source_node_id: connectionSource,
          target_node_id: nodeId,
          style: "solid",
        });
      }
    } else {
      setSelectedNodeId(nodeId);
      setSelectedConnectionId(null);
    }
  };

  const handleDoubleClickNode = (node) => {
    setEditingNode({ ...node });
    setShowEditNodeDialog(true);
  };

  const handleSaveNode = () => {
    if (!editingNode) return;
    updateNodeMutation.mutate({ id: editingNode.id, data: editingNode });
    setShowEditNodeDialog(false);
    setEditingNode(null);
  };

  const handleDeleteSelected = () => {
    if (selectedNodeId) {
      deleteNodeMutation.mutate(selectedNodeId);
    } else if (selectedConnectionId) {
      deleteConnectionMutation.mutate(selectedConnectionId);
    }
  };

  const handleStartConnection = () => {
    if (isConnecting) {
      setIsConnecting(false);
      setConnectionSource(null);
    } else if (selectedNodeId) {
      setIsConnecting(true);
      setConnectionSource(selectedNodeId);
    }
  };

  const handleChangeNodeType = (type) => {
    if (selectedNodeId) {
      updateNodeMutation.mutate({ id: selectedNodeId, data: { node_type: type } });
    }
  };

  const handleChangeColor = (color) => {
    if (selectedNodeId) {
      updateNodeMutation.mutate({ id: selectedNodeId, data: { color } });
    }
  };

  const handleAutoLayout = async () => {
    if (nodes.length === 0) return;

    // Find central node or use first node as center
    const centralNode = nodes.find(n => n.node_type === "central") || nodes[0];
    const otherNodes = nodes.filter(n => n.id !== centralNode.id);

    // Center position
    const centerX = 500;
    const centerY = 350;

    // Update central node to center
    await updateNodeMutation.mutateAsync({ 
      id: centralNode.id, 
      data: { position_x: centerX, position_y: centerY } 
    });

    // Find main branches (nodes connected directly to central)
    const mainBranchIds = connections
      .filter(c => c.source_node_id === centralNode.id)
      .map(c => c.target_node_id);
    
    const mainBranches = otherNodes.filter(n => mainBranchIds.includes(n.id));
    const remainingNodes = otherNodes.filter(n => !mainBranchIds.includes(n.id));

    // Arrange main branches in a circle around center
    const radius = 200;
    const mainPromises = mainBranches.map((node, i) => {
      const angle = (2 * Math.PI * i) / mainBranches.length - Math.PI / 2;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      return updateNodeMutation.mutateAsync({ id: node.id, data: { position_x: x, position_y: y } });
    });

    await Promise.all(mainPromises);

    // Arrange sub-branches around their parent
    const subRadius = 120;
    for (const mainBranch of mainBranches) {
      const childIds = connections
        .filter(c => c.source_node_id === mainBranch.id)
        .map(c => c.target_node_id);
      
      const children = remainingNodes.filter(n => childIds.includes(n.id));
      const mainIdx = mainBranches.indexOf(mainBranch);
      const mainAngle = (2 * Math.PI * mainIdx) / mainBranches.length - Math.PI / 2;
      
      const childPromises = children.map((child, i) => {
        const spreadAngle = Math.PI / 3; // 60 degree spread
        const startAngle = mainAngle - spreadAngle / 2;
        const childAngle = children.length > 1 
          ? startAngle + (spreadAngle * i) / (children.length - 1)
          : mainAngle;
        
        const parentX = centerX + radius * Math.cos(mainAngle);
        const parentY = centerY + radius * Math.sin(mainAngle);
        const x = parentX + subRadius * Math.cos(childAngle);
        const y = parentY + subRadius * Math.sin(childAngle);
        
        return updateNodeMutation.mutateAsync({ id: child.id, data: { position_x: x, position_y: y } });
      });
      
      await Promise.all(childPromises);
    }

    queryClient.invalidateQueries({ queryKey: ["mindmapNodes", selectedMindMapId] });
    toast.success("Layout applied");
  };

  const handleAIGenerate = async () => {
    if (!selectedNodeId || !selectedNode) return;
    
    setIsGenerating(true);
    try {
      const context = selectedMindMap?.description || "";
      const prompt = `You are helping to expand a mind map for business process planning.
      
Business Context: ${context}

The user has selected a node labeled "${selectedNode.text}" (type: ${selectedNode.node_type}).

Generate 3-5 relevant child nodes/sub-topics that would logically branch from this node. These should be specific, actionable items or sub-categories relevant to the business context.

Return ONLY a JSON array of strings, each being a short label (2-4 words max) for a child node.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            nodes: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      const newNodes = result.nodes || [];
      const parentX = selectedNode.position_x || 400;
      const parentY = selectedNode.position_y || 300;
      
      // Create nodes in a fan pattern
      for (let i = 0; i < newNodes.length; i++) {
        const angle = (Math.PI / 4) + (Math.PI / 2 * i) / (newNodes.length - 1 || 1);
        const radius = 150;
        const x = parentX + radius * Math.cos(angle);
        const y = parentY + radius * Math.sin(angle);
        
        const newNode = await base44.entities.MindMapNode.create({
          mind_map_id: selectedMindMapId,
          text: newNodes[i],
          node_type: "sub_branch",
          position_x: x,
          position_y: y,
          color: selectedNode.color || "#3b82f6",
          parent_node_id: selectedNodeId,
        });
        
        // Create connection from parent to new node
        await base44.entities.MindMapConnection.create({
          mind_map_id: selectedMindMapId,
          source_node_id: selectedNodeId,
          target_node_id: newNode.id,
          style: "solid",
        });
      }
      
      queryClient.invalidateQueries({ queryKey: ["mindmapNodes", selectedMindMapId] });
      queryClient.invalidateQueries({ queryKey: ["mindmapConnections", selectedMindMapId] });
      toast.success(`Generated ${newNodes.length} child nodes`);
    } catch (error) {
      toast.error("Failed to generate nodes");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 bg-white border-b">
        <h1 className="text-xl font-bold">Mind Map Editor</h1>
        
        <Select value={selectedMindMapId || ""} onValueChange={setSelectedMindMapId}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Select a mind map..." />
          </SelectTrigger>
          <SelectContent>
            {mindMaps.map((map) => (
              <SelectItem key={map.id} value={map.id}>
                {map.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button variant="outline" onClick={() => setShowNewMapDialog(true)}>
          <Plus className="h-4 w-4 mr-1" />
          New Mind Map
        </Button>
      </div>

      {/* Toolbar */}
      {selectedMindMapId && (
        <MindMapToolbar
          onAddNode={handleAddNode}
          onDeleteSelected={handleDeleteSelected}
          onStartConnection={handleStartConnection}
          onAutoLayout={handleAutoLayout}
          onAIGenerate={handleAIGenerate}
          onShowBusinessContext={() => setShowBusinessContext(true)}
          isConnecting={isConnecting}
          hasSelection={!!selectedNodeId || !!selectedConnectionId}
          selectedNodeType={selectedNode?.node_type}
          onChangeNodeType={handleChangeNodeType}
          selectedColor={selectedNode?.color}
          onChangeColor={handleChangeColor}
          isGenerating={isGenerating}
        />
      )}

      {/* Canvas */}
      <div className="flex-1">
        {!selectedMindMapId ? (
          <div className="h-full flex items-center justify-center text-gray-500">
            Select or create a mind map to get started
          </div>
        ) : loadingNodes || loadingConnections ? (
          <div className="h-full flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <MindMapCanvas
            nodes={nodes}
            connections={connections}
            selectedNodeId={selectedNodeId}
            selectedConnectionId={selectedConnectionId}
            onSelectNode={handleSelectNode}
            onSelectConnection={setSelectedConnectionId}
            onUpdateNodePosition={handleUpdateNodePosition}
            onDoubleClickNode={handleDoubleClickNode}
            onCanvasClick={() => {
              setSelectedNodeId(null);
              setSelectedConnectionId(null);
              if (isConnecting) {
                setIsConnecting(false);
                setConnectionSource(null);
              }
            }}
          />
        )}
      </div>

      {/* New Mind Map Dialog */}
      <Dialog open={showNewMapDialog} onOpenChange={setShowNewMapDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Mind Map</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input
                value={newMapName}
                onChange={(e) => setNewMapName(e.target.value)}
                placeholder="e.g., Paragon Oak App Scope"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Business Context</label>
              <Textarea
                value={newMapDescription}
                onChange={(e) => setNewMapDescription(e.target.value)}
                placeholder="Describe the business context, model, operations..."
                rows={6}
              />
            </div>
            <Button
              className="w-full"
              onClick={() => createMapMutation.mutate({ name: newMapName, description: newMapDescription })}
              disabled={!newMapName || createMapMutation.isPending}
            >
              {createMapMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Mind Map
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Node Dialog */}
      <Dialog open={showEditNodeDialog} onOpenChange={setShowEditNodeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Node</DialogTitle>
          </DialogHeader>
          {editingNode && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Text</label>
                <Input
                  value={editingNode.text}
                  onChange={(e) => setEditingNode({ ...editingNode, text: e.target.value })}
                />
              </div>
              <Button className="w-full" onClick={handleSaveNode}>
                Save
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Business Context Dialog */}
      <Dialog open={showBusinessContext} onOpenChange={setShowBusinessContext}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Business Context</DialogTitle>
          </DialogHeader>
          <div className="prose prose-sm max-w-none">
            {selectedMindMap?.description ? (
              <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded-lg">
                {selectedMindMap.description}
              </pre>
            ) : (
              <p className="text-gray-500">No business context defined for this mind map.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}