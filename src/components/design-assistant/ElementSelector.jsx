import React, { useEffect } from 'react';
import { useTokenApplier } from './TokenApplierContext';

export function ElementSelector({ children }) {
  const { isActive, selectElement, setHoveredElement, hoveredElement } = useTokenApplier();

  useEffect(() => {
    if (!isActive) return;

    // Change cursor to crosshair when active
    document.body.style.cursor = 'crosshair';

    const shouldIgnoreElement = (element) => {
      // Ignore token applier UI controls
      if (element.closest('[data-token-applier-ui]')) return true;
      
      // Ignore dialog/drawer backdrops and overlays from headless UI
      if (element.hasAttribute('data-headlessui-state')) return true;
      
      const classes = element.className || '';
      
      // Only ignore explicitly non-interactive elements
      if (typeof classes === 'string' && classes.includes('pointer-events-none')) return true;
      
      // Ignore transparent overlays that cover the whole screen
      if (classes.includes('fixed') && classes.includes('inset-0') && 
          (classes.includes('bg-transparent') || classes.includes('opacity-0'))) return true;
      
      // Ignore main structural elements
      const tagName = element.tagName.toLowerCase();
      if (tagName === 'html' || tagName === 'body') return true;
      if (element.id === 'root') return true;

      return false;
    };

    const handleClick = (e) => {
      if (shouldIgnoreElement(e.target)) return;
      
      e.preventDefault();
      e.stopPropagation();
      selectElement(e.target);
    };

    const handleMouseOver = (e) => {
      if (shouldIgnoreElement(e.target)) return;
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

  // Add hover effect with tooltip
  useEffect(() => {
    if (!hoveredElement || !isActive) return;

    const originalOutline = hoveredElement.style.outline;
    const originalOutlineOffset = hoveredElement.style.outlineOffset;
    const originalBoxShadow = hoveredElement.style.boxShadow;
    
    hoveredElement.style.outline = '2px solid var(--primary-500)';
    hoveredElement.style.outlineOffset = '2px';
    hoveredElement.style.boxShadow = '0 0 0 2px var(--primary-200)';
    
    // Create tooltip
    const tooltip = document.createElement('div');
    tooltip.setAttribute('data-token-applier-ui', 'true');
    const tagName = hoveredElement.tagName.toLowerCase();
    const classes = hoveredElement.className ? `.${hoveredElement.className.split(' ').join('.')}` : '';
    const rect = hoveredElement.getBoundingClientRect();
    
    tooltip.style.cssText = `
      position: fixed;
      top: ${rect.top - 30}px;
      left: ${rect.left}px;
      background: var(--primary-600);
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-family: monospace;
      pointer-events: none;
      z-index: 999999;
      white-space: nowrap;
    `;
    tooltip.textContent = `${tagName}${classes.length > 30 ? classes.substring(0, 30) + '...' : classes}`;
    document.body.appendChild(tooltip);

    return () => {
      hoveredElement.style.outline = originalOutline;
      hoveredElement.style.outlineOffset = originalOutlineOffset;
      hoveredElement.style.boxShadow = originalBoxShadow;
      tooltip.remove();
    };
  }, [hoveredElement, isActive]);

  return <>{children}</>;
}