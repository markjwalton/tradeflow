import { useEffect } from 'react';

/**
 * Hook for keyboard navigation support
 * @param {Object} handlers - Keyboard event handlers
 * @param {boolean} enabled - Whether keyboard nav is enabled
 */
export function useKeyboardNav(handlers = {}, enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e) => {
      const key = e.key;
      
      // Escape key
      if (key === 'Escape' && handlers.onEscape) {
        handlers.onEscape(e);
      }
      
      // Enter key
      if (key === 'Enter' && handlers.onEnter) {
        handlers.onEnter(e);
      }
      
      // Arrow keys
      if (key === 'ArrowUp' && handlers.onArrowUp) {
        e.preventDefault();
        handlers.onArrowUp(e);
      }
      if (key === 'ArrowDown' && handlers.onArrowDown) {
        e.preventDefault();
        handlers.onArrowDown(e);
      }
      if (key === 'ArrowLeft' && handlers.onArrowLeft) {
        e.preventDefault();
        handlers.onArrowLeft(e);
      }
      if (key === 'ArrowRight' && handlers.onArrowRight) {
        e.preventDefault();
        handlers.onArrowRight(e);
      }
      
      // Tab key
      if (key === 'Tab' && handlers.onTab) {
        handlers.onTab(e);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handlers, enabled]);
}

/**
 * Hook for focus trap within a container
 */
export function useFocusTrap(containerRef, enabled = true) {
  useEffect(() => {
    if (!enabled || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTab = (e) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    container.addEventListener('keydown', handleTab);
    firstElement?.focus();

    return () => container.removeEventListener('keydown', handleTab);
  }, [containerRef, enabled]);
}