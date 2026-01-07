import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AdvancedStyleEditor } from '@/components/design-system/AdvancedStyleEditor';
import { LiveComponentPreview } from '@/components/design-system/LiveComponentPreview';
import { Save, RefreshCw, X, GitBranch } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function StyleEditor() {
  const [previewComponent, setPreviewComponent] = useState('button');
  const [showCode, setShowCode] = useState(false);
  const [styleValues, setStyleValues] = useState({});
  const [selectedElement, setSelectedElement] = useState('button');
  const [componentState, setComponentState] = useState('default');
  const [shadowEffect, setShadowEffect] = useState('none');
  const [animation, setAnimation] = useState('none');

  const handleSaveToGlobals = async (styleValues) => {
    try {
      const cssVariables = Object.entries(styleValues).reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {});

      const response = await base44.functions.invoke('updateGlobalCSS', { cssVariables });
      
      if (response.data?.success) {
        toast.success('Styles saved to globals.css');
        setStyleValues({});
      } else {
        throw new Error(response.data?.error || 'Save failed');
      }
    } catch (error) {
      console.error('Save error:', error);
      throw error;
    }
  };

  const handleReset = () => {
    Object.keys(styleValues).forEach(token => {
      document.documentElement.style.removeProperty(token);
    });
    setStyleValues({});
    window.dispatchEvent(new CustomEvent('css-variables-updated'));
    toast.success('Styles reset');
  };

  const handleCancel = () => {
    handleReset();
  };

  const handleStyleUpdate = (values) => {
    setStyleValues(values);
  };

  const handlePreviewUpdate = ({ element, state, shadow, animation }) => {
    if (element) {
      setSelectedElement(element);
      setPreviewComponent(element);
    }
    if (state !== undefined) setComponentState(state);
    if (shadow !== undefined) setShadowEffect(shadow);
    if (animation !== undefined) setAnimation(animation);
  };

  const componentExamples = {
    button: `<Button>Button text</Button>
<Button variant="outline">Outline</Button>
<Button variant="secondary">Secondary</Button>`,
    card: `<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Card content goes here with some text.</p>
  </CardContent>
</Card>`,
    typography: `<h1>Heading 1</h1>
<h2>Heading 2</h2>
<p>This is a paragraph with some body text.</p>
<p className="text-muted-foreground">Muted text example.</p>`,
    badge: `<Badge>Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="destructive">Destructive</Badge>`
  };

  const hasChanges = Object.keys(styleValues).length > 0;

  return (
    <div className="min-h-screen">
      {/* Header with actions */}
      <div className="border-b bg-card sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Advanced Style Editor</h1>
              <p className="text-sm text-muted-foreground">Edit design tokens with live preview and instance tracking</p>
            </div>
            <div className="flex items-center gap-2">
              {hasChanges && (
                <Badge variant="warning">
                  {Object.keys(styleValues).length} unsaved changes
                </Badge>
              )}
              <Button variant="ghost" onClick={handleCancel} disabled={!hasChanges}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button variant="outline" onClick={handleReset} disabled={!hasChanges}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button onClick={() => handleSaveToGlobals(styleValues)} disabled={!hasChanges}>
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Element Card */}
        <Card>
          <CardHeader>
            <CardTitle>Element Selection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap">
              {Object.keys(componentExamples).map(comp => (
                <Button
                  key={comp}
                  variant={selectedElement === comp ? 'default' : 'outline'}
                  onClick={() => {
                    setSelectedElement(comp);
                    setPreviewComponent(comp);
                  }}
                >
                  {comp.charAt(0).toUpperCase() + comp.slice(1)}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Live Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Live Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <LiveComponentPreview 
              jsxCode={componentExamples[previewComponent] || componentExamples.button}
              showCode={false}
              componentState={componentState}
              shadowEffect={shadowEffect}
              animation={animation}
            />
          </CardContent>
        </Card>

        {/* Current Preview Component */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">
              Currently editing: <span className="font-medium text-foreground">{selectedElement}</span>
            </div>
          </CardContent>
        </Card>

        {/* Style Editor */}
        <AdvancedStyleEditor 
          onUpdate={handleStyleUpdate}
          onPreviewUpdate={handlePreviewUpdate}
          selectedElement={selectedElement}
        />

        {/* Version Control */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <GitBranch className="h-5 w-5" />
              <CardTitle>Version Control</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Current Version</span>
                <Badge>1.0.0</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Last Modified</span>
                <span className="text-foreground">Just now</span>
              </div>
              <div className="pt-3 border-t">
                <Button variant="outline" size="sm" className="w-full">
                  <GitBranch className="h-4 w-4 mr-2" />
                  View Change History
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}