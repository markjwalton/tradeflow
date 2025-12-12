/**
 * Accessibility utility functions
 */

/**
 * Generate accessible labels for form fields
 */
export function getFieldLabel(fieldName, isRequired = false) {
  const label = fieldName
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .trim()
    .replace(/\b\w/g, l => l.toUpperCase());
  
  return isRequired ? `${label} (required)` : label;
}

/**
 * Get ARIA live region attributes based on urgency
 */
export function getLiveRegionProps(urgency = 'polite') {
  return {
    'aria-live': urgency,
    'aria-atomic': 'true',
  };
}

/**
 * Generate skip link for keyboard navigation
 */
export function SkipLink({ href = '#main-content', children = 'Skip to main content' }) {
  return (
    <a
      href={href}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg"
    >
      {children}
    </a>
  );
}

/**
 * Announce message to screen readers
 */
export function announceToScreenReader(message, urgency = 'polite') {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', urgency);
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

/**
 * Get accessible button props
 */
export function getButtonProps(label, disabled = false, pressed = undefined) {
  const props = {
    'aria-label': label,
    'aria-disabled': disabled,
  };
  
  if (pressed !== undefined) {
    props['aria-pressed'] = pressed;
  }
  
  return props;
}

/**
 * Get accessible dialog props
 */
export function getDialogProps(labelId, descriptionId) {
  return {
    role: 'dialog',
    'aria-modal': 'true',
    'aria-labelledby': labelId,
    'aria-describedby': descriptionId,
  };
}

/**
 * Check if element is visible to screen readers
 */
export function isVisibleToScreenReaders(element) {
  return (
    element.offsetWidth > 0 &&
    element.offsetHeight > 0 &&
    window.getComputedStyle(element).visibility !== 'hidden' &&
    !element.hasAttribute('aria-hidden')
  );
}