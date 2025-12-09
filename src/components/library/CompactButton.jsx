import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * CompactButton - Ultra-compact button for dense UIs
 * Part of the Sturij Design System
 */
export function CompactButton({ 
  children, 
  isActive, 
  className,
  ...props 
}) {
  return (
    <Button
      variant={isActive ? "default" : "outline"}
      className={cn(
        "h-7 w-7 p-0 text-[9px] font-medium min-w-0 flex items-center justify-center",
        className
      )}
      {...props}
    >
      {children}
    </Button>
  );
}