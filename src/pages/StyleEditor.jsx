import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AdvancedStyleEditor } from '@/components/design-system/AdvancedStyleEditor';
import { LiveComponentPreview } from '@/components/design-system/LiveComponentPreview';
import { Save, RefreshCw, X, GitBranch } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { COMPONENT_CATEGORIES } from '@/components/design-system/componentCategories';

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

  const handlePreviewUpdate = ({ element, state, shadow, animation, iconStrokeWidth, iconColor }) => {
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
            <CardTitle size="small">Select Component</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
              {COMPONENT_CATEGORIES.map(comp => (
                <Button
                  key={comp.value}
                  variant={selectedElement === comp.value ? 'default' : 'outline'}
                  onClick={() => {
                    setSelectedElement(comp.value);
                    setPreviewComponent(comp.value);
                  }}
                  size="sm"
                  className="justify-start"
                >
                  {comp.label}
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

        {/* Style Editor */}
        <AdvancedStyleEditor 
          onUpdate={handleStyleUpdate}
          onPreviewUpdate={handlePreviewUpdate}
          selectedElement={selectedElement}
        />


      </div>
    </div>
  );
}