import React from 'react';
import { useQueryErrorResetBoundary } from '@tanstack/react-query';
import { ErrorBoundary } from './ErrorBoundary';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

export function QueryErrorBoundary({ children }) {
  const { reset } = useQueryErrorResetBoundary();

  return (
    <ErrorBoundary
      onReset={reset}
      fallback={({ error, resetErrorBoundary }) => (
        <div className="min-h-[400px] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-destructive-50 border border-destructive-200 rounded-lg p-6 space-y-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-6 w-6 text-destructive-700" />
              <h3 className="text-lg font-semibold text-destructive-700">
                Something went wrong
              </h3>
            </div>
            <p className="text-sm text-destructive-700">
              {error?.message || 'An unexpected error occurred while loading data.'}
            </p>
            <div className="flex gap-2">
              <Button
                onClick={() => resetErrorBoundary()}
                variant="outline"
                size="sm"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                size="sm"
              >
                Reload Page
              </Button>
            </div>
          </div>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  );
}