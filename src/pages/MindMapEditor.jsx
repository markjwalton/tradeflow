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
  DialogDescription,
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
import GeneratedSpecDialog from "@/components/mindmap/GeneratedSpecDialog";
import VersionHistoryPanel from "@/components/mindmap/VersionHistoryPanel";
import ForkVersionDialog from "@/components/mindmap/ForkVersionDialog";
import PublishVersionDialog from "@/components/mindmap/PublishVersionDialog";
import EntityDetailDialog from "@/components/mindmap/EntityDetailDialog";
import EntityRelationshipDiagram from "@/components/mindmap/EntityRelationshipDiagram";
import WorkflowDialog from "@/components/mindmap/WorkflowDialog";
import TenantForkDialog from "@/components/mindmap/TenantForkDialog";
import AddNodeDialog from "@/components/mindmap/AddNodeDialog";

export default function MindMapEditor() {
  const queryClient = useQueryClient();
  
  // Get mindmap ID from URL params once on mount
  const [selectedMindMapId, setSelectedMindMapId] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("map") || null;
  });
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
  const [newMapSuggestions, setNewMapSuggestions] = useState("");
  const [editingContext, setEditingContext] = useState({ description: "", node_suggestions: "" });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [isGeneratingApp, setIsGeneratingApp] = useState(false);
  const [showGeneratedSpec, setShowGeneratedSpec] = useState(false);
  const [generatedSpec, setGeneratedSpec] = useState(null);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showForkDialog, setShowForkDialog] = useState(false);
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [isForkingVersion, setIsForkingVersion] = useState(false);
  const [isPublishingVersion, setIsPublishingVersion] = useState(false);
  const [showEntityDialog, setShowEntityDialog] = useState(false);
  const [showERDDialog, setShowERDDialog] = useState(false);
  const [showWorkflowDialog, setShowWorkflowDialog] = useState(false);
  const [showTenantForkDialog, setShowTenantForkDialog] = useState(false);
  const [showAddNodeDialog, setShowAddNodeDialog] = useState(false);

  // Fetch mindmaps
  const { data: mindMaps = [], isLoading: loadingMaps } = useQuery({
    queryKey: ["mindmaps"],
    queryFn: () => base44.entities.MindMap.list(),
    staleTime: 60000, // Cache for 60 seconds
    refetchOnWindowFocus: false, // Don't refetch on tab switch
  });

  // Fetch nodes for selected mindmap
  const { data: nodes = [], isLoading: loadingNodes } = useQuery({
    queryKey: ["mindmapNodes", selectedMindMapId],
    queryFn: () => base44.entities.MindMapNode.filter({ mind_map_id: selectedMindMapId }),
    enabled: !!selectedMindMapId,
    staleTime: 60000,
    refetchOnWindowFocus: false,
  });

  // Fetch connections for selected mindmap
  const { data: connections = [], isLoading: loadingConnections } = useQuery({
    queryKey: ["mindmapConnections", selectedMindMapId],
    queryFn: () => base44.entities.MindMapConnection.filter({ mind_map_id: selectedMindMapId }),
    enabled: !!selectedMindMapId,
    staleTime: 60000,
    refetchOnWindowFocus: false,
  });

  const selectedMindMap = mindMaps.find((m) => m.id === selectedMindMapId);
  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  // Get all descendant node IDs of collapsed nodes
  const getDescendantIds = (nodeId, conns, visited = new Set()) => {
    if (visited.has(nodeId)) return [];
    visited.add(nodeId);
    const childIds = conns.filter(c => c.source_node_id === nodeId).map(c => c.target_node_id);
    let descendants = [...childIds];
    childIds.forEach(childId => {
      descendants = [...descendants, ...getDescendantIds(childId, conns, visited)];
    });
    return descendants;
  };

  const collapsedNodeIds = nodes.filter(n => n.is_collapsed).map(n => n.id);
  const hiddenNodeIds = new Set();
  collapsedNodeIds.forEach(nodeId => {
    getDescendantIds(nodeId, connections).forEach(id => hiddenNodeIds.add(id));
  });

  const visibleNodes = nodes.filter(n => !hiddenNodeIds.has(n.id));
  const visibleConnections = connections.filter(c => 
    !hiddenNodeIds.has(c.source_node_id) && !hiddenNodeIds.has(c.target_node_id)
  );

  // Mutations
  const createMapMutation = useMutation({
    mutationFn: (data) => base44.entities.MindMap.create(data),
    onSuccess: (newMap) => {
      queryClient.invalidateQueries({ queryKey: ["mindmaps"] });
      setSelectedMindMapId(newMap.id);
      // Update URL to persist selection
      const url = new URL(window.location.href);
      url.searchParams.set("map", newMap.id);
      window.history.replaceState({}, "", url);
      setShowNewMapDialog(false);
      setNewMapName("");
      setNewMapDescription("");
      setNewMapSuggestions("");
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

  const updateMindMapMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.MindMap.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mindmaps"] });
      queryClient.refetchQueries({ queryKey: ["mindmaps"] });
    },
  });

  // Fork version handler
  const handleForkVersion = async ({ changeNotes, newVersion }) => {
    if (!selectedMindMap) return;
    
    setIsForkingVersion(true);
    try {
      // Create new mindmap as fork
      const newMap = await base44.entities.MindMap.create({
        name: selectedMindMap.name,
        description: selectedMindMap.description,
        node_suggestions: selectedMindMap.node_suggestions,
        tenant_id: selectedMindMap.tenant_id,
        version: newVersion,
        status: "draft",
        parent_version_id: selectedMindMap.id,
        change_notes: changeNotes,
      });

      // Copy all nodes
      const nodeIdMap = {};
      for (const node of nodes) {
        const newNode = await base44.entities.MindMapNode.create({
          mind_map_id: newMap.id,
          text: node.text,
          node_type: node.node_type,
          color: node.color,
          position_x: node.position_x,
          position_y: node.position_y,
          is_collapsed: node.is_collapsed,
        });
        nodeIdMap[node.id] = newNode.id;
      }

      // Copy all connections with updated node IDs
      for (const conn of connections) {
        await base44.entities.MindMapConnection.create({
          mind_map_id: newMap.id,
          source_node_id: nodeIdMap[conn.source_node_id],
          target_node_id: nodeIdMap[conn.target_node_id],
          label: conn.label,
          style: conn.style,
          color: conn.color,
        });
      }

      queryClient.invalidateQueries({ queryKey: ["mindmaps"] });
      setSelectedMindMapId(newMap.id);
      
      // Update URL
      const url = new URL(window.location.href);
      url.searchParams.set("map", newMap.id);
      window.history.replaceState({}, "", url);
      
      setShowForkDialog(false);
      toast.success(`Created v${newVersion}`);
    } catch (error) {
      toast.error("Failed to fork version");
    } finally {
      setIsForkingVersion(false);
    }
  };

  // Publish version handler
  const handlePublishVersion = async ({ changeNotes }) => {
    if (!selectedMindMapId) return;
    
    setIsPublishingVersion(true);
    try {
      await base44.entities.MindMap.update(selectedMindMapId, {
        status: "published",
        published_date: new Date().toISOString(),
        change_notes: changeNotes,
      });
      
      queryClient.invalidateQueries({ queryKey: ["mindmaps"] });
      setShowPublishDialog(false);
      toast.success(`Published v${selectedMindMap?.version || 1}`);
    } catch (error) {
      toast.error("Failed to publish version");
    } finally {
      setIsPublishingVersion(false);
    }
  };

  // Switch to a different version
  const handleSelectVersion = (versionId) => {
    setSelectedMindMapId(versionId);
    const url = new URL(window.location.href);
    url.searchParams.set("map", versionId);
    window.history.replaceState({}, "", url);
    setShowVersionHistory(false);
  };

  // Update node with entity schema
  const handleUpdateNodeWithSchema = (nodeId, data) => {
    updateNodeMutation.mutate({ id: nodeId, data });
  };

  // Handlers
  const handleAddNode = () => {
    if (!selectedMindMapId) return;
    setShowAddNodeDialog(true);
  };

  const handleAddCustomNode = (nodeData) => {
    if (!selectedMindMapId) return;
    createNodeMutation.mutate({
      mind_map_id: selectedMindMapId,
      text: nodeData.text,
      node_type: nodeData.node_type,
      specification_notes: nodeData.specification_notes,
      color: nodeData.color,
      position_x: 400 + Math.random() * 100,
      position_y: 300 + Math.random() * 100,
    });
  };

  const handleAddTemplateNode = (nodeData) => {
    if (!selectedMindMapId) return;
    createNodeMutation.mutate({
      mind_map_id: selectedMindMapId,
      text: nodeData.text,
      node_type: nodeData.node_type,
      specification_notes: nodeData.specification_notes,
      color: nodeData.color,
      template_id: nodeData.template_id,
      position_x: 400 + Math.random() * 100,
      position_y: 300 + Math.random() * 100,
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

  const handleToggleCollapse = (nodeId) => {
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      updateNodeMutation.mutate({ id: nodeId, data: { is_collapsed: !node.is_collapsed } });
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

  const handleAISuggest = async () => {
    if (nodes.length === 0) {
      toast.error("Add some nodes first");
      return;
    }
    
    setIsSuggesting(true);
    try {
      // Fetch fresh mindmap data to get latest business context
      const freshMaps = await base44.entities.MindMap.filter({ id: selectedMindMapId });
      const freshMindMap = freshMaps[0];
      
      const context = freshMindMap?.description || "";
      const nodesSummary = nodes.map(n => ({
        id: n.id,
        text: n.text,
        type: n.node_type,
        parent: connections.find(c => c.target_node_id === n.id)?.source_node_id || null
      }));
      
      const userSuggestions = freshMindMap?.node_suggestions || "";
      
      const prompt = `You are analyzing a mind map for business process planning.

Business Context: ${context}

User's Node Suggestions (prioritize these!): ${userSuggestions}

Current Mind Map Structure:
${JSON.stringify(nodesSummary, null, 2)}

Analyze this mind map and suggest 3-5 NEW nodes that would add value. For each suggestion:
1. Identify the BEST existing node to attach it to (as a child)
2. Provide a short label (2-4 words)
3. Suggest a node type: main_branch, sub_branch, feature, entity, page, or note

Return a JSON object with a "suggestions" array where each item has:
- "parent_node_id": the ID of the existing node to connect to
- "text": the label for the new node
- "node_type": one of the allowed types

IMPORTANT: If the user has provided node suggestions, prioritize adding those first. Place them under the most logical parent nodes. Then fill in any gaps based on the business context.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            suggestions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  parent_node_id: { type: "string" },
                  text: { type: "string" },
                  node_type: { type: "string" }
                }
              }
            }
          }
        }
      });

      const suggestions = result.suggestions || [];
      let addedCount = 0;
      
      for (const suggestion of suggestions) {
        const parentNode = nodes.find(n => n.id === suggestion.parent_node_id);
        if (!parentNode) continue;
        
        // Find existing children of this parent to position new node
        const siblingConnections = connections.filter(c => c.source_node_id === parentNode.id);
        const siblingCount = siblingConnections.length;
        
        // Position new node relative to parent
        const angle = (Math.PI / 4) + (Math.PI / 2 * siblingCount) / Math.max(siblingCount, 1);
        const radius = 150;
        const x = (parentNode.position_x || 400) + radius * Math.cos(angle);
        const y = (parentNode.position_y || 300) + radius * Math.sin(angle);
        
        const newNode = await base44.entities.MindMapNode.create({
          mind_map_id: selectedMindMapId,
          text: suggestion.text,
          node_type: suggestion.node_type || "sub_branch",
          position_x: x,
          position_y: y,
          color: parentNode.color || "#3b82f6",
          parent_node_id: suggestion.parent_node_id,
        });
        
        await base44.entities.MindMapConnection.create({
          mind_map_id: selectedMindMapId,
          source_node_id: suggestion.parent_node_id,
          target_node_id: newNode.id,
          style: "solid",
        });
        
        addedCount++;
      }
      
      queryClient.invalidateQueries({ queryKey: ["mindmapNodes", selectedMindMapId] });
      queryClient.invalidateQueries({ queryKey: ["mindmapConnections", selectedMindMapId] });
      toast.success(`Added ${addedCount} suggested nodes`);
    } catch (error) {
      toast.error("Failed to generate suggestions");
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleGenerateApp = async () => {
    if (nodes.length === 0) {
      toast.error("Add nodes to your mindmap first");
      return;
    }

    setIsGeneratingApp(true);
    try {
      // Fetch fresh mindmap data
      const freshMaps = await base44.entities.MindMap.filter({ id: selectedMindMapId });
      const freshMindMap = freshMaps[0];
      
      const context = freshMindMap?.description || "";
      const nodeSuggestions = freshMindMap?.node_suggestions || "";
      
      // Build node hierarchy with types
      const nodesSummary = nodes.map(n => ({
        id: n.id,
        text: n.text,
        type: n.node_type,
        parent: connections.find(c => c.target_node_id === n.id)?.source_node_id || null
      }));

      // Find entity nodes
      const entityNodes = nodes.filter(n => n.node_type === "entity");
      // Find page nodes
      const pageNodes = nodes.filter(n => n.node_type === "page");
      // Find feature nodes
      const featureNodes = nodes.filter(n => n.node_type === "feature");

      const prompt = `You are an expert app architect. Based on this mind map AND the detailed feature requirements, generate a complete app specification.

BUSINESS CONTEXT:
${context}

DETAILED FEATURE REQUIREMENTS (PRIORITIZE THESE - this is the user's comprehensive feature list):
${nodeSuggestions}

CURRENT MIND MAP STRUCTURE:
${JSON.stringify(nodesSummary, null, 2)}

Nodes marked as Entity type: ${entityNodes.map(n => n.text).join(", ") || "None specified"}
Nodes marked as Page type: ${pageNodes.map(n => n.text).join(", ") || "None specified"}
Nodes marked as Feature type: ${featureNodes.map(n => n.text).join(", ") || "None specified"}

IMPORTANT: The "Detailed Feature Requirements" above contains a comprehensive list of features the user wants. You MUST include entities, pages, and features to support ALL of these requirements. The mind map structure shows the high-level organization, but the detailed requirements are the primary source of truth.

Generate a complete app specification with:

1. ENTITIES: Create database entities to support ALL features in the requirements. Include proper relationships between entities.

2. PAGES: Create pages that implement the functionality described in the requirements.

3. FEATURES: Map ALL the detailed requirements to specific features, pages, and entities.

Return a JSON object with this structure:
{
  "entities": [
    {
      "name": "EntityName",
      "description": "What this entity represents",
      "schema": {
        "name": "EntityName",
        "type": "object",
        "properties": { ... },
        "required": [...]
      }
    }
  ],
  "pages": [
    {
      "name": "PageName",
      "description": "What this page does",
      "features": ["feature1", "feature2"],
      "entities_used": ["Entity1", "Entity2"]
    }
  ],
  "features": [
    {
      "name": "FeatureName",
      "description": "What this feature does",
      "page": "PageName or null",
      "entities": ["Entity1"]
    }
  ]
}

Be thorough - include ALL entities and features needed to implement the detailed requirements. Do not skip any requirements.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            entities: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  description: { type: "string" },
                  schema: { type: "object" }
                }
              }
            },
            pages: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  description: { type: "string" },
                  features: { type: "array", items: { type: "string" } },
                  entities_used: { type: "array", items: { type: "string" } }
                }
              }
            },
            features: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  description: { type: "string" },
                  page: { type: "string" },
                  entities: { type: "array", items: { type: "string" } }
                }
              }
            }
          }
        }
      });

      setGeneratedSpec(result);
      setShowGeneratedSpec(true);
      toast.success("App specification generated!");
    } catch (error) {
      console.error("Generate app error:", error);
      toast.error("Failed to generate app specification");
    } finally {
      setIsGeneratingApp(false);
    }
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
        
        <Select value={selectedMindMapId || ""} onValueChange={(id) => {
          setSelectedMindMapId(id);
          // Update URL to persist selection
          const url = new URL(window.location.href);
          url.searchParams.set("map", id);
          window.history.replaceState({}, "", url);
        }}>
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
          onAISuggest={handleAISuggest}
          onGenerateApp={handleGenerateApp}
          onShowBusinessContext={async () => {
                // Fetch fresh data when opening
                const freshMaps = await base44.entities.MindMap.filter({ id: selectedMindMapId });
                const freshMap = freshMaps[0];
                if (freshMap) {
                  setEditingContext({
                    description: freshMap.description || "",
                    node_suggestions: freshMap.node_suggestions || ""
                  });
                }
                setShowBusinessContext(true);
              }}
          isConnecting={isConnecting}
          hasSelection={!!selectedNodeId || !!selectedConnectionId}
          selectedNodeType={selectedNode?.node_type}
          onChangeNodeType={handleChangeNodeType}
          selectedColor={selectedNode?.color}
          onChangeColor={handleChangeColor}
          isGenerating={isGenerating}
          isSuggesting={isSuggesting}
          isGeneratingApp={isGeneratingApp}
          currentMindMap={selectedMindMap}
          onForkVersion={() => setShowForkDialog(true)}
          onPublishVersion={() => setShowPublishDialog(true)}
          onShowHistory={() => setShowVersionHistory(true)}
          onShowERD={() => setShowERDDialog(true)}
          onShowWorkflows={() => setShowWorkflowDialog(true)}
          selectedNodeIsEntity={selectedNode?.node_type === "entity"}
          onEditEntity={() => setShowEntityDialog(true)}
        />
      )}

      {/* Canvas and History Panel */}
      <div className="flex-1 flex">
        {!selectedMindMapId ? (
          <div className="h-full flex items-center justify-center text-gray-500">
            Select or create a mind map to get started
          </div>
        ) : loadingNodes || loadingConnections ? (
          <div className="h-full flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <div className="flex-1">
            <MindMapCanvas
              nodes={visibleNodes}
              connections={visibleConnections}
              allConnections={connections}
              selectedNodeId={selectedNodeId}
              selectedConnectionId={selectedConnectionId}
              onSelectNode={handleSelectNode}
              onSelectConnection={setSelectedConnectionId}
              onUpdateNodePosition={handleUpdateNodePosition}
              onDoubleClickNode={handleDoubleClickNode}
              onToggleCollapse={handleToggleCollapse}
              onCanvasClick={() => {
                setSelectedNodeId(null);
                setSelectedConnectionId(null);
                if (isConnecting) {
                  setIsConnecting(false);
                  setConnectionSource(null);
                }
              }}
            />
          </div>
        )}

        {/* Version History Panel */}
        {showVersionHistory && (
          <VersionHistoryPanel
            currentMindMap={selectedMindMap}
            onSelectVersion={handleSelectVersion}
            onClose={() => setShowVersionHistory(false)}
          />
        )}
      </div>

      {/* New Mind Map Dialog */}
      <Dialog open={showNewMapDialog} onOpenChange={setShowNewMapDialog}>
        <DialogContent aria-describedby={undefined}>
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
                                rows={4}
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium">Node Suggestions for AI</label>
                              <Textarea
                                value={newMapSuggestions}
                                onChange={(e) => setNewMapSuggestions(e.target.value)}
                                placeholder="List nodes you want the AI to add, e.g.:&#10;- User Management&#10;- Payment Processing&#10;- Email Notifications"
                                rows={4}
                              />
                            </div>
                            <Button
              className="w-full"
              onClick={() => createMapMutation.mutate({ name: newMapName, description: newMapDescription, node_suggestions: newMapSuggestions })}
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
        <DialogContent aria-describedby={undefined}>
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

      {/* Generated Spec Dialog */}
        <GeneratedSpecDialog
          open={showGeneratedSpec}
          onOpenChange={setShowGeneratedSpec}
          spec={generatedSpec}
        />

        {/* Fork Version Dialog */}
        <ForkVersionDialog
          open={showForkDialog}
          onOpenChange={setShowForkDialog}
          currentMindMap={selectedMindMap}
          onFork={handleForkVersion}
          isPending={isForkingVersion}
        />

        {/* Publish Version Dialog */}
        <PublishVersionDialog
          open={showPublishDialog}
          onOpenChange={setShowPublishDialog}
          currentMindMap={selectedMindMap}
          onPublish={handlePublishVersion}
          isPending={isPublishingVersion}
        />

        {/* Entity Detail Dialog */}
        <EntityDetailDialog
          open={showEntityDialog}
          onOpenChange={setShowEntityDialog}
          node={selectedNode}
          allNodes={nodes}
          connections={connections}
          onUpdateNode={handleUpdateNodeWithSchema}
          businessContext={selectedMindMap?.description}
        />

        {/* Entity Relationship Diagram */}
        <EntityRelationshipDiagram
          open={showERDDialog}
          onOpenChange={setShowERDDialog}
          nodes={nodes}
          connections={connections}
        />

        {/* Workflow Dialog */}
        <WorkflowDialog
          open={showWorkflowDialog}
          onOpenChange={setShowWorkflowDialog}
          nodes={nodes}
          connections={connections}
          businessContext={selectedMindMap?.description}
        />

        {/* Tenant Fork Dialog */}
        <TenantForkDialog
          open={showTenantForkDialog}
          onOpenChange={setShowTenantForkDialog}
          currentMindMap={selectedMindMap}
          nodes={nodes}
          connections={connections}
          onForkComplete={(newMap) => {
            queryClient.invalidateQueries({ queryKey: ["mindmaps"] });
            setSelectedMindMapId(newMap.id);
            const url = new URL(window.location.href);
            url.searchParams.set("map", newMap.id);
            window.history.replaceState({}, "", url);
            toast.success(`Forked to tenant successfully`);
          }}
        />

        {/* Add Node Dialog */}
        <AddNodeDialog
          open={showAddNodeDialog}
          onOpenChange={setShowAddNodeDialog}
          onAddCustomNode={handleAddCustomNode}
          onAddTemplateNode={handleAddTemplateNode}
          businessContext={selectedMindMap?.description}
        />

        {/* Business Context Dialog */}
                <Dialog open={showBusinessContext} onOpenChange={setShowBusinessContext}>
                  <DialogContent className="max-w-2xl" aria-describedby={undefined}>
                    <DialogHeader>
                      <DialogTitle>Business Context & Node Suggestions</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Business Context</label>
                        <Textarea
                          value={editingContext.description}
                          onChange={(e) => setEditingContext({ ...editingContext, description: e.target.value })}
                          placeholder="Describe the business context, model, operations..."
                          rows={5}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Node Suggestions for AI</label>
                        <Textarea
                          value={editingContext.node_suggestions}
                          onChange={(e) => setEditingContext({ ...editingContext, node_suggestions: e.target.value })}
                          placeholder="List nodes you want the AI to add, e.g.:&#10;- User Management&#10;- Payment Processing&#10;- Email Notifications"
                          rows={5}
                        />
                        <p className="text-xs text-gray-500 mt-1">The AI Suggest feature will prioritize adding these nodes.</p>
                      </div>
                      <Button
                        className="w-full"
                        disabled={!selectedMindMapId || updateMindMapMutation.isPending}
                        onClick={async () => {
                          if (!selectedMindMapId) {
                            toast.error("No mindmap selected");
                            return;
                          }
                          console.log("Saving context:", selectedMindMapId, editingContext);
                          try {
                            const result = await base44.entities.MindMap.update(selectedMindMapId, {
                              description: editingContext.description,
                              node_suggestions: editingContext.node_suggestions
                            });
                            console.log("Save result:", result);
                            queryClient.invalidateQueries({ queryKey: ["mindmaps"] });
                            setShowBusinessContext(false);
                            toast.success("Context updated");
                          } catch (error) {
                            console.error("Save error:", error);
                            toast.error("Failed to save: " + (error.message || "Unknown error"));
                          }
                        }}
                      >
                        {updateMindMapMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Save
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
    </div>
  );
}