import React, { createContext, useContext, useState, useEffect } from "react";

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

  // Load edit mode state from localStorage
  useEffect(() => {
    const savedEditMode = localStorage.getItem("editMode") === "true";
    setIsEditMode(savedEditMode);
  }, []);

  const toggleEditMode = () => {
    const newValue = !isEditMode;
    setIsEditMode(newValue);
    localStorage.setItem("editMode", newValue.toString());
    
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