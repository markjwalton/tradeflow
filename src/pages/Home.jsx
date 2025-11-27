import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { useTenant } from "@/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Home as HomeIcon, FileText, Settings, Users, BarChart3, Folder, ChevronRight } from "lucide-react";

// Icon mapping
const iconMap = {
  Home: HomeIcon,
  FileText: FileText,
  Settings: Settings,
  Users: Users,
  BarChart3: BarChart3,
  Folder: Folder,
};

export default function Home() {
  const { tenant, tenantId, tenantSlug } = useTenant() || {};

  // Fetch navigation items for current tenant
  const { data: navItems = [], isLoading } = useQuery({
    queryKey: ["tenantNav", tenantId],
    queryFn: () => base44.entities.NavigationItem.filter({ tenant_id: tenantId, is_visible: true }, "order"),
    enabled: !!tenantId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  // Build hierarchy
  const topLevel = navItems.filter(i => !i.parent_id).sort((a, b) => (a.order || 0) - (b.order || 0));
  const getChildren = (parentId) => navItems.filter(i => i.parent_id === parentId).sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Welcome to {tenant?.name || "Your Portal"}</h1>
        <p className="text-gray-600 mb-8">Select a section to get started</p>
        
        {navItems.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-gray-500">
              No navigation items configured for this tenant yet.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {topLevel.map((item) => {
              const Icon = iconMap[item.icon] || Folder;
              const children = getChildren(item.id);
              const isFolder = item.item_type === "folder";
              const pageUrl = item.page_url 
                ? createPageUrl(item.page_url) + `?tenant=${tenantSlug}`
                : null;

              return (
                <Card key={item.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Icon className="h-5 w-5 text-slate-600" />
                      {item.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isFolder && children.length > 0 ? (
                      <ul className="space-y-2">
                        {children.map(child => {
                          const ChildIcon = iconMap[child.icon] || FileText;
                          const childUrl = child.page_url 
                            ? createPageUrl(child.page_url) + `?tenant=${tenantSlug}`
                            : "#";
                          return (
                            <li key={child.id}>
                              <Link 
                                to={childUrl}
                                className="flex items-center gap-2 text-sm text-gray-600 hover:text-slate-900 py-1"
                              >
                                <ChevronRight className="h-4 w-4" />
                                <ChildIcon className="h-4 w-4" />
                                {child.name}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    ) : pageUrl ? (
                      <Link 
                        to={pageUrl}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Open →
                      </Link>
                    ) : (
                      <span className="text-sm text-gray-400">No content</span>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}