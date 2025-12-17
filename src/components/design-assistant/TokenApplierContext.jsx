import React, { createContext, useContext, useState, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const TokenApplierContext = createContext(null);

export const useTokenApplier = () => {
  const context = useContext(TokenApplierContext);
  if (!context) {
    throw new Error('useTokenApplier must be used within TokenApplierProvider');
  }
  return context;
};

export function TokenApplierProvider({ children }) {
  const [isActive, setIsActive] = useState(false);
  const [selectedElement, setSelectedElement] = useState(null);
  const [hoveredElement, setHoveredElement] = useState(null);

  const activateTokenApplier = useCallback(() => {
    setIsActive(true);
    toast.info('Click any element to select it');
  }, []);

  const deactivateTokenApplier = useCallback(() => {
    setIsActive(false);
    setSelectedElement(null);
    setHoveredElement(null);
  }, []);

  const selectElement = useCallback((element) => {
    if (!element) return;
    
    const computedStyle = window.getComputedStyle(element);
    const elementInfo = {
      element,
      tagName: element.tagName.toLowerCase(),
      className: element.className,
      id: element.id,
      styles: {
        backgroundColor: computedStyle.backgroundColor,
        color: computedStyle.color,
        padding: computedStyle.padding,
        margin: computedStyle.margin,
        borderRadius: computedStyle.borderRadius,
        boxShadow: computedStyle.boxShadow,
        fontFamily: computedStyle.fontFamily,
        fontSize: computedStyle.fontSize,
        lineHeight: computedStyle.lineHeight,
        letterSpacing: computedStyle.letterSpacing,
      }
    };
    
    setSelectedElement(elementInfo);
    toast.success(`Selected: ${elementInfo.tagName}${elementInfo.className ? '.' + elementInfo.className.split(' ')[0] : ''}`);
  }, []);

  const applyToken = useCallback(async (property, tokenValue, tokenName) => {
    if (!selectedElement?.element) {
      toast.error('Please select an element first');
      return;
    }

    // Apply style ONLY to the selected element
    selectedElement.element.style[property] = tokenValue;
    
    // Update selected element info
    const computedStyle = window.getComputedStyle(selectedElement.element);
    setSelectedElement(prev => ({
      ...prev,
      styles: {
        ...prev.styles,
        [property]: computedStyle[property]
      }
    }));

    toast.success(`Applied ${tokenName} to selected element`);
  }, [selectedElement]);

  const saveMapping = useCallback(async (componentType, selector) => {
    if (!selectedElement) {
      toast.error('No element selected');
      return;
    }

    const tokenMappings = {};
    
    // Extract token values from inline styles
    const style = selectedElement.element.style;
    if (style.backgroundColor) tokenMappings.backgroundColor = style.backgroundColor;
    if (style.color) tokenMappings.color = style.color;
    if (style.padding) tokenMappings.padding = style.padding;
    if (style.margin) tokenMappings.margin = style.margin;
    if (style.borderRadius) tokenMappings.borderRadius = style.borderRadius;
    if (style.boxShadow) tokenMappings.boxShadow = style.boxShadow;
    if (style.fontFamily) tokenMappings.fontFamily = style.fontFamily;
    if (style.fontSize) tokenMappings.fontSize = style.fontSize;
    if (style.lineHeight) tokenMappings.lineHeight = style.lineHeight;
    if (style.letterSpacing) tokenMappings.letterSpacing = style.letterSpacing;

    try {
      await base44.entities.ComponentStyleMapping.create({
        component_type: componentType || selectedElement.tagName,
        selector: selector || selectedElement.className,
        token_mappings: tokenMappings,
        category: 'custom'
      });
      
      toast.success('Style mapping saved!');
    } catch (error) {
      toast.error('Failed to save mapping: ' + error.message);
    }
  }, [selectedElement]);

  const value = {
    isActive,
    selectedElement,
    hoveredElement,
    setHoveredElement,
    activateTokenApplier,
    deactivateTokenApplier,
    selectElement,
    applyToken,
    saveMapping
  };

  return (
    <TokenApplierContext.Provider value={value}>
      {children}
    </TokenApplierContext.Provider>
  );
}