import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-[var(--spacing-2)] whitespace-nowrap rounded-[var(--radius-button)] font-[var(--font-family-display)] text-[var(--text-sm)] font-[var(--font-weight-medium)] tracking-[var(--tracking-airy)] ring-offset-[var(--color-background)] transition-all duration-[var(--duration-200)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-[var(--color-primary)] text-white shadow-[var(--shadow-sm)] hover:bg-[var(--primary-600)] hover:shadow-[var(--shadow-md)]",
        destructive:
          "bg-[var(--color-destructive)] text-[var(--color-destructive-foreground)] shadow-[var(--shadow-sm)] hover:bg-[var(--destructive-700)] hover:shadow-[var(--shadow-md)]",
        outline:
          "border border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-text-secondary)] shadow-[var(--shadow-xs)] hover:bg-[var(--color-muted)] hover:border-[var(--primary-300)]",
        secondary:
          "bg-[var(--color-secondary)] text-[var(--color-secondary-foreground)] shadow-[var(--shadow-sm)] hover:bg-[var(--secondary-500)] hover:shadow-[var(--shadow-md)]",
        ghost: "text-[var(--color-text-secondary)] hover:bg-[var(--color-muted)] hover:text-[var(--color-text-primary)]",
        link: "text-[var(--color-primary)] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-[var(--spacing-10)] px-[var(--spacing-4)] py-[var(--spacing-2)]",
        sm: "h-[var(--spacing-8)] rounded-[var(--radius-md)] px-[var(--spacing-3)] text-[var(--text-xs)]",
        lg: "h-[var(--spacing-12)] rounded-[var(--radius-lg)] px-[var(--spacing-8)] text-[var(--text-base)]",
        icon: "h-[var(--spacing-10)] w-[var(--spacing-10)]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  )
})
Button.displayName = "Button"

export { Button, buttonVariants }