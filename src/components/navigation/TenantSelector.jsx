import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function TenantSelector({ 
  tenants = [], 
  selectedTenantId, 
  onSelectTenant,
  includeGlobal = true
}) {
  return (
    <div className="flex items-center gap-3">
      <Label>Tenant:</Label>
      <Select value={selectedTenantId} onValueChange={onSelectTenant}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Select tenant" />
        </SelectTrigger>
        <SelectContent>
          {includeGlobal && (
            <SelectItem value="__global__">Global (Default Template)</SelectItem>
          )}
          {tenants.map((tenant) => (
            <SelectItem key={tenant.id} value={tenant.id}>
              {tenant.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}