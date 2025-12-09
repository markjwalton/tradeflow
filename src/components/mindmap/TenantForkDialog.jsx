import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, GitFork, Building2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";

export default function TenantForkDialog({
  open,
  onOpenChange,
  currentMindMap,
  nodes,
  connections,
  onForkComplete,
}) {
  const [selectedTenantId, setSelectedTenantId] = useState("");
  const [customName, setCustomName] = useState("");
  const [customDescription, setCustomDescription] = useState("");
  const [isForkingToTenant, setIsForkingToTenant] = useState(false);

  const { data: tenants = [] } = useQuery({
    queryKey: ["tenants"],
    queryFn: () => base44.entities.Tenant.list(),
  });

  const handleForkToTenant = async () => {
    if (!selectedTenantId || !currentMindMap) return;

    setIsForkingToTenant(true);
    try {
      const selectedTenant = tenants.find(t => t.id === selectedTenantId);
      
      // Create new mindmap for tenant
      const newMap = await base44.entities.MindMap.create({
        name: customName || `${currentMindMap.name} (${selectedTenant?.name || "Tenant"})`,
        description: customDescription || currentMindMap.description,
        node_suggestions: currentMindMap.node_suggestions,
        tenant_id: selectedTenantId,
        version: 1,
        status: "draft",
        parent_version_id: currentMindMap.id,
        change_notes: `Forked from "${currentMindMap.name}" for tenant customization`,
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
          entity_schema: node.entity_schema,
          entity_relationships: node.entity_relationships,
        });
        nodeIdMap[node.id] = newNode.id;
      }

      // Copy all connections
      for (const conn of connections) {
        if (nodeIdMap[conn.source_node_id] && nodeIdMap[conn.target_node_id]) {
          await base44.entities.MindMapConnection.create({
            mind_map_id: newMap.id,
            source_node_id: nodeIdMap[conn.source_node_id],
            target_node_id: nodeIdMap[conn.target_node_id],
            label: conn.label,
            style: conn.style,
            color: conn.color,
          });
        }
      }

      onForkComplete(newMap);
      onOpenChange(false);
    } catch (error) {
      console.error("Fork to tenant error:", error);
    } finally {
      setIsForkingToTenant(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Fork to Tenant
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-3 bg-info-50 rounded-lg text-sm">
            <p className="font-medium text-info">Create a tenant-specific copy</p>
            <p className="text-info text-xs mt-1">
              This will create a customizable version of "{currentMindMap?.name}" 
              that the tenant can modify independently.
            </p>
          </div>

          <div>
            <label className="text-sm font-medium">Select Tenant</label>
            <Select value={selectedTenantId} onValueChange={setSelectedTenantId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a tenant..." />
              </SelectTrigger>
              <SelectContent>
                {tenants.map(tenant => (
                  <SelectItem key={tenant.id} value={tenant.id}>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-3 w-3" />
                      {tenant.name}
                      {tenant.slug && (
                        <Badge variant="outline" className="text-xs">{tenant.slug}</Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium">Custom Name (optional)</label>
            <Input
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder={currentMindMap?.name}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Custom Description (optional)</label>
            <Textarea
              value={customDescription}
              onChange={(e) => setCustomDescription(e.target.value)}
              placeholder={currentMindMap?.description || "Describe tenant-specific context..."}
              rows={3}
            />
          </div>

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              className="flex-1" 
              onClick={handleForkToTenant}
              disabled={!selectedTenantId || isForkingToTenant}
            >
              {isForkingToTenant ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <GitFork className="h-4 w-4 mr-2" />
              )}
              Fork to Tenant
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}