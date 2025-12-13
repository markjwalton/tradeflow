import React from 'react';
import { Button } from '@/components/ui/button';
import { useMutation } from '@tanstack/react-query';
import { useMutationError } from '@/components/common/MutationErrorToast';
import { ButtonLoader } from '@/components/common/LoadingStates';
import { toast } from 'sonner';
import { Save, Trash2, Upload } from 'lucide-react';

export default function MutationShowcase() {
  const successMutation = useMutation({
    mutationFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      return { success: true };
    },
    onSuccess: () => {
      toast.success('Operation completed successfully!');
    },
  });

  const errorMutation = useMutation({
    mutationFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      throw new Error('Something went wrong');
    },
  });

  useMutationError(errorMutation, {
    customMessage: 'Failed to complete operation',
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return { deleted: true };
    },
    onSuccess: () => {
      toast.success('Item deleted successfully');
    },
  });

  return (
    <div className="space-y-6" data-component="mutationCard">
      <div>
        <h3 className="text-lg font-display mb-2">Mutation Feedback</h3>
        <p className="text-sm text-muted-foreground">
          Toast notifications and loading indicators for user actions
        </p>
      </div>

      <div className="space-y-4" data-element="mutation-buttons">
        <div>
          <h4 className="text-sm font-medium mb-3">Success Mutation</h4>
          <Button
            onClick={() => successMutation.mutate()}
            disabled={successMutation.isPending}
          >
            {successMutation.isPending ? (
              <>
                <ButtonLoader />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>

        <div className="pt-4 border-t">
          <h4 className="text-sm font-medium mb-3">Error Mutation</h4>
          <Button
            variant="outline"
            onClick={() => errorMutation.mutate()}
            disabled={errorMutation.isPending}
          >
            {errorMutation.isPending ? (
              <>
                <ButtonLoader />
                Processing...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Trigger Error
              </>
            )}
          </Button>
        </div>

        <div className="pt-4 border-t">
          <h4 className="text-sm font-medium mb-3">Delete Mutation</h4>
          <Button
            variant="destructive"
            onClick={() => deleteMutation.mutate()}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? (
              <>
                <ButtonLoader />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Item
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}