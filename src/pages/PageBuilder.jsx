import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createPageUrl } from "@/utils";
import { PageHeader } from "@/components/sturij/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function PageBuilder() {
  const [newPageDialogOpen, setNewPageDialogOpen] = useState(false);
  const [selectedPage, setSelectedPage] = useState(null);
  const [newPage, setNewPage] = useState({
    name: "",
    intent_description: ""
  });

  const queryClient = useQueryClient();

  const { data: pages = [], isLoading } = useQuery({
    queryKey: ['pageBuilds'],
    queryFn: () => base44.entities.PageBuild.list('-created_date'),
  });

  const createPageMutation = useMutation({
    mutationFn: (pageData) => base44.entities.PageBuild.create(pageData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pageBuilds'] });
      setNewPageDialogOpen(false);
      setNewPage({ name: "", intent_description: "" });
    }
  });

  const handleCreatePage = (e) => {
    e.preventDefault();
    createPageMutation.mutate(newPage);
  };

  const getStatusColor = (status) => {
    const colors = {
      'draft': 'bg-gray-100 text-gray-800',
      'in_progress': 'bg-blue-100 text-blue-800',
      'review': 'bg-yellow-100 text-yellow-800',
      'complete': 'bg-green-100 text-green-800'
    };
    return colors[status] || colors['draft'];
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Page Builder"
        description="Systematic page build workflow with design uploads and AI guidance"
      >
        <Button onClick={() => setNewPageDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Page Build
        </Button>
      </PageHeader>

      <Dialog open={newPageDialogOpen} onOpenChange={setNewPageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Page Build</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreatePage} className="space-y-4">
            <div>
              <Label>Page Name</Label>
              <Input
                value={newPage.name}
                onChange={(e) => setNewPage({ ...newPage, name: e.target.value })}
                placeholder="e.g., Landing Page, Product Showcase"
                required
              />
            </div>
            <div>
              <Label>Intent & Description</Label>
              <Textarea
                value={newPage.intent_description}
                onChange={(e) => setNewPage({ ...newPage, intent_description: e.target.value })}
                placeholder="Describe the purpose and goals of this page..."
                rows={4}
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setNewPageDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Page</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <p>Loading pages...</p>
        ) : pages.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No page builds yet</p>
              <Button onClick={() => setNewPageDialogOpen(true)}>
                Create Your First Page
              </Button>
            </CardContent>
          </Card>
        ) : (
          pages.map((page) => (
            <Card key={page.id} className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle size="small">{page.name}</CardTitle>
                  <Badge className={getStatusColor(page.status)}>
                    {page.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {page.intent_description}
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-4"
                  onClick={() => window.location.href = `${createPageUrl('PageBuildWorkspace')}?page=${page.id}`}
                >
                  Open Workspace
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}