import React, { createContext, useContext, useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

const EditModeContext = createContext(null);

export function EditModeProvider({ children }) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [showComponentPalette, setShowComponentPalette] = useState(false);
  const [showTokenPicker, setShowTokenPicker] = useState(false);
  const [selectedElement, setSelectedElement] = useState(null);
  const [currentPageContent, setCurrentPageContent] = useState("");
  const [currentPageData, setCurrentPageData] = useState(null);
  const [pageTextElements, setPageTextElements] = useState([]);
  const [customProperties, setCustomProperties] = useState([]);

  // Load edit mode state from user preferences
  useEffect(() => {
    const loadEditMode = async () => {
      try {
        const user = await base44.auth.me();
        if (user?.ui_preferences?.liveEditMode !== undefined) {
          setIsEditMode(user.ui_preferences.liveEditMode);
        }
      } catch (e) {
        // User not logged in or error
      }
    };
    loadEditMode();

    // Listen for preference changes
    const handlePreferencesChange = (event) => {
      if (event.detail.liveEditMode !== undefined) {
        setIsEditMode(event.detail.liveEditMode);
        if (!event.detail.liveEditMode) {
          // Clean up when exiting edit mode
          setShowComponentPalette(false);
          setShowTokenPicker(false);
          setSelectedElement(null);
        }
      }
    };

    window.addEventListener('ui-preferences-changed', handlePreferencesChange);
    return () => window.removeEventListener('ui-preferences-changed', handlePreferencesChange);
  }, []);

  const toggleEditMode = () => {
    const newValue = !isEditMode;
    setIsEditMode(newValue);
    
    if (!newValue) {
      // Clean up when exiting edit mode
      setShowComponentPalette(false);
      setShowTokenPicker(false);
      setSelectedElement(null);
    }
  };

  const value = {
    isEditMode,
    toggleEditMode,
    showComponentPalette,
    setShowComponentPalette,
    showTokenPicker,
    setShowTokenPicker,
    selectedElement,
    setSelectedElement,
    currentPageContent,
    setCurrentPageContent,
    currentPageData,
    setCurrentPageData,
    pageTextElements,
    setPageTextElements,
    customProperties,
    setCustomProperties,
  };

  return (
    <EditModeContext.Provider value={value}>
      {children}
    </EditModeContext.Provider>
  );
}

export function useEditMode() {
  const context = useContext(EditModeContext);
  if (!context) {
    throw new Error("useEditMode must be used within EditModeProvider");
  }
  return context;
}