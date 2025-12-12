import * as Sentry from "@sentry/react";

let sentryInitialized = false;

export function initializeSentry() {
  if (sentryInitialized) return;
  
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  const environment = import.meta.env.VITE_SENTRY_ENVIRONMENT || 'development';
  
  // Only initialize if DSN is provided
  if (!dsn) {
    console.info('Sentry DSN not configured - error tracking disabled');
    return;
  }

  try {
    Sentry.init({
      dsn,
      environment,
      integrations: [
        new Sentry.BrowserTracing({
          // Trace navigation and interactions
          tracePropagationTargets: ["localhost", /^\//],
        }),
        new Sentry.Replay({
          // Mask all text and input content by default
          maskAllText: true,
          blockAllMedia: true,
        }),
      ],
      
      // Performance Monitoring
      tracesSampleRate: environment === 'production' ? 0.1 : 1.0,
      
      // Session Replay
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
      
      // Release tracking
      release: import.meta.env.VITE_APP_VERSION || 'unknown',
      
      // Error filtering
      beforeSend(event, hint) {
        // Filter out known non-critical errors
        const error = hint.originalException;
        
        // Don't send aborted requests
        if (error?.name === 'AbortError') return null;
        
        // Don't send network errors from ad blockers
        if (error?.message?.includes('chrome-extension')) return null;
        
        // Add user context if available
        try {
          const userEmail = localStorage.getItem('user_email');
          if (userEmail) {
            event.user = {
              ...event.user,
              email: userEmail,
            };
          }
        } catch (e) {
          // Ignore localStorage errors
        }
        
        return event;
      },
      
      // Breadcrumbs configuration
      maxBreadcrumbs: 50,
      
      // Don't send in development by default
      enabled: environment !== 'development',
    });

    sentryInitialized = true;
    console.info(`Sentry initialized in ${environment} mode`);
  } catch (error) {
    console.error('Failed to initialize Sentry:', error);
  }
}

export function captureError(error, context = {}) {
  if (!sentryInitialized) {
    console.error('Sentry not initialized, logging error:', error, context);
    return;
  }

  Sentry.captureException(error, {
    contexts: {
      custom: context,
    },
  });
}

export function captureMessage(message, level = 'info', context = {}) {
  if (!sentryInitialized) {
    console[level]('Sentry not initialized, logging message:', message, context);
    return;
  }

  Sentry.captureMessage(message, {
    level,
    contexts: {
      custom: context,
    },
  });
}

export function setUserContext(user) {
  if (!sentryInitialized) return;

  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.full_name,
  });
}

export function addBreadcrumb(breadcrumb) {
  if (!sentryInitialized) return;

  Sentry.addBreadcrumb(breadcrumb);
}

export { Sentry };