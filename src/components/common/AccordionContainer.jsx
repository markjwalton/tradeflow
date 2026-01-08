import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * AccordionContainer - A collapsible container component with optional title and description
 * 
 * @param {string} title - Container title (editable in page properties)
 * @param {string} description - Optional container description (editable in page properties)
 * @param {string} containerBackground - Background color for the entire container
 * @param {string} titleBackground - Optional background color for title area (higher z-index)
 * @param {boolean} defaultCollapsed - Whether the container is collapsed by default (editable in page properties)
 * @param {ReactNode} children - Content to render inside the container
 */
export function AccordionContainer({ 
  title = 'Container Title',
  description,
  containerBackground = 'var(--color-card)',
  titleBackground,
  defaultCollapsed = false,
  children 
}) {
  const [isOpen, setIsOpen] = useState(!defaultCollapsed);

  return (
    <Card 
      className="relative overflow-hidden"
      style={{ backgroundColor: containerBackground }}
    >
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader 
            className="relative cursor-pointer hover:bg-muted/30 transition-colors"
            style={{ 
              backgroundColor: titleBackground || 'transparent',
              zIndex: titleBackground ? 10 : 'auto'
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <CardTitle>{title}</CardTitle>
                {description && <CardDescription>{description}</CardDescription>}
              </div>
              <ChevronDown 
                className={cn(
                  "h-5 w-5 text-muted-foreground transition-transform duration-200",
                  isOpen && "rotate-180"
                )}
              />
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="relative" style={{ zIndex: 1 }}>
            {children}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}