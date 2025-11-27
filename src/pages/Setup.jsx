import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Shield, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { createPageUrl } from "@/utils";

export default function Setup() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    base44.auth.me()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const handleMakeGlobalAdmin = async () => {
    setSaving(true);
    try {
      await base44.auth.updateMe({ is_global_admin: true });
      toast.success("You are now a Global Admin!");
      // Redirect to Tenant Manager
      setTimeout(() => {
        window.location.href = createPageUrl("TenantManager");
      }, 1000);
    } catch (e) {
      toast.error("Failed to update: " + e.message);
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Setup Required</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">Please sign in to set up the application.</p>
            <Button className="w-full" onClick={() => base44.auth.redirectToLogin()}>
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (user.is_global_admin === true) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center space-y-4">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
            <div>
              <h2 className="text-xl font-semibold">Already a Global Admin</h2>
              <p className="text-gray-500">You already have global admin access.</p>
            </div>
            <Button onClick={() => window.location.href = createPageUrl("TenantManager")}>
              Go to Tenant Manager
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Initial Setup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            Welcome <strong>{user.email}</strong>! Set yourself as the Global Admin to manage all tenants and navigation.
          </p>
          
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
            <strong>Note:</strong> Only do this if you are the application owner. Global admins have full access to all tenants.
          </div>

          <Button 
            className="w-full" 
            onClick={handleMakeGlobalAdmin}
            disabled={saving}
          >
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Make Me Global Admin
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}