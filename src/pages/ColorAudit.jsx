import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, CheckCircle2, Search, Code, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function ColorAudit() {
  const [auditResults, setAuditResults] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [currentBatch, setCurrentBatch] = useState(0);
  const [searchFilter, setSearchFilter] = useState("");
  const [progress, setProgress] = useState(0);
  const [totalFiles, setTotalFiles] = useState(0);
  const [processedFiles, setProcessedFiles] = useState(0);
  const batchSize = 10;

  const scanFiles = async () => {
    setScanning(true);
    setAuditResults([]);
    setProgress(0);
    setTotalFiles(0);
    setProcessedFiles(0);
    
    let batch = 0;
    let hasMore = true;
    let allResults = [];
    
    try {
      while (hasMore) {
        const response = await base44.functions.invoke('auditHexColors', { batch, batchSize: 20 });
        
        if (response.data.results) {
          allResults = [...allResults, ...response.data.results];
          setAuditResults(allResults);
        }
        
        setTotalFiles(response.data.totalFiles || 0);
        setProcessedFiles(response.data.processedFiles || 0);
        setProgress(response.data.totalFiles > 0 ? (response.data.processedFiles / response.data.totalFiles) * 100 : 0);
        
        hasMore = response.data.hasMore;
        batch++;
      }
    } catch (e) {
      console.error("Scan failed:", e);
    }
    
    setScanning(false);
  };

  const filteredResults = auditResults.filter(r => 
    r.file.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const filesWithIssues = filteredResults.filter(r => r.hex_count > 0);
  const cleanFiles = filteredResults.filter(r => r.hex_count === 0);

  const currentBatchResults = filesWithIssues.slice(
    currentBatch * batchSize,
    (currentBatch + 1) * batchSize
  );

  const totalBatches = Math.ceil(filesWithIssues.length / batchSize);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-display">Hardcoded HEX Color Audit</h1>
        <p className="text-muted-foreground mt-1">
          Scan all pages and components for hardcoded HEX values
        </p>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <Button onClick={scanFiles} disabled={scanning} className="w-full">
            {scanning ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Scanning {processedFiles} / {totalFiles} files...
              </>
            ) : (
              "Start Audit Scan"
            )}
          </Button>
          
          {scanning && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-center text-muted-foreground">
                {Math.round(progress)}% complete
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {auditResults.length > 0 && (
        <>
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Total Files</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{auditResults.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-destructive" />
                  Files with HEX
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
                  Clean Files
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-success">{cleanFiles.length}</div>
              </CardContent>
            </Card>
          </div>

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
                  onChange={(e) => setSearchFilter(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {filesWithIssues.length > 0 && (
            <>
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">
                  Files with Hardcoded HEX (Batch {currentBatch + 1} of {totalBatches})
                </h2>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentBatch(Math.max(0, currentBatch - 1))}
                    disabled={currentBatch === 0}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentBatch(Math.min(totalBatches - 1, currentBatch + 1))}
                    disabled={currentBatch >= totalBatches - 1}
                  >
                    Next
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                {currentBatchResults.map((result, idx) => (
                  <Card key={idx} className="border-destructive/20">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-base font-mono">{result.file}</CardTitle>
                          <div className="flex gap-2">
                            <Badge variant="destructive">{result.hex_count} HEX references</Badge>
                            {result.has_oklch && <Badge variant="outline">Has OKLCH</Badge>}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {result.hex_matches.map((match, i) => (
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
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}

          {cleanFiles.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                  Clean Files ({cleanFiles.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2">
                  {cleanFiles.map((result, idx) => (
                    <Badge key={idx} variant="outline" className="justify-start truncate">
                      {result.file}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}