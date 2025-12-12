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

// Helper to extract color name from token
const getColorNameFromToken = (token) => {
  if (!token) return "Unknown";
  const match = token.match(/--color-(\w+)/);
  return match ? match[1].charAt(0).toUpperCase() + match[1].slice(1) : "Unknown";
};

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
  const [selectedColor, setSelectedColor] = useState(null);
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
        // Filter to only colors with token mappings
        const withTokens = parsed.filter(item => item.recommended_token);
        setMappingData(withTokens);
        if (withTokens.length > 0 && !selectedColor) {
          setSelectedColor(withTokens[0]);
        }
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

  const colors = mappingData || [];
  const displayCounts = actualCounts || colors.reduce((acc, c) => ({ ...acc, [c.literal]: c.count }), {});
  const totalOccurrences = Object.values(displayCounts).reduce((sum, count) => sum + count, 0);
  const migratedOccurrences = colors.reduce((sum, c) => {
    return sum + (c.count - (displayCounts[c.literal] || 0));
  }, 0);
  const progress = totalOccurrences > 0 ? (migratedOccurrences / colors.reduce((sum, c) => sum + c.count, 0)) * 100 : 0;

  const handleMigrateColor = async (colorLiteral) => {
    setMigrating(true);
    setMigrationResults(null);
    
    try {
      const color = colors.find(c => c.literal === colorLiteral);
      const response = await base44.functions.invoke('migrateColors', {
        colorHex: color.literal,
        token: color.recommended_replacement,
        files: affectedFiles
      });

      if (response.data?.success) {
        const updated = [...migratedColors, colorLiteral];
        setMigratedColors(updated);
        setMigrationResults(response.data);
        
        // Save completed task to database
        await base44.entities.ColorMigrationTask.create({
          source_file: `Support Files/phase-2/artifacts/${selectedMappingFile}`,
          color_hex: color.literal,
          token: color.recommended_replacement,
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
    if (!confirm(`Migrate all ${colors.length} colors? This will modify files across your project.`)) {
      return;
    }
    
    setMigrating(true);
    setMigrationResults(null);
    
    try {
      let totalChanges = 0;
      for (const color of colors) {
        if (!migratedColors.includes(color.literal)) {
          const response = await base44.functions.invoke('migrateColors', {
            colorHex: color.literal,
            token: color.recommended_replacement,
            files: affectedFiles
          });
          if (response.data?.success) {
            totalChanges += response.data.totalChanges || 0;
            
            await base44.entities.ColorMigrationTask.create({
              source_file: `Support Files/phase-2/artifacts/${selectedMappingFile}`,
              color_hex: color.literal,
              token: color.recommended_replacement,
              count: color.count,
              status: 'completed',
              completed_date: new Date().toISOString(),
              files_changed: response.data.results.length,
              total_changes: response.data.totalChanges
            });
          }
        }
      }
      
      const allColors = colors.map(c => c.literal);
      setMigratedColors(allColors);
      alert(`All colors migrated! ${totalChanges} total changes.`);
      await handleScanFiles();
      await loadCompletedTasks();
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
      
      for (const color of colors) {
        counts[color.literal] = 0;
      }

      for (const filePath of affectedFiles) {
        try {
          const response = await base44.functions.invoke('readFileContent', {
            file_path: filePath
          });
          
          if (response.data?.content) {
            const content = response.data.content;
            let fileTotal = 0;
            
            for (const color of colors) {
              const regex = new RegExp(color.literal.replace('#', '#?'), 'gi');
              const matches = content.match(regex) || [];
              counts[color.literal] += matches.length;
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
            {loadingMapping ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {colors.slice(0, 10).map((color) => {
                  const currentCount = displayCounts[color.literal] || 0;
                  const isMigrated = currentCount === 0;
                  const colorName = getColorNameFromToken(color.recommended_token);
                  return (
                    <div
                      key={color.literal}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        isMigrated
                          ? "border-green-500 bg-green-50"
                          : "border-border bg-card"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div
                          className="w-8 h-8 rounded-full border-2"
                          style={{ backgroundColor: color.literal }}
                        />
                        {isMigrated ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-orange-500" />
                        )}
                      </div>
                      <p className="font-medium text-sm">{colorName}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {actualCounts ? `${currentCount} remaining` : `${color.count} instances`}
                      </p>
                    </div>
                  );
                })}
                </div>
                )}
                </CardContent>
                </Card>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Color List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Colors to Migrate ({colors.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-[600px] overflow-y-auto">
              {loadingMapping ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : colors.length === 0 ? (
                <p className="text-center text-muted-foreground p-8">No colors with token mappings found</p>
              ) : (
                colors.map((color) => {
                  const currentCount = displayCounts[color.literal] || 0;
                  const isMigrated = actualCounts ? currentCount === 0 : migratedColors.includes(color.literal);
                  const isSelected = selectedColor?.literal === color.literal;
                  const colorName = getColorNameFromToken(color.recommended_token);
                  return (
                    <button
                      key={color.literal}
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
                          style={{ backgroundColor: color.literal }}
                        />
                        <div className="flex-1">
                          <p className="font-medium">{colorName}</p>
                          <p className="text-xs text-muted-foreground">
                            {color.literal}
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
                          {color.recommended_token}
                        </code>
                      </div>
                    </button>
                  );
                })
              )}
            </CardContent>
          </Card>

          {/* Preview & Migration Panel */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Migration Details</CardTitle>
                  <CardDescription>
                    {selectedColor ? `Review and apply changes for ${getColorNameFromToken(selectedColor.recommended_token)}` : 'Select a color to begin'}
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
              {!selectedColor ? (
                <div className="text-center py-12">
                  <Palette className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Select a color from the list to see migration details</p>
                </div>
              ) : (
                <>
                  {/* Color Info */}
                  <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                    <div
                      className="w-16 h-16 rounded-lg border-2"
                      style={{ backgroundColor: selectedColor.literal }}
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold">{getColorNameFromToken(selectedColor.recommended_token)}</h3>
                      <p className="text-sm text-muted-foreground">
                        Hardcoded: <code className="bg-background px-2 py-1 rounded">{selectedColor.literal}</code>
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Token: <code className="bg-background px-2 py-1 rounded">{selectedColor.recommended_replacement}</code>
                      </p>
                    </div>
                  </div>

                  {/* Affected Files from Samples */}
                  <div>
                    <h3 className="font-semibold mb-3">Affected Files (from mapping data)</h3>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {selectedColor.samples && selectedColor.samples.length > 0 ? (
                        selectedColor.samples.slice(0, 10).map((sample, idx) => (
                          <div
                            key={idx}
                            className="p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                          >
                            <p className="font-mono text-sm mb-1">{sample.file}</p>
                            <p className="text-xs text-muted-foreground">Line {sample.line}</p>
                            <code className="text-xs bg-muted px-2 py-1 rounded block mt-2 overflow-x-auto">
                              {sample.snippet}
                            </code>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No sample files available
                        </p>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Preview Mode */}
              {isPreviewMode && selectedColor && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Preview: This will replace {selectedColor.count} instances of{" "}
                    <code className="bg-background px-2 py-1 rounded">{selectedColor.literal}</code> with{" "}
                    <code className="bg-background px-2 py-1 rounded">{selectedColor.recommended_replacement}</code>
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
              {selectedColor && (
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    onClick={() => handleMigrateColor(selectedColor.literal)}
                    disabled={!selectedColor || migratedColors.includes(selectedColor.literal) || migrating}
                    className="flex-1"
                  >
                    {migrating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Migrating...
                      </>
                    ) : migratedColors.includes(selectedColor.literal) ? (
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
                  <Button variant="outline" onClick={handleMigrateAll} disabled={migrating || colors.length === 0}>
                    {migrating ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-2" />
                    )}
                    Migrate All
                  </Button>
                </div>
              )}
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
        {progress === 100 && colors.length > 0 && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>Phase 2 Complete!</strong> All {colors.length} colors with token mappings have been migrated.
              Ready for Phase 3: Validation and cleanup.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}