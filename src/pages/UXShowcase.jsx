import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Eye, Code, Check, RefreshCw, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import PageHeader from '@/components/sturij/PageHeader';

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
import IconShowcase from '@/components/showcase/IconShowcase';
import NavigationShowcase from '@/components/showcase/NavigationShowcase';
import DataDisplayShowcase from '@/components/showcase/DataDisplayShowcase';
import LayoutShowcase from '@/components/showcase/LayoutShowcase';
import FeedbackShowcase from '@/components/showcase/FeedbackShowcase';
import ModalShowcase from '@/components/showcase/ModalShowcase';

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

  const categories = [
    {
      id: 'foundations',
      label: 'Design Foundations',
      components: ['typographyShowcase', 'colorShowcase', 'iconShowcase']
    },
    {
      id: 'components',
      label: 'Components',
      components: ['buttonCard', 'cardShowcase', 'formCard', 'tabsShowcase', 'modalShowcase']
    },
    {
      id: 'navigation',
      label: 'Navigation',
      components: ['navigationShowcase', 'searchCard']
    },
    {
      id: 'layout',
      label: 'Layout & Patterns',
      components: ['layoutShowcase']
    },
    {
      id: 'data',
      label: 'Data & Content',
      components: ['dataDisplayShowcase']
    },
    {
      id: 'feedback',
      label: 'Feedback & States',
      components: ['loadingCard', 'errorCard', 'feedbackShowcase', 'mutationCard']
    }
  ];

  const componentOptions = [
    { value: 'typographyShowcase', label: 'Typography', category: 'foundations' },
    { value: 'colorShowcase', label: 'Colors', category: 'foundations' },
    { value: 'iconShowcase', label: 'Icons', category: 'foundations' },
    { value: 'buttonCard', label: 'Buttons', category: 'components' },
    { value: 'cardShowcase', label: 'Cards', category: 'components' },
    { value: 'formCard', label: 'Forms', category: 'components' },
    { value: 'tabsShowcase', label: 'Tabs', category: 'components' },
    { value: 'modalShowcase', label: 'Modals', category: 'components' },
    { value: 'navigationShowcase', label: 'Navigation', category: 'navigation' },
    { value: 'searchCard', label: 'Search', category: 'navigation' },
    { value: 'layoutShowcase', label: 'Layouts', category: 'layout' },
    { value: 'dataDisplayShowcase', label: 'Data Display', category: 'data' },
    { value: 'loadingCard', label: 'Loading', category: 'feedback' },
    { value: 'errorCard', label: 'Errors', category: 'feedback' },
    { value: 'feedbackShowcase', label: 'Notifications', category: 'feedback' },
    { value: 'mutationCard', label: 'Mutations', category: 'feedback' },
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
    iconShowcase: [
      { id: 'icon-controls', label: 'Icon Controls' },
      { id: 'icon-grid', label: 'Icon Grid' },
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
    <div className="max-w-4xl mx-auto min-h-screen -mt-6 space-y-6">
      <PageHeader 
        title="Design System Library"
        description="Comprehensive showcase of reusable UI components, design tokens, and UX patterns"
      >
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
      </PageHeader>

      <Accordion type="multiple" defaultValue={['foundations', 'components']} className="w-full space-y-4">
        {/* Design Foundations */}
        <AccordionItem value="foundations">
          <Card>
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center justify-between w-full">
                <div>
                  <h2 className="text-lg font-semibold text-left">Design Foundations</h2>
                  <p className="text-sm text-muted-foreground text-left">Typography, colors, icons, and brand elements</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="px-6 pb-6 space-y-8">
                <div data-category="typography">
                  <h3 className="text-base font-medium mb-4 text-primary">Typography</h3>
                  <TypographyShowcase />
                </div>
                <div className="border-t pt-8" data-category="colors">
                  <h3 className="text-base font-medium mb-4 text-primary">Colors</h3>
                  <ColorShowcase />
                </div>
                <div className="border-t pt-8" data-category="icons">
                  <h3 className="text-base font-medium mb-4 text-primary">Icons</h3>
                  <IconShowcase />
                </div>
              </div>
            </AccordionContent>
          </Card>
        </AccordionItem>

        {/* Components */}
        <AccordionItem value="components">
          <Card>
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center justify-between w-full">
                <div>
                  <h2 className="text-lg font-semibold text-left">Components</h2>
                  <p className="text-sm text-muted-foreground text-left">Buttons, cards, forms, tabs, and modals</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="px-6 pb-6 space-y-8">
                <div data-category="buttons">
                  <h3 className="text-base font-medium mb-4 text-primary">Buttons</h3>
                  <ButtonShowcase />
                </div>
                <div className="border-t pt-8" data-category="cards">
                  <h3 className="text-base font-medium mb-4 text-primary">Cards</h3>
                  <CardShowcase />
                </div>
                <div className="border-t pt-8" data-category="forms">
                  <h3 className="text-base font-medium mb-4 text-primary">Forms</h3>
                  <FormShowcase />
                </div>
                <div className="border-t pt-8" data-category="tabs">
                  <h3 className="text-base font-medium mb-4 text-primary">Tabs</h3>
                  <TabsShowcase />
                </div>
                <div className="border-t pt-8" data-category="modals">
                  <h3 className="text-base font-medium mb-4 text-primary">Modals</h3>
                  <ModalShowcase />
                </div>
              </div>
            </AccordionContent>
          </Card>
        </AccordionItem>

        {/* Navigation */}
        <AccordionItem value="navigation">
          <Card>
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center justify-between w-full">
                <div>
                  <h2 className="text-lg font-semibold text-left">Navigation</h2>
                  <p className="text-sm text-muted-foreground text-left">Navigation patterns, breadcrumbs, search, and menus</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="px-6 pb-6 space-y-8">
                <div data-category="navigation">
                  <h3 className="text-base font-medium mb-4 text-primary">Navigation Patterns</h3>
                  <NavigationShowcase />
                </div>
                <div className="border-t pt-8" data-category="search">
                  <h3 className="text-base font-medium mb-4 text-primary">Search</h3>
                  <SearchShowcase />
                </div>
              </div>
            </AccordionContent>
          </Card>
        </AccordionItem>

        {/* Layout & Patterns */}
        <AccordionItem value="layout">
          <Card>
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center justify-between w-full">
                <div>
                  <h2 className="text-lg font-semibold text-left">Layout & Patterns</h2>
                  <p className="text-sm text-muted-foreground text-left">Grid systems, containers, and layout patterns</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="px-6 pb-6">
                <div data-category="layouts">
                  <h3 className="text-base font-medium mb-4 text-primary">Layout Patterns</h3>
                  <LayoutShowcase />
                </div>
              </div>
            </AccordionContent>
          </Card>
        </AccordionItem>

        {/* Data & Content */}
        <AccordionItem value="data">
          <Card>
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center justify-between w-full">
                <div>
                  <h2 className="text-lg font-semibold text-left">Data & Content</h2>
                  <p className="text-sm text-muted-foreground text-left">Tables, stats, lists, and data visualization</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="px-6 pb-6">
                <div data-category="data-display">
                  <h3 className="text-base font-medium mb-4 text-primary">Data Display</h3>
                  <DataDisplayShowcase />
                </div>
              </div>
            </AccordionContent>
          </Card>
        </AccordionItem>

        {/* Feedback & States */}
        <AccordionItem value="feedback">
          <Card>
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center justify-between w-full">
                <div>
                  <h2 className="text-lg font-semibold text-left">Feedback & States</h2>
                  <p className="text-sm text-muted-foreground text-left">Loading states, errors, notifications, and mutations</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="px-6 pb-6 space-y-8">
                <div data-category="loading">
                  <h3 className="text-base font-medium mb-4 text-primary">Loading States</h3>
                  <LoadingShowcase />
                </div>
                <div className="border-t pt-8" data-category="errors">
                  <h3 className="text-base font-medium mb-4 text-primary">Error Handling</h3>
                  <ErrorShowcase />
                </div>
                <div className="border-t pt-8" data-category="notifications">
                  <h3 className="text-base font-medium mb-4 text-primary">Notifications & Feedback</h3>
                  <FeedbackShowcase />
                </div>
                <div className="border-t pt-8" data-category="mutations">
                  <h3 className="text-base font-medium mb-4 text-primary">Mutations</h3>
                  <MutationShowcase />
                </div>
              </div>
            </AccordionContent>
          </Card>
        </AccordionItem>
      </Accordion>

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