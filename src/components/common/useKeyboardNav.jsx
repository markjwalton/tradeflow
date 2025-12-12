import { useEffect, useCallback } from 'react';

/**
 * Hook for keyboard navigation in lists and menus
 * @param {Array} items - Array of items to navigate
 * @param {Function} onSelect - Callback when item is selected
 * @param {Object} options - Configuration options
 */
export function useKeyboardNav(items, onSelect, options = {}) {
  const {
    loop = true,
    activeIndex = 0,
    onIndexChange,
    enabled = true,
  } = options;

  const handleKeyDown = useCallback((e) => {
    if (!enabled || items.length === 0) return;

    let newIndex = activeIndex;

    switch (e.key) {
      case 'ArrowDown':
      case 'Down':
        e.preventDefault();
        newIndex = activeIndex + 1;
        if (newIndex >= items.length) {
          newIndex = loop ? 0 : items.length - 1;
        }
        break;

      case 'ArrowUp':
      case 'Up':
        e.preventDefault();
        newIndex = activeIndex - 1;
        if (newIndex < 0) {
          newIndex = loop ? items.length - 1 : 0;
        }
        break;

      case 'Home':
        e.preventDefault();
        newIndex = 0;
        break;

      case 'End':
        e.preventDefault();
        newIndex = items.length - 1;
        break;

      case 'Enter':
      case ' ':
        e.preventDefault();
        if (items[activeIndex]) {
          onSelect?.(items[activeIndex], activeIndex);
        }
        return;

      case 'Escape':
        e.preventDefault();
        options.onEscape?.();
        return;

      default:
        return;
    }

    if (newIndex !== activeIndex) {
      onIndexChange?.(newIndex);
    }
  }, [items, activeIndex, enabled, loop, onSelect, onIndexChange]);

  useEffect(() => {
    if (enabled) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [enabled, handleKeyDown]);

  return {
    activeIndex,
    handleKeyDown,
  };
}

/**
 * Hook for escape key handling
 */
export function useEscapeKey(callback, enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        callback();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [callback, enabled]);
}