import { useCallback } from 'react';
import { toast } from 'sonner';

/**
 * Error type classifications
 */
export const ErrorTypes = {
  NETWORK: 'network',
  VALIDATION: 'validation',
  PERMISSION: 'permission',
  NOT_FOUND: 'not_found',
  SERVER: 'server',
  UNKNOWN: 'unknown',
};

/**
 * Classify error based on status code or error properties
 */
function classifyError(error) {
  if (!navigator.onLine) return ErrorTypes.NETWORK;
  
  const status = error?.status || error?.response?.status;
  
  if (status === 401 || status === 403) return ErrorTypes.PERMISSION;
  if (status === 404) return ErrorTypes.NOT_FOUND;
  if (status === 400 || status === 422) return ErrorTypes.VALIDATION;
  if (status >= 500) return ErrorTypes.SERVER;
  if (error?.message?.toLowerCase().includes('network')) return ErrorTypes.NETWORK;
  
  return ErrorTypes.UNKNOWN;
}

/**
 * Get user-friendly error message based on error type
 */
function getUserMessage(errorType, error, customMessage) {
  if (customMessage) return customMessage;
  
  const messages = {
    [ErrorTypes.NETWORK]: 'Connection lost. Please check your internet and try again.',
    [ErrorTypes.VALIDATION]: 'Please check your input and try again.',
    [ErrorTypes.PERMISSION]: 'You don\'t have permission to perform this action.',
    [ErrorTypes.NOT_FOUND]: 'The requested resource was not found.',
    [ErrorTypes.SERVER]: 'Server error. Our team has been notified.',
    [ErrorTypes.UNKNOWN]: 'Something went wrong. Please try again.',
  };
  
  return messages[errorType] || messages[ErrorTypes.UNKNOWN];
}

/**
 * Custom hook for consistent error handling
 */
export function useErrorHandler() {
  const handleError = useCallback((error, options = {}) => {
    const {
      showToast = true,
      logToConsole = true,
      customMessage = null,
      onRetry = null,
    } = options;
    
    const errorType = classifyError(error);
    const userMessage = getUserMessage(errorType, error, customMessage);
    
    if (logToConsole) {
      console.error('Error caught:', {
        type: errorType,
        error,
        message: error?.message,
        stack: error?.stack,
      });
    }
    
    if (showToast) {
      toast.error(userMessage, {
        action: onRetry ? {
          label: 'Retry',
          onClick: onRetry,
        } : undefined,
      });
    }
    
    return {
      type: errorType,
      message: userMessage,
      originalError: error,
    };
  }, []);

  return { handleError, classifyError, ErrorTypes };
}