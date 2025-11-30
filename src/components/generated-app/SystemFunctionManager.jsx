import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Settings, Navigation, Shield, Database, Plug, ChevronRight } from "lucide-react";

const categoryIcons = {
  Navigation: Navigation,
  Settings: Settings,
  Security: Shield,
  Data: Database,
  Integration: Plug,
  Other: Settings
};

// Core system functions that can be included in generated apps
const coreSystemFunctions = [
  {
    id: "navigation-manager",
    name: "Navigation Manager",
    description: "Configure app navigation menu structure and settings",
    category: "Navigation",
    is_core: true,
    admin_only: true,
    required_entities: ["NavigationConfig"],
    config: {
      auto_generate: true,
      editable: true
    }
  },
  {
    id: "user-settings",
    name: "User Settings",
    description: "Allow users to configure their preferences",
    category: "Settings",
    is_core: false,
    admin_only: false,
    required_entities: [],
    config: {
      theme: true,
      notifications: true,
      language: false
    }
  },
  {
    id: "role-management",
    name: "Role Management",
    description: "Manage user roles and permissions",
    category: "Security",
    is_core: false,
    admin_only: true,
    required_entities: ["UserRole"],
    config: {
      custom_roles: true,
      permissions: true
    }
  },
  {
    id: "data-export",
    name: "Data Export",
    description: "Export entity data to CSV/JSON",
    category: "Data",
    is_core: false,
    admin_only: true,
    required_entities: [],
    config: {
      formats: ["csv", "json"],
      scheduled: false
    }
  },
  {
    id: "audit-log",
    name: "Audit Log",
    description: "Track changes to records",
    category: "Security",
    is_core: false,
    admin_only: true,
    required_entities: ["AuditLog"],
    config: {
      retention_days: 90
    }
  }
];

export default function SystemFunctionManager({ 
  selectedFunctions = [],
  onUpdate 
}) {
  const [functions, setFunctions] = useState(() => {
    // Initialize with core functions enabled by default
    return coreSystemFunctions.map(fn => ({
      ...fn,
      enabled: fn.is_core || selectedFunctions.includes(fn.id)
    }));
  });

  const toggleFunction = (id) => {
    const updated = functions.map(fn => 
      fn.id === id ? { ...fn, enabled: !fn.enabled } : fn
    );
    setFunctions(updated);
    onUpdate(updated.filter(fn => fn.enabled).map(fn => fn.id));
  };

  const groupedFunctions = functions.reduce((acc, fn) => {
    if (!acc[fn.category]) acc[fn.category] = [];
    acc[fn.category].push(fn);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">System Functions</h3>
          <p className="text-sm text-gray-500">Configure admin features for your app</p>
        </div>
        <Badge variant="outline">
          {functions.filter(f => f.enabled).length} enabled
        </Badge>
      </div>

      <ScrollArea className="h-80">
        <div className="space-y-4">
          {Object.entries(groupedFunctions).map(([category, fns]) => {
            const Icon = categoryIcons[category] || Settings;
            return (
              <div key={category}>
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">{category}</span>
                </div>
                <div className="space-y-2 ml-6">
                  {fns.map(fn => (
                    <Card key={fn.id} className={fn.enabled ? "border-blue-200 bg-blue-50" : ""}>
                      <CardContent className="py-3 px-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">{fn.name}</span>
                              {fn.is_core && (
                                <Badge className="bg-green-100 text-green-700 text-xs">Core</Badge>
                              )}
                              {fn.admin_only && (
                                <Badge variant="outline" className="text-xs">Admin</Badge>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">{fn.description}</p>
                            {fn.required_entities.length > 0 && (
                              <div className="flex items-center gap-1 mt-1">
                                <Database className="h-3 w-3 text-gray-400" />
                                <span className="text-xs text-gray-400">
                                  Requires: {fn.required_entities.join(", ")}
                                </span>
                              </div>
                            )}
                          </div>
                          <Switch
                            checked={fn.enabled}
                            onCheckedChange={() => toggleFunction(fn.id)}
                            disabled={fn.is_core}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}