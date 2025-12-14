import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function FeedbackShowcase() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleToast = (type) => {
    switch(type) {
      case 'success':
        toast.success('Changes saved successfully');
        break;
      case 'error':
        toast.error('Something went wrong. Please try again.');
        break;
      case 'warning':
        toast.warning('Your session will expire in 5 minutes');
        break;
      case 'info':
        toast.info('New features are now available');
        break;
    }
  };

  const simulateSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success('Action completed successfully');
    }, 2000);
  };

  return (
    <div className="space-y-8" data-component="feedbackShowcase">
      {/* Alerts */}
      <div data-element="alerts">
        <h3 className="text-lg font-medium mb-3">Alerts</h3>
        <div className="space-y-3">
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-900">Success</AlertTitle>
            <AlertDescription className="text-green-800">
              Your changes have been saved successfully.
            </AlertDescription>
          </Alert>
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertTitle className="text-red-900">Error</AlertTitle>
            <AlertDescription className="text-red-800">
              Something went wrong. Please try again.
            </AlertDescription>
          </Alert>
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertTitle className="text-yellow-900">Warning</AlertTitle>
            <AlertDescription className="text-yellow-800">
              Your session will expire in 5 minutes.
            </AlertDescription>
          </Alert>
          <Alert className="border-blue-200 bg-blue-50">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertTitle className="text-blue-900">Information</AlertTitle>
            <AlertDescription className="text-blue-800">
              New features are now available.
            </AlertDescription>
          </Alert>
        </div>
      </div>

      {/* Toast Notifications */}
      <div data-element="toasts">
        <h3 className="text-lg font-medium mb-3">Toast Notifications</h3>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => handleToast('success')} variant="outline">
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Success Toast
          </Button>
          <Button onClick={() => handleToast('error')} variant="outline">
            <AlertCircle className="h-4 w-4 mr-2" />
            Error Toast
          </Button>
          <Button onClick={() => handleToast('warning')} variant="outline">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Warning Toast
          </Button>
          <Button onClick={() => handleToast('info')} variant="outline">
            <Info className="h-4 w-4 mr-2" />
            Info Toast
          </Button>
        </div>
      </div>

      {/* Loading States */}
      <div data-element="loading-states">
        <h3 className="text-lg font-medium mb-3">Loading States</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span className="text-sm">Small Spinner</span>
          </div>
          <div className="flex items-center gap-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="text-sm">Medium Spinner</span>
          </div>
          <div className="flex items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="text-sm">Large Spinner</span>
          </div>
          <Button onClick={simulateSubmit} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </Button>
        </div>
      </div>

      {/* Badges */}
      <div data-element="badges">
        <h3 className="text-lg font-medium mb-3">Status Badges</h3>
        <div className="flex flex-wrap gap-2">
          <Badge className="bg-green-100 text-green-800">Active</Badge>
          <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
          <Badge className="bg-red-100 text-red-800">Failed</Badge>
          <Badge className="bg-blue-100 text-blue-800">Processing</Badge>
          <Badge className="bg-gray-100 text-gray-800">Draft</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge className="bg-primary text-primary-foreground">Primary</Badge>
          <Badge className="bg-secondary text-secondary-foreground">Secondary</Badge>
        </div>
      </div>

      {/* Empty States */}
      <div data-element="empty-state">
        <h3 className="text-lg font-medium mb-3">Empty State</h3>
        <div className="border-2 border-dashed rounded-lg p-12 text-center">
          <div className="max-w-sm mx-auto">
            <div className="w-12 h-12 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
              <Info className="h-6 w-6 text-muted-foreground" />
            </div>
            <h4 className="text-lg font-medium mb-2">No items yet</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Get started by creating your first item.
            </p>
            <Button>Create Item</Button>
          </div>
        </div>
      </div>
    </div>
  );
}