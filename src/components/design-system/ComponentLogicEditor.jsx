import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, GripVertical, ChevronRight, ChevronDown } from 'lucide-react';
import { PageContainer } from '@/components/common/PageContainer';
import { AccordionContainer } from '@/components/common/AccordionContainer';
import { COMPONENT_LOGIC_SPECS, COMPONENT_LOGIC_CATEGORIES, getComponentSpec, canAddChild } from './componentLogicSpecs';
import { toast } from 'sonner';

export function ComponentLogicEditor({ onUpdate }) {
  const [components, setComponents] = useState([]);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [expandedComponents, setExpandedComponents] = useState(new Set());

  const addComponent = (parentId = null, componentType) => {
    const spec = getComponentSpec(componentType);
    if (!spec) return;

    // Check if can add as child
    if (parentId && !canAddChild(parentId, componentType)) {
      toast.error(`Cannot add ${spec.label} to this parent`);
      return;
    }

    const newComponent = {
      id: `${componentType}_${Date.now()}`,
      type: componentType,
      properties: Object.entries(spec.properties).reduce((acc, [key, prop]) => {
        acc[key] = prop.default;
        return acc;
      }, {}),
      children: [],
      parentId
    };

    setComponents(prev => {
      const updated = [...prev];
      if (parentId) {
        const parent = updated.find(c => c.id === parentId);
        if (parent) {
          parent.children = [...(parent.children || []), newComponent.id];
        }
      }
      return [...updated, newComponent];
    });

    setSelectedComponent(newComponent);
    toast.success(`Added ${spec.label}`);
  };

  const deleteComponent = (componentId) => {
    const component = components.find(c => c.id === componentId);
    if (!component) return;

    setComponents(prev => {
      let updated = prev.filter(c => c.id !== componentId);
      // Remove from parent's children array
      if (component.parentId) {
        const parent = updated.find(c => c.id === component.parentId);
        if (parent) {
          parent.children = parent.children.filter(id => id !== componentId);
        }
      }
      // Delete all children recursively
      const deleteChildren = (parentId) => {
        const children = updated.filter(c => c.parentId === parentId);
        children.forEach(child => {
          updated = updated.filter(c => c.id !== child.id);
          deleteChildren(child.id);
        });
      };
      deleteChildren(componentId);
      return updated;
    });

    if (selectedComponent?.id === componentId) {
      setSelectedComponent(null);
    }
    toast.success('Component deleted');
  };

  const updateComponentProperty = (componentId, property, value) => {
    setComponents(prev => prev.map(c => 
      c.id === componentId 
        ? { ...c, properties: { ...c.properties, [property]: value } }
        : c
    ));
    
    if (onUpdate) {
      onUpdate(components);
    }
  };

  const toggleExpanded = (componentId) => {
    setExpandedComponents(prev => {
      const next = new Set(prev);
      if (next.has(componentId)) {
        next.delete(componentId);
      } else {
        next.add(componentId);
      }
      return next;
    });
  };

  const renderComponentTree = (parentId = null, depth = 0) => {
    const filteredComponents = components.filter(c => c.parentId === parentId);
    
    return filteredComponents.map(component => {
      const spec = getComponentSpec(component.type);
      const hasChildren = components.some(c => c.parentId === component.id);
      const isExpanded = expandedComponents.has(component.id);
      const isSelected = selectedComponent?.id === component.id;

      return (
        <div key={component.id} style={{ marginLeft: `${depth * 20}px` }}>
          <div 
            className={`flex items-center gap-2 p-2 rounded border cursor-pointer hover:bg-muted/50 transition-colors ${
              isSelected ? 'bg-primary/10 border-primary' : 'border-border'
            }`}
            onClick={() => setSelectedComponent(component)}
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
            
            {hasChildren && (
              <button 
                onClick={(e) => { e.stopPropagation(); toggleExpanded(component.id); }}
                className="p-1"
              >
                {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
              </button>
            )}
            
            <Badge variant="outline" className="text-xs">{spec?.label}</Badge>
            
            <span className="flex-1 text-sm">
              {component.properties.title || component.properties.text || component.properties.content || component.id}
            </span>

            {spec?.canHaveChildren && (
              <Select onValueChange={(type) => addComponent(component.id, type)}>
                <SelectTrigger className="w-8 h-8 p-0">
                  <Plus className="h-3 w-3" />
                </SelectTrigger>
                <SelectContent>
                  {spec.allowedChildren?.map(childType => {
                    const childSpec = getComponentSpec(childType);
                    return childSpec ? (
                      <SelectItem key={childType} value={childType}>
                        {childSpec.label}
                      </SelectItem>
                    ) : null;
                  })}
                </SelectContent>
              </Select>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => { e.stopPropagation(); deleteComponent(component.id); }}
              className="h-8 w-8 p-0"
            >
              <Trash2 className="h-3 w-3 text-destructive" />
            </Button>
          </div>

          {hasChildren && isExpanded && renderComponentTree(component.id, depth + 1)}
        </div>
      );
    });
  };

  const renderPropertyEditor = () => {
    if (!selectedComponent) {
      return (
        <div className="text-center text-muted-foreground py-12">
          Select a component to edit its properties
        </div>
      );
    }

    const spec = getComponentSpec(selectedComponent.type);
    if (!spec) return null;

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b">
          <Badge>{spec.label}</Badge>
          <span className="text-sm text-muted-foreground">{spec.description}</span>
        </div>

        {Object.entries(spec.properties).map(([key, prop]) => (
          <div key={key} className="space-y-2">
            <label className="text-sm font-medium">{prop.label}</label>
            
            {prop.type === 'text' && (
              <Input
                value={selectedComponent.properties[key] || ''}
                onChange={(e) => updateComponentProperty(selectedComponent.id, key, e.target.value)}
                placeholder={prop.label}
              />
            )}

            {prop.type === 'number' && (
              <Input
                type="number"
                value={selectedComponent.properties[key] || prop.default}
                onChange={(e) => updateComponentProperty(selectedComponent.id, key, parseInt(e.target.value))}
                min={prop.min}
                max={prop.max}
              />
            )}

            {prop.type === 'boolean' && (
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectedComponent.properties[key] || false}
                  onCheckedChange={(checked) => updateComponentProperty(selectedComponent.id, key, checked)}
                />
                <span className="text-sm text-muted-foreground">Enable</span>
              </div>
            )}

            {prop.type === 'select' && (
              <Select
                value={selectedComponent.properties[key] || prop.default}
                onValueChange={(value) => updateComponentProperty(selectedComponent.id, key, value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {prop.options.map(option => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {prop.type === 'dataBinding' && (
              <div className="space-y-2">
                <Input
                  value={selectedComponent.properties[key]?.entity || ''}
                  onChange={(e) => updateComponentProperty(selectedComponent.id, key, {
                    ...(selectedComponent.properties[key] || {}),
                    entity: e.target.value
                  })}
                  placeholder="Entity name"
                />
                <Input
                  value={selectedComponent.properties[key]?.field || ''}
                  onChange={(e) => updateComponentProperty(selectedComponent.id, key, {
                    ...(selectedComponent.properties[key] || {}),
                    field: e.target.value
                  })}
                  placeholder="Field name"
                />
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const categoryLabels = {
    [COMPONENT_LOGIC_CATEGORIES.CONTAINERS]: 'Containers',
    [COMPONENT_LOGIC_CATEGORIES.DATA_DISPLAY]: 'Data Display',
    [COMPONENT_LOGIC_CATEGORIES.NAVIGATION]: 'Navigation',
    [COMPONENT_LOGIC_CATEGORIES.FEEDBACK]: 'Feedback',
    [COMPONENT_LOGIC_CATEGORIES.FORMS]: 'Forms'
  };

  return (
    <div className="space-y-4">
      <PageContainer title="Component Builder" description="Build nested component structures">
        <div className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            {Object.values(COMPONENT_LOGIC_CATEGORIES).map(category => {
              const categoryComponents = Object.values(COMPONENT_LOGIC_SPECS).filter(
                spec => spec.category === category
              );
              
              return categoryComponents.length > 0 && (
                <Select key={category} onValueChange={(type) => addComponent(null, type)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder={categoryLabels[category]} />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryComponents.map(spec => (
                      <SelectItem key={spec.id} value={spec.id}>
                        {spec.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              );
            })}
          </div>
        </div>
      </PageContainer>

      <AccordionContainer title="Component Tree" description={`${components.length} components`}>
        <div className="space-y-2">
          {components.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No components yet. Add one from the dropdowns above.
            </div>
          ) : (
            renderComponentTree()
          )}
        </div>
      </AccordionContainer>

      <AccordionContainer title="Properties" description={selectedComponent ? 'Edit component' : 'No selection'}>
        {renderPropertyEditor()}
      </AccordionContainer>

      <AccordionContainer title="Preview Code" description="Generated structure">
        <pre className="text-xs bg-muted p-4 rounded overflow-auto max-h-96">
          {JSON.stringify(components, null, 2)}
        </pre>
      </AccordionContainer>
    </div>
  );
}