import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Eye, Code, Check, RefreshCw, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

// Showcase Components
import LoadingShowcase from '@/components/showcase/LoadingShowcase';
import ErrorShowcase from '@/components/showcase/ErrorShowcase';
import FormShowcase from '@/components/showcase/FormShowcase';
import MutationShowcase from '@/components/showcase/MutationShowcase';
import SearchShowcase from '@/components/showcase/SearchShowcase';
import ButtonShowcase from '@/components/showcase/ButtonShowcase';
import CardShowcase from '@/components/showcase/CardShowcase';
import TypographyShowcase from '@/components/showcase/TypographyShowcase';
import ColorShowcase from '@/components/showcase/ColorShowcase';
import TabsShowcase from '@/components/showcase/TabsShowcase';

export default function UXShowcase() {
  const [showInspector, setShowInspector] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState('loadingCard');
  const [selectedElement, setSelectedElement] = useState('');
  const [componentLabels, setComponentLabels] = useState({});
  const [editingLabel, setEditingLabel] = useState('');
  const [editingFor, setEditingFor] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveCheck, setShowSaveCheck] = useState(false);
  const [computedStyles, setComputedStyles] = useState({});
  const [stylesFetchTime, setStylesFetchTime] = useState(null);

  useEffect(() => {
    const loadLabels = async () => {
      try {
        const user = await base44.auth.me();
        if (user?.ux_showcase_labels) {
          setComponentLabels(user.ux_showcase_labels.components || {});
        }
      } catch (e) {
        // User not logged in
      }
    };
    loadLabels();
  }, []);

  const componentOptions = [
    { value: 'loadingCard', label: 'Loading States' },
    { value: 'errorCard', label: 'Error Handling' },
    { value: 'formCard', label: 'Form Validation' },
    { value: 'mutationCard', label: 'Mutations' },
    { value: 'searchCard', label: 'Search & Debounce' },
    { value: 'buttonCard', label: 'Buttons' },
    { value: 'cardShowcase', label: 'Cards' },
    { value: 'tabsShowcase', label: 'Tabs' },
    { value: 'typographyShowcase', label: 'Typography' },
    { value: 'colorShowcase', label: 'Colors' },
  ];

  const componentElements = {
    loadingCard: [
      { id: 'page-loader', label: 'Page Loader' },
      { id: 'card-grid-loader', label: 'Card Grid Loader' },
      { id: 'table-loader', label: 'Table Loader' },
      { id: 'list-loader', label: 'List Loader' },
      { id: 'form-loader', label: 'Form Loader' },
      { id: 'stats-loader', label: 'Stats Loader' },
      { id: 'inline-loader', label: 'Inline Loader' },
    ],
    errorCard: [
      { id: 'query-error', label: 'Query Error' },
      { id: 'recovery-error', label: 'Recovery Error' },
    ],
    formCard: [
      { id: 'demo-form', label: 'Demo Form' },
    ],
    mutationCard: [
      { id: 'mutation-buttons', label: 'Mutation Buttons' },
    ],
    searchCard: [
      { id: 'search-input', label: 'Search Input' },
      { id: 'search-results', label: 'Search Results' },
    ],
    buttonCard: [
      { id: 'button-variants', label: 'Button Variants' },
    ],
    cardShowcase: [
      { id: 'card-examples', label: 'Card Examples' },
    ],
    tabsShowcase: [
      { id: 'tabs-examples', label: 'Tabs Examples' },
    ],
    typographyShowcase: [
      { id: 'typography-examples', label: 'Typography Examples' },
    ],
    colorShowcase: [
      { id: 'color-palettes', label: 'Color Palettes' },
    ],
  };

  const performStyleFetch = () => {
    const selector = selectedElement 
      ? `[data-element="${selectedElement}"]` 
      : `[data-component="${selectedComponent}"]`;
    const el = document.querySelector(selector);
    
    if (!el) {
      setComputedStyles({});
      const elementName = selectedElement || selectedComponent;
      toast.error(`Element "${elementName}" not found. Switch to the correct tab first.`);
      return;
    }
    
    const computed = window.getComputedStyle(el);
    const styles = {
      display: computed.display,
      flexDirection: computed.flexDirection,
      gap: computed.gap,
      padding: computed.padding,
      margin: computed.margin,
      backgroundColor: computed.backgroundColor,
      borderRadius: computed.borderRadius,
      border: computed.border,
      boxShadow: computed.boxShadow,
      color: computed.color,
      fontSize: computed.fontSize,
      fontWeight: computed.fontWeight,
      fontFamily: computed.fontFamily,
      lineHeight: computed.lineHeight,
      width: computed.width,
      height: computed.height,
      maxWidth: computed.maxWidth,
      minHeight: computed.minHeight,
      alignItems: computed.alignItems,
      justifyContent: computed.justifyContent,
      position: computed.position,
      zIndex: computed.zIndex,
    };
    
    setComputedStyles(styles);
    setStylesFetchTime(new Date().toLocaleTimeString());
  };

  useEffect(() => {
    if (selectedComponent) {
      setTimeout(() => performStyleFetch(), 50);
    }
  }, [selectedComponent, selectedElement]);

  const updateComponentLabel = (id, newLabel) => {
    setComponentLabels(prev => ({ ...prev, [id]: newLabel }));
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      await base44.auth.updateMe({
        ux_showcase_labels: {
          components: componentLabels,
        }
      });
      setShowSaveCheck(true);
      toast.success('Component labels saved');
      setTimeout(() => setShowSaveCheck(false), 2000);
    } catch (e) {
      toast.error('Failed to save labels');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-light font-display mb-2">Design System Library</h1>
          <p className="text-muted-foreground">
            Comprehensive showcase of reusable UI components, design tokens, and UX patterns
          </p>
        </div>
        <Sheet open={showInspector} onOpenChange={setShowInspector}>
          <SheetTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Eye className="h-4 w-4" />
              Styles Inspector
            </Button>
          </SheetTrigger>
          <SheetContent className="overflow-y-auto flex flex-col">
            <SheetHeader>
              <SheetTitle>Component Styles Inspector</SheetTitle>
            </SheetHeader>
            <div className="space-y-4 mt-6 flex-1 overflow-y-auto">
              <div className="space-y-2">
                <Label>Select Component</Label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={selectedComponent || ''}
                  onChange={(e) => {
                    setSelectedComponent(e.target.value);
                    setSelectedElement('');
                  }}
                >
                  <option value="">Choose a component...</option>
                  {componentOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {selectedComponent && (
                <>
                  <div className="space-y-2">
                    <Label>Select Element</Label>
                    <select
                      className="w-full p-2 border rounded-md"
                      value={selectedElement || ''}
                      onChange={(e) => setSelectedElement(e.target.value)}
                    >
                      <option value="">Component Container</option>
                      {componentElements[selectedComponent]?.map((el) => (
                        <option key={el.id} value={el.id}>{el.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label>Component Label (Optional)</Label>
                    <Input
                      value={componentLabels[selectedComponent] || ''}
                      onChange={(e) => updateComponentLabel(selectedComponent, e.target.value)}
                      placeholder="Custom label..."
                    />
                  </div>

                  <div className="space-y-3 pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium flex items-center gap-2">
                        <Code className="h-4 w-4" />
                        Computed Styles
                      </h3>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="gap-2 h-7"
                        onClick={performStyleFetch}
                      >
                        <RefreshCw className="h-3 w-3" />
                        Refresh
                      </Button>
                    </div>
                    {stylesFetchTime && (
                      <p className="text-xs text-muted-foreground">Last fetched: {stylesFetchTime}</p>
                    )}
                    {Object.keys(computedStyles).length === 0 ? (
                      <div className="bg-muted/50 rounded-lg p-4 text-center">
                        <p className="text-sm text-muted-foreground">
                          Element not found or not visible. Make sure the tab is active and the element is rendered.
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="bg-muted/50 rounded-lg p-3 space-y-2 max-h-96 overflow-y-auto">
                          {Object.entries(computedStyles).map(([key, value]) => (
                            <div key={key} className="flex justify-between text-xs font-mono gap-2">
                              <span className="text-muted-foreground">{key}:</span>
                              <span className="font-medium text-right break-all">{value}</span>
                            </div>
                          ))}
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full gap-2"
                          onClick={() => {
                            navigator.clipboard.writeText(JSON.stringify(computedStyles, null, 2));
                            toast.success('Styles copied to clipboard');
                          }}
                        >
                          <Code className="h-3 w-3" />
                          Copy All Styles
                        </Button>
                      </>
                    )}
                  </div>

                  <div className="pt-4 border-t flex gap-2 mt-auto">
                    <Button 
                      onClick={handleSaveChanges}
                      className="flex-1 gap-2"
                      disabled={isSaving}
                    >
                      {showSaveCheck ? (
                        <>
                          <Check className="h-4 w-4" />
                          Saved
                        </>
                      ) : isSaving ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <Tabs defaultValue="loading" className="w-full">
        <TabsList className="grid w-full grid-cols-5 lg:grid-cols-10">
          <TabsTrigger value="loading">Loading</TabsTrigger>
          <TabsTrigger value="errors">Errors</TabsTrigger>
          <TabsTrigger value="forms">Forms</TabsTrigger>
          <TabsTrigger value="mutations">Mutations</TabsTrigger>
          <TabsTrigger value="search">Search</TabsTrigger>
          <TabsTrigger value="buttons">Buttons</TabsTrigger>
          <TabsTrigger value="cards">Cards</TabsTrigger>
          <TabsTrigger value="tabs">Tabs</TabsTrigger>
          <TabsTrigger value="typography">Typography</TabsTrigger>
          <TabsTrigger value="colors">Colors</TabsTrigger>
        </TabsList>

        <TabsContent value="loading" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <LoadingShowcase />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="errors" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <ErrorShowcase />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forms" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <FormShowcase />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mutations" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <MutationShowcase />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="search" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <SearchShowcase />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="buttons" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <ButtonShowcase />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cards" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <CardShowcase />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tabs" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <TabsShowcase />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="typography" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <TypographyShowcase />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="colors" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <ColorShowcase />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Documentation */}
      <Card>
        <CardHeader>
          <CardTitle>Documentation & Guides</CardTitle>
          <CardDescription>Implementation guides and best practices</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 border rounded-lg bg-card">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium">UX Patterns Guide</h4>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Complete reference for all UX patterns and best practices.
              </p>
              <code className="text-xs text-muted-foreground">components/common/UX_PATTERNS_GUIDE</code>
            </div>
            <div className="p-4 border rounded-lg bg-card">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium">Component Architecture</h4>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Guide for designing and structuring React components.
              </p>
              <code className="text-xs text-muted-foreground">components/common/COMPONENT_ARCHITECTURE_GUIDE</code>
            </div>
            <div className="p-4 border rounded-lg bg-card">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium">Integration Guide</h4>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Complete guide to integrating all UX systems.
              </p>
              <code className="text-xs text-muted-foreground">components/common/UX_INTEGRATION_GUIDE</code>
            </div>
            <div className="p-4 border rounded-lg bg-card">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium">Sturij Implementation</h4>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Design system implementation guidelines.
              </p>
              <code className="text-xs text-muted-foreground">components/library/IMPLEMENTATION</code>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}