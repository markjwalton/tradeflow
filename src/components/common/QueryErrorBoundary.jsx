import React from 'react';
import { QueryErrorResetBoundary } from '@tanstack/react-query';
import { ErrorBoundary } from './ErrorBoundary';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, RefreshCw } from 'lucide-react';

/**
 * Combined Query + Error boundary for React Query errors
 * Provides automatic retry on error with query cache reset
 */
export function QueryErrorBoundary({ children, fallback }) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          fallback={
            fallback || (
              <div className="min-h-[400px] flex items-center justify-center p-6">
                <Card className="max-w-md w-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-destructive">
                      <AlertCircle className="h-5 w-5" />
                      Data Loading Error
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Failed to load data. Please try again.
                    </p>
                    <Button onClick={reset} className="w-full">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Retry
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )
          }
        >
          {children}
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}