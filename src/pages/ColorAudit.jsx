import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, CheckCircle2, Search, Loader2, FileText } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function ColorAudit() {
  const [allFiles, setAllFiles] = useState([]);
  const [fileStatuses, setFileStatuses] = useState({});
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");
  const [currentViewBatch, setCurrentViewBatch] = useState(0);
  const batchSize = 20;

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke('auditHexColors', { mode: 'list' });
      setAllFiles(response.data.files || []);
    } catch (e) {
      console.error("Failed to load files:", e);
    }
    setLoading(false);
  };

  const scanBatch = async (startIdx, endIdx) => {
    const batchFiles = allFiles.slice(startIdx, endIdx);
    setScanning(true);
    
    try {
      const response = await base44.functions.invoke('auditHexColors', { 
        mode: 'scan', 
        files: batchFiles 
      });
      
      if (response.data.results) {
        const newStatuses = {};
        response.data.results.forEach(result => {
          newStatuses[result.file] = {
            scanned: true,
            hex_count: result.hex_count,
            hex_matches: result.hex_matches,
            has_oklch: result.has_oklch
          };
        });
        setFileStatuses(prev => ({ ...prev, ...newStatuses }));
      }
    } catch (e) {
      console.error("Scan failed:", e);
    }
    
    setScanning(false);
  };

  const scanNextBatch = () => {
    const unscannedFiles = allFiles.filter(f => !fileStatuses[f]);
    if (unscannedFiles.length === 0) return;
    
    const startIdx = allFiles.indexOf(unscannedFiles[0]);
    const endIdx = Math.min(startIdx + batchSize, allFiles.length);
    scanBatch(startIdx, endIdx);
  };

  const filteredFiles = allFiles.filter(f => 
    f.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const scannedFiles = filteredFiles.filter(f => fileStatuses[f]?.scanned);
  const unscannedFiles = filteredFiles.filter(f => !fileStatuses[f]?.scanned);
  const filesWithIssues = scannedFiles.filter(f => fileStatuses[f]?.hex_count > 0);
  const cleanFiles = scannedFiles.filter(f => fileStatuses[f]?.hex_count === 0);

  const scannedCount = Object.keys(fileStatuses).length;
  const progress = allFiles.length > 0 ? (scannedCount / allFiles.length) * 100 : 0;

  const displayFiles = filteredFiles.slice(
    currentViewBatch * 20,
    (currentViewBatch + 1) * 20
  );
  const totalViewBatches = Math.ceil(filteredFiles.length / 20);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-display">Hardcoded HEX Color Audit</h1>
        <p className="text-muted-foreground mt-1">
          Scan all pages and components for hardcoded HEX values
        </p>
      </div>

      {loading ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p className="text-muted-foreground">Loading files...</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Total Files</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{allFiles.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Scanned</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">{scannedCount}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-destructive" />
                  With HEX
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-destructive">{filesWithIssues.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                  Clean
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-success">{cleanFiles.length}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="flex gap-2">
                <Button 
                  onClick={scanNextBatch} 
                  disabled={scanning || unscannedFiles.length === 0} 
                  className="flex-1"
                >
                  {scanning ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Scanning...
                    </>
                  ) : (
                    `Scan Next ${Math.min(batchSize, unscannedFiles.length)} Files`
                  )}
                </Button>
                <Button 
                  onClick={() => {
                    setFileStatuses({});
                    setCurrentViewBatch(0);
                  }} 
                  variant="outline"
                  disabled={scannedCount === 0}
                >
                  Reset
                </Button>
              </div>
              
              <div className="space-y-2">
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-center text-muted-foreground">
                  {scannedCount} / {allFiles.length} files scanned ({Math.round(progress)}%)
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Search Files</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Search className="h-4 w-4 text-muted-foreground mt-3" />
                <Input
                  placeholder="Filter by filename..."
                  value={searchFilter}
                  onChange={(e) => {
                    setSearchFilter(e.target.value);
                    setCurrentViewBatch(0);
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {allFiles.length > 0 && (
            <>
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">
                  All Files (Showing {displayFiles.length} of {filteredFiles.length})
                </h2>
                {totalViewBatches > 1 && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentViewBatch(Math.max(0, currentViewBatch - 1))}
                      disabled={currentViewBatch === 0}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentViewBatch(Math.min(totalViewBatches - 1, currentViewBatch + 1))}
                      disabled={currentViewBatch >= totalViewBatches - 1}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </div>

              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    {displayFiles.map((file, idx) => {
                      const status = fileStatuses[file];
                      return (
                        <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3 flex-1">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="font-mono text-sm">{file}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {!status && (
                              <Badge variant="outline">Not Scanned</Badge>
                            )}
                            {status?.scanned && status.hex_count === 0 && (
                              <Badge className="bg-success text-success-foreground">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Clean
                              </Badge>
                            )}
                            {status?.scanned && status.hex_count > 0 && (
                              <Badge variant="destructive">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                {status.hex_count} HEX
                              </Badge>
                            )}
                            {status?.has_oklch && (
                              <Badge variant="outline">OKLCH</Badge>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {filesWithIssues.length > 0 && (
            <Card className="border-destructive/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-destructive" />
                  Files with HEX Values ({filesWithIssues.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {filesWithIssues.map((file, idx) => {
                  const status = fileStatuses[file];
                  return (
                    <div key={idx} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <p className="font-mono text-sm font-semibold">{file}</p>
                          <Badge variant="destructive">{status.hex_count} HEX references</Badge>
                        </div>
                      </div>
                      {status.hex_matches.map((match, i) => (
                        <div key={i} className="p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-8 h-8 rounded border"
                              style={{ backgroundColor: match.hex }}
                            />
                            <div className="flex-1 space-y-1">
                              <p className="font-mono text-sm">{match.hex}</p>
                              <p className="text-xs text-muted-foreground">Line {match.line}</p>
                            </div>
                          </div>
                          <pre className="mt-2 p-2 bg-background rounded text-xs font-mono overflow-x-auto">
                            {match.context}
                          </pre>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}