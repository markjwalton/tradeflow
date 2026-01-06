import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Package, Loader2, Plus, Palette, Type, Maximize, Layers, 
  Eye, Download, GitBranch, Search
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";

export default function DesignSystemPackages() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = React.useState("");

  const { data: packages = [], isLoading } = useQuery({
    queryKey: ["designSystemPackages"],
    queryFn: () => base44.entities.DesignSystemPackage.list()
  });

  const statusColors = {
    draft: "bg-muted text-muted-foreground",
    published: "bg-green-100 text-green-800",
    deprecated: "bg-yellow-100 text-yellow-800"
  };

  const filteredPackages = packages.filter(pkg =>
    pkg.package_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pkg.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search packages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={() => navigate(createPageUrl("DesignSystemManager"))}>
          <Plus className="h-4 w-4 mr-2" />
          New Package
        </Button>
      </div>

      {filteredPackages.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No design system packages found</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => navigate(createPageUrl("DesignSystemManager"))}
            >
              Create Your First Package
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredPackages.map((pkg) => (
            <Card 
              key={pkg.id} 
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(createPageUrl("PackageDetail") + `?id=${pkg.id}`)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-muted rounded-lg">
                      <Palette className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {pkg.package_name}
                        <Badge className={statusColors[pkg.status]}>
                          {pkg.status}
                        </Badge>
                        <Badge variant="outline">v{pkg.version}</Badge>
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {pkg.description || "No description"}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link to={createPageUrl("PackageExport") + `?id=${pkg.id}`} onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link to={createPageUrl("TokenPreview") + `?id=${pkg.id}`} onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Package className="h-3 w-3" />
                    <code className="text-xs">{pkg.package_code}</code>
                    <span>•</span>
                    <span className="capitalize">{pkg.package_type?.replace("_", " ")}</span>
                    {pkg.parent_package_id && (
                      <>
                        <span>•</span>
                        <GitBranch className="h-3 w-3" />
                        <span>Based on parent</span>
                      </>
                    )}
                  </div>

                  <div className="grid grid-cols-4 gap-3">
                    <div className="p-2 bg-muted rounded text-center">
                      <Palette className="h-4 w-4 mx-auto mb-1 text-primary" />
                      <p className="text-xs font-medium">{Object.keys(pkg.design_tokens?.colors || {}).length}</p>
                      <p className="text-xs text-muted-foreground">Colors</p>
                    </div>
                    <div className="p-2 bg-muted rounded text-center">
                      <Type className="h-4 w-4 mx-auto mb-1 text-primary" />
                      <p className="text-xs font-medium">{Object.keys(pkg.design_tokens?.typography || {}).length}</p>
                      <p className="text-xs text-muted-foreground">Typography</p>
                    </div>
                    <div className="p-2 bg-muted rounded text-center">
                      <Maximize className="h-4 w-4 mx-auto mb-1 text-primary" />
                      <p className="text-xs font-medium">{Object.keys(pkg.design_tokens?.spacing || {}).length}</p>
                      <p className="text-xs text-muted-foreground">Spacing</p>
                    </div>
                    <div className="p-2 bg-muted rounded text-center">
                      <Layers className="h-4 w-4 mx-auto mb-1 text-primary" />
                      <p className="text-xs font-medium">{Object.keys(pkg.design_tokens?.effects || {}).length}</p>
                      <p className="text-xs text-muted-foreground">Effects</p>
                    </div>
                  </div>

                  {pkg.customer_company && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="font-medium">Customer:</span>
                      <span>{pkg.customer_company}</span>
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground">
                    Created {pkg.created_date ? format(new Date(pkg.created_date), "PPP") : "Unknown"}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}