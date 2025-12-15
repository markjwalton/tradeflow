import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

const badgeVariants = cva(
  "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-charcoal-50 text-charcoal-600 border border-charcoal-500/10",
        destructive:
          "bg-destructive-50 text-destructive-700 border border-destructive-600/10",
        warning:
          "bg-secondary-50 text-secondary-800 border border-secondary-600/20",
        success:
          "bg-primary-50 text-primary-700 border border-primary-600/20",
        info:
          "bg-midnight-50 text-midnight-700 border border-midnight-700/10",
        accent:
          "bg-accent-50 text-accent-700 border border-accent-700/10",
        secondary:
          "bg-secondary-100 text-secondary-700 border border-secondary-600/20",
        outline: "text-foreground border border-border",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Badge = React.forwardRef(({ className, variant, ...props }, ref) => {
  return (
    <span ref={ref} className={cn(badgeVariants({ variant }), className)} {...props} />
  )
})
Badge.displayName = "Badge"

const DismissibleBadge = React.forwardRef(
  ({ className, variant, onDismiss, children, ...props }, ref) => {
    const [isVisible, setIsVisible] = React.useState(true)

    const handleDismiss = () => {
      setIsVisible(false)
      if (onDismiss) {
        onDismiss()
      }
    }

    if (!isVisible) return null

    return (
      <span
        ref={ref}
        className={cn(badgeVariants({ variant }), "gap-x-0.5", className)}
        {...props}
      >
        {children}
        <button
          type="button"
          onClick={handleDismiss}
          className="group relative -mr-1 size-3.5 rounded-sm hover:bg-black/10 transition-colors"
        >
          <span className="sr-only">Remove</span>
          <X className="size-3 opacity-50 group-hover:opacity-75" strokeWidth={2} />
          <span className="absolute -inset-1" />
        </button>
      </span>
    )
  }
)
DismissibleBadge.displayName = "DismissibleBadge"

const statusColorMap = {
  default: "fill-charcoal-500",
  destructive: "fill-destructive-500",
  warning: "fill-secondary-500",
  success: "fill-primary-500",
  info: "fill-midnight-500",
  accent: "fill-accent-500",
}

const StatusBadge = React.forwardRef(
  ({ className, variant = "default", children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center gap-x-1.5 rounded-full px-2 py-1 text-xs font-medium border",
          variant === "default" && "text-foreground border-border",
          className
        )}
        {...props}
      >
        <svg
          viewBox="0 0 6 6"
          aria-hidden="true"
          className={cn("size-1.5", statusColorMap[variant] || statusColorMap.default)}
        >
          <circle r={3} cx={3} cy={3} />
        </svg>
        {children}
      </span>
    )
  }
)
StatusBadge.displayName = "StatusBadge"

export { Badge, DismissibleBadge, StatusBadge, badgeVariants }