import React from 'react';
import { Button } from '@/components/ui/button';
import { useValidatedForm } from '@/components/forms/useValidatedForm';
import { ValidatedInput } from '@/components/forms/ValidatedInput';
import { ValidatedTextarea } from '@/components/forms/ValidatedTextarea';
import { ValidatedSelect } from '@/components/forms/ValidatedSelect';
import { toast } from 'sonner';
import { z } from 'zod';

const demoSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^[\d\s\-\+\(\)]+$/, 'Invalid phone number').optional(),
  message: z.string().max(500, 'Message too long').optional(),
  category: z.enum(['general', 'support', 'sales'], {
    required_error: 'Please select a category',
  }),
});

export default function FormShowcase() {
  const { register, handleSubmit, getError, formState, reset } = useValidatedForm(demoSchema);

  const onSubmit = (data) => {
    toast.success('Form submitted successfully!');
    console.log('Form data:', data);
    reset();
  };

  return (
    <div className="space-y-6" data-component="formCard">
      <div>
        <h3 className="text-lg font-display mb-2">Form Validation</h3>
        <p className="text-sm text-muted-foreground">
          Real-time validation with clear error feedback
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" data-element="demo-form">
        <ValidatedInput
          label="Name"
          {...register('name')}
          error={getError('name')}
          required
          helperText="Enter your full name"
        />

        <ValidatedInput
          label="Email"
          type="email"
          {...register('email')}
          error={getError('email')}
          required
        />

        <ValidatedInput
          label="Phone"
          {...register('phone')}
          error={getError('phone')}
          helperText="Optional"
        />

        <ValidatedSelect
          label="Category"
          {...register('category')}
          error={getError('category')}
          required
        >
          <option value="">Select a category</option>
          <option value="general">General Inquiry</option>
          <option value="support">Support Request</option>
          <option value="sales">Sales Question</option>
        </ValidatedSelect>

        <ValidatedTextarea
          label="Message"
          {...register('message')}
          error={getError('message')}
          maxLength={500}
          showCharCount
          helperText="Optional message (max 500 characters)"
        />

        <Button type="submit" disabled={formState.isSubmitting}>
          Submit Form
        </Button>
      </form>
    </div>
  );
}