import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/sturij/PageHeader";
import MaterialsDataTable from "@/components/materials/MaterialsDataTable";
import MaterialsBatchUpload from "@/components/materials/MaterialsBatchUpload";
import EggerDataImporter from "@/components/materials/EggerDataImporter";
import CategorySupplierManager from "@/components/materials/CategorySupplierManager";

export default function MaterialsManager() {
  return (
    <div className="min-h-screen bg-[var(--color-background)] p-6">
      <div className="max-w-7xl mx-auto">
        <PageHeader 
          title="Materials Manager"
          description="Import, manage and organize material swatches and data"
        />

        <Tabs defaultValue="data" className="mt-6">
          <TabsList>
            <TabsTrigger value="data">Materials Data</TabsTrigger>
            <TabsTrigger value="categories">Categories & Suppliers</TabsTrigger>
            <TabsTrigger value="egger">Egger Import</TabsTrigger>
            <TabsTrigger value="batch">Batch Upload</TabsTrigger>
          </TabsList>

          <TabsContent value="data" className="mt-6">
            <MaterialsDataTable />
          </TabsContent>

          <TabsContent value="categories" className="mt-6">
            <CategorySupplierManager />
          </TabsContent>

          <TabsContent value="egger" className="mt-6">
            <EggerDataImporter />
          </TabsContent>

          <TabsContent value="batch" className="mt-6">
            <MaterialsBatchUpload />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}