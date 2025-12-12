# UX Systems Integration Guide

## Overview
This guide shows how to integrate all UX enhancement systems together for a complete, production-ready user experience.

## Complete Page Implementation Example

```jsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

// Loading States
import { PageLoader, CardGridLoader, ButtonLoader } from '@/components/common/LoadingStates';

// Error Handling
import { useErrorHandler } from '@/components/common/useErrorHandler';
import { ErrorRecovery } from '@/components/common/ErrorRecovery';
import { useMutationError } from '@/components/common/MutationErrorToast';

// Form Validation
import { useValidatedForm } from '@/components/forms/useValidatedForm';
import { ValidatedInput, ValidatedSelect } from '@/components/forms/ValidatedInput';
import { customerSchema } from '@/components/forms/FormValidation';

// Accessibility
import { announceToScreenReader } from '@/components/common/a11yUtils';
import { useKeyboardNav } from '@/components/common/useKeyboardNav';

// Performance
import { usePerformanceMark } from '@/components/monitoring/usePerformanceMonitoring';

// UI Components
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

export default function CustomersPage() {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler();
  const [showForm, setShowForm] = useState(false);
  
  // Performance tracking
  usePerformanceMark('customers-page-load');
  
  // Data fetching with error handling
  const { 
    data: customers = [], 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      try {
        return await base44.entities.Customer.list();
      } catch (err) {
        handleError(err, {
          customMessage: 'Failed to load customers',
          showToast: true,
        });
        throw err;
      }
    },
  });
  
  // Form validation
  const { 
    register, 
    handleSubmit, 
    getError, 
    reset,
    formState 
  } = useValidatedForm(customerSchema);
  
  // Mutations with error handling
  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Customer.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Customer created successfully');
      announceToScreenReader('Customer created successfully');
      reset();
      setShowForm(false);
    },
  });
  
  // Automatic mutation error handling
  useMutationError(createMutation, {
    customMessage: 'Failed to create customer',
  });
  
  // Form submission
  const onSubmit = (data) => {
    createMutation.mutate(data);
  };
  
  // Loading state
  if (isLoading) {
    return <PageLoader message="Loading customers..." />;
  }
  
  // Error state with recovery
  if (error) {
    return (
      <ErrorRecovery
        error={error}
        onRetry={refetch}
        onDismiss={() => window.location.reload()}
      />
    );
  }
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1>Customers</h1>
        <Button onClick={() => setShowForm(true)}>
          Add Customer
        </Button>
      </div>
      
      {/* Customer list */}
      <div className="grid grid-cols-3 gap-4">
        {customers.map((customer) => (
          <Card key={customer.id}>
            <h3>{customer.name}</h3>
            <p>{customer.email}</p>
          </Card>
        ))}
      </div>
      
      {/* Form dialog */}
      {showForm && (
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <ValidatedInput
                label="Name"
                required
                error={getError('name')}
                {...register('name')}
              />
              
              <ValidatedInput
                label="Email"
                type="email"
                error={getError('email')}
                helperText="We'll never share your email"
                {...register('email')}
              />
              
              <ValidatedInput
                label="Phone"
                error={getError('phone')}
                {...register('phone')}
              />
              
              <Button 
                type="submit" 
                disabled={formState.isSubmitting || createMutation.isPending}
                className="w-full"
              >
                {createMutation.isPending ? (
                  <>
                    <ButtonLoader />
                    Creating...
                  </>
                ) : (
                  'Create Customer'
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
```

## System Integration Checklist

### 1. Data Fetching ✓
- [ ] Use `useQuery` with error handling
- [ ] Show loading states with `PageLoader` or skeleton components
- [ ] Handle errors with `ErrorRecovery` component
- [ ] Add retry functionality
- [ ] Announce loading states to screen readers

### 2. Forms ✓
- [ ] Use `useValidatedForm` with Zod schema
- [ ] Implement validated input components
- [ ] Show inline validation errors
- [ ] Disable submit during submission
- [ ] Reset form after success
- [ ] Handle server-side errors

### 3. Mutations ✓
- [ ] Use `useMutation` with proper callbacks
- [ ] Invalidate queries on success
- [ ] Show toast notifications
- [ ] Use `useMutationError` for automatic error handling
- [ ] Show loading state on buttons
- [ ] Implement optimistic updates (optional)

### 4. Error Handling ✓
- [ ] Use `useErrorHandler` for consistent errors
- [ ] Classify errors appropriately
- [ ] Provide user-friendly messages
- [ ] Add retry functionality
- [ ] Log errors for debugging

### 5. Accessibility ✓
- [ ] Add keyboard navigation
- [ ] Announce state changes
- [ ] Use semantic HTML
- [ ] Add ARIA labels where needed
- [ ] Ensure focus management

### 6. Performance ✓
- [ ] Add performance marks for key operations
- [ ] Monitor Core Web Vitals
- [ ] Use pagination for large lists
- [ ] Implement debouncing for search
- [ ] Optimize images with `OptimizedImage`

### 7. Loading States ✓
- [ ] Page-level loaders for initial load
- [ ] Skeleton components for content
- [ ] Button loaders for actions
- [ ] Inline loaders for sections

## Common Patterns

### Pattern 1: List Page with CRUD
```jsx
function ListPage() {
  // 1. Queries
  const { data, isLoading, error } = useQuery({...});
  
  // 2. Mutations
  const createMutation = useMutation({...});
  const updateMutation = useMutation({...});
  const deleteMutation = useMutation({...});
  
  // 3. Form
  const form = useValidatedForm(schema);
  
  // 4. Error handling
  useMutationError(createMutation);
  useMutationError(updateMutation);
  useMutationError(deleteMutation);
  
  // 5. Loading state
  if (isLoading) return <PageLoader />;
  if (error) return <ErrorRecovery error={error} />;
  
  // 6. Render
  return (/* ... */);
}
```

### Pattern 2: Form with Validation
```jsx
function FormComponent({ onSuccess }) {
  const form = useValidatedForm(schema);
  
  const mutation = useMutation({
    mutationFn: (data) => api.create(data),
    onSuccess: () => {
      onSuccess();
      form.reset();
    },
  });
  
  useMutationError(mutation);
  
  return (
    <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))}>
      <ValidatedInput
        label="Name"
        error={form.getError('name')}
        {...form.register('name')}
      />
      {/* More fields */}
      <Button disabled={mutation.isPending}>
        {mutation.isPending ? <ButtonLoader /> : 'Submit'}
      </Button>
    </form>
  );
}
```

### Pattern 3: Search with Debouncing
```jsx
function SearchPage() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  
  const { data, isLoading } = useQuery({
    queryKey: ['items', debouncedSearch],
    queryFn: () => api.search(debouncedSearch),
  });
  
  return (
    <>
      <Input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search..."
      />
      {isLoading ? <InlineLoader /> : <Results data={data} />}
    </>
  );
}
```

## Best Practices

### Do's ✓
1. **Always validate forms** with Zod schemas
2. **Handle all errors** with consistent messaging
3. **Show loading states** for all async operations
4. **Announce changes** to screen readers
5. **Monitor performance** in development
6. **Use TypeScript** for better type safety
7. **Test with keyboard** navigation
8. **Invalidate queries** after mutations
9. **Reset forms** after success
10. **Add retry logic** for recoverable errors

### Don'ts ✗
1. **Don't ignore errors** - always handle them
2. **Don't show raw error messages** - make them user-friendly
3. **Don't forget loading states** - users need feedback
4. **Don't skip validation** - validate both client and server
5. **Don't forget accessibility** - test with keyboard
6. **Don't block UI** unnecessarily - use optimistic updates
7. **Don't forget to cleanup** - cancel queries, clear timeouts
8. **Don't over-fetch** - use pagination and filtering
9. **Don't hardcode strings** - use constants
10. **Don't skip performance monitoring** - track metrics

## Testing Workflow

### 1. Development Testing
```bash
# 1. Start dev tools
- Open DevToolsPanel (bottom right)
- Seed test data
- Monitor performance metrics

# 2. Test scenarios
- Create/Read/Update/Delete operations
- Form validation (valid and invalid)
- Error handling (network errors, validation errors)
- Loading states
- Keyboard navigation
- Screen reader announcements
```

### 2. Performance Testing
```bash
# Use DevToolsPanel to:
1. Check Core Web Vitals
2. Monitor performance budget
3. Review optimization recommendations
4. Test with various data volumes
```

### 3. Accessibility Testing
```bash
# Keyboard navigation
- Tab through forms
- Use arrow keys in lists
- Test escape key
- Verify focus indicators

# Screen reader
- Verify announcements
- Check ARIA labels
- Test form errors
```

## Troubleshooting

### Forms not validating?
- Check Zod schema definition
- Verify field names match schema
- Check register() is called correctly

### Mutations not working?
- Verify mutation key
- Check invalidateQueries() is called
- Ensure onSuccess/onError are defined

### Loading states not showing?
- Check isLoading from useQuery
- Verify isPending from useMutation
- Ensure components are imported correctly

### Errors not displaying?
- Check useErrorHandler is called
- Verify error boundaries are in place
- Check toast notifications are working

## Production Checklist

Before deploying:
- [ ] All forms have validation
- [ ] All mutations have error handling
- [ ] All async operations show loading states
- [ ] Performance metrics are acceptable
- [ ] Keyboard navigation works
- [ ] Screen reader announcements work
- [ ] Error messages are user-friendly
- [ ] No console errors
- [ ] Tested on mobile devices
- [ ] Tested with slow network
- [ ] Data seeding tools removed/disabled
- [ ] Performance monitoring configured

## Quick Reference

### Most Used Imports
```jsx
// Loading
import { PageLoader, ButtonLoader } from '@/components/common/LoadingStates';

// Error Handling
import { useErrorHandler } from '@/components/common/useErrorHandler';
import { useMutationError } from '@/components/common/MutationErrorToast';

// Validation
import { useValidatedForm } from '@/components/forms/useValidatedForm';
import { ValidatedInput } from '@/components/forms/ValidatedInput';

// Accessibility
import { announceToScreenReader } from '@/components/common/a11yUtils';
```

### Most Used Patterns
```jsx
// Query with error handling
const { data, isLoading, error } = useQuery({
  queryKey: ['key'],
  queryFn: api.fetch,
});

// Mutation with toast
const mutation = useMutation({
  mutationFn: api.create,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['key'] });
    toast.success('Success!');
  },
});
useMutationError(mutation);

// Validated form
const form = useValidatedForm(schema);
<form onSubmit={form.handleSubmit(onSubmit)}>
  <ValidatedInput error={form.getError('field')} {...form.register('field')} />
</form>
``