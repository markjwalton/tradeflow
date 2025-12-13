import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { QueryErrorState } from '@/components/common/QueryErrorState';
import { ErrorRecovery } from '@/components/common/ErrorRecovery';
import { AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function ErrorShowcase() {
  const [showQueryError, setShowQueryError] = useState(false);
  const [showRecoveryError, setShowRecoveryError] = useState(false);

  const mockNetworkError = new Error('Failed to fetch data from server');
  mockNetworkError.code = 'NETWORK_ERROR';

  const mockValidationError = new Error('Invalid data format');
  mockValidationError.code = 'VALIDATION_ERROR';

  return (
    <div className="space-y-6" data-component="errorCard">
      <div>
        <h3 className="text-lg font-display mb-2">Error Handling</h3>
        <p className="text-sm text-muted-foreground">
          User-friendly error messages with recovery actions
        </p>
      </div>

      <div className="space-y-4">
        <div data-element="query-error">
          <h4 className="text-sm font-medium mb-3">Query Error State</h4>
          {showQueryError ? (
            <QueryErrorState
              error={mockNetworkError}
              onRetry={() => {
                setShowQueryError(false);
                toast.info('Retrying...');
                setTimeout(() => setShowQueryError(true), 1000);
              }}
            />
          ) : (
            <Button onClick={() => setShowQueryError(true)}>
              <AlertCircle className="h-4 w-4 mr-2" />
              Show Query Error
            </Button>
          )}
        </div>

        <div data-element="recovery-error" className="pt-4 border-t">
          <h4 className="text-sm font-medium mb-3">Error Recovery</h4>
          {showRecoveryError ? (
            <ErrorRecovery
              error={mockValidationError}
              onRetry={() => {
                setShowRecoveryError(false);
                toast.info('Retrying...');
              }}
              onDismiss={() => {
                setShowRecoveryError(false);
                toast.success('Error dismissed');
              }}
            />
          ) : (
            <Button onClick={() => setShowRecoveryError(true)}>
              <AlertCircle className="h-4 w-4 mr-2" />
              Show Recovery Error
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}