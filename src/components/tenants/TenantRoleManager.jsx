import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Shield } from "lucide-react";
import { toast } from "sonner";

export default function TenantRoleManager({ tenantId }) {
  const [newRole, setNewRole] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const queryClient = useQueryClient();

  const { data: roles = [], isLoading } = useQuery({
    queryKey: ["tenantRoles", tenantId],
    queryFn: () => base44.entities.TenantRole.filter({ tenant_id: tenantId }),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.TenantRole.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenantRoles", tenantId] });
      setNewRole("");
      setNewDescription("");
      toast.success("Role added");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.TenantRole.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenantRoles", tenantId] });
      toast.success("Role removed");
    },
  });

  const handleAddRole = (e) => {
    e.preventDefault();
    if (!newRole.trim()) return;
    
    // Check for duplicates
    if (roles.some(r => r.name.toLowerCase() === newRole.trim().toLowerCase())) {
      toast.error("Role already exists");
      return;
    }

    createMutation.mutate({
      tenant_id: tenantId,
      name: newRole.trim(),
      description: newDescription.trim()
    });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Roles
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="text-sm text-gray-500">Loading roles...</div>
        ) : (
          <>
            <div className="flex flex-wrap gap-2">
              {roles.length === 0 ? (
                <p className="text-sm text-gray-500">No roles defined yet</p>
              ) : (
                roles.map((role) => (
                  <Badge 
                    key={role.id} 
                    variant="secondary" 
                    className="gap-1 py-1 px-2"
                    title={role.description || role.name}
                  >
                    {role.name}
                    <X
                      className="h-3 w-3 cursor-pointer hover:text-red-500"
                      onClick={() => deleteMutation.mutate(role.id)}
                    />
                  </Badge>
                ))
              )}
            </div>

            <form onSubmit={handleAddRole} className="flex gap-2">
              <Input
                placeholder="Role name (e.g., manager)"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="flex-1"
              />
              <Input
                placeholder="Description (optional)"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" size="icon" disabled={!newRole.trim()}>
                <Plus className="h-4 w-4" />
              </Button>
            </form>
          </>
        )}
      </CardContent>
    </Card>
  );
}