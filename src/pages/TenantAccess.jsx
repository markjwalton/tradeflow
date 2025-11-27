import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle, Clock, Building2 } from "lucide-react";
import { toast } from "sonner";
import { createPageUrl } from "@/utils";

export default function TenantAccess() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [companyIdInput, setCompanyIdInput] = useState("");
  const [lookupLoading, setLookupLoading] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [manualName, setManualName] = useState("");
  const [manualEmail, setManualEmail] = useState("");
  const [requestSubmitted, setRequestSubmitted] = useState(false);
  
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

  // Find tenant by slug if provided in URL
  const { data: tenantsBySlug = [], isLoading: loadingTenant } = useQuery({
    queryKey: ["tenantBySlug", tenantSlug],
    queryFn: () => base44.entities.Tenant.filter({ slug: tenantSlug }),
    enabled: !!tenantSlug && !loading,
    retry: false,
  });

  // Use URL tenant, or selected tenant from search
  const tenant = tenantSlug ? tenantsBySlug[0] : selectedTenant;

  // Check if user has ANY pending request (to show on initial screen)
  const { data: allPendingRequests = [], isLoading: loadingAllPending } = useQuery({
    queryKey: ["allMyPendingRequests", user?.id],
    queryFn: async () => {
      const requests = await base44.entities.AccessRequest.filter({ 
        user_id: user?.id,
        status: "pending"
      });
      // Fetch tenant names for each request
      const tenantIds = [...new Set(requests.map(r => r.tenant_id))];
      const tenants = await Promise.all(
        tenantIds.map(id => base44.entities.Tenant.filter({ id }))
      );
      const tenantMap = {};
      tenants.flat().forEach(t => { tenantMap[t.id] = t; });
      return requests.map(r => ({ ...r, tenant: tenantMap[r.tenant_id] }));
    },
    enabled: !loading && !!user?.id,
    retry: false,
  });

  // Check if user has access to ANY tenant (to redirect to main app)
  const { data: userTenantAccess = [], isLoading: loadingUserAccess } = useQuery({
    queryKey: ["userTenantAccess", user?.id],
    queryFn: async () => {
      const roles = await base44.entities.TenantUserRole.filter({ user_id: user?.id });
      if (roles.length === 0) return [];
      // Fetch tenant info
      const tenantIds = [...new Set(roles.map(r => r.tenant_id))];
      const tenants = await Promise.all(
        tenantIds.map(id => base44.entities.Tenant.filter({ id }))
      );
      const tenantMap = {};
      tenants.flat().forEach(t => { tenantMap[t.id] = t; });
      return roles.map(r => ({ ...r, tenant: tenantMap[r.tenant_id] }));
    },
    enabled: !loading && !!user?.id && !tenantSlug,
    retry: false,
  });

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

  // Check if user has pending request for selected tenant
  const { data: existingRequests = [], isLoading: loadingRequests } = useQuery({
    queryKey: ["myAccessRequest", tenant?.id, user?.id],
    queryFn: () => base44.entities.AccessRequest.filter({ 
      tenant_id: tenant?.id, 
      user_id: user?.id,
      status: "pending"
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
      user_email: manualEmail.trim(),
      user_name: manualName.trim(),
      status: "pending"
    }),
    onSuccess: () => {
      toast.success("Access request submitted");
      setRequestSubmitted(true);
    },
  });

  if (loading || loadingTenant || loadingAllPending || loadingUserAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  // If user has access to a tenant, redirect to main app
  if (user && !tenantSlug && !selectedTenant && userTenantAccess.length > 0) {
    const firstTenant = userTenantAccess[0].tenant;
    if (firstTenant?.slug) {
      window.location.href = `/?tenant=${firstTenant.slug}`;
      return null;
    }
  }

  // Lookup tenant by company ID
  const handleCompanyIdLookup = async () => {
    if (!companyIdInput.trim()) return;
    setLookupLoading(true);
    const results = await base44.entities.Tenant.filter({ company_id: companyIdInput.trim().toUpperCase() });
    if (results.length > 0) {
      setSelectedTenant(results[0]);
    } else {
      toast.error("No organization found with that Company ID");
    }
    setLookupLoading(false);
  };

  // Show tenant lookup if no slug provided or tenant not found
  if (!tenantSlug && !selectedTenant) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="max-w-lg w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {user ? "Find Your Organization" : "Welcome"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Sign In option */}
            <div className="space-y-3">
              <p className="text-gray-600">
                {user 
                  ? `Signed in as ${user.email}` 
                  : "Already have an account? Sign in to access your organization."}
              </p>
              {user ? (
                <Button variant="outline" className="w-full" onClick={() => base44.auth.logout(createPageUrl("TenantAccess"))}>
                  Sign Out / Use Different Account
                </Button>
              ) : (
                <Button className="w-full" onClick={() => base44.auth.redirectToLogin(createPageUrl("TenantAccess"))}>
                  Sign In to My Account
                </Button>
              )}
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">
                  {user ? "Or find your organization" : "Or register for access"}
                </span>
              </div>
            </div>

            {/* Company ID lookup */}
            <div className="space-y-2">
              <Label>Enter your Company ID</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g. ABC123"
                  value={companyIdInput}
                  onChange={(e) => setCompanyIdInput(e.target.value.toUpperCase())}
                  className="font-mono"
                  maxLength={6}
                />
                <Button onClick={handleCompanyIdLookup} disabled={lookupLoading || !companyIdInput.trim()}>
                  {lookupLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Find"}
                </Button>
              </div>
              <p className="text-xs text-gray-500">Your administrator should have provided you with a 6-character Company ID</p>
            </div>

            {/* Show pending requests */}
            {user && allPendingRequests.length > 0 && (
              <>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500">Pending Requests</span>
                  </div>
                </div>
                <div className="space-y-2">
                  {allPendingRequests.map(req => (
                    <div key={req.id} className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <Clock className="h-5 w-5 text-amber-500 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{req.tenant?.name || "Unknown"}</p>
                        <p className="text-xs text-gray-500">Awaiting approval</p>
                      </div>
                    </div>
                  ))}
                </div>
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

  if (requestSubmitted || (existingRequest && existingRequest.status === "pending")) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center space-y-4">
            <Clock className="h-12 w-12 text-amber-500 mx-auto" />
            <div>
              <h2 className="text-xl font-semibold">Request Submitted</h2>
              <p className="text-gray-500">Your request to join {tenant.name} is awaiting approval.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleRequestAccess = () => {
    if (!manualName.trim() || !manualEmail.trim()) {
      toast.error("Please enter your name and email");
      return;
    }
    requestMutation.mutate();
  };

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
          
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="name">Your Name</Label>
              <Input
                id="name"
                placeholder="Enter your full name"
                value={manualName}
                onChange={(e) => setManualName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Your Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={manualEmail}
                onChange={(e) => setManualEmail(e.target.value)}
              />
            </div>
          </div>

          <Button 
            className="w-full" 
            onClick={handleRequestAccess}
            disabled={requestMutation.isPending || !manualName.trim() || !manualEmail.trim()}
          >
            {requestMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Request Access
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}