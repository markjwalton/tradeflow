import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetOverlay,
} from "@/components/ui/sheet";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Settings, Save, Code, Eye, ChevronDown, Pencil } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEditMode } from "./EditModeContext";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function PageSettingsPanel({ currentPageName }) {
  const { isEditMode, toggleEditMode, currentPageData, currentPageContent, setCurrentPageContent, pageTextElements, setPageTextElements, customProperties } = useEditMode();
  const [isOpen, setIsOpen] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [textOverrides, setTextOverrides] = useState({});
  const [propertiesOpen, setPropertiesOpen] = useState(false);
  const [textOverridesOpen, setTextOverridesOpen] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);
  const [pageTitle, setPageTitle] = useState("");
  const [pageDescription, setPageDescription] = useState("");
  const [pageDescriptionEditable, setPageDescriptionEditable] = useState("");
  const [navigationMode, setNavigationMode] = useState("expanded");
  const [showBreadcrumb, setShowBreadcrumb] = useState(true);
  const [isParentPage, setIsParentPage] = useState(false);
  const [originalNavigationMode, setOriginalNavigationMode] = useState("expanded");
  const [originalShowBreadcrumb, setOriginalShowBreadcrumb] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const handlePreferencesChange = (event) => {
      setIsVisible(event.detail.showPageEditor ?? true);
    };

    const loadPreferences = async () => {
      try {
        const user = await base44.auth.me();
        if (user?.ui_preferences?.showPageEditor !== undefined) {
          setIsVisible(user.ui_preferences.showPageEditor);
        }
      } catch (e) {
        // User not logged in or error - show by default
      }
    };

    loadPreferences();
    
    // Extract initial page title and description
    const titleEl = document.querySelector('h1');
    const descEl = document.querySelector('p.text-muted-foreground');
    if (titleEl) setPageTitle(titleEl.textContent || "");
    if (descEl) setPageDescription(descEl.textContent || "");

    // Load page settings including breadcrumb visibility
    const loadPageSettings = async () => {
      try {
        const pages = await base44.entities.UIPage.filter({ slug: currentPageName });
        if (pages.length > 0) {
          const page = pages[0];
          const navMode = page.navigation_mode || "expanded";
          setNavigationMode(navMode);
          setOriginalNavigationMode(navMode);
          
          // Check if this page is a parent (has no parent_page_id or is top level)
          const isParent = !page.parent_page_id;
          setIsParentPage(isParent);
          
          // Set breadcrumb visibility - default based on parent/child status
          const breadcrumbVisible = page.show_breadcrumb ?? !isParent;
          setShowBreadcrumb(breadcrumbVisible);
          setOriginalShowBreadcrumb(breadcrumbVisible);
          
          // Load page description
          setPageDescriptionEditable(page.page_description || "");
        }
      } catch (e) {
        console.error("Failed to load page settings:", e);
      }
    };
    loadPageSettings();

    window.addEventListener('ui-preferences-changed', handlePreferencesChange);
    return () => window.removeEventListener('ui-preferences-changed', handlePreferencesChange);
  }, [currentPageName]);

  useEffect(() => {
    setHasUnsavedChanges(
      navigationMode !== originalNavigationMode || 
      showBreadcrumb !== originalShowBreadcrumb ||
      pageDescriptionEditable !== (currentPageData?.page_description || "")
    );
  }, [navigationMode, showBreadcrumb, originalNavigationMode, originalShowBreadcrumb, pageDescriptionEditable, currentPageData]);

  const handleCancel = () => {
    setNavigationMode(originalNavigationMode);
    setShowBreadcrumb(originalShowBreadcrumb);
    setPageDescriptionEditable(currentPageData?.page_description || "");
    setHasUnsavedChanges(false);
    setIsOpen(false);
  };

  // Extract text elements when panel opens
  useEffect(() => {
    if (isOpen && !isEditMode) {
      const elements = [];
      const container = document.querySelector('[data-page-content]');
      if (container) {
        const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6, button, label');
        headings.forEach((el, idx) => {
          const text = el.textContent?.trim();
          if (text && text.length > 0 && text.length < 200) {
            elements.push({
              id: `element-${idx}`,
              tagName: el.tagName.toLowerCase(),
              text: text,
              element: el,
            });
          }
        });
      }
      setPageTextElements(elements);
    }
  }, [isOpen, isEditMode, setPageTextElements]);

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.UIPage.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["uiPages"] });
      toast.success("Page settings saved successfully");
      setOriginalNavigationMode(navigationMode);
      setOriginalShowBreadcrumb(showBreadcrumb);
      setHasUnsavedChanges(false);
      setIsOpen(false);
    },
    onError: (error) => {
      toast.error("Failed to save: " + error.message);
      console.error("Save error:", error);
    }
  });

  const handleSave = async () => {
    try {
      // Always fetch current page data
      const pages = await base44.entities.UIPage.filter({ slug: currentPageName });
      let pageData;
      
      if (pages.length > 0) {
        pageData = pages[0];
        
        // Update existing page
        const updateData = {
          navigation_mode: navigationMode,
          show_breadcrumb: showBreadcrumb,
          page_description: pageDescriptionEditable,
        };

        if (currentPageContent) {
          const newVersion = {
            version_number: (pageData.current_version_number || 0) + 1,
            saved_date: new Date().toISOString(),
            content_jsx: currentPageContent,
            change_summary: `Live edit ${new Date().toLocaleString()}`,
          };
          updateData.current_content_jsx = currentPageContent;
          updateData.versions = [...(pageData.versions || []), newVersion];
          updateData.current_version_number = newVersion.version_number;
        }

        await updateMutation.mutateAsync({
          id: pageData.id,
          data: updateData,
        });
      } else {
        // Create new page record with required field
        await base44.entities.UIPage.create({
          slug: currentPageName,
          page_name: currentPageName,
          category: "Custom",
          current_content_jsx: currentPageContent || "// Page content placeholder",
          navigation_mode: navigationMode,
          show_breadcrumb: showBreadcrumb,
          page_description: pageDescriptionEditable,
        });
        toast.success("Page settings saved successfully");
        setOriginalNavigationMode(navigationMode);
        setOriginalShowBreadcrumb(showBreadcrumb);
        setHasUnsavedChanges(false);
        setIsOpen(false);
      }
      
      window.dispatchEvent(new CustomEvent('page-settings-saved', { detail: { navigationMode, showBreadcrumb } }));
    } catch (e) {
      console.error("Save failed:", e);
      toast.error("Failed to save: " + e.message);
    }
  };

  if (!isVisible) return null;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="fixed bottom-6 right-24 h-14 w-14 rounded-full shadow-2xl border-2 border-white hover:scale-105 transition-transform"
          style={{ zIndex: 9998, backgroundColor: 'rgba(101, 94, 84, 0.9)' }}
          title="Page Settings"
        >
          <Settings className="h-6 w-6 text-white" />
        </Button>
      </SheetTrigger>
      <SheetOverlay className="!bg-transparent" style={{ backgroundColor: 'oklch(0.398 0.037 159.8 / 0.3)', background: 'oklch(0.398 0.037 159.8 / 0.3)' }} />
      <SheetContent className="w-96" style={{ backgroundColor: 'var(--background-100, rgba(255, 255, 255, 0.8))' }}>
        <SheetHeader className="px-6">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2" style={{ color: 'var(--accent-500, #C78E8E)' }}>
              {editingTitle && isEditMode ? (
                <Input
                  value={pageTitle}
                  onChange={(e) => {
                    setPageTitle(e.target.value);
                    const titleEl = document.querySelector('h1');
                    if (titleEl) titleEl.textContent = e.target.value;
                  }}
                  onBlur={() => setEditingTitle(false)}
                  autoFocus
                  className="h-8"
                />
              ) : (
                <>
                  Page Settings
                  {isEditMode && (
                    <Pencil
                      className="h-3 w-3 text-muted-foreground cursor-pointer hover:text-foreground"
                      onClick={() => setEditingTitle(true)}
                    />
                  )}
                </>
              )}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {editingDescription && isEditMode ? (
              <Input
                value={pageDescription}
                onChange={(e) => {
                  setPageDescription(e.target.value);
                  const descEl = document.querySelector('p.text-muted-foreground');
                  if (descEl) descEl.textContent = e.target.value;
                }}
                onBlur={() => setEditingDescription(false)}
                autoFocus
                className="h-7 text-sm"
              />
            ) : (
              <>
                <p className="text-sm text-muted-foreground">{currentPageName}</p>
                {isEditMode && (
                  <Pencil
                    className="h-3 w-3 text-muted-foreground cursor-pointer hover:text-foreground"
                    onClick={() => setEditingDescription(true)}
                  />
                )}
              </>
            )}
          </div>
        </SheetHeader>

        <div className="space-y-6 py-6 px-6">

          {customProperties.length > 0 && (
            <Collapsible open={propertiesOpen} onOpenChange={setPropertiesOpen}>
              <div className="border rounded-lg" style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)' }}>
                <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3 hover:bg-muted/50 transition-colors">
                  <div>
                    <Label className="text-sm font-medium cursor-pointer">Page Properties</Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Custom settings for this page
                    </p>
                  </div>
                  <ChevronDown className={`h-4 w-4 transition-transform ${propertiesOpen ? 'rotate-180' : ''}`} />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="px-4 pb-4 space-y-4 border-t pt-4">
                    {customProperties.map((prop) => (
                      <div key={prop.key} className="space-y-2">
                        {prop.type === "divider" ? (
                          <div className="border-t my-2" />
                        ) : prop.type === "button" ? (
                          <div className="space-y-2">
                            <Label className="text-sm">{prop.label}</Label>
                            {prop.description && (
                              <p className="text-xs text-muted-foreground">{prop.description}</p>
                            )}
                            <Button
                              onClick={prop.onClick}
                              disabled={prop.disabled}
                              variant={prop.variant || "default"}
                              className="w-full"
                              size="sm"
                            >
                              {prop.buttonLabel || prop.label}
                            </Button>
                          </div>
                        ) : (
                          <>
                            <Label className="text-sm">{prop.label}</Label>
                            {prop.description && (
                              <p className="text-xs text-muted-foreground">{prop.description}</p>
                            )}
                            {prop.type === "boolean" && (
                              <Switch
                                checked={prop.value}
                                onCheckedChange={(checked) => prop.onChange(checked)}
                              />
                            )}
                            {prop.type === "select" && (
                              <select
                                value={prop.value}
                                onChange={(e) => prop.onChange(e.target.value)}
                                className="w-full px-3 py-2 border rounded-md text-sm"
                              >
                                {prop.options.map((opt) => (
                                  <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </option>
                                ))}
                              </select>
                            )}
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          )}

          {pageTextElements.length > 0 && (
            <Collapsible open={textOverridesOpen} onOpenChange={setTextOverridesOpen}>
              <div className="border rounded-lg" style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)' }}>
                <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3 hover:bg-muted/50 transition-colors">
                  <div>
                    <Label className="text-sm font-medium cursor-pointer">Text Overrides</Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Edit text content on this page
                    </p>
                  </div>
                  <ChevronDown className={`h-4 w-4 transition-transform ${textOverridesOpen ? 'rotate-180' : ''}`} />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="px-4 pb-4 space-y-3 max-h-96 overflow-y-auto border-t pt-4">
                    {pageTextElements.map((element) => (
                      <div key={element.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs text-muted-foreground uppercase">
                            {element.tagName}
                          </Label>
                        </div>
                        <Input
                          value={textOverrides[element.id] ?? element.text}
                          onChange={(e) => {
                            const newValue = e.target.value;
                            setTextOverrides(prev => ({ ...prev, [element.id]: newValue }));
                            element.element.textContent = newValue;
                          }}
                          className="text-sm"
                          placeholder={element.text}
                        />
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          )}

          <div className="border rounded-lg p-4 space-y-4" style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)' }}>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Navigation Mode</Label>
              <p className="text-xs text-muted-foreground mb-3">Default sidebar state for this page</p>
              <Select value={navigationMode} onValueChange={setNavigationMode}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expanded">Open (Full Sidebar)</SelectItem>
                  <SelectItem value="icons">Icons Only</SelectItem>
                  <SelectItem value="hidden">Hidden</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between pt-2 border-t">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Show Breadcrumb</Label>
                <p className="text-xs text-muted-foreground">
                  {isParentPage ? "Hidden by default for parent pages" : "Shown by default for child pages"}
                </p>
              </div>
              <Switch checked={showBreadcrumb} onCheckedChange={setShowBreadcrumb} />
            </div>

            <div className="pt-2 border-t space-y-2">
              <Label className="text-sm font-medium">Page Description</Label>
              <p className="text-xs text-muted-foreground">
                Optional description shown below page title
              </p>
              <Textarea
                value={pageDescriptionEditable}
                onChange={(e) => setPageDescriptionEditable(e.target.value)}
                placeholder="Enter page description..."
                className="text-sm"
                rows={3}
              />
            </div>
          </div>

          {isEditMode && (
            <>
              <div className="border-t pt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <Label>View Code</Label>
                  <Switch checked={showCode} onCheckedChange={setShowCode} />
                </div>

                {showCode && currentPageContent && (
                  <div>
                    <Label className="mb-2 block">Page HTML</Label>
                    <Textarea
                      value={currentPageContent}
                      onChange={(e) => setCurrentPageContent(e.target.value)}
                      className="font-mono text-xs h-64"
                      placeholder="Page content will appear here..."
                    />
                  </div>
                )}

                {currentPageData && (
                  <div className="space-y-2">
                    <Label>Page Info</Label>
                    <div className="text-xs space-y-1 text-muted-foreground">
                      <p>Version: {currentPageData.current_version_number || 1}</p>
                      <p>Category: {currentPageData.category || "Custom"}</p>
                      <p>Versions: {currentPageData.versions?.length || 1}</p>
                    </div>
                  </div>
                )}
              </div>


            </>
          )}
        </div>

        <SheetFooter className="px-6 pb-6">
          <div className="flex gap-3 w-full">
            <Button onClick={handleCancel} variant="outline" className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              className="flex-1" 
              disabled={updateMutation.isPending}
            >
              <Save className="h-4 w-4 mr-2" />
              {updateMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}