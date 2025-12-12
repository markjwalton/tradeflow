import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { AlertCircle } from 'lucide-react';

export function ValidatedSelect({ 
  label, 
  error, 
  required = false,
  className,
  children,
  ...props 
}) {
  const selectId = props.id || props.name;
  const hasError = !!error;
  
  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label htmlFor={selectId} className={required ? "after:content-['*'] after:ml-0.5 after:text-destructive" : ""}>
          {label}
        </Label>
      )}
      <Select {...props}>
        <SelectTrigger 
          id={selectId}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${selectId}-error` : undefined}
          className={cn(hasError && "border-destructive focus-visible:ring-destructive")}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {children}
        </SelectContent>
      </Select>
      {hasError && (
        <div 
          id={`${selectId}-error`}
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