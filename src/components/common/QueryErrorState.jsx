import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

export function QueryErrorState({ error, onRetry }) {
  return (
    <div className="min-h-[300px] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-4">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-full bg-destructive-50 flex items-center justify-center">
            <AlertCircle className="h-6 w-6 text-destructive-700" />
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Failed to Load Data
          </h3>
          <p className="text-sm text-muted-foreground">
            {error?.message || 'An error occurred while fetching data.'}
          </p>
        </div>
        {onRetry && (
          <Button onClick={onRetry} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        )}
      </div>
    </div>
  );
}