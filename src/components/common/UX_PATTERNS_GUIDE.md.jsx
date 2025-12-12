# UX Enhancement Patterns Guide

Complete guide to the UX enhancement systems integrated across the application.

## 🎯 Overview

This guide documents the comprehensive UX enhancement patterns implemented across all CRUD pages:
- **Loading States** - Skeleton loaders and spinners
- **Error Handling** - User-friendly error messages with recovery
- **Mutation Feedback** - Toast notifications and loading indicators
- **Debounced Search** - Optimized search performance
- **Form Validation** - Real-time validation with clear feedback

## 📚 Table of Contents

1. [Loading States](#loading-states)
2. [Error Handling](#error-handling)
3. [Mutation Feedback](#mutation-feedback)
4. [Debounced Search](#debounced-search)
5. [Form Validation](#form-validation)
6. [Implementation Examples](#implementation-examples)
7. [Best Practices](#best-practices)

---

## 🔄 Loading States

### Available Components

```jsx
import {
  PageLoader,        // Full-page loading
  InlineLoader,      // Inline loading indicator
  TableLoader,       // Table skeleton
  CardGridLoader,    // Card grid skeleton
  ListLoader,        // List skeleton
  FormLoader,        // Form skeleton
  StatsLoader,       // Stats cards skeleton
  ButtonLoader       // Button spinner
} from "@/components/common/LoadingStates";
```

### Usage Examples

#### Page-Level Loading
```jsx
const { data, isLoading, error } = useQuery({
  queryKey: ["items"],
  queryFn: () => base44.entities.Item.list(),
});

if (isLoading) {
  return <PageLoader message="Loading items..." />;
}
```

#### Button Loading
```jsx
<Button disabled={mutation.isPending}>
  {mutation.isPending && <ButtonLoader />}
  Save Changes
</Button>
```

#### Card Grid Loading
```jsx
{isLoading ? (
  <CardGridLoader columns={3} count={6} />
) : (
  <div className="grid grid-cols-3 gap-4">
    {items.map(item => <ItemCard key={item.id} item={item} />)}
  </div>
)}
```

---

## ⚠️ Error Handling

### Components

```jsx
import { QueryErrorState } from "@/components/common/QueryErrorState";
import { ErrorRecovery } from "@/components/common/ErrorRecovery";
import { useMutationError } from "@/components/common/MutationErrorToast";
```

### Query Error Handling

```jsx
const { data, isLoading, error, refetch } = useQuery({
  queryKey: ["items"],
  queryFn: () => base44.entities.Item.list(),
});

if (error) {
  return <QueryErrorState error={error} onRetry={refetch} />;
}
```

### Mutation Error Handling

```jsx
const createMutation = useMutation({
  mutationFn: (data) => base44.entities.Item.create(data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["items"] });
    toast.success("Item created successfully");
  },
});

// Automatic error toasts
useMutationError(createMutation, { 
  customMessage: "Failed to create item" 
});
```

### Error Recovery Pattern

```jsx
import { withErrorRecovery } from "@/components/common/ErrorRecovery";

const MyComponent = withErrorRecovery(({ data, onRetry }) => {
  // Component logic
});
```

---

## 🎉 Mutation Feedback

### Toast Notifications

```jsx
import { toast } from "sonner";

// Success
toast.success("Item created successfully");

// Error
toast.error("Failed to create item");

// Info
toast.info("Processing your request...");

// Warning
toast.warning("This action cannot be undone");
```

### Mutation States

```jsx
const deleteMutation = useMutation({
  mutationFn: (id) => base44.entities.Item.delete(id),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["items"] });
    toast.success("Item deleted successfully");
  },
});

// In component
<Button 
  onClick={() => deleteMutation.mutate(item.id)}
  disabled={deleteMutation.isPending}
>
  {deleteMutation.isPending ? <ButtonLoader /> : <Trash2 />}
</Button>
```

### Optimistic Updates

```jsx
const updateMutation = useMutation({
  mutationFn: ({ id, data }) => base44.entities.Item.update(id, data),
  onMutate: async ({ id, data }) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: ["items"] });
    
    // Snapshot previous value
    const previous = queryClient.getQueryData(["items"]);
    
    // Optimistically update
    queryClient.setQueryData(["items"], (old) =>
      old.map((item) => (item.id === id ? { ...item, ...data } : item))
    );
    
    return { previous };
  },
  onError: (err, variables, context) => {
    // Rollback on error
    queryClient.setQueryData(["items"], context.previous);
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ["items"] });
  },
});
```

---

## 🔍 Debounced Search

### Hook Usage

```jsx
import { useDebounce } from "@/components/common/useDebounce";

const [search, setSearch] = useState("");
const debouncedSearch = useDebounce(search, 300);

// Use debouncedSearch in filtering
const filteredItems = items.filter((item) =>
  item.name.toLowerCase().includes(debouncedSearch.toLowerCase())
);
```

### Complete Search Pattern

```jsx
const [search, setSearch] = useState("");
const debouncedSearch = useDebounce(search, 300);

return (
  <>
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" />
      <Input
        placeholder="Search..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="pl-10"
      />
    </div>
    
    {/* Results use debouncedSearch */}
    <div className="mt-4">
      {filteredItems.map(item => <ItemCard key={item.id} item={item} />)}
    </div>
  </>
);
```

---

## ✅ Form Validation

### Available Components

```jsx
import {
  ValidatedInput,
  ValidatedTextarea,
  ValidatedSelect
} from "@/components/forms";

import { useValidatedForm } from "@/components/forms/useValidatedForm";
import {
  projectSchema,
  taskSchema,
  customerSchema,
  teamMemberSchema
} from "@/components/forms/FormValidation";
```

### Validation Schemas

```jsx
import { z } from "zod";
import { email, phone, requiredString } from "@/components/forms/FormValidation";

const mySchema = z.object({
  name: requiredString("Name is required"),
  email: email(),
  phone: phone(),
  description: z.string().optional(),
});
```

### Form with Validation

```jsx
const {
  register,
  handleSubmit,
  formState: { errors },
  getError,
  hasError,
} = useValidatedForm(projectSchema);

return (
  <form onSubmit={handleSubmit(onSubmit)}>
    <ValidatedInput
      label="Project Name"
      {...register("name")}
      error={getError("name")}
      required
    />
    
    <ValidatedTextarea
      label="Description"
      {...register("description")}
      error={getError("description")}
      maxLength={500}
      showCharCount
    />
    
    <Button type="submit">Submit</Button>
  </form>
);
```

---

## 📋 Implementation Examples

### Complete CRUD Page Pattern

```jsx
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageLoader, ButtonLoader, CardGridLoader } from "@/components/common/LoadingStates";
import { QueryErrorState } from "@/components/common/QueryErrorState";
import { useMutationError } from "@/components/common/MutationErrorToast";
import { useDebounce } from "@/components/common/useDebounce";
import { toast } from "sonner";

export default function ItemsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  
  // Queries
  const { data: items = [], isLoading, error, refetch } = useQuery({
    queryKey: ["items"],
    queryFn: () => base44.entities.Item.list(),
  });
  
  // Mutations
  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Item.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
      toast.success("Item created successfully");
    },
  });
  
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Item.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
      toast.success("Item updated successfully");
    },
  });
  
  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Item.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
      toast.success("Item deleted successfully");
    },
  });
  
  // Error handling
  useMutationError(createMutation, { customMessage: "Failed to create item" });
  useMutationError(updateMutation, { customMessage: "Failed to update item" });
  useMutationError(deleteMutation, { customMessage: "Failed to delete item" });
  
  // Filtering
  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(debouncedSearch.toLowerCase())
  );
  
  // Loading state
  if (isLoading) {
    return <PageLoader message="Loading items..." />;
  }
  
  // Error state
  if (error) {
    return <QueryErrorState error={error} onRetry={refetch} />;
  }
  
  return (
    <div className="p-6">
      {/* Header with search */}
      <div className="flex justify-between items-center mb-6">
        <h1>Items</h1>
        <Input
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      
      {/* Content */}
      <div className="grid grid-cols-3 gap-4">
        {filteredItems.map((item) => (
          <Card key={item.id}>
            <CardContent>
              <h3>{item.name}</h3>
              <Button
                onClick={() => deleteMutation.mutate(item.id)}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? <ButtonLoader /> : "Delete"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

---

## ✨ Best Practices

### 1. Always Handle Loading States
```jsx
// ✅ Good
if (isLoading) return <PageLoader />;
if (error) return <QueryErrorState error={error} />;

// ❌ Bad
if (isLoading) return <div>Loading...</div>;
```

### 2. Use Debounced Search
```jsx
// ✅ Good
const debouncedSearch = useDebounce(search, 300);
const filtered = items.filter(i => i.name.includes(debouncedSearch));

// ❌ Bad
const filtered = items.filter(i => i.name.includes(search));
```

### 3. Provide Mutation Feedback
```jsx
// ✅ Good
onSuccess: () => toast.success("Item created successfully");

// ❌ Bad
onSuccess: () => { /* silent success */ }
```

### 4. Disable Buttons During Mutations
```jsx
// ✅ Good
<Button disabled={mutation.isPending}>
  {mutation.isPending && <ButtonLoader />}
  Save
</Button>

// ❌ Bad
<Button onClick={handleSave}>Save</Button>
```

### 5. Use Appropriate Loaders
```jsx
// ✅ Good - Use specific loaders
<CardGridLoader columns={3} count={6} />
<TableLoader columns={5} rows={8} />

// ❌ Bad - Generic loading
<Loader2 className="animate-spin" />
```

---

## 🎨 UI Consistency

### Spacing Standards
- Page padding: `p-6`
- Card gaps: `gap-4`
- Section spacing: `space-y-4`
- Header margin: `mb-6`

### Color Usage
- Success: `bg-success-50 text-success`
- Warning: `bg-warning-50 text-warning`
- Error: `bg-destructive-50 text-destructive`
- Info: `bg-info-50 text-info`

### Button States
```jsx
// Primary action
<Button>Create Item</Button>

// Secondary action
<Button variant="outline">Cancel</Button>

// Destructive action
<Button variant="destructive">Delete</Button>

// Ghost action
<Button variant="ghost" size="icon"><Pencil /></Button>
```

---

## 🔗 Related Resources

- [UX Showcase Page](/UXShowcase) - Live examples
- [Loading States Component](/components/common/LoadingStates.jsx)
- [Error Handling Components](/components/common/)
- [Form Validation Guide](/components/forms/FORM_VALIDATION_GUIDE.md)

---

## 📊 Implementation Status

### ✅ Completed Pages
- Projects
- Tasks
- Customers
- Team
- Estimates
- Calendar

### 🎯 Pattern Coverage
- ✅ Loading States
- ✅ Error Handling
- ✅ Mutation Feedback
- ✅ Debounced Search
- ✅ Form Validation

---

## 🚀 Quick Start Checklist

When creating a new CRUD page:

1. **Import utilities**
   ```jsx
   import { PageLoader, ButtonLoader } from "@/components/common/LoadingStates";
   import { QueryErrorState } from "@/components/common/QueryErrorState";
   import { useMutationError } from "@/components/common/MutationErrorToast";
   import { useDebounce } from "@/components/common/useDebounce";
   ```

2. **Add debounced search**
   ```jsx
   const [search, setSearch] = useState("");
   const debouncedSearch = useDebounce(search, 300);
   ```

3. **Handle query states**
   ```jsx
   if (isLoading) return <PageLoader />;
   if (error) return <QueryErrorState error={error} onRetry={refetch} />;
   ```

4. **Add mutation error handling**
   ```jsx
   useMutationError(createMutation, { customMessage: "..." });
   ```

5. **Use button loaders**
   ```jsx
   {mutation.isPending ? <ButtonLoader /> : "Save"}
   ```

---

*Last updated: 2025-12-12*