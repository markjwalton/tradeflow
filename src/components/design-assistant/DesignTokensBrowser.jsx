import React, { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Palette, Type, Space, BoxSelect } from 'lucide-react';

export function DesignTokensBrowser({ onApplyToken }) {
  const [search, setSearch] = useState('');

  const colorTokens = [
    // Primary
    { name: 'primary-50', value: 'var(--primary-50)', category: 'primary' },
    { name: 'primary-100', value: 'var(--primary-100)', category: 'primary' },
    { name: 'primary-200', value: 'var(--primary-200)', category: 'primary' },
    { name: 'primary-300', value: 'var(--primary-300)', category: 'primary' },
    { name: 'primary-400', value: 'var(--primary-400)', category: 'primary' },
    { name: 'primary-500', value: 'var(--primary-500)', category: 'primary' },
    { name: 'primary-600', value: 'var(--primary-600)', category: 'primary' },
    { name: 'primary-700', value: 'var(--primary-700)', category: 'primary' },
    { name: 'primary-800', value: 'var(--primary-800)', category: 'primary' },
    { name: 'primary-900', value: 'var(--primary-900)', category: 'primary' },
    
    // Secondary
    { name: 'secondary-50', value: 'var(--secondary-50)', category: 'secondary' },
    { name: 'secondary-100', value: 'var(--secondary-100)', category: 'secondary' },
    { name: 'secondary-200', value: 'var(--secondary-200)', category: 'secondary' },
    { name: 'secondary-300', value: 'var(--secondary-300)', category: 'secondary' },
    { name: 'secondary-400', value: 'var(--secondary-400)', category: 'secondary' },
    { name: 'secondary-500', value: 'var(--secondary-500)', category: 'secondary' },
    { name: 'secondary-600', value: 'var(--secondary-600)', category: 'secondary' },
    { name: 'secondary-700', value: 'var(--secondary-700)', category: 'secondary' },
    { name: 'secondary-800', value: 'var(--secondary-800)', category: 'secondary' },
    { name: 'secondary-900', value: 'var(--secondary-900)', category: 'secondary' },
    
    // Accent
    { name: 'accent-50', value: 'var(--accent-50)', category: 'accent' },
    { name: 'accent-100', value: 'var(--accent-100)', category: 'accent' },
    { name: 'accent-200', value: 'var(--accent-200)', category: 'accent' },
    { name: 'accent-300', value: 'var(--accent-300)', category: 'accent' },
    { name: 'accent-400', value: 'var(--accent-400)', category: 'accent' },
    { name: 'accent-500', value: 'var(--accent-500)', category: 'accent' },
    { name: 'accent-600', value: 'var(--accent-600)', category: 'accent' },
    { name: 'accent-700', value: 'var(--accent-700)', category: 'accent' },
    { name: 'accent-800', value: 'var(--accent-800)', category: 'accent' },
    { name: 'accent-900', value: 'var(--accent-900)', category: 'accent' },
    
    // Semantic
    { name: 'background', value: 'var(--background)', category: 'semantic' },
    { name: 'foreground', value: 'var(--foreground)', category: 'semantic' },
    { name: 'card', value: 'var(--card)', category: 'semantic' },
    { name: 'muted', value: 'var(--muted)', category: 'semantic' },
    { name: 'destructive', value: 'var(--destructive)', category: 'semantic' },
    { name: 'success', value: 'var(--success)', category: 'semantic' },
    { name: 'warning', value: 'var(--warning)', category: 'semantic' },
  ];

  const spacingTokens = [
    { name: 'spacing-1', value: 'var(--spacing-1)', display: '0.25rem' },
    { name: 'spacing-2', value: 'var(--spacing-2)', display: '0.5rem' },
    { name: 'spacing-3', value: 'var(--spacing-3)', display: '0.75rem' },
    { name: 'spacing-4', value: 'var(--spacing-4)', display: '1rem' },
    { name: 'spacing-5', value: 'var(--spacing-5)', display: '1.25rem' },
    { name: 'spacing-6', value: 'var(--spacing-6)', display: '1.5rem' },
    { name: 'spacing-8', value: 'var(--spacing-8)', display: '2rem' },
    { name: 'spacing-10', value: 'var(--spacing-10)', display: '2.5rem' },
    { name: 'spacing-12', value: 'var(--spacing-12)', display: '3rem' },
    { name: 'spacing-16', value: 'var(--spacing-16)', display: '4rem' },
    { name: 'spacing-20', value: 'var(--spacing-20)', display: '5rem' },
    { name: 'spacing-24', value: 'var(--spacing-24)', display: '6rem' },
  ];

  const typographyTokens = [
    { name: 'text-xs', value: 'var(--text-xs)', display: '0.75rem' },
    { name: 'text-sm', value: 'var(--text-sm)', display: '0.875rem' },
    { name: 'text-base', value: 'var(--text-base)', display: '1rem' },
    { name: 'text-lg', value: 'var(--text-lg)', display: '1.125rem' },
    { name: 'text-xl', value: 'var(--text-xl)', display: '1.25rem' },
    { name: 'text-2xl', value: 'var(--text-2xl)', display: '1.5rem' },
    { name: 'text-3xl', value: 'var(--text-3xl)', display: '1.875rem' },
    { name: 'font-display', value: 'var(--font-family-display)', display: 'Degular Display' },
    { name: 'font-body', value: 'var(--font-family-body)', display: 'Mrs Eaves' },
  ];

  const radiusTokens = [
    { name: 'radius-sm', value: 'var(--radius-sm)', display: '0.25rem' },
    { name: 'radius-md', value: 'var(--radius-md)', display: '0.375rem' },
    { name: 'radius-lg', value: 'var(--radius-lg)', display: '0.5rem' },
    { name: 'radius-xl', value: 'var(--radius-xl)', display: '0.75rem' },
    { name: 'radius-2xl', value: 'var(--radius-2xl)', display: '1rem' },
    { name: 'radius-full', value: 'var(--radius-full)', display: '9999px' },
  ];

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