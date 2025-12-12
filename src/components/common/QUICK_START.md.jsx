# Quick Start Guide

Get up and running with all UX enhancement systems in 5 minutes.

## 1. Create a New Page (2 minutes)

```jsx
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { PageLoader } from '@/components/common/LoadingStates';
import { ErrorRecovery } from '@/components/common/ErrorRecovery';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function MyPage() {
  const queryClient = useQueryClient();
  
  // Fetch data
  const { data: items = [], isLoading, error, refetch } = useQuery({
    queryKey: ['items'],
    queryFn: () => base44.entities.Item.list(),
  });
  
  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Item.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      toast.success('Item created');
    },
    onError: (err) => {
      toast.error('Failed to create item');
    },
  });
  
  // Loading state
  if (isLoading) return <PageLoader />;
  
  // Error state
  if (error) return <ErrorRecovery error={error} onRetry={refetch} />;
  
  // Render
  return (
    <div className="p-6">
      <h1>My Page</h1>
      <Button onClick={() => createMutation.mutate({ name: 'New Item' })}>
        Add Item
      </Button>
      {items.map(item => <div key={item.id}>{item.name}</div>)}
    </div>
  );
}
```

## 2. Add Form Validation (2 minutes)

```jsx
// Define schema
import { z } from 'zod';
import { ValidationSchemas } from '@/components/forms/FormValidation';

const itemSchema = z.object({
  name: ValidationSchemas.required,
  email: ValidationSchemas.email,
});

// Use in component
import { useValidatedForm } from '@/components/forms/useValidatedForm';
import { ValidatedInput } from '@/components/forms/ValidatedInput';

function MyForm() {
  const { register, handleSubmit, getError, reset } = useValidatedForm(itemSchema);
  
  const onSubmit = (data) => {
    console.log('Valid data:', data);
    reset();
  };
  
  return (
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
        {...register('email')}
      />
      <Button type="submit">Submit</Button>
    </form>
  );
}
```

## 3. Add Error Handling (1 minute)

```jsx
import { useMutationError } from '@/components/common/MutationErrorToast';

// Automatically show toast for mutation errors
const mutation = useMutation({...});
useMutationError(mutation, {
  customMessage: 'Failed to create item',
});
```

## That's It! 🎉

You now have:
- ✅ Data fetching with loading states
- ✅ Error handling with recovery
- ✅ Form validation with inline errors
- ✅ Automatic toast notifications
- ✅ Proper TypeScript types
- ✅ Accessibility features

## Next Steps

### Add Search
```jsx
import { useDebounce } from '@/components/common/useDebounce';

const [search, setSearch] = useState('');
const debouncedSearch = useDebounce(search, 300);

const { data } = useQuery({
  queryKey: ['items', debouncedSearch],
  queryFn: () => api.search(debouncedSearch),
});
```

### Add Pagination
```jsx
import { Pagination } from '@/components/ui/Pagination';

const [page, setPage] = useState(1);
const itemsPerPage = 10;
const totalPages = Math.ceil(items.length / itemsPerPage);

<Pagination 
  currentPage={page} 
  totalPages={totalPages} 
  onPageChange={setPage} 
/>
```

### Add Performance Monitoring
```jsx
import { usePerformanceMark } from '@/components/monitoring/usePerformanceMonitoring';

usePerformanceMark('page-load');
```

### Use Dev Tools
```jsx
// Add to your app (development only)
import { DevToolsPanel } from '@/components/dev-tools/DevToolsPanel';

{process.env.NODE_ENV === 'development' && <DevToolsPanel />}
```

## Common Recipes

### Recipe: List with Create/Edit/Delete
```jsx
function ItemList() {
  const [editing, setEditing] = useState(null);
  
  const { data: items = [] } = useQuery({...});
  
  const createMutation = useMutation({...});
  const updateMutation = useMutation({...});
  const deleteMutation = useMutation({...});
  
  useMutationError(createMutation);
  useMutationError(updateMutation);
  useMutationError(deleteMutation);
  
  return (/* ... */);
}
```

### Recipe: Search + Filter + Pagination
```jsx
function SearchablePage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  
  const debouncedSearch = useDebounce(search, 300);
  
  const filtered = items.filter(item => {
    const matchesSearch = item.name.includes(debouncedSearch);
    const matchesFilter = filter === 'all' || item.status === filter;
    return matchesSearch && matchesFilter;
  });
  
  const paginated = filtered.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );
  
  return (/* ... */);
}
```

### Recipe: Multi-step Form
```jsx
function MultiStepForm() {
  const [step, setStep] = useState(1);
  const form = useValidatedForm(schema);
  
  const handleNext = async () => {
    const isValid = await form.trigger(); // Validate current step
    if (isValid) setStep(step + 1);
  };
  
  return (/* ... */);
}
```

## Troubleshooting

**Forms not validating?**
- Check schema definition
- Verify field names match
- Ensure register() is called

**Mutations not updating?**
- Check invalidateQueries()
- Verify query keys match
- Check onSuccess callback

**Loading states not showing?**
- Import correct component
- Check isLoading from useQuery
- Verify component is rendered

**Need Help?**
- Check `UX_INTEGRATION_GUIDE.md` for detailed examples
- Review `IMPLEMENTATION_CHECKLIST.md` for complete guide
- Use Dev Tools to debug and test