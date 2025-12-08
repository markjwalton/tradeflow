import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Package, 
  Copy, 
  Check, 
  ChevronDown, 
  ChevronRight,
  Building2,
  Users,
  Navigation,
  Shield,
  FileJson,
  FileCode,
  Layout as LayoutIcon
} from "lucide-react";
import { toast } from "sonner";

const multiTenantPackage = {
  name: "Multi-Tenant Architecture",
  version: "1.0.0",
  description: "Complete multi-tenant system with global admin, tenant admin, and user roles. Includes self-registration, access requests, role management, and per-tenant navigation.",
  icon: Building2,
  features: [
    "Global Admin Console",
    "Tenant Management",
    "Role-Based Access Control",
    "Self-Registration with Company ID",
    "Access Request Workflow",
    "Per-Tenant Navigation Configuration",
    "Hierarchical Navigation (up to 3 levels)"
  ],
  setup: [
    "Copy all entity files to your entities/ folder",
    "Copy all component files to your components/ folder",
    "Copy all page files to your pages/ folder",
    "Copy Layout.jsx to your Layout.js",
    "Navigate to /Setup to initialize your global admin account",
    "Create your first tenant in Tenant Manager",
    "Share Company ID with users for self-registration"
  ],
  entities: [
    { name: "Tenant", file: "entities/Tenant.json", description: "Organization/company records" },
    { name: "TenantRole", file: "entities/TenantRole.json", description: "Roles available per tenant" },
    { name: "TenantUserRole", file: "entities/TenantUserRole.json", description: "User-role assignments per tenant" },
    { name: "AccessRequest", file: "entities/AccessRequest.json", description: "Pending user access requests" },
    { name: "NavigationItem", file: "entities/NavigationItem.json", description: "Per-tenant navigation structure" },
  ],
  components: [
    { name: "TenantForm", file: "components/tenants/TenantForm.jsx", description: "Add/edit tenant dialog" },
    { name: "TenantRoleManager", file: "components/tenants/TenantRoleManager.jsx", description: "Manage tenant roles" },
    { name: "TenantUserManager", file: "components/tenants/TenantUserManager.jsx", description: "Assign users to tenants" },
    { name: "TenantAccessRequests", file: "components/tenants/TenantAccessRequests.jsx", description: "Approve/deny access requests" },
    { name: "NavigationItemForm", file: "components/navigation/NavigationItemForm.jsx", description: "Add/edit nav items" },
    { name: "NavigationItemRow", file: "components/navigation/NavigationItemRow.jsx", description: "Draggable nav item row" },
    { name: "TenantSelector", file: "components/navigation/TenantSelector.jsx", description: "Tenant dropdown selector" },
  ],
  pages: [
    { name: "Setup", file: "pages/Setup.jsx", description: "Initial global admin setup" },
    { name: "TenantAccess", file: "pages/TenantAccess.jsx", description: "User registration & login" },
    { name: "TenantManager", file: "pages/TenantManager.jsx", description: "Global admin tenant management" },
    { name: "NavigationManager", file: "pages/NavigationManager.jsx", description: "Navigation configuration" },
    { name: "Home", file: "pages/Home.jsx", description: "Tenant portal home page" },
  ],
  layout: { name: "Layout", file: "Layout.jsx", description: "Main app layout with access control" }
};

function FileItem({ name, file, description, onCopy }) {
  const [copied, setCopied] = useState(false);
  
  const getIcon = () => {
    if (file.endsWith('.json')) return FileJson;
    if (file.includes('Layout')) return LayoutIcon;
    return FileCode;
  };
  
  const Icon = getIcon();
  
  const handleCopy = () => {
    onCopy(file);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <div className="flex items-center justify-between p-3 bg-[var(--color-background)] rounded-lg hover:bg-[var(--color-background-muted)] transition-colors">
      <div className="flex items-center gap-3">
        <Icon className="h-4 w-4 text-[var(--color-charcoal)]" />
        <div>
          <p className="font-medium text-sm text-[var(--color-midnight)]">{name}</p>
          <p className="text-xs text-[var(--color-charcoal)]">{file}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-[var(--color-charcoal)] hidden md:block">{description}</span>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleCopy}
          className="gap-1"
        >
          {copied ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
          {copied ? "Copied" : "Copy Path"}
        </Button>
      </div>
    </div>
  );
}

function PackageCard({ pkg }) {
  const [expanded, setExpanded] = useState(true);
  const Icon = pkg.icon;
  
  const handleCopyPath = (path) => {
    navigator.clipboard.writeText(path);
    toast.success(`Copied: ${path}`);
  };
  
  const handleCopyAllPaths = () => {
    const allFiles = [
      ...pkg.entities.map(e => e.file),
      ...pkg.components.map(c => c.file),
      ...pkg.pages.map(p => p.file),
      pkg.layout.file
    ];
    navigator.clipboard.writeText(allFiles.join('\n'));
    toast.success("All file paths copied!");
  };

  return (
    <Card className="mb-6 border-[var(--color-background-muted)] bg-[var(--color-background-paper)]">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[var(--color-background)] rounded-lg">
              <Icon className="h-6 w-6 text-[var(--color-midnight)]" />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2 text-[var(--color-midnight)]">
                {pkg.name}
                <Badge variant="secondary">v{pkg.version}</Badge>
              </CardTitle>
              <CardDescription className="mt-1">{pkg.description}</CardDescription>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleCopyAllPaths}>
            <Copy className="h-4 w-4 mr-2" />
            Copy All Paths
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="files" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="files">Files</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="setup">Setup Guide</TabsTrigger>
          </TabsList>
          
          <TabsContent value="files" className="space-y-6">
            {/* Entities */}
            <div>
              <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <FileJson className="h-4 w-4" /> Entities
              </h3>
              <div className="space-y-2">
                {pkg.entities.map(entity => (
                  <FileItem key={entity.file} {...entity} onCopy={handleCopyPath} />
                ))}
              </div>
            </div>
            
            {/* Components */}
            <div>
              <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <FileCode className="h-4 w-4" /> Components
              </h3>
              <div className="space-y-2">
                {pkg.components.map(component => (
                  <FileItem key={component.file} {...component} onCopy={handleCopyPath} />
                ))}
              </div>
            </div>
            
            {/* Pages */}
            <div>
              <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <FileCode className="h-4 w-4" /> Pages
              </h3>
              <div className="space-y-2">
                {pkg.pages.map(page => (
                  <FileItem key={page.file} {...page} onCopy={handleCopyPath} />
                ))}
              </div>
            </div>
            
            {/* Layout */}
            <div>
              <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <LayoutIcon className="h-4 w-4" /> Layout
              </h3>
              <div className="space-y-2">
                <FileItem {...pkg.layout} onCopy={handleCopyPath} />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="features">
            <div className="grid gap-2">
              {pkg.features.map((feature, i) => (
                <div key={i} className="flex items-center gap-2 p-2 bg-success-50 rounded-lg">
                  <Check className="h-4 w-4 text-success" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="setup">
            <ol className="space-y-3">
              {pkg.setup.map((step, i) => (
                <li key={i} className="flex gap-3 p-3 bg-info-50 rounded-lg">
                  <span className="flex-shrink-0 w-6 h-6 bg-info text-info-foreground rounded-full flex items-center justify-center text-sm font-medium">
                    {i + 1}
                  </span>
                  <span className="text-sm">{step}</span>
                </li>
              ))}
            </ol>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export default function PackageLibrary() {
  return (
    <div className="min-h-screen bg-[var(--color-background)] p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-light font-display flex items-center gap-3 text-[var(--color-midnight)]">
            <Package className="h-8 w-8" />
            Package Library
          </h1>
          <p className="text-[var(--color-charcoal)] mt-2">
            Reusable architecture components for building Base44 applications
          </p>
        </div>
        
        <PackageCard pkg={multiTenantPackage} />
        
        {/* Placeholder for future packages */}
        <Card className="border-dashed border-[var(--color-background-muted)] bg-[var(--color-background-paper)]">
          <CardContent className="py-12 text-center text-[var(--color-charcoal)]">
            <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>More architecture packages coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}