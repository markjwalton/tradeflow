import React, { useEffect } from 'react';
import { useTokenApplier } from './TokenApplierContext';

export function ElementSelector({ children }) {
  const { isActive, selectElement, setHoveredElement, hoveredElement } = useTokenApplier();

  useEffect(() => {
    if (!isActive) return;

    // Change cursor to crosshair when active
    document.body.style.cursor = 'crosshair';

    const handleClick = (e) => {
      // Ignore clicks on the drawer and controls
      if (e.target.closest('[data-token-applier-ui]') || 
          e.target.closest('[data-radix-dialog-content]') ||
          e.target.closest('[data-radix-dialog-overlay]') ||
          e.target.closest('[data-headlessui-state]') ||
          e.target.closest('[role="dialog"]')) {
        return;
      }
      
      e.preventDefault();
      e.stopPropagation();
      selectElement(e.target);
    };

    const handleMouseOver = (e) => {
      if (e.target.closest('[data-token-applier-ui]') ||
          e.target.closest('[data-radix-dialog-content]') ||
          e.target.closest('[role="dialog"]')) {
        return;
      }
      setHoveredElement(e.target);
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

  // Add hover effect
  useEffect(() => {
    if (!hoveredElement || !isActive) return;

    const originalOutline = hoveredElement.style.outline;
    const originalOutlineOffset = hoveredElement.style.outlineOffset;
    
    hoveredElement.style.outline = '2px dashed var(--primary-500)';
    hoveredElement.style.outlineOffset = '2px';

    return () => {
      hoveredElement.style.outline = originalOutline;
      hoveredElement.style.outlineOffset = originalOutlineOffset;
    };
  }, [hoveredElement, isActive]);

  return <>{children}</>;
}