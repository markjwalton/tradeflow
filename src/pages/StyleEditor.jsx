import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UnderlinedTabs, UnderlinedTabsContent } from '@/components/ui/underlined-tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AdvancedStyleEditor } from '@/components/design-system/AdvancedStyleEditor';
import { ComponentLogicEditor } from '@/components/design-system/ComponentLogicEditor';
import { LiveComponentPreview } from '@/components/design-system/LiveComponentPreview';
import { AppShellPreview } from '@/components/design-system/AppShellPreview';
import { Save, RefreshCw, X, GitBranch } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { COMPONENT_CATEGORIES } from '@/components/design-system/componentCategories';
import { PageHeader } from '@/components/sturij/PageHeader';

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
<Badge variant="destructive">Destructive</Badge>`,
    input: `<Input placeholder="Enter text..." />
<Input type="email" placeholder="Email address" />
<Input disabled placeholder="Disabled input" />`,
    select: `<Select>
  <SelectTrigger>
    <SelectValue placeholder="Select option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="1">Option 1</SelectItem>
    <SelectItem value="2">Option 2</SelectItem>
  </SelectContent>
</Select>`,
    dialog: `<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
    </DialogHeader>
    <p>Dialog content goes here.</p>
  </DialogContent>
</Dialog>`,
    alert: `<Alert>
  <AlertTitle>Alert Title</AlertTitle>
  <AlertDescription>Alert message goes here.</AlertDescription>
</Alert>`,
    table: `<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Status</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>John Doe</TableCell>
      <TableCell>Active</TableCell>
    </TableRow>
  </TableBody>
</Table>`,
    navigation: `<nav>
  <ul>
    <li><a href="#">Home</a></li>
    <li><a href="#">About</a></li>
    <li><a href="#">Contact</a></li>
  </ul>
</nav>`,
    tooltip: `<Tooltip>
  <TooltipTrigger>Hover me</TooltipTrigger>
  <TooltipContent>
    <p>Tooltip content</p>
  </TooltipContent>
</Tooltip>`,
    avatar: `<Avatar>
  <AvatarImage src="/avatar.jpg" />
  <AvatarFallback>JD</AvatarFallback>
</Avatar>`,
    skeleton: `<div className="space-y-2">
  <Skeleton className="h-4 w-full" />
  <Skeleton className="h-4 w-3/4" />
</div>`,
    separator: `<div>
  <p>Section 1</p>
  <Separator className="my-4" />
  <p>Section 2</p>
</div>`,
    workflowProgress: `<WorkflowProgress steps={[
  { id: '01', name: 'Job Details', description: 'Vitae sed mi luctus laoreet.', status: 'complete' },
  { id: '02', name: 'Application form', description: 'Cursus semper viverra.', status: 'current' },
  { id: '03', name: 'Preview', description: 'Penatibus eu quis ante.', status: 'upcoming' },
]} />`
  };

  const hasChanges = Object.keys(styleValues).length > 0;

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Advanced Style Editor"
        description="Edit design tokens with live preview and instance tracking"
      >
        <div className="flex items-center gap-2 bg-transparent">
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
      </PageHeader>

      <div>
        {/* Tabbed Interface */}
        <UnderlinedTabs 
          defaultValue="styles"
          tabs={[
            { value: 'styles', label: 'Style Editor' },
            { value: 'logic', label: 'Component Logic' },
            { value: 'preview', label: 'Live Preview' }
          ]}
        >
          <UnderlinedTabsContent value="styles">
            <AdvancedStyleEditor 
              onUpdate={handleStyleUpdate}
              onPreviewUpdate={handlePreviewUpdate}
              selectedElement={selectedElement}
            />
          </UnderlinedTabsContent>

          <UnderlinedTabsContent value="logic">
            <ComponentLogicEditor 
              onUpdate={(components) => {
                console.log('Components updated:', components);
              }}
            />
          </UnderlinedTabsContent>

          <UnderlinedTabsContent value="preview">
            <Card>
              <CardHeader>
                <CardTitle>Live Preview</CardTitle>
              </CardHeader>
              <CardContent>
                {['appShell', 'topNav', 'sidebar', 'breadcrumb', 'mobileDrawer'].includes(previewComponent) ? (
                  <AppShellPreview 
                    config={{
                      sidebarWidth: styleValues['--sidebar-width'] || '280px',
                      contentMaxWidth: styleValues['--content-max-width'] || '1440px',
                      topNavHeight: styleValues['--topnav-height'] || '64px',
                      topNavBg: styleValues['--topnav-bg'] || 'var(--color-card)',
                      sidebarBg: styleValues['--sidebar-bg'] || 'var(--color-card)',
                      sidebarItemHoverBg: styleValues['--sidebar-item-hover-bg'] || 'var(--primary-100)'
                    }}
                  />
                ) : (
                  <LiveComponentPreview 
                    jsxCode={componentExamples[previewComponent] || componentExamples.button}
                    showCode={false}
                    componentState={componentState}
                    shadowEffect={shadowEffect}
                    animation={animation}
                  />
                )}
              </CardContent>
            </Card>
          </UnderlinedTabsContent>
        </UnderlinedTabs>
      </div>
    </div>
  );
}