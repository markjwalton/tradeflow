'use client';

import { useState, useEffect } from 'react';
import { Transition } from '@headlessui/react';
import { CheckCircleIcon, XCircleIcon, InformationCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { XMarkIcon } from '@heroicons/react/20/solid';

const toastIcons = {
  success: CheckCircleIcon,
  error: XCircleIcon,
  info: InformationCircleIcon,
  warning: ExclamationTriangleIcon,
};

const toastColors = {
  success: 'text-green-400',
  error: 'text-red-400',
  info: 'text-blue-400',
  warning: 'text-yellow-400',
};

export default function TailwindToast({ 
  show, 
  onClose, 
  type = 'success', 
  title, 
  message,
  autoClose = true,
  duration = 5000 
}) {
  const [isVisible, setIsVisible] = useState(show);
  const Icon = toastIcons[type];
  const iconColor = toastColors[type];

  useEffect(() => {
    setIsVisible(show);
    if (show && autoClose) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, autoClose, duration, onClose]);

  return (
    <div
      aria-live="assertive"
      className="pointer-events-none fixed inset-0 flex items-end px-4 py-6 sm:items-start sm:p-6"
      style={{ zIndex: 'var(--z-toast)' }}
    >
      <div className="flex w-full flex-col items-center space-y-4 sm:items-end">
        <Transition show={isVisible}>
          <div className="pointer-events-auto w-full max-w-sm rounded-lg bg-white shadow-lg outline-1 outline-black/5 transition data-closed:opacity-0 data-enter:transform data-enter:duration-300 data-enter:ease-out data-closed:data-enter:translate-y-2 data-leave:duration-100 data-leave:ease-in data-closed:data-enter:sm:translate-x-2 data-closed:data-enter:sm:translate-y-0">
            <div className="p-4">
              <div className="flex items-start">
                <div className="shrink-0">
                  <Icon aria-hidden="true" className={`size-6 ${iconColor}`} />
                </div>
                <div className="ml-3 w-0 flex-1 pt-0.5">
                  <p className="text-sm font-medium text-gray-900">{title}</p>
                  {message && <p className="mt-1 text-sm text-gray-500">{message}</p>}
                </div>
                <div className="ml-4 flex shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setIsVisible(false);
                      onClose?.();
                    }}
                    className="inline-flex rounded-md text-gray-400 hover:text-gray-500 focus:outline-2 focus:outline-offset-2 focus:outline-indigo-600"
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon aria-hidden="true" className="size-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  );
}