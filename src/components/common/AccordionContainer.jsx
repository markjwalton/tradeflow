import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, GripVertical } from 'lucide-react';
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
 * @param {object} dragHandleProps - Props from drag and drop library (optional)
 * @param {boolean} isDragging - Whether component is being dragged (optional)
 */
export function AccordionContainer({ 
  title = 'Container Title',
  description,
  containerBackground = 'var(--color-card)',
  titleBackground,
  defaultCollapsed = false,
  dragHandleProps,
  isDragging,
  children 
}) {
  const [isOpen, setIsOpen] = useState(!defaultCollapsed);

  return (
    <Card 
      className={cn(
        "relative overflow-hidden transition-shadow",
        isDragging && "shadow-lg ring-2 ring-primary/50"
      )}
      style={{ backgroundColor: containerBackground }}
    >
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader 
            className="relative cursor-pointer hover:bg-muted/30 transition-colors flex flex-row items-center gap-2"
            style={{ 
              backgroundColor: titleBackground || 'transparent',
              zIndex: titleBackground ? 10 : 'auto'
            }}
          >
            {dragHandleProps && (
              <div 
                {...dragHandleProps}
                className="cursor-grab active:cursor-grabbing opacity-50 hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <GripVertical className="h-5 w-5" />
              </div>
            )}
            <div className="flex items-center justify-between flex-1">
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