'use client';

import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

export default function TailwindDrawer({ 
  open, 
  onClose, 
  title, 
  children,
  side = 'right', // 'right', 'left', 'top', 'bottom'
  maxWidth = 'md', // 'sm', 'md', 'lg', 'xl', '2xl' (for left/right)
  maxHeight = 'md', // 'sm', 'md', 'lg', 'xl' (for top/bottom)
  pushContent = false, // if true, pushes content instead of overlaying (only for top/bottom)
  preventBackdropClose = false // if true, prevents closing when clicking backdrop
}) {
  const isHorizontal = side === 'left' || side === 'right';
  const isVertical = side === 'top' || side === 'bottom';

  const sideClasses = {
    right: 'inset-y-0 right-0 pl-10 sm:pl-16',
    left: 'inset-y-0 left-0 pr-10 sm:pr-16',
    top: 'inset-x-0 top-0 pb-10',
    bottom: 'inset-x-0 bottom-0 pt-10',
  };

  const transitionClasses = {
    right: 'data-closed:translate-x-full',
    left: 'data-closed:-translate-x-full',
    top: 'data-closed:-translate-y-full',
    bottom: 'data-closed:translate-y-full',
  };

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  const maxHeightClasses = {
    sm: 'max-h-[300px]',
    md: 'max-h-[400px]',
    lg: 'max-h-[500px]',
    xl: 'max-h-[600px]',
  };

  // Push content mode - renders as a collapsible div instead of a modal
  if (pushContent && (side === 'top' || side === 'bottom')) {
    return (
      <div 
        className={`bg-[var(--color-card)] shadow-xl transition-all duration-500 ease-in-out overflow-hidden ${
          open ? maxHeightClasses[maxHeight] : 'max-h-0'
        }`}
      >
        <div className="px-4 py-4 sm:px-6">
          <div className="flex items-start justify-between">
            <h3 className="text-base font-semibold text-[var(--text-primary)]">{title}</h3>
            <div className="ml-3 flex h-7 items-center">
              <button
                type="button"
                onClick={onClose}
                className="relative rounded-md text-[var(--text-muted)] hover:text-[var(--text-secondary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]"
              >
                <span className="absolute -inset-2.5" />
                <span className="sr-only">Close panel</span>
                <XMarkIcon aria-hidden="true" className="size-6" />
              </button>
            </div>
          </div>
        </div>
        <div className="px-4 pb-4 sm:px-6 overflow-y-auto" style={{ maxHeight: 'calc(100% - 4rem)' }}>
          {children}
        </div>
      </div>
    );
  }

  return (
    <Dialog open={open} onClose={preventBackdropClose ? () => {} : onClose} className="relative z-10">
      <div className="fixed inset-0 bg-transparent" />

      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className={`pointer-events-none fixed flex ${isHorizontal ? 'max-w-full' : 'max-h-full w-full justify-center'} ${sideClasses[side]}`}>
            <DialogPanel
              transition
              data-token-applier-ui
              className={`pointer-events-auto ${isHorizontal ? `w-screen ${maxWidthClasses[maxWidth]}` : `w-full ${maxHeightClasses[maxHeight]}`} transform transition duration-500 ease-in-out ${transitionClasses[side]} sm:duration-700`}
            >
              <div data-token-applier-ui className={`relative flex ${isHorizontal ? 'h-full flex-col' : 'w-full flex-row'} overflow-y-auto bg-[var(--color-card)] ${isHorizontal ? 'py-6' : 'px-6'} shadow-xl`}>
                <div className="px-4 sm:px-6">
                  <div className="flex items-start justify-between">
                    <DialogTitle className="text-base font-semibold text-[var(--text-primary)]">{title}</DialogTitle>
                    <div className="ml-3 flex h-7 items-center">
                      <button
                        type="button"
                        onClick={onClose}
                        className="relative rounded-md text-[var(--text-muted)] hover:text-[var(--text-secondary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]"
                      >
                        <span className="absolute -inset-2.5" />
                        <span className="sr-only">Close panel</span>
                        <XMarkIcon aria-hidden="true" className="size-6" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className={`relative ${isHorizontal ? 'mt-6' : 'ml-6'} flex-1 px-4 sm:px-6`}>{children}</div>
              </div>
            </DialogPanel>
          </div>
        </div>
      </div>
    </Dialog>
  );
}