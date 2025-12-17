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

  // Add hover effect with rectangle overlay and tooltip
  useEffect(() => {
    if (!hoveredElement || !isActive) return;

    const rect = hoveredElement.getBoundingClientRect();
    
    // Create rectangle overlay
    const overlay = document.createElement('div');
    overlay.setAttribute('data-token-applier-ui', 'true');
    overlay.style.cssText = `
      position: fixed;
      top: ${rect.top}px;
      left: ${rect.left}px;
      width: ${rect.width}px;
      height: ${rect.height}px;
      border: 2px solid var(--primary-500);
      background: var(--primary-200);
      opacity: 0.15;
      pointer-events: none;
      z-index: 999998;
      transition: all 150ms ease-out;
    `;
    document.body.appendChild(overlay);
    
    // Create tooltip
    const tooltip = document.createElement('div');
    tooltip.setAttribute('data-token-applier-ui', 'true');
    const tagName = hoveredElement.tagName.toLowerCase();
    const classes = hoveredElement.className ? `.${hoveredElement.className.split(' ').join('.')}` : '';
    
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

    // Update overlay position on scroll
    const updatePosition = () => {
      const newRect = hoveredElement.getBoundingClientRect();
      overlay.style.top = `${newRect.top}px`;
      overlay.style.left = `${newRect.left}px`;
      overlay.style.width = `${newRect.width}px`;
      overlay.style.height = `${newRect.height}px`;
      tooltip.style.top = `${newRect.top - 30}px`;
      tooltip.style.left = `${newRect.left}px`;
    };
    
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);

    return () => {
      overlay.remove();
      tooltip.remove();
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [hoveredElement, isActive]);

  return <>{children}</>;
}