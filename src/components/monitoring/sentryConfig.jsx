import * as Sentry from "@sentry/react";

/**
 * Sentry Configuration for Error Tracking
 * 
 * To enable Sentry:
 * 1. Set VITE_SENTRY_DSN environment variable
 * 2. Set VITE_SENTRY_ENVIRONMENT (production, staging, development)
 * 3. Optionally set VITE_APP_VERSION for release tracking
 */

export function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  
  // Don't initialize if DSN is not set
  if (!dsn) {
    console.log('Sentry DSN not configured - error tracking disabled');
    return;
  }

  Sentry.init({
    dsn,
    environment: import.meta.env.VITE_SENTRY_ENVIRONMENT || 'development',
    release: import.meta.env.VITE_APP_VERSION || 'unknown',
    
    // Performance Monitoring
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    
    // Set tracesSampleRate to 1.0 to capture 100% of transactions
    // In production, reduce this value
    tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
    
    // Capture Replay for 10% of all sessions,
    // plus 100% of sessions with an error
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    
    // Ignore specific errors
    ignoreErrors: [
      // Browser extensions
      'ResizeObserver loop',
      'Non-Error promise rejection captured',
      // Network errors
      'NetworkError',
      'Failed to fetch',
      // React Router navigation
      'Navigation cancelled',
    ],
    
    // Filter sensitive data
    beforeSend(event, hint) {
      // Don't send events in development
      if (import.meta.env.DEV) {
        console.log('Sentry event (not sent in dev):', event);
        return null;
      }
      
      // Filter out sensitive information
      if (event.request) {
        delete event.request.cookies;
        delete event.request.headers?.Authorization;
      }
      
      return event;
    },
    
    // Tag all events with environment info
    initialScope: {
      tags: {
        app: 'base44-app',
      },
    },
  });
  
  console.log('Sentry initialized for environment:', import.meta.env.VITE_SENTRY_ENVIRONMENT);
}

/**
 * Manually capture an exception
 */
export function captureException(error, context = {}) {
  if (import.meta.env.DEV) {
    console.error('Error captured:', error, context);
    return;
  }
  
  Sentry.captureException(error, {
    extra: context,
  });
}

/**
 * Manually capture a message
 */
export function captureMessage(message, level = 'info', context = {}) {
  if (import.meta.env.DEV) {
    console.log(`[${level}] ${message}`, context);
    return;
  }
  
  Sentry.captureMessage(message, {
    level,
    extra: context,
  });
}

/**
 * Set user context
 */
export function setUserContext(user) {
  if (!user) {
    Sentry.setUser(null);
    return;
  }
  
  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.full_name,
  });
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(message, category, data = {}) {
  Sentry.addBreadcrumb({
    message,
    category,
    data,
    level: 'info',
  });
}