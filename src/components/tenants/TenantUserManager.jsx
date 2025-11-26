import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Users, Plus, Trash2, Save } from "lucide-react";
import { toast } from "sonner";

export default function TenantUserManager({ tenantId }) {
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedRoles, setSelectedRoles] = useState([]);
  const queryClient = useQueryClient();

  // Fetch all users
  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: () => base44.entities.User.list(),
  });

  // Fetch tenant roles
  const { data: tenantRoles = [] } = useQuery({
    queryKey: ["tenantRoles", tenantId],
    queryFn: () => base44.entities.TenantRole.filter({ tenant_id: tenantId }),
  });

  // Fetch global roles
  const { data: globalRoles = [] } = useQuery({
    queryKey: ["tenantRoles", "__global__"],
    queryFn: () => base44.entities.TenantRole.filter({ tenant_id: "__global__" }),
  });

  // Combine roles
  const availableRoles = [
    ...tenantRoles,
    ...globalRoles.filter(gr => !tenantRoles.some(tr => tr.name === gr.name))
  ];

  // Fetch user-role assignments for this tenant
  const { data: userRoles = [] } = useQuery({
    queryKey: ["tenantUserRoles", tenantId],
    queryFn: () => base44.entities.TenantUserRole.filter({ tenant_id: tenantId }),
  });

  // Users not yet assigned to this tenant
  const unassignedUsers = users.filter(
    u => !userRoles.some(ur => ur.user_id === u.id)
  );

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.TenantUserRole.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenantUserRoles", tenantId] });
      setSelectedUserId("");
      setSelectedRoles([]);
      toast.success("User added to tenant");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.TenantUserRole.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenantUserRoles", tenantId] });
      toast.success("Roles updated");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.TenantUserRole.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenantUserRoles", tenantId] });
      toast.success("User removed from tenant");
    },
  });

  const handleAddUser = () => {
    if (!selectedUserId || selectedRoles.length === 0) {
      toast.error("Select a user and at least one role");
      return;
    }
    const user = users.find(u => u.id === selectedUserId);
    createMutation.mutate({
      tenant_id: tenantId,
      user_id: selectedUserId,
      user_email: user?.email || "",
      roles: selectedRoles
    });
  };

  const handleToggleRole = (userRole, roleName) => {
    const newRoles = userRole.roles.includes(roleName)
      ? userRole.roles.filter(r => r !== roleName)
      : [...userRole.roles, roleName];
    
    if (newRoles.length === 0) {
      toast.error("User must have at least one role");
      return;
    }
    
    updateMutation.mutate({ id: userRole.id, data: { roles: newRoles } });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Users className="h-4 w-4" />
          User Assignments
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Existing assignments */}
        {userRoles.length === 0 ? (
          <p className="text-sm text-gray-500">No users assigned to this tenant yet</p>
        ) : (
          <div className="space-y-2">
            {userRoles.map((ur) => {
              const user = users.find(u => u.id === ur.user_id);
              return (
                <div key={ur.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{user?.full_name || ur.user_email}</div>
                    <div className="text-xs text-gray-500">{ur.user_email}</div>
                  </div>
                  <div className="flex gap-1 flex-wrap">
                    {availableRoles.map(role => (
                      <Badge
                        key={role.id}
                        variant={ur.roles.includes(role.name) ? "default" : "outline"}
                        className="cursor-pointer text-xs"
                        onClick={() => handleToggleRole(ur, role.name)}
                      >
                        {role.name}
                      </Badge>
                    ))}
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => deleteMutation.mutate(ur.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}

        {/* Add new user */}
        {unassignedUsers.length > 0 && availableRoles.length > 0 && (
          <div className="border-t pt-4 space-y-3">
            <div className="text-sm font-medium">Add User</div>
            <div className="flex gap-2">
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select user..." />
                </SelectTrigger>
                <SelectContent>
                  {unassignedUsers.map(user => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.full_name || user.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleAddUser} disabled={!selectedUserId || selectedRoles.length === 0}>
                <Plus className="h-4 w-4 mr-1" /> Add
              </Button>
            </div>
            <div className="flex gap-2 flex-wrap">
              {availableRoles.map(role => (
                <div key={role.id} className="flex items-center gap-1">
                  <Checkbox
                    id={`new-role-${role.id}`}
                    checked={selectedRoles.includes(role.name)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedRoles([...selectedRoles, role.name]);
                      } else {
                        setSelectedRoles(selectedRoles.filter(r => r !== role.name));
                      }
                    }}
                  />
                  <label htmlFor={`new-role-${role.id}`} className="text-sm cursor-pointer">
                    {role.name}
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {availableRoles.length === 0 && (
          <p className="text-sm text-gray-500 italic">Define roles first to assign users</p>
        )}
      </CardContent>
    </Card>
  );
}