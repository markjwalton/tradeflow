import { useEffect, useCallback } from 'react';
import { captureError, captureMessage, addBreadcrumb } from './sentryConfig';
import { toast } from 'sonner';

/**
 * Hook for tracking errors with context and user-friendly notifications
 */
export function useErrorTracking() {
  // Track component lifecycle
  useEffect(() => {
    const componentName = new Error().stack?.split('\n')[2]?.trim() || 'Unknown';
    
    addBreadcrumb({
      category: 'lifecycle',
      message: `Component mounted: ${componentName}`,
      level: 'info',
    });

    return () => {
      addBreadcrumb({
        category: 'lifecycle',
        message: `Component unmounted: ${componentName}`,
        level: 'info',
      });
    };
  }, []);

  /**
   * Handle and report errors with user notification
   */
  const handleError = useCallback((error, context = {}, showToast = true) => {
    // Log to console in development
    if (import.meta.env.DEV) {
      console.error('Error:', error, 'Context:', context);
    }

    // Capture in Sentry
    captureError(error, {
      ...context,
      timestamp: new Date().toISOString(),
    });

    // Show user-friendly message
    if (showToast) {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage, {
        duration: 5000,
        action: {
          label: 'Report',
          onClick: () => {
            // Could open a feedback form or support chat
            console.log('User requested to report error');
          },
        },
      });
    }

    // Add breadcrumb for error handling
    addBreadcrumb({
      category: 'error',
      message: `Error handled: ${error.message}`,
      level: 'error',
      data: context,
    });
  }, []);

  /**
   * Track user actions
   */
  const trackAction = useCallback((action, data = {}) => {
    addBreadcrumb({
      category: 'user-action',
      message: action,
      level: 'info',
      data,
    });

    if (import.meta.env.DEV) {
      console.log('Action tracked:', action, data);
    }
  }, []);

  /**
   * Track API calls
   */
  const trackApiCall = useCallback((endpoint, method = 'GET', status = null) => {
    addBreadcrumb({
      category: 'http',
      message: `${method} ${endpoint}`,
      level: status >= 400 ? 'error' : 'info',
      data: { endpoint, method, status },
    });
  }, []);

  /**
   * Track navigation
   */
  const trackNavigation = useCallback((from, to) => {
    addBreadcrumb({
      category: 'navigation',
      message: `Navigated from ${from} to ${to}`,
      level: 'info',
      data: { from, to },
    });
  }, []);

  /**
   * Log custom messages to Sentry
   */
  const logMessage = useCallback((message, level = 'info', context = {}) => {
    captureMessage(message, level, context);
    
    if (import.meta.env.DEV) {
      console[level]('Message logged:', message, context);
    }
  }, []);

  return {
    handleError,
    trackAction,
    trackApiCall,
    trackNavigation,
    logMessage,
  };
}

/**
 * Extract user-friendly error message
 */
function getErrorMessage(error) {
  // Network errors
  if (error.message?.includes('fetch') || error.message?.includes('network')) {
    return 'Unable to connect. Please check your internet connection.';
  }

  // Auth errors
  if (error.message?.includes('401') || error.message?.includes('unauthorized')) {
    return 'Session expired. Please log in again.';
  }

  // Permission errors
  if (error.message?.includes('403') || error.message?.includes('forbidden')) {
    return 'You don\'t have permission to perform this action.';
  }

  // Not found errors
  if (error.message?.includes('404') || error.message?.includes('not found')) {
    return 'The requested resource was not found.';
  }

  // Server errors
  if (error.message?.includes('500') || error.message?.includes('server')) {
    return 'A server error occurred. We\'ve been notified and are working on it.';
  }

  // Validation errors
  if (error.message?.includes('validation') || error.message?.includes('invalid')) {
    return error.message; // These are usually user-friendly
  }

  // Default message
  return 'An unexpected error occurred. Please try again.';
}

/**
 * HOC to wrap components with error tracking
 */
export function withErrorTracking(Component, componentName) {
  return function ErrorTrackedComponent(props) {
    const { handleError } = useErrorTracking();

    useEffect(() => {
      // Track component mount
      addBreadcrumb({
        category: 'lifecycle',
        message: `${componentName} mounted`,
        level: 'info',
      });
    }, []);

    // Wrap component to catch render errors
    try {
      return <Component {...props} />;
    } catch (error) {
      handleError(error, { component: componentName });
      return null;
    }
  };
}