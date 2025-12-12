import React, { useState } from 'react';
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
import { toast } from 'sonner';
import { Loader2, CheckCircle2, AlertCircle, Search } from 'lucide-react';
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

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-light font-display mb-2">UX Enhancement Showcase</h1>
        <p className="text-muted-foreground">
          Demonstration of all UX systems: loading states, error handling, form validation, and more.
        </p>
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
          <Card>
            <CardHeader>
              <CardTitle>Loading State Variants</CardTitle>
              <CardDescription>Different loading indicators for various use cases</CardDescription>
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
                {showLoadingDemo === 'page' && <PageLoader message="Loading page data..." />}
                {showLoadingDemo === 'cards' && <CardGridLoader count={3} columns={3} />}
                {showLoadingDemo === 'table' && <TableLoader rows={4} columns={4} />}
                {showLoadingDemo === 'list' && <ListLoader rows={4} />}
                {showLoadingDemo === 'form' && <FormLoader fields={4} />}
                {showLoadingDemo === 'stats' && <StatsLoader count={4} />}
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Inline & Button Loaders</h4>
                <div className="flex gap-4 items-center">
                  <InlineLoader message="Processing..." />
                  <Button disabled>
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
          <Card>
            <CardHeader>
              <CardTitle>Error Recovery System</CardTitle>
              <CardDescription>User-friendly error handling with retry functionality</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={() => setShowErrorDemo(!showErrorDemo)}>
                {showErrorDemo ? 'Hide Error Demo' : 'Show Error Demo'}
              </Button>

              {showErrorDemo && (
                <div className="border rounded-lg">
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
                <div className="flex gap-2">
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
          <Card>
            <CardHeader>
              <CardTitle>Form Validation with Zod</CardTitle>
              <CardDescription>Real-time validation with user-friendly error messages</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
                <ValidatedInput
                  label="Name"
                  required
                  error={form.getError('name')}
                  helperText="Enter your full name"
                  {...form.register('name')}
                />

                <ValidatedInput
                  label="Email"
                  type="email"
                  required
                  error={form.getError('email')}
                  helperText="We'll never share your email"
                  {...form.register('email')}
                />

                <ValidatedInput
                  label="Phone"
                  error={form.getError('phone')}
                  helperText="UK format: 07XXX XXXXXX"
                  {...form.register('phone')}
                />

                <ValidatedTextarea
                  label="Message"
                  required
                  error={form.getError('message')}
                  maxLength={200}
                  showCharCount
                  {...form.register('message')}
                />

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

                <div className="flex gap-2">
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
          <Card>
            <CardHeader>
              <CardTitle>Mutation Error Handling</CardTitle>
              <CardDescription>Automatic toast notifications for mutation errors</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  This button has a 50% chance of failing to demonstrate automatic error handling.
                </p>
                <Button 
                  onClick={() => mockMutation.mutate({ test: 'data' })}
                  disabled={mockMutation.isPending}
                >
                  {mockMutation.isPending && <ButtonLoader />}
                  Try Random Mutation
                </Button>
              </div>

              {mockMutation.isSuccess && (
                <div className="p-4 bg-success-50 border border-success rounded-lg">
                  <p className="text-sm text-success">✓ Mutation succeeded!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Search & Debounce */}
        <TabsContent value="search" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Search with Debouncing</CardTitle>
              <CardDescription>Optimized search with 500ms debounce delay</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
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
                  <div className="p-4 border rounded-lg">
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
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">UX Patterns Guide</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Complete reference for all UX patterns and best practices.
              </p>
              <code className="text-xs">components/common/UX_PATTERNS_GUIDE.md</code>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Quick Start Guide</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Get started in 5 minutes with all UX systems.
              </p>
              <code className="text-xs">components/common/QUICK_START.md</code>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Integration Guide</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Complete guide to integrating all systems.
              </p>
              <code className="text-xs">components/common/UX_INTEGRATION_GUIDE.md</code>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Implementation Checklist</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Ensure nothing is missed when building features.
              </p>
              <code className="text-xs">components/common/IMPLEMENTATION_CHECKLIST.md</code>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}