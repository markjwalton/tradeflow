import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { UserPlus, Check, X } from "lucide-react";
import { toast } from "sonner";

export default function TenantAccessRequests({ tenantId }) {
  const [selectedRoles, setSelectedRoles] = React.useState({});
  const queryClient = useQueryClient();

  // Fetch pending access requests
  const { data: requests = [] } = useQuery({
    queryKey: ["accessRequests", tenantId],
    queryFn: () => base44.entities.AccessRequest.filter({ 
      tenant_id: tenantId, 
      status: "pending" 
    }),
  });

  // Fetch available roles
  const { data: tenantRoles = [] } = useQuery({
    queryKey: ["tenantRoles", tenantId],
    queryFn: () => base44.entities.TenantRole.filter({ tenant_id: tenantId }),
  });

  const { data: globalRoles = [] } = useQuery({
    queryKey: ["tenantRoles", "__global__"],
    queryFn: () => base44.entities.TenantRole.filter({ tenant_id: "__global__" }),
  });

  const availableRoles = [
    ...tenantRoles,
    ...globalRoles.filter(gr => !tenantRoles.some(tr => tr.name === gr.name))
  ];

  const approveMutation = useMutation({
    mutationFn: async ({ request, roles }) => {
      // Create user role assignment
      await base44.entities.TenantUserRole.create({
        tenant_id: tenantId,
        user_id: request.user_id,
        user_email: request.user_email,
        roles: roles
      });
      // Update request status
      await base44.entities.AccessRequest.update(request.id, { status: "approved" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accessRequests", tenantId] });
      queryClient.invalidateQueries({ queryKey: ["tenantUserRoles", tenantId] });
      toast.success("User approved");
    },
  });

  const denyMutation = useMutation({
    mutationFn: (requestId) => base44.entities.AccessRequest.update(requestId, { status: "denied" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accessRequests", tenantId] });
      toast.success("Request denied");
    },
  });

  const handleApprove = (request) => {
    const roles = selectedRoles[request.id] || [];
    if (roles.length === 0) {
      toast.error("Select at least one role");
      return;
    }
    approveMutation.mutate({ request, roles });
  };

  if (requests.length === 0) return null;

  return (
    <Card className="border-amber-200 bg-amber-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2 text-amber-800">
          <UserPlus className="h-4 w-4" />
          Pending Access Requests ({requests.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {requests.map((request) => (
          <div key={request.id} className="bg-white p-3 rounded-lg border space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">{request.user_name || request.user_email}</div>
                <div className="text-xs text-gray-500">{request.user_email}</div>
              </div>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => denyMutation.mutate(request.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
                <Button 
                  size="sm"
                  onClick={() => handleApprove(request)}
                  disabled={(selectedRoles[request.id] || []).length === 0}
                >
                  <Check className="h-4 w-4 mr-1" /> Approve
                </Button>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {availableRoles.map(role => (
                <div key={role.id} className="flex items-center gap-1">
                  <Checkbox
                    id={`req-${request.id}-role-${role.id}`}
                    checked={(selectedRoles[request.id] || []).includes(role.name)}
                    onCheckedChange={(checked) => {
                      const current = selectedRoles[request.id] || [];
                      setSelectedRoles({
                        ...selectedRoles,
                        [request.id]: checked 
                          ? [...current, role.name]
                          : current.filter(r => r !== role.name)
                      });
                    }}
                  />
                  <label htmlFor={`req-${request.id}-role-${role.id}`} className="text-sm cursor-pointer">
                    {role.name}
                  </label>
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}