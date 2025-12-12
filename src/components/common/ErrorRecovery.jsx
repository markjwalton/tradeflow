import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export function ErrorRecovery({ 
  error, 
  resetError, 
  severity = 'error',
  showHomeButton = false 
}) {
  const navigate = useNavigate();
  
  const errorMessages = {
    network: 'Unable to connect. Please check your internet connection.',
    auth: 'Authentication required. Please log in again.',
    permission: 'You do not have permission to access this resource.',
    notFound: 'The requested resource was not found.',
    server: 'A server error occurred. Please try again later.',
    default: 'An unexpected error occurred.'
  };

  const getErrorMessage = () => {
    if (error?.message?.includes('NetworkError') || error?.message?.includes('Failed to fetch')) {
      return errorMessages.network;
    }
    if (error?.message?.includes('401') || error?.message?.includes('Unauthorized')) {
      return errorMessages.auth;
    }
    if (error?.message?.includes('403') || error?.message?.includes('Forbidden')) {
      return errorMessages.permission;
    }
    if (error?.message?.includes('404') || error?.message?.includes('Not Found')) {
      return errorMessages.notFound;
    }
    if (error?.message?.includes('500') || error?.message?.includes('Internal Server')) {
      return errorMessages.server;
    }
    return error?.message || errorMessages.default;
  };

  return (
    <div className="min-h-[400px] flex items-center justify-center p-6">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-destructive-50 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-destructive-700" />
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Something went wrong
              </h3>
              <p className="text-sm text-muted-foreground">
                {getErrorMessage()}
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              {resetError && (
                <Button onClick={resetError} variant="default">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
              )}
              {showHomeButton && (
                <Button 
                  onClick={() => navigate(createPageUrl('Dashboard'))} 
                  variant="outline"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Go Home
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}