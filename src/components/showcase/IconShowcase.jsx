import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
import { getIconOptions, ICON_GROUPS } from '@/components/navigation/NavIconMap';

const DESIGN_TOKEN_COLORS = [
  { value: 'var(--primary-500)', label: 'Primary', hex: '#4a7c59' },
  { value: 'var(--secondary-400)', label: 'Secondary', hex: '#c4a57b' },
  { value: 'var(--accent-300)', label: 'Accent', hex: '#d4a5a5' },
  { value: 'var(--foreground)', label: 'Foreground', hex: '#2c3e50' },
  { value: 'var(--muted-foreground)', label: 'Muted', hex: '#6b7280' },
  { value: 'var(--destructive)', label: 'Destructive', hex: '#8b4545' },
  { value: 'var(--charcoal-900)', label: 'Charcoal', hex: '#404040' },
  { value: 'var(--midnight-900)', label: 'Midnight', hex: '#2c3e50' },
  { value: '#000000', label: 'Black', hex: '#000000' },
  { value: '#ffffff', label: 'White', hex: '#ffffff' },
];

export default function IconShowcase() {
  const [searchTerm, setSearchTerm] = useState('');
  const [iconSize, setIconSize] = useState(20);
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [iconColor, setIconColor] = useState('#000000');

  const allIcons = getIconOptions();
  const filteredIcons = allIcons.filter(({ name }) =>
    name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderIconGrid = (icons) => (
    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4">
      {icons.map(({ name, icon: IconComponent }) => (
        <div
          key={name}
          className="flex flex-col items-center gap-2 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
          title={name}
        >
          <IconComponent
            size={iconSize}
            strokeWidth={strokeWidth}
            style={{ color: iconColor }}
          />
          <span className="text-xs text-center truncate w-full">{name}</span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6" data-component="iconShowcase">
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Icon Controls</CardTitle>
          <CardDescription>Customize icon appearance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label>Size: {iconSize}px</Label>
              <Slider
                value={[iconSize]}
                onValueChange={(val) => setIconSize(val[0])}
                min={12}
                max={64}
                step={2}
              />
            </div>
            <div className="space-y-2">
              <Label>Stroke Width: {strokeWidth}</Label>
              <Slider
                value={[strokeWidth]}
                onValueChange={(val) => setStrokeWidth(val[0])}
                min={0.5}
                max={4}
                step={0.5}
              />
            </div>
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex gap-2">
                <Select value={iconColor} onValueChange={setIconColor}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select color..." />
                  </SelectTrigger>
                  <SelectContent>
                    {DESIGN_TOKEN_COLORS.map((color) => (
                      <SelectItem key={color.value} value={color.value}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-4 h-4 rounded border" 
                            style={{ backgroundColor: color.hex }}
                          />
                          {color.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  value={iconColor}
                  onChange={(e) => setIconColor(e.target.value)}
                  placeholder="Custom..."
                  className="font-mono w-32"
                />
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="space-y-2">
            <Label>Search Icons</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name..."
                className="pl-10"
              />
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-4 pt-2">
            <Badge variant="outline">Total: {allIcons.length} icons</Badge>
            <Badge variant="outline">Filtered: {filteredIcons.length} icons</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Icon Groups */}
      {!searchTerm ? (
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="all">All Icons</TabsTrigger>
            {Object.entries(ICON_GROUPS).map(([key, icons]) => (
              <TabsTrigger key={key} value={key}>
                {key.charAt(0).toUpperCase() + key.slice(1)} ({icons.length})
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="all">
            <Card>
              <CardHeader>
                <CardTitle>All Icons ({allIcons.length})</CardTitle>
              </CardHeader>
              <CardContent>{renderIconGrid(allIcons)}</CardContent>
            </Card>
          </TabsContent>

          {Object.entries(ICON_GROUPS).map(([groupKey, iconNames]) => {
            const groupIcons = allIcons.filter(({ name }) => iconNames.includes(name));
            return (
              <TabsContent key={groupKey} value={groupKey}>
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {groupKey.charAt(0).toUpperCase() + groupKey.slice(1)} Icons ({groupIcons.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>{renderIconGrid(groupIcons)}</CardContent>
                </Card>
              </TabsContent>
            );
          })}
        </Tabs>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Search Results ({filteredIcons.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredIcons.length > 0 ? (
              renderIconGrid(filteredIcons)
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                No icons found matching "{searchTerm}"
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Usage Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Examples</CardTitle>
          <CardDescription>How to use icons in your code</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm font-mono mb-2">Import and use:</p>
            <code className="text-xs block">
              {`import { Home } from 'lucide-react';

<Home size={${iconSize}} strokeWidth={${strokeWidth}} color="${iconColor}" />`}
            </code>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm font-mono mb-2">Using renderIcon utility:</p>
            <code className="text-xs block">
              {`import { renderIcon } from '@/components/navigation/NavIconMap';

{renderIcon('Home', 'h-5 w-5')}`}
            </code>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}