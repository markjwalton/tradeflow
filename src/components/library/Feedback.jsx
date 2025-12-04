import React from "react";
import { cn } from "@/lib/utils";
import { CheckCircle, XCircle, AlertTriangle, Info, X, Loader2, Upload } from "lucide-react";

// Base alert styles
const alertBase = cn(
  "flex items-start gap-3 p-4 rounded-lg border"
);

// Success Alert
export function SuccessAlert({ 
  title, 
  message, 
  onClose,
  className, 
  ...props 
}) {
  return (
    <div 
      className={cn(
        alertBase,
        "bg-[#5a7a5e]/10 border-[#5a7a5e]/20 text-[#5a7a5e]",
        className
      )} 
      role="alert"
      {...props}
    >
      <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        {title && <p className="font-medium mb-1">{title}</p>}
        {message && <p className="text-sm opacity-90">{message}</p>}
      </div>
      {onClose && (
        <button onClick={onClose} className="hover:opacity-70">
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}

// Error Alert
export function ErrorAlert({ 
  title, 
  message, 
  onClose,
  className, 
  ...props 
}) {
  return (
    <div 
      className={cn(
        alertBase,
        "bg-[#8b5b5b]/10 border-[#8b5b5b]/20 text-[#8b5b5b]",
        className
      )} 
      role="alert"
      {...props}
    >
      <XCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        {title && <p className="font-medium mb-1">{title}</p>}
        {message && <p className="text-sm opacity-90">{message}</p>}
      </div>
      {onClose && (
        <button onClick={onClose} className="hover:opacity-70">
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}

// Warning Alert
export function WarningAlert({ 
  title, 
  message, 
  onClose,
  className, 
  ...props 
}) {
  return (
    <div 
      className={cn(
        alertBase,
        "bg-[#c4a35a]/10 border-[#c4a35a]/20 text-[#c4a35a]",
        className
      )} 
      role="alert"
      {...props}
    >
      <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        {title && <p className="font-medium mb-1">{title}</p>}
        {message && <p className="text-sm opacity-90">{message}</p>}
      </div>
      {onClose && (
        <button onClick={onClose} className="hover:opacity-70">
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}

// Info Alert
export function InfoAlert({ 
  title, 
  message, 
  onClose,
  className, 
  ...props 
}) {
  return (
    <div 
      className={cn(
        alertBase,
        "bg-[#5a7a8b]/10 border-[#5a7a8b]/20 text-[#5a7a8b]",
        className
      )} 
      role="alert"
      {...props}
    >
      <Info className="h-5 w-5 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        {title && <p className="font-medium mb-1">{title}</p>}
        {message && <p className="text-sm opacity-90">{message}</p>}
      </div>
      {onClose && (
        <button onClick={onClose} className="hover:opacity-70">
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}

// Loading Spinner
export function LoadingSpinner({ 
  size = "md",
  color = "primary",
  className, 
  ...props 
}) {
  const sizes = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
    xl: "h-12 w-12",
  };

  const colors = {
    primary: "text-[#4A5D4E]",
    secondary: "text-[#D4A574]",
    white: "text-white",
    muted: "text-[#6d6d6d]",
  };

  return (
    <Loader2 
      className={cn("animate-spin", sizes[size], colors[color], className)} 
      {...props}
    />
  );
}

// Loading State - Full loading overlay
export function LoadingState({ 
  message = "Loading...",
  overlay = false,
  className, 
  ...props 
}) {
  const content = (
    <div className={cn("flex flex-col items-center justify-center py-12", className)} {...props}>
      <LoadingSpinner size="lg" className="mb-4" />
      <p className="text-[#6d6d6d]">{message}</p>
    </div>
  );

  if (overlay) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        {content}
      </div>
    );
  }

  return content;
}

// Skeleton Loader
export function SkeletonLoader({ 
  variant = "text",
  lines = 3,
  className, 
  ...props 
}) {
  const skeletonBase = "bg-[#eceae5] animate-pulse rounded";

  if (variant === "card") {
    return (
      <div className={cn("space-y-4", className)} {...props}>
        <div className={cn(skeletonBase, "h-40 w-full rounded-lg")} />
        <div className={cn(skeletonBase, "h-4 w-3/4")} />
        <div className={cn(skeletonBase, "h-4 w-1/2")} />
      </div>
    );
  }

  if (variant === "avatar") {
    return (
      <div className="flex items-center gap-3" {...props}>
        <div className={cn(skeletonBase, "h-10 w-10 rounded-full")} />
        <div className="space-y-2 flex-1">
          <div className={cn(skeletonBase, "h-4 w-24")} />
          <div className={cn(skeletonBase, "h-3 w-16")} />
        </div>
      </div>
    );
  }

  // Default text skeleton
  return (
    <div className={cn("space-y-3", className)} {...props}>
      {[...Array(lines)].map((_, i) => (
        <div 
          key={i} 
          className={cn(skeletonBase, "h-4")}
          style={{ width: `${100 - (i * 15)}%` }}
        />
      ))}
    </div>
  );
}

// Toast Notification
export function ToastNotification({ 
  type = "info",
  title, 
  message, 
  onClose,
  action,
  className, 
  ...props 
}) {
  const typeStyles = {
    success: "border-l-[#5a7a5e]",
    error: "border-l-[#8b5b5b]",
    warning: "border-l-[#c4a35a]",
    info: "border-l-[#5a7a8b]",
  };

  const icons = {
    success: <CheckCircle className="h-5 w-5 text-[#5a7a5e]" />,
    error: <XCircle className="h-5 w-5 text-[#8b5b5b]" />,
    warning: <AlertTriangle className="h-5 w-5 text-[#c4a35a]" />,
    info: <Info className="h-5 w-5 text-[#5a7a8b]" />,
  };

  return (
    <div 
      className={cn(
        "flex items-start gap-3 p-4 bg-white rounded-lg shadow-lg border border-[#eceae5] border-l-4",
        typeStyles[type],
        className
      )} 
      {...props}
    >
      {icons[type]}
      <div className="flex-1">
        {title && <p className="font-medium text-[#1b2a35] mb-1">{title}</p>}
        {message && <p className="text-sm text-[#6d6d6d]">{message}</p>}
        {action && <div className="mt-2">{action}</div>}
      </div>
      {onClose && (
        <button onClick={onClose} className="text-[#6d6d6d] hover:text-[#3b3b3b]">
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}

// Upload Progress
export function UploadProgress({ 
  fileName, 
  progress = 0,
  status = "uploading",
  onCancel,
  className, 
  ...props 
}) {
  return (
    <div 
      className={cn(
        "flex items-center gap-3 p-3 bg-[#f5f3ef] rounded-lg",
        className
      )} 
      {...props}
    >
      <div className="p-2 bg-white rounded">
        <Upload className="h-5 w-5 text-[#4A5D4E]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#1b2a35] truncate">{fileName}</p>
        <div className="flex items-center gap-2 mt-1">
          <div className="flex-1 h-1.5 bg-[#eceae5] rounded-full overflow-hidden">
            <div 
              className={cn(
                "h-full rounded-full transition-all duration-300",
                status === "error" ? "bg-[#8b5b5b]" : "bg-[#4A5D4E]"
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs text-[#6d6d6d]">{progress}%</span>
        </div>
      </div>
      {onCancel && status === "uploading" && (
        <button onClick={onCancel} className="text-[#6d6d6d] hover:text-[#8b5b5b]">
          <X className="h-5 w-5" />
        </button>
      )}
      {status === "complete" && <CheckCircle className="h-5 w-5 text-[#5a7a5e]" />}
      {status === "error" && <XCircle className="h-5 w-5 text-[#8b5b5b]" />}
    </div>
  );
}

// Status Dot
export function StatusDot({ 
  status = "neutral",
  label,
  pulse = false,
  className, 
  ...props 
}) {
  const colors = {
    success: "bg-[#5a7a5e]",
    warning: "bg-[#c4a35a]",
    error: "bg-[#8b5b5b]",
    info: "bg-[#5a7a8b]",
    neutral: "bg-[#6d6d6d]",
  };

  return (
    <div className={cn("flex items-center gap-2", className)} {...props}>
      <span className="relative flex h-2.5 w-2.5">
        {pulse && (
          <span className={cn(
            "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
            colors[status]
          )} />
        )}
        <span className={cn("relative inline-flex rounded-full h-2.5 w-2.5", colors[status])} />
      </span>
      {label && <span className="text-sm text-[#3b3b3b]">{label}</span>}
    </div>
  );
}

// Empty Placeholder
export function EmptyPlaceholder({ 
  icon,
  title, 
  description, 
  action,
  className, 
  ...props 
}) {
  return (
    <div 
      className={cn(
        "flex flex-col items-center justify-center py-16 px-4 text-center",
        "border-2 border-dashed border-[#eceae5] rounded-xl",
        className
      )} 
      {...props}
    >
      {icon && (
        <div className="w-16 h-16 rounded-full bg-[#f5f3ef] flex items-center justify-center mb-4 text-[#6d6d6d]">
          {icon}
        </div>
      )}
      <h3 
        className="text-lg font-medium text-[#1b2a35] mb-2"
        style={{ fontFamily: 'var(--font-heading)' }}
      >
        {title}
      </h3>
      {description && (
        <p className="text-[#6d6d6d] max-w-sm mb-4" style={{ fontFamily: 'var(--font-body)' }}>
          {description}
        </p>
      )}
      {action}
    </div>
  );
}

export default {
  SuccessAlert,
  ErrorAlert,
  WarningAlert,
  InfoAlert,
  LoadingSpinner,
  LoadingState,
  SkeletonLoader,
  ToastNotification,
  UploadProgress,
  StatusDot,
  EmptyPlaceholder,
};