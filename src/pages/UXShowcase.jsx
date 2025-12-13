import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { PageLoader, InlineLoader, ButtonLoader, CardGridLoader, TableLoader, ListLoader, FormLoader, StatsLoader } from '@/components/common/LoadingStates';
import { ErrorRecovery } from '@/components/common/ErrorRecovery';
import { useMutationError } from '@/components/common/MutationErrorToast';
import { useValidatedForm } from '@/components/forms/useValidatedForm';
import { ValidatedInput } from '@/components/forms/ValidatedInput';
import { ValidatedTextarea } from '@/components/forms/ValidatedTextarea';
import { ValidatedSelect } from '@/components/forms/ValidatedSelect';
import { ValidationSchemas } from '@/components/forms/FormValidation';
import { useDebounce } from '@/components/common/useDebounce';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { toast } from 'sonner';
import { Loader2, CheckCircle2, AlertCircle, Search, Eye, Code, Edit2, FileText, ExternalLink, Check } from 'lucide-react';
import { z } from 'zod';

// Demo schema
const demoSchema = z.object({
  name: ValidationSchemas.required,
  email: ValidationSchemas.email,
  phone: ValidationSchemas.phone.optional(),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

export default function UXShowcase() {
  const [showLoadingDemo, setShowLoadingDemo] = useState('page');
  const [showErrorDemo, setShowErrorDemo] = useState(false);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);
  const [showStylesPanel, setShowStylesPanel] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [selectedElement, setSelectedElement] = useState(null);
  const [componentLabels, setComponentLabels] = useState({
    loadingCard: 'Loading States Demo',
    errorCard: 'Error Handling Demo',
    formCard: 'Form Validation Demo',
    mutationCard: 'Mutation Demo',
    searchCard: 'Search & Debounce Demo',
  });
  const [elementLabels, setElementLabels] = useState({});
  const [originalLabels, setOriginalLabels] = useState(componentLabels);
  const [originalElementLabels, setOriginalElementLabels] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveCheck, setShowSaveCheck] = useState(false);

  useEffect(() => {
    const loadLabels = async () => {
      try {
        const user = await base44.auth.me();
        if (user?.ux_showcase_labels) {
          setComponentLabels(user.ux_showcase_labels.components || componentLabels);
          setOriginalLabels(user.ux_showcase_labels.components || componentLabels);
          setElementLabels(user.ux_showcase_labels.elements || {});
          setOriginalElementLabels(user.ux_showcase_labels.elements || {});
        }
      } catch (e) {
        // User not logged in
      }
    };
    loadLabels();
  }, []);

  const componentElements = {
    loadingCard: [
      { id: 'page-loader', label: 'Page Loader' },
      { id: 'card-grid-loader', label: 'Card Grid Loader' },
      { id: 'table-loader', label: 'Table Loader' },
      { id: 'list-loader', label: 'List Loader' },
      { id: 'form-loader', label: 'Form Loader' },
      { id: 'stats-loader', label: 'Stats Loader' },
      { id: 'inline-loader', label: 'Inline Loader' },
      { id: 'button-loader', label: 'Button Loader' },
    ],
    errorCard: [
      { id: 'error-recovery', label: 'Error Recovery Component' },
      { id: 'toast-buttons', label: 'Toast Notification Buttons' },
    ],
    formCard: [
      { id: 'validated-input', label: 'Validated Input' },
      { id: 'validated-textarea', label: 'Validated Textarea' },
      { id: 'validated-select', label: 'Validated Select' },
      { id: 'form-buttons', label: 'Form Buttons' },
    ],
    mutationCard: [
      { id: 'mutation-button', label: 'Mutation Button' },
      { id: 'success-alert', label: 'Success Alert' },
    ],
    searchCard: [
      { id: 'search-input', label: 'Search Input' },
      { id: 'search-results', label: 'Search Results' },
    ],
  };

  // Form validation demo
  const form = useValidatedForm(demoSchema);

  // Mock mutation demo
  const mockMutation = useMutation({
    mutationFn: async (data) => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      if (Math.random() > 0.5) throw new Error('Random error for demo');
      return data;
    },
    onSuccess: () => toast.success('Success!'),
  });

  useMutationError(mockMutation, { customMessage: 'Demo mutation failed' });

  // Mock query demo
  const mockQuery = useQuery({
    queryKey: ['demo', debouncedSearch],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return Array.from({ length: 5 }, (_, i) => ({ id: i, name: `Item ${i}` }));
    },
    enabled: !!debouncedSearch,
  });

  const handleFormSubmit = (data) => {
    mockMutation.mutate(data);
  };

  const getComponentStyles = (component, element) => {
    const selector = element 
      ? `[data-element="${element}"]` 
      : `[data-component="${component}"]`;
    const el = document.querySelector(selector);
    if (!el) return {};
    
    const computed = window.getComputedStyle(el);
    return {
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
  };

  const updateComponentLabel = (id, newLabel) => {
    setComponentLabels(prev => ({ ...prev, [id]: newLabel }));
  };

  const updateElementLabel = (id, newLabel) => {
    setElementLabels(prev => ({ ...prev, [id]: newLabel }));
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      const user = await base44.auth.me();
      await base44.auth.updateMe({
        ux_showcase_labels: {
          components: componentLabels,
          elements: elementLabels,
        }
      });
      setOriginalLabels(componentLabels);
      setOriginalElementLabels(elementLabels);
      setShowSaveCheck(true);
      toast.success('Component labels saved');
      setTimeout(() => setShowSaveCheck(false), 2000);
    } catch (e) {
      toast.error('Failed to save labels');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelChanges = () => {
    setComponentLabels(originalLabels);
    setElementLabels(originalElementLabels);
    toast.info('Changes discarded');
  };

  const getDisplayName = () => {
    if (!selectedComponent) return '';
    const componentName = componentLabels[selectedComponent];
    if (!selectedElement) return componentName;
    const elementName = elementLabels[selectedElement] || componentElements[selectedComponent]?.find(e => e.id === selectedElement)?.label;
    return `${componentName} > ${elementName}`;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-light font-display mb-2">UX Enhancement Showcase</h1>
          <p className="text-muted-foreground">
            Demonstration of all UX systems: loading states, error handling, form validation, and more.
          </p>
        </div>
        <Sheet open={showStylesPanel} onOpenChange={setShowStylesPanel}>
          <SheetTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Eye className="h-4 w-4" />
              View Component Styles
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
                    setSelectedElement(null);
                  }}
                >
                  <option value="">Choose a component...</option>
                  <option value="loadingCard">Loading States</option>
                  <option value="errorCard">Error Handling</option>
                  <option value="formCard">Form Validation</option>
                  <option value="mutationCard">Mutations</option>
                  <option value="searchCard">Search & Debounce</option>
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
                    <Label>Full Component Name</Label>
                    <div className="p-2 bg-muted rounded-md text-sm font-medium">
                      {getDisplayName()}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Component Label</Label>
                    <Input
                      value={componentLabels[selectedComponent]}
                      onChange={(e) => updateComponentLabel(selectedComponent, e.target.value)}
                      placeholder="Component name..."
                    />
                  </div>

                  {selectedElement && (
                    <div className="space-y-2">
                      <Label>Element Label</Label>
                      <Input
                        value={elementLabels[selectedElement] || componentElements[selectedComponent]?.find(e => e.id === selectedElement)?.label || ''}
                        onChange={(e) => updateElementLabel(selectedElement, e.target.value)}
                        placeholder="Element name..."
                      />
                    </div>
                  )}

                  <div className="space-y-3 pt-4 border-t">
                    <h3 className="font-medium flex items-center gap-2">
                      <Code className="h-4 w-4" />
                      Computed Styles
                    </h3>
                    <div className="bg-muted/50 rounded-lg p-3 space-y-2 max-h-96 overflow-y-auto">
                      {Object.entries(getComponentStyles(selectedComponent, selectedElement)).map(([key, value]) => (
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
                        const styles = getComponentStyles(selectedComponent, selectedElement);
                        navigator.clipboard.writeText(JSON.stringify(styles, null, 2));
                        toast.success('Styles copied to clipboard');
                      }}
                    >
                      <Code className="h-3 w-3" />
                      Copy All Styles
                    </Button>
                  </div>
                  {/* Save/Cancel Buttons */}
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
                    <Button 
                      onClick={handleCancelChanges}
                      variant="outline"
                      className="flex-1"
                      disabled={isSaving}
                    >
                      Cancel
                    </Button>
                  </div>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <Tabs defaultValue="loading" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="loading">Loading States</TabsTrigger>
          <TabsTrigger value="errors">Error Handling</TabsTrigger>
          <TabsTrigger value="forms">Form Validation</TabsTrigger>
          <TabsTrigger value="mutations">Mutations</TabsTrigger>
          <TabsTrigger value="search">Search & Debounce</TabsTrigger>
        </TabsList>

        {/* Loading States */}
        <TabsContent value="loading" className="space-y-4">
          <Card data-component="loadingCard">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Loading State Variants</CardTitle>
                  <CardDescription>Different loading indicators for various use cases</CardDescription>
                </div>
                <Badge variant="outline">{componentLabels.loadingCard}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Button variant={showLoadingDemo === 'page' ? 'default' : 'outline'} onClick={() => setShowLoadingDemo('page')}>Page Loader</Button>
                  <Button variant={showLoadingDemo === 'cards' ? 'default' : 'outline'} onClick={() => setShowLoadingDemo('cards')}>Card Grid</Button>
                  <Button variant={showLoadingDemo === 'table' ? 'default' : 'outline'} onClick={() => setShowLoadingDemo('table')}>Table</Button>
                  <Button variant={showLoadingDemo === 'list' ? 'default' : 'outline'} onClick={() => setShowLoadingDemo('list')}>List</Button>
                  <Button variant={showLoadingDemo === 'form' ? 'default' : 'outline'} onClick={() => setShowLoadingDemo('form')}>Form</Button>
                  <Button variant={showLoadingDemo === 'stats' ? 'default' : 'outline'} onClick={() => setShowLoadingDemo('stats')}>Stats</Button>
                </div>
              </div>

              <div className="border rounded-lg p-4 min-h-[200px]">
                {showLoadingDemo === 'page' && <div data-element="page-loader"><PageLoader message="Loading page data..." /></div>}
                {showLoadingDemo === 'cards' && <div data-element="card-grid-loader"><CardGridLoader count={3} columns={3} /></div>}
                {showLoadingDemo === 'table' && <div data-element="table-loader"><TableLoader rows={4} columns={4} /></div>}
                {showLoadingDemo === 'list' && <div data-element="list-loader"><ListLoader rows={4} /></div>}
                {showLoadingDemo === 'form' && <div data-element="form-loader"><FormLoader fields={4} /></div>}
                {showLoadingDemo === 'stats' && <div data-element="stats-loader"><StatsLoader count={4} /></div>}
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Inline & Button Loaders</h4>
                <div className="flex gap-4 items-center">
                  <div data-element="inline-loader"><InlineLoader message="Processing..." /></div>
                  <Button disabled data-element="button-loader">
                    <ButtonLoader />
                    Loading...
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Error Handling */}
        <TabsContent value="errors" className="space-y-4">
          <Card data-component="errorCard">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Error Recovery System</CardTitle>
                  <CardDescription>User-friendly error handling with retry functionality</CardDescription>
                </div>
                <Badge variant="outline">{componentLabels.errorCard}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={() => setShowErrorDemo(!showErrorDemo)}>
                {showErrorDemo ? 'Hide Error Demo' : 'Show Error Demo'}
              </Button>

              {showErrorDemo && (
                <div className="border rounded-lg" data-element="error-recovery">
                  <ErrorRecovery
                    error={new Error('This is a demo error message')}
                    onRetry={() => {
                      toast.info('Retry clicked');
                      setShowErrorDemo(false);
                    }}
                    onDismiss={() => setShowErrorDemo(false)}
                  />
                </div>
              )}

              <div className="space-y-2">
                <h4 className="font-medium">Toast Notifications</h4>
                <div className="flex gap-2" data-element="toast-buttons">
                  <Button variant="outline" onClick={() => toast.success('Success message')}>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Success
                  </Button>
                  <Button variant="outline" onClick={() => toast.error('Error message')}>
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Error
                  </Button>
                  <Button variant="outline" onClick={() => toast.info('Info message')}>
                    Info
                  </Button>
                  <Button variant="outline" onClick={() => toast.warning('Warning message')}>
                    Warning
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Form Validation */}
        <TabsContent value="forms" className="space-y-4">
          <Card data-component="formCard">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Form Validation with Zod</CardTitle>
                  <CardDescription>Real-time validation with user-friendly error messages</CardDescription>
                </div>
                <Badge variant="outline">{componentLabels.formCard}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
                <div data-element="validated-input">
                  <ValidatedInput
                    label="Name"
                    required
                    error={form.getError('name')}
                    helperText="Enter your full name"
                    {...form.register('name')}
                  />
                </div>

                <div data-element="validated-input">
                  <ValidatedInput
                    label="Email"
                    type="email"
                    required
                    error={form.getError('email')}
                    helperText="We'll never share your email"
                    {...form.register('email')}
                  />
                </div>

                <div data-element="validated-input">
                  <ValidatedInput
                    label="Phone"
                    error={form.getError('phone')}
                    helperText="UK format: 07XXX XXXXXX"
                    {...form.register('phone')}
                  />
                </div>

                <div data-element="validated-textarea">
                  <ValidatedTextarea
                    label="Message"
                    required
                    error={form.getError('message')}
                    maxLength={200}
                    showCharCount
                    {...form.register('message')}
                  />
                </div>

                <div data-element="validated-select">
                  <ValidatedSelect
                    label="Category"
                    error={form.getError('category')}
                    options={[
                      { value: 'general', label: 'General Inquiry' },
                      { value: 'support', label: 'Support Request' },
                      { value: 'feedback', label: 'Feedback' },
                    ]}
                    {...form.register('category')}
                  />
                </div>

                <div className="flex gap-2" data-element="form-buttons">
                  <Button type="submit" disabled={mockMutation.isPending}>
                    {mockMutation.isPending && <ButtonLoader />}
                    Submit Form
                  </Button>
                  <Button type="button" variant="outline" onClick={() => form.reset()}>
                    Reset
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Mutations */}
        <TabsContent value="mutations" className="space-y-4">
          <Card data-component="mutationCard">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Mutation Error Handling</CardTitle>
                  <CardDescription>Automatic toast notifications for mutation errors</CardDescription>
                </div>
                <Badge variant="outline">{componentLabels.mutationCard}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  This button has a 50% chance of failing to demonstrate automatic error handling.
                </p>
                <Button 
                  onClick={() => mockMutation.mutate({ test: 'data' })}
                  disabled={mockMutation.isPending}
                  data-element="mutation-button"
                >
                  {mockMutation.isPending && <ButtonLoader />}
                  Try Random Mutation
                </Button>
              </div>

              {mockMutation.isSuccess && (
                <div className="p-4 bg-success-50 border border-success rounded-lg" data-element="success-alert">
                  <p className="text-sm text-success">✓ Mutation succeeded!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Search & Debounce */}
        <TabsContent value="search" className="space-y-4">
          <Card data-component="searchCard">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Search with Debouncing</CardTitle>
                  <CardDescription>Optimized search with 500ms debounce delay</CardDescription>
                </div>
                <Badge variant="outline">{componentLabels.searchCard}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative" data-element="search-input">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Type to search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Current value: {search || '(empty)'}</span>
                  <span>Debounced value: {debouncedSearch || '(empty)'}</span>
                </div>

                {search && (
                  <div className="p-4 border rounded-lg" data-element="search-results">
                    {mockQuery.isLoading && <InlineLoader message="Searching..." />}
                    {mockQuery.data && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Results:</p>
                        {mockQuery.data.map((item) => (
                          <div key={item.id} className="p-2 bg-muted rounded">
                            {item.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Documentation Links */}
      <Card>
        <CardHeader>
          <CardTitle>Documentation</CardTitle>
          <CardDescription>Learn more about the UX enhancement systems</CardDescription>
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
                <h4 className="font-medium">Quick Start Guide</h4>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Get started in 5 minutes with all UX systems.
              </p>
              <code className="text-xs text-muted-foreground">components/common/QUICK_START</code>
            </div>
            <div className="p-4 border rounded-lg bg-card">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium">Integration Guide</h4>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Complete guide to integrating all systems.
              </p>
              <code className="text-xs text-muted-foreground">components/common/UX_INTEGRATION_GUIDE</code>
            </div>
            <div className="p-4 border rounded-lg bg-card">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium">Implementation Checklist</h4>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Ensure nothing is missed when building features.
              </p>
              <code className="text-xs text-muted-foreground">components/common/IMPLEMENTATION_CHECKLIST</code>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}