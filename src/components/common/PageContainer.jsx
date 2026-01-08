import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import PageSectionHeader from './PageSectionHeader';

/**
 * PageContainer - A reusable container component with optional title and description
 * 
 * @param {string} title - Container title (editable in page properties)
 * @param {string} description - Optional container description (editable in page properties)
 * @param {string} containerBackground - Background color for the entire container
 * @param {string} titleBackground - Optional background color for title area (higher z-index)
 * @param {ReactNode} children - Content to render inside the container
 * @param {object} dragHandleProps - Props from drag and drop library (optional)
 * @param {boolean} isDragging - Whether component is being dragged (optional)
 * @param {array} tabs - Optional tabs for section header
 * @param {array} actions - Optional action buttons for section header
 * @param {function} onTabChange - Optional tab change handler
 * @param {boolean} useSectionHeader - Use PageSectionHeader instead of CardHeader
 */
export function PageContainer({ 
  title = 'Container Title',
  description,
  containerBackground = 'var(--color-card)',
  titleBackground,
  dragHandleProps,
  isDragging,
  tabs,
  actions,
  onTabChange,
  useSectionHeader = false,
  children 
}) {
  return (
    <Card 
      className={cn(
        "relative overflow-hidden transition-shadow",
        isDragging && "shadow-lg ring-2 ring-primary/50"
      )}
      style={{ backgroundColor: containerBackground }}
    >
      {title && !useSectionHeader && (
        <CardHeader 
          className="relative flex flex-row items-center gap-2"
          style={{ 
            backgroundColor: titleBackground || 'transparent',
            zIndex: titleBackground ? 10 : 'auto'
          }}
        >
          {dragHandleProps && (
            <div 
              {...dragHandleProps}
              className="cursor-grab active:cursor-grabbing opacity-50 hover:opacity-100 transition-opacity"
            >
              <GripVertical className="h-5 w-5" />
            </div>
          )}
          <div className="flex-1">
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
        </CardHeader>
      )}
      {title && useSectionHeader && (
        <div className="p-6 pb-0">
          <PageSectionHeader
            title={title}
            tabs={tabs}
            actions={actions}
            onTabChange={onTabChange}
          />
        </div>
      )}
      <CardContent className="relative" style={{ zIndex: 1 }}>
        {children}
      </CardContent>
    </Card>
  );
}