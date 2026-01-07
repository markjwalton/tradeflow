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
  const [expandedCategories, setExpandedCategories] = useState(['properties']);
  const [styleValues, setStyleValues] = useState({});
  const [componentState, setComponentState] = useState('default');
  const [shadowEffect, setShadowEffect] = useState('none');
  const [animation, setAnimation] = useState('none');
  const [editMode, setEditMode] = useState('global'); // 'global' or 'custom'
  const [customStyleName, setCustomStyleName] = useState('');
  const [editedGlobalCategories, setEditedGlobalCategories] = useState(new Set());
  const [editedCustomCategories, setEditedCustomCategories] = useState(new Set());

  const selectedElement = propSelectedElement || 'button';
  const selectedComponent = COMPONENT_TYPES.find(c => c.value === selectedElement);

  // Read current computed styles from DOM on mount
  useEffect(() => {
    const loadCurrentStyles = () => {
      const root = document.documentElement;
      const computedStyle = getComputedStyle(root);
      
      const stylesToRead = [
        '--border-width', '--color-border', '--border-style',
        '--spacing-4', '--spacing-2',
        '--font-family-display', '--text-base', '--font-weight-medium',
        '--color-text-primary', '--leading-normal', '--tracking-normal',
        '--color-background',
        '--shadow-md', '--radius-lg'
      ];
      
      const currentValues = {};
      stylesToRead.forEach(prop => {
        const value = computedStyle.getPropertyValue(prop).trim();
        if (value) {
          currentValues[prop] = value;
        }
      });
      
      setStyleValues(currentValues);
    };
    
    loadCurrentStyles();
  }, [selectedElement]);

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
    
    // Mark category as edited based on which properties it affects
    const categoryMap = {
      'border': ['--color-border', '--border-width', '--border-style'],
      'padding': ['--spacing-1', '--spacing-2', '--spacing-3', '--spacing-4', '--spacing-5', '--spacing-6', '--spacing-8', '--spacing-10', '--spacing-12', '--spacing-16'],
      'font': ['--font-family-display', '--font-family-body', '--text-xs', '--text-sm', '--text-base', '--text-lg', '--text-xl', '--text-2xl', '--text-3xl', '--text-4xl', '--text-5xl', '--font-weight-normal', '--font-weight-medium', '--font-weight-semibold', '--font-weight-bold', '--leading-tight', '--leading-snug', '--leading-normal', '--leading-relaxed', '--leading-loose', '--tracking-tight', '--tracking-normal', '--tracking-wide', '--tracking-airy', '--text-align', '--word-spacing-tight', '--word-spacing-normal', '--word-spacing-wide', '--word-spacing-airy', '--paragraph-spacing-tight', '--paragraph-spacing-normal', '--paragraph-spacing-relaxed', '--paragraph-spacing-loose'],
      'text': ['--color-primary', '--color-secondary', '--color-text-primary'],
      'background': ['--color-background', '--color-card', '--color-muted'],
      'position': ['--z-base'],
      'extras': ['--opacity'],
      'css3': ['--shadow-card', '--shadow-card-hover', '--radius-button']
    };
    
    for (const [category, props] of Object.entries(categoryMap)) {
      if (props.includes(property)) {
        if (editMode === 'global') {
          setEditedGlobalCategories(prev => new Set(prev).add(category));
        } else {
          setEditedCustomCategories(prev => new Set(prev).add(category));
        }
        break;
      }
    }
    
    // Live preview update
    document.documentElement.style.setProperty(property, value);
    window.dispatchEvent(new CustomEvent('css-variables-updated'));
    if (onUpdate) {
      onUpdate(newValues);
    }
    if (onPreviewUpdate) {
      onPreviewUpdate({ 
        element: selectedElement, 
        property, 
        value,
        state: componentState,
        shadow: shadowEffect,
        animation
      });
    }
  };

  const handleStateChange = (newState) => {
    setComponentState(newState);
    if (editMode === 'global') {
      setEditedGlobalCategories(prev => new Set(prev).add('properties'));
    } else {
      setEditedCustomCategories(prev => new Set(prev).add('properties'));
    }
    if (onPreviewUpdate) {
      onPreviewUpdate({ 
        element: selectedElement, 
        state: newState,
        shadow: shadowEffect,
        animation
      });
    }
  };

  const handleShadowChange = (newShadow) => {
    setShadowEffect(newShadow);
    if (editMode === 'global') {
      setEditedGlobalCategories(prev => new Set(prev).add('properties'));
    } else {
      setEditedCustomCategories(prev => new Set(prev).add('properties'));
    }
    if (onPreviewUpdate) {
      onPreviewUpdate({ 
        element: selectedElement, 
        state: componentState,
        shadow: newShadow,
        animation
      });
    }
  };

  const handleAnimationChange = (newAnimation) => {
    setAnimation(newAnimation);
    if (onPreviewUpdate) {
      onPreviewUpdate({ 
        element: selectedElement, 
        state: componentState,
        shadow: shadowEffect,
        animation: newAnimation,
        buttonVariant: styleValues['--button-variant'] || 'default',
        buttonSize: styleValues['--button-size'] || 'default',
        editMode: editMode,
        hasEdits: editMode === 'global' ? editedGlobalCategories.size > 0 : editedCustomCategories.size > 0
      });
    }
  };

  useEffect(() => {
    const handleLoadStyle = (event) => {
      const style = event.detail;
      // Load the style configuration for editing
      if (style.variant) handleStyleChange('--button-variant', style.variant);
      if (style.size) handleStyleChange('--button-size', style.size);
      if (style.state) setComponentState(style.state);
      if (style.shadow) setShadowEffect(style.shadow);
      if (style.animation) setAnimation(style.animation);
      setEditMode(style.isGlobal ? 'global' : 'custom');
    };

    window.addEventListener('load-style-for-editing', handleLoadStyle);
    
    return () => {
      window.removeEventListener('load-style-for-editing', handleLoadStyle);
    };
  }, []);

  useEffect(() => {
    if (onPreviewUpdate) {
      onPreviewUpdate({ 
        element: selectedElement, 
        state: componentState,
        shadow: shadowEffect,
        animation,
        buttonVariant: styleValues['--button-variant'] || 'default',
        buttonSize: styleValues['--button-size'] || 'default',
        editMode: editMode,
        hasEdits: editMode === 'global' ? editedGlobalCategories.size > 0 : editedCustomCategories.size > 0
      });
    }
  }, [editMode, editedGlobalCategories, editedCustomCategories]);

  return (
    <div className="space-y-4">
      {/* Editing Mode Header */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="text-sm font-semibold text-foreground">
                Editing: {selectedComponent?.label || 'Component'}
              </h3>
              <div className="flex items-center gap-2 bg-muted p-1 rounded-lg">
                <Button
                  variant={editMode === 'global' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setEditMode('global')}
                  className="h-7 px-3 text-xs"
                >
                  Global
                </Button>
                <Button
                  variant={editMode === 'custom' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setEditMode('custom')}
                  className="h-7 px-3 text-xs"
                >
                  Custom
                </Button>
              </div>
              {editMode === 'global' && <Badge variant="default" className="whitespace-nowrap">{instances} Instances</Badge>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Style Categories */}
      <Card>
        <StyleCategory
          title="Component Properties"
          isLive={true}
          isApplicable={true}
          isEdited={editMode === 'global' ? editedGlobalCategories.has('properties') : editedCustomCategories.has('properties')}
          isExpanded={expandedCategories.includes('properties')}
          onToggle={() => toggleCategory('properties')}
        >
          <div className="space-y-4">
            {/* Button Variant - only for button components */}
            {selectedElement === 'button' && (
              <StyleProperty
                label="Button Variant"
                value={styleValues['--button-variant'] || 'default'}
                onChange={(val) => handleStyleChange('--button-variant', val)}
                type="select"
                options={[
                  { value: 'default', label: 'Default' },
                  { value: 'destructive', label: 'Destructive' },
                  { value: 'outline', label: 'Outline' },
                  { value: 'secondary', label: 'Secondary' },
                  { value: 'ghost', label: 'Ghost' },
                  { value: 'link', label: 'Link' }
                ]}
              />
            )}
            
            {/* Button Size - only for button components */}
            {selectedElement === 'button' && (
              <StyleProperty
                label="Button Size"
                value={styleValues['--button-size'] || 'default'}
                onChange={(val) => handleStyleChange('--button-size', val)}
                type="select"
                options={[
                  { value: 'sm', label: 'Small' },
                  { value: 'default', label: 'Default' },
                  { value: 'lg', label: 'Large' },
                  { value: 'icon', label: 'Icon Only' }
                ]}
              />
            )}
            
            <StyleProperty
              label="Component State"
              value={componentState}
              onChange={(val) => handleStateChange(val)}
              type="select"
              options={[
                { value: 'default', label: 'Theme Defaults' },
                { value: 'hover', label: 'Hover (Mouse over)' },
                { value: 'focus', label: 'Focus (Keyboard Tab)' },
                { value: 'active', label: 'Active (Being pressed)' },
                { value: 'disabled', label: 'Disabled' }
              ]}
            />
            
            <StyleProperty
              label="Shadow Effect"
              value={shadowEffect}
              onChange={(val) => handleShadowChange(val)}
              type="select"
              options={[
                { value: 'none', label: 'No Shadow' },
                { value: 'sm', label: 'Shadow SM' },
                { value: 'md', label: 'Shadow MD' },
                { value: 'lg', label: 'Shadow LG' },
                { value: 'xl', label: 'Shadow XL' }
              ]}
            />
            
            <StyleProperty
              label="Animation"
              value={animation}
              onChange={(val) => handleAnimationChange(val)}
              type="select"
              options={[
                { value: 'none', label: 'No Animation' },
                { value: 'pulse', label: 'Pulse' },
                { value: 'bounce', label: 'Bounce' },
                { value: 'spin', label: 'Spin' }
              ]}
            />


          </div>
        </StyleCategory>
        <StyleCategory
          title="Border Styles"
          isLive={isStyleLive('--color-border')}
          isApplicable={isStyleApplicable('border')}
          isEdited={editMode === 'global' ? editedGlobalCategories.has('border') : editedCustomCategories.has('border')}
          isExpanded={expandedCategories.includes('border')}
          onToggle={() => toggleCategory('border')}
        >
          <StyleProperty
            label="Border Color"
            value={styleValues['--color-border'] || 'var(--charcoal-200)'}
            onChange={(val) => handleStyleChange('--color-border', val)}
            type="select"
            options={[
              { value: 'var(--primary-200)', label: 'Primary 200' },
              { value: 'var(--primary-300)', label: 'Primary 300' },
              { value: 'var(--secondary-200)', label: 'Secondary 200' },
              { value: 'var(--charcoal-200)', label: 'Charcoal 200' },
              { value: 'var(--charcoal-300)', label: 'Charcoal 300' },
              { value: 'var(--midnight-200)', label: 'Midnight 200' }
            ]}
          />
        </StyleCategory>

        <StyleCategory
          title="Spacing"
          isLive={isStyleLive('--spacing-4')}
          isApplicable={isStyleApplicable('padding')}
          isEdited={editMode === 'global' ? editedGlobalCategories.has('padding') : editedCustomCategories.has('padding')}
          isExpanded={expandedCategories.includes('padding')}
          onToggle={() => toggleCategory('padding')}
        >
          <StyleProperty
            label="Padding"
            value={styleValues['--spacing-4'] || 'var(--spacing-4)'}
            onChange={(val) => handleStyleChange('--spacing-4', val)}
            type="select"
            options={[
              { value: 'var(--spacing-1)', label: 'Spacing 1 (0.25rem)' },
              { value: 'var(--spacing-2)', label: 'Spacing 2 (0.5rem)' },
              { value: 'var(--spacing-3)', label: 'Spacing 3 (0.75rem)' },
              { value: 'var(--spacing-4)', label: 'Spacing 4 (1rem)' },
              { value: 'var(--spacing-5)', label: 'Spacing 5 (1.25rem)' },
              { value: 'var(--spacing-6)', label: 'Spacing 6 (1.5rem)' },
              { value: 'var(--spacing-8)', label: 'Spacing 8 (2rem)' },
              { value: 'var(--spacing-10)', label: 'Spacing 10 (2.5rem)' },
              { value: 'var(--spacing-12)', label: 'Spacing 12 (3rem)' },
              { value: 'var(--spacing-16)', label: 'Spacing 16 (4rem)' }
            ]}
          />
          <StyleProperty
            label="Margin"
            value={styleValues['--spacing-2'] || 'var(--spacing-2)'}
            onChange={(val) => handleStyleChange('--spacing-2', val)}
            type="select"
            options={[
              { value: 'var(--spacing-1)', label: 'Spacing 1 (0.25rem)' },
              { value: 'var(--spacing-2)', label: 'Spacing 2 (0.5rem)' },
              { value: 'var(--spacing-3)', label: 'Spacing 3 (0.75rem)' },
              { value: 'var(--spacing-4)', label: 'Spacing 4 (1rem)' },
              { value: 'var(--spacing-5)', label: 'Spacing 5 (1.25rem)' },
              { value: 'var(--spacing-6)', label: 'Spacing 6 (1.5rem)' },
              { value: 'var(--spacing-8)', label: 'Spacing 8 (2rem)' }
            ]}
          />
        </StyleCategory>

        <StyleCategory
          title="Typography"
          isLive={isStyleLive('--font-family-display')}
          isApplicable={isStyleApplicable('font')}
          isEdited={editMode === 'global' ? editedGlobalCategories.has('font') : editedCustomCategories.has('font')}
          isExpanded={expandedCategories.includes('font')}
          onToggle={() => toggleCategory('font')}
        >
          <StyleProperty
            label="Font Family"
            value={styleValues['--font-family-display'] || 'var(--font-family-display)'}
            onChange={(val) => handleStyleChange('--font-family-display', val)}
            type="select"
            options={[
              { value: 'var(--font-family-display)', label: 'Display (degular-display)' },
              { value: 'var(--font-family-body)', label: 'Body (mrs-eaves-xl-serif-narrow)' },
              { value: 'var(--font-family-mono)', label: 'Mono (source-code-pro)' }
            ]}
          />
          <StyleProperty
            label="Font Size"
            value={styleValues['--text-base'] || 'var(--text-base)'}
            onChange={(val) => handleStyleChange('--text-base', val)}
            type="select"
            options={[
              { value: 'var(--text-xs)', label: 'Extra Small (0.75rem)' },
              { value: 'var(--text-sm)', label: 'Small (0.875rem)' },
              { value: 'var(--text-base)', label: 'Base (1rem)' },
              { value: 'var(--text-lg)', label: 'Large (1.125rem)' },
              { value: 'var(--text-xl)', label: 'XL (1.25rem)' },
              { value: 'var(--text-2xl)', label: '2XL (1.5rem)' },
              { value: 'var(--text-3xl)', label: '3XL (1.875rem)' },
              { value: 'var(--text-4xl)', label: '4XL (2.25rem)' },
              { value: 'var(--text-5xl)', label: '5XL (3rem)' }
            ]}
          />
          <StyleProperty
            label="Font Weight"
            value={styleValues['--font-weight-medium'] || 'var(--font-weight-medium)'}
            onChange={(val) => handleStyleChange('--font-weight-medium', val)}
            type="select"
            options={[
              { value: 'var(--font-weight-normal)', label: 'Normal (400)' },
              { value: 'var(--font-weight-medium)', label: 'Medium (500)' },
              { value: 'var(--font-weight-semibold)', label: 'Semibold (600)' },
              { value: 'var(--font-weight-bold)', label: 'Bold (700)' }
            ]}
          />
          <StyleProperty
            label="Line Height"
            value={styleValues['--leading-normal'] || 'var(--leading-normal)'}
            onChange={(val) => handleStyleChange('--leading-normal', val)}
            type="select"
            options={[
              { value: 'var(--leading-tight)', label: 'Tight (1.25)' },
              { value: 'var(--leading-snug)', label: 'Snug (1.375)' },
              { value: 'var(--leading-normal)', label: 'Normal (1.5)' },
              { value: 'var(--leading-relaxed)', label: 'Relaxed (1.625)' },
              { value: 'var(--leading-loose)', label: 'Loose (2)' }
            ]}
          />
          <StyleProperty
            label="Letter Spacing"
            value={styleValues['--tracking-normal'] || 'var(--tracking-normal)'}
            onChange={(val) => handleStyleChange('--tracking-normal', val)}
            type="select"
            options={[
              { value: 'var(--tracking-tight)', label: 'Tight (-0.025em)' },
              { value: 'var(--tracking-normal)', label: 'Normal (0)' },
              { value: 'var(--tracking-wide)', label: 'Wide (0.025em)' },
              { value: 'var(--tracking-airy)', label: 'Airy (0.05em)' }
            ]}
          />
          <StyleProperty
            label="Text Alignment"
            value={styleValues['--text-align'] || 'left'}
            onChange={(val) => handleStyleChange('--text-align', val)}
            type="select"
            options={[
              { value: 'left', label: 'Left' },
              { value: 'center', label: 'Center' },
              { value: 'right', label: 'Right' },
              { value: 'justify', label: 'Justify' }
            ]}
          />
          <StyleProperty
            label="Word Spacing"
            value={styleValues['--word-spacing-normal'] || 'var(--word-spacing-normal)'}
            onChange={(val) => handleStyleChange('--word-spacing-normal', val)}
            type="select"
            options={[
              { value: 'var(--word-spacing-tight)', label: 'Tight (-0.05em)' },
              { value: 'var(--word-spacing-normal)', label: 'Normal (0)' },
              { value: 'var(--word-spacing-wide)', label: 'Wide (0.1em)' },
              { value: 'var(--word-spacing-airy)', label: 'Airy (0.2em)' }
            ]}
          />
          <StyleProperty
            label="Paragraph Spacing"
            value={styleValues['--paragraph-spacing-normal'] || 'var(--paragraph-spacing-normal)'}
            onChange={(val) => handleStyleChange('--paragraph-spacing-normal', val)}
            type="select"
            options={[
              { value: 'var(--paragraph-spacing-tight)', label: 'Tight (0.5rem)' },
              { value: 'var(--paragraph-spacing-normal)', label: 'Normal (1rem)' },
              { value: 'var(--paragraph-spacing-relaxed)', label: 'Relaxed (1.5rem)' },
              { value: 'var(--paragraph-spacing-loose)', label: 'Loose (2rem)' }
            ]}
          />
        </StyleCategory>

        <StyleCategory
          title="Colors"
          isLive={isStyleLive('--color-primary')}
          isApplicable={isStyleApplicable('text')}
          isEdited={editMode === 'global' ? editedGlobalCategories.has('text') : editedCustomCategories.has('text')}
          isExpanded={expandedCategories.includes('text')}
          onToggle={() => toggleCategory('text')}
        >
          <StyleProperty
            label="Primary Color"
            value={styleValues['--color-primary'] || 'var(--primary-500)'}
            onChange={(val) => handleStyleChange('--color-primary', val)}
            type="select"
            options={[
              { value: 'var(--primary-400)', label: 'Primary 400' },
              { value: 'var(--primary-500)', label: 'Primary 500' },
              { value: 'var(--primary-600)', label: 'Primary 600' },
              { value: 'var(--primary-700)', label: 'Primary 700' }
            ]}
          />
          <StyleProperty
            label="Secondary Color"
            value={styleValues['--color-secondary'] || 'var(--secondary-400)'}
            onChange={(val) => handleStyleChange('--color-secondary', val)}
            type="select"
            options={[
              { value: 'var(--secondary-300)', label: 'Secondary 300' },
              { value: 'var(--secondary-400)', label: 'Secondary 400' },
              { value: 'var(--secondary-500)', label: 'Secondary 500' },
              { value: 'var(--secondary-600)', label: 'Secondary 600' }
            ]}
          />
          <StyleProperty
            label="Text Color"
            value={styleValues['--color-text-primary'] || 'var(--midnight-900)'}
            onChange={(val) => handleStyleChange('--color-text-primary', val)}
            type="select"
            options={[
              { value: 'var(--midnight-900)', label: 'Midnight 900' },
              { value: 'var(--midnight-800)', label: 'Midnight 800' },
              { value: 'var(--charcoal-900)', label: 'Charcoal 900' },
              { value: 'var(--charcoal-800)', label: 'Charcoal 800' },
              { value: 'var(--charcoal-600)', label: 'Charcoal 600 (Muted)' }
            ]}
          />
        </StyleCategory>

        <StyleCategory
          title="Backgrounds"
          isLive={isStyleLive('--color-background')}
          isApplicable={isStyleApplicable('background')}
          isEdited={editMode === 'global' ? editedGlobalCategories.has('background') : editedCustomCategories.has('background')}
          isExpanded={expandedCategories.includes('background')}
          onToggle={() => toggleCategory('background')}
        >
          <StyleProperty
            label="Background"
            value={styleValues['--color-background'] || 'var(--background-100)'}
            onChange={(val) => handleStyleChange('--color-background', val)}
            type="select"
            options={[
              { value: 'var(--background-50)', label: 'Background 50 (Lightest)' },
              { value: 'var(--background-100)', label: 'Background 100' },
              { value: 'var(--background-200)', label: 'Background 200' }
            ]}
          />
          <StyleProperty
            label="Card Background"
            value={styleValues['--color-card'] || 'var(--color-card)'}
            onChange={(val) => handleStyleChange('--color-card', val)}
            type="select"
            options={[
              { value: '#ffffff', label: 'White' },
              { value: 'var(--background-50)', label: 'Background 50' },
              { value: 'var(--primary-50)', label: 'Primary 50' },
              { value: 'var(--secondary-50)', label: 'Secondary 50' }
            ]}
          />
          <StyleProperty
            label="Muted Background"
            value={styleValues['--color-muted'] || 'var(--background-200)'}
            onChange={(val) => handleStyleChange('--color-muted', val)}
            type="select"
            options={[
              { value: 'var(--background-100)', label: 'Background 100' },
              { value: 'var(--background-200)', label: 'Background 200' },
              { value: 'var(--charcoal-100)', label: 'Charcoal 100' }
            ]}
          />
        </StyleCategory>

        <StyleCategory
          title="Position Styles"
          isLive={false}
          isApplicable={isStyleApplicable('position')}
          isEdited={editMode === 'global' ? editedGlobalCategories.has('position') : editedCustomCategories.has('position')}
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
          title="Transparency"
          isLive={false}
          isApplicable={true}
          isEdited={editMode === 'global' ? editedGlobalCategories.has('extras') : editedCustomCategories.has('extras')}
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
          title="Shadows & Radius"
          isLive={isStyleLive('--shadow-card')}
          isApplicable={true}
          isEdited={editMode === 'global' ? editedGlobalCategories.has('css3') : editedCustomCategories.has('css3')}
          isExpanded={expandedCategories.includes('css3')}
          onToggle={() => toggleCategory('css3')}
        >
          <StyleProperty
            label="Shadow"
            value={styleValues['--shadow-card'] || 'var(--shadow-sm)'}
            onChange={(val) => handleStyleChange('--shadow-card', val)}
            type="select"
            options={[
              { value: 'var(--shadow-xs)', label: 'Shadow XS' },
              { value: 'var(--shadow-sm)', label: 'Shadow SM' },
              { value: 'var(--shadow-md)', label: 'Shadow MD' },
              { value: 'var(--shadow-lg)', label: 'Shadow LG' },
              { value: 'var(--shadow-xl)', label: 'Shadow XL' },
              { value: 'var(--shadow-2xl)', label: 'Shadow 2XL' }
            ]}
          />
          <StyleProperty
            label="Hover Shadow"
            value={styleValues['--shadow-card-hover'] || 'var(--shadow-md)'}
            onChange={(val) => handleStyleChange('--shadow-card-hover', val)}
            type="select"
            options={[
              { value: 'var(--shadow-sm)', label: 'Shadow SM' },
              { value: 'var(--shadow-md)', label: 'Shadow MD' },
              { value: 'var(--shadow-lg)', label: 'Shadow LG' },
              { value: 'var(--shadow-xl)', label: 'Shadow XL' }
            ]}
          />
          <StyleProperty
            label="Border Radius"
            value={styleValues['--radius-button'] || 'var(--radius-md)'}
            onChange={(val) => handleStyleChange('--radius-button', val)}
            type="select"
            options={[
              { value: 'var(--radius-none)', label: 'None (0)' },
              { value: 'var(--radius-xs)', label: 'XS (0.125rem)' },
              { value: 'var(--radius-sm)', label: 'SM (0.25rem)' },
              { value: 'var(--radius-md)', label: 'MD (0.375rem)' },
              { value: 'var(--radius-lg)', label: 'LG (0.5rem)' },
              { value: 'var(--radius-xl)', label: 'XL (0.75rem)' },
              { value: 'var(--radius-2xl)', label: '2XL (1rem)' },
              { value: 'var(--radius-3xl)', label: '3XL (1.5rem)' },
              { value: 'var(--radius-full)', label: 'Full (9999px)' }
            ]}
          />
        </StyleCategory>
      </Card>
    </div>
  );
}