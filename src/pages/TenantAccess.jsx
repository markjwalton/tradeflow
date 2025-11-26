import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, CheckCircle, Clock, XCircle, Search, Building2 } from "lucide-react";
import { toast } from "sonner";

export default function TenantAccess() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTenant, setSelectedTenant] = useState(null);
  
  const urlParams = new URLSearchParams(window.location.search);
  const tenantSlug = urlParams.get("tenant");

  useEffect(() => {
    let mounted = true;
    base44.auth.me()
      .then(u => { if (mounted) setUser(u); })
      .catch(() => { if (mounted) setUser(null); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  // Fetch all active tenants for browsing
  const { data: allTenants = [], isLoading: loadingAllTenants } = useQuery({
    queryKey: ["allTenants"],
    queryFn: () => base44.entities.Tenant.filter({ is_active: true }),
    enabled: !loading && !!user,
    retry: false,
  });

  // Find tenant by slug if provided in URL
  const { data: tenantsBySlug = [], isLoading: loadingTenant } = useQuery({
    queryKey: ["tenantBySlug", tenantSlug],
    queryFn: () => base44.entities.Tenant.filter({ slug: tenantSlug }),
    enabled: !!tenantSlug && !loading,
    retry: false,
  });

  // Use URL tenant, or selected tenant from search
  const tenant = tenantSlug ? tenantsBySlug[0] : selectedTenant;

  // Filter tenants by search query
  const filteredTenants = allTenants.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Check if user already has access
  const { data: userRoles = [], isLoading: loadingRoles } = useQuery({
    queryKey: ["myTenantRoles", tenant?.id, user?.id],
    queryFn: () => base44.entities.TenantUserRole.filter({ 
      tenant_id: tenant?.id, 
      user_id: user?.id 
    }),
    enabled: !!tenant?.id && !!user?.id,
    retry: false,
  });

  // Check if user has pending request
  const { data: existingRequests = [], isLoading: loadingRequests } = useQuery({
    queryKey: ["myAccessRequest", tenant?.id, user?.id],
    queryFn: () => base44.entities.AccessRequest.filter({ 
      tenant_id: tenant?.id, 
      user_id: user?.id 
    }),
    enabled: !!tenant?.id && !!user?.id,
    retry: false,
  });

  const existingRequest = existingRequests[0];
  const hasAccess = userRoles.length > 0;

  const requestMutation = useMutation({
    mutationFn: () => base44.entities.AccessRequest.create({
      tenant_id: tenant.id,
      user_id: user.id,
      user_email: user.email,
      user_name: user.full_name,
      status: "pending"
    }),
    onSuccess: () => {
      toast.success("Access request submitted");
      window.location.reload();
    },
  });

  if (loading || loadingTenant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  // Show tenant browser if no slug provided or tenant not found
  if (!tenantSlug && !selectedTenant) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="max-w-lg w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Find Your Organization
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!user ? (
              <>
                <p className="text-gray-600">Sign in to browse and request access to organizations.</p>
                <Button className="w-full" onClick={() => base44.auth.redirectToLogin()}>
                  Sign In
                </Button>
              </>
            ) : (
              <>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by name or ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                {loadingAllTenants ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                  </div>
                ) : filteredTenants.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">
                    {searchQuery ? "No organizations found" : "No organizations available"}
                  </p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {filteredTenants.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setSelectedTenant(t)}
                        className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                      >
                        <div className="font-medium">{t.name}</div>
                        <div className="text-sm text-gray-500">{t.slug}</div>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Sign In Required</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">Please sign in to request access to this organization.</p>
            <Button 
              className="w-full" 
              onClick={() => base44.auth.redirectToLogin()}
            >
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <p className="text-gray-500">Organization not found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loadingRoles || loadingRequests) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center space-y-4">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
            <div>
              <h2 className="text-xl font-semibold">You have access!</h2>
              <p className="text-gray-500">You can now use {tenant.name}</p>
            </div>
            <Button onClick={() => window.location.href = `/?tenant=${tenantSlug}`}>
              Continue to App
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (existingRequest) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center space-y-4">
            {existingRequest.status === "pending" && (
              <>
                <Clock className="h-12 w-12 text-amber-500 mx-auto" />
                <div>
                  <h2 className="text-xl font-semibold">Request Pending</h2>
                  <p className="text-gray-500">Your request to join {tenant.name} is awaiting approval.</p>
                </div>
              </>
            )}
            {existingRequest.status === "denied" && (
              <>
                <XCircle className="h-12 w-12 text-red-500 mx-auto" />
                <div>
                  <h2 className="text-xl font-semibold">Request Denied</h2>
                  <p className="text-gray-500">Your request to join {tenant.name} was not approved.</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>Request Access</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            You're requesting access to <strong>{tenant.name}</strong>.
          </p>
          <div className="bg-gray-50 p-3 rounded-lg text-sm">
            <div><strong>Name:</strong> {user.full_name}</div>
            <div><strong>Email:</strong> {user.email}</div>
          </div>
          <Button 
            className="w-full" 
            onClick={() => requestMutation.mutate()}
            disabled={requestMutation.isPending}
          >
            {requestMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Request Access
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}