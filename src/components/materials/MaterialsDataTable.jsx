import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, AlertCircle, CheckCircle2 } from "lucide-react";

// Expected color codes from EGGER_COLORS
const EXPECTED_COLORS = [
  { code: "W990", name: "Crystal White" },
  { code: "W908", name: "Platinum White" },
  { code: "W1000", name: "Premium White" },
  { code: "W1100", name: "Alpine White" },
  { code: "U104", name: "Cashmere Grey" },
  { code: "U702", name: "Light Grey" },
  { code: "U717", name: "Stone Grey" },
  { code: "U727", name: "Pebble Grey" },
  { code: "U732", name: "Dust Grey" },
  { code: "U741", name: "Lava Grey" },
  { code: "U775", name: "Dakar Grey" },
  { code: "U780", name: "Monument Grey" },
  { code: "U899", name: "Graphite Grey" },
  { code: "U961", name: "Anthracite" },
  { code: "U999", name: "Black" },
  { code: "H1145", name: "Bardolino Oak" },
  { code: "H1176", name: "Halifax Oak" },
  { code: "H3309", name: "Vicenza Oak" },
  { code: "F121", name: "Sand Beige" },
];

export default function MaterialsDataTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSupplier, setFilterSupplier] = useState("all");

  const { data: materials = [], isLoading } = useQuery({
    queryKey: ["materials"],
    queryFn: () => base44.entities.Material.list(),
  });

  // Find uploaded codes
  const uploadedCodes = new Set(materials.map(m => m.code?.toUpperCase()));
  
  // Find missing colors
  const missingColors = EXPECTED_COLORS.filter(
    color => !uploadedCodes.has(color.code.toUpperCase())
  );

  // Get unique suppliers
  const suppliers = [...new Set(materials.map(m => m.supplier_folder))].filter(Boolean);

  // Filter materials
  const filteredMaterials = materials.filter(m => {
    const matchesSearch = !searchTerm || 
      m.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSupplier = filterSupplier === "all" || m.supplier_folder === filterSupplier;
    return matchesSearch && matchesSupplier;
  });

  if (isLoading) {
    return <div className="p-6">Loading materials...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Missing Colors Alert */}
      {missingColors.length > 0 && (
        <Card className="p-6 border-orange-200 bg-orange-50">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-orange-900 mb-2">
                Missing {missingColors.length} Color{missingColors.length !== 1 ? 's' : ''}
              </h3>
              <div className="flex flex-wrap gap-2">
                {missingColors.map((color) => (
                  <Badge key={color.code} variant="outline" className="bg-white">
                    {color.code} - {color.name}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search by code or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterSupplier} onValueChange={setFilterSupplier}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All Suppliers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Suppliers</SelectItem>
            {suppliers.map((supplier) => (
              <SelectItem key={supplier} value={supplier}>
                {supplier}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="text-sm text-gray-500">Total Materials</div>
          <div className="text-2xl font-semibold">{materials.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-500">Uploaded Codes</div>
          <div className="text-2xl font-semibold text-green-600">{uploadedCodes.size}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-500">Missing Codes</div>
          <div className="text-2xl font-semibold text-orange-600">{missingColors.length}</div>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Image
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Code
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Surface
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Supplier
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMaterials.map((material) => (
                <tr key={material.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    {material.image_url ? (
                      <img 
                        src={material.image_url} 
                        alt={material.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs">
                        No image
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium">{material.code || '-'}</td>
                  <td className="px-4 py-3">{material.name || '-'}</td>
                  <td className="px-4 py-3">
                    {material.surface_type ? (
                      <Badge variant="outline">{material.surface_type}</Badge>
                    ) : '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {material.supplier_folder || '-'}
                  </td>
                  <td className="px-4 py-3">
                    {material.is_active ? (
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-gray-500">
                        Inactive
                      </Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredMaterials.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No materials found
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}