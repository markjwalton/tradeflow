import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Trash2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/sturij/PageHeader";

export default function SwatchManager() {
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "Wood",
    color: "",
    texture: "",
    finish: "",
    style: ""
  });

  const queryClient = useQueryClient();

  // In a real implementation, you'd create a Swatch entity and fetch from there
  // For now, this is a placeholder page structure

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      
      // Upload file to base44
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      console.log("Uploaded file URL:", file_url);
      
      // Here you would save to a Swatch entity with the formData + file_url
      // await base44.entities.Swatch.create({ ...formData, image: file_url });
      
      alert("File uploaded successfully! URL: " + file_url);
      
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <PageHeader 
          title="Swatch Manager"
          description="Upload and manage material swatches for the browser"
        />

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Upload New Swatch</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Swatch Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., H0045 ST15"
                />
              </div>
              
              <div>
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="color">Color</Label>
                <Input
                  id="color"
                  value={formData.color}
                  onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                  placeholder="Light, Medium, Dark..."
                />
              </div>

              <div>
                <Label htmlFor="texture">Texture</Label>
                <Input
                  id="texture"
                  value={formData.texture}
                  onChange={(e) => setFormData(prev => ({ ...prev, texture: e.target.value }))}
                  placeholder="Smooth, Textured"
                />
              </div>

              <div>
                <Label htmlFor="finish">Finish</Label>
                <Input
                  id="finish"
                  value={formData.finish}
                  onChange={(e) => setFormData(prev => ({ ...prev, finish: e.target.value }))}
                  placeholder="Matt, Satin, Gloss"
                />
              </div>

              <div>
                <Label htmlFor="style">Style</Label>
                <Input
                  id="style"
                  value={formData.style}
                  onChange={(e) => setFormData(prev => ({ ...prev, style: e.target.value }))}
                  placeholder="Contemporary, Traditional..."
                />
              </div>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <input
                type="file"
                id="file-upload"
                className="hidden"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={uploading}
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-sm text-gray-600">
                  {uploading ? "Uploading..." : "Click to upload swatch image"}
                </p>
                <p className="text-xs text-gray-400 mt-2">PNG, JPG up to 10MB</p>
              </label>
            </div>

            <Button className="w-full" disabled={uploading}>
              Save Swatch
            </Button>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Existing Swatches</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              Create a Swatch entity to store and manage swatches in the database.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}