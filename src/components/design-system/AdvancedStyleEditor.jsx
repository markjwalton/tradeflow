import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronLeft, ChevronRight, Save } from 'lucide-react';
import { StyleCategory, StyleProperty } from './StyleCategory';
import { toast } from 'sonner';

const COMPONENT_TYPES = [
  { value: 'button', label: 'Button', applicableStyles: ['border', 'padding', 'font', 'text', 'background'] },
  { value: 'card', label: 'Card', applicableStyles: ['border', 'padding', 'background', 'position'] },
  { value: 'typography', label: 'Typography', applicableStyles: ['font', 'text'] },
  { value: 'badge', label: 'Badge', applicableStyles: ['padding', 'font', 'text', 'background', 'border'] },
];

export function AdvancedStyleEditor({ onUpdate, onPreviewUpdate, selectedElement: propSelectedElement }) {
  const [currentStyle, setCurrentStyle] = useState('--color-primary');
  const [instances, setInstances] = useState(5);
  const [saveAsNew, setSaveAsNew] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState(['border']);
  const [styleValues, setStyleValues] = useState({});

  const selectedElement = propSelectedElement || 'button';
  const selectedComponent = COMPONENT_TYPES.find(c => c.value === selectedElement);

  const isStyleApplicable = (styleCategory) => {
    return selectedComponent?.applicableStyles.includes(styleCategory);
  };

  const isStyleLive = (styleName) => {
    // Check if the style exists in the stylesheet
    const sheets = Array.from(document.styleSheets);
    for (const sheet of sheets) {
      try {
        const rules = Array.from(sheet.cssRules || []);
        for (const rule of rules) {
          if (rule.selectorText === ':root') {
            const val = rule.style.getPropertyValue(styleName);
            if (val) return true;
          }
        }
      } catch (e) {
        // Cross-origin
      }
    }
    return false;
  };

  const toggleCategory = (category) => {
    setExpandedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleStyleChange = (property, value) => {
    const newValues = { ...styleValues, [property]: value };
    setStyleValues(newValues);
    // Live preview update
    document.documentElement.style.setProperty(property, value);
    window.dispatchEvent(new CustomEvent('css-variables-updated'));
    if (onUpdate) {
      onUpdate(newValues);
    }
    if (onPreviewUpdate) {
      onPreviewUpdate({ element: selectedElement, property, value });
    }
  };

  const handleCreateNew = () => {
    toast.info('Creating new style variant...');
    // TODO: Implement save as new variant logic
  };

  const handleUpdateGlobal = async () => {
    if (onUpdate) {
      await onUpdate(styleValues);
    }
    toast.success('Styles saved globally');
  };

  return (
    <div className="space-y-4">
      {/* Top Controls */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="text-xs font-medium mb-1 block">Style Variable</label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-md text-sm font-mono bg-muted"
                value={currentStyle}
                onChange={(e) => setCurrentStyle(e.target.value)}
              />
            </div>
          </div>

          {/* Instances and Actions */}
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
            <div className="flex items-center gap-4">
              <Badge variant={instances > 3 ? 'destructive' : 'default'}>
                {instances} Instances
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={handleCreateNew}>
                Create New Style
              </Button>
              <Button size="sm" onClick={handleUpdateGlobal}>
                Update Global
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Style Categories */}
      <Card>
        <StyleCategory
          title="Border Styles"
          currentValue={styleValues['--border-width'] || '1px'}
          isLive={isStyleLive('--color-border')}
          isApplicable={isStyleApplicable('border')}
          isExpanded={expandedCategories.includes('border')}
          onToggle={() => toggleCategory('border')}
        >
          <StyleProperty
            label="Border Width"
            value={styleValues['--border-width'] || '1px'}
            onChange={(val) => handleStyleChange('--border-width', val)}
            type="slider"
            min={0}
            max={10}
            step={1}
          />
          <StyleProperty
            label="Border Color"
            value={styleValues['--color-border'] || '#d6d1c7'}
            onChange={(val) => handleStyleChange('--color-border', val)}
            type="color"
          />
          <StyleProperty
            label="Border Style"
            value={styleValues['--border-style'] || 'solid'}
            onChange={(val) => handleStyleChange('--border-style', val)}
            type="select"
            options={[
              { value: 'solid', label: 'Solid' },
              { value: 'dashed', label: 'Dashed' },
              { value: 'dotted', label: 'Dotted' },
              { value: 'none', label: 'None' }
            ]}
          />
        </StyleCategory>

        <StyleCategory
          title="Paddings / Margins"
          currentValue={styleValues['--spacing-4'] || '1rem'}
          isLive={isStyleLive('--spacing-4')}
          isApplicable={isStyleApplicable('padding')}
          isExpanded={expandedCategories.includes('padding')}
          onToggle={() => toggleCategory('padding')}
        >
          <StyleProperty
            label="Padding"
            value={styleValues['--spacing-4'] || '1rem'}
            onChange={(val) => handleStyleChange('--spacing-4', val)}
            type="slider"
            min={0}
            max={5}
            step={0.25}
          />
          <StyleProperty
            label="Margin"
            value={styleValues['--spacing-2'] || '0.5rem'}
            onChange={(val) => handleStyleChange('--spacing-2', val)}
            type="slider"
            min={0}
            max={5}
            step={0.25}
          />
        </StyleCategory>

        <StyleCategory
          title="Font Styles"
          currentValue={styleValues['--font-family-display'] || 'degular-display'}
          isLive={isStyleLive('--font-family-display')}
          isApplicable={isStyleApplicable('font')}
          isExpanded={expandedCategories.includes('font')}
          onToggle={() => toggleCategory('font')}
        >
          <StyleProperty
            label="Font Family"
            value={styleValues['--font-family-display'] || 'degular-display'}
            onChange={(val) => handleStyleChange('--font-family-display', val)}
            type="text"
          />
          <StyleProperty
            label="Font Size"
            value={styleValues['--text-base'] || '1rem'}
            onChange={(val) => handleStyleChange('--text-base', val)}
            type="slider"
            min={0.75}
            max={3}
            step={0.125}
          />
          <StyleProperty
            label="Font Weight"
            value={styleValues['--font-weight-medium'] || '500'}
            onChange={(val) => handleStyleChange('--font-weight-medium', val)}
            type="select"
            options={[
              { value: '400', label: 'Normal (400)' },
              { value: '500', label: 'Medium (500)' },
              { value: '600', label: 'Semibold (600)' },
              { value: '700', label: 'Bold (700)' }
            ]}
          />
        </StyleCategory>

        <StyleCategory
          title="Text Styles"
          currentValue={styleValues['--color-text-primary'] || 'var(--midnight-900)'}
          isLive={isStyleLive('--color-text-primary')}
          isApplicable={isStyleApplicable('text')}
          isExpanded={expandedCategories.includes('text')}
          onToggle={() => toggleCategory('text')}
        >
          <StyleProperty
            label="Text Color"
            value={styleValues['--color-text-primary'] || '#1e2a38'}
            onChange={(val) => handleStyleChange('--color-text-primary', val)}
            type="color"
          />
          <StyleProperty
            label="Line Height"
            value={styleValues['--leading-normal'] || '1.5'}
            onChange={(val) => handleStyleChange('--leading-normal', val)}
            type="slider"
            min={1}
            max={2.5}
            step={0.125}
          />
          <StyleProperty
            label="Letter Spacing"
            value={styleValues['--tracking-normal'] || '0'}
            onChange={(val) => handleStyleChange('--tracking-normal', val)}
            type="slider"
            min={-0.05}
            max={0.1}
            step={0.005}
          />
        </StyleCategory>

        <StyleCategory
          title="Background Styles"
          currentValue={styleValues['--color-background'] || '#f5f3ef'}
          isLive={isStyleLive('--color-background')}
          isApplicable={isStyleApplicable('background')}
          isExpanded={expandedCategories.includes('background')}
          onToggle={() => toggleCategory('background')}
        >
          <StyleProperty
            label="Background Color"
            value={styleValues['--color-background'] || '#f5f3ef'}
            onChange={(val) => handleStyleChange('--color-background', val)}
            type="color"
          />
        </StyleCategory>

        <StyleCategory
          title="Position Styles"
          isLive={false}
          isApplicable={isStyleApplicable('position')}
          isExpanded={expandedCategories.includes('position')}
          onToggle={() => toggleCategory('position')}
        >
          <StyleProperty
            label="Z-Index"
            value={styleValues['--z-base'] || '0'}
            onChange={(val) => handleStyleChange('--z-base', val)}
            type="text"
          />
        </StyleCategory>

        <StyleCategory
          title="Extras"
          isLive={false}
          isApplicable={true}
          isExpanded={expandedCategories.includes('extras')}
          onToggle={() => toggleCategory('extras')}
        >
          <StyleProperty
            label="Opacity"
            value={styleValues['--opacity'] || '1'}
            onChange={(val) => handleStyleChange('--opacity', val)}
            type="slider"
            min={0}
            max={1}
            step={0.1}
          />
        </StyleCategory>

        <StyleCategory
          title="CSS3 Styles"
          currentValue={styleValues['--shadow-md']}
          isLive={isStyleLive('--shadow-md')}
          isApplicable={true}
          isExpanded={expandedCategories.includes('css3')}
          onToggle={() => toggleCategory('css3')}
        >
          <StyleProperty
            label="Box Shadow"
            value={styleValues['--shadow-md'] || '0 4px 6px -1px rgb(0 0 0 / 0.1)'}
            onChange={(val) => handleStyleChange('--shadow-md', val)}
            type="text"
          />
          <StyleProperty
            label="Border Radius"
            value={styleValues['--radius-lg'] || '0.5rem'}
            onChange={(val) => handleStyleChange('--radius-lg', val)}
            type="slider"
            min={0}
            max={3}
            step={0.125}
          />
        </StyleCategory>
      </Card>
    </div>
  );
}