import React, { useEffect, useState } from "react";
import { InteractiveSelector } from "./InteractiveSelector";
import { useEditMode } from "./EditModeContext";
import { base44 } from "@/api/base44Client";



export function LiveEditWrapper({ children }) {
  const {
    isEditMode,
    selectedElement,
    setSelectedElement,
    currentPageContent,
    setCurrentPageContent,
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
    if (liveEditActive) {
      // Extract HTML on edit mode activation
      const childrenContainer = document.querySelector('[data-page-content]');
      if (childrenContainer && !currentPageContent) {
        setCurrentPageContent(childrenContainer.innerHTML);
      }
    } else {
      // Clear content when exiting edit mode to force fresh load
      setCurrentPageContent("");
    }
  }, [liveEditActive]);

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
      <div data-page-content style={{ display: liveEditActive ? 'none' : 'block' }}>
        {children}
      </div>

      {liveEditActive && currentPageContent && (
        <InteractiveSelector isActive={liveEditActive} onElementSelect={handleElementSelect}>
          <div data-live-edit-content dangerouslySetInnerHTML={{ __html: currentPageContent }} />
        </InteractiveSelector>
      )}
    </>
  );
}