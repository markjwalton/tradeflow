import React, { useState, useRef, useEffect } from "react";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

export function PullToRefresh({ onRefresh, children, enabled = true }) {
  const [pulling, setPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const startY = useRef(0);
  const threshold = 80;

  const handleTouchStart = (e) => {
    if (!enabled || window.scrollY > 0) return;
    startY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e) => {
    if (!enabled || window.scrollY > 0 || startY.current === 0) return;

    const currentY = e.touches[0].clientY;
    const distance = currentY - startY.current;

    if (distance > 0) {
      setPulling(true);
      setPullDistance(Math.min(distance, threshold * 1.5));
    }
  };

  const handleTouchEnd = async () => {
    if (!enabled || pullDistance < threshold) {
      setPulling(false);
      setPullDistance(0);
      startY.current = 0;
      return;
    }

    try {
      await onRefresh?.();
    } finally {
      setPulling(false);
      setPullDistance(0);
      startY.current = 0;
    }
  };

  const progress = Math.min((pullDistance / threshold) * 100, 100);

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative"
    >
      {/* Pull indicator */}
      {pulling && (
        <div
          className="absolute top-0 left-0 right-0 flex items-center justify-center transition-all duration-200"
          style={{ transform: `translateY(${Math.min(pullDistance - 40, 40)}px)` }}
        >
          <div className="bg-primary text-primary-foreground rounded-full p-2 shadow-lg">
            <RefreshCw
              className={cn(
                "h-5 w-5 transition-transform",
                progress >= 100 && "animate-spin"
              )}
              style={{ transform: `rotate(${progress * 3.6}deg)` }}
            />
          </div>
        </div>
      )}

      {children}
    </div>
  );
}