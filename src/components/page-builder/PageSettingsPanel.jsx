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
  const [navigationMode, setNavigationMode] = useState("expanded");
  const [showBreadcrumb, setShowBreadcrumb] = useState(true);
  const [isParentPage, setIsParentPage] = useState(false);
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
          setNavigationMode(page.navigation_mode || "expanded");
          
          // Check if this page is a parent (has no parent_page_id or is top level)
          const isParent = !page.parent_page_id;
          setIsParentPage(isParent);
          
          // Set breadcrumb visibility - default based on parent/child status
          setShowBreadcrumb(page.show_breadcrumb ?? !isParent);
        }
      } catch (e) {
        console.error("Failed to load page settings:", e);
      }
    };
    loadPageSettings();

    window.addEventListener('ui-preferences-changed', handlePreferencesChange);
    return () => window.removeEventListener('ui-preferences-changed', handlePreferencesChange);
  }, [currentPageName]);

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
      toast.success("Page saved");
    },
  });

  const handleSave = () => {
    if (!currentPageData || !currentPageContent) {
      toast.error("No changes to save");
      return;
    }

    const newVersion = {
      version_number: (currentPageData.current_version_number || 0) + 1,
      saved_date: new Date().toISOString(),
      content_jsx: currentPageContent,
      change_summary: `Live edit ${new Date().toLocaleString()}`,
    };

    updateMutation.mutate({
      id: currentPageData.id,
      data: {
        ...currentPageData,
        current_content_jsx: currentPageContent,
        navigation_mode: navigationMode,
        show_breadcrumb: showBreadcrumb,
        versions: [...(currentPageData.versions || []), newVersion],
        current_version_number: newVersion.version_number,
      },
    });

    window.dispatchEvent(new CustomEvent('page-settings-saved', { detail: { navigationMode, showBreadcrumb } }));
  };

  if (!isVisible) return null;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="fixed bottom-6 right-24 h-14 w-14 rounded-full shadow-2xl bg-primary text-white hover:bg-primary/90 border-2 border-white"
          style={{ zIndex: 1050 }}
          title="Page Settings"
        >
          <Settings className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-96">
        <SheetHeader className="px-6">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
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
            </SheetTitle>
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
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Live Edit Mode</Label>
              <p className="text-xs text-muted-foreground">
                Click elements to style them with design tokens
              </p>
            </div>
            <Switch checked={isEditMode} onCheckedChange={toggleEditMode} />
          </div>

          {customProperties.length > 0 && (
            <Collapsible open={propertiesOpen} onOpenChange={setPropertiesOpen}>
              <div className="border rounded-lg">
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
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          )}

          {pageTextElements.length > 0 && (
            <Collapsible open={textOverridesOpen} onOpenChange={setTextOverridesOpen}>
              <div className="border rounded-lg">
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

          <div className="border rounded-lg p-4 space-y-4">
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

        {isEditMode && currentPageContent && (
          <SheetFooter>
            <Button onClick={handleSave} className="w-full">
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}