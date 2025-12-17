import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from "@/components/ui/sheet";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Paintbrush, Sparkles, Copy, ChevronDown, Loader2, Save, List, Target } from "lucide-react";
import { StylesList } from "./StylesList";
import { DesignTokensBrowser } from "./DesignTokensBrowser";
import { useEditMode } from "@/components/page-builder/EditModeContext";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import StyleInspectorOverlay from "./StyleInspectorOverlay";
import { useTokenApplier } from "./TokenApplierContext";

export function PageUIPanel({ currentPageName }) {
  const { isEditMode } = useEditMode();
  const tokenApplier = useTokenApplier();
  const selectedElement = tokenApplier?.selectedElement;
  const [isOpen, setIsOpen] = useState(false);
  const [userRequest, setUserRequest] = useState("");
  const [aiResponse, setAiResponse] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [elementDetailsOpen, setElementDetailsOpen] = useState(true);
  const [styleAnalysisOpen, setStyleAnalysisOpen] = useState(true);
  const [isVisible, setIsVisible] = useState(true);
  const [mode, setMode] = useState('styles'); // 'styles', 'tokens', or 'element'

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const user = await base44.auth.me();
        if (user?.ui_preferences?.showPageUIPanel !== undefined) {
          setIsVisible(user.ui_preferences.showPageUIPanel);
        } else {
          setIsVisible(true); // Default to visible
        }
      } catch (e) {
        // User not logged in - show by default
        setIsVisible(true);
      }
    };
    loadPreferences();
  }, []);

  // Open panel when element is selected
  useEffect(() => {
    if (selectedElement) {
      setIsOpen(true);
      setMode('element');
    }
  }, [selectedElement]);

  const handleReset = () => {
    if (tokenApplier?.selectElement) {
      tokenApplier.selectElement(null);
    }
    if (tokenApplier?.setHighlightedElements) {
      tokenApplier.setHighlightedElements([]);
    }
    if (tokenApplier?.deactivateTokenApplier) {
      tokenApplier.deactivateTokenApplier();
    }
    setUserRequest('');
    setAiResponse(null);
    setMode('styles');
  };

  const handleClose = () => {
    setIsOpen(false);
    handleReset();
    if (tokenApplier?.deactivateTokenApplier) {
      tokenApplier.deactivateTokenApplier();
    }
  };

  const analyzeStyleSource = () => {
    if (!selectedElement) return [];
    
    const sources = [];
    const className = typeof selectedElement.className === 'string' ? selectedElement.className : '';
    const classes = className ? className.split(' ').filter(c => c) : [];
    
    if (selectedElement.element?.getAttribute('style')) {
      sources.push({ type: "inline", description: "Inline styles directly on element" });
    }
    
    const themeClasses = classes.filter(cls => 
      cls.startsWith('text-') || cls.startsWith('bg-') || cls.startsWith('border-') || 
      cls.includes('primary') || cls.includes('secondary') || cls.includes('accent')
    );
    if (themeClasses.length > 0) {
      sources.push({ type: "theme", description: `Theme tokens: ${themeClasses.join(', ')}` });
    }
    
    const customClasses = classes.filter(cls => 
      !themeClasses.includes(cls) && !cls.startsWith('flex') && !cls.startsWith('grid')
    );
    if (customClasses.length > 0) {
      sources.push({ type: "custom", description: `Custom classes: ${customClasses.join(', ')}` });
    }
    
    return sources;
  };

  const handleAIAssist = async () => {
    if (!userRequest.trim() || !selectedElement) {
      toast.error("Please enter a change request");
      return;
    }

    setIsGenerating(true);
    
    try {
      // Get current page content
      const pageContainer = document.querySelector('[data-page-content]');
      const pageHTML = pageContainer ? pageContainer.innerHTML.substring(0, 5000) : "";
      
      // Get rulebook and showcase data (simplified for now)
      const prompt = `You are a design assistant helping to generate precise code modification prompts.

DESIGN SYSTEM CONTEXT:
- We use Tailwind CSS with custom CSS variables defined in globals.css
- Font families: degular-display (headings), mrs-eaves-xl-serif-narrow (body)
- Colors use CSS variables like var(--color-primary), var(--color-secondary)
- Spacing uses var(--spacing-X) tokens
- Always prefer design system tokens over arbitrary values

SELECTED ELEMENT:
Tag: ${selectedElement?.tagName || 'unknown'}
Classes: ${selectedElement?.className || 'none'}
ID: ${selectedElement?.id || 'none'}
Inline Styles: ${selectedElement?.element?.getAttribute('style') || "none"}

COMPUTED STYLES:
${selectedElement?.computedStyles ? Object.entries(selectedElement.computedStyles).map(([k, v]) => `${k}: ${v || ''}`).join('\n') : 'none'}

USER'S REQUEST:
"${userRequest}"

CURRENT PAGE SNIPPET:
${pageHTML.substring(0, 1000)}...

Please analyze this request and provide:
1. Your understanding of what the user wants to change
2. Assessment of current styling conflicts or issues
3. The precise code changes needed (specific file paths, line numbers if possible, exact classNames or styles)
4. A complete, copy-paste ready prompt for the coding agent that includes:
   - The file path to modify
   - The exact find/replace operation or the specific changes needed
   - Why these changes solve the user's request

Format as JSON:
{
  "understanding": "...",
  "assessment": "...",
  "changes_needed": "...",
  "generated_prompt": "..."
}`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            understanding: { type: "string" },
            assessment: { type: "string" },
            changes_needed: { type: "string" },
            generated_prompt: { type: "string" }
          }
        }
      });

      setAiResponse(response);
      
      // Save interaction to knowledge base
      await base44.entities.DesignInteraction.create({
        page_slug: currentPageName,
        user_request: userRequest,
        selected_element: {
          tagName: selectedElement.tagName,
          className: selectedElement.className,
          id: selectedElement.id
        },
        ai_assessment: response.assessment,
        generated_prompt: response.generated_prompt,
        was_applied: false,
      });
      
      toast.success("AI analysis complete");
    } catch (error) {
      console.error("AI assist error:", error);
      toast.error("Failed to generate prompt: " + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyPrompt = () => {
    if (aiResponse?.generated_prompt) {
      navigator.clipboard.writeText(aiResponse.generated_prompt);
      toast.success("Prompt copied to clipboard");
    }
  };

  const handleSaveAsPattern = async () => {
    if (!aiResponse || !selectedElement || !userRequest) return;
    
    try {
      await base44.entities.DesignPattern.create({
        pattern_name: (userRequest || "Unnamed pattern").substring(0, 50),
        category: "other",
        description: aiResponse.understanding || "",
        element_type: selectedElement.tagName || "unknown",
        before_styles: { 
          classes: typeof selectedElement.className === 'string' ? selectedElement.className.split(' ').filter(c => c) : [], 
          inline: selectedElement.element?.getAttribute('style') || null 
        },
        after_styles: { changes: aiResponse.changes_needed || "" },
        change_notes: aiResponse.assessment || "",
        is_validated: false,
      });
      
      toast.success("Saved as pattern for future reference");
    } catch (error) {
      toast.error("Failed to save pattern");
    }
  };

  if (!isVisible) return null;

  const handleOpenPanel = () => {
    setIsOpen(true);
    setMode('styles'); // Start in styles mode
  };

  const handleStyleSelect = (style) => {
    // Highlight all elements with this style
    if (style.elements && style.elements.length > 0) {
      if (tokenApplier?.setHighlightedElements) {
        tokenApplier.setHighlightedElements(style.elements);
      }
      // Select the first element for inspection
      if (tokenApplier?.selectElement) {
        tokenApplier.selectElement(style.elements[0]);
      }
      setMode('element');
    }
  };

  const handleSwitchToElementMode = () => {
    setMode('element');
    if (tokenApplier?.activateTokenApplier) {
      tokenApplier.activateTokenApplier();
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleOpenPanel}
        className="fixed bottom-6 right-40 h-14 w-14 rounded-full shadow-2xl bg-secondary text-white hover:bg-secondary/90 border-2 border-white"
        style={{ zIndex: 9998 }}
        title="Page UI Assistant - Click to select elements"
      >
        <Paintbrush className="h-6 w-6" />
      </Button>

      <Sheet open={isOpen} onOpenChange={(open) => { if (!open) handleClose(); else setIsOpen(open); }}>
        
        <SheetContent className="w-[500px] overflow-y-auto">
          <SheetHeader className="px-6">
            <div className="flex items-center justify-between">
              <SheetTitle className="flex items-center gap-2">
                <Paintbrush className="h-5 w-5" />
                Page UI Assistant
              </SheetTitle>
              {selectedElement && (
                <Button variant="ghost" size="sm" onClick={handleReset}>
                  Clear Selection
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-3 gap-2 mt-4">
              <Button 
                variant={mode === 'tokens' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setMode('tokens')}
              >
                <Paintbrush className="h-4 w-4 mr-1" />
                Tokens
              </Button>
              <Button 
                variant={mode === 'styles' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setMode('styles')}
              >
                <List className="h-4 w-4 mr-1" />
                Classes
              </Button>
              <Button 
                variant={mode === 'element' ? 'default' : 'outline'} 
                size="sm"
                onClick={handleSwitchToElementMode}
              >
                <Target className="h-4 w-4 mr-1" />
                Element
              </Button>
            </div>
            
            {selectedElement && (
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="text-xs">
                  {selectedElement.tagName}
                </Badge>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 text-xs"
                  onClick={handleReset}
                >
                  Clear & Select New
                </Button>
              </div>
            )}
          </SheetHeader>

          <div className="space-y-6 py-6 px-6">
            {mode === 'tokens' && (
              <div>
                <Label className="text-sm font-medium mb-4 block">Design Tokens</Label>
                {!selectedElement ? (
                  <div className="text-sm text-muted-foreground p-3 border rounded-lg text-center">
                    Click "Element" mode and select something on the page
                  </div>
                ) : (
                  <DesignTokensBrowser onApplyToken={(data) => {
                    const { type, token, target } = data;

                    let targetEl = selectedElement.element;

                    // If specific heading target, find/create it
                    if (target !== 'element' && ['h1', 'h2', 'h3'].includes(target)) {
                      const heading = selectedElement.element.querySelector(target);
                      if (heading) {
                        targetEl = heading;
                      }
                    }

                    if (!targetEl) {
                      toast.error("Target element not found");
                      return;
                    }

                    // Apply based on type
                    if (type === 'background') {
                      targetEl.style.backgroundColor = token.cssVar || token.value;
                    } else if (type === 'text-color') {
                      targetEl.style.color = token.cssVar || token.value;
                    } else if (type === 'font') {
                      targetEl.style.fontFamily = token.cssVar || token.value;
                    }

                    toast.success(`Applied to ${target === 'element' ? 'element' : target.toUpperCase()}`);
                  }} />
                )}
              </div>
            )}

            {mode === 'styles' && !selectedElement && (
              <div>
                <Label className="text-sm font-medium mb-4 block">CSS Classes</Label>
                <StylesList onStyleSelect={handleStyleSelect} />
              </div>
            )}

            {selectedElement && (
              <>
                <Collapsible open={elementDetailsOpen} onOpenChange={setElementDetailsOpen}>
                  <div className="border rounded-lg">
                    <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3 hover:bg-muted/50 transition-colors">
                      <Label className="text-sm font-medium cursor-pointer">Element Details</Label>
                      <ChevronDown className={`h-4 w-4 transition-transform ${elementDetailsOpen ? 'rotate-180' : ''}`} />
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="px-4 pb-4 space-y-2 border-t pt-4 text-xs font-mono">
                        <p><strong>Tag:</strong> {selectedElement?.tagName || 'unknown'}</p>
                        {selectedElement?.id && <p><strong>ID:</strong> {selectedElement.id}</p>}
                        <p><strong>Classes:</strong> {selectedElement?.className || 'none'}</p>
                        {selectedElement?.element?.getAttribute('style') && (
                          <p><strong>Inline:</strong> {selectedElement.element.getAttribute('style')}</p>
                        )}
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>

                <Collapsible open={styleAnalysisOpen} onOpenChange={setStyleAnalysisOpen}>
                  <div className="border rounded-lg">
                    <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3 hover:bg-muted/50 transition-colors">
                      <Label className="text-sm font-medium cursor-pointer">Style Analysis</Label>
                      <ChevronDown className={`h-4 w-4 transition-transform ${styleAnalysisOpen ? 'rotate-180' : ''}`} />
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="px-4 pb-4 space-y-3 border-t pt-4">
                        {analyzeStyleSource().map((source, idx) => (
                          <div key={idx} className="p-2 bg-muted rounded text-xs">
                            <strong className="text-primary">{source.type.toUpperCase()}</strong>
                            <p className="text-muted-foreground mt-1">{source.description}</p>
                          </div>
                        ))}
                        
                        <div className="pt-2 border-t">
                          <p className="text-xs font-medium mb-2">Computed Styles:</p>
                          <div className="space-y-1 text-xs font-mono">
                            {selectedElement?.computedStyles && Object.entries(selectedElement.computedStyles).map(([key, value]) => (
                              <p key={key}><span className="text-muted-foreground">{key}:</span> {value}</p>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>

                <div className="border rounded-lg p-4 space-y-4">
                  <Label className="text-sm font-medium">AI Design Assist</Label>
                  <Textarea
                    value={userRequest}
                    onChange={(e) => setUserRequest(e.target.value)}
                    placeholder="Describe the change you want... (e.g., 'reduce top padding', 'change font to display', 'make this card match the Dashboard style')"
                    rows={3}
                    className="text-sm"
                  />
                  <Button 
                    onClick={handleAIAssist} 
                    disabled={isGenerating || !userRequest.trim()}
                    className="w-full"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Generate Prompt
                      </>
                    )}
                  </Button>
                </div>

                {aiResponse && (
                  <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
                    <div>
                      <Label className="text-sm font-medium">AI Understanding</Label>
                      <p className="text-sm text-muted-foreground mt-2">{aiResponse.understanding}</p>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium">Assessment</Label>
                      <p className="text-sm text-muted-foreground mt-2">{aiResponse.assessment}</p>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium">Changes Needed</Label>
                      <p className="text-sm text-muted-foreground mt-2">{aiResponse.changes_needed}</p>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium">Generated Prompt</Label>
                      <Textarea
                        value={aiResponse.generated_prompt}
                        readOnly
                        rows={6}
                        className="font-mono text-xs mt-2"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={handleCopyPrompt} variant="outline" className="flex-1">
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                      <Button onClick={handleSaveAsPattern} variant="outline" className="flex-1">
                        <Save className="h-4 w-4 mr-2" />
                        Save Pattern
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}