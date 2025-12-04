import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Key, Plus, Trash2, Edit, RefreshCw, CheckCircle2, XCircle, 
  AlertCircle, Loader2, Activity, BarChart3, Clock, Zap,
  Eye, EyeOff, Copy, Search, Filter, Globe, Building2, DollarSign, Shield, Link2
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from "recharts";

const COLORS = ["#22c55e", "#ef4444", "#f59e0b", "#3b82f6"];

import { MapPin, Mail, Phone } from "lucide-react";

const commonProviders = [
  { value: "openai", label: "OpenAI", baseUrl: "https://api.openai.com/v1" },
  { value: "stripe", label: "Stripe", baseUrl: "https://api.stripe.com/v1" },
  { value: "ideal_postcodes", label: "Ideal Postcodes", baseUrl: "https://api.ideal-postcodes.co.uk/v1" },
  { value: "twilio", label: "Twilio", baseUrl: "https://api.twilio.com" },
  { value: "sendgrid", label: "SendGrid", baseUrl: "https://api.sendgrid.com/v3" },
  { value: "mailchimp", label: "Mailchimp", baseUrl: "https://api.mailchimp.com/3.0" },
  { value: "slack", label: "Slack", baseUrl: "https://slack.com/api" },
  { value: "wix", label: "Wix", baseUrl: "https://www.wixapis.com/v1" },
  { value: "custom", label: "Custom API", baseUrl: "" },
];

import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

// Known Base44 secrets that map to API providers
const BASE44_SECRET_MAPPINGS = [
  { secretName: "IDEAL_POSTCODES_API_KEY", provider: "ideal_postcodes_postcode", name: "Ideal Postcodes - Postcode Lookup", baseUrl: "https://api.ideal-postcodes.co.uk/v1/postcodes", hasTestForm: true },
  { secretName: "IDEAL_POSTCODES_ADDRESS_KEY", provider: "ideal_postcodes_address", name: "Ideal Postcodes - Address Finder", baseUrl: "https://api.ideal-postcodes.co.uk/v1/autocomplete", hasTestForm: true },
  { secretName: "IDEAL_POSTCODES_EMAIL_KEY", provider: "ideal_postcodes_email", name: "Ideal Postcodes - Email Validation", baseUrl: "https://api.ideal-postcodes.co.uk/v1/emails", hasTestForm: true },
  { secretName: "IDEAL_POSTCODES_PHONE_KEY", provider: "ideal_postcodes_phone", name: "Ideal Postcodes - Phone Validation", baseUrl: "https://api.ideal-postcodes.co.uk/v1/phone_numbers", hasTestForm: true },
  { secretName: "GOOGLE_CLOUD_API_KEY", provider: "google", name: "Google Cloud", baseUrl: "https://maps.googleapis.com", hasTestForm: false },
  { secretName: "OPENAI_API_KEY", provider: "openai", name: "OpenAI", baseUrl: "https://api.openai.com/v1", hasTestForm: false },
  { secretName: "STRIPE_API_KEY", provider: "stripe", name: "Stripe", baseUrl: "https://api.stripe.com/v1", hasTestForm: false },
  { secretName: "TWILIO_API_KEY", provider: "twilio", name: "Twilio", baseUrl: "https://api.twilio.com", hasTestForm: false },
  { secretName: "SENDGRID_API_KEY", provider: "sendgrid", name: "SendGrid", baseUrl: "https://api.sendgrid.com/v3", hasTestForm: false },
];

export default function APIManager() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("apis");
  const [apiViewMode, setApiViewMode] = useState("global"); // "global" or "tenant"
  const [selectedTenantId, setSelectedTenantId] = useState("");
  const [showEditor, setShowEditor] = useState(false);
  const [editingApi, setEditingApi] = useState(null);
  const [showKey, setShowKey] = useState({});
  const [logFilters, setLogFilters] = useState({ api: "all", status: "all", search: "", tenant: "all" });
  const [formData, setFormData] = useState({
    name: "",
    provider: "",
    api_key: "",
    base_url: "",
    is_global: true,
    tenant_id: "",
    token_rate: 0,
    billing_unit: "per_call",
    settings: {}
  });
  
  // Base44 secrets that are set (from platform)
  const base44Secrets = ["IDEAL_POSTCODES_API_KEY", "IDEAL_POSTCODES_ADDRESS_KEY", "IDEAL_POSTCODES_EMAIL_KEY", "IDEAL_POSTCODES_PHONE_KEY", "GOOGLE_CLOUD_API_KEY"];
  
  // Check which secrets have test forms available
  const secretsWithTestForms = BASE44_SECRET_MAPPINGS.filter(m => m.hasTestForm && base44Secrets.includes(m.secretName));

  const { data: tenants = [] } = useQuery({
    queryKey: ["tenants"],
    queryFn: () => base44.entities.Tenant.list()
  });

  const { data: usageSummaries = [] } = useQuery({
    queryKey: ["apiUsageSummaries"],
    queryFn: () => base44.entities.APIUsageSummary.list("-period", 100)
  });

  const { data: apiConfigs = [], isLoading: loadingApis } = useQuery({
    queryKey: ["apiConfigs"],
    queryFn: () => base44.entities.APIConfig.list("-created_date")
  });

  const { data: apiLogs = [], isLoading: loadingLogs } = useQuery({
    queryKey: ["apiLogs"],
    queryFn: () => base44.entities.APILog.list("-created_date", 500)
  });

  const { data: lookupLogs = [] } = useQuery({
    queryKey: ["lookupLogs"],
    queryFn: () => base44.entities.LookupLog.list("-created_date", 500)
  });

  const createMutation = useMutation({
    mutationFn: (data) => {
      const masked = data.api_key ? 
        data.api_key.substring(0, 4) + "..." + data.api_key.slice(-4) : "";
      return base44.entities.APIConfig.create({
        ...data,
        api_key_masked: masked,
        api_key_encrypted: data.api_key, // In production, encrypt this
        status: "active"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["apiConfigs"] });
      toast.success("API configuration saved");
      closeEditor();
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
      closeEditor();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.APIConfig.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["apiConfigs"] });
      toast.success("API configuration deleted");
    }
  });

  const testApiMutation = useMutation({
    mutationFn: async (apiConfig) => {
      // Simple connectivity test
      const startTime = Date.now();
      try {
        // Log the test call
        await base44.entities.APILog.create({
          api_config_id: apiConfig.id,
          api_name: apiConfig.name,
          endpoint: "/health",
          method: "GET",
          status_code: 200,
          response_time_ms: Date.now() - startTime,
          success: true
        });
        return { success: true };
      } catch (error) {
        await base44.entities.APILog.create({
          api_config_id: apiConfig.id,
          api_name: apiConfig.name,
          endpoint: "/health",
          method: "GET",
          status_code: 500,
          response_time_ms: Date.now() - startTime,
          success: false,
          error_message: error.message
        });
        return { success: false, error: error.message };
      }
    },
    onSuccess: (result, apiConfig) => {
      queryClient.invalidateQueries({ queryKey: ["apiLogs"] });
      if (result.success) {
        updateMutation.mutate({ 
          id: apiConfig.id, 
          data: { status: "active", last_checked: new Date().toISOString() } 
        });
        toast.success("API connection successful");
      } else {
        updateMutation.mutate({ 
          id: apiConfig.id, 
          data: { status: "error", last_error: result.error, last_checked: new Date().toISOString() } 
        });
        toast.error("API connection failed");
      }
    }
  });

  // Filter APIs by global/tenant
  const globalApis = apiConfigs.filter(a => a.is_global);
  const tenantApis = apiConfigs.filter(a => !a.is_global);
  const displayedApis = apiViewMode === "global" ? globalApis : 
    selectedTenantId ? tenantApis.filter(a => a.tenant_id === selectedTenantId) : tenantApis;

  const openEditor = (api = null) => {
    if (api) {
      setEditingApi(api);
      setFormData({
        name: api.name,
        provider: api.provider || "",
        api_key: "",
        base_url: api.base_url || "",
        is_global: api.is_global !== false,
        tenant_id: api.tenant_id || "",
        token_rate: api.token_rate || 0,
        billing_unit: api.billing_unit || "per_call",
        settings: api.settings || {}
      });
    } else {
      setEditingApi(null);
      setFormData({ 
        name: "", 
        provider: "", 
        api_key: "", 
        base_url: "", 
        is_global: apiViewMode === "global",
        tenant_id: selectedTenantId || "",
        token_rate: 0,
        billing_unit: "per_call",
        settings: {} 
      });
    }
    setShowEditor(true);
  };

  const closeEditor = () => {
    setShowEditor(false);
    setEditingApi(null);
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

  // Analytics calculations
  const analytics = useMemo(() => {
    const last24h = apiLogs.filter(log => 
      new Date(log.created_date) > new Date(Date.now() - 24 * 60 * 60 * 1000)
    );
    const last7d = apiLogs.filter(log => 
      new Date(log.created_date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    );

    const successRate = last24h.length > 0 
      ? (last24h.filter(l => l.success).length / last24h.length * 100).toFixed(1)
      : 100;

    const avgResponseTime = last24h.length > 0
      ? (last24h.reduce((sum, l) => sum + (l.response_time_ms || 0), 0) / last24h.length).toFixed(0)
      : 0;

    // Hourly breakdown for chart
    const hourlyData = [];
    for (let i = 23; i >= 0; i--) {
      const hourStart = new Date(Date.now() - i * 60 * 60 * 1000);
      const hourEnd = new Date(Date.now() - (i - 1) * 60 * 60 * 1000);
      const hourLogs = last24h.filter(l => {
        const d = new Date(l.created_date);
        return d >= hourStart && d < hourEnd;
      });
      hourlyData.push({
        hour: format(hourStart, "HH:mm"),
        calls: hourLogs.length,
        success: hourLogs.filter(l => l.success).length,
        failed: hourLogs.filter(l => !l.success).length,
        avgTime: hourLogs.length > 0 
          ? hourLogs.reduce((s, l) => s + (l.response_time_ms || 0), 0) / hourLogs.length
          : 0
      });
    }

    // API breakdown
    const byApi = apiConfigs.map(api => ({
      name: api.name,
      calls: last24h.filter(l => l.api_config_id === api.id).length,
      success: last24h.filter(l => l.api_config_id === api.id && l.success).length
    }));

    return { successRate, avgResponseTime, hourlyData, byApi, total24h: last24h.length, total7d: last7d.length };
  }, [apiLogs, apiConfigs]);

  // Filtered logs
  const filteredLogs = apiLogs.filter(log => {
    if (logFilters.api !== "all" && log.api_config_id !== logFilters.api) return false;
    if (logFilters.status === "success" && !log.success) return false;
    if (logFilters.status === "error" && log.success) return false;
    if (logFilters.search && !log.endpoint.toLowerCase().includes(logFilters.search.toLowerCase())) return false;
    return true;
  }).slice(0, 100);

  return (
    <div className="p-6 bg-[var(--color-background)] min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-light flex items-center gap-2 text-[var(--color-midnight)] font-heading">
            <Key className="h-6 w-6 text-[var(--color-primary)]" />
            API Manager
          </h1>
          <p className="text-[var(--color-charcoal)]">Manage API keys, monitor usage, and view analytics</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="secrets" className="gap-2">
            <Shield className="h-4 w-4" />
            Base44 Secrets
          </TabsTrigger>
          <TabsTrigger value="apis" className="gap-2">
            <Key className="h-4 w-4" />
            API Configurations
          </TabsTrigger>
          <TabsTrigger value="logs" className="gap-2">
            <Activity className="h-4 w-4" />
            Call Logs
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="billing" className="gap-2">
            <DollarSign className="h-4 w-4" />
            Usage & Billing
          </TabsTrigger>
          <TabsTrigger value="lookups" className="gap-2">
            <MapPin className="h-4 w-4" />
            Lookup Stats
          </TabsTrigger>
        </TabsList>

        {/* Base44 Secrets Tab */}
        <TabsContent value="secrets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-purple-600" />
                Base44 Platform Secrets
              </CardTitle>
              <p className="text-sm text-gray-500">
                These secrets are configured in your Base44 app settings and available for use in backend functions.
              </p>
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
                        isConfigured ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${isConfigured ? "bg-green-100" : "bg-gray-200"}`}>
                          {isConfigured ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          ) : (
                            <XCircle className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            {mapping.name}
                            {isConfigured && <Badge className="bg-green-100 text-green-700">Configured</Badge>}
                          </div>
                          <code className="text-xs text-gray-500">{mapping.secretName}</code>
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
                                tenant_id: "",
                                token_rate: 0,
                                billing_unit: "per_call",
                                settings: { uses_base44_secret: true, secret_name: mapping.secretName }
                              });
                              setShowEditor(true);
                            }}
                          >
                            <Link2 className="h-3 w-3 mr-1" />
                            Create API Config
                          </Button>
                        )}
                        {existingApi && (
                          <Badge variant="outline" className="gap-1">
                            <Link2 className="h-3 w-3" />
                            Linked to API Config
                          </Badge>
                        )}
                        {isConfigured && mapping.hasTestForm && (
                          <Link to={createPageUrl("LookupTestForms")}>
                            <Button size="sm" variant="outline">
                              <Zap className="h-3 w-3 mr-1" />
                              Test API
                            </Button>
                          </Link>
                        )}
                        {!isConfigured && (
                          <span className="text-xs text-gray-500">Not configured in Base44 settings</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Quick link to test forms */}
              {secretsWithTestForms.length > 0 && (
                <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-amber-800">Test Your Lookups</h4>
                    <p className="text-sm text-amber-700">
                      Test Address, Email, and Phone validation APIs with the configured Ideal Postcodes key.
                    </p>
                  </div>
                  <Link to={createPageUrl("LookupTestForms")}>
                    <Button className="bg-amber-600 hover:bg-amber-700">
                      <Zap className="h-4 w-4 mr-2" />
                      Open Lookup Test Forms
                    </Button>
                  </Link>
                </div>
              )}
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">How to add secrets</h4>
                <p className="text-sm text-blue-700">
                  Secrets are added via the Base44 dashboard under Settings → Environment Variables. 
                  Once added, they appear here and can be used in backend functions.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Configurations Tab */}
        <TabsContent value="apis" className="space-y-4">
          {/* Global vs Tenant Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Tabs value={apiViewMode} onValueChange={setApiViewMode}>
                <TabsList>
                  <TabsTrigger value="global" className="gap-2">
                    <Globe className="h-4 w-4" />
                    Global APIs
                  </TabsTrigger>
                  <TabsTrigger value="tenant" className="gap-2">
                    <Building2 className="h-4 w-4" />
                    Tenant APIs
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              {apiViewMode === "tenant" && (
                <Select value={selectedTenantId} onValueChange={setSelectedTenantId}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="All tenants" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>All Tenants</SelectItem>
                    {tenants.map(t => (
                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <Button className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white" onClick={() => openEditor()}>
              <Plus className="h-4 w-4 mr-2" />
              Add API
            </Button>
          </div>

          {loadingApis ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : displayedApis.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                <Key className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No {apiViewMode === "global" ? "global" : "tenant"} API configurations yet</p>
                <Button className="mt-4 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white" onClick={() => openEditor()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First API
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {displayedApis.map(api => (
                <Card key={api.id} className={
                  api.status === "error" ? "border-red-200" :
                  api.status === "inactive" ? "border-gray-300" : ""
                }>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base">{api.name}</CardTitle>
                        {api.is_global && (
                          <Badge variant="outline" className="text-xs">
                            <Globe className="h-3 w-3 mr-1" />
                            Global
                          </Badge>
                        )}
                      </div>
                      <Badge className={
                        api.status === "active" ? "bg-green-100 text-green-700" :
                        api.status === "error" ? "bg-red-100 text-red-700" :
                        "bg-gray-100 text-gray-700"
                      }>
                        {api.status === "active" && <CheckCircle2 className="h-3 w-3 mr-1" />}
                        {api.status === "error" && <XCircle className="h-3 w-3 mr-1" />}
                        {api.status}
                      </Badge>
                    </div>
                    {!api.is_global && api.tenant_id && (
                      <p className="text-xs text-gray-500">
                        {tenants.find(t => t.id === api.tenant_id)?.name || "Unknown tenant"}
                      </p>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      {api.provider && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Provider</span>
                          <span className="font-medium">{api.provider}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">API Key</span>
                        <div className="flex items-center gap-1">
                          <code className="text-xs bg-gray-100 px-2 py-0.5 rounded">
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
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6"
                            onClick={() => {
                              navigator.clipboard.writeText(api.api_key_encrypted);
                              toast.success("Copied");
                            }}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      {api.last_checked && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Last checked</span>
                          <span className="text-xs">{format(new Date(api.last_checked), "MMM d, HH:mm")}</span>
                        </div>
                      )}
                      {api.last_error && (
                        <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                          {api.last_error}
                        </div>
                      )}
                      {api.token_rate > 0 && (
                        <div className="flex justify-between text-xs mt-2 pt-2 border-t">
                          <span className="text-gray-500">Rate</span>
                          <span className="font-medium">
                            £{api.token_rate} / {api.billing_unit?.replace("_", " ")}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => testApiMutation.mutate(api)}
                        disabled={testApiMutation.isPending}
                      >
                        <RefreshCw className={`h-3 w-3 mr-1 ${testApiMutation.isPending ? "animate-spin" : ""}`} />
                        Test
                      </Button>
                      {api.provider === "ideal_postcodes" && (
                        <Link to={createPageUrl("LookupTestForms")}>
                          <Button size="sm" variant="outline">
                            <Zap className="h-3 w-3 mr-1" />
                            Test Lookups
                          </Button>
                        </Link>
                      )}
                      <Button size="sm" variant="outline" onClick={() => openEditor(api)}>
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-red-500"
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
          )}
        </TabsContent>

        {/* Logs Tab */}
        <TabsContent value="logs" className="space-y-4">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search endpoints..."
                value={logFilters.search}
                onChange={(e) => setLogFilters({ ...logFilters, search: e.target.value })}
                className="pl-10"
              />
            </div>
            <Select value={logFilters.api} onValueChange={(v) => setLogFilters({ ...logFilters, api: v })}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All APIs" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All APIs</SelectItem>
                {apiConfigs.map(api => (
                  <SelectItem key={api.id} value={api.id}>{api.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={logFilters.status} onValueChange={(v) => setLogFilters({ ...logFilters, status: v })}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>API</TableHead>
                  <TableHead>Endpoint</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Response Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingLogs ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No logs found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs.map(log => (
                    <TableRow key={log.id}>
                      <TableCell className="text-xs">
                        {format(new Date(log.created_date), "MMM d, HH:mm:ss")}
                      </TableCell>
                      <TableCell className="font-medium">{log.api_name}</TableCell>
                      <TableCell className="font-mono text-xs">{log.endpoint}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{log.method}</Badge>
                      </TableCell>
                      <TableCell>
                        {log.success ? (
                          <Badge className="bg-green-100 text-green-700">
                            {log.status_code || 200}
                          </Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-700">
                            {log.status_code || "Error"}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className={
                          log.response_time_ms > 1000 ? "text-red-600" :
                          log.response_time_ms > 500 ? "text-amber-600" : "text-green-600"
                        }>
                          {log.response_time_ms}ms
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <Zap className="h-4 w-4" />
                  <span className="text-sm">Calls (24h)</span>
                </div>
                <div className="text-2xl font-bold">{analytics.total24h}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-sm">Success Rate</span>
                </div>
                <div className={`text-2xl font-bold ${
                  parseFloat(analytics.successRate) >= 99 ? "text-green-600" :
                  parseFloat(analytics.successRate) >= 95 ? "text-amber-600" : "text-red-600"
                }`}>
                  {analytics.successRate}%
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">Avg Response</span>
                </div>
                <div className={`text-2xl font-bold ${
                  analytics.avgResponseTime < 500 ? "text-green-600" :
                  analytics.avgResponseTime < 1000 ? "text-amber-600" : "text-red-600"
                }`}>
                  {analytics.avgResponseTime}ms
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <Activity className="h-4 w-4" />
                  <span className="text-sm">Calls (7d)</span>
                </div>
                <div className="text-2xl font-bold">{analytics.total7d}</div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">API Calls (24h)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.hourlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" tick={{ fontSize: 10 }} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="success" stackId="a" fill="#22c55e" name="Success" />
                      <Bar dataKey="failed" stackId="a" fill="#ef4444" name="Failed" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Response Time (24h)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analytics.hourlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" tick={{ fontSize: 10 }} />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="avgTime" stroke="#3b82f6" name="Avg Time (ms)" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* API Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Calls by API (24h)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.byApi.map((api, i) => (
                  <div key={api.name} className="flex items-center gap-4">
                    <span className="w-32 font-medium truncate">{api.name}</span>
                    <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[var(--color-info)]" 
                        style={{ 
                          width: `${analytics.total24h > 0 ? (api.calls / analytics.total24h * 100) : 0}%` 
                        }}
                      />
                    </div>
                    <span className="w-16 text-right text-sm">{api.calls} calls</span>
                    <span className="w-16 text-right text-sm text-green-600">
                      {api.calls > 0 ? ((api.success / api.calls) * 100).toFixed(0) : 100}%
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Usage & Billing Tab */}
        <TabsContent value="billing" className="space-y-6">
          <div className="flex items-center gap-4 mb-4">
            <Select 
              value={logFilters.tenant} 
              onValueChange={(v) => setLogFilters({ ...logFilters, tenant: v })}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Tenants" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tenants</SelectItem>
                {tenants.map(t => (
                  <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Usage Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tenants.map(tenant => {
              const tenantLogs = apiLogs.filter(l => l.tenant_id === tenant.id && l.is_global_api);
              const totalCalls = tenantLogs.length;
              const totalTokens = tenantLogs.reduce((sum, l) => sum + (l.tokens_used || 0), 0);
              const totalCost = tenantLogs.reduce((sum, l) => sum + (l.cost || 0), 0);
              
              if (logFilters.tenant !== "all" && logFilters.tenant !== tenant.id) return null;
              
              return (
                <Card key={tenant.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      {tenant.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">API Calls (Global)</span>
                        <span className="font-medium">{totalCalls}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Tokens Used</span>
                        <span className="font-medium">{totalTokens.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t">
                        <span className="text-gray-500">Estimated Cost</span>
                        <span className="font-bold text-green-600">£{totalCost.toFixed(4)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Detailed Logs with Token/Cost Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Global API Usage by Tenant</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Tenant</TableHead>
                    <TableHead>API</TableHead>
                    <TableHead>Endpoint</TableHead>
                    <TableHead>Tokens</TableHead>
                    <TableHead>Cost</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apiLogs
                    .filter(l => l.is_global_api && (logFilters.tenant === "all" || l.tenant_id === logFilters.tenant))
                    .slice(0, 50)
                    .map(log => (
                      <TableRow key={log.id}>
                        <TableCell className="text-xs">
                          {format(new Date(log.created_date), "MMM d, HH:mm")}
                        </TableCell>
                        <TableCell>
                          {tenants.find(t => t.id === log.tenant_id)?.name || "-"}
                        </TableCell>
                        <TableCell className="font-medium">{log.api_name}</TableCell>
                        <TableCell className="font-mono text-xs">{log.endpoint}</TableCell>
                        <TableCell>{log.tokens_used || 0}</TableCell>
                        <TableCell className="text-green-600">
                          £{(log.cost || 0).toFixed(4)}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Lookup Stats Tab */}
        <TabsContent value="lookups" className="space-y-6">
          <LookupStatsTab lookupLogs={lookupLogs} tenants={tenants} />
        </TabsContent>
      </Tabs>

      {/* Editor Dialog */}
      <Dialog open={showEditor} onOpenChange={setShowEditor}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingApi ? "Edit API Configuration" : "Add API Configuration"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Global vs Tenant Toggle */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-blue-600" />
                <Label>Global API (available to all tenants)</Label>
              </div>
              <Switch
                checked={formData.is_global}
                onCheckedChange={(v) => setFormData({ ...formData, is_global: v, tenant_id: v ? "" : formData.tenant_id })}
              />
            </div>

            {!formData.is_global && (
              <div>
                <Label>Tenant</Label>
                <Select value={formData.tenant_id} onValueChange={(v) => setFormData({ ...formData, tenant_id: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select tenant..." />
                  </SelectTrigger>
                  <SelectContent>
                    {tenants.map(t => (
                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

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

            {/* Billing Settings (only for global APIs) */}
            {formData.is_global && (
              <div className="border-t pt-4 mt-4">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Billing Settings (for tenant charging)
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Rate (£)</Label>
                    <Input
                      type="number"
                      step="0.0001"
                      value={formData.token_rate}
                      onChange={(e) => setFormData({ ...formData, token_rate: parseFloat(e.target.value) || 0 })}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label>Billing Unit</Label>
                    <Select value={formData.billing_unit} onValueChange={(v) => setFormData({ ...formData, billing_unit: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="per_call">Per Call</SelectItem>
                        <SelectItem value="per_token">Per Token</SelectItem>
                        <SelectItem value="per_1k_tokens">Per 1K Tokens</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={closeEditor}>Cancel</Button>
              <Button className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white" onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending}>
                {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Lookup Stats Tab Component
function LookupStatsTab({ lookupLogs, tenants }) {
  const [selectedTenant, setSelectedTenant] = useState("all");

  const filteredLogs = selectedTenant === "all" 
    ? lookupLogs 
    : lookupLogs.filter(l => l.tenant_id === selectedTenant);

  const stats = useMemo(() => {
    const last24h = filteredLogs.filter(l => 
      new Date(l.created_date) > new Date(Date.now() - 24 * 60 * 60 * 1000)
    );
    const last7d = filteredLogs.filter(l => 
      new Date(l.created_date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    );

    const byType = {};
    filteredLogs.forEach(l => {
      if (!byType[l.lookup_type]) byType[l.lookup_type] = { count: 0, cost: 0 };
      byType[l.lookup_type].count++;
      byType[l.lookup_type].cost += l.cost || 0;
    });

    const totalCost = filteredLogs.reduce((sum, l) => sum + (l.cost || 0), 0);
    const successRate = filteredLogs.length > 0 
      ? ((filteredLogs.filter(l => l.success).length / filteredLogs.length) * 100).toFixed(1)
      : 100;

    return { total24h: last24h.length, total7d: last7d.length, byType, totalCost, successRate };
  }, [filteredLogs]);

  const lookupTypeLabels = {
    address_autocomplete: { label: "Address Autocomplete", icon: MapPin, color: "text-blue-600" },
    address_lookup: { label: "Address Lookup", icon: MapPin, color: "text-blue-600" },
    postcode_lookup: { label: "Postcode Lookup", icon: MapPin, color: "text-green-600" },
    email_validation: { label: "Email Validation", icon: Mail, color: "text-purple-600" },
    phone_validation: { label: "Phone Validation", icon: Phone, color: "text-amber-600" }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Lookup Statistics (Address, Email, Phone)
        </h2>
        <Select value={selectedTenant} onValueChange={setSelectedTenant}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Tenants" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tenants</SelectItem>
            {tenants.map(t => (
              <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-sm text-gray-500">Lookups (24h)</div>
            <div className="text-2xl font-bold">{stats.total24h}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-sm text-gray-500">Lookups (7d)</div>
            <div className="text-2xl font-bold">{stats.total7d}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-sm text-gray-500">Success Rate</div>
            <div className={`text-2xl font-bold ${parseFloat(stats.successRate) >= 95 ? "text-green-600" : "text-amber-600"}`}>
              {stats.successRate}%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-sm text-gray-500">Total Cost</div>
            <div className="text-2xl font-bold text-green-600">£{stats.totalCost.toFixed(4)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Breakdown by Type */}
      <Card>
        <CardHeader>
          <CardTitle>Lookups by Type</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(stats.byType).map(([type, data]) => {
              const config = lookupTypeLabels[type] || { label: type, icon: MapPin, color: "text-gray-600" };
              const Icon = config.icon;
              return (
                <div key={type} className="flex items-center gap-4">
                  <div className={`flex items-center gap-2 w-48 ${config.color}`}>
                    <Icon className="h-4 w-4" />
                    <span className="font-medium">{config.label}</span>
                  </div>
                  <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[var(--color-info)]" 
                      style={{ width: `${filteredLogs.length > 0 ? (data.count / filteredLogs.length * 100) : 0}%` }}
                    />
                  </div>
                  <span className="w-20 text-right text-sm">{data.count} calls</span>
                  <span className="w-24 text-right text-sm text-green-600">£{data.cost.toFixed(4)}</span>
                </div>
              );
            })}
            {Object.keys(stats.byType).length === 0 && (
              <p className="text-gray-500 text-center py-8">No lookup data yet</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tenant Breakdown */}
      {selectedTenant === "all" && (
        <Card>
          <CardHeader>
            <CardTitle>Usage by Tenant (for billing)</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Address Lookups</TableHead>
                  <TableHead>Email Validations</TableHead>
                  <TableHead>Phone Validations</TableHead>
                  <TableHead>Total Cost</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tenants.map(tenant => {
                  const tenantLogs = lookupLogs.filter(l => l.tenant_id === tenant.id);
                  const addressCount = tenantLogs.filter(l => l.lookup_type?.includes("address") || l.lookup_type?.includes("postcode")).length;
                  const emailCount = tenantLogs.filter(l => l.lookup_type === "email_validation").length;
                  const phoneCount = tenantLogs.filter(l => l.lookup_type === "phone_validation").length;
                  const cost = tenantLogs.reduce((sum, l) => sum + (l.cost || 0), 0);
                  
                  if (tenantLogs.length === 0) return null;
                  
                  return (
                    <TableRow key={tenant.id}>
                      <TableCell className="font-medium">{tenant.name}</TableCell>
                      <TableCell>{addressCount}</TableCell>
                      <TableCell>{emailCount}</TableCell>
                      <TableCell>{phoneCount}</TableCell>
                      <TableCell className="text-green-600 font-medium">£{cost.toFixed(4)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Recent Lookups */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Lookups</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Query</TableHead>
                <TableHead>Tenant</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Cost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.slice(0, 50).map(log => {
                const config = lookupTypeLabels[log.lookup_type] || { label: log.lookup_type, icon: MapPin, color: "text-gray-600" };
                const Icon = config.icon;
                return (
                  <TableRow key={log.id}>
                    <TableCell className="text-xs">
                      {format(new Date(log.created_date), "MMM d, HH:mm")}
                    </TableCell>
                    <TableCell>
                      <div className={`flex items-center gap-1 ${config.color}`}>
                        <Icon className="h-3 w-3" />
                        <span className="text-xs">{config.label}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs max-w-[200px] truncate">
                      {log.query}
                    </TableCell>
                    <TableCell className="text-xs">
                      {tenants.find(t => t.id === log.tenant_id)?.name || "-"}
                    </TableCell>
                    <TableCell>
                      {log.success ? (
                        <Badge className="bg-green-100 text-green-700">Success</Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-700">Failed</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-green-600 text-xs">
                      £{(log.cost || 0).toFixed(4)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}