'use client';

import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { CheckIcon, ExclamationTriangleIcon, InformationCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

const modalStyles = {
  success: {
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    Icon: CheckIcon,
  },
  warning: {
    iconBg: 'bg-yellow-100',
    iconColor: 'text-yellow-600',
    Icon: ExclamationTriangleIcon,
  },
  error: {
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    Icon: XCircleIcon,
  },
  info: {
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    Icon: InformationCircleIcon,
  },
};

export default function TailwindModal({ 
  open, 
  onClose, 
  type = 'success', 
  title, 
  message,
  confirmText = 'Confirm',
  showCancel = false,
  cancelText = 'Cancel',
  onConfirm
}) {
  const style = modalStyles[type] || modalStyles.success;
  const Icon = style.Icon;

  return (
    <Dialog open={open} onClose={onClose} className="relative z-10">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <DialogPanel
            transition
            className="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-sm sm:p-6 data-closed:sm:translate-y-0 data-closed:sm:scale-95"
          >
            <div>
              <div className={`mx-auto flex size-12 items-center justify-center rounded-full ${style.iconBg}`}>
                <Icon aria-hidden="true" className={`size-6 ${style.iconColor}`} />
              </div>
              <div className="mt-3 text-center sm:mt-5">
                <DialogTitle as="h3" className="text-base font-semibold text-gray-900">
                  {title}
                </DialogTitle>
                {message && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">{message}</p>
                  </div>
                )}
              </div>
            </div>
            <div className={`mt-5 sm:mt-6 ${showCancel ? 'sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3' : ''}`}>
              <button
                type="button"
                onClick={() => {
                  onConfirm?.();
                  onClose();
                }}
                className={`inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${showCancel ? 'sm:col-start-2' : ''}`}
              >
                {confirmText}
              </button>
              {showCancel && (
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs inset-ring inset-ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0"
                >
                  {cancelText}
                </button>
              )}
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}