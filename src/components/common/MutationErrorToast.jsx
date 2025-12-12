import { useEffect } from 'react';
import { toast } from 'sonner';
import { useErrorHandler } from './useErrorHandler';

/**
 * Automatically show toast for mutation errors
 */
export function MutationErrorToast({ error, resetError, retry, customMessage }) {
  const { handleError } = useErrorHandler();

  useEffect(() => {
    if (!error) return;

    const errorInfo = handleError(error, {
      showToast: true,
      customMessage,
      onRetry: retry,
    });

    // Auto-dismiss after showing
    const timer = setTimeout(() => {
      resetError?.();
    }, 5000);

    return () => clearTimeout(timer);
  }, [error, resetError, retry, customMessage, handleError]);

  return null;
}

/**
 * Hook to handle mutation errors with toast notifications
 */
export function useMutationError(mutation, options = {}) {
  const { handleError } = useErrorHandler();

  useEffect(() => {
    if (mutation.isError) {
      handleError(mutation.error, {
        showToast: true,
        customMessage: options.customMessage,
        onRetry: options.onRetry || (() => mutation.reset()),
      });
    }
  }, [mutation.isError, mutation.error, mutation, handleError, options]);

  return {
    hasError: mutation.isError,
    error: mutation.error,
    dismiss: mutation.reset,
  };
}