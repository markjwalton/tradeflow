import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function EggerDataImporter() {
  const [file, setFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState(null);
  
  const queryClient = useQueryClient();

  const extractImageUrls = (imageColumn) => {
    if (!imageColumn) return {};
    
    const images = {};
    const patterns = [
      { key: 'image_raport', regex: /<Raport><Original><([^>]+)>/ },
      { key: 'image_board', regex: /<BoardA3><Original><([^>]+)>/ },
      { key: 'image_room', regex: /<Room><Original><([^>]+)>/ },
      { key: 'image_detail', regex: /<Detail><Original><([^>]+)>/ },
    ];
    
    patterns.forEach(({ key, regex }) => {
      const match = imageColumn.match(regex);
      if (match && match[1]) {
        images[key] = match[1];
      }
    });
    
    return images;
  };

  const parseEggerTSV = (text) => {
    const lines = text.split('\n').filter(l => l.trim());
    const headers = lines[0].split('\t').map(h => h.trim());
    
    const materials = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split('\t');
      const row = {};
      
      headers.forEach((header, idx) => {
        row[header] = values[idx]?.trim() || '';
      });
      
      // Extract image URLs from SCALABLE_DECOR_IMAGES
      const images = extractImageUrls(row.SCALABLE_DECOR_IMAGES);
      
      // Map to Material schema
      const material = {
        code: row.DECOR_TOP_CODE,
        name: row.DECOR_TOP_NAME,
        surface_type: row.TEXTURE_TOP_CODE,
        base_product: row.BASEPRODUCT_NAME,
        supplier_folder: row.BASEPRODUCT_NAME?.includes('Laminate') ? 'Egger Laminates' : 
                        row.BASEPRODUCT_NAME?.includes('Edging') ? 'Egger Edging' :
                        row.BASEPRODUCT_NAME?.includes('PerfectSense') ? 'Egger PerfectSense' : 'Egger Boards',
        product_description: row.BASEPRODUCT_TEXT?.replace(/<[^>]+>/g, ''),
        decor_recommendation: row.DECOR_RECOMMENDATION?.replace(/<[^>]+>/g, ''),
        decor_group: row.DECOR_GROUP,
        decor_type: row.DECOR_TYPE,
        brightness: row.DECOR_BRIGHTNESSFACTOR,
        color_tone: row.DECOR_COLORTONE,
        ral_code: row.DECOR_RAL,
        ncs_code: row.DECOR_NCS,
        dimensions: `${row.LENGTH}×${row.WIDTH}×${row.THICKNESS}${row.THICKNESS_UNIT}`,
        is_active: true,
        ...images,
        image_url: images.image_raport || images.image_detail || images.image_board || '',
      };
      
      if (material.code && material.name) {
        materials.push(material);
      }
    }
    
    return materials;
  };

  const handleImport = async () => {
    if (!file) {
      toast.error("Please select a file first");
      return;
    }
    
    setImporting(true);
    setProgress(0);
    setResults(null);
    
    try {
      const text = await file.text();
      const materials = parseEggerTSV(text);
      
      // DELETE ALL EXISTING EGGER MATERIALS FIRST (TSV is single source of truth)
      toast.info("Clearing existing Egger data...");
      const existingEgger = await base44.entities.Material.filter({
        supplier_folder: { $regex: "Egger" }
      });
      
      for (const mat of existingEgger) {
        await base44.entities.Material.delete(mat.id);
      }
      
      toast.info(`Deleted ${existingEgger.length} existing materials. Importing fresh data...`);
      
      let created = 0;
      let errors = [];
      
      for (let i = 0; i < materials.length; i++) {
        const material = materials[i];
        setProgress(Math.round(((i + 1) / materials.length) * 100));
        
        try {
          await base44.entities.Material.create(material);
          created++;
        } catch (error) {
          errors.push({ code: material.code, error: error.message });
        }
      }
      
      setResults({ created, updated: 0, deleted: existingEgger.length, errors, total: materials.length });
      queryClient.invalidateQueries(['materials']);
      toast.success(`Import complete: ${created} created, ${existingEgger.length} deleted`);
    } catch (error) {
      toast.error("Import failed: " + error.message);
    } finally {
      setImporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Egger Data Importer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Select Egger TSV/TXT File</Label>
          <Input
            type="file"
            accept=".tsv,.txt,.csv"
            onChange={(e) => setFile(e.target.files?.[0])}
            disabled={importing}
          />
          <p className="text-xs text-gray-500 mt-1">
            Tab-separated file from Egger with product data and CDN image links
          </p>
        </div>

        {file && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <span className="font-medium">{file.name}</span>
              <span className="text-gray-500">({(file.size / 1024).toFixed(1)} KB)</span>
            </div>
          </div>
        )}

        {importing && (
          <div className="space-y-2">
            <Progress value={progress} />
            <p className="text-sm text-center text-gray-600">
              Importing materials... {progress}%
            </p>
          </div>
        )}

        {results && (
          <div className="space-y-2">
            <div className="grid grid-cols-4 gap-3">
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                <AlertCircle className="w-5 h-5 text-red-600 mx-auto mb-1" />
                <div className="text-xl font-semibold text-red-700">{results.deleted}</div>
                <div className="text-xs text-red-600">Deleted</div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                <CheckCircle2 className="w-5 h-5 text-green-600 mx-auto mb-1" />
                <div className="text-xl font-semibold text-green-700">{results.created}</div>
                <div className="text-xs text-green-600">Created</div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                <CheckCircle2 className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                <div className="text-xl font-semibold text-blue-700">{results.updated}</div>
                <div className="text-xs text-blue-600">Updated</div>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-center">
                <AlertCircle className="w-5 h-5 text-orange-600 mx-auto mb-1" />
                <div className="text-xl font-semibold text-orange-700">{results.errors.length}</div>
                <div className="text-xs text-orange-600">Errors</div>
              </div>
            </div>
            
            {results.errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm space-y-1 max-h-40 overflow-y-auto">
                <div className="font-medium text-red-700 mb-2">Errors:</div>
                {results.errors.map((err, idx) => (
                  <div key={idx} className="text-red-600">
                    {err.code}: {err.error}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <Button 
          onClick={handleImport}
          disabled={!file || importing}
          className="w-full"
        >
          <Upload className="w-4 h-4 mr-2" />
          {importing ? "Importing..." : "Import Egger Materials"}
        </Button>
      </CardContent>
    </Card>
  );
}