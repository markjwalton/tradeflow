import React from "react";
import { CheckCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function NotificationCard({ 
  show, 
  onClose, 
  title, 
  message,
  variant = "success" // success, info, warning, error
}) {
  if (!show) return null;

  const variants = {
    success: {
      icon: CheckCircle,
      iconColor: "text-green-400",
      bg: "bg-white"
    },
    info: {
      icon: CheckCircle,
      iconColor: "text-blue-400",
      bg: "bg-white"
    },
    warning: {
      icon: CheckCircle,
      iconColor: "text-yellow-400",
      bg: "bg-white"
    },
    error: {
      icon: CheckCircle,
      iconColor: "text-red-400",
      bg: "bg-white"
    }
  };

  const config = variants[variant];
  const Icon = config.icon;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[9999] max-w-md w-full mx-4"
        >
          <div className={`${config.bg} rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 p-4`}>
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <Icon className={`h-6 w-6 ${config.iconColor}`} aria-hidden="true" />
              </div>
              <div className="ml-3 w-0 flex-1 pt-0.5">
                <p className="text-sm font-medium text-gray-900">{title}</p>
                <p className="mt-1 text-sm text-gray-500">{message}</p>
              </div>
              <div className="ml-4 flex flex-shrink-0">
                <button
                  type="button"
                  className="inline-flex rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  onClick={onClose}
                >
                  <span className="sr-only">Close</span>
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}