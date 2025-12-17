import React, { useEffect, useState } from 'react';
import { useTokenApplier } from './TokenApplierContext';

export function SelectionOverlay() {
  const { hoveredElement, selectedElement, highlightedElements = [], isActive } = useTokenApplier();
  const [overlayPosition, setOverlayPosition] = useState(null);
  const [selectedPosition, setSelectedPosition] = useState(null);

  // Update hover overlay position
  useEffect(() => {
    if (!hoveredElement || !isActive) {
      setOverlayPosition(null);
      return;
    }

    const updatePosition = () => {
      const rect = hoveredElement.getBoundingClientRect();
      setOverlayPosition({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      });
    };

    updatePosition();

    // Update on scroll/resize
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [hoveredElement, isActive]);

  // Update selected overlay position
  useEffect(() => {
    if (!selectedElement?.element) {
      setSelectedPosition(null);
      return;
    }

    const updatePosition = () => {
      const rect = selectedElement.element.getBoundingClientRect();
      setSelectedPosition({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      });
    };

    updatePosition();

    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [selectedElement]);

  if (!isActive && highlightedElements.length === 0) return null;

  return (
    <>
      {/* Highlighted elements (from style selection) */}
      {highlightedElements.length > 0 && highlightedElements.map((element, index) => {
        const rect = element?.getBoundingClientRect();
        if (!rect) return null;
        
        const isSelected = element === selectedElement?.element;
        
        return (
          <React.Fragment key={index}>
            <div
              style={{
                position: 'fixed',
                top: `${rect.top}px`,
                left: `${rect.left}px`,
                width: `${rect.width}px`,
                height: `${rect.height}px`,
                border: `2px solid ${isSelected ? 'var(--primary-600)' : 'rgb(234, 179, 8)'}`,
                background: isSelected ? 'var(--primary-300)' : 'rgb(254, 240, 138)',
                opacity: 0.25,
                pointerEvents: 'none',
                zIndex: 999997,
              }}
            />
            {index === 0 && (
              <div
                style={{
                  position: 'fixed',
                  top: `${rect.top - 30}px`,
                  left: `${rect.left}px`,
                  background: 'rgb(234, 179, 8)',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontFamily: 'monospace',
                  pointerEvents: 'none',
                  zIndex: 999999,
                  whiteSpace: 'nowrap',
                }}
              >
                {highlightedElements.length} element{highlightedElements.length > 1 ? 's' : ''} with this class
              </div>
            )}
          </React.Fragment>
        );
      })}

      {/* Hover overlay */}
      {overlayPosition && !selectedElement && (
        <>
          <div
            style={{
              position: 'fixed',
              top: `${overlayPosition.top}px`,
              left: `${overlayPosition.left}px`,
              width: `${overlayPosition.width}px`,
              height: `${overlayPosition.height}px`,
              border: '2px solid var(--primary-500)',
              background: 'var(--primary-200)',
              opacity: 0.15,
              pointerEvents: 'none',
              zIndex: 999998,
              transition: 'all 150ms ease-out',
            }}
          />
          <div
            style={{
              position: 'fixed',
              top: `${overlayPosition.top - 30}px`,
              left: `${overlayPosition.left}px`,
              background: 'var(--primary-600)',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '12px',
              fontFamily: 'monospace',
              pointerEvents: 'none',
              zIndex: 999999,
              whiteSpace: 'nowrap',
            }}
          >
            {hoveredElement.tagName.toLowerCase()}
            {hoveredElement.className ? `.${hoveredElement.className.split(' ')[0]}` : ''}
          </div>
        </>
      )}

      {/* Selected overlay */}
      {selectedPosition && (
        <>
          <div
            style={{
              position: 'fixed',
              top: `${selectedPosition.top}px`,
              left: `${selectedPosition.left}px`,
              width: `${selectedPosition.width}px`,
              height: `${selectedPosition.height}px`,
              border: '3px solid var(--primary-600)',
              background: 'var(--primary-300)',
              opacity: 0.25,
              pointerEvents: 'none',
              zIndex: 999998,
            }}
          />
          <div
            style={{
              position: 'fixed',
              top: `${selectedPosition.top - 30}px`,
              left: `${selectedPosition.left}px`,
              background: 'var(--primary-600)',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '12px',
              fontFamily: 'monospace',
              pointerEvents: 'none',
              zIndex: 999999,
              whiteSpace: 'nowrap',
              fontWeight: 'bold',
            }}
          >
            SELECTED
          </div>
        </>
      )}
    </>
  );
}