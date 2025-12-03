import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building2 } from "lucide-react";

export default function CMSTenantSelector({ value, onChange, showLabel = true }) {
  const { data: tenants = [], isLoading } = useQuery({
    queryKey: ["tenants"],
    queryFn: () => base44.entities.Tenant.list()
  });

  return (
    <div className="flex items-center gap-3">
      {showLabel && (
        <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
          <Building2 className="h-4 w-4" />
          Tenant:
        </div>
      )}
      <Select value={value || ""} onValueChange={onChange}>
        <SelectTrigger className="w-64">
          <SelectValue placeholder="Select tenant..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">
            <div className="flex items-center gap-2">
              <span>All Tenants</span>
              <Badge variant="outline" className="text-xs">Global Admin</Badge>
            </div>
          </SelectItem>
          {tenants.map(tenant => (
            <SelectItem key={tenant.id} value={tenant.id}>
              <div className="flex items-center gap-2">
                <span>{tenant.name}</span>
                {tenant.slug && (
                  <span className="text-xs text-gray-400">({tenant.slug})</span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {value && value !== "__all__" && (
        <Badge className="bg-blue-100 text-blue-700">
          {tenants.find(t => t.id === value)?.name || "Selected"}
        </Badge>
      )}
    </div>
  );
}