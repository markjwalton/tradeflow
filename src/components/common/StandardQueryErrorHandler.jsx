import { toast } from 'sonner';

/**
 * Standardized error handler for React Query
 * Provides consistent user feedback and logging
 */
export const handleQueryError = (error, context = {}) => {
  console.error('Query error:', error, context);
  
  const errorMessage = getErrorMessage(error);
  
  toast.error(errorMessage, {
    duration: 5000,
    action: context.retry ? {
      label: 'Retry',
      onClick: context.retry,
    } : undefined,
  });
};

/**
 * Extract user-friendly error message
 */
export const getErrorMessage = (error) => {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error?.message) {
    return error.message;
  }
  
  if (error?.status === 404) {
    return 'Resource not found';
  }
  
  if (error?.status === 403) {
    return 'You do not have permission to access this resource';
  }
  
  if (error?.status === 401) {
    return 'Please log in to continue';
  }
  
  if (error?.status >= 500) {
    return 'Server error. Please try again later.';
  }
  
  return 'An unexpected error occurred';
};

/**
 * Standard query configuration with error handling
 */
export const withErrorHandling = (queryFn, options = {}) => {
  return {
    queryFn,
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors
      if (error?.status >= 400 && error?.status < 500) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    onError: (error) => {
      handleQueryError(error, {
        retry: options.retry,
        context: options.errorContext,
      });
    },
    ...options,
  };
};

/**
 * Hook for mutation error handling
 */
export const useMutationErrorHandler = () => {
  return {
    onError: (error, variables, context) => {
      handleQueryError(error, {
        context: { variables, rollback: context },
      });
    },
  };
};