import * as React from 'react'
import * as Headless from '@headlessui/react'
import { cn } from '@/lib/utils'

export function Navbar({ className, ...props }) {
  return (
    <nav {...props} className={cn(className, 'flex items-center px-4 py-3 gap-3 border-b border-[var(--color-border)] bg-[var(--color-card)]')} />
  )
}

export function NavbarDivider({ className, ...props }) {
  return <div {...props} className={cn(className, 'h-6 w-px bg-[var(--color-border)]')} />
}

export function NavbarSection({ className, ...props }) {
  return <div {...props} className={cn(className, 'flex items-center gap-3')} />
}

export function NavbarSpacer({ className, ...props }) {
  return <div {...props} className={cn(className, 'flex-1')} />
}

export const NavbarItem = React.forwardRef(function NavbarItem(
  { current, className, children, ...props },
  ref
) {
  const classes = cn(
    // Base
    'relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition',
    // Text color
    'text-[var(--color-text-secondary)]',
    // Hover
    'hover:bg-[var(--color-muted)] hover:text-[var(--color-text-primary)]',
    // Current
    current && 'bg-[var(--color-muted)] text-[var(--color-text-primary)]',
    className
  )

  return (
    <Headless.CloseButton as="a" ref={ref} {...props} className={classes}>
      {children}
    </Headless.CloseButton>
  )
})

export function NavbarLabel({ className, ...props }) {
  return <span {...props} className={cn(className, 'truncate')} />
}