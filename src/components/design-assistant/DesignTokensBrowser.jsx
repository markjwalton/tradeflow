import React, { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Palette, Type, Space, BoxSelect } from 'lucide-react';
import { colors, spacing, typography, radii } from '@/components/library/designTokens';

export function DesignTokensBrowser({ onApplyToken }) {
  const [search, setSearch] = useState('');

  // Generate color tokens from imported data
  const colorTokens = Object.entries(colors).flatMap(([palette, shades]) => {
    if (typeof shades === 'string') {
      return [{ name: palette, value: shades, category: 'semantic' }];
    }
    return Object.entries(shades)
      .filter(([shade]) => !isNaN(shade) || ['DEFAULT', 'light', 'dark'].includes(shade))
      .map(([shade, value]) => ({
        name: `${palette}-${shade}`,
        value: value,
        category: palette
      }));
  });

  // Generate spacing tokens
  const spacingTokens = Object.entries(spacing).map(([key, value]) => ({
    name: `spacing-${key}`,
    value: `var(--spacing-${key})`,
    display: value
  }));

  // Generate typography tokens
  const typographyTokens = [
    ...Object.entries(typography.sizes).map(([key, value]) => ({
      name: `text-${key}`,
      value: `var(--text-${key})`,
      display: value
    })),
    ...Object.entries(typography.fonts).map(([key, value]) => ({
      name: `font-${key}`,
      value: `var(--font-family-${key === 'heading' ? 'display' : key})`,
      display: value.split(',')[0]
    }))
  ];

  // Generate radius tokens
  const radiusTokens = Object.entries(radii).map(([key, value]) => ({
    name: `radius-${key}`,
    value: `var(--radius-${key})`,
    display: value
  }));

  const filterTokens = (tokens) => 
    tokens.filter(t => t.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search tokens..."
          className="pl-9"
        />
      </div>

      <Tabs defaultValue="colors">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="colors" className="text-xs">
            <Palette className="h-3 w-3 mr-1" />
            Colors
          </TabsTrigger>
          <TabsTrigger value="spacing" className="text-xs">
            <Space className="h-3 w-3 mr-1" />
            Spacing
          </TabsTrigger>
          <TabsTrigger value="text" className="text-xs">
            <Type className="h-3 w-3 mr-1" />
            Text
          </TabsTrigger>
          <TabsTrigger value="radius" className="text-xs">
            <BoxSelect className="h-3 w-3 mr-1" />
            Radius
          </TabsTrigger>
        </TabsList>

        <TabsContent value="colors">
          <ScrollArea className="h-[350px]">
            <div className="space-y-2">
              {filterTokens(colorTokens).map((token) => (
                <Button
                  key={token.name}
                  variant="outline"
                  className="w-full justify-start h-auto py-2 px-3"
                  onClick={() => onApplyToken({ type: 'color', token })}
                >
                  <div 
                    className="w-6 h-6 rounded border mr-3 flex-shrink-0" 
                    style={{ backgroundColor: token.value }}
                  />
                  <div className="text-left flex-1">
                    <code className="text-xs font-mono">{token.name}</code>
                    <div className="text-xs text-muted-foreground">{token.value}</div>
                  </div>
                  <Badge variant="secondary" className="text-xs ml-2">
                    {token.category}
                  </Badge>
                </Button>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="spacing">
          <ScrollArea className="h-[350px]">
            <div className="space-y-2">
              {filterTokens(spacingTokens).map((token) => (
                <Button
                  key={token.name}
                  variant="outline"
                  className="w-full justify-start h-auto py-2 px-3"
                  onClick={() => onApplyToken({ type: 'spacing', token })}
                >
                  <div className="text-left flex-1">
                    <code className="text-xs font-mono">{token.name}</code>
                    <div className="text-xs text-muted-foreground">
                      {token.value} = {token.display}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="text">
          <ScrollArea className="h-[350px]">
            <div className="space-y-2">
              {filterTokens(typographyTokens).map((token) => (
                <Button
                  key={token.name}
                  variant="outline"
                  className="w-full justify-start h-auto py-2 px-3"
                  onClick={() => onApplyToken({ type: 'typography', token })}
                >
                  <div className="text-left flex-1">
                    <code className="text-xs font-mono">{token.name}</code>
                    <div className="text-xs text-muted-foreground">
                      {token.display}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="radius">
          <ScrollArea className="h-[350px]">
            <div className="space-y-2">
              {filterTokens(radiusTokens).map((token) => (
                <Button
                  key={token.name}
                  variant="outline"
                  className="w-full justify-start h-auto py-2 px-3"
                  onClick={() => onApplyToken({ type: 'radius', token })}
                >
                  <div className="text-left flex-1">
                    <code className="text-xs font-mono">{token.name}</code>
                    <div className="text-xs text-muted-foreground">
                      {token.value} = {token.display}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}