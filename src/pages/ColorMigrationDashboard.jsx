import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { base44 } from "@/api/base44Client";
import { 
  Palette, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  Play,
  RefreshCw,
  ArrowRight,
  Loader2
} from "lucide-react";

// Top 4 colors data from artifacts
const TOP_COLORS = [
  {
    name: "Primary (Sage Green)",
    hex: "#4A5D4E",
    token: "--primary-500",
    occurrences: 19,
    category: "primary",
    status: "pending"
  },
  {
    name: "Secondary (Warm Copper)",
    hex: "#D4A574",
    token: "--secondary-400",
    occurrences: 8,
    category: "secondary",
    status: "pending"
  },
  {
    name: "Accent (Dusty Rose)",
    hex: "#d9b4a7",
    token: "--accent-300",
    occurrences: 12,
    category: "accent",
    status: "pending"
  },
  {
    name: "Background (Cream)",
    hex: "#f5f3ef",
    token: "--background-100",
    occurrences: 6,
    category: "background",
    status: "pending"
  }
];

// Sample affected files
const AFFECTED_FILES = [
  { path: "globals.css", changes: 12 },
  { path: "components/ui/card.jsx", changes: 8 },
  { path: "components/ui/button.jsx", changes: 6 },
  { path: "Layout.js", changes: 5 },
  { path: "pages/Dashboard.js", changes: 4 },
  { path: "components/library/Cards.jsx", changes: 3 },
  { path: "components/library/Buttons.jsx", changes: 2 }
];

export default function ColorMigrationDashboard() {
  const [selectedColor, setSelectedColor] = useState(TOP_COLORS[0]);
  const [migratedColors, setMigratedColors] = useState(() => {
    const saved = localStorage.getItem('migratedColors');
    return saved ? JSON.parse(saved) : [];
  });
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [migrating, setMigrating] = useState(false);
  const [migrationResults, setMigrationResults] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [actualCounts, setActualCounts] = useState(null);
  const [fileDetails, setFileDetails] = useState(null);

  const displayCounts = actualCounts || TOP_COLORS.reduce((acc, c) => ({ ...acc, [c.hex]: c.occurrences }), {});
  const totalOccurrences = Object.values(displayCounts).reduce((sum, count) => sum + count, 0);
  const migratedOccurrences = TOP_COLORS.reduce((sum, c) => {
    return sum + (c.occurrences - (displayCounts[c.hex] || 0));
  }, 0);
  const progress = totalOccurrences > 0 ? (migratedOccurrences / TOP_COLORS.reduce((sum, c) => sum + c.occurrences, 0)) * 100 : 0;

  const handleMigrateColor = async (colorHex) => {
    setMigrating(true);
    setMigrationResults(null);
    
    try {
      const color = TOP_COLORS.find(c => c.hex === colorHex);
      const response = await base44.functions.invoke('migrateColors', {
        colorHex: color.hex,
        token: color.token,
        files: AFFECTED_FILES.map(f => f.path)
      });

      if (response.data?.success) {
        const updated = [...migratedColors, colorHex];
        setMigratedColors(updated);
        localStorage.setItem('migratedColors', JSON.stringify(updated));
        setMigrationResults(response.data);
      }
    } catch (error) {
      console.error('Migration error:', error);
      alert('Migration failed: ' + error.message);
    } finally {
      setMigrating(false);
    }
  };

  const handleMigrateAll = async () => {
    setMigrating(true);
    setMigrationResults(null);
    
    try {
      for (const color of TOP_COLORS) {
        if (!migratedColors.includes(color.hex)) {
          await base44.functions.invoke('migrateColors', {
            colorHex: color.hex,
            token: color.token,
            files: AFFECTED_FILES.map(f => f.path)
          });
        }
      }
      
      const allColors = TOP_COLORS.map(c => c.hex);
      setMigratedColors(allColors);
      localStorage.setItem('migratedColors', JSON.stringify(allColors));
      alert('All colors migrated successfully!');
    } catch (error) {
      console.error('Migration error:', error);
      alert('Migration failed: ' + error.message);
    } finally {
      setMigrating(false);
    }
  };

  const handleReset = () => {
    if (confirm('Reset all migration progress? This will NOT undo file changes.')) {
      setMigratedColors([]);
      setMigrationResults(null);
      localStorage.removeItem('migratedColors');
    }
  };

  const handleScanFiles = async () => {
    setScanning(true);
    try {
      const counts = {};
      const details = [];
      
      for (const color of TOP_COLORS) {
        counts[color.hex] = 0;
      }

      for (const file of AFFECTED_FILES) {
        try {
          const response = await base44.functions.invoke('readFileContent', {
            file_path: file.path
          });
          
          if (response.data?.content) {
            const content = response.data.content.toLowerCase();
            let fileTotal = 0;
            
            for (const color of TOP_COLORS) {
              const hexLower = color.hex.toLowerCase();
              const regex = new RegExp(hexLower.replace('#', '#?'), 'gi');
              const matches = content.match(regex) || [];
              counts[color.hex] += matches.length;
              fileTotal += matches.length;
            }
            
            details.push({ path: file.path, changes: fileTotal });
          }
        } catch (error) {
          console.error(`Error reading ${file.path}:`, error);
        }
      }
      
      setActualCounts(counts);
      setFileDetails(details.filter(f => f.changes > 0));
    } catch (error) {
      console.error('Scan error:', error);
      alert('Failed to scan files: ' + error.message);
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-background">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Palette className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">Color Migration Dashboard</h1>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleScanFiles} disabled={scanning}>
                {scanning ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Scanning...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Scan Files
                  </>
                )}
              </Button>
              <Button variant="outline" size="sm" onClick={handleReset}>
                Reset Progress
              </Button>
            </div>
          </div>
          <p className="text-muted-foreground">
            Migrate hardcoded colors to design tokens for better maintainability
          </p>
        </div>

        {/* Progress Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Migration Progress</CardTitle>
            <CardDescription>
              {actualCounts ? (
                <>
                  {totalOccurrences} hardcoded color instances remaining in files
                  {totalOccurrences === 0 && " ✓ All migrated!"}
                </>
              ) : (
                `${migratedOccurrences} of ${totalOccurrences} color instances migrated (estimated)`
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={progress} className="h-2" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {TOP_COLORS.map((color) => {
                const currentCount = displayCounts[color.hex] || 0;
                const isMigrated = currentCount === 0;
                return (
                  <div
                    key={color.hex}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      isMigrated
                        ? "border-green-500 bg-green-50"
                        : "border-border bg-card"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div
                        className="w-8 h-8 rounded-full border-2"
                        style={{ backgroundColor: color.hex }}
                      />
                      {isMigrated ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-orange-500" />
                      )}
                    </div>
                    <p className="font-medium text-sm">{color.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {actualCounts ? `${currentCount} remaining` : `${color.occurrences} instances`}
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Color List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Colors to Migrate</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {TOP_COLORS.map((color) => {
                const currentCount = displayCounts[color.hex] || 0;
                const isMigrated = actualCounts ? currentCount === 0 : migratedColors.includes(color.hex);
                const isSelected = selectedColor.hex === color.hex;
                return (
                  <button
                    key={color.hex}
                    onClick={() => setSelectedColor(color)}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    } ${isMigrated ? "opacity-60" : ""}`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className="w-10 h-10 rounded-full border-2"
                        style={{ backgroundColor: color.hex }}
                      />
                      <div className="flex-1">
                        <p className="font-medium">{color.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {color.hex}
                        </p>
                      </div>
                      {isMigrated && (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">
                        {actualCounts ? `${currentCount} remaining` : `${color.occurrences} uses`}
                      </Badge>
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {color.token}
                      </code>
                    </div>
                  </button>
                );
              })}
            </CardContent>
          </Card>

          {/* Preview & Migration Panel */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Migration Details</CardTitle>
                  <CardDescription>
                    Review and apply changes for {selectedColor.name}
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsPreviewMode(!isPreviewMode)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {isPreviewMode ? "Hide" : "Show"} Preview
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Color Info */}
              <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                <div
                  className="w-16 h-16 rounded-lg border-2"
                  style={{ backgroundColor: selectedColor.hex }}
                />
                <div className="flex-1">
                  <h3 className="font-semibold">{selectedColor.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Hardcoded: <code className="bg-background px-2 py-1 rounded">{selectedColor.hex}</code>
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Token: <code className="bg-background px-2 py-1 rounded">{selectedColor.token}</code>
                  </p>
                </div>
              </div>

              {/* Affected Files */}
              <div>
                <h3 className="font-semibold mb-3">Affected Files</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {(fileDetails || AFFECTED_FILES).length > 0 ? (
                    (fileDetails || AFFECTED_FILES).map((file) => (
                      <div
                        key={file.path}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <div>
                          <p className="font-mono text-sm">{file.path}</p>
                        </div>
                        <Badge variant="secondary">
                          {file.changes} {fileDetails ? 'remaining' : 'changes'}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No hardcoded colors found! All migrated ✓
                    </p>
                  )}
                </div>
              </div>

              {/* Preview Mode */}
              {isPreviewMode && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Preview: This will replace {selectedColor.occurrences} instances of{" "}
                    <code className="bg-background px-2 py-1 rounded">{selectedColor.hex}</code> with{" "}
                    <code className="bg-background px-2 py-1 rounded">var({selectedColor.token})</code>
                  </AlertDescription>
                </Alert>
              )}

              {/* Migration Results */}
              {migrationResults && (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Successfully migrated {migrationResults.totalChanges} instances across {migrationResults.results.length} files!
                  </AlertDescription>
                </Alert>
              )}

              {/* Migration Actions */}
              <div className="flex gap-2 pt-4 border-t">
                <Button
                  onClick={() => handleMigrateColor(selectedColor.hex)}
                  disabled={migratedColors.includes(selectedColor.hex) || migrating}
                  className="flex-1"
                >
                  {migrating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Migrating...
                    </>
                  ) : migratedColors.includes(selectedColor.hex) ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Migrated
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Migrate This Color
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={handleMigrateAll} disabled={migrating}>
                  {migrating ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  Migrate All
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Next Steps */}
        {progress === 100 && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>Migration Complete!</strong> All top 4 colors have been migrated to design tokens.
              You can now proceed with the remaining 41 colors in the codebase.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}