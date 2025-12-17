import React, { useState, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export function StylesList({ onStyleSelect }) {
  const [styles, setStyles] = useState([]);
  const [groupedStyles, setGroupedStyles] = useState({});
  const [search, setSearch] = useState('');

  useEffect(() => {
    // Extract all unique classes from the page
    const extractStyles = () => {
      const allElements = document.querySelectorAll('body *:not([data-token-applier-ui]):not([data-token-applier-ui] *)');
      const classMap = new Map();

      allElements.forEach(element => {
        const classes = Array.from(element.classList).filter(c => c);
        const tagName = element.tagName.toLowerCase();
        
        classes.forEach(cls => {
          if (!classMap.has(cls)) {
            classMap.set(cls, {
              className: cls,
              count: 0,
              tags: new Set(),
              elements: []
            });
          }
          const data = classMap.get(cls);
          data.count++;
          data.tags.add(tagName);
          data.elements.push(element);
        });
      });

      const stylesList = Array.from(classMap.values())
        .filter(s => s.count > 0)
        .sort((a, b) => b.count - a.count)
        .map(s => ({
          ...s,
          tags: Array.from(s.tags)
        }));

      // Categorize styles
      const categories = {
        buttons: [],
        cards: [],
        typography: [],
        layout: [],
        colors: [],
        spacing: [],
        other: []
      };

      stylesList.forEach(style => {
        const name = style.className.toLowerCase();
        const tags = style.tags.join(',');
        
        if (name.includes('btn') || name.includes('button') || tags.includes('button')) {
          categories.buttons.push(style);
        } else if (name.includes('card') || name.includes('panel') || name.includes('box')) {
          categories.cards.push(style);
        } else if (name.includes('text-') || name.includes('font-') || name.includes('leading-') || name.includes('tracking-') || tags.includes('h1') || tags.includes('h2') || tags.includes('h3') || tags.includes('p')) {
          categories.typography.push(style);
        } else if (name.includes('flex') || name.includes('grid') || name.includes('container') || name.includes('w-') || name.includes('h-')) {
          categories.layout.push(style);
        } else if (name.includes('bg-') || name.includes('text-') || name.includes('border-')) {
          categories.colors.push(style);
        } else if (name.includes('p-') || name.includes('m-') || name.includes('gap-') || name.includes('space-')) {
          categories.spacing.push(style);
        } else {
          categories.other.push(style);
        }
      });

      setStyles(stylesList);
      setGroupedStyles(categories);
    };

    extractStyles();
  }, []);

  const filteredGrouped = {};
  Object.keys(groupedStyles).forEach(category => {
    filteredGrouped[category] = groupedStyles[category].filter(s =>
      s.className.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search classes..."
          className="pl-9"
        />
      </div>

      <ScrollArea className="h-[400px]">
        <div className="space-y-4">
          {Object.entries(filteredGrouped).map(([category, categoryStyles]) => {
            if (categoryStyles.length === 0) return null;
            
            return (
              <div key={category}>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
                  {category} ({categoryStyles.length})
                </h4>
                <div className="space-y-1">
                  {categoryStyles.map((style) => (
                    <Button
                      key={style.className}
                      variant="outline"
                      className="w-full justify-start text-left h-auto py-2"
                      onClick={() => onStyleSelect(style)}
                    >
                      <div className="w-full">
                        <div className="flex items-center justify-between mb-1">
                          <code className="text-xs font-mono">.{style.className}</code>
                          <Badge variant="secondary" className="text-xs">
                            {style.count}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {style.tags.slice(0, 3).join(', ')}
                          {style.tags.length > 3 && ` +${style.tags.length - 3}`}
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}