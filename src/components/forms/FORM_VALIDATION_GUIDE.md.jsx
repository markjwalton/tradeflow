# Form Validation Guide

## Overview
Comprehensive form validation system using Zod schemas and React Hook Form with reusable validated components.

## Quick Start

### Basic Form with Validation
```jsx
import { useValidatedForm } from '@/components/forms/useValidatedForm';
import { ValidatedInput } from '@/components/forms/ValidatedInput';
import { customerSchema } from '@/components/forms/FormValidation';

function CustomerForm() {
  const { register, handleSubmit, getError, formState } = useValidatedForm(customerSchema);

  const onSubmit = (data) => {
    console.log('Valid data:', data);
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
        helperText="We'll never share your email"
        {...register('email')}
      />
      
      <Button type="submit" disabled={formState.isSubmitting}>
        Submit
      </Button>
    </form>
  );
}
```

## Validation Schemas

### Pre-built Schemas
```javascript
import {
  projectSchema,
  taskSchema,
  customerSchema,
  teamMemberSchema,
} from '@/components/forms/FormValidation';
```

### Common Validation Rules
```javascript
import { ValidationSchemas } from '@/components/forms/FormValidation';

// Email validation
ValidationSchemas.email

// Phone number validation
ValidationSchemas.phone

// URL validation
ValidationSchemas.url

// Required field
ValidationSchemas.required

// Positive number
ValidationSchemas.positiveNumber

// Future date
ValidationSchemas.futureDate
```

### Custom Schema
```javascript
import { z } from 'zod';
import { ValidationSchemas } from '@/components/forms/FormValidation';

const customSchema = z.object({
  username: ValidationSchemas.required
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be less than 20 characters'),
  
  age: ValidationSchemas.positiveNumber
    .min(18, 'Must be at least 18 years old'),
  
  website: ValidationSchemas.url.optional(),
  
  bio: z.string()
    .max(500, 'Bio must be less than 500 characters')
    .optional(),
});
```

## Validated Components

### ValidatedInput
```jsx
<ValidatedInput
  label="Email Address"
  type="email"
  required
  error={getError('email')}
  helperText="Enter your work email"
  {...register('email')}
/>
```

Props:
- `label`: Field label
- `error`: Error message string
- `required`: Show required indicator
- `helperText`: Helper text below input
- All standard input props

### ValidatedTextarea
```jsx
<ValidatedTextarea
  label="Description"
  required
  error={getError('description')}
  maxLength={500}
  showCharCount
  helperText="Describe the project in detail"
  {...register('description')}
/>
```

Props:
- `label`: Field label
- `error`: Error message string
- `required`: Show required indicator
- `helperText`: Helper text below textarea
- `maxLength`: Character limit
- `showCharCount`: Show character counter
- All standard textarea props

### ValidatedSelect
```jsx
<ValidatedSelect
  label="Status"
  required
  error={getError('status')}
  placeholder="Select status"
  options={[
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
  ]}
  value={watch('status')}
  onValueChange={(value) => setValue('status', value)}
/>
```

Props:
- `label`: Field label
- `error`: Error message string
- `required`: Show required indicator
- `helperText`: Helper text below select
- `options`: Array of `{ value, label }` objects
- `placeholder`: Placeholder text
- `value`: Current value
- `onValueChange`: Change handler

## useValidatedForm Hook

### Basic Usage
```javascript
const form = useValidatedForm(schema, {
  defaultValues: { name: '', email: '' },
  mode: 'onBlur', // 'onChange', 'onSubmit', 'onTouched', 'all'
});
```

### Available Methods
```javascript
const {
  register,        // Register input
  handleSubmit,    // Handle form submission
  setValue,        // Set field value programmatically
  watch,           // Watch field values
  reset,           // Reset form
  formState,       // Form state (errors, isSubmitting, etc.)
  
  // Convenience methods
  getError,        // Get error message for field
  hasError,        // Check if field has error
  isDirty,         // Check if field is dirty
  isTouched,       // Check if field was touched
} = useValidatedForm(schema);
```

## Advanced Usage

### Conditional Validation
```javascript
const schema = z.object({
  hasCompany: z.boolean(),
  companyName: z.string().optional(),
}).refine(
  (data) => !data.hasCompany || data.companyName,
  {
    message: 'Company name is required when "Has Company" is checked',
    path: ['companyName'],
  }
);
```

### Async Validation
```javascript
const schema = z.object({
  email: z.string().email().refine(
    async (email) => {
      const exists = await checkEmailExists(email);
      return !exists;
    },
    { message: 'Email already exists' }
  ),
});
```

### Cross-Field Validation
```javascript
const schema = z.object({
  password: z.string().min(8),
  confirmPassword: z.string(),
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  }
);
```

### Dynamic Schema
```javascript
function createUserSchema(isAdmin) {
  return z.object({
    name: ValidationSchemas.required,
    email: ValidationSchemas.email,
    role: isAdmin
      ? z.enum(['admin', 'manager', 'user'])
      : z.enum(['user']),
  });
}
```

## Form Submission

### Basic Submission
```javascript
const onSubmit = async (data) => {
  try {
    await api.create(data);
    toast.success('Created successfully');
    reset();
  } catch (error) {
    toast.error('Failed to create');
  }
};
```

### With Mutation
```javascript
const mutation = useMutation({
  mutationFn: (data) => base44.entities.Customer.create(data),
  onSuccess: () => {
    toast.success('Created successfully');
    reset();
  },
});

const onSubmit = (data) => {
  mutation.mutate(data);
};
```

## Error Handling

### Display All Errors
```jsx
{Object.keys(formState.errors).length > 0 && (
  <Alert variant="destructive">
    <AlertTitle>Validation Errors</AlertTitle>
    <ul className="text-sm space-y-1">
      {Object.entries(formState.errors).map(([field, error]) => (
        <li key={field}>{error.message}</li>
      ))}
    </ul>
  </Alert>
)}
```

### Server-side Errors
```javascript
const onSubmit = async (data) => {
  try {
    await api.create(data);
  } catch (error) {
    if (error.response?.data?.errors) {
      // Set server errors on form
      Object.entries(error.response.data.errors).forEach(([field, message]) => {
        setError(field, { message });
      });
    }
  }
};
```

## Best Practices

1. **Always validate on both client and server**
2. **Use meaningful error messages**
3. **Show validation feedback early** (onBlur mode)
4. **Disable submit button** when form is invalid
5. **Clear errors** on field change
6. **Reset form** after successful submission
7. **Handle loading states** during submission
8. **Use helper text** for complex fields
9. **Group related validations** in schemas
10. **Test edge cases** thoroughly