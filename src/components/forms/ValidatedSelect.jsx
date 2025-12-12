import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { AlertCircle } from 'lucide-react';

export function ValidatedSelect({
  label,
  error,
  required,
  helperText,
  options = [],
  placeholder,
  className,
  onValueChange,
  value,
  ...props
}) {
  const selectId = props.id || props.name;
  const hasError = !!error;

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <Label htmlFor={selectId} className="flex items-center gap-1">
          {label}
          {required && <span className="text-destructive">*</span>}
        </Label>
      )}
      
      <Select
        value={value}
        onValueChange={onValueChange}
        {...props}
      >
        <SelectTrigger
          id={selectId}
          className={cn(
            hasError && 'border-destructive focus:ring-destructive'
          )}
          aria-invalid={hasError}
          aria-describedby={
            hasError ? `${selectId}-error` : helperText ? `${selectId}-helper` : undefined
          }
        >
          <SelectValue placeholder={placeholder || 'Select an option'} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {helperText && !hasError && (
        <p id={`${selectId}-helper`} className="text-xs text-muted-foreground">
          {helperText}
        </p>
      )}
      
      {hasError && (
        <p
          id={`${selectId}-error`}
          className="text-xs text-destructive flex items-center gap-1"
        >
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  );
}