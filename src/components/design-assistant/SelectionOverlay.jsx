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

  if (!isActive) return null;

  return (
    <>
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