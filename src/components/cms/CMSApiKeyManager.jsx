import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Copy, Trash2, Key, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const allPermissions = [
  { value: "pages:read", label: "Read Pages" },
  { value: "pages:write", label: "Write Pages" },
  { value: "products:read", label: "Read Products" },
  { value: "products:write", label: "Write Products" },
  { value: "blog:read", label: "Read Blog" },
  { value: "blog:write", label: "Write Blog" },
  { value: "forms:read", label: "Read Forms" },
  { value: "forms:write", label: "Write Forms" },
  { value: "submissions:read", label: "Read Submissions" },
  { value: "submissions:write", label: "Write Submissions" }
];

export default function CMSApiKeyManager({ tenantId }) {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [newKey, setNewKey] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    permissions: ["pages:read", "products:read", "blog:read", "forms:read"]
  });

  const { data: apiKeys = [], isLoading } = useQuery({
    queryKey: ["cmsApiKeys", tenantId],
    queryFn: () => base44.entities.CMSApiKey.filter(tenantId ? { tenant_id: tenantId } : {})
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      // Generate a random API key
      const key = 'cms_' + crypto.randomUUID().replace(/-/g, '');
      const result = await base44.entities.CMSApiKey.create({
        ...data,
        api_key: key,
        tenant_id: tenantId
      });
      return { ...result, plainKey: key };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["cmsApiKeys"] });
      setNewKey(data.plainKey);
      setFormData({ name: "", permissions: ["pages:read", "products:read", "blog:read", "forms:read"] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.CMSApiKey.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cmsApiKeys"] });
      toast.success("API key deleted");
    }
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, is_active }) => base44.entities.CMSApiKey.update(id, { is_active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cmsApiKeys"] });
    }
  });

  const handleCreate = (e) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error("Name is required");
      return;
    }
    createMutation.mutate(formData);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const togglePermission = (permission) => {
    if (formData.permissions.includes(permission)) {
      setFormData({
        ...formData,
        permissions: formData.permissions.filter(p => p !== permission)
      });
    } else {
      setFormData({
        ...formData,
        permissions: [...formData.permissions, permission]
      });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          API Keys
        </CardTitle>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create API Key
        </Button>
      </CardHeader>
      <CardContent>
        {/* API Usage Info */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">API Usage</h4>
          <p className="text-sm text-blue-800 mb-2">
            Use these headers when calling the CMS API:
          </p>
          <code className="text-xs bg-blue-100 px-2 py-1 rounded block mb-1">
            X-API-Key: your_api_key
          </code>
          <code className="text-xs bg-blue-100 px-2 py-1 rounded block">
            X-Tenant-ID: {tenantId || "your_tenant_id"}
          </code>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : apiKeys.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Key className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No API keys yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {apiKeys.map(key => (
              <div key={key.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{key.name}</h3>
                    <Badge className={key.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}>
                      {key.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="text-xs bg-gray-200 px-2 py-1 rounded">
                      {key.api_key.substring(0, 15)}...
                    </code>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(key.api_key)}>
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {key.permissions?.map(p => (
                      <Badge key={p} variant="outline" className="text-xs">{p}</Badge>
                    ))}
                  </div>
                  {key.last_used && (
                    <p className="text-xs text-gray-500 mt-2">
                      Last used: {new Date(key.last_used).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={key.is_active}
                    onCheckedChange={(v) => toggleActiveMutation.mutate({ id: key.id, is_active: v })}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500"
                    onClick={() => {
                      if (confirm("Delete this API key?")) {
                        deleteMutation.mutate(key.id);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={(o) => { setShowCreate(o); setNewKey(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create API Key</DialogTitle>
          </DialogHeader>
          
          {newKey ? (
            <div className="space-y-4">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-800">Save this key now!</p>
                    <p className="text-sm text-yellow-700">You won't be able to see it again.</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-gray-100 rounded-lg">
                <code className="flex-1 text-sm break-all">{newKey}</code>
                <Button variant="ghost" size="icon" onClick={() => copyToClipboard(newKey)}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <Button className="w-full" onClick={() => { setShowCreate(false); setNewKey(null); }}>
                Done
              </Button>
            </div>
          ) : (
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <Label>Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Wix Website"
                />
              </div>
              <div>
                <Label>Permissions</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {allPermissions.map(perm => (
                    <div key={perm.value} className="flex items-center gap-2">
                      <Checkbox
                        checked={formData.permissions.includes(perm.value)}
                        onCheckedChange={() => togglePermission(perm.value)}
                      />
                      <span className="text-sm">{perm.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Create Key
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}