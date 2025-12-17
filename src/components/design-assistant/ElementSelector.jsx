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

      // Ignore Radix overlays/dialogs
      if (element.hasAttribute('data-radix-dialog-overlay')) return true;
      if (element.hasAttribute('data-radix-dialog-content')) return true;
      if (element.hasAttribute('data-radix-sheet-overlay')) return true;
      if (element.hasAttribute('data-radix-sheet-content')) return true;
      if (element.hasAttribute('data-headlessui-state')) return true;

      // Ignore editor layouts
      if (element.hasAttribute('data-editor-layout')) return true;

      // Ignore top-level structural elements
      const tagName = element.tagName.toLowerCase();
      if (tagName === 'html' || tagName === 'body') return true;

      return false;
    };

    const handleClick = (e) => {
      const target = e.target;
      if (shouldIgnoreElement(target)) return;

      e.preventDefault();
      e.stopPropagation();
      selectElement(target);
    };

    const handleMouseOver = (e) => {
      const target = e.target;
      if (shouldIgnoreElement(target)) return;
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