import * as React from 'react'
import * as Headless from '@headlessui/react'
import { cn } from '@/lib/utils'

const DropdownContext = React.createContext(null)

export function Dropdown(props) {
  return (
    <Headless.Menu>
      <DropdownContext.Provider value={{}}>{props.children}</DropdownContext.Provider>
    </Headless.Menu>
  )
}

export function DropdownButton({ as = Headless.MenuButton, className, children, ...props }) {
  const Component = as
  return (
    <Component {...props} className={cn(className, 'inline-flex items-center gap-2')}>
      {children}
    </Component>
  )
}

export function DropdownMenu({ anchor = 'bottom', className, ...props }) {
  return (
    <Headless.MenuItems
      {...props}
      transition
      anchor={anchor}
      className={cn(
        className,
        // Base
        'isolate w-max rounded-lg bg-[var(--color-card)] p-1 shadow-lg ring-1 ring-[var(--color-border)]',
        // Transitions
        'transition duration-100 ease-out data-[closed]:scale-95 data-[closed]:opacity-0'
      )}
    />
  )
}

export function DropdownItem({ className, ...props }) {
  const classes = cn(
    // Base
    'group flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition',
    // Text color
    'text-[var(--color-text-secondary)]',
    // Hover
    'hover:bg-[var(--color-muted)] hover:text-[var(--color-text-primary)]',
    // Focus
    'focus:outline-none data-[focus]:bg-[var(--color-muted)] data-[focus]:text-[var(--color-text-primary)]',
    className
  )

  return (
    <Headless.MenuItem>
      <Headless.CloseButton as="a" className={classes} {...props} />
    </Headless.MenuItem>
  )
}

export function DropdownLabel({ className, ...props }) {
  return <span {...props} className={cn(className, 'truncate')} />
}

export function DropdownDivider({ className, ...props }) {
  return <div {...props} className={cn(className, 'my-1 h-px bg-[var(--color-border)]')} />
}