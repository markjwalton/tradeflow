import * as React from 'react'
import { cn } from '@/lib/utils'

// Catalyst-style Avatar component (for Tailwind navbar)
export function Avatar({
  src,
  square = false,
  initials,
  alt = '',
  className,
  ...props
}) {
  return (
    <span
      data-slot="avatar"
      className={cn(
        className,
        // Base
        'inline-grid shrink-0 align-middle [--avatar-radius:20%] [--ring-opacity:20%] *:col-start-1 *:row-start-1',
        'outline outline-1 -outline-offset-1 outline-black/[--ring-opacity] dark:outline-white/[--ring-opacity]',
        // Size
        'size-8',
        // Shape
        square ? 'rounded-[--avatar-radius] *:rounded-[--avatar-radius]' : 'rounded-full *:rounded-full'
      )}
      {...props}
    >
      {initials && (
        <svg
          className="select-none fill-current text-[48px] font-medium uppercase"
          viewBox="0 0 100 100"
          aria-hidden={alt ? undefined : 'true'}
        >
          {alt && <title>{alt}</title>}
          <text x="50%" y="50%" alignmentBaseline="middle" dominantBaseline="middle" textAnchor="middle" dy=".125em">
            {initials}
          </text>
        </svg>
      )}
      {src && <img className="object-cover" src={src} alt={alt} />}
    </span>
  )
}

// Legacy shadcn-style Avatar components (for backward compatibility)
const AvatarRoot = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
      className
    )}
    {...props}
  />
))
AvatarRoot.displayName = "Avatar"

const AvatarImage = React.forwardRef(({ className, ...props }, ref) => (
  <img
    ref={ref}
    className={cn("aspect-square h-full w-full object-cover", className)}
    {...props}
  />
))
AvatarImage.displayName = "AvatarImage"

const AvatarFallback = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-[var(--color-muted)] text-[var(--color-text-secondary)]",
      className
    )}
    {...props}
  />
))
AvatarFallback.displayName = "AvatarFallback"

// Export both styles
export { AvatarRoot, AvatarImage, AvatarFallback }