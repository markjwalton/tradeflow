import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdvancedStyleEditor } from '@/components/design-system/AdvancedStyleEditor';
import { LiveComponentPreview } from '@/components/design-system/LiveComponentPreview';
import { PageHeader } from '@/components/sturij';
import { Palette, Eye, Code } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function StyleEditor() {
  const [previewComponent, setPreviewComponent] = useState('button');
  const [showCode, setShowCode] = useState(false);

  const handleSaveToGlobals = async (styleValues) => {
    try {
      const cssVariables = Object.entries(styleValues).reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {});

      const response = await base44.functions.invoke('updateGlobalCSS', { cssVariables });
      
      if (response.data?.success) {
        toast.success('Styles saved to globals.css');
      } else {
        throw new Error(response.data?.error || 'Save failed');
      }
    } catch (error) {
      console.error('Save error:', error);
      throw error;
    }
  };

  const handlePreviewUpdate = ({ element, property, value }) => {
    setPreviewComponent(element);
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

  return (
    <div className="min-h-screen p-6 max-w-7xl mx-auto">
      <PageHeader 
        title="Advanced Style Editor"
        description="Edit design tokens with live preview and instance tracking"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Editor Panel */}
        <div className="space-y-4">
          <AdvancedStyleEditor 
            onUpdate={handleSaveToGlobals}
            onPreviewUpdate={handlePreviewUpdate}
          />
        </div>

        {/* Preview Panel */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Live Preview
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCode(!showCode)}
                >
                  <Code className="h-4 w-4 mr-2" />
                  {showCode ? 'Hide' : 'Show'} Code
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <LiveComponentPreview 
                jsxCode={componentExamples[previewComponent] || componentExamples.button}
                showCode={showCode}
              />
            </CardContent>
          </Card>

          {/* Quick Component Switcher */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Preview Component</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 flex-wrap">
                {Object.keys(componentExamples).map(comp => (
                  <Button
                    key={comp}
                    variant={previewComponent === comp ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPreviewComponent(comp)}
                  >
                    {comp.charAt(0).toUpperCase() + comp.slice(1)}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}