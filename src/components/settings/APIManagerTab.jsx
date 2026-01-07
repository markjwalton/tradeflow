import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Key, Plus, Trash2, Edit, RefreshCw, CheckCircle2, XCircle, 
  Loader2, Activity, BarChart3, Clock, Zap,
  Eye, EyeOff, Copy, Search, Globe, Building2, DollarSign, Shield, Link2
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { format } from "date-fns";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

const commonProviders = [
  { value: "openai", label: "OpenAI", baseUrl: "https://api.openai.com/v1" },
  { value: "stripe", label: "Stripe", baseUrl: "https://api.stripe.com/v1" },
  { value: "ideal_postcodes", label: "Ideal Postcodes", baseUrl: "https://api.ideal-postcodes.co.uk/v1" },
  { value: "custom", label: "Custom API", baseUrl: "" },
];

const BASE44_SECRET_MAPPINGS = [
  { secretName: "IDEAL_POSTCODES_API_KEY", provider: "ideal_postcodes", name: "Ideal Postcodes", baseUrl: "https://api.ideal-postcodes.co.uk/v1" },
  { secretName: "GOOGLE_CLOUD_API_KEY", provider: "google", name: "Google Cloud", baseUrl: "https://maps.googleapis.com" },
  { secretName: "OPENAI_API_KEY", provider: "openai", name: "OpenAI", baseUrl: "https://api.openai.com/v1" },
];

export function APIManagerTab() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("secrets");
  const [showEditor, setShowEditor] = useState(false);
  const [editingApi, setEditingApi] = useState(null);
  const [showKey, setShowKey] = useState({});
  const [formData, setFormData] = useState({
    name: "",
    provider: "",
    api_key: "",
    base_url: "",
    is_global: true,
    token_rate: 0,
    billing_unit: "per_call",
  });
  
  const base44Secrets = ["IDEAL_POSTCODES_API_KEY", "GOOGLE_CLOUD_API_KEY"];

  const { data: apiConfigs = [] } = useQuery({
    queryKey: ["apiConfigs"],
    queryFn: () => base44.entities.APIConfig.list("-created_date")
  });

  const { data: apiLogs = [] } = useQuery({
    queryKey: ["apiLogs"],
    queryFn: () => base44.entities.APILog.list("-created_date", 200)
  });

  const createMutation = useMutation({
    mutationFn: (data) => {
      const masked = data.api_key ? data.api_key.substring(0, 4) + "..." + data.api_key.slice(-4) : "";
      return base44.entities.APIConfig.create({
        ...data,
        api_key_masked: masked,
        api_key_encrypted: data.api_key,
        status: "active"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["apiConfigs"] });
      toast.success("API configuration saved");
      setShowEditor(false);
      setEditingApi(null);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => {
      const updateData = { ...data };
      if (data.api_key) {
        updateData.api_key_masked = data.api_key.substring(0, 4) + "..." + data.api_key.slice(-4);
        updateData.api_key_encrypted = data.api_key;
      }
      delete updateData.api_key;
      return base44.entities.APIConfig.update(id, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["apiConfigs"] });
      toast.success("API configuration updated");
      setShowEditor(false);
      setEditingApi(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.APIConfig.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["apiConfigs"] });
      toast.success("API configuration deleted");
    }
  });

  const openEditor = (api = null) => {
    if (api) {
      setEditingApi(api);
      setFormData({
        name: api.name,
        provider: api.provider || "",
        api_key: "",
        base_url: api.base_url || "",
        is_global: api.is_global !== false,
        token_rate: api.token_rate || 0,
        billing_unit: api.billing_unit || "per_call",
      });
    } else {
      setEditingApi(null);
      setFormData({ 
        name: "", 
        provider: "", 
        api_key: "", 
        base_url: "", 
        is_global: true,
        token_rate: 0,
        billing_unit: "per_call",
      });
    }
    setShowEditor(true);
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (editingApi) {
      updateMutation.mutate({ id: editingApi.id, data: formData });
    } else {
      if (!formData.api_key) {
        toast.error("API key is required");
        return;
      }
      createMutation.mutate(formData);
    }
  };

  const analytics = useMemo(() => {
    const last24h = apiLogs.filter(log => 
      new Date(log.created_date) > new Date(Date.now() - 24 * 60 * 60 * 1000)
    );

    const successRate = last24h.length > 0 
      ? (last24h.filter(l => l.success).length / last24h.length * 100).toFixed(1)
      : 100;

    const avgResponseTime = last24h.length > 0
      ? (last24h.reduce((sum, l) => sum + (l.response_time_ms || 0), 0) / last24h.length).toFixed(0)
      : 0;

    return { successRate, avgResponseTime, total24h: last24h.length };
  }, [apiLogs]);

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="secrets" className="gap-2">
            <Shield className="h-4 w-4" />
            Secrets
          </TabsTrigger>
          <TabsTrigger value="apis" className="gap-2">
            <Key className="h-4 w-4" />
            APIs
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="secrets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Platform Secrets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {BASE44_SECRET_MAPPINGS.map(mapping => {
                  const isConfigured = base44Secrets.includes(mapping.secretName);
                  const existingApi = apiConfigs.find(a => a.provider === mapping.provider && a.is_global);
                  
                  return (
                    <div 
                      key={mapping.secretName} 
                      className={`flex items-center justify-between p-4 rounded-lg border ${
                        isConfigured ? "bg-success/5" : "bg-muted"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        {isConfigured ? (
                          <CheckCircle2 className="h-5 w-5 text-success" />
                        ) : (
                          <XCircle className="h-5 w-5 text-muted-foreground" />
                        )}
                        <div>
                          <div className="font-medium">{mapping.name}</div>
                          <code className="text-xs text-muted-foreground">{mapping.secretName}</code>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isConfigured && !existingApi && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setFormData({
                                name: mapping.name,
                                provider: mapping.provider,
                                api_key: `{{${mapping.secretName}}}`,
                                base_url: mapping.baseUrl,
                                is_global: true,
                                token_rate: 0,
                                billing_unit: "per_call",
                              });
                              setShowEditor(true);
                            }}
                          >
                            <Link2 className="h-3 w-3 mr-1" />
                            Create Config
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="apis" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => openEditor()}>
              <Plus className="h-4 w-4 mr-2" />
              Add API
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {apiConfigs.map(api => (
              <Card key={api.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base">{api.name}</CardTitle>
                    <Badge className={api.status === "active" ? "bg-success/10 text-success" : ""}>
                      {api.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">API Key</span>
                      <div className="flex items-center gap-1">
                        <code className="text-xs bg-muted px-2 py-0.5 rounded">
                          {showKey[api.id] ? api.api_key_encrypted : api.api_key_masked}
                        </code>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6"
                          onClick={() => setShowKey({ ...showKey, [api.id]: !showKey[api.id] })}
                        >
                          {showKey[api.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button size="sm" variant="outline" onClick={() => openEditor(api)}>
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="text-destructive"
                      onClick={() => {
                        if (confirm("Delete this API configuration?")) {
                          deleteMutation.mutate(api.id);
                        }
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Zap className="h-4 w-4" />
                  <span className="text-sm">Calls (24h)</span>
                </div>
                <div className="text-2xl font-bold">{analytics.total24h}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-sm">Success Rate</span>
                </div>
                <div className="text-2xl font-bold text-success">
                  {analytics.successRate}%
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">Avg Response</span>
                </div>
                <div className="text-2xl font-bold">
                  {analytics.avgResponseTime}ms
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={showEditor} onOpenChange={setShowEditor}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingApi ? "Edit API" : "Add API"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Production Stripe"
              />
            </div>
            <div>
              <Label>Provider</Label>
              <Select 
                value={formData.provider} 
                onValueChange={(v) => {
                  const provider = commonProviders.find(p => p.value === v);
                  setFormData({ 
                    ...formData, 
                    provider: v,
                    base_url: provider?.baseUrl || formData.base_url
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select provider..." />
                </SelectTrigger>
                <SelectContent>
                  {commonProviders.map(p => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>API Key {!editingApi && "*"}</Label>
              <Input
                type="password"
                value={formData.api_key}
                onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
                placeholder={editingApi ? "Leave blank to keep existing" : "Enter API key"}
              />
            </div>
            <div>
              <Label>Base URL</Label>
              <Input
                value={formData.base_url}
                onChange={(e) => setFormData({ ...formData, base_url: e.target.value })}
                placeholder="https://api.example.com"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowEditor(false)}>Cancel</Button>
              <Button onClick={handleSave}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}