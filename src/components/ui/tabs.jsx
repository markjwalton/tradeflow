import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"

const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex h-[var(--spacing-10)] items-center justify-center rounded-[var(--radius-lg)] p-[var(--spacing-1)] bg-[var(--tabs-list-bg)] text-[var(--color-text-muted)]",
      className
    )}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-[var(--radius-md)] px-[var(--spacing-4)] py-[var(--spacing-2)] font-[var(--font-family-display)] text-[var(--text-sm)] font-[var(--font-weight-medium)] tracking-[var(--tracking-airy)] ring-offset-[var(--color-background)] transition-all duration-[var(--duration-200)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
      "data-[state=active]:bg-[var(--color-background)] data-[state=active]:text-[var(--color-text-primary)] data-[state=active]:shadow-[var(--shadow-sm)]",
      "data-[state=inactive]:hover:bg-[var(--tabs-trigger-hover-bg)] data-[state=inactive]:hover:text-[var(--tabs-trigger-hover-color)]",
      className
    )}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-[var(--spacing-2)] ring-offset-[var(--color-background)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)] focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }