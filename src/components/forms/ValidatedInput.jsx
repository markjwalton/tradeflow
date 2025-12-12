import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { AlertCircle } from 'lucide-react';

export function ValidatedInput({ 
  label, 
  error, 
  required = false,
  className,
  ...props 
}) {
  const inputId = props.id || props.name;
  const hasError = !!error;
  
  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label htmlFor={inputId} className={required ? "after:content-['*'] after:ml-0.5 after:text-destructive" : ""}>
          {label}
        </Label>
      )}
      <Input
        id={inputId}
        aria-invalid={hasError}
        aria-describedby={hasError ? `${inputId}-error` : undefined}
        className={cn(hasError && "border-destructive focus-visible:ring-destructive")}
        {...props}
      />
      {hasError && (
        <div 
          id={`${inputId}-error`}
          className="flex items-center gap-1 text-sm text-destructive"
          role="alert"
        >
          <AlertCircle className="h-3 w-3" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}