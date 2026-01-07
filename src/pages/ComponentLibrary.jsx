import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Search, Download, Grid3x3, Layers, Box } from 'lucide-react';
import { toast } from 'sonner';

export default function ComponentLibrary() {
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const { data: components = [], isLoading } = useQuery({
    queryKey: ['components'],
    queryFn: () => base44.entities.Component.list(),
  });

  const { data: versions = [] } = useQuery({
    queryKey: ['component-versions', selectedComponent?.id],
    queryFn: () => base44.entities.ComponentVersion.filter({ component_id: selectedComponent.id }),
    enabled: !!selectedComponent,
  });

  const extractMutation = useMutation({
    mutationFn: () => base44.functions.invoke('extractShowcaseComponents', {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['components'] });
      toast.success('Components extracted successfully');
    },
    onError: (error) => {
      toast.error('Failed to extract components: ' + error.message);
    },
  });

  const categories = ['all', 'Foundations', 'Components', 'Navigation', 'Layout', 'Data Display', 'Feedback'];

  const filteredComponents = components.filter(comp => {
    const matchesCategory = selectedCategory === 'all' || comp.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      comp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comp.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleViewDetails = (component) => {
    setSelectedComponent(component);
    setIsDetailsOpen(true);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-light mb-2">Component Library</h1>
            <p className="text-sm text-muted-foreground">
              Manage reusable UI components with version control and style token tracking
            </p>
          </div>
          <Button onClick={() => extractMutation.mutate()} disabled={extractMutation.isPending}>
            <Download className="h-4 w-4 mr-2" />
            {extractMutation.isPending ? 'Extracting...' : 'Extract from Showcase'}
          </Button>
        </div>

        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search components or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </div>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-6">
        <TabsList>
          {categories.map(cat => (
            <TabsTrigger key={cat} value={cat}>
              {cat}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading components...</div>
      ) : filteredComponents.length === 0 ? (
        <Card className="p-12 text-center">
          <Box className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">No components yet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Extract components from the showcase pages to get started
          </p>
          <Button onClick={() => extractMutation.mutate()} disabled={extractMutation.isPending}>
            <Download className="h-4 w-4 mr-2" />
            Extract Components
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredComponents.map(component => (
            <Card key={component.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleViewDetails(component)}>
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <Badge variant="outline">{component.category}</Badge>
                  {component.grid_suitability && (
                    <Badge variant="secondary" className="text-xs">
                      <Grid3x3 className="h-3 w-3 mr-1" />
                      {component.grid_suitability}
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-lg">{component.name}</CardTitle>
                <CardDescription className="line-clamp-2">{component.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1 mb-3">
                  {component.tags?.slice(0, 4).map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                  ))}
                </div>
                {component.is_global && (
                  <Badge className="bg-primary/10 text-primary">
                    <Layers className="h-3 w-3 mr-1" />
                    Global
                  </Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Sheet open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          {selectedComponent && (
            <>
              <SheetHeader>
                <SheetTitle>{selectedComponent.name}</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-6">
                <div>
                  <h4 className="text-sm font-medium mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground">{selectedComponent.description}</p>
                </div>

                {selectedComponent.functional_specification && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Functional Specification</h4>
                    <p className="text-sm text-muted-foreground">{selectedComponent.functional_specification}</p>
                  </div>
                )}

                <div>
                  <h4 className="text-sm font-medium mb-2">Properties</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Category:</span>
                      <Badge variant="outline">{selectedComponent.category}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Grid Suitability:</span>
                      <span>{selectedComponent.grid_suitability || 'Not specified'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Scope:</span>
                      <Badge>{selectedComponent.is_global ? 'Global' : 'Tenant'}</Badge>
                    </div>
                  </div>
                </div>

                {selectedComponent.tags && selectedComponent.tags.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedComponent.tags.map(tag => (
                        <Badge key={tag} variant="outline">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {versions.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-3">Versions ({versions.length})</h4>
                    <div className="space-y-3">
                      {versions.map(version => (
                        <Card key={version.id}>
                          <CardContent className="pt-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-mono text-sm">{version.version_number}</span>
                              <Badge className={
                                version.status === 'approved' ? 'bg-green-100 text-green-800' :
                                version.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                                'bg-yellow-100 text-yellow-800'
                              }>
                                {version.status}
                              </Badge>
                            </div>
                            {version.change_summary && (
                              <p className="text-xs text-muted-foreground mb-2">{version.change_summary}</p>
                            )}
                            {version.style_token_references && version.style_token_references.length > 0 && (
                              <div className="mt-2">
                                <p className="text-xs font-medium mb-1">Style Tokens:</p>
                                <div className="flex flex-wrap gap-1">
                                  {version.style_token_references.map(token => (
                                    <code key={token} className="text-xs bg-muted px-1.5 py-0.5 rounded">
                                      {token}
                                    </code>
                                  ))}
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}