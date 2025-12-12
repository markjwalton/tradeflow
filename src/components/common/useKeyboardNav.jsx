import { useEffect, useCallback } from 'react';

/**
 * Keyboard navigation patterns
 */
export const KeyboardPatterns = {
  LIST_VERTICAL: 'list-vertical',
  LIST_HORIZONTAL: 'list-horizontal',
  GRID: 'grid',
  MENU: 'menu',
};

/**
 * Hook for keyboard navigation
 */
export function useKeyboardNav(options = {}) {
  const {
    pattern = KeyboardPatterns.LIST_VERTICAL,
    onSelect,
    onEscape,
    containerRef,
    itemSelector = '[role="option"], [role="menuitem"], button, a',
  } = options;

  const navigate = useCallback((direction) => {
    if (!containerRef?.current) return;
    
    const items = Array.from(
      containerRef.current.querySelectorAll(itemSelector)
    ).filter(item => !item.disabled && item.offsetParent !== null);
    
    const currentIndex = items.findIndex(item => item === document.activeElement);
    let nextIndex = -1;

    switch (pattern) {
      case KeyboardPatterns.LIST_VERTICAL:
        if (direction === 'down') {
          nextIndex = currentIndex + 1;
        } else if (direction === 'up') {
          nextIndex = currentIndex - 1;
        }
        break;
        
      case KeyboardPatterns.LIST_HORIZONTAL:
        if (direction === 'right') {
          nextIndex = currentIndex + 1;
        } else if (direction === 'left') {
          nextIndex = currentIndex - 1;
        }
        break;
        
      case KeyboardPatterns.MENU:
        if (direction === 'down') {
          nextIndex = currentIndex + 1;
        } else if (direction === 'up') {
          nextIndex = currentIndex - 1;
        } else if (direction === 'home') {
          nextIndex = 0;
        } else if (direction === 'end') {
          nextIndex = items.length - 1;
        }
        break;
    }

    if (nextIndex >= 0 && nextIndex < items.length) {
      items[nextIndex].focus();
      return items[nextIndex];
    } else if (nextIndex >= items.length) {
      items[0].focus();
      return items[0];
    } else if (nextIndex < 0) {
      items[items.length - 1].focus();
      return items[items.length - 1];
    }
  }, [containerRef, itemSelector, pattern]);

  const handleKeyDown = useCallback((e) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        navigate('down');
        break;
      case 'ArrowUp':
        e.preventDefault();
        navigate('up');
        break;
      case 'ArrowRight':
        e.preventDefault();
        navigate('right');
        break;
      case 'ArrowLeft':
        e.preventDefault();
        navigate('left');
        break;
      case 'Home':
        e.preventDefault();
        navigate('home');
        break;
      case 'End':
        e.preventDefault();
        navigate('end');
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (onSelect && document.activeElement) {
          onSelect(document.activeElement);
        }
        break;
      case 'Escape':
        e.preventDefault();
        if (onEscape) {
          onEscape();
        }
        break;
    }
  }, [navigate, onSelect, onEscape]);

  useEffect(() => {
    const container = containerRef?.current;
    if (!container) return;

    container.addEventListener('keydown', handleKeyDown);
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, [containerRef, handleKeyDown]);

  return { navigate };
}

/**
 * Hook for escape key handler
 */
export function useEscapeKey(callback) {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        callback();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [callback]);
}