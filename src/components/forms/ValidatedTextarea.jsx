import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { AlertCircle } from 'lucide-react';

export function ValidatedTextarea({
  label,
  error,
  required,
  helperText,
  maxLength,
  showCharCount,
  className,
  ...props
}) {
  const textareaId = props.id || props.name;
  const hasError = !!error;
  const currentLength = props.value?.length || 0;

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <div className="flex items-center justify-between">
          <Label htmlFor={textareaId} className="flex items-center gap-1">
            {label}
            {required && <span className="text-destructive">*</span>}
          </Label>
          {showCharCount && maxLength && (
            <span className="text-xs text-muted-foreground">
              {currentLength}/{maxLength}
            </span>
          )}
        </div>
      )}
      
      <Textarea
        id={textareaId}
        maxLength={maxLength}
        className={cn(
          hasError && 'border-destructive focus-visible:ring-destructive'
        )}
        aria-invalid={hasError}
        aria-describedby={
          hasError ? `${textareaId}-error` : helperText ? `${textareaId}-helper` : undefined
        }
        {...props}
      />
      
      {helperText && !hasError && (
        <p id={`${textareaId}-helper`} className="text-xs text-muted-foreground">
          {helperText}
        </p>
      )}
      
      {hasError && (
        <p
          id={`${textareaId}-error`}
          className="text-xs text-destructive flex items-center gap-1"
        >
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  );
}