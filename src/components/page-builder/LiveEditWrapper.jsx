import React, { useEffect, useState } from "react";
import { InteractiveSelector } from "./InteractiveSelector";
import { useEditMode } from "./EditModeContext";
import { base44 } from "@/api/base44Client";



export function LiveEditWrapper({ children }) {
  const {
    isEditMode,
    selectedElement,
    setSelectedElement,
  } = useEditMode();

  const [liveEditActive, setLiveEditActive] = useState(false);

  useEffect(() => {
    const handlePreferencesChange = (event) => {
      setLiveEditActive(event.detail.liveEditMode ?? false);
    };

    const loadPreferences = async () => {
      try {
        const user = await base44.auth.me();
        setLiveEditActive(user?.ui_preferences?.liveEditMode ?? false);
      } catch (e) {
        // User not logged in
      }
    };

    loadPreferences();
    window.addEventListener('ui-preferences-changed', handlePreferencesChange);
    return () => window.removeEventListener('ui-preferences-changed', handlePreferencesChange);
  }, []);



  useEffect(() => {
    const handleApplyStyle = (event) => {
      if (!selectedElement) return;

      const { currentClasses, originalElement } = selectedElement;
      let classArray = currentClasses.split(/\s+/).filter(Boolean);

      const newClass = event.detail.className;
      
      // Remove conflicting classes
      if (newClass.startsWith('text-') && !newClass.includes('muted')) {
        classArray = classArray.filter(c => !c.match(/^text-(primary|secondary|accent|background|foreground|muted|card|destructive|success|warning|info|xs|sm|base|lg|xl|2xl|3xl|4xl)/));
      } else if (newClass.startsWith('bg-')) {
        classArray = classArray.filter(c => !c.match(/^bg-/));
      } else if (newClass.match(/^p-\d+$/)) {
        classArray = classArray.filter(c => !c.match(/^p-\d+$/));
      } else if (newClass.match(/^m-\d+$/)) {
        classArray = classArray.filter(c => !c.match(/^m-\d+$/));
      } else if (newClass.startsWith('font-')) {
        classArray = classArray.filter(c => !c.match(/^font-\d+$/));
      } else if (newClass.startsWith('rounded-')) {
        classArray = classArray.filter(c => !c.match(/^rounded/));
      }

      classArray.push(newClass);
      const newClasses = classArray.join(' ');

      // Update DOM
      if (originalElement) {
        originalElement.className = newClasses;
      }

      // Update selected element state
      setSelectedElement({ ...selectedElement, currentClasses: newClasses });
    };

    window.addEventListener('apply-element-style', handleApplyStyle);
    return () => window.removeEventListener('apply-element-style', handleApplyStyle);
  }, [selectedElement]);

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
  };



  return (
    <>
      {liveEditActive ? (
        <InteractiveSelector isActive={true} onElementSelect={handleElementSelect}>
          <div data-page-content>
            {children}
          </div>
        </InteractiveSelector>
      ) : (
        <div data-page-content>
          {children}
        </div>
      )}
    </>
  );
}