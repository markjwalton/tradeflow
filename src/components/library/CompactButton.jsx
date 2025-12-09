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
        "h-6 px-2 text-[10px] font-medium min-w-0",
        className
      )}
      {...props}
    >
      {children}
    </Button>
  );
}