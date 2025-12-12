/**
 * Accessibility utilities for improved user experience
 */

/**
 * Announce messages to screen readers
 */
export function announceToScreenReader(message, priority = 'polite') {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

/**
 * Focus trap for modal dialogs
 */
export function createFocusTrap(element) {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];
  
  const handleKeyDown = (e) => {
    if (e.key !== 'Tab') return;
    
    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  };
  
  element.addEventListener('keydown', handleKeyDown);
  
  return () => {
    element.removeEventListener('keydown', handleKeyDown);
  };
}

/**
 * Skip to content link functionality
 */
export function handleSkipToContent(contentId = 'main-content') {
  const content = document.getElementById(contentId);
  if (content) {
    content.setAttribute('tabindex', '-1');
    content.focus();
    content.addEventListener('blur', () => {
      content.removeAttribute('tabindex');
    }, { once: true });
  }
}

/**
 * Check if element is visible to screen readers
 */
export function isAccessible(element) {
  if (!element) return false;
  
  const style = window.getComputedStyle(element);
  return (
    style.display !== 'none' &&
    style.visibility !== 'hidden' &&
    style.opacity !== '0' &&
    !element.hasAttribute('aria-hidden')
  );
}

/**
 * Generate unique IDs for form labels
 */
let idCounter = 0;
export function generateId(prefix = 'id') {
  return `${prefix}-${++idCounter}`;
}