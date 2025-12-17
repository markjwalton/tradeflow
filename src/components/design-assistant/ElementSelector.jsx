import React, { useEffect } from 'react';
import { useTokenApplier } from './TokenApplierContext';

export function ElementSelector({ children }) {
  const { isActive, selectElement, setHoveredElement, hoveredElement } = useTokenApplier();

  useEffect(() => {
    if (!isActive) return;

    document.body.style.cursor = 'crosshair';

    const shouldIgnoreElement = (element) => {
      // Ignore token applier UI
      if (element.closest('[data-token-applier-ui]')) return true;
      if (element.hasAttribute('data-token-applier-ui')) return true;

      // Ignore Radix overlays/dialogs/sheets
      if (element.hasAttribute('data-radix-dialog-overlay')) return true;
      if (element.hasAttribute('data-radix-dialog-content')) return true;
      if (element.hasAttribute('data-radix-sheet-overlay')) return true;
      if (element.hasAttribute('data-radix-sheet-content')) return true;
      if (element.closest('[data-radix-popper-content-wrapper]')) return true;

      // Ignore editor layouts and panels
      if (element.hasAttribute('data-editor-layout')) return true;
      if (element.closest('[data-page-settings-panel]')) return true;

      // Ignore top-level structural elements
      const tagName = element.tagName.toLowerCase();
      if (tagName === 'html' || tagName === 'body') return true;

      // Ignore generic positioning wrappers (common culprits)
      const className = typeof element.className === 'string' ? element.className : (element.className?.baseVal || '');
      if (className.includes('absolute') && className.includes('inset-0')) return true;
      if (className.includes('fixed') && className.includes('inset-0')) return true;

      return false;
    };

    // Find a meaningful element (skip generic wrappers)
    const findMeaningfulElement = (target) => {
      let current = target;
      let iterations = 0;
      const maxIterations = 5;

      while (current && iterations < maxIterations) {
        if (shouldIgnoreElement(current)) {
          current = current.parentElement;
          iterations++;
          continue;
        }

        // Prefer elements with meaningful content or specific roles
        const hasText = current.textContent?.trim().length > 0;
        const hasChildren = current.children.length > 0;
        const isInteractive = ['button', 'a', 'input', 'select', 'textarea'].includes(current.tagName.toLowerCase());
        const classNameStr = typeof current.className === 'string' ? current.className : (current.className?.baseVal || '');
        const hasSemanticClasses = classNameStr.match(/\b(card|button|input|heading|text|list|item|nav|menu|form)\b/);

        if (isInteractive || hasSemanticClasses || (hasText && current.children.length < 5)) {
          return current;
        }

        // Skip generic wrappers (div/span with only positioning/layout classes)
        const tagName = current.tagName.toLowerCase();
        if ((tagName === 'div' || tagName === 'span') && hasChildren) {
          const classes = (current.className || '').split(' ').filter(c => c);
          const isGenericWrapper = classes.every(c => 
            c.startsWith('flex') || c.startsWith('grid') || c.startsWith('p-') || 
            c.startsWith('m-') || c.startsWith('w-') || c.startsWith('h-') ||
            c.startsWith('absolute') || c.startsWith('relative') || c.startsWith('fixed')
          );
          
          if (isGenericWrapper) {
            current = current.parentElement;
            iterations++;
            continue;
          }
        }

        return current;
      }

      return target;
    };

    const handleClick = (e) => {
      const target = findMeaningfulElement(e.target);
      if (!target || shouldIgnoreElement(target)) return;

      e.preventDefault();
      e.stopPropagation();
      selectElement(target);
    };

    const handleMouseOver = (e) => {
      const target = findMeaningfulElement(e.target);
      if (!target || shouldIgnoreElement(target)) return;
      setHoveredElement(target);
    };

    const handleMouseOut = () => {
      setHoveredElement(null);
    };

    document.addEventListener('click', handleClick, true);
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);

    return () => {
      document.body.style.cursor = '';
      document.removeEventListener('click', handleClick, true);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
    };
  }, [isActive, selectElement, setHoveredElement]);

  return <>{children}</>;
}