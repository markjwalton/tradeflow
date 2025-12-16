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

const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn(
      "font-[var(--font-family-display)] text-[var(--text-lg)] font-[var(--font-weight-normal)] leading-[var(--leading-snug)] tracking-[var(--tracking-airy)] text-[var(--color-text-primary)]",
      "sm:text-[var(--text-xl)]",
      className
    )}
    {...props}
  />
))
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