import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search, AlertCircle, CheckCircle2, Pencil, Trash2, Upload, Download, Plus, FileUp } from "lucide-react";
import { toast } from "sonner";

// Import the full EGGER_COLORS list from batch upload
import { EGGER_COLORS } from "./MaterialsBatchUpload";

const EXPECTED_COLORS = EGGER_COLORS;

export default function MaterialsDataTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSupplier, setFilterSupplier] = useState("all");
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(null);
  const [csvFile, setCsvFile] = useState(null);
  
  const queryClient = useQueryClient();

  const { data: materials = [], isLoading } = useQuery({
    queryKey: ["materials"],
    queryFn: () => base44.entities.Material.list(),
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
      setShowAddDialog(false);
    },
  });

  // Find uploaded codes
  const uploadedCodes = new Set(materials.map(m => m.code?.toUpperCase()));
  
  // Find missing colors
  const missingColors = EXPECTED_COLORS.filter(
    color => !uploadedCodes.has(color.code.toUpperCase())
  );

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
      const headers = lines[0].split(",");
      
      const newMaterials = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",");
        const material = {};
        headers.forEach((h, idx) => {
          material[h.trim()] = values[idx]?.trim();
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

  // Delete orphaned entries
  const deleteOrphans = async () => {
    const expectedCodes = new Set(EXPECTED_COLORS.map(c => c.code.toUpperCase()));
    const orphans = materials.filter(m => !expectedCodes.has(m.code?.toUpperCase()));
    
    if (orphans.length === 0) {
      toast.info("No orphaned entries found");
      return;
    }
    
    if (!confirm(`Delete ${orphans.length} orphaned materials?`)) return;
    
    for (const orphan of orphans) {
      await deleteMutation.mutateAsync(orphan.id);
    }
    
    toast.success(`Deleted ${orphans.length} orphaned materials`);
  };

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
        
        <Button onClick={() => setShowAddDialog(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Material
        </Button>
        
        <Button onClick={exportCSV} variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
        
        <Button variant="outline" className="gap-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <FileUp className="w-4 h-4" />
            Import CSV
            <input type="file" accept=".csv" className="hidden" onChange={handleCSVImport} />
          </label>
        </Button>
        
        <Button onClick={deleteOrphans} variant="destructive" className="gap-2">
          <Trash2 className="w-4 h-4" />
          Delete Orphans
        </Button>
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
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMaterials.map((material) => (
                <tr key={material.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="relative group">
                      {material.image_url ? (
                        <img 
                          src={material.image_url} 
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

      {/* Edit Dialog */}
      <Dialog open={!!editingMaterial} onOpenChange={() => setEditingMaterial(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Material</DialogTitle>
          </DialogHeader>
          {editingMaterial && (
            <div className="space-y-4">
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
                <Label>Supplier Folder</Label>
                <Input
                  value={editingMaterial.supplier_folder || ""}
                  onChange={(e) => setEditingMaterial({...editingMaterial, supplier_folder: e.target.value})}
                />
              </div>
              <div>
                <Label>Notes</Label>
                <Input
                  value={editingMaterial.notes || ""}
                  onChange={(e) => setEditingMaterial({...editingMaterial, notes: e.target.value})}
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
        </DialogContent>
      </Dialog>

      {/* Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Material</DialogTitle>
          </DialogHeader>
          <MaterialForm onSubmit={(data) => createMutation.mutate(data)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MaterialForm({ onSubmit, initialData = {} }) {
  const [formData, setFormData] = useState({
    code: initialData.code || "",
    name: initialData.name || "",
    surface_type: initialData.surface_type || "",
    supplier_folder: initialData.supplier_folder || "Egger Boards",
    notes: initialData.notes || "",
    is_active: initialData.is_active !== false,
  });

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
        <Input
          value={formData.notes}
          onChange={(e) => setFormData({...formData, notes: e.target.value})}
        />
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