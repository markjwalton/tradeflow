import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export function InteractiveSelector({ 
  children, 
  onElementSelect, 
  isActive,
  className 
}) {
  const containerRef = useRef(null);
  const [hoveredElement, setHoveredElement] = useState(null);
  const overlayRef = useRef(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const handleMouseMove = (e) => {
      if (!isActive) return;
      
      const target = e.target;
      
      // Skip if clicking on overlay itself
      if (
        target === overlayRef.current ||
        target.closest('[data-interactive-ignore]')
      ) {
        setHoveredElement(null);
        return;
      }

      // Find the closest editable element
      const editableElement = findEditableElement(target);
      if (editableElement && editableElement !== hoveredElement) {
        setHoveredElement(editableElement);
      }
    };

    const handleClick = (e) => {
      if (!isActive) return;
      
      const target = e.target;
      
      // Skip non-editable elements
      if (
        target === overlayRef.current ||
        target.closest('[data-interactive-ignore]')
      ) {
        return;
      }

      // Allow normal interaction with buttons, inputs, links, etc.
      if (target.tagName === 'BUTTON' || target.tagName === 'INPUT' || target.tagName === 'A' || target.tagName === 'SELECT') {
        return;
      }

      e.preventDefault();
      e.stopPropagation();

      const editableElement = findEditableElement(target);
      if (editableElement) {
        const elementData = extractElementData(editableElement);
        onElementSelect(elementData);
      }
    };

    const container = containerRef.current;
    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('click', handleClick, true);

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('click', handleClick, true);
    };
  }, [isActive, hoveredElement, onElementSelect]);

  // Find closest editable element (skip wrappers)
  const findEditableElement = (element) => {
    let current = element;
    let depth = 0;
    const maxDepth = 5;

    while (current && depth < maxDepth) {
      // Skip root container
      if (current === containerRef.current) return null;
      
      // Check if element has meaningful content or styles
      const hasClasses = current.className && current.className.length > 0;
      const hasId = current.id && current.id.length > 0;
      const isSemanticTag = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'P', 'A', 'BUTTON', 'DIV', 'SECTION', 'ARTICLE', 'SPAN', 'LABEL'].includes(current.tagName);
      
      if ((hasClasses || hasId) && isSemanticTag) {
        return current;
      }
      
      current = current.parentElement;
      depth++;
    }
    
    return element;
  };

  // Extract element data for editing
  const extractElementData = (element) => {
    // Get unique identifier using data-element-id if available
    const elementId = element.getAttribute('data-element-id') || generateElementId(element);
    element.setAttribute('data-element-id', elementId);

    return {
      id: elementId,
      tagName: element.tagName.toLowerCase(),
      className: element.className || '',
      textContent: element.textContent?.substring(0, 50) || '',
      element: element,
      path: getElementPath(element),
      styles: window.getComputedStyle(element),
    };
  };

  // Generate unique ID for element
  const generateElementId = (element) => {
    const tag = element.tagName.toLowerCase();
    const classes = element.className?.split(' ')[0] || '';
    const text = element.textContent?.substring(0, 10).replace(/\s/g, '-') || '';
    const timestamp = Date.now();
    return `${tag}-${classes}-${text}-${timestamp}`.substring(0, 50);
  };

  // Get readable path for element
  const getElementPath = (element) => {
    const path = [];
    let current = element;
    let depth = 0;
    const maxDepth = 4;

    while (current && current !== containerRef.current && depth < maxDepth) {
      let segment = current.tagName.toLowerCase();
      
      if (current.id) {
        segment += `#${current.id}`;
      } else if (current.className) {
        const firstClass = current.className.split(' ')[0];
        if (firstClass) segment += `.${firstClass}`;
      }
      
      path.unshift(segment);
      current = current.parentElement;
      depth++;
    }
    
    return path.join(' > ');
  };

  // Render highlight overlay
  const renderHighlight = () => {
    if (!hoveredElement || !isActive) return null;

    const rect = hoveredElement.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();

    return (
      <div
        data-interactive-ignore
        style={{
          position: 'absolute',
          left: rect.left - containerRect.left,
          top: rect.top - containerRect.top,
          width: rect.width,
          height: rect.height,
          border: '2px solid var(--color-primary)',
          backgroundColor: 'var(--color-primary-50)',
          opacity: 0.3,
          pointerEvents: 'none',
          zIndex: 9998,
          transition: 'all 100ms ease-out',
        }}
      />
    );
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full",
        isActive && "cursor-crosshair",
        className
      )}
    >
      <div ref={overlayRef} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', zIndex: 9998 }}>
        {renderHighlight()}
      </div>
      <div style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>
    </div>
  );
}