import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Navigation, Building2, Settings } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">App Architecture Planner</h1>
        <p className="text-gray-600 mb-8">Multi-tenant navigation management system</p>
        
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Navigation className="h-5 w-5" />
                Navigation Manager
              </CardTitle>
              <CardDescription>
                Manage navigation items for global templates and tenants
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to={createPageUrl("NavigationManager")}>
                <Button className="w-full">Open Navigation Manager</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Tenants
              </CardTitle>
              <CardDescription>
                Manage tenants/organizations in the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" disabled>
                Coming in Sprint 2
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}