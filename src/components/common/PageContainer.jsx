import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

/**
 * PageContainer - A reusable container component with optional title and description
 * 
 * @param {string} title - Container title (editable in page properties)
 * @param {string} description - Optional container description (editable in page properties)
 * @param {string} containerBackground - Background color for the entire container
 * @param {string} titleBackground - Optional background color for title area (higher z-index)
 * @param {ReactNode} children - Content to render inside the container
 */
export function PageContainer({ 
  title = 'Container Title',
  description,
  containerBackground = 'var(--color-card)',
  titleBackground,
  children 
}) {
  return (
    <Card 
      className="relative overflow-hidden"
      style={{ backgroundColor: containerBackground }}
    >
      {title && (
        <CardHeader 
          className="relative"
          style={{ 
            backgroundColor: titleBackground || 'transparent',
            zIndex: titleBackground ? 10 : 'auto'
          }}
        >
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent className="relative" style={{ zIndex: 1 }}>
        {children}
      </CardContent>
    </Card>
  );
}