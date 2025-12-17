import React, { useState, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export function StylesList({ onStyleSelect }) {
  const [styles, setStyles] = useState([]);
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

      setStyles(stylesList);
    };

    extractStyles();
  }, []);

  const filteredStyles = styles.filter(s => 
    s.className.toLowerCase().includes(search.toLowerCase())
  );

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
        <div className="space-y-2">
          {filteredStyles.map((style) => (
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
                  Used in: {style.tags.slice(0, 3).join(', ')}
                  {style.tags.length > 3 && ` +${style.tags.length - 3}`}
                </div>
              </div>
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}