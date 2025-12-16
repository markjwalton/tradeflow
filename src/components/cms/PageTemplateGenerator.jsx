import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Wand2, FileText, Eye, Download } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function PageTemplateGenerator() {
  const queryClient = useQueryClient();
  const [selectedPage, setSelectedPage] = useState("");
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState(null);

  // Fetch website folders
  const { data: folders = [] } = useQuery({
    queryKey: ["websiteFolders"],
    queryFn: () => base44.entities.WebsiteFolder.list(),
  });

  // Available template pages (from NavigationManager's list)
  const templatePages = [
    "RadiantHome", "KeynoteHome", "PocketHome", "StudioHome", "CommitHome",
    "CompassHome", "SyntaxHome", "TransmitHome"
  ];

  // Analyze page mutation
  const analyzeMutation = useMutation({
    mutationFn: async (pageSlug) => {
      const response = await base44.functions.invoke('analyzePageTemplate', {
        page_slug: pageSlug
      });
      return response.data;
    },
    onSuccess: (data) => {
      setAnalysisResult(data);
      toast.success(`Found ${data.total_blocks} editable blocks`);
    },
    onError: (error) => {
      toast.error("Analysis failed: " + error.message);
    }
  });

  // Generate template mutation
  const generateMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('generateEditableTemplate', {
        page_slug: selectedPage,
        editable_blocks: analysisResult.analysis.editable_blocks,
        website_folder_id: selectedFolder
      });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["cmsPages"] });
      toast.success("Template generated successfully!");
      setShowPreview(true);
    },
    onError: (error) => {
      toast.error("Generation failed: " + error.message);
    }
  });

  const handleAnalyze = () => {
    if (!selectedPage) {
      toast.error("Select a page first");
      return;
    }
    setAnalysisResult(null);
    analyzeMutation.mutate(selectedPage);
  };

  const handleGenerate = () => {
    if (!analysisResult) {
      toast.error("Analyze the page first");
      return;
    }
    generateMutation.mutate();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Page Template Generator</CardTitle>
          <CardDescription>
            Automatically identify editable text blocks in website templates and generate CMS-ready versions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Page Selection */}
          <div className="space-y-2">
            <Label>Select Page Template</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {templatePages.map(page => (
                <Button
                  key={page}
                  variant={selectedPage === page ? "default" : "outline"}
                  className="w-full"
                  onClick={() => {
                    setSelectedPage(page);
                    setAnalysisResult(null);
                  }}
                >
                  {page.replace(/([A-Z])/g, ' $1').trim()}
                </Button>
              ))}
            </div>
          </div>

          {/* Folder Selection */}
          <div className="space-y-2">
            <Label>Target Website Folder (Optional)</Label>
            <select
              className="w-full rounded-md border border-input bg-background px-3 py-2"
              value={selectedFolder || ""}
              onChange={(e) => setSelectedFolder(e.target.value || null)}
            >
              <option value="">Global Template</option>
              {folders.map(folder => (
                <option key={folder.id} value={folder.id}>
                  {folder.name}
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              onClick={handleAnalyze}
              disabled={!selectedPage || analyzeMutation.isPending}
              className="flex-1"
            >
              {analyzeMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" />
                  Analyze Page
                </>
              )}
            </Button>

            {analysisResult && (
              <Button
                onClick={handleGenerate}
                disabled={generateMutation.isPending}
                variant="default"
                className="flex-1"
              >
                {generateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Generate Template
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysisResult && (
        <Card>
          <CardHeader>
            <CardTitle>Analysis Results</CardTitle>
            <CardDescription>
              {analysisResult.total_blocks} editable blocks identified
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {analysisResult.analysis.editable_blocks?.map((block, idx) => (
                  <div
                    key={idx}
                    className="p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{block.content_type}</Badge>
                        <span className="text-sm font-mono text-muted-foreground">
                          {block.key}
                        </span>
                      </div>
                      <Badge>{block.field_type}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {block.location}
                    </p>
                    <p className="text-sm line-clamp-2">
                      {block.current_text}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      {block.char_count} characters
                    </span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Template Generated</DialogTitle>
            <DialogDescription>
              Your template has been created and saved to CMS
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1">
                <Eye className="mr-2 h-4 w-4" />
                View in CMS
              </Button>
              <Button variant="outline" className="flex-1">
                <Download className="mr-2 h-4 w-4" />
                Download Code
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}