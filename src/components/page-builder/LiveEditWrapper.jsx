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
    if (isEditMode && children) {
      // Extract HTML from children
      const container = document.createElement('div');
      container.innerHTML = children?.props?.dangerouslySetInnerHTML?.__html || '';
      setCurrentPageContent(container.innerHTML);
    }
  }, [isEditMode, children, setCurrentPageContent]);

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

  if (!isEditMode) {
    return children;
  }

  return (
    <>
      <div className="fixed top-20 right-6 z-40 flex gap-2">
        <ComponentPalette onInsertComponent={handleInsertComponent} />
        <Button
          variant="outline"
          size="sm"
          className="gap-2 bg-white shadow-md"
          onClick={() => setShowTokenPicker(true)}
        >
          <Palette className="h-4 w-4" />
          Tokens
        </Button>
      </div>

      <InteractiveSelector isActive={isEditMode} onElementSelect={handleElementSelect}>
        <div data-live-edit-content dangerouslySetInnerHTML={{ __html: currentPageContent }} />
      </InteractiveSelector>

      <Dialog open={showTokenPicker} onOpenChange={setShowTokenPicker}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Apply Design Token</DialogTitle>
            {selectedElement && (
              <div className="text-sm text-muted-foreground space-y-1">
                <p>Element: <code className="text-xs bg-muted px-1 py-0.5 rounded">{selectedElement.tagName}</code></p>
                <p className="text-xs truncate">Path: {selectedElement.path}</p>
              </div>
            )}
          </DialogHeader>

          <Tabs defaultValue={selectedElement?.isTextElement ? "content" : "colors"}>
            <TabsList className="grid grid-cols-5 w-full">
              {selectedElement?.isTextElement && <TabsTrigger value="content">Content</TabsTrigger>}
              <TabsTrigger value="colors">Colors</TabsTrigger>
              <TabsTrigger value="spacing">Spacing</TabsTrigger>
              <TabsTrigger value="radius">Radius</TabsTrigger>
              <TabsTrigger value="shadows">Shadows</TabsTrigger>
            </TabsList>

            {selectedElement?.isTextElement && (
              <TabsContent value="content" className="space-y-4">
                <div>
                  <Label className="mb-2 block">Edit Text Content</Label>
                  <Textarea
                    value={selectedElement.textContent || ''}
                    onChange={(e) => updateElementText(e.target.value)}
                    placeholder="Enter text..."
                    rows={4}
                    className="font-body"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Edit the text that appears in this {selectedElement.tagName} element
                  </p>
                </div>
              </TabsContent>
            )}

            <TabsContent value="colors" className="space-y-4">
              <div>
                <Label className="mb-2 block">Text Color</Label>
                <div className="grid grid-cols-2 gap-2">
                  {TOKEN_LIBRARY.colors.map((token) => (
                    <Button
                      key={token.value}
                      variant="outline"
                      onClick={() => applyTokenToElement(token.value, 'color-text')}
                    >
                      <div className={`w-4 h-4 rounded ${token.bg} mr-2`} />
                      {token.name}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <Label className="mb-2 block">Background</Label>
                <div className="grid grid-cols-2 gap-2">
                  {TOKEN_LIBRARY.colors.map((token) => (
                    <Button
                      key={token.bg}
                      variant="outline"
                      onClick={() => applyTokenToElement(token.bg, 'color-bg')}
                    >
                      <div className={`w-4 h-4 rounded ${token.bg} mr-2`} />
                      {token.name}
                    </Button>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="spacing" className="space-y-4">
              <div>
                <Label className="mb-2 block">Padding</Label>
                <div className="grid grid-cols-2 gap-2">
                  {TOKEN_LIBRARY.spacing.map((token) => (
                    <Button
                      key={token.value}
                      variant="outline"
                      onClick={() => applyTokenToElement(token.value, 'spacing-p')}
                    >
                      {token.name}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <Label className="mb-2 block">Margin</Label>
                <div className="grid grid-cols-2 gap-2">
                  {TOKEN_LIBRARY.spacing.map((token) => (
                    <Button
                      key={token.m}
                      variant="outline"
                      onClick={() => applyTokenToElement(token.m, 'spacing-m')}
                    >
                      {token.name}
                    </Button>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="radius">
              <div className="grid grid-cols-2 gap-2">
                {TOKEN_LIBRARY.radius.map((token) => (
                  <Button
                    key={token.value}
                    variant="outline"
                    onClick={() => applyTokenToElement(token.value, 'radius')}
                  >
                    {token.name}
                  </Button>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="shadows">
              <div className="grid grid-cols-2 gap-2">
                {TOKEN_LIBRARY.shadows.map((token) => (
                  <Button
                    key={token.value}
                    variant="outline"
                    onClick={() => applyTokenToElement(token.value, 'shadow')}
                  >
                    {token.name}
                  </Button>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
}