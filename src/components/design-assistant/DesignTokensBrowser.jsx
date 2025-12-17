import React, { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search } from 'lucide-react';

export function DesignTokensBrowser({ onApplyToken }) {
  const [search, setSearch] = useState('');
  const [targetElement, setTargetElement] = useState('element');

  // Extract tokens directly from globals.css
  const extractGlobalsTokens = () => {
    const root = getComputedStyle(document.documentElement);
    
    const colorTokens = [];
    const backgroundTokens = [];
    const fontTokens = [];
    
    // Get all CSS variables
    const allProps = Array.from(document.styleSheets)
      .flatMap(sheet => {
        try {
          return Array.from(sheet.cssRules);
        } catch (e) {
          return [];
        }
      })
      .filter(rule => rule.selectorText === ':root')
      .flatMap(rule => Array.from(rule.style))
      .filter(prop => prop.startsWith('--'));
    
    allProps.forEach(prop => {
      const value = root.getPropertyValue(prop).trim();
      
      if (prop.startsWith('--color-') || prop.startsWith('--primary-') || prop.startsWith('--secondary-') || prop.startsWith('--accent-')) {
        colorTokens.push({
          name: prop.replace('--', ''),
          cssVar: `var(${prop})`,
          value: value,
          type: 'color'
        });
      } else if (prop.startsWith('--bg-') || prop.includes('background')) {
        backgroundTokens.push({
          name: prop.replace('--', ''),
          cssVar: `var(${prop})`,
          value: value,
          type: 'background'
        });
      } else if (prop.startsWith('--font-family-')) {
        fontTokens.push({
          name: prop.replace('--', ''),
          cssVar: `var(${prop})`,
          value: value,
          type: 'font'
        });
      }
    });
    
    return { colorTokens, backgroundTokens, fontTokens };
  };

  const { colorTokens, backgroundTokens, fontTokens } = extractGlobalsTokens();

  const filterTokens = (tokens) => 
    tokens.filter(t => t.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search tokens..."
          className="pl-9 h-9"
        />
      </div>

      <div className="flex gap-2">
        <Button 
          variant={targetElement === 'element' ? 'default' : 'outline'} 
          size="sm" 
          className="flex-1 h-8 text-xs"
          onClick={() => setTargetElement('element')}
        >
          Element
        </Button>
        <Button 
          variant={targetElement === 'h1' ? 'default' : 'outline'} 
          size="sm" 
          className="flex-1 h-8 text-xs"
          onClick={() => setTargetElement('h1')}
        >
          H1
        </Button>
        <Button 
          variant={targetElement === 'h2' ? 'default' : 'outline'} 
          size="sm" 
          className="flex-1 h-8 text-xs"
          onClick={() => setTargetElement('h2')}
        >
          H2
        </Button>
        <Button 
          variant={targetElement === 'h3' ? 'default' : 'outline'} 
          size="sm" 
          className="flex-1 h-8 text-xs"
          onClick={() => setTargetElement('h3')}
        >
          H3
        </Button>
      </div>

      <Tabs defaultValue="backgrounds" className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-9">
          <TabsTrigger value="backgrounds" className="text-xs">Backgrounds</TabsTrigger>
          <TabsTrigger value="text" className="text-xs">Text</TabsTrigger>
          <TabsTrigger value="fonts" className="text-xs">Fonts</TabsTrigger>
        </TabsList>

        <TabsContent value="backgrounds" className="mt-3">
          <ScrollArea className="h-[300px]">
            <div className="space-y-1">
              {filterTokens([...colorTokens, ...backgroundTokens].filter(t => t.type === 'color' || t.type === 'background')).map((token) => (
                <Button
                  key={token.name}
                  variant="ghost"
                  className="w-full justify-start h-auto py-1.5 px-2 hover:bg-muted"
                  onClick={() => onApplyToken({ type: 'background', token, target: targetElement })}
                >
                  <div 
                    className="w-5 h-5 rounded border mr-2 flex-shrink-0" 
                    style={{ backgroundColor: token.cssVar || token.value }}
                  />
                  <code className="text-xs font-mono flex-1 text-left">{token.name}</code>
                </Button>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="text" className="mt-3">
          <ScrollArea className="h-[300px]">
            <div className="space-y-1">
              {filterTokens(colorTokens.filter(t => t.name.includes('text'))).map((token) => (
                <Button
                  key={token.name}
                  variant="ghost"
                  className="w-full justify-start h-auto py-1.5 px-2 hover:bg-muted"
                  onClick={() => onApplyToken({ type: 'text-color', token, target: targetElement })}
                >
                  <div 
                    className="w-5 h-5 rounded border mr-2 flex-shrink-0" 
                    style={{ backgroundColor: token.cssVar || token.value }}
                  />
                  <code className="text-xs font-mono flex-1 text-left">{token.name}</code>
                </Button>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="fonts" className="mt-3">
          <ScrollArea className="h-[300px]">
            <div className="space-y-1">
              {filterTokens(fontTokens).map((token) => (
                <Button
                  key={token.name}
                  variant="ghost"
                  className="w-full justify-start h-auto py-1.5 px-2 hover:bg-muted"
                  onClick={() => onApplyToken({ type: 'font', token, target: targetElement })}
                >
                  <code className="text-xs font-mono flex-1 text-left">{token.name}</code>
                </Button>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}