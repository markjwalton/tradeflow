import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Search, Download, Grid3x3, Layers, Box, Eye, Code, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';

// Component Preview Renderer
function ComponentPreview({ jsxCode, componentName }) {
  const [showCode, setShowCode] = useState(false);
  
  // For safety, we'll just show the code for now
  // In a full implementation, you'd use a sandbox or iframe
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-muted/50 p-4 flex items-center justify-between border-b">
        <span className="text-sm font-medium">Preview</span>
        <Button variant="ghost" size="sm" onClick={() => setShowCode(!showCode)}>
          {showCode ? <Eye className="h-4 w-4" /> : <Code className="h-4 w-4" />}
        </Button>
      </div>
      <div className="p-6 bg-background">
        {showCode ? (
          <pre className="text-xs bg-muted p-4 rounded overflow-x-auto">
            <code>{jsxCode}</code>
          </pre>
        ) : (
          <div className="text-center text-sm text-muted-foreground">
            Interactive preview coming soon
          </div>
        )}
      </div>
    </div>
  );
}

export default function ComponentLibrary() {
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedComponent, setExpandedComponent] = useState(null);

  const { data: components = [], isLoading } = useQuery({
    queryKey: ['components'],
    queryFn: () => base44.entities.Component.list(),
  });

  const { data: allVersions = [] } = useQuery({
    queryKey: ['all-component-versions'],
    queryFn: async () => {
      const versions = await base44.entities.ComponentVersion.list();
      return versions;
    },
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

  const getComponentVersions = (componentId) => {
    return allVersions.filter(v => v.component_id === componentId);
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
        <Accordion type="single" collapsible className="space-y-2">
          {filteredComponents.map(component => {
            const versions = getComponentVersions(component.id);
            const latestVersion = versions.filter(v => v.status === 'approved')[0] || versions[0];
            
            return (
              <AccordionItem key={component.id} value={component.id} className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center justify-between w-full pr-4">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-start gap-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{component.name}</span>
                          <Badge variant="outline" className="text-xs">{component.category}</Badge>
                          {component.is_global && (
                            <Badge className="bg-primary/10 text-primary text-xs">
                              <Layers className="h-3 w-3 mr-1" />
                              Global
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground text-left">{component.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {component.grid_suitability && (
                        <Badge variant="secondary" className="text-xs">
                          <Grid3x3 className="h-3 w-3 mr-1" />
                          {component.grid_suitability}
                        </Badge>
                      )}
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pt-4 space-y-6">
                    {component.functional_specification && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Functional Specification</h4>
                        <p className="text-sm text-muted-foreground">{component.functional_specification}</p>
                      </div>
                    )}

                    {component.tags && component.tags.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Tags</h4>
                        <div className="flex flex-wrap gap-2">
                          {component.tags.map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {latestVersion?.jsx_code && (
                      <div>
                        <h4 className="text-sm font-medium mb-3">Preview</h4>
                        <ComponentPreview 
                          jsxCode={latestVersion.jsx_code}
                          componentName={component.name}
                        />
                      </div>
                    )}

                    {versions.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-3">Versions ({versions.length})</h4>
                        <div className="space-y-2">
                          {versions.map(version => (
                            <Card key={version.id}>
                              <CardContent className="pt-3 pb-3">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-mono text-xs">{version.version_number}</span>
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
                                {version.usage_notes && (
                                  <p className="text-xs text-muted-foreground mb-2 italic">{version.usage_notes}</p>
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
                                {version.jsx_code && (
                                  <details className="mt-3">
                                    <summary className="text-xs font-medium cursor-pointer hover:text-primary">View Code</summary>
                                    <pre className="text-xs bg-muted p-3 rounded mt-2 overflow-x-auto">
                                      <code>{version.jsx_code}</code>
                                    </pre>
                                  </details>
                                )}
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      )}
    </div>
  );
}