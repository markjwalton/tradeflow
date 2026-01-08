import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ChevronDown, ChevronRight, Save, Trash2, Pencil, History, Globe, User, Check } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { StyleCategory, StyleProperty } from './StyleCategory';
import { toast } from 'sonner';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { COMPONENT_CATEGORIES, isStyleApplicable, getComponentSpec } from './componentCategories';
import { SHOWCASE_COMPONENTS, SHOWCASE_CATEGORIES, getShowcaseComponentSpec, getEditableProperties, isStyleApplicableToComponent } from './showcaseComponentSpecs';
import { PageContainer } from '@/components/common/PageContainer';
import { AccordionContainer } from '@/components/common/AccordionContainer';
import EmptyState from '@/components/common/EmptyState';
import PageSectionHeader from '@/components/common/PageSectionHeader';

export function AdvancedStyleEditor({ onUpdate, onPreviewUpdate, selectedElement: propSelectedElement }) {
  const [currentStyle, setCurrentStyle] = useState('--color-primary');
  const [instances, setInstances] = useState(0);
  const [saveAsNew, setSaveAsNew] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState(['properties', 'styleEditor']);
  const [styleValues, setStyleValues] = useState({});
  const [componentState, setComponentState] = useState('default');
  const [shadowEffect, setShadowEffect] = useState('none');
  const [animation, setAnimation] = useState('none');
  const [editMode, setEditMode] = useState('global');
  const [customStyleName, setCustomStyleName] = useState('');
  const [editedGlobalCategories, setEditedGlobalCategories] = useState(new Set());
  const [editedCustomCategories, setEditedCustomCategories] = useState(new Set());
  const [isHeaderOpen, setIsHeaderOpen] = useState(true);
  const [isVersionsOpen, setIsVersionsOpen] = useState(false);
  const [currentVersionPage, setCurrentVersionPage] = useState(1);
  const versionsPerPage = 3;
  const [versionHistory, setVersionHistory] = useState([]);
  const [savedStylesList, setSavedStylesList] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('components');
  const [selectedComponentId, setSelectedComponentId] = useState(propSelectedElement || 'button');
  const [sectionOrder, setSectionOrder] = useState(['selector', 'editing', 'versions', 'styles']);

  const selectedElement = selectedComponentId;
  const selectedComponent = getComponentSpec(selectedElement);
  const showcaseSpec = getShowcaseComponentSpec(selectedElement);
  const dynamicEditableProps = showcaseSpec ? getEditableProperties(selectedElement) : {};

  // Load persisted data on mount
  useEffect(() => {
    const loadPersistedData = () => {
      try {
        const savedStyles = localStorage.getItem('advanced-editor-styles');
        const savedVersions = localStorage.getItem('advanced-editor-versions');
        
        if (savedStyles) {
          setSavedStylesList(JSON.parse(savedStyles));
        }
        if (savedVersions) {
          setVersionHistory(JSON.parse(savedVersions));
        }
      } catch (e) {
        console.error('Failed to load persisted data:', e);
      }
    };
    
    loadPersistedData();
  }, []);

  // Count instances in DOM
  useEffect(() => {
    const countInstances = () => {
      let count = 0;
      const selectors = {
        button: 'button',
        card: '[class*="card"]',
        typography: 'h1, h2, h3, h4, h5, h6, p',
        badge: '[class*="badge"]',
        input: 'input',
        select: 'select, [role="combobox"]',
        dialog: '[role="dialog"]',
        alert: '[role="alert"]',
        table: 'table',
        navigation: 'nav',
        tooltip: '[role="tooltip"]',
        avatar: '[class*="avatar"]',
        skeleton: '[class*="skeleton"]',
        separator: '[class*="separator"], hr'
      };
      
      const selector = selectors[selectedElement];
      if (selector) {
        count = document.querySelectorAll(selector).length;
      }
      
      setInstances(count);
    };
    
    countInstances();
    const interval = setInterval(countInstances, 2000);
    return () => clearInterval(interval);
  }, [selectedElement]);

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
    
    // Trigger preview update when component changes
    if (onPreviewUpdate) {
      onPreviewUpdate({ 
        element: selectedElement,
        state: componentState,
        shadow: shadowEffect,
        animation,
        buttonVariant: styleValues['--button-variant'] || 'default',
        buttonSize: styleValues['--button-size'] || 'default',
        buttonActionType: styleValues['--button-action-type'] || 'general',
        buttonContentType: styleValues['--button-content-type'] || 'text-only',
        iconStrokeWidth: styleValues['--icon-stroke-width'] || '2',
        iconColor: styleValues['--icon-color'] || 'currentColor'
      });
    }
  }, [selectedElement]);

  const checkStyleApplicable = (styleCategory) => {
    // Check both systems - original component categories and showcase specs
    const fromCategories = isStyleApplicable(selectedElement, styleCategory);
    const fromShowcase = showcaseSpec ? isStyleApplicableToComponent(selectedElement, styleCategory) : false;
    return fromCategories || fromShowcase;
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
        animation,
        buttonVariant: styleValues['--button-variant'] || 'default',
        buttonSize: styleValues['--button-size'] || 'default',
        buttonActionType: styleValues['--button-action-type'] || 'general',
        buttonContentType: styleValues['--button-content-type'] || 'text-only',
        iconStrokeWidth: styleValues['--icon-stroke-width'] || '2',
        iconColor: styleValues['--icon-color'] || 'currentColor'
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
        animation,
        buttonVariant: styleValues['--button-variant'] || 'default',
        buttonSize: styleValues['--button-size'] || 'default',
        buttonActionType: styleValues['--button-action-type'] || 'general',
        buttonContentType: styleValues['--button-content-type'] || 'text-only',
        iconStrokeWidth: styleValues['--icon-stroke-width'] || '2',
        iconColor: styleValues['--icon-color'] || 'currentColor'
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
        animation,
        buttonVariant: styleValues['--button-variant'] || 'default',
        buttonSize: styleValues['--button-size'] || 'default',
        buttonActionType: styleValues['--button-action-type'] || 'general',
        buttonContentType: styleValues['--button-content-type'] || 'text-only',
        iconStrokeWidth: styleValues['--icon-stroke-width'] || '2',
        iconColor: styleValues['--icon-color'] || 'currentColor'
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
        buttonActionType: styleValues['--button-action-type'] || 'general',
        buttonContentType: styleValues['--button-content-type'] || 'text-only',
        editMode: editMode,
        hasEdits: editMode === 'global' ? editedGlobalCategories.size > 0 : editedCustomCategories.size > 0,
        iconStrokeWidth: styleValues['--icon-stroke-width'] || '2',
        iconColor: styleValues['--icon-color'] || 'currentColor'
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
        buttonActionType: styleValues['--button-action-type'] || 'general',
        buttonContentType: styleValues['--button-content-type'] || 'text-only',
        editMode: editMode,
        hasEdits: editMode === 'global' ? editedGlobalCategories.size > 0 : editedCustomCategories.size > 0,
        iconStrokeWidth: styleValues['--icon-stroke-width'] || '2',
        iconColor: styleValues['--icon-color'] || 'currentColor'
      });
    }
  }, [editMode, editedGlobalCategories, editedCustomCategories, styleValues]);

  const handleApplyStyle = () => {
    const styleName = editMode === 'custom' ? (customStyleName || 'Custom Style') : 'Global Style';
    const changedProperties = Object.keys(styleValues);
    
    const newStyle = {
      id: Date.now(),
      name: styleName,
      mode: editMode,
      variant: styleValues['--button-variant'] || 'default',
      size: styleValues['--button-size'] || 'default',
      state: componentState,
      shadow: shadowEffect,
      animation,
      actionType: styleValues['--button-action-type'] || 'general',
      contentType: styleValues['--button-content-type'] || 'text-only',
      iconStrokeWidth: styleValues['--icon-stroke-width'] || '2',
      iconColor: styleValues['--icon-color'] || 'currentColor',
      timestamp: new Date().toLocaleString(),
      changedProperties
    };
    
    const newVersion = {
      id: Date.now(),
      version: `v1.${versionHistory.length + 1}`,
      name: styleName,
      mode: editMode,
      changedProperties,
      timestamp: new Date().toLocaleString(),
      author: 'Current User',
      styleSnapshot: { ...styleValues }
    };
    
    const updatedStyles = [...savedStylesList, newStyle];
    const updatedVersions = [newVersion, ...versionHistory];
    
    setSavedStylesList(updatedStyles);
    setVersionHistory(updatedVersions);
    
    localStorage.setItem('advanced-editor-styles', JSON.stringify(updatedStyles));
    localStorage.setItem('advanced-editor-versions', JSON.stringify(updatedVersions));
    
    if (editMode === 'global') {
      setEditedGlobalCategories(new Set());
    } else {
      setEditedCustomCategories(new Set());
    }
    
    toast.success(`Style "${styleName}" applied and saved`);
  };

  const handleLoadStyle = (style) => {
    setEditMode(style.mode);
    handleStyleChange('--button-variant', style.variant);
    handleStyleChange('--button-size', style.size);
    setComponentState(style.state);
    setShadowEffect(style.shadow);
    setAnimation(style.animation);
    if (style.actionType) handleStyleChange('--button-action-type', style.actionType);
    if (style.contentType) handleStyleChange('--button-content-type', style.contentType);
    handleStyleChange('--icon-stroke-width', style.iconStrokeWidth);
    handleStyleChange('--icon-color', style.iconColor);
    toast.info(`Loaded: ${style.name}`);
  };

  const handleDeleteStyle = (id) => {
    const updatedStyles = savedStylesList.filter(s => s.id !== id);
    setSavedStylesList(updatedStyles);
    localStorage.setItem('advanced-editor-styles', JSON.stringify(updatedStyles));
    toast.success('Style deleted');
  };

  const handleRollbackVersion = (version) => {
    if (version.styleSnapshot) {
      Object.entries(version.styleSnapshot).forEach(([property, value]) => {
        document.documentElement.style.setProperty(property, value);
        handleStyleChange(property, value);
      });
      window.dispatchEvent(new CustomEvent('css-variables-updated'));
      toast.success(`Rolled back to ${version.version}: ${version.name}`);
    } else {
      toast.error('No snapshot available for this version');
    }
  };

  const handleDeleteVersion = (id) => {
    const updatedVersions = versionHistory.filter(v => v.id !== id);
    setVersionHistory(updatedVersions);
    localStorage.setItem('advanced-editor-versions', JSON.stringify(updatedVersions));
    toast.success('Version deleted');
  };

  const paginatedVersions = versionHistory.slice(
    (currentVersionPage - 1) * versionsPerPage,
    currentVersionPage * versionsPerPage
  );
  const totalVersionPages = Math.ceil(versionHistory.length / versionsPerPage);

  const hasUnsavedChanges = editMode === 'global' ? editedGlobalCategories.size > 0 : editedCustomCategories.size > 0;
  const elementName = editMode === 'custom' && customStyleName 
    ? `Custom ${selectedComponent?.label || showcaseSpec?.label || 'Component'}` 
    : selectedComponent?.label || showcaseSpec?.label || 'Component';
  
  const componentDescription = showcaseSpec?.description || selectedComponent?.description || '';
  const functionalSpec = showcaseSpec?.functionalSpec || '';

  // Group components by category
  const componentsByCategory = Object.entries(SHOWCASE_CATEGORIES).map(([key, categoryId]) => {
    const components = Object.values(SHOWCASE_COMPONENTS).filter(c => c.category === categoryId);
    return { categoryId, categoryLabel: key.charAt(0) + key.slice(1).toLowerCase(), components };
  }).filter(cat => cat.components.length > 0);

  // Get components for currently selected category
  const availableComponents = Object.values(SHOWCASE_COMPONENTS).filter(c => c.category === selectedCategory);
  
  // Count components per category for badges
  const categoryComponentCounts = componentsByCategory.reduce((acc, cat) => {
    acc[cat.categoryId] = cat.components.length;
    return acc;
  }, {});

  // Category labels mapping
  const categoryLabels = {
    'foundations': 'Design Foundations',
    'components': 'UI Components',
    'navigation': 'Navigation',
    'layout': 'Layout & Structure',
    'appshell': 'App Shell',
    'data': 'Data Display',
    'feedback': 'Feedback & States'
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    const items = Array.from(sectionOrder);
    const [reordered] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reordered);
    
    setSectionOrder(items);
  };

  const sections = {
    selector: (index, provided, snapshot) => (
      <Card key="selector" className="border-border">
        <CardContent className="p-6 pb-0">
          <PageSectionHeader
            title="Select Component"
            dragHandleProps={provided?.dragHandleProps}
            tabs={componentsByCategory.map(cat => ({
              name: `${cat.categoryLabel} (${cat.components.length})`,
              href: `#${cat.categoryId}`,
              current: selectedCategory === cat.categoryId
            }))}
            onTabChange={(tab) => {
              const catLabel = tab.name.split(' (')[0];
              const matchedCat = componentsByCategory.find(c => c.categoryLabel === catLabel);
              if (matchedCat) {
                setSelectedCategory(matchedCat.categoryId);
              }
            }}
          />
        </CardContent>
        <CardContent className="p-6">
          <div className="space-y-2">
            <h5 className="text-base font-medium text-foreground font-[family-name:var(--font-family-display)]">Component ({availableComponents.length})</h5>
            <Select value={selectedComponentId} onValueChange={setSelectedComponentId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a component..." />
              </SelectTrigger>
              <SelectContent>
                {availableComponents.map(comp => (
                  <SelectItem key={comp.id} value={comp.id}>
                    {comp.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    ),

    editing: (index, provided, snapshot) => (
      <Card key="editing" className="border-border">
        <CardContent className="p-6 pb-0">
          <PageSectionHeader
            title="Editing"
            dragHandleProps={provided?.dragHandleProps}
            actions={[

  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="editor-sections">
        {(provided) => (
          <div 
            className="space-y-4"
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {sectionOrder.map((sectionKey, index) => (
              <Draggable key={sectionKey} draggableId={sectionKey} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                  >
                    {sections[sectionKey](index, provided, snapshot)}
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}