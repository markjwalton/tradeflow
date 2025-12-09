import React, { useEffect, useState } from "react";
import { InteractiveSelector } from "./InteractiveSelector";
import { ComponentPalette } from "./ComponentPalette";
import { useEditMode } from "./EditModeContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Palette, Package } from "lucide-react";

const TOKEN_LIBRARY = {
  colors: [
    { name: "Primary", value: "text-[var(--color-primary)]", bg: "bg-[var(--color-primary)]" },
    { name: "Secondary", value: "text-[var(--color-secondary)]", bg: "bg-[var(--color-secondary)]" },
    { name: "Accent", value: "text-[var(--color-accent)]", bg: "bg-[var(--color-accent)]" },
    { name: "Charcoal", value: "text-[var(--color-charcoal)]", bg: "bg-[var(--color-charcoal)]" },
  ],
  spacing: [
    { name: "2 (0.5rem)", value: "p-[var(--spacing-2)]", m: "m-[var(--spacing-2)]" },
    { name: "4 (1rem)", value: "p-[var(--spacing-4)]", m: "m-[var(--spacing-4)]" },
    { name: "6 (1.5rem)", value: "p-[var(--spacing-6)]", m: "m-[var(--spacing-6)]" },
    { name: "8 (2rem)", value: "p-[var(--spacing-8)]", m: "m-[var(--spacing-8)]" },
  ],
  radius: [
    { name: "Medium", value: "rounded-[var(--radius-md)]" },
    { name: "Large", value: "rounded-[var(--radius-lg)]" },
    { name: "XL", value: "rounded-[var(--radius-xl)]" },
  ],
  shadows: [
    { name: "Small", value: "shadow-[var(--shadow-sm)]" },
    { name: "Medium", value: "shadow-[var(--shadow-md)]" },
    { name: "Large", value: "shadow-[var(--shadow-lg)]" },
  ],
};

export function LiveEditWrapper({ children }) {
  const {
    isEditMode,
    selectedElement,
    setSelectedElement,
    showTokenPicker,
    setShowTokenPicker,
    currentPageContent,
    setCurrentPageContent,
  } = useEditMode();

  useEffect(() => {
    if (isEditMode) {
      // Extract HTML on edit mode activation
      const childrenContainer = document.querySelector('[data-page-content]');
      if (childrenContainer && !currentPageContent) {
        setCurrentPageContent(childrenContainer.innerHTML);
      }
    } else {
      // Clear content when exiting edit mode to force fresh load
      setCurrentPageContent("");
    }
  }, [isEditMode]);

  const handleElementSelect = (elementData) => {
    const isTextElement = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'P', 'SPAN', 'LABEL', 'BUTTON', 'A'].includes(elementData.tagName.toUpperCase());
    
    setSelectedElement({
      id: elementData.id,
      currentClasses: elementData.className,
      tagName: elementData.tagName,
      textContent: elementData.element.textContent,
      innerHTML: elementData.element.innerHTML,
      originalElement: elementData.element,
      path: elementData.path,
      isTextElement,
    });
    setShowTokenPicker(true);
  };

  const handleInsertComponent = (componentCode) => {
    const updatedContent = currentPageContent + '\n\n' + componentCode;
    setCurrentPageContent(updatedContent);
    
    // Force re-render with new content
    const container = document.querySelector('[data-live-edit-content]');
    if (container) {
      container.innerHTML = updatedContent;
    }
    
    toast.success("Component added");
  };

  const applyTokenToElement = (tokenClass, tokenType) => {
    if (!selectedElement) {
      toast.error("No element selected");
      return;
    }

    const { currentClasses, originalElement, id } = selectedElement;
    let classArray = currentClasses.split(/\s+/).filter(Boolean);

    // Remove conflicting classes
    if (tokenType === 'color-text') {
      classArray = classArray.filter(c => !c.match(/^text-\[var\(--color-/));
    } else if (tokenType === 'color-bg') {
      classArray = classArray.filter(c => !c.match(/^bg-\[var\(--color-/));
    } else if (tokenType === 'spacing-p') {
      classArray = classArray.filter(c => !c.match(/^p-\[var\(--spacing-/) && !c.match(/^p[xytblr]?-/));
    } else if (tokenType === 'spacing-m') {
      classArray = classArray.filter(c => !c.match(/^m-\[var\(--spacing-/) && !c.match(/^m[xytblr]?-/));
    } else if (tokenType === 'radius') {
      classArray = classArray.filter(c => !c.match(/^rounded/));
    } else if (tokenType === 'shadow') {
      classArray = classArray.filter(c => !c.match(/^shadow/));
    }

    classArray.push(tokenClass);
    const newClasses = classArray.join(' ');

    // Update DOM
    if (originalElement) {
      originalElement.className = newClasses;
    }

    // Update content
    let updatedContent = currentPageContent;
    if (id) {
      const idRegex = new RegExp(`(data-element-id=["']${id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'][^>]*class=)["'][^"']*["']`);
      updatedContent = currentPageContent.replace(idRegex, `$1"${newClasses}"`);
    }

    setCurrentPageContent(updatedContent);
    setSelectedElement({ ...selectedElement, currentClasses: newClasses });
    toast.success("Token applied");
  };

  const updateElementText = (newText) => {
    if (!selectedElement) return;

    const { originalElement, id } = selectedElement;

    // Update DOM
    if (originalElement) {
      originalElement.textContent = newText;
    }

    // Update content in state
    let updatedContent = currentPageContent;
    if (id) {
      // Find the element by data-element-id and replace its text content
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = currentPageContent;
      const targetElement = tempDiv.querySelector(`[data-element-id="${id}"]`);
      
      if (targetElement) {
        targetElement.textContent = newText;
        updatedContent = tempDiv.innerHTML;
      }
    }

    setCurrentPageContent(updatedContent);
    setSelectedElement({ ...selectedElement, textContent: newText });
    toast.success("Text updated");
  };

  return (
    <div data-page-content>
      {children}
    </div>
  );
}