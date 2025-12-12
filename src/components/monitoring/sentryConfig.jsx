import * as Sentry from "@sentry/react";

/**
 * Initialize Sentry for error tracking
 * Call this once at app startup (e.g., in main entry point or Layout)
 */
export function initSentry() {
  // Only initialize in production or when explicitly enabled
  const isProduction = import.meta.env.PROD;
  const sentryDsn = import.meta.env.VITE_SENTRY_DSN;
  
  if (!sentryDsn) {
    console.warn('Sentry DSN not configured. Error tracking disabled.');
    return;
  }

  Sentry.init({
    dsn: sentryDsn,
    integrations: [
      new Sentry.BrowserTracing({
        // Set sampling rate for performance monitoring
        tracePropagationTargets: ["localhost", /^\//],
      }),
      new Sentry.Replay({
        // Session replay for debugging
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    
    // Performance Monitoring
    tracesSampleRate: isProduction ? 0.1 : 1.0, // Capture 10% of transactions in prod
    
    // Session Replay
    replaysSessionSampleRate: 0.1, // 10% of sessions
    replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors
    
    // Environment
    environment: isProduction ? 'production' : 'development',
    
    // Release tracking
    release: import.meta.env.VITE_APP_VERSION,
    
    // Filter out certain errors
    beforeSend(event, hint) {
      // Filter out cancelled requests
      if (hint?.originalException?.name === 'AbortError') {
        return null;
      }
      
      // Filter out network errors in development
      if (!isProduction && hint?.originalException?.message?.includes('Failed to fetch')) {
        return null;
      }
      
      return event;
    },
    
    // Ignore certain errors
    ignoreErrors: [
      // Browser extensions
      'top.GLOBALS',
      // Network errors
      'NetworkError',
      'Failed to fetch',
      // React dev warnings
      'Warning: ',
    ],
  });
}

/**
 * Manually capture an error
 */
export function captureError(error, context = {}) {
  Sentry.captureException(error, {
    extra: context,
  });
}

/**
 * Set user context for error tracking
 */
export function setUserContext(user) {
  if (user) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.full_name,
    });
  } else {
    Sentry.setUser(null);
  }
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(message, category = 'custom', level = 'info', data = {}) {
  Sentry.addBreadcrumb({
    message,
    category,
    level,
    data,
  });
}

/**
 * Wrap async operations with error tracking
 */
export async function withErrorTracking(operation, operationName = 'operation') {
  try {
    return await operation();
  } catch (error) {
    captureError(error, { operationName });
    throw error;
  }
}