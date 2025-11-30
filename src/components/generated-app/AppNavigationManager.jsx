import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Plus, GripVertical, Trash2, Eye, EyeOff, ChevronRight, Settings } from "lucide-react";

const availableIcons = [
  "Home", "Users", "Settings", "FileText", "Database", "BarChart", 
  "Calendar", "Mail", "Bell", "Shield", "Package", "Briefcase",
  "ShoppingCart", "CreditCard", "Truck", "MapPin", "Phone", "Globe"
];

export default function AppNavigationManager({ 
  navigationConfig, 
  pages = [], 
  onUpdate,
  onSave 
}) {
  const [items, setItems] = useState(navigationConfig?.items || []);
  const [settings, setSettings] = useState(navigationConfig?.settings || {
    app_name: "",
    logo_url: "",
    sidebar_collapsed: false,
    theme: "light"
  });
  const [showSettings, setShowSettings] = useState(false);

  const addItem = () => {
    const newItem = {
      id: `nav-${Date.now()}`,
      label: "New Item",
      page: "",
      icon: "FileText",
      order: items.length,
      parent_id: null,
      is_visible: true,
      roles: []
    };
    setItems([...items, newItem]);
  };

  const updateItem = (id, updates) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
  };

  const removeItem = (id) => {
    setItems(items.filter(item => item.id !== id && item.parent_id !== id));
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    const reordered = Array.from(items);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    
    // Update order values
    const updated = reordered.map((item, index) => ({
      ...item,
      order: index
    }));
    
    setItems(updated);
  };

  const handleSave = () => {
    onSave({
      items,
      settings
    });
  };

  const autoGenerateFromPages = () => {
    const navItems = pages.map((page, index) => ({
      id: `nav-${page.name.toLowerCase().replace(/\s/g, '-')}`,
      label: page.name,
      page: page.name,
      icon: getIconForPage(page),
      order: index,
      parent_id: null,
      is_visible: true,
      roles: []
    }));
    setItems(navItems);
  };

  const getIconForPage = (page) => {
    const name = page.name.toLowerCase();
    if (name.includes('dashboard')) return 'Home';
    if (name.includes('user')) return 'Users';
    if (name.includes('setting')) return 'Settings';
    if (name.includes('report')) return 'BarChart';
    if (name.includes('calendar')) return 'Calendar';
    if (name.includes('order')) return 'ShoppingCart';
    if (name.includes('product')) return 'Package';
    return 'FileText';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Navigation Configuration</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowSettings(!showSettings)}>
            <Settings className="h-4 w-4 mr-1" />
            Settings
          </Button>
          <Button variant="outline" size="sm" onClick={autoGenerateFromPages}>
            Auto-Generate
          </Button>
          <Button variant="outline" size="sm" onClick={addItem}>
            <Plus className="h-4 w-4 mr-1" />
            Add Item
          </Button>
        </div>
      </div>

      {showSettings && (
        <Card className="bg-gray-50">
          <CardContent className="pt-4 space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">App Name</label>
                <Input 
                  value={settings.app_name} 
                  onChange={(e) => setSettings({...settings, app_name: e.target.value})}
                  placeholder="My App"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Logo URL</label>
                <Input 
                  value={settings.logo_url} 
                  onChange={(e) => setSettings({...settings, logo_url: e.target.value})}
                  placeholder="https://..."
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch 
                  checked={settings.sidebar_collapsed}
                  onCheckedChange={(v) => setSettings({...settings, sidebar_collapsed: v})}
                />
                <span className="text-sm">Collapsed by default</span>
              </div>
              <div>
                <Select value={settings.theme} onValueChange={(v) => setSettings({...settings, theme: v})}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="nav-items">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
              {items.sort((a, b) => a.order - b.order).map((item, index) => (
                <Draggable key={item.id} draggableId={item.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`flex items-center gap-3 p-3 bg-white border rounded-lg ${
                        snapshot.isDragging ? 'shadow-lg' : ''
                      }`}
                    >
                      <div {...provided.dragHandleProps}>
                        <GripVertical className="h-4 w-4 text-gray-400" />
                      </div>
                      
                      <Input
                        value={item.label}
                        onChange={(e) => updateItem(item.id, { label: e.target.value })}
                        className="w-32"
                        placeholder="Label"
                      />
                      
                      <Select value={item.page} onValueChange={(v) => updateItem(item.id, { page: v })}>
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Select page" />
                        </SelectTrigger>
                        <SelectContent>
                          {pages.map(page => (
                            <SelectItem key={page.name} value={page.name}>{page.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      <Select value={item.icon} onValueChange={(v) => updateItem(item.id, { icon: v })}>
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Icon" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableIcons.map(icon => (
                            <SelectItem key={icon} value={icon}>{icon}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => updateItem(item.id, { is_visible: !item.is_visible })}
                      >
                        {item.is_visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4 text-gray-400" />}
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-600"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {items.length === 0 && (
        <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
          <p>No navigation items yet</p>
          <Button variant="link" onClick={autoGenerateFromPages}>
            Auto-generate from pages
          </Button>
        </div>
      )}

      <div className="flex justify-end pt-4">
        <Button onClick={handleSave}>Save Navigation</Button>
      </div>
    </div>
  );
}