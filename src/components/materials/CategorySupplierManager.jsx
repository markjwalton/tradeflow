import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function CategorySupplierManager() {
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddSupplier, setShowAddSupplier] = useState(false);
  
  const queryClient = useQueryClient();

  const { data: categories = [] } = useQuery({
    queryKey: ["material-categories"],
    queryFn: () => base44.entities.MaterialCategory.list(),
  });

  const { data: suppliers = [] } = useQuery({
    queryKey: ["material-suppliers"],
    queryFn: () => base44.entities.MaterialSupplier.list(),
  });

  const createCategoryMutation = useMutation({
    mutationFn: (data) => base44.entities.MaterialCategory.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["material-categories"]);
      toast.success("Category created");
      setShowAddCategory(false);
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.MaterialCategory.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["material-categories"]);
      toast.success("Category updated");
      setEditingCategory(null);
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id) => base44.entities.MaterialCategory.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["material-categories"]);
      toast.success("Category deleted");
    },
  });

  const createSupplierMutation = useMutation({
    mutationFn: (data) => base44.entities.MaterialSupplier.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["material-suppliers"]);
      toast.success("Supplier created");
      setShowAddSupplier(false);
    },
  });

  const updateSupplierMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.MaterialSupplier.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["material-suppliers"]);
      toast.success("Supplier updated");
      setEditingSupplier(null);
    },
  });

  const deleteSupplierMutation = useMutation({
    mutationFn: (id) => base44.entities.MaterialSupplier.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["material-suppliers"]);
      toast.success("Supplier deleted");
    },
  });

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Categories */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Material Categories</CardTitle>
          <Button size="sm" onClick={() => setShowAddCategory(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Category
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {categories.map((cat) => (
              <div key={cat.id} className="flex items-center justify-between p-3 border rounded">
                <div>
                  <div className="font-medium">{cat.name}</div>
                  <div className="text-sm text-gray-500">{cat.description}</div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => setEditingCategory(cat)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      if (confirm("Delete this category?")) {
                        deleteCategoryMutation.mutate(cat.id);
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Suppliers */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Material Suppliers</CardTitle>
          <Button size="sm" onClick={() => setShowAddSupplier(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Supplier
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {suppliers.map((sup) => {
              const category = categories.find((c) => c.id === sup.category_id);
              return (
                <div key={sup.id} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <div className="font-medium">{sup.name}</div>
                    <div className="text-sm text-gray-500">{category?.name || "No category"}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => setEditingSupplier(sup)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        if (confirm("Delete this supplier?")) {
                          deleteSupplierMutation.mutate(sup.id);
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Category Sheet */}
      <Sheet open={showAddCategory || !!editingCategory} onOpenChange={() => { setShowAddCategory(false); setEditingCategory(null); }}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{editingCategory ? "Edit Category" : "Add Category"}</SheetTitle>
          </SheetHeader>
          <CategoryForm
            initialData={editingCategory}
            onSubmit={(data) => {
              if (editingCategory) {
                updateCategoryMutation.mutate({ id: editingCategory.id, data });
              } else {
                createCategoryMutation.mutate(data);
              }
            }}
          />
        </SheetContent>
      </Sheet>

      {/* Add/Edit Supplier Sheet */}
      <Sheet open={showAddSupplier || !!editingSupplier} onOpenChange={() => { setShowAddSupplier(false); setEditingSupplier(null); }}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{editingSupplier ? "Edit Supplier" : "Add Supplier"}</SheetTitle>
          </SheetHeader>
          <SupplierForm
            initialData={editingSupplier}
            categories={categories}
            onSubmit={(data) => {
              if (editingSupplier) {
                updateSupplierMutation.mutate({ id: editingSupplier.id, data });
              } else {
                createSupplierMutation.mutate(data);
              }
            }}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}

function CategoryForm({ initialData, onSubmit }) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    order: initialData?.order || 1,
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(formData);
      }}
      className="mt-6 space-y-4"
    >
      <div>
        <Label>Name</Label>
        <Input
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
      </div>
      <div>
        <Label>Description</Label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>
      <div>
        <Label>Order</Label>
        <Input
          type="number"
          value={formData.order}
          onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
        />
      </div>
      <Button type="submit" className="w-full">
        Save
      </Button>
    </form>
  );
}

function SupplierForm({ initialData, categories, onSubmit }) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    category_id: initialData?.category_id || "",
    website: initialData?.website || "",
    notes: initialData?.notes || "",
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(formData);
      }}
      className="mt-6 space-y-4"
    >
      <div>
        <Label>Name</Label>
        <Input
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
      </div>
      <div>
        <Label>Category</Label>
        <Select value={formData.category_id} onValueChange={(v) => setFormData({ ...formData, category_id: v })}>
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
        <Label>Website</Label>
        <Input
          type="url"
          value={formData.website}
          onChange={(e) => setFormData({ ...formData, website: e.target.value })}
        />
      </div>
      <div>
        <Label>Notes</Label>
        <Textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        />
      </div>
      <Button type="submit" className="w-full">
        Save
      </Button>
    </form>
  );
}