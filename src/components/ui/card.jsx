import * as React from "react"

import { cn } from "@/lib/utils"

const Card = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-card-foreground)] shadow-[var(--shadow-card)] transition-shadow duration-[var(--duration-200)]",
      "hover:shadow-[var(--shadow-card-hover)]",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col gap-[var(--spacing-2)] p-[var(--spacing-4)] sm:p-[var(--spacing-6)]",
      className
    )}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef(({ className, size = 'default', ...props }, ref) => {
  const sizeClasses = {
    small: "text-[length:var(--card-heading-small-size)] font-[var(--card-heading-small-weight)] leading-[var(--card-heading-small-leading)] tracking-[var(--card-heading-small-tracking)]",
    default: "text-[length:var(--card-heading-default-size)] font-[var(--card-heading-default-weight)] leading-[var(--card-heading-default-leading)] tracking-[var(--card-heading-default-tracking)] sm:text-[length:var(--text-xl)]",
    large: "text-[length:var(--card-heading-large-size)] font-[var(--card-heading-large-weight)] leading-[var(--card-heading-large-leading)] tracking-[var(--card-heading-large-tracking)]"
  };
  
  return (
    <h2
      ref={ref}
      className={cn(
        "font-[var(--font-family-display)] text-[color:var(--card-heading-color)]",
        sizeClasses[size],
        className
      )}
      {...props}
    />
  );
})
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      "font-[var(--font-family-body)] text-[var(--text-sm)] text-[var(--color-text-muted)] leading-[var(--leading-normal)]",
      className
    )}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div 
    ref={ref} 
    className={cn(
      "p-[var(--spacing-4)] pt-0 sm:p-[var(--spacing-6)] sm:pt-0",
      className
    )} 
    {...props} 
  />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center gap-[var(--spacing-3)] p-[var(--spacing-4)] pt-0 sm:p-[var(--spacing-6)] sm:pt-0",
      className
    )}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }