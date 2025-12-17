import React, { useEffect } from 'react';
import { useTokenApplier } from './TokenApplierContext';

export function ElementSelector({ children }) {
  const { isActive, selectElement, setHoveredElement } = useTokenApplier();

  useEffect(() => {
    if (!isActive) return;

    const handleClick = (e) => {
      // Ignore clicks on the drawer and controls
      if (e.target.closest('[data-token-applier-ui]')) {
        return;
      }
      
      e.preventDefault();
      e.stopPropagation();
      selectElement(e.target);
    };

    const handleMouseOver = (e) => {
      if (e.target.closest('[data-token-applier-ui]')) {
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
      document.removeEventListener('click', handleClick, true);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
    };
  }, [isActive, selectElement, setHoveredElement]);

  return <>{children}</>;
}