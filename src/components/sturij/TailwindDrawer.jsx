'use client';

import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

export default function TailwindDrawer({ 
  open, 
  onClose, 
  title, 
  children,
  side = 'right', // 'right' or 'left'
  maxWidth = 'md' // 'sm', 'md', 'lg', 'xl', '2xl'
}) {
  const sideClasses = {
    right: 'right-0 pl-10 sm:pl-16',
    left: 'left-0 pr-10 sm:pr-16',
  };

  const transitionClasses = {
    right: 'data-closed:translate-x-full',
    left: 'data-closed:-translate-x-full',
  };

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  return (
    <Dialog open={open} onClose={onClose} className="relative z-10">
      <div className="fixed inset-0" />

      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className={`pointer-events-none fixed inset-y-0 flex max-w-full ${sideClasses[side]}`}>
            <DialogPanel
              transition
              className={`pointer-events-auto w-screen ${maxWidthClasses[maxWidth]} transform transition duration-500 ease-in-out ${transitionClasses[side]} sm:duration-700`}
            >
              <div className="relative flex h-full flex-col overflow-y-auto bg-white py-6 shadow-xl">
                <div className="px-4 sm:px-6">
                  <div className="flex items-start justify-between">
                    <DialogTitle className="text-base font-semibold text-gray-900">{title}</DialogTitle>
                    <div className="ml-3 flex h-7 items-center">
                      <button
                        type="button"
                        onClick={onClose}
                        className="relative rounded-md text-gray-400 hover:text-gray-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                      >
                        <span className="absolute -inset-2.5" />
                        <span className="sr-only">Close panel</span>
                        <XMarkIcon aria-hidden="true" className="size-6" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="relative mt-6 flex-1 px-4 sm:px-6">{children}</div>
              </div>
            </DialogPanel>
          </div>
        </div>
      </div>
    </Dialog>
  );
}