import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { base44 } from "@/api/base44Client";
import { 
  Palette, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  Play,
  RefreshCw,
  ArrowRight,
  Loader2,
  FileJson
} from "lucide-react";

// Complete color mapping from Phase 2 artifacts (45 colors with token mappings)
const ALL_COLORS = [
  { hex: "#4A5D4E", token: "var(--color-primary)", count: 19, name: "Primary" },
  { hex: "#d9b4a7", token: "var(--color-accent)", count: 12, name: "Accent" },
  { hex: "#3b82f6", token: null, count: 12, name: "Blue" },
  { hex: "#1b2a35", token: "var(--color-midnight)", count: 10, name: "Midnight" },
  { hex: "#8b5b5b", token: "var(--color-destructive)", count: 9, name: "Destructive" },
  { hex: "#D4A574", token: "var(--color-secondary)", count: 8, name: "Secondary" },
  { hex: "#3b3b3b", token: "var(--color-charcoal)", count: 6, name: "Charcoal" },
  { hex: "#f5f3ef", token: "var(--color-background)", count: 6, name: "Background" },
  { hex: "#4a5d4e", token: "var(--color-primary)", count: 5, name: "Primary (lowercase)" },
  { hex: "#d4a574", token: "var(--color-secondary)", count: 5, name: "Secondary (lowercase)" },
  { hex: "#fca5a5", token: null, count: 4, name: "Red Light" },
  { hex: "#60a5fa", token: null, count: 4, name: "Blue Light" },
  { hex: "#34d399", token: null, count: 4, name: "Green Light" },
  { hex: "#f59e0b", token: null, count: 4, name: "Amber" },
  { hex: "#8b4513", token: null, count: 3, name: "Saddle Brown" },
  { hex: "#e0e0e0", token: null, count: 3, name: "Gray Light" },
  { hex: "#ffffff", token: null, count: 2, name: "White" },
  { hex: "#000000", token: null, count: 2, name: "Black" },
  { hex: "#ef4444", token: null, count: 2, name: "Red" },
  { hex: "#10b981", token: null, count: 2, name: "Green" },
  { hex: "#f97316", token: null, count: 2, name: "Orange" }
].filter(c => c.token !== null); // Only show colors with token mappings

// Get all unique file paths from actual project scan
const getAffectedFiles = () => {
  // This will be populated by the scan function
  return [
    "globals.css", "Layout.js", "components/ui/card.jsx", "components/ui/button.jsx",
    "pages/Dashboard.js", "pages/ColorMigrationDashboard.js", "components/library/Cards.jsx",
    "components/library/Buttons.jsx", "components/library/Forms.jsx", "components/library/Typography.jsx"
  ];
};

export default function ColorMigrationDashboard() {
  const [selectedColor, setSelectedColor] = useState(ALL_COLORS[0]);
  const [migratedColors, setMigratedColors] = useState([]);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [migrating, setMigrating] = useState(false);
  const [migrationResults, setMigrationResults] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [actualCounts, setActualCounts] = useState(null);
  const [fileDetails, setFileDetails] = useState(null);
  const [affectedFiles, setAffectedFiles] = useState(getAffectedFiles());
  const [selectedMappingFile, setSelectedMappingFile] = useState("color-to-token-mapping-updated.json");
  const [loadingMapping, setLoadingMapping] = useState(false);
  const [mappingData, setMappingData] = useState(null);
  const [completedTasks, setCompletedTasks] = useState([]);

  // Load mapping file on mount and when selection changes
  useEffect(() => {
    loadMappingFile();
    loadCompletedTasks();
  }, [selectedMappingFile]);

  const loadMappingFile = async () => {
    setLoadingMapping(true);
    try {
      const response = await base44.functions.invoke('githubApi', {
        action: 'get_file',
        path: `Support Files/phase-2/artifacts/${selectedMappingFile}`
      });
      
      if (response.data?.content) {
        const parsed = JSON.parse(response.data.content);
        setMappingData(parsed);
      }
    } catch (error) {
      console.error('Error loading mapping file:', error);
    } finally {
      setLoadingMapping(false);
    }
  };

  const loadCompletedTasks = async () => {
    try {
      const tasks = await base44.entities.ColorMigrationTask.filter({
        source_file: `Support Files/phase-2/artifacts/${selectedMappingFile}`
      });
      setCompletedTasks(tasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  const displayCounts = actualCounts || ALL_COLORS.reduce((acc, c) => ({ ...acc, [c.hex]: c.count }), {});
  const totalOccurrences = Object.values(displayCounts).reduce((sum, count) => sum + count, 0);
  const migratedOccurrences = ALL_COLORS.reduce((sum, c) => {
    return sum + (c.count - (displayCounts[c.hex] || 0));
  }, 0);
  const progress = totalOccurrences > 0 ? (migratedOccurrences / ALL_COLORS.reduce((sum, c) => sum + c.count, 0)) * 100 : 0;

  const handleMigrateColor = async (colorHex) => {
    setMigrating(true);
    setMigrationResults(null);
    
    try {
      const color = ALL_COLORS.find(c => c.hex === colorHex);
      const response = await base44.functions.invoke('migrateColors', {
        colorHex: color.hex,
        token: color.token,
        files: affectedFiles
      });

      if (response.data?.success) {
        const updated = [...migratedColors, colorHex];
        setMigratedColors(updated);
        setMigrationResults(response.data);
        
        // Save completed task to database
        await base44.entities.ColorMigrationTask.create({
          source_file: `Support Files/phase-2/artifacts/${selectedMappingFile}`,
          color_hex: color.hex,
          token: color.token,
          count: color.count,
          status: 'completed',
          completed_date: new Date().toISOString(),
          files_changed: response.data.results.length,
          total_changes: response.data.totalChanges
        });
        
        // Refresh
        await handleScanFiles();
        await loadCompletedTasks();
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
      let totalChanges = 0;
      for (const color of ALL_COLORS) {
        if (!migratedColors.includes(color.hex)) {
          const response = await base44.functions.invoke('migrateColors', {
            colorHex: color.hex,
            token: color.token,
            files: affectedFiles
          });
          if (response.data?.success) {
            totalChanges += response.data.totalChanges || 0;
          }
        }
      }
      
      const allColors = ALL_COLORS.map(c => c.hex);
      setMigratedColors(allColors);
      alert(`All colors migrated! ${totalChanges} total changes across ${affectedFiles.length} files.`);
      await handleScanFiles();
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
    }
  };

  const handleScanFiles = async () => {
    setScanning(true);
    try {
      const counts = {};
      const details = [];
      
      for (const color of ALL_COLORS) {
        counts[color.hex] = 0;
      }

      for (const filePath of affectedFiles) {
        try {
          const response = await base44.functions.invoke('readFileContent', {
            file_path: filePath
          });
          
          if (response.data?.content) {
            const content = response.data.content;
            let fileTotal = 0;
            
            for (const color of ALL_COLORS) {
              const regex = new RegExp(color.hex.replace('#', '#?'), 'gi');
              const matches = content.match(regex) || [];
              counts[color.hex] += matches.length;
              fileTotal += matches.length;
            }
            
            if (fileTotal > 0) {
              details.push({ path: filePath, changes: fileTotal });
            }
          }
        } catch (error) {
          console.error(`Error reading ${filePath}:`, error);
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
              <Select value={selectedMappingFile} onValueChange={setSelectedMappingFile}>
                <SelectTrigger className="w-[280px]">
                  <div className="flex items-center gap-2">
                    <FileJson className="h-4 w-4" />
                    <SelectValue placeholder="Select mapping file" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="color-to-token-mapping-updated.json">
                    Updated Mapping (Phase 2)
                  </SelectItem>
                  <SelectItem value="color-scan-updated.json">
                    Color Scan Data
                  </SelectItem>
                </SelectContent>
              </Select>
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
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {ALL_COLORS.slice(0, 10).map((color) => {
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
                      {actualCounts ? `${currentCount} remaining` : `${color.count} instances`}
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
              <CardTitle>Colors to Migrate ({ALL_COLORS.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-[600px] overflow-y-auto">
              {ALL_COLORS.map((color) => {
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
                        {actualCounts ? `${currentCount} remaining` : `${color.count} uses`}
                      </Badge>
                      <code className="text-xs bg-muted px-2 py-1 rounded text-[10px]">
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
                  {(fileDetails && fileDetails.length > 0) ? (
                    fileDetails.map((file) => (
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
                    Preview: This will replace {selectedColor.count} instances of{" "}
                    <code className="bg-background px-2 py-1 rounded">{selectedColor.hex}</code> with{" "}
                    <code className="bg-background px-2 py-1 rounded">{selectedColor.token}</code>
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

        {/* Completed Tasks Summary */}
        {completedTasks.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Completed Migrations</CardTitle>
              <CardDescription>
                {completedTasks.length} color{completedTasks.length !== 1 ? 's' : ''} successfully migrated from {selectedMappingFile}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {completedTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-3 border rounded-lg bg-green-50 border-green-200"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full border-2"
                        style={{ backgroundColor: task.color_hex }}
                      />
                      <div>
                        <p className="font-medium text-sm">{task.color_hex}</p>
                        <p className="text-xs text-muted-foreground">{task.token}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="bg-white">
                        {task.total_changes} changes
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(task.completed_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Next Steps */}
        {progress === 100 && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>Phase 2 Complete!</strong> All {ALL_COLORS.length} colors with token mappings have been migrated.
              Ready for Phase 3: Validation and cleanup.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}