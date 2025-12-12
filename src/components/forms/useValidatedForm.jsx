import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { getErrorMessage } from './FormValidation';

/**
 * Hook for validated forms with consistent error handling
 */
export function useValidatedForm(schema, defaultValues = {}) {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues,
    mode: 'onBlur', // Validate on blur for better UX
  });

  /**
   * Handle form submission with error toasts
   */
  const handleSubmit = (onValid, onError) => {
    return form.handleSubmit(
      onValid,
      (errors) => {
        // Show first error as toast
        const firstError = Object.values(errors)[0];
        if (firstError) {
          toast.error(getErrorMessage(firstError));
        }
        
        if (onError) {
          onError(errors);
        }
      }
    );
  };

  return {
    ...form,
    handleSubmit,
  };
}