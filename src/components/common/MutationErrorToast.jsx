import { useEffect } from 'react';
import { toast } from 'sonner';

/**
 * Component to display mutation errors as toasts
 */
export function MutationErrorToast({ error, action = 'perform this action' }) {
  useEffect(() => {
    if (error) {
      const message = error?.message || `Failed to ${action}`;
      toast.error(message, {
        duration: 5000,
        action: {
          label: 'Dismiss',
          onClick: () => {},
        },
      });
    }
  }, [error, action]);

  return null;
}