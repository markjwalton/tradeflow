import { useCallback, useState } from 'react';
import { toast } from 'sonner';

/**
 * Hook for consistent error handling across the app
 */
export function useErrorHandler() {
  const [error, setError] = useState(null);

  const handleError = useCallback((err, options = {}) => {
    const {
      showToast = true,
      severity = 'error',
      customMessage = null,
      onError = null,
    } = options;

    // Set error state
    setError(err);

    // Extract error message
    const message = customMessage || err?.message || 'An error occurred';

    // Show toast notification
    if (showToast) {
      if (severity === 'error') {
        toast.error(message);
      } else if (severity === 'warning') {
        toast.warning(message);
      } else {
        toast.info(message);
      }
    }

    // Custom error callback
    if (onError) {
      onError(err);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught:', err);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    handleError,
    clearError,
  };
}

/**
 * Retry utility with exponential backoff
 */
export async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Don't retry on client errors (4xx)
      if (error?.status >= 400 && error?.status < 500) {
        throw error;
      }
      
      // Wait before retry (exponential backoff)
      if (i < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, i);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}