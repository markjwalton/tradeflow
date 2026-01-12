import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

// Egger color mappings
const EGGER_COLORS = [
  { code: "W990", surface_type: "ST9", name: "Crystal White" },
  { code: "W1000", surface_type: "ST9", name: "Premium White" },
  { code: "W1000", surface_type: "ST19", name: "Premium White" },
  { code: "W1000", surface_type: "ST38", name: "Premium White" },
  { code: "W1001", surface_type: "ST9", name: "Solid Premium White" },
  { code: "W1100", surface_type: "ST9", name: "Alpine White" },
  { code: "W1101", surface_type: "ST9", name: "Solid Alpine White" },
  { code: "W1200", surface_type: "ST9", name: "Porcelain White" },
  { code: "U104", surface_type: "ST9", name: "Alabaster White" },
  { code: "U113", surface_type: "ST9", name: "Cotton Beige" },
  { code: "U114", surface_type: "ST9", name: "Brilliant Yellow" },
  { code: "U115", surface_type: "ST9", name: "Carat Beige" },
  { code: "U125", surface_type: "ST9", name: "Sand Yellow" },
  { code: "U131", surface_type: "ST9", name: "Citrus Yellow" },
  { code: "U156", surface_type: "ST9", name: "Sand Beige" },
  { code: "U163", surface_type: "ST9", name: "Curry Yellow" },
  { code: "U201", surface_type: "ST9", name: "Pebble Grey" },
  { code: "U211", surface_type: "ST9", name: "Almond Beige" },
  { code: "U216", surface_type: "ST9", name: "Camè Beige" },
  { code: "U222", surface_type: "ST9", name: "Crema Beige" },
  { code: "U232", surface_type: "ST9", name: "Apricot Nude" },
  { code: "U311", surface_type: "ST9", name: "Burgundy Red" },
  { code: "U321", surface_type: "ST9", name: "China Red" },
  { code: "U323", surface_type: "ST9", name: "Chilli Red" },
  { code: "U325", surface_type: "ST9", name: "Antique Rose" },
  { code: "U332", surface_type: "ST9", name: "Orange" },
  { code: "U335", surface_type: "ST9", name: "Rusty Red" },
  { code: "U350", surface_type: "ST9", name: "Siena Orange" },
  { code: "U363", surface_type: "ST9", name: "Flamingo Pink" },
  { code: "U399", surface_type: "ST9", name: "Garnet Red" },
  { code: "U420", surface_type: "ST9", name: "Purple" },
  { code: "U430", surface_type: "ST9", name: "Violet" },
  { code: "U500", surface_type: "ST9", name: "Glacier Blue" },
  { code: "U502", surface_type: "ST9", name: "Misty Blue" },
  { code: "U504", surface_type: "ST9", name: "Tyrolean Blue" },
  { code: "U505", surface_type: "ST9", name: "Nordic Blue" },
  { code: "U522", surface_type: "ST9", name: "Horizon Blue" },
  { code: "U525", surface_type: "ST9", name: "Delft Blue" },
  { code: "U540", surface_type: "ST9", name: "Denim Blue" },
  { code: "U545", surface_type: "ST9", name: "Baltic Blue" },
  { code: "U560", surface_type: "ST9", name: "Deep Sea Blue" },
  { code: "U565", surface_type: "ST9", name: "Ocean Blue" },
  { code: "U570", surface_type: "ST9", name: "Midnight Blue" },
  { code: "U575", surface_type: "ST9", name: "Cosmos blue" },
  { code: "U599", surface_type: "ST9", name: "Indigo Blue" },
  { code: "U604", surface_type: "ST9", name: "Reed Green" },
  { code: "U606", surface_type: "ST9", name: "Forest Green" },
  { code: "U608", surface_type: "ST9", name: "Pistachio Green" },
  { code: "U626", surface_type: "ST9", name: "Kiwi Green" },
  { code: "U630", surface_type: "ST9", name: "Lime Green" },
  { code: "U633", surface_type: "ST9", name: "Turquoise Blue" },
  { code: "U636", surface_type: "ST9", name: "Fjord Green" },
  { code: "U638", surface_type: "ST9", name: "Sage Green" },
  { code: "U640", surface_type: "ST9", name: "Olive Green" },
  { code: "U645", surface_type: "ST9", name: "Agave Green" },
  { code: "U646", surface_type: "ST9", name: "Niagara Green" },
  { code: "U665", surface_type: "ST9", name: "Stone Green" },
  { code: "U699", surface_type: "ST9", name: "Fir Green" },
  { code: "U702", surface_type: "ST9", name: "Cashmere Grey" },
  { code: "U7021", surface_type: "ST9", name: "Solid Cashmere Grey" },
  { code: "U705", surface_type: "ST9", name: "Angora Grey" },
  { code: "U707", surface_type: "ST9", name: "Silk Grey" },
  { code: "U708", surface_type: "ST9", name: "Light Grey" },
  { code: "U7081", surface_type: "ST9", name: "Solid Light Grey" },
  { code: "U727", surface_type: "ST9", name: "Stone Grey" },
  { code: "U732", surface_type: "ST9", name: "Dust Grey" },
  { code: "U740", surface_type: "ST9", name: "Dark Taupe" },
  { code: "U741", surface_type: "ST9", name: "Lava Grey" },
  { code: "U748", surface_type: "ST9", name: "Truffle Brown" },
  { code: "U750", surface_type: "ST9", name: "Taupe Grey" },
  { code: "U763", surface_type: "ST9", name: "Pearl Grey" },
  { code: "U767", surface_type: "ST9", name: "Cubanit Grey" },
  { code: "U775", surface_type: "ST9", name: "White Grey" },
  { code: "U780", surface_type: "ST9", name: "Monument Grey" },
  { code: "U788", surface_type: "ST9", name: "Arctic Grey" },
  { code: "U818", surface_type: "ST9", name: "Dark Brown" },
  { code: "U830", surface_type: "ST9", name: "Caramel Nude" },
  { code: "U899", surface_type: "ST9", name: "Soft Black" },
  { code: "U8991", surface_type: "ST9", name: "Solid Soft Black" },
  { code: "U960", surface_type: "ST9", name: "Onyx Grey" },
  { code: "U963", surface_type: "ST9", name: "Diamond Grey" },
  { code: "U9631", surface_type: "ST9", name: "Solid Diamond Grey" },
  { code: "U968", surface_type: "ST9", name: "Carbon Grey" },
  { code: "U989", surface_type: "ST9", name: "Black Brown" },
  { code: "U998", surface_type: "ST38", name: "Shadow Black" },
  { code: "U999", surface_type: "ST12", name: "Black" },
  { code: "U999", surface_type: "ST19", name: "Black" },
  { code: "U999", surface_type: "ST20", name: "Black" },
  { code: "U999", surface_type: "TM28", name: "Black" },
  { code: "H305", surface_type: "ST12", name: "Natural Tonsberg Oak" },
  { code: "H309", surface_type: "ST12", name: "Brown Tonsberg Oak" },
  { code: "H1113", surface_type: "ST10", name: "Brown Kansas Oak" },
  { code: "H1142", surface_type: "ST36", name: "Brown Sacramento Oak" },
  { code: "H1143", surface_type: "ST36", name: "Grey Sacramento Oak" },
  { code: "H1145", surface_type: "ST10", name: "Natural Bardolino Oak" },
  { code: "H1176", surface_type: "ST37", name: "White Halifax Oak" },
  { code: "H1180", surface_type: "ST37", name: "Natural Halifax Oak" },
  { code: "H1181", surface_type: "ST37", name: "Tobacco Halifax Oak" },
  { code: "H1199", surface_type: "ST12", name: "Black-Brown Thermo Oak" },
  { code: "H1204", surface_type: "TM22", name: "Light Natural Lugano Ash" },
  { code: "H1223", surface_type: "ST19", name: "Sevilla Ash" },
  { code: "H1225", surface_type: "ST12", name: "Trondheim Ash" },
  { code: "H1227", surface_type: "TM12", name: "Brown Abano Ash" },
  { code: "H1228", surface_type: "TM12", name: "Anthracite Abano Ash" },
  { code: "H1242", surface_type: "ST10", name: "Natural Sheffield Acacia" },
  { code: "H1250", surface_type: "ST36", name: "Navarra Ash" },
  { code: "H1277", surface_type: "ST9", name: "Light Lakeland Acacia" },
  { code: "H1303", surface_type: "ST12", name: "Brown Belmont Oak" },
  { code: "H1307", surface_type: "ST19", name: "Brown Warmia Walnut" },
  { code: "H1312", surface_type: "ST10", name: "Sand Beige Whiteriver Oak" },
  { code: "H1313", surface_type: "ST10", name: "Grey Brown Whiteriver Oak" },
  { code: "H1318", surface_type: "ST10", name: "Natural Wild Oak" },
  { code: "H1330", surface_type: "ST10", name: "Vintage Santa Fe Oak" },
  { code: "H1344", surface_type: "ST32", name: "Cognac Brown Sherman Oak" },
  { code: "H1346", surface_type: "ST32", name: "Anthracite Sherman Oak" },
  { code: "H1357", surface_type: "ST10", name: "Grey Beige Spree Oak" },
  { code: "H1362", surface_type: "ST12", name: "Light Baronia Oak" },
  { code: "H1367", surface_type: "ST40", name: "Light Natural Casella Oak" },
  { code: "H1369", surface_type: "ST40", name: "Marone Casella Oak" },
  { code: "H1377", surface_type: "ST36", name: "Sand Orleans Oak" },
  { code: "H1379", surface_type: "ST36", name: "Brown Orleans Oak" },
  { code: "H1384", surface_type: "ST40", name: "White Casella Oak" },
  { code: "H1385", surface_type: "ST40", name: "Natural Casella Oak" },
  { code: "H1386", surface_type: "ST40", name: "Brown Casella Oak" },
  { code: "H1399", surface_type: "ST10", name: "Truffle Brown Denver Oak" },
  { code: "H1401", surface_type: "ST22", name: "Cascina Pine" },
  { code: "H1487", surface_type: "ST22", name: "Bramberg Pine" },
  { code: "H1636", surface_type: "ST12", name: "Locarno Cherry" },
  { code: "H1710", surface_type: "ST10", name: "Sand Kentucky Chestnut" },
  { code: "H1714", surface_type: "ST19", name: "Lincoln Walnut" },
  { code: "H1715", surface_type: "ST12", name: "Parona Walnut" },
  { code: "H1732", surface_type: "ST9", name: "Sand Birch" },
  { code: "H1910", surface_type: "ST9", name: "Willow Beech" },
  { code: "H2033", surface_type: "ST10", name: "Dark Hunton Oak" },
  { code: "H3003", surface_type: "ST19", name: "Norwich Oak" },
  { code: "H3012", surface_type: "ST22", name: "Coco Bolo" },
  { code: "H3041", surface_type: "TM12", name: "Natural Eucalyptus" },
  { code: "H3043", surface_type: "ST12", name: "Dark Brown Eucalyptus" },
  { code: "H3131", surface_type: "ST12", name: "Natural Davos Oak" },
  { code: "H3133", surface_type: "ST12", name: "Truffle Brown Davos Oak" },
  { code: "H3146", surface_type: "ST19", name: "Beige Grey Lorenzo Oak" },
  { code: "H3152", surface_type: "ST19", name: "Bleached Vicenza Oak" },
  { code: "H3154", surface_type: "ST36", name: "Dark Brown Charleston Oak" },
  { code: "H3156", surface_type: "ST12", name: "Grey Corbridge Oak" },
  { code: "H3157", surface_type: "ST12", name: "Vicenza Oak" },
  { code: "H3158", surface_type: "ST19", name: "Grey Vicenza Oak" },
  { code: "H3165", surface_type: "ST12", name: "Light Vicenza Oak" },
  { code: "H3170", surface_type: "ST12", name: "Natural Kendal Oak" },
  { code: "H3171", surface_type: "ST12", name: "Oiled Kendal Oak" },
  { code: "H3176", surface_type: "ST37", name: "Pewter Halifax Oak" },
  { code: "H3180", surface_type: "TM37", name: "Brown Halifax Oak" },
  { code: "H3190", surface_type: "ST19", name: "Anthracite Fineline Metallic" },
  { code: "H3195", surface_type: "ST19", name: "White Fineline" },
  { code: "H3197", surface_type: "ST19", name: "Medium Grey Fineline" },
  { code: "H3198", surface_type: "ST19", name: "Dark Grey Fineline" },
  { code: "H3303", surface_type: "ST10", name: "Natural Hamilton Oak" },
  { code: "H3309", surface_type: "ST28", name: "Sand Gladstone Oak" },
  { code: "H3311", surface_type: "ST28", name: "Bleached Cuneo Oak" },
  { code: "H3311", surface_type: "TM28", name: "Bleached Cuneo Oak" },
  { code: "H3317", surface_type: "ST28", name: "Brown Cuneo Oak" },
  { code: "H3325", surface_type: "ST28", name: "Tobacco Gladstone Oak" },
  { code: "H3326", surface_type: "ST28", name: "Grey-Beige Gladstone Oak" },
  { code: "H3331", surface_type: "ST10", name: "Natural Nebraska Oak" },
  { code: "H3332", surface_type: "ST10", name: "Grey Nebraska Oak" },
  { code: "H3342", surface_type: "TM28", name: "Sepia Gladstone Oak" },
  { code: "H3349", surface_type: "ST19", name: "Kaisersberg Oak" },
  { code: "H3359", surface_type: "ST32", name: "Light Natural Davenport Oak" },
  { code: "H3368", surface_type: "ST9", name: "Natural Lancaster Oak" },
  { code: "H3395", surface_type: "ST12", name: "Natural Corbridge Oak" },
  { code: "H3398", surface_type: "ST12", name: "Cognac Kendal Oak" },
  { code: "H3406", surface_type: "ST38", name: "Anthracite Mountain Larch" },
  { code: "H3408", surface_type: "ST38", name: "Thermo Brown Mountain Larch" },
  { code: "H3409", surface_type: "ST38", name: "Natural Mountain Larch" },
  { code: "H3430", surface_type: "ST22", name: "White Aland Pine" },
  { code: "H3433", surface_type: "ST22", name: "Polar Aland Pine" },
  { code: "H3450", surface_type: "ST22", name: "White Fleetwood" },
  { code: "H3700", surface_type: "ST10", name: "Natural Pacific Walnut" },
  { code: "H3702", surface_type: "ST10", name: "Tobacco Pacific Walnut" },
  { code: "H3710", surface_type: "ST12", name: "Natural Carini Walnut" },
  { code: "H3730", surface_type: "ST10", name: "Natural Hickory" },
  { code: "H3734", surface_type: "ST9", name: "Natural Dijon Walnut" },
  { code: "H3840", surface_type: "ST9", name: "Natural Mandal Maple" },
  { code: "H3860", surface_type: "ST9", name: "Champagne Hard Maple" },
  { code: "F186", surface_type: "ST9", name: "Light Grey Chicago Concrete" },
  { code: "F187", surface_type: "ST9", name: "Dark Grey Chicago Concrete" },
  { code: "F206", surface_type: "ST9", name: "Black Pietra Grigia" },
  { code: "F323", surface_type: "ST20", name: "Cobra Bronze" },
  { code: "F416", surface_type: "ST10", name: "Beige Textile" },
  { code: "F417", surface_type: "ST10", name: "Grey Textile" },
  { code: "F422", surface_type: "ST10", name: "White Linen" },
  { code: "F424", surface_type: "ST10", name: "Brown Linen" },
  { code: "F433", surface_type: "ST10", name: "Anthracite Linen" },
  { code: "F434", surface_type: "ST20", name: "Cubanite Steelbrush" },
  { code: "F500", surface_type: "ST20", name: "Metallic Inox" },
  { code: "F527", surface_type: "ST20", name: "Golden Brushed Metal" },
  { code: "F528", surface_type: "ST20", name: "Bronze Brushed Metal" },
  { code: "F637", surface_type: "ST10", name: "White Chromix" },
  { code: "F638", surface_type: "ST10", name: "Chromix Silver" },
  { code: "F685", surface_type: "ST10", name: "Acapulco" },
  { code: "F765", surface_type: "ST20", name: "Brushed Silvergrey" },
  { code: "F800", surface_type: "ST9", name: "Crystal Marble" },
  { code: "F812", surface_type: "ST9", name: "White Levanto Marble" },
  { code: "H8906", surface_type: "ST10", name: "Three Layer Thermo Brown" },
  { code: "H8911", surface_type: "ST10", name: "Multiplex Oak" },
  { code: "H8912", surface_type: "ST10", name: "Multiplex Walnut" },
  { code: "H8913", surface_type: "ST10", name: "Three Layer Mountain Larch" }
];

export default function MaterialsBatchUpload() {
  const [zipFile, setZipFile] = useState(null);
  const [supplierFolder, setSupplierFolder] = useState('');
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/zip') {
      setZipFile(file);
      setResult(null);
    } else {
      toast.error('Please select a valid ZIP file');
    }
  };

  const handleUpload = async () => {
    if (!zipFile || !supplierFolder) {
      toast.error('Please select a zip file and supplier folder');
      return;
    }

    setUploading(true);
    setResult(null);

    try {
      // Upload zip file first
      const { file_url } = await base44.integrations.Core.UploadFile({ file: zipFile });

      // Process zip with backend function
      const response = await base44.functions.invoke('uploadMaterialsZip', {
        zipFileUrl: file_url,
        supplierFolder,
        colorMappings: EGGER_COLORS
      });

      setResult(response.data);
      
      if (response.data.uploaded_count > 0) {
        toast.success(`Successfully uploaded ${response.data.uploaded_count} materials`);
      }
      
      if (response.data.errors?.length > 0) {
        toast.warning(`${response.data.errors.length} files had errors`);
      }
    } catch (error) {
      toast.error(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Materials Batch Upload</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="supplier">Supplier/Category</Label>
          <Select value={supplierFolder} onValueChange={setSupplierFolder}>
            <SelectTrigger>
              <SelectValue placeholder="Select supplier folder" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Egger Boards">Egger Boards</SelectItem>
              <SelectItem value="Handles">Handles</SelectItem>
              <SelectItem value="Door Styles">Door Styles</SelectItem>
              <SelectItem value="Vinyl Colours">Vinyl Colours</SelectItem>
              <SelectItem value="Worktops">Worktops</SelectItem>
              <SelectItem value="Accessories">Accessories</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="zipFile">Zip File (images named by code, e.g., W990.jpg)</Label>
          <Input
            id="zipFile"
            type="file"
            accept=".zip"
            onChange={handleFileSelect}
            disabled={uploading}
          />
          {zipFile && (
            <p className="text-sm text-muted-foreground mt-1">
              Selected: {zipFile.name} ({(zipFile.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}
        </div>

        <Button
          onClick={handleUpload}
          disabled={!zipFile || !supplierFolder || uploading}
          className="w-full"
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload Materials
            </>
          )}
        </Button>

        {result && (
          <div className="space-y-2 pt-4 border-t">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-medium">
                Uploaded {result.uploaded_count} materials
              </span>
            </div>
            
            {result.errors && result.errors.length > 0 && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-amber-600">
                  <AlertCircle className="h-5 w-5" />
                  <span className="font-medium">Errors:</span>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1 ml-7">
                  {result.errors.slice(0, 5).map((error, i) => (
                    <li key={i}>• {error}</li>
                  ))}
                  {result.errors.length > 5 && (
                    <li>...and {result.errors.length - 5} more</li>
                  )}
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="text-sm text-muted-foreground pt-4 border-t">
          <p className="font-medium mb-2">Requirements:</p>
          <ul className="space-y-1 ml-4">
            <li>• Image files named by code (e.g., W990.jpg, H1145.png)</li>
            <li>• Supported formats: JPG, PNG, WEBP, GIF</li>
            <li>• Max zip size: 50MB</li>
            <li>• Duplicate colors (different ST) will all be stored</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}