import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/sturij/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Plus, ChevronDown, Upload, MessageSquare } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function PageBuildWorkspace() {
  const urlParams = new URLSearchParams(window.location.search);
  const pageId = urlParams.get("page");
  
  const [newSectionDialogOpen, setNewSectionDialogOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState(null);
  const [openSections, setOpenSections] = useState({});
  const [newSection, setNewSection] = useState({ section_name: "" });
  const [uploadingFiles, setUploadingFiles] = useState(false);

  const queryClient = useQueryClient();

  const { data: page } = useQuery({
    queryKey: ['pageBuild', pageId],
    queryFn: () => base44.entities.PageBuild.filter({ id: pageId }).then(r => r[0]),
    enabled: !!pageId
  });

  const { data: sections = [] } = useQuery({
    queryKey: ['pageBuildSections', pageId],
    queryFn: () => base44.entities.PageBuildSection.filter({ page_build_id: pageId }),
    enabled: !!pageId
  });

  const createSectionMutation = useMutation({
    mutationFn: (sectionData) => base44.entities.PageBuildSection.create({
      page_build_id: pageId,
      order: sections.length + 1,
      ...sectionData
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pageBuildSections', pageId] });
      setNewSectionDialogOpen(false);
      setNewSection({ section_name: "" });
    }
  });

  const updateSectionMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.PageBuildSection.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pageBuildSections', pageId] });
      setUploadDialogOpen(false);
      setFeedbackDialogOpen(false);
      setSelectedSection(null);
    }
  });

  const handleCreateSection = (e) => {
    e.preventDefault();
    createSectionMutation.mutate(newSection);
  };

  const handleFileUpload = async (e, type) => {
    const files = Array.from(e.target.files);
    if (!files.length || !selectedSection) return;

    setUploadingFiles(true);
    try {
      const uploadPromises = files.map(file => 
        base44.integrations.Core.UploadFile({ file })
      );
      const results = await Promise.all(uploadPromises);
      const fileUrls = results.map(r => r.file_url);

      const fieldName = type === 'concept' ? 'concept_files' : 'asset_files';
      const existingFiles = selectedSection[fieldName] || [];

      await updateSectionMutation.mutateAsync({
        id: selectedSection.id,
        data: {
          [fieldName]: [...existingFiles, ...fileUrls],
          status: type === 'concept' ? 'concept' : 'assets_uploaded'
        }
      });
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploadingFiles(false);
    }
  };

  const toggleSection = (sectionId) => {
    setOpenSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  const getStatusColor = (status) => {
    const colors = {
      'concept': 'bg-gray-100 text-gray-800',
      'feedback_given': 'bg-blue-100 text-blue-800',
      'assets_uploaded': 'bg-yellow-100 text-yellow-800',
      'built': 'bg-purple-100 text-purple-800',
      'complete': 'bg-green-100 text-green-800'
    };
    return colors[status] || colors['concept'];
  };

  const sortedSections = [...sections].sort((a, b) => a.order - b.order);

  if (!pageId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)]">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-[var(--color-text-primary)] mb-2">No Page Selected</h2>
          <p className="text-[var(--color-text-secondary)]">Please select a page from the Page Builder.</p>
        </div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[var(--color-primary)] border-r-transparent mb-4"></div>
          <p className="text-[var(--color-text-secondary)]">Loading page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title={page.name}
        description={page.intent_description}
      >
        <Button onClick={() => setNewSectionDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Section
        </Button>
      </PageHeader>

      <Dialog open={newSectionDialogOpen} onOpenChange={setNewSectionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Section</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateSection} className="space-y-4">
            <div>
              <Label>Section Name</Label>
              <Input
                value={newSection.section_name}
                onChange={(e) => setNewSection({ section_name: e.target.value })}
                placeholder="e.g., Hero Section, Features Grid"
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setNewSectionDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Add Section</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Files</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Upload Concept Files</Label>
              <p className="text-sm text-muted-foreground mb-2">Wireframes, PSDs, design files, briefings</p>
              <Input
                type="file"
                multiple
                onChange={(e) => handleFileUpload(e, 'concept')}
                disabled={uploadingFiles}
              />
            </div>
            <div>
              <Label>Upload Final Assets</Label>
              <p className="text-sm text-muted-foreground mb-2">Optimized images, icons, cut-out assets</p>
              <Input
                type="file"
                multiple
                onChange={(e) => handleFileUpload(e, 'asset')}
                disabled={uploadingFiles}
              />
            </div>
            {uploadingFiles && <p className="text-sm text-blue-600">Uploading...</p>}
          </div>
        </DialogContent>
      </Dialog>

      <div className="space-y-4">
        {sortedSections.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">No sections yet. Add your first section to begin.</p>
              <Button onClick={() => setNewSectionDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Section
              </Button>
            </CardContent>
          </Card>
        ) : (
          sortedSections.map((section) => (
            <Collapsible 
              key={section.id}
              open={openSections[section.id]}
              onOpenChange={() => toggleSection(section.id)}
            >
              <Card>
                <CollapsibleTrigger className="w-full">
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-semibold text-muted-foreground">#{section.order}</span>
                        <CardTitle size="default">{section.section_name}</CardTitle>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={getStatusColor(section.status)}>
                          {section.status.replace('_', ' ')}
                        </Badge>
                        <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${openSections[section.id] ? 'rotate-180' : ''}`} />
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Concept Files</h4>
                        {section.concept_files?.length > 0 ? (
                          <div className="space-y-1">
                            {section.concept_files.map((url, idx) => (
                              <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline block">
                                File {idx + 1}
                              </a>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">No files uploaded</p>
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Final Assets</h4>
                        {section.asset_files?.length > 0 ? (
                          <div className="space-y-1">
                            {section.asset_files.map((url, idx) => (
                              <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline block">
                                Asset {idx + 1}
                              </a>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">No assets uploaded</p>
                        )}
                      </div>
                    </div>

                    {section.ai_feedback && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-medium mb-2 text-blue-900">AI Technical Guidance</h4>
                        <p className="text-sm text-blue-800 whitespace-pre-wrap">{section.ai_feedback}</p>
                      </div>
                    )}

                    {section.animation_code && (
                      <div>
                        <h4 className="font-medium mb-2">Animation Code</h4>
                        <pre className="bg-gray-50 border rounded-lg p-4 text-sm overflow-x-auto">
                          {section.animation_code}
                        </pre>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          setSelectedSection(section);
                          setUploadDialogOpen(true);
                        }}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Files
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          const feedback = prompt('Paste AI feedback / technical specs:');
                          if (feedback) {
                            updateSectionMutation.mutate({
                              id: section.id,
                              data: { ai_feedback: feedback, status: 'feedback_given' }
                            });
                          }
                        }}
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Add AI Feedback
                      </Button>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          ))
        )}
      </div>
    </div>
  );
}