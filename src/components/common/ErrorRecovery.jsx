import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { RefreshCw, WifiOff, ShieldAlert, ServerCrash, AlertCircle } from 'lucide-react';
import { ErrorTypes } from './useErrorHandler';

const errorIcons = {
  [ErrorTypes.NETWORK]: WifiOff,
  [ErrorTypes.PERMISSION]: ShieldAlert,
  [ErrorTypes.SERVER]: ServerCrash,
  [ErrorTypes.UNKNOWN]: AlertCircle,
};

const errorTitles = {
  [ErrorTypes.NETWORK]: 'Connection Problem',
  [ErrorTypes.VALIDATION]: 'Validation Error',
  [ErrorTypes.PERMISSION]: 'Access Denied',
  [ErrorTypes.NOT_FOUND]: 'Not Found',
  [ErrorTypes.SERVER]: 'Server Error',
  [ErrorTypes.UNKNOWN]: 'Error Occurred',
};

export function ErrorRecovery({ 
  error, 
  errorType = ErrorTypes.UNKNOWN,
  onRetry,
  onDismiss,
  retryCount = 0,
  maxRetries = 3,
}) {
  const [isRetrying, setIsRetrying] = useState(false);
  const Icon = errorIcons[errorType] || AlertCircle;
  const title = errorTitles[errorType];
  const canRetry = onRetry && retryCount < maxRetries;

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await onRetry();
      onDismiss?.();
    } catch (err) {
      console.error('Retry failed:', err);
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <Alert variant="destructive" className="mb-4">
      <Icon className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="mt-2 space-y-3">
        <p className="text-sm">{error?.message || 'An unexpected error occurred.'}</p>
        
        <div className="flex gap-2">
          {canRetry && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleRetry}
              disabled={isRetrying}
            >
              {isRetrying ? (
                <>
                  <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                  Retrying...
                </>
              ) : (
                <>
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Retry ({maxRetries - retryCount} left)
                </>
              )}
            </Button>
          )}
          
          {onDismiss && (
            <Button size="sm" variant="ghost" onClick={onDismiss}>
              Dismiss
            </Button>
          )}
        </div>

        {retryCount > 0 && (
          <p className="text-xs text-muted-foreground">
            Retry attempt {retryCount} of {maxRetries}
          </p>
        )}
      </AlertDescription>
    </Alert>
  );
}

/**
 * Higher-order component for error recovery
 */
export function withErrorRecovery(Component, options = {}) {
  return function ErrorRecoveryWrapper(props) {
    const [error, setError] = useState(null);
    const [retryCount, setRetryCount] = useState(0);

    const handleError = (err) => {
      setError(err);
    };

    const handleRetry = async () => {
      setRetryCount(prev => prev + 1);
      setError(null);
      // Component will re-render and retry
    };

    const handleDismiss = () => {
      setError(null);
      setRetryCount(0);
    };

    if (error) {
      return (
        <ErrorRecovery
          error={error}
          onRetry={options.onRetry || handleRetry}
          onDismiss={handleDismiss}
          retryCount={retryCount}
          maxRetries={options.maxRetries || 3}
        />
      );
    }

    return <Component {...props} onError={handleError} />;
  };
}