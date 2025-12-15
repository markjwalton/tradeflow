import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from "@/components/ui/sheet";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Paintbrush, Sparkles, Copy, ChevronDown, Loader2, Save, List } from "lucide-react";
import { useEditMode } from "@/components/page-builder/EditModeContext";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import StyleInspectorOverlay from "./StyleInspectorOverlay";

export function PageUIPanel({ currentPageName }) {
  const { isEditMode } = useEditMode();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedElement, setSelectedElement] = useState(null);
  const [selectedDomElement, setSelectedDomElement] = useState(null);
  const [userRequest, setUserRequest] = useState("");
  const [aiResponse, setAiResponse] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [elementDetailsOpen, setElementDetailsOpen] = useState(true);
  const [styleAnalysisOpen, setStyleAnalysisOpen] = useState(true);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const user = await base44.auth.me();
        if (user?.ui_preferences?.showPageUIPanel !== undefined) {
          setIsVisible(user.ui_preferences.showPageUIPanel);
        }
      } catch (e) {
        // User not logged in - show by default
      }
    };
    loadPreferences();
  }, []);

  const handleElementSelect = (elementData, domElement) => {
    setSelectedElement(elementData);
    setSelectedDomElement(domElement);
    setIsOpen(true);
    toast.success(`Selected: ${elementData.tagName}`);
  };

  const analyzeStyleSource = () => {
    if (!selectedElement || !selectedElement.classes) return [];
    
    const sources = [];
    
    if (selectedElement.inlineStyles) {
      sources.push({ type: "inline", description: "Inline styles directly on element" });
    }
    
    const themeClasses = (selectedElement.classes || []).filter(cls => 
      cls && (cls.startsWith('text-') || cls.startsWith('bg-') || cls.startsWith('border-') || 
      cls.includes('primary') || cls.includes('secondary') || cls.includes('accent'))
    );
    if (themeClasses.length > 0) {
      sources.push({ type: "theme", description: `Theme tokens: ${themeClasses.join(', ')}` });
    }
    
    const customClasses = (selectedElement.classes || []).filter(cls => 
      cls && !themeClasses.includes(cls) && !cls.startsWith('flex') && !cls.startsWith('grid')
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
Classes: ${(selectedElement?.classes || []).join(', ') || 'none'}
Inline Styles: ${selectedElement?.inlineStyles || "none"}
Parent: ${selectedElement?.parentElement?.tagName || 'none'} with classes: ${(selectedElement?.parentElement?.classes || []).join(', ') || 'none'}

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
        selected_element: selectedElement,
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
        before_styles: { classes: selectedElement.classes || [], inline: selectedElement.inlineStyles || null },
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

  return (
    <>
      <StyleInspectorOverlay onElementSelect={handleElementSelect} />
      
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="fixed bottom-6 right-40 h-14 w-14 rounded-full shadow-2xl bg-secondary text-white hover:bg-secondary/90 border-2 border-white"
            style={{ zIndex: 9998 }}
            title="Page UI Assistant"
          >
            <Paintbrush className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        
        <SheetContent className="w-[500px] overflow-y-auto">
          <SheetHeader className="px-6">
            <SheetTitle className="flex items-center gap-2">
              <Paintbrush className="h-5 w-5" />
              Page UI Assistant
            </SheetTitle>
            <p className="text-sm text-muted-foreground">
              {selectedElement?.tagName ? `Selected: ${selectedElement.tagName}` : "Hover and click to select an element"}
            </p>
          </SheetHeader>

          <div className="space-y-6 py-6 px-6">
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
                        <p><strong>Classes:</strong> {(selectedElement?.classes || []).join(', ') || 'none'}</p>
                        {selectedElement?.inlineStyles && (
                          <p><strong>Inline:</strong> {selectedElement.inlineStyles}</p>
                        )}
                        {selectedElement?.parentElement && (
                          <p><strong>Parent:</strong> {selectedElement.parentElement.tagName}</p>
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