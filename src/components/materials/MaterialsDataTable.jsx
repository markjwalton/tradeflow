import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Search, AlertCircle, CheckCircle2, Pencil, Trash2, Upload, Download, Plus, FileUp, Settings, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

// Import the full EGGER_COLORS list from batch upload
import { EGGER_COLORS } from "./MaterialsBatchUpload";

const EXPECTED_COLORS = EGGER_COLORS;

const DEFAULT_COLUMNS = ["image", "code", "name", "surface_type", "supplier_folder", "is_active", "actions"];

export default function MaterialsDataTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterSupplier, setFilterSupplier] = useState("");
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [showAddDrawer, setShowAddDrawer] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(null);
  const [csvFile, setCsvFile] = useState(null);
  const [visibleColumns, setVisibleColumns] = useState(DEFAULT_COLUMNS);
  const [customFields, setCustomFields] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  
  const queryClient = useQueryClient();

  const { data: materialsData, isLoading } = useQuery({
    queryKey: ["materials", filterCategory, filterSupplier, page, pageSize],
    queryFn: async () => {
      if (!filterCategory && !filterSupplier) {
        return { items: [], total: 0 };
      }
      const filters = {};
      if (filterCategory) filters.category_id = filterCategory;
      if (filterSupplier) filters.supplier_id = filterSupplier;
      
      const allMaterials = await base44.entities.Material.filter(filters);
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      
      return {
        items: allMaterials.slice(startIndex, endIndex),
        total: allMaterials.length
      };
    },
    enabled: !!(filterCategory || filterSupplier),
  });
  
  const materials = materialsData?.items || [];
  const totalMaterials = materialsData?.total || 0;
  const totalPages = Math.ceil(totalMaterials / pageSize);

  const { data: categories = [] } = useQuery({
    queryKey: ["material-categories"],
    queryFn: () => base44.entities.MaterialCategory.list(),
  });

  const { data: suppliers = [] } = useQuery({
    queryKey: ["material-suppliers"],
    queryFn: () => base44.entities.MaterialSupplier.list(),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Material.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["materials"]);
      toast.success("Material updated");
      setEditingMaterial(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Material.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["materials"]);
      toast.success("Material deleted");
    },
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Material.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["materials"]);
      toast.success("Material created");
      setShowAddDrawer(false);
    },
  });

  // Get all unique fields from materials
  const allFields = React.useMemo(() => {
    const fields = new Set(["image", "code", "name", "surface_type", "supplier_folder", "is_active", "notes", "actions"]);
    materials.forEach(m => {
      Object.keys(m).forEach(key => {
        if (!["id", "created_date", "updated_date", "created_by", "image_url"].includes(key)) {
          fields.add(key);
        }
      });
    });
    return Array.from(fields);
  }, [materials]);

  const toggleColumn = (col) => {
    setVisibleColumns(prev => 
      prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col]
    );
  };

  // Handle image upload
  const handleImageUpload = async (materialId, file) => {
    setUploadingImage(materialId);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await updateMutation.mutateAsync({ id: materialId, data: { image_url: file_url } });
      toast.success("Image uploaded");
    } catch (error) {
      toast.error("Upload failed: " + error.message);
    } finally {
      setUploadingImage(null);
    }
  };

  // Get display image for material
  const getDisplayImage = (material) => {
    return material.image_url || material.image_board || material.image_raport || material.image_detail || material.image_room;
  };

  // Export CSV
  const exportCSV = () => {
    const headers = ["code", "surface_type", "name", "supplier_folder", "image_url", "is_active", "notes"];
    const rows = materials.map(m => headers.map(h => m[h] || "").join(","));
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `materials_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported");
  };

  // Import CSV
  const handleCSVImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      const text = await file.text();
      const lines = text.split("\n").filter(l => l.trim());
      const headers = lines[0].split(",").map(h => h.trim());
      
      const newMaterials = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",");
        const material = {};
        headers.forEach((h, idx) => {
          // Map dcode to code
          const key = h === 'dcode' ? 'code' : h;
          const value = values[idx]?.trim();
          if (key === 'is_active') {
            material[key] = value === 'true';
          } else if (value) {
            material[key] = value;
          }
        });
        if (material.code) {
          newMaterials.push(material);
        }
      }
      
      // Create or update materials
      for (const mat of newMaterials) {
        const existing = materials.find(m => m.code === mat.code && m.surface_type === mat.surface_type);
        if (existing) {
          await updateMutation.mutateAsync({ id: existing.id, data: mat });
        } else {
          await createMutation.mutateAsync(mat);
        }
      }
      
      toast.success(`Imported ${newMaterials.length} materials`);
    } catch (error) {
      toast.error("Import failed: " + error.message);
    }
  };

  // Get unique supplier folders (legacy)
  const supplierFolders = [...new Set(materials.map(m => m.supplier_folder))].filter(Boolean);

  // Helper functions to get category/supplier names
  const getCategoryName = (material) => {
    if (material.category_id) {
      const cat = categories.find(c => c.id === material.category_id);
      return cat?.name || material.category_id;
    }
    return material.supplier_folder || '-';
  };

  const getSupplierName = (material) => {
    if (material.supplier_id) {
      const sup = suppliers.find(s => s.id === material.supplier_id);
      return sup?.name || material.supplier_id;
    }
    return '-';
  };

  // Filter materials (client-side search only)
  const filteredMaterials = materials.filter(m => {
    const matchesSearch = !searchTerm || 
      m.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Filters & Actions */}
      <div className="flex gap-4 flex-wrap">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search by code or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterSupplier} onValueChange={setFilterSupplier}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select Supplier" />
          </SelectTrigger>
          <SelectContent>
            {suppliers.map((sup) => (
              <SelectItem key={sup.id} value={sup.id}>
                {sup.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Button onClick={() => setShowAddDrawer(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Material
        </Button>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Settings className="w-4 h-4" />
              Columns
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64">
            <div className="space-y-2">
              <h4 className="font-medium mb-2">Visible Columns</h4>
              {allFields.map(field => (
                <label key={field} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={visibleColumns.includes(field)}
                    onChange={() => toggleColumn(field)}
                  />
                  <span className="text-sm">{field.replace(/_/g, ' ')}</span>
                </label>
              ))}
            </div>
          </PopoverContent>
        </Popover>
        
        <Button onClick={exportCSV} variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
        
        <Button variant="outline" className="gap-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <FileUp className="w-4 h-4" />
            Import CSV
            <input type="file" accept=".csv,.txt" className="hidden" onChange={handleCSVImport} />
          </label>
        </Button>
      </div>

      {/* Selection prompt when no filters selected */}
      {!filterCategory && !filterSupplier && (
        <Card className="p-8 text-center">
          <div className="text-gray-500">
            <p className="text-lg font-medium mb-2">Select a category or supplier to view materials</p>
            <p className="text-sm">Use the dropdowns above to filter and load materials</p>
          </div>
        </Card>
      )}
      
      {isLoading && (
        <Card className="p-8 text-center">
          <div className="text-gray-500">Loading materials...</div>
        </Card>
      )}
      
      {(filterCategory || filterSupplier) && !isLoading && (
        <>
      {/* Stats */}
      <Card className="p-4">
        <div className="flex justify-between items-center">
          <div>
            <div className="text-sm text-gray-500">Total Materials</div>
            <div className="text-2xl font-semibold">{totalMaterials}</div>
          </div>
          <div className="text-sm text-gray-500">
            Showing {materials.length > 0 ? (page - 1) * pageSize + 1 : 0} - {Math.min(page * pageSize, totalMaterials)} of {totalMaterials}
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                {visibleColumns.includes("image") && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Image
                  </th>
                )}
                {visibleColumns.includes("code") && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Code
                  </th>
                )}
                {visibleColumns.includes("name") && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                )}
                {visibleColumns.includes("surface_type") && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Surface
                  </th>
                )}
                {visibleColumns.includes("supplier_folder") && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category / Supplier
                  </th>
                )}
                {visibleColumns.includes("notes") && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Notes
                  </th>
                )}
                {visibleColumns.includes("is_active") && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                )}
                {allFields.filter(f => !["image", "code", "name", "surface_type", "supplier_folder", "notes", "is_active", "actions"].includes(f)).map(field => (
                  visibleColumns.includes(field) && (
                    <th key={field} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {field.replace(/_/g, ' ')}
                    </th>
                  )
                ))}
                {visibleColumns.includes("actions") && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMaterials.map((material) => (
                <tr key={material.id} className="hover:bg-gray-50">
                  {visibleColumns.includes("image") && (
                    <td className="px-4 py-3">
                      <div className="relative group">
                        {getDisplayImage(material) ? (
                          <img 
                            src={getDisplayImage(material)} 
                            alt={material.name}
                            className="w-16 h-16 object-cover rounded"
                            style={{ objectPosition: 'center' }}
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs">
                            No image
                          </div>
                        )}
                        <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex items-center justify-center rounded">
                          <Upload className="w-4 h-4 text-white" />
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => e.target.files?.[0] && handleImageUpload(material.id, e.target.files[0])}
                            disabled={uploadingImage === material.id}
                          />
                        </label>
                      </div>
                    </td>
                  )}
                  {visibleColumns.includes("code") && (
                    <td className="px-4 py-3 font-medium">{material.code || '-'}</td>
                  )}
                  {visibleColumns.includes("name") && (
                    <td className="px-4 py-3">{material.name || '-'}</td>
                  )}
                  {visibleColumns.includes("surface_type") && (
                    <td className="px-4 py-3">
                      {material.surface_type ? (
                        <Badge variant="outline">{material.surface_type}</Badge>
                      ) : '-'}
                    </td>
                  )}
                  {visibleColumns.includes("supplier_folder") && (
                    <td className="px-4 py-3 text-sm text-gray-600">
                      <div className="flex flex-col gap-1">
                        <span className="font-medium">{getCategoryName(material)}</span>
                        {material.supplier_id && (
                          <span className="text-xs text-gray-500">{getSupplierName(material)}</span>
                        )}
                      </div>
                    </td>
                  )}
                  {visibleColumns.includes("notes") && (
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                      {material.notes || '-'}
                    </td>
                  )}
                  {visibleColumns.includes("is_active") && (
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
                  )}
                  {allFields.filter(f => !["image", "code", "name", "surface_type", "supplier_folder", "notes", "is_active", "actions"].includes(f)).map(field => (
                    visibleColumns.includes(field) && (
                      <td key={field} className="px-4 py-3 text-sm text-gray-600">
                        {material[field] || '-'}
                      </td>
                    )
                  ))}
                  {visibleColumns.includes("actions") && (
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingMaterial(material)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            if (confirm("Delete this material?")) {
                              deleteMutation.mutate(material.id);
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </td>
                  )}
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

          {/* Pagination */}
          {totalPages > 1 && (
          <Card className="p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Rows per page:</span>
              <Select value={pageSize.toString()} onValueChange={(v) => {
                setPageSize(Number(v));
                setPage(1);
              }}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                  <SelectItem value="200">200</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(1)}
                disabled={page === 1}
              >
                First
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-500 px-4">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(totalPages)}
                disabled={page === totalPages}
              >
                Last
              </Button>
            </div>
          </div>
          </Card>
          )}

      {/* Edit Sheet */}
      <Sheet open={!!editingMaterial} onOpenChange={() => setEditingMaterial(null)}>
        <SheetContent className="w-[400px] sm:w-[600px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Edit Material</SheetTitle>
          </SheetHeader>
          {editingMaterial && (
            <div className="mt-6 space-y-4">
              {/* Image Details */}
              {getDisplayImage(editingMaterial) && (
                <Card className="p-4 space-y-3">
                  <Label className="text-sm font-semibold">Image Details</Label>
                  
                  {/* Preview with color swatch */}
                  <div className="flex gap-4">
                    <img 
                      src={getDisplayImage(editingMaterial)} 
                      alt={editingMaterial.name}
                      className="w-32 h-32 object-cover rounded-lg border"
                      onLoad={(e) => {
                        const img = e.target;
                        const canvas = document.createElement('canvas');
                        canvas.width = img.naturalWidth;
                        canvas.height = img.naturalHeight;
                        img.dataset.size = `${img.naturalWidth}x${img.naturalHeight}`;
                      }}
                    />
                    <div className="flex-1 space-y-2 text-sm">
                      <div>
                        <span className="text-gray-500">Name:</span>
                        <div className="font-mono text-xs break-all">
                          {editingMaterial.code}_{editingMaterial.name?.replace(/\s+/g, '_')}.jpg
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">URL:</span>
                        <div className="font-mono text-xs break-all">
                          {getDisplayImage(editingMaterial)}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-2"
                        onClick={async () => {
                          try {
                            const response = await fetch(getDisplayImage(editingMaterial));
                            const blob = await response.blob();
                            const { file_url } = await base44.integrations.Core.UploadFile({ 
                              file: new File([blob], `${editingMaterial.code}_${editingMaterial.name?.replace(/\s+/g, '_')}.jpg`, { type: blob.type })
                            });
                            await updateMutation.mutateAsync({ 
                              id: editingMaterial.id, 
                              data: { image_url: file_url } 
                            });
                            toast.success("Image saved to database");
                          } catch (error) {
                            toast.error("Download failed: " + error.message);
                          }
                        }}
                      >
                        <Download className="w-3 h-3" />
                        Save to Database
                      </Button>
                    </div>
                  </div>
                </Card>
              )}
              
              <div>
                <Label>Code</Label>
                <Input
                  value={editingMaterial.code || ""}
                  onChange={(e) => setEditingMaterial({...editingMaterial, code: e.target.value})}
                />
              </div>
              <div>
                <Label>Name</Label>
                <Input
                  value={editingMaterial.name || ""}
                  onChange={(e) => setEditingMaterial({...editingMaterial, name: e.target.value})}
                />
              </div>
              <div>
                <Label>Surface Type</Label>
                <Input
                  value={editingMaterial.surface_type || ""}
                  onChange={(e) => setEditingMaterial({...editingMaterial, surface_type: e.target.value})}
                />
              </div>
              <div>
                <Label>Category</Label>
                <Select 
                  value={editingMaterial.category_id || ""} 
                  onValueChange={(v) => setEditingMaterial({...editingMaterial, category_id: v})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Supplier</Label>
                <Select 
                  value={editingMaterial.supplier_id || ""} 
                  onValueChange={(v) => setEditingMaterial({...editingMaterial, supplier_id: v})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((sup) => (
                      <SelectItem key={sup.id} value={sup.id}>
                        {sup.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Show all uploaded fields */}
              {allFields.filter(f => !["code", "name", "surface_type", "supplier_folder", "is_active", "image", "actions", "image_url", "image_board", "image_raport", "image_detail", "image_room"].includes(f) && editingMaterial[f]).map(field => (
                <div key={field}>
                  <Label>{field.replace(/_/g, ' ')}</Label>
                  <Textarea
                    value={editingMaterial[field] || ""}
                    onChange={(e) => setEditingMaterial({...editingMaterial, [field]: e.target.value})}
                    rows={2}
                  />
                </div>
              ))}
              
              <div>
                <Label>Notes</Label>
                <Textarea
                  value={editingMaterial.notes || ""}
                  onChange={(e) => setEditingMaterial({...editingMaterial, notes: e.target.value})}
                  rows={3}
                />
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editingMaterial.is_active !== false}
                  onChange={(e) => setEditingMaterial({...editingMaterial, is_active: e.target.checked})}
                />
                <Label>Active</Label>
              </div>
              <Button 
                onClick={() => updateMutation.mutate({ id: editingMaterial.id, data: editingMaterial })}
                className="w-full"
              >
                Save Changes
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Add Drawer */}
      <Sheet open={showAddDrawer} onOpenChange={setShowAddDrawer}>
        <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Add New Material</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <MaterialForm onSubmit={(data) => createMutation.mutate(data)} allFields={allFields} />
          </div>
        </SheetContent>
      </Sheet>
        </>
      )}
    </div>
  );
}

function MaterialForm({ onSubmit, initialData = {}, allFields = [] }) {
  const [formData, setFormData] = useState({
    code: initialData.code || "",
    name: initialData.name || "",
    surface_type: initialData.surface_type || "",
    supplier_folder: initialData.supplier_folder || "Egger Boards",
    notes: initialData.notes || "",
    is_active: initialData.is_active !== false,
    ...initialData
  });
  
  const [customFieldName, setCustomFieldName] = useState("");
  const [showAddField, setShowAddField] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Code *</Label>
        <Input
          required
          value={formData.code}
          onChange={(e) => setFormData({...formData, code: e.target.value})}
          placeholder="e.g., W990"
        />
      </div>
      <div>
        <Label>Name *</Label>
        <Input
          required
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          placeholder="e.g., Crystal White"
        />
      </div>
      <div>
        <Label>Surface Type</Label>
        <Input
          value={formData.surface_type}
          onChange={(e) => setFormData({...formData, surface_type: e.target.value})}
          placeholder="e.g., ST9"
        />
      </div>
      <div>
        <Label>Supplier Folder</Label>
        <Select value={formData.supplier_folder} onValueChange={(v) => setFormData({...formData, supplier_folder: v})}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Egger Boards">Egger Boards</SelectItem>
            <SelectItem value="Handles">Handles</SelectItem>
            <SelectItem value="Door Styles">Door Styles</SelectItem>
            <SelectItem value="Vinyl Colours">Vinyl Colours</SelectItem>
            <SelectItem value="Worktops">Worktops</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Notes</Label>
        <Textarea
          value={formData.notes}
          onChange={(e) => setFormData({...formData, notes: e.target.value})}
          rows={3}
        />
      </div>
      
      {/* Custom fields */}
      {allFields.filter(f => !["code", "name", "surface_type", "supplier_folder", "notes", "is_active", "image", "actions"].includes(f)).map(field => (
        <div key={field}>
          <Label>{field.replace(/_/g, ' ')}</Label>
          <Input
            value={formData[field] || ""}
            onChange={(e) => setFormData({...formData, [field]: e.target.value})}
          />
        </div>
      ))}
      
      {/* Add custom field */}
      <div className="border-t pt-4">
        {!showAddField ? (
          <Button type="button" variant="outline" onClick={() => setShowAddField(true)} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add Custom Field
          </Button>
        ) : (
          <div className="space-y-2">
            <Input
              placeholder="Field name (e.g., finish_type)"
              value={customFieldName}
              onChange={(e) => setCustomFieldName(e.target.value)}
            />
            <div className="flex gap-2">
              <Button 
                type="button" 
                size="sm"
                onClick={() => {
                  if (customFieldName) {
                    setFormData({...formData, [customFieldName]: ""});
                    setCustomFieldName("");
                    setShowAddField(false);
                  }
                }}
              >
                Add
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={() => setShowAddField(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={formData.is_active}
          onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
        />
        <Label>Active</Label>
      </div>
      <Button type="submit" className="w-full">Add Material</Button>
    </form>
  );
}