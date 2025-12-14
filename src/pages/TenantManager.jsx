import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Pencil, Trash2, Building2, Check, X, ChevronDown, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

import TenantForm from "@/components/tenants/TenantForm";
import TenantRoleManager from "@/components/tenants/TenantRoleManager";
import TenantUserManager from "@/components/tenants/TenantUserManager";
import TenantAccessRequests from "@/components/tenants/TenantAccessRequests";
import { PageHeader } from "@/components/sturij";

export default function TenantManager() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState(null);
  const [expandedTenants, setExpandedTenants] = useState(new Set());
  const [currentUser, setCurrentUser] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => {});
  }, []);

  const toggleExpand = (tenantId) => {
    setExpandedTenants(prev => {
      const next = new Set(prev);
      if (next.has(tenantId)) {
        next.delete(tenantId);
      } else {
        next.add(tenantId);
      }
      return next;
    });
  };

  const { data: tenants = [], isLoading } = useQuery({
    queryKey: ["tenants"],
    queryFn: () => base44.entities.Tenant.list(),
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      // Create the tenant
      const tenant = await base44.entities.Tenant.create(data);
      
      // Auto-add current user as admin of new tenant
      if (currentUser) {
        // Ensure "admin" role exists for this tenant (or use global)
        const existingRoles = await base44.entities.TenantRole.filter({ tenant_id: tenant.id });
        if (existingRoles.length === 0) {
          // Create default admin role for tenant
          await base44.entities.TenantRole.create({
            tenant_id: tenant.id,
            name: "admin",
            description: "Full access administrator"
          });
        }
        
        // Add current user to tenant with admin role
        await base44.entities.TenantUserRole.create({
          tenant_id: tenant.id,
          user_id: currentUser.id,
          user_email: currentUser.email,
          roles: ["admin"]
        });
      }
      
      return tenant;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
      setIsFormOpen(false);
      toast.success("Tenant created - you've been added as admin");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Tenant.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
      setIsFormOpen(false);
      setEditingTenant(null);
      toast.success("Tenant updated");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Tenant.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
      toast.success("Tenant deleted");
    },
  });

  const handleSubmit = (formData) => {
    if (editingTenant) {
      updateMutation.mutate({ id: editingTenant.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (tenant) => {
    setEditingTenant(tenant);
    setIsFormOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto -mt-6 min-h-screen">
      <PageHeader 
        title="Tenant Manager"
        description="Manage tenants, roles, and access permissions"
      />

      <Card className="border-border mb-4">
        <CardContent className="px-2 py-1">
          <div className="flex gap-2">
            <Button 
              variant="ghost"
              className="hover:bg-[#e9efeb] hover:text-[#273e2d]"
              onClick={() => { setEditingTenant(null); setIsFormOpen(true); }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Tenant
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card className="border-border">
        <CardContent className="p-4">
          <Card className="border-border">
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : tenants.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No tenants yet. Add one to get started.
            </div>
          ) : (
            <div className="space-y-2">
              {tenants.map((tenant) => (
                <div key={tenant.id} className="border border-border rounded-lg shadow-sm overflow-hidden">
                  <div className="flex items-center gap-3 p-3 bg-card">
                    <button 
                      onClick={() => toggleExpand(tenant.id)}
                      className="p-1 hover:bg-background rounded"
                    >
                      {expandedTenants.has(tenant.id) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                    <Building2 className="h-5 w-5" />
                    <div className="flex-1">
                      <span className="font-medium text-foreground">{tenant.name}</span>
                      <span className="text-sm text-muted-foreground ml-2">/{tenant.slug}</span>
                    </div>
                    <Badge variant={tenant.is_active !== false ? "default" : "secondary"}>
                      {tenant.is_active !== false ? (
                        <><Check className="h-3 w-3 mr-1" /> Active</>
                      ) : (
                        <><X className="h-3 w-3 mr-1" /> Inactive</>
                      )}
                    </Badge>
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(tenant)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(tenant.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                  {expandedTenants.has(tenant.id) && (
                    <div className="p-3 bg-background border-t border-border space-y-4">
                      <TenantAccessRequests tenantId={tenant.id} />
                      <TenantRoleManager tenantId={tenant.id} />
                      <TenantUserManager tenantId={tenant.id} />
                      <div className="text-sm text-muted-foreground bg-card p-3 rounded border border-border">
                        <strong>Invite Link:</strong>{" "}
                        <code className="bg-muted px-2 py-1 rounded">
                          {window.location.origin}/TenantAccess?tenant={tenant.slug}
                        </code>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          </CardContent>
        </Card>
        </CardContent>
      </Card>

      <TenantForm
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setEditingTenant(null); }}
        onSubmit={handleSubmit}
        tenant={editingTenant}
      />
    </div>
  );
}