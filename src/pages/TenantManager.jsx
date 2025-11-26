import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Pencil, Trash2, Building2, Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

import TenantForm from "@/components/tenants/TenantForm";

export default function TenantManager() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState(null);
  const queryClient = useQueryClient();

  const { data: tenants = [], isLoading } = useQuery({
    queryKey: ["tenants"],
    queryFn: () => base44.entities.Tenant.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Tenant.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
      setIsFormOpen(false);
      toast.success("Tenant created");
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
    <div className="p-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Tenant Manager</CardTitle>
          <Button onClick={() => { setEditingTenant(null); setIsFormOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Tenant
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : tenants.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No tenants yet. Add one to get started.
            </div>
          ) : (
            <div className="space-y-2">
              {tenants.map((tenant) => (
                <div 
                  key={tenant.id} 
                  className="flex items-center gap-3 p-3 bg-white border rounded-lg shadow-sm"
                >
                  <Building2 className="h-5 w-5 text-gray-400" />
                  <div className="flex-1">
                    <span className="font-medium">{tenant.name}</span>
                    <span className="text-sm text-gray-400 ml-2">/{tenant.slug}</span>
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
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          )}
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