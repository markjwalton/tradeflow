import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

// Base button styles
const buttonBase = cn(
  "inline-flex items-center justify-center gap-2",
  "font-medium rounded-lg transition-all duration-200",
  "focus:outline-none focus:ring-2 focus:ring-offset-2",
  "disabled:opacity-50 disabled:cursor-not-allowed"
);

// Size variants
const sizes = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-base",
  lg: "px-6 py-3 text-lg",
  xl: "px-8 py-4 text-xl",
};

// Primary Button - Main actions
export function PrimaryButton({ 
  children, 
  size = "md", 
  className, 
  disabled,
  ...props 
}) {
  return (
    <button
      className={cn(
        buttonBase,
        sizes[size],
        "bg-[#4A5D4E] text-white",
        "hover:bg-[#3a4a3e] active:bg-[#334137]",
        "focus:ring-[#4A5D4E]/50",
        "shadow-sm hover:shadow-md",
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

// Secondary Button - Secondary actions
export function SecondaryButton({ 
  children, 
  size = "md", 
  className, 
  disabled,
  ...props 
}) {
  return (
    <button
      className={cn(
        buttonBase,
        sizes[size],
        "bg-[#D4A574] text-white",
        "hover:bg-[#c08d54] active:bg-[#a87840]",
        "focus:ring-[#D4A574]/50",
        "shadow-sm hover:shadow-md",
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

// Outline Button - Tertiary actions
export function OutlineButton({ 
  children, 
  size = "md", 
  variant = "primary",
  className, 
  disabled,
  ...props 
}) {
  const variants = {
    primary: "border-[#4A5D4E] text-[#4A5D4E] hover:bg-[#4A5D4E]/10 focus:ring-[#4A5D4E]/50",
    secondary: "border-[#D4A574] text-[#D4A574] hover:bg-[#D4A574]/10 focus:ring-[#D4A574]/50",
    charcoal: "border-[#3b3b3b] text-[#3b3b3b] hover:bg-[#3b3b3b]/10 focus:ring-[#3b3b3b]/50",
  };

  return (
    <button
      className={cn(
        buttonBase,
        sizes[size],
        "bg-transparent border-2",
        variants[variant],
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

// Destructive Button - Dangerous actions
export function DestructiveButton({ 
  children, 
  size = "md", 
  className, 
  disabled,
  ...props 
}) {
  return (
    <button
      className={cn(
        buttonBase,
        sizes[size],
        "bg-[#8b5b5b] text-white",
        "hover:bg-[#7a4f4f] active:bg-[#6e4747]",
        "focus:ring-[#8b5b5b]/50",
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

// Ghost Button - Minimal visual weight
export function GhostButton({ 
  children, 
  size = "md", 
  className, 
  disabled,
  ...props 
}) {
  return (
    <button
      className={cn(
        buttonBase,
        sizes[size],
        "bg-transparent text-[#3b3b3b]",
        "hover:bg-[#eceae5] active:bg-[#e0ddd7]",
        "focus:ring-[#3b3b3b]/30",
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

// Link Button - Looks like a link
export function LinkButton({ 
  children, 
  size = "md", 
  className, 
  disabled,
  ...props 
}) {
  return (
    <button
      className={cn(
        "inline-flex items-center gap-1",
        "text-[#4A5D4E] hover:text-[#3a4a3e]",
        "underline underline-offset-2",
        "transition-colors duration-200",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        size === "sm" && "text-sm",
        size === "md" && "text-base",
        size === "lg" && "text-lg",
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

// Icon Button - Icon only
export function IconButton({ 
  children, 
  size = "md", 
  variant = "ghost",
  className, 
  "aria-label": ariaLabel,
  disabled,
  ...props 
}) {
  const sizeClasses = {
    sm: "p-1.5",
    md: "p-2",
    lg: "p-3",
  };

  const variants = {
    ghost: "bg-transparent text-[#3b3b3b] hover:bg-[#eceae5]",
    primary: "bg-[#4A5D4E] text-white hover:bg-[#3a4a3e]",
    secondary: "bg-[#D4A574] text-white hover:bg-[#c08d54]",
    outline: "bg-transparent border border-[#3b3b3b]/20 text-[#3b3b3b] hover:bg-[#eceae5]",
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center",
        "rounded-lg transition-all duration-200",
        "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4A5D4E]/50",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        sizeClasses[size],
        variants[variant],
        className
      )}
      aria-label={ariaLabel}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

// Loading Button - Shows loading state
export function LoadingButton({ 
  children, 
  loading = false, 
  size = "md", 
  variant = "primary",
  className, 
  disabled,
  ...props 
}) {
  const variants = {
    primary: "bg-[#4A5D4E] text-white hover:bg-[#3a4a3e] focus:ring-[#4A5D4E]/50",
    secondary: "bg-[#D4A574] text-white hover:bg-[#c08d54] focus:ring-[#D4A574]/50",
  };

  return (
    <button
      className={cn(
        buttonBase,
        sizes[size],
        variants[variant],
        "shadow-sm",
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}

// Button Group - Group of related buttons
export function ButtonGroup({ children, className, ...props }) {
  return (
    <div
      className={cn(
        "inline-flex rounded-lg overflow-hidden",
        "[&>button]:rounded-none [&>button:first-child]:rounded-l-lg [&>button:last-child]:rounded-r-lg",
        "[&>button]:border-r [&>button]:border-white/20 [&>button:last-child]:border-r-0",
        className
      )}
      role="group"
      {...props}
    >
      {children}
    </div>
  );
}

// Split Button - Button with dropdown
export function SplitButton({ 
  children, 
  dropdownContent,
  size = "md", 
  className, 
  disabled,
  onDropdownClick,
  ...props 
}) {
  return (
    <div className={cn("inline-flex rounded-lg overflow-hidden", className)}>
      <button
        className={cn(
          buttonBase,
          sizes[size],
          "bg-[#4A5D4E] text-white",
          "hover:bg-[#3a4a3e]",
          "rounded-none rounded-l-lg",
          "border-r border-white/20"
        )}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
      <button
        className={cn(
          "px-2 bg-[#4A5D4E] text-white",
          "hover:bg-[#3a4a3e]",
          "rounded-none rounded-r-lg",
          "disabled:opacity-50 disabled:cursor-not-allowed"
        )}
        disabled={disabled}
        onClick={onDropdownClick}
        aria-label="More options"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </div>
  );
}

// Floating Action Button
export function FloatingButton({ 
  children, 
  position = "bottom-right",
  className, 
  disabled,
  ...props 
}) {
  const positions = {
    "bottom-right": "fixed bottom-6 right-6",
    "bottom-left": "fixed bottom-6 left-6",
    "bottom-center": "fixed bottom-6 left-1/2 -translate-x-1/2",
  };

  return (
    <button
      className={cn(
        "p-4 rounded-full",
        "bg-[#4A5D4E] text-white",
        "hover:bg-[#3a4a3e] active:bg-[#334137]",
        "shadow-lg hover:shadow-xl",
        "transition-all duration-200",
        "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4A5D4E]/50",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        positions[position],
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

export default {
  PrimaryButton,
  SecondaryButton,
  OutlineButton,
  DestructiveButton,
  GhostButton,
  LinkButton,
  IconButton,
  LoadingButton,
  ButtonGroup,
  SplitButton,
  FloatingButton,
};