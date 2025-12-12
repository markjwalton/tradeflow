import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

/**
 * Custom hook that combines react-hook-form with Zod validation
 */
export function useValidatedForm(schema, options = {}) {
  const form = useForm({
    resolver: zodResolver(schema),
    mode: options.mode || 'onBlur',
    ...options,
  });

  return {
    ...form,
    // Convenience method to get error message
    getError: (fieldName) => form.formState.errors[fieldName]?.message,
    // Check if field has error
    hasError: (fieldName) => !!form.formState.errors[fieldName],
    // Check if field is dirty
    isDirty: (fieldName) => form.formState.dirtyFields[fieldName],
    // Check if field was touched
    isTouched: (fieldName) => form.formState.touchedFields[fieldName],
  };
}