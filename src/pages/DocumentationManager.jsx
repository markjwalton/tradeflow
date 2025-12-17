import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { FileText, MessageSquare, Sparkles, Copy, Check, Archive, Send, Download } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { usePagination } from "@/components/common/usePagination";
import TailwindPagination from "@/components/sturij/TailwindPagination";

export default function DocumentationManager() {
  const [activeTab, setActiveTab] = useState("documents");
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedText, setSelectedText] = useState("");
  const [commentText, setCommentText] = useState("");
  const [commentSection, setCommentSection] = useState("");
  const [selectedComments, setSelectedComments] = useState([]);
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [showCommentBox, setShowCommentBox] = useState(false);
  
  const queryClient = useQueryClient();

  // Fetch documents
  const { data: documents = [] } = useQuery({
    queryKey: ['frameworkDocs'],
    queryFn: () => base44.entities.FrameworkDocument.filter({ status: 'published' }),
  });

  // Fetch comments
  const { data: comments = [] } = useQuery({
    queryKey: ['documentComments'],
    queryFn: () => base44.entities.DocumentComment.list(),
  });

  // Fetch discussion points
  const { data: discussions = [] } = useQuery({
    queryKey: ['discussionPoints'],
    queryFn: () => base44.entities.DiscussionPoint.list(),
  });

  // Get latest versions
  const latestDocs = documents.filter(doc => doc.is_latest);
  
  // Filter by category
  const filteredDocs = selectedCategory === "all" 
    ? latestDocs 
    : latestDocs.filter(doc => doc.category === selectedCategory);

  // Group by category
  const docsByCategory = latestDocs.reduce((acc, doc) => {
    if (!acc[doc.category]) acc[doc.category] = [];
    acc[doc.category].push(doc);
    return acc;
  }, {});

  // Comment mutations
  const createCommentMutation = useMutation({
    mutationFn: (data) => base44.entities.DocumentComment.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['documentComments']);
      setCommentText("");
      setSelectedText("");
      setCommentSection("");
      toast.success("Comment saved");
    },
  });

  const updateCommentMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.DocumentComment.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['documentComments']);
    },
  });

  // Handle text selection
  const handleTextSelection = () => {
    const selection = window.getSelection();
    const text = selection.toString().trim();
    if (text && selectedDoc) {
      setSelectedText(text);
      // Try to find the section heading
      const range = selection.getRangeAt(0);
      const container = range.commonAncestorContainer;
      const parent = container.parentElement;
      const heading = parent?.closest('h1, h2, h3, h4, h5, h6');
      setCommentSection(heading?.textContent || "General");
      
      // Pre-fill comment box
      setCommentText(`Comment: `);
      setShowCommentBox(true);
    }
  };

  // Save comment
  const handleSaveComment = (isDraft = false) => {
    if (!selectedDoc || !commentText) return;
    
    createCommentMutation.mutate({
      document_id: selectedDoc.id,
      document_title: selectedDoc.title,
      document_version: selectedDoc.version,
      selected_text: selectedText,
      section: commentSection,
      comment: commentText,
      status: isDraft ? "draft" : "submitted"
    });
    
    setShowCommentBox(false);
    setSelectedText("");
    setCommentSection("");
  };

  // Generate prompt from comments
  const handleGeneratePrompt = async () => {
    if (selectedComments.length === 0) {
      toast.error("Select comments to generate prompt");
      return;
    }

    const commentsList = selectedComments
      .map(id => comments.find(c => c.id === id))
      .filter(Boolean)
      .map(c => `- ${c.document_title} (v${c.document_version}) - ${c.section}:\n  "${c.selected_text}"\n  Change: ${c.comment}`)
      .join('\n\n');

    const prompt = `Please update the following framework documentation based on these change requests:\n\n${commentsList}\n\nEnsure all changes maintain consistency with the existing framework standards and update version numbers appropriately.`;
    
    setGeneratedPrompt(prompt);
    
    // Update comment statuses
    selectedComments.forEach(id => {
      updateCommentMutation.mutate({
        id,
        data: { status: "in_prompt", prompt_generated: true }
      });
    });
  };

  // Complete and archive
  const handleComplete = () => {
    selectedComments.forEach(id => {
      updateCommentMutation.mutate({
        id,
        data: { status: "archived" }
      });
    });
    setSelectedComments([]);
    setGeneratedPrompt("");
    toast.success("Comments archived");
  };

  // Discussion mutations
  const createDiscussionMutation = useMutation({
    mutationFn: (data) => base44.entities.DiscussionPoint.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['discussionPoints']);
      setDiscussionTitle("");
      setDiscussionContent("");
      setDiscussionRefType("general");
      setDiscussionCategory("");
      toast.success("Discussion point saved");
    },
  });

  const updateDiscussionMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.DiscussionPoint.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['discussionPoints']);
    },
  });

  // Handle discussion save
  const handleSaveDiscussion = (isDraft = false) => {
    if (!discussionTitle || !discussionContent) {
      toast.error("Title and content are required");
      return;
    }

    const data = {
      title: discussionTitle,
      content: discussionContent,
      reference_type: discussionRefType,
      status: isDraft ? "draft" : "submitted"
    };

    if (discussionRefType === "category" && discussionCategory) {
      data.category = discussionCategory;
      const categoryDoc = latestDocs.find(d => d.category === discussionCategory);
      if (categoryDoc) {
        data.document_id = categoryDoc.id;
        data.document_title = categoryDoc.title;
        data.document_version = categoryDoc.version;
      }
    }

    createDiscussionMutation.mutate(data);
  };

  // Generate discussion prompt
  const handleGenerateDiscussionPrompt = () => {
    if (selectedDiscussions.length === 0) {
      toast.error("Select discussion points to generate prompt");
      return;
    }

    const discussionsList = selectedDiscussions
      .map(id => discussions.find(d => d.id === id))
      .filter(Boolean)
      .map(d => {
        let ref = "";
        if (d.reference_type === "category" && d.document_title) {
          ref = `\nReference: ${d.document_title} (v${d.document_version}) - ${d.category}`;
        }
        return `### ${d.title}\n${d.content}${ref}`;
      })
      .join('\n\n');

    const prompt = `Please review and address these discussion points about the framework documentation:\n\n${discussionsList}\n\nProvide recommendations, clarifications, or updates to the documentation as needed.`;
    
    setDiscussionPrompt(prompt);
    
    selectedDiscussions.forEach(id => {
      updateDiscussionMutation.mutate({
        id,
        data: { status: "in_prompt" }
      });
    });
  };

  // Complete discussions
  const handleCompleteDiscussions = () => {
    selectedDiscussions.forEach(id => {
      updateDiscussionMutation.mutate({
        id,
        data: { status: "archived" }
      });
    });
    setSelectedDiscussions([]);
    setDiscussionPrompt("");
    toast.success("Discussion points archived");
  };

  // AI analyze changes
  const handleAnalyzeChanges = async () => {
    if (!selectedDoc || !selectedDoc.previous_version_id) {
      toast.error("No previous version to compare");
      return;
    }

    try {
      const prevDoc = documents.find(d => d.id === selectedDoc.previous_version_id);
      if (!prevDoc) return;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Compare these two document versions and highlight the key changes in a bullet-point summary:\n\nVersion ${prevDoc.version}:\n${prevDoc.content}\n\nVersion ${selectedDoc.version}:\n${selectedDoc.content}`,
        response_json_schema: {
          type: "object",
          properties: {
            changes: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  section: { type: "string" },
                  change_type: { type: "string" },
                  description: { type: "string" }
                }
              }
            }
          }
        }
      });

      return response.changes || [];
    } catch (e) {
      toast.error("Failed to analyze changes");
      return [];
    }
  };

  const [highlights, setHighlights] = useState([]);
  const [analyzing, setAnalyzing] = useState(false);
  
  // Discussion state
  const [discussionTitle, setDiscussionTitle] = useState("");
  const [discussionContent, setDiscussionContent] = useState("");
  const [discussionRefType, setDiscussionRefType] = useState("general");
  const [discussionCategory, setDiscussionCategory] = useState("");
  const [selectedDiscussions, setSelectedDiscussions] = useState([]);
  const [discussionPrompt, setDiscussionPrompt] = useState("");

  // Download document as markdown
  const handleDownload = (doc) => {
    const blob = new Blob([doc.content], { type: 'text/markdown' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${doc.title.replace(/[^a-z0-9]/gi, '_')}_v${doc.version}.md`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
    toast.success("Document downloaded");
  };

  const loadHighlights = async () => {
    setAnalyzing(true);
    const changes = await handleAnalyzeChanges();
    setHighlights(changes);
    setAnalyzing(false);
  };

  // Filter comments by status
  const draftComments = comments.filter(c => c.status === "draft");
  const submittedComments = comments.filter(c => c.status === "submitted" || c.status === "in_prompt");
  const archivedComments = comments.filter(c => c.status === "archived");
  
  // Get comments for current document
  const currentDocComments = selectedDoc 
    ? comments.filter(c => c.document_id === selectedDoc.id && c.status !== "archived")
    : [];

  // Filter discussions by status
  const draftDiscussions = discussions.filter(d => d.status === "draft");
  const submittedDiscussions = discussions.filter(d => d.status === "submitted" || d.status === "in_prompt");

  // Pagination for all documents view
  const {
    currentPage,
    totalPages,
    paginatedData: paginatedDocs = [],
    goToPage,
    nextPage,
    prevPage,
    canGoNext,
    canGoPrev,
    startIndex,
    endIndex,
    totalItems,
  } = usePagination(filteredDocs, 10);

  return (
    <div style={{ padding: 'var(--spacing-6)' }}>
      <div style={{ marginBottom: 'var(--spacing-6)' }}>
        <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Framework Documentation
        </h1>
        <p style={{ color: 'var(--text-muted)', marginTop: 'var(--spacing-2)' }}>
          Version-controlled documentation with change tracking
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="documents">
            <FileText className="w-4 h-4 mr-2" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="allDocuments">
            <FileText className="w-4 h-4 mr-2" />
            All Documents
          </TabsTrigger>
          <TabsTrigger value="changeControl">
            <MessageSquare className="w-4 h-4 mr-2" />
            Change Control
            {submittedComments.length > 0 && (
              <Badge variant="destructive" className="ml-2">{submittedComments.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="highlights">
            <Sparkles className="w-4 h-4 mr-2" />
            Highlights
          </TabsTrigger>
          <TabsTrigger value="discussion">
            <MessageSquare className="w-4 h-4 mr-2" />
            Discussion
            {submittedDiscussions.length > 0 && (
              <Badge variant="destructive" className="ml-2">{submittedDiscussions.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Documents Tab */}
        <TabsContent value="documents">
          <div className="grid grid-cols-12 gap-6">
            {/* Document List */}
            <div className="col-span-4">
              <div style={{ marginBottom: 'var(--spacing-4)' }}>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Developer Specification">Developer Specification</SelectItem>
                    <SelectItem value="AI Guidelines">AI Guidelines</SelectItem>
                    <SelectItem value="Technical Specification">Technical Specification</SelectItem>
                    <SelectItem value="Sprint Plan">Sprint Plan</SelectItem>
                    <SelectItem value="Architecture">Architecture</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                {Object.keys(docsByCategory).map(category => (
                  <div key={category}>
                    <h3 className="font-semibold text-sm" style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-2)' }}>
                      {category}
                    </h3>
                    {docsByCategory[category].map(doc => (
                      <Card 
                        key={doc.id}
                        className={`cursor-pointer hover:shadow-md transition-shadow ${selectedDoc?.id === doc.id ? 'ring-2 ring-primary' : ''}`}
                        style={{ marginBottom: 'var(--spacing-2)' }}
                      >
                        <CardHeader className="p-4" onClick={() => setSelectedDoc(doc)}>
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-sm">{doc.title}</CardTitle>
                            <div className="flex items-center gap-2">
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDownload(doc);
                                }}
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                              <Badge variant="outline">v{doc.version}</Badge>
                            </div>
                          </div>
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Document Viewer */}
            <div className="col-span-8">
              {selectedDoc ? (
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{selectedDoc.title}</CardTitle>
                        <CardDescription>Version {selectedDoc.version}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {!showCommentBox && (
                      <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>
                        Select text to add a comment
                      </p>
                    )}

                    {showCommentBox && (
                      <div style={{ 
                        marginBottom: 'var(--spacing-6)', 
                        padding: 'var(--spacing-4)', 
                        backgroundColor: 'var(--color-accent-50)', 
                        borderRadius: 'var(--radius-lg)',
                        border: '2px solid var(--color-primary)'
                      }}>
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="text-xs font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
                              {selectedDoc.title} v{selectedDoc.version} • {commentSection}
                            </p>
                          </div>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => {
                              setShowCommentBox(false);
                              setSelectedText("");
                              setCommentText("");
                            }}
                          >
                            ✕
                          </Button>
                        </div>
                        <p className="text-sm italic mb-3 p-3 rounded" style={{ 
                          backgroundColor: 'var(--color-background)',
                          color: 'var(--color-text-body)',
                          borderLeft: '3px solid var(--color-primary)'
                        }}>
                          "{selectedText}"
                        </p>
                        <Textarea
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          rows={4}
                          placeholder="Add your comment..."
                          autoFocus
                        />
                        <div className="flex gap-2 mt-3">
                          <Button onClick={() => handleSaveComment(true)} variant="outline" size="sm">
                            Save Draft
                          </Button>
                          <Button onClick={() => handleSaveComment(false)} size="sm">
                            <Send className="w-4 h-4 mr-2" />
                            Submit
                          </Button>
                        </div>
                      </div>
                    )}

                    <div 
                      className="prose prose-sm max-w-none"
                      onMouseUp={handleTextSelection}
                      style={{ 
                        userSelect: 'text',
                        fontFamily: 'var(--font-family-body)',
                        lineHeight: 'var(--leading-relaxed)',
                        color: 'var(--color-text-body)',
                        opacity: showCommentBox ? 0.4 : 1,
                        pointerEvents: showCommentBox ? 'none' : 'auto'
                      }}
                    >
                      <ReactMarkdown
                        components={{
                          h1: ({ children }) => <h1 id={`section-${String(children).toLowerCase().replace(/\s+/g, '-')}`} style={{ fontFamily: 'var(--font-family-display)', fontSize: 'var(--text-3xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text-primary)', marginTop: 'var(--spacing-8)', marginBottom: 'var(--spacing-4)' }}>{children}</h1>,
                          h2: ({ children }) => <h2 style={{ fontFamily: 'var(--font-family-display)', fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-primary)', marginTop: 'var(--spacing-6)', marginBottom: 'var(--spacing-3)' }}>{children}</h2>,
                          h3: ({ children }) => <h3 style={{ fontFamily: 'var(--font-family-display)', fontSize: 'var(--text-xl)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-secondary)', marginTop: 'var(--spacing-4)', marginBottom: 'var(--spacing-2)' }}>{children}</h3>,
                          p: ({ children }) => <p style={{ marginTop: 'var(--spacing-3)', marginBottom: 'var(--spacing-3)' }}>{children}</p>,
                          ul: ({ children }) => <ul style={{ marginLeft: 'var(--spacing-6)', marginTop: 'var(--spacing-2)', marginBottom: 'var(--spacing-2)' }}>{children}</ul>,
                          ol: ({ children }) => <ol style={{ marginLeft: 'var(--spacing-6)', marginTop: 'var(--spacing-2)', marginBottom: 'var(--spacing-2)' }}>{children}</ol>,
                          li: ({ children }) => <li style={{ marginTop: 'var(--spacing-2)', marginBottom: 'var(--spacing-2)' }}>{children}</li>,
                          code: ({ inline, children }) => inline ? 
                            <code style={{ backgroundColor: 'var(--color-muted)', padding: '2px 6px', borderRadius: 'var(--radius-sm)', fontSize: 'var(--text-sm)', fontFamily: 'var(--font-family-mono)' }}>{children}</code> :
                            <code style={{ display: 'block', backgroundColor: 'var(--color-muted)', padding: 'var(--spacing-4)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)', fontFamily: 'var(--font-family-mono)', overflowX: 'auto' }}>{children}</code>,
                          blockquote: ({ children }) => <blockquote style={{ borderLeft: '4px solid var(--color-primary)', paddingLeft: 'var(--spacing-4)', marginLeft: '0', marginTop: 'var(--spacing-4)', marginBottom: 'var(--spacing-4)', fontStyle: 'italic', color: 'var(--color-text-muted)' }}>{children}</blockquote>,
                        }}
                      >
                        {selectedDoc.content}
                      </ReactMarkdown>
                    </div>

                    {/* Existing Comments on Document */}
                    {currentDocComments.length > 0 && !showCommentBox && (
                      <div style={{ marginTop: 'var(--spacing-6)', padding: 'var(--spacing-4)', backgroundColor: 'var(--color-muted)', borderRadius: 'var(--radius-lg)' }}>
                        <h4 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>
                          Comments on this Document ({currentDocComments.length})
                        </h4>
                        <div className="space-y-2">
                          {currentDocComments.map(comment => (
                            <div 
                              key={comment.id}
                              className="p-3 rounded cursor-pointer hover:bg-white/50 transition-colors"
                              onClick={() => setActiveTab("changeControl")}
                              style={{ 
                                backgroundColor: 'var(--color-background)',
                                borderLeft: '3px solid var(--color-primary)'
                              }}
                            >
                              <div className="flex justify-between items-start mb-1">
                                <p className="text-xs font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
                                  {comment.section}
                                </p>
                                <Badge variant="outline" className="text-xs">{comment.status}</Badge>
                              </div>
                              <p className="text-xs italic mb-2" style={{ color: 'var(--color-text-muted)' }}>
                                "{comment.selected_text}"
                              </p>
                              <p className="text-xs" style={{ color: 'var(--color-text-body)' }}>
                                {comment.comment}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="flex items-center justify-center" style={{ padding: 'var(--spacing-16)' }}>
                    <p style={{ color: 'var(--text-muted)' }}>Select a document to view</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* All Documents Tab */}
        <TabsContent value="allDocuments">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>All Documents</CardTitle>
                  <CardDescription>Browse and download all framework documents</CardDescription>
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Developer Specification">Developer Specification</SelectItem>
                    <SelectItem value="AI Guidelines">AI Guidelines</SelectItem>
                    <SelectItem value="Technical Specification">Technical Specification</SelectItem>
                    <SelectItem value="Sprint Plan">Sprint Plan</SelectItem>
                    <SelectItem value="Architecture">Architecture</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div style={{ marginBottom: 'var(--spacing-4)' }}>
                <TailwindPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={goToPage}
                  onNextPage={nextPage}
                  onPrevPage={prevPage}
                  canGoNext={canGoNext}
                  canGoPrev={canGoPrev}
                  startIndex={startIndex}
                  endIndex={endIndex}
                  totalItems={totalItems}
                />
              </div>

              <div className="space-y-3">
                {paginatedDocs.map(doc => (
                  <Card key={doc.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                              {doc.title}
                            </h3>
                            <Badge variant="outline">v{doc.version}</Badge>
                            <Badge>{doc.category}</Badge>
                          </div>
                          {doc.change_summary && (
                            <p className="text-sm" style={{ color: 'var(--color-text-muted)', marginTop: 'var(--spacing-2)' }}>
                              {doc.change_summary}
                            </p>
                          )}
                          <p className="text-xs" style={{ color: 'var(--color-text-subtle)', marginTop: 'var(--spacing-2)' }}>
                            Updated: {new Date(doc.updated_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedDoc(doc);
                              setActiveTab("documents");
                            }}
                          >
                            <FileText className="w-4 h-4 mr-2" />
                            View
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => handleDownload(doc)}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div style={{ marginTop: 'var(--spacing-4)' }}>
                <TailwindPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={goToPage}
                  onNextPage={nextPage}
                  onPrevPage={prevPage}
                  canGoNext={canGoNext}
                  canGoPrev={canGoPrev}
                  startIndex={startIndex}
                  endIndex={endIndex}
                  totalItems={totalItems}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Change Control Tab */}
        <TabsContent value="changeControl">
          <div className="space-y-6">
            {/* Action List */}
            <Card>
              <CardHeader>
                <CardTitle>Submitted Changes</CardTitle>
                <CardDescription>Select items to generate update prompt</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {submittedComments.map(comment => (
                    <Card 
                      key={comment.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => {
                        setSelectedComments(prev => 
                          prev.includes(comment.id) 
                            ? prev.filter(id => id !== comment.id)
                            : [...prev, comment.id]
                        );
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <input 
                            type="checkbox" 
                            checked={selectedComments.includes(comment.id)}
                            readOnly
                          />
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-semibold text-sm">{comment.document_title}</p>
                                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                  v{comment.document_version} • {comment.section}
                                </p>
                              </div>
                              <Badge>{comment.priority}</Badge>
                            </div>
                            {comment.selected_text && (
                              <p className="text-sm italic mt-2" style={{ color: 'var(--text-body)' }}>
                                "{comment.selected_text}"
                              </p>
                            )}
                            <p className="text-sm mt-2">{comment.comment}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="flex gap-2" style={{ marginTop: 'var(--spacing-4)' }}>
                  <Button 
                    onClick={handleGeneratePrompt}
                    disabled={selectedComments.length === 0}
                  >
                    Generate Prompt
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Generated Prompt */}
            {generatedPrompt && (
              <Card>
                <CardHeader>
                  <CardTitle>Generated Update Prompt</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea value={generatedPrompt} readOnly rows={10} />
                  <div className="flex gap-2" style={{ marginTop: 'var(--spacing-4)' }}>
                    <Button 
                      onClick={() => {
                        navigator.clipboard.writeText(generatedPrompt);
                        toast.success("Copied to clipboard");
                      }}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Prompt
                    </Button>
                    <Button onClick={handleComplete}>
                      <Check className="w-4 h-4 mr-2" />
                      Mark Complete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Drafts */}
            {draftComments.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Drafts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {draftComments.map(comment => (
                      <Card key={comment.id}>
                        <CardContent className="p-4">
                          <p className="font-semibold text-sm">{comment.document_title} (v{comment.document_version})</p>
                          <p className="text-sm mt-2">{comment.comment}</p>
                          <Button 
                            size="sm" 
                            className="mt-2"
                            onClick={() => updateCommentMutation.mutate({ id: comment.id, data: { status: "submitted" } })}
                          >
                            Submit
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Highlights Tab */}
        <TabsContent value="highlights">
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-4">
              <div className="space-y-2">
                {latestDocs.map(doc => (
                  <Card 
                    key={doc.id}
                    className={`cursor-pointer hover:shadow-md transition-shadow ${selectedDoc?.id === doc.id ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => {
                      setSelectedDoc(doc);
                      setHighlights([]);
                    }}
                  >
                    <CardHeader className="p-4">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-sm">{doc.title}</CardTitle>
                        <Badge variant="outline">v{doc.version}</Badge>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>

            <div className="col-span-8">
              {selectedDoc ? (
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{selectedDoc.title}</CardTitle>
                        <CardDescription>Changes since v{selectedDoc.previous_version_id ? "previous" : "initial"}</CardDescription>
                      </div>
                      <Button onClick={loadHighlights} disabled={analyzing}>
                        <Sparkles className="w-4 h-4 mr-2" />
                        {analyzing ? "Analyzing..." : "Analyze Changes"}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {highlights.length > 0 ? (
                      <div className="space-y-4">
                        {highlights.map((change, idx) => (
                          <div 
                            key={idx}
                            style={{ 
                              padding: 'var(--spacing-4)', 
                              backgroundColor: 'var(--color-muted)', 
                              borderRadius: 'var(--radius-md)',
                              cursor: 'pointer'
                            }}
                            onClick={handleTextSelection}
                          >
                            <div className="flex justify-between items-start">
                              <p className="font-semibold text-sm">{change.section}</p>
                              <Badge>{change.change_type}</Badge>
                            </div>
                            <p className="text-sm mt-2">{change.description}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ color: 'var(--text-muted)' }}>
                        Click "Analyze Changes" to see what's new
                      </p>
                    )}

                    {commentText && (
                      <div style={{ marginTop: 'var(--spacing-6)', padding: 'var(--spacing-4)', backgroundColor: 'var(--color-muted)', borderRadius: 'var(--radius-lg)' }}>
                        <Textarea
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          rows={6}
                        />
                        <div className="flex gap-2" style={{ marginTop: 'var(--spacing-4)' }}>
                          <Button onClick={() => handleSaveComment(true)} variant="outline">
                            Save Draft
                          </Button>
                          <Button onClick={() => handleSaveComment(false)}>
                            Submit
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="flex items-center justify-center" style={{ padding: 'var(--spacing-16)' }}>
                    <p style={{ color: 'var(--text-muted)' }}>Select a document to analyze changes</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Discussion Tab */}
        <TabsContent value="discussion">
          <div className="space-y-6">
            {/* Create Discussion Point */}
            <Card>
              <CardHeader>
                <CardTitle>New Discussion Point</CardTitle>
                <CardDescription>Start a discussion about the framework documentation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Title</label>
                  <input
                    type="text"
                    value={discussionTitle}
                    onChange={(e) => setDiscussionTitle(e.target.value)}
                    placeholder="Discussion topic..."
                    className="w-full px-3 py-2 border rounded-md"
                    style={{ borderColor: 'var(--color-border)' }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Reference Type</label>
                  <Select value={discussionRefType} onValueChange={setDiscussionRefType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General Discussion</SelectItem>
                      <SelectItem value="category">Category Reference</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {discussionRefType === "category" && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Category</label>
                    <Select value={discussionCategory} onValueChange={setDiscussionCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Developer Specification">Developer Specification</SelectItem>
                        <SelectItem value="AI Guidelines">AI Guidelines</SelectItem>
                        <SelectItem value="Technical Specification">Technical Specification</SelectItem>
                        <SelectItem value="Sprint Plan">Sprint Plan</SelectItem>
                        <SelectItem value="Architecture">Architecture</SelectItem>
                      </SelectContent>
                    </Select>
                    {discussionCategory && (
                      <p className="text-xs mt-2" style={{ color: 'var(--color-text-muted)' }}>
                        Latest: {latestDocs.find(d => d.category === discussionCategory)?.title} 
                        {" v"}{latestDocs.find(d => d.category === discussionCategory)?.version}
                      </p>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-2">Discussion Content</label>
                  <Textarea
                    value={discussionContent}
                    onChange={(e) => setDiscussionContent(e.target.value)}
                    rows={8}
                    placeholder="Describe the topic, questions, or issues to discuss..."
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={() => handleSaveDiscussion(true)} variant="outline">
                    Save Draft
                  </Button>
                  <Button onClick={() => handleSaveDiscussion(false)}>
                    <Send className="w-4 h-4 mr-2" />
                    Submit
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Submitted Discussions */}
            {submittedDiscussions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Active Discussions</CardTitle>
                  <CardDescription>Select items to generate discussion prompt</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {submittedDiscussions.map(disc => (
                      <Card 
                        key={disc.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => {
                          setSelectedDiscussions(prev => 
                            prev.includes(disc.id) 
                              ? prev.filter(id => id !== disc.id)
                              : [...prev, disc.id]
                          );
                        }}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <input 
                              type="checkbox" 
                              checked={selectedDiscussions.includes(disc.id)}
                              readOnly
                            />
                            <div className="flex-1">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-semibold text-sm">{disc.title}</p>
                                  <div className="flex gap-2 mt-1">
                                    <Badge variant="outline">{disc.reference_type}</Badge>
                                    {disc.category && <Badge>{disc.category}</Badge>}
                                  </div>
                                  {disc.document_title && (
                                    <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                                      Ref: {disc.document_title} (v{disc.document_version})
                                    </p>
                                  )}
                                </div>
                              </div>
                              <p className="text-sm mt-2">{disc.content}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <div className="flex gap-2" style={{ marginTop: 'var(--spacing-4)' }}>
                    <Button 
                      onClick={handleGenerateDiscussionPrompt}
                      disabled={selectedDiscussions.length === 0}
                    >
                      Generate Prompt
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Generated Discussion Prompt */}
            {discussionPrompt && (
              <Card>
                <CardHeader>
                  <CardTitle>Generated Discussion Prompt</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea value={discussionPrompt} readOnly rows={12} />
                  <div className="flex gap-2" style={{ marginTop: 'var(--spacing-4)' }}>
                    <Button 
                      onClick={() => {
                        navigator.clipboard.writeText(discussionPrompt);
                        toast.success("Copied to clipboard");
                      }}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Prompt
                    </Button>
                    <Button onClick={handleCompleteDiscussions}>
                      <Check className="w-4 h-4 mr-2" />
                      Mark Complete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Draft Discussions */}
            {draftDiscussions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Draft Discussions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {draftDiscussions.map(disc => (
                      <Card key={disc.id}>
                        <CardContent className="p-4">
                          <p className="font-semibold text-sm">{disc.title}</p>
                          <Badge variant="outline" className="mt-1">{disc.reference_type}</Badge>
                          {disc.category && <Badge className="ml-2">{disc.category}</Badge>}
                          <p className="text-sm mt-2">{disc.content}</p>
                          <Button 
                            size="sm" 
                            className="mt-2"
                            onClick={() => updateDiscussionMutation.mutate({ id: disc.id, data: { status: "submitted" } })}
                          >
                            Submit
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}