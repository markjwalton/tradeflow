import React, { useState, useEffect } from "react";
import { useEditMode } from "@/components/page-builder/EditModeContext";

export default function StyleInspectorOverlay({ onElementSelect }) {
  const { isEditMode } = useEditMode();
  const [hoveredElement, setHoveredElement] = useState(null);
  const [hoveredRect, setHoveredRect] = useState(null);

  useEffect(() => {
    if (!isEditMode) return;

    const handleMouseMove = (e) => {
      // Skip if hovering over the inspector UI itself
      if (e.target.closest('[data-inspector-ui]')) {
        setHoveredElement(null);
        setHoveredRect(null);
        return;
      }

      // Find the actual page element
      const element = e.target.closest('[data-page-content] *');
      if (element && element !== hoveredElement) {
        setHoveredElement(element);
        setHoveredRect(element.getBoundingClientRect());
      }
    };

    const handleClick = (e) => {
      if (e.target.closest('[data-inspector-ui]')) return;
      
      const element = e.target.closest('[data-page-content] *');
      if (element && onElementSelect) {
        e.preventDefault();
        e.stopPropagation();
        
        // Extract detailed element information
        const computedStyles = window.getComputedStyle(element);
        const elementData = {
          tagName: element.tagName ? element.tagName.toLowerCase() : 'unknown',
          id: element.id || null,
          classes: element.classList ? Array.from(element.classList).filter(Boolean) : [],
          inlineStyles: element.getAttribute('style') || null,
          computedStyles: {
            display: computedStyles.display || '',
            padding: computedStyles.padding || '',
            margin: computedStyles.margin || '',
            fontSize: computedStyles.fontSize || '',
            fontFamily: computedStyles.fontFamily || '',
            color: computedStyles.color || '',
            backgroundColor: computedStyles.backgroundColor || '',
            border: computedStyles.border || '',
            borderRadius: computedStyles.borderRadius || '',
            width: computedStyles.width || '',
            height: computedStyles.height || '',
          },
          parentElement: element.parentElement ? {
            tagName: element.parentElement.tagName ? element.parentElement.tagName.toLowerCase() : 'unknown',
            classes: element.parentElement.classList ? Array.from(element.parentElement.classList).filter(Boolean) : [],
          } : null,
          textContent: element.textContent ? element.textContent.substring(0, 100) : '',
        };
        
        onElementSelect(elementData, element);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('click', handleClick, true);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('click', handleClick, true);
    };
  }, [isEditMode, hoveredElement, onElementSelect]);

  if (!isEditMode || !hoveredRect) return null;

  return (
    <>
      {/* Highlight overlay */}
      <div
        style={{
          position: 'fixed',
          left: hoveredRect.left,
          top: hoveredRect.top,
          width: hoveredRect.width,
          height: hoveredRect.height,
          border: '2px solid var(--color-primary)',
          backgroundColor: 'rgba(74, 93, 78, 0.1)',
          pointerEvents: 'none',
          zIndex: 9998,
          transition: 'all 150ms ease-out',
        }}
      />
      
      {/* Tooltip */}
      {hoveredElement && (
        <div
          data-inspector-ui
          style={{
            position: 'fixed',
            left: hoveredRect.left,
            top: hoveredRect.top - 30,
            backgroundColor: 'var(--color-primary)',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            fontFamily: 'var(--font-family-mono)',
            pointerEvents: 'none',
            zIndex: 9999,
            whiteSpace: 'nowrap',
          }}
        >
          {hoveredElement.tagName ? hoveredElement.tagName.toLowerCase() : 'element'}
          {hoveredElement.id && `#${hoveredElement.id}`}
          {hoveredElement.classList && hoveredElement.classList.length > 0 && `.${Array.from(hoveredElement.classList).filter(Boolean).join('.')}`}
        </div>
      )}
    </>
  );
}