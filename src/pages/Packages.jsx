import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Palette, Package } from "lucide-react";
import { PageHeader } from "@/components/sturij";
import ArchitecturalPackages from "@/components/packages/ArchitecturalPackages";
import DesignSystemPackages from "@/components/packages/DesignSystemPackages";

export default function Packages() {
  const [activeTab, setActiveTab] = useState("architectural");

  return (
    <div className="max-w-7xl mx-auto -mt-6 min-h-screen">
      <PageHeader 
        title="Package Library"
        description="Reusable architectural components and design system packages"
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="architectural" className="gap-2">
            <Building2 className="h-4 w-4" />
            Architectural Packages
          </TabsTrigger>
          <TabsTrigger value="design" className="gap-2">
            <Palette className="h-4 w-4" />
            Design System Packages
          </TabsTrigger>
        </TabsList>

        <TabsContent value="architectural">
          <ArchitecturalPackages />
        </TabsContent>

        <TabsContent value="design">
          <DesignSystemPackages />
        </TabsContent>
      </Tabs>
    </div>
  );
}