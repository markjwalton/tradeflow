import { useState } from 'react';
import CarouselLoop from '../components/motion-plus/CarouselLoop';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

export default function MotionPlusDemo() {
  const [customItems] = useState([
    {
      title: 'Project Management',
      description: 'Track and manage all your projects in one place with powerful tools',
      imageSrc: null,
    },
    {
      title: 'Team Collaboration',
      description: 'Work together seamlessly with real-time updates and notifications',
      imageSrc: null,
    },
    {
      title: 'Analytics Dashboard',
      description: 'Get insights into your workflow with comprehensive analytics',
      imageSrc: null,
    },
    {
      title: 'Resource Planning',
      description: 'Optimize your resources and schedule with intelligent planning',
      imageSrc: null,
    },
    {
      title: 'Client Portal',
      description: 'Keep clients informed with a dedicated portal and updates',
      imageSrc: null,
    },
  ]);

  return (
    <div className="container mx-auto p-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="page-header-title">Motion+ Components Demo</h1>
        <p className="text-muted-foreground text-lg">
          Exploring Motion+ animation components integrated with TradeFlow design system
        </p>
      </div>

      {/* Carousel Demos */}
      <Tabs defaultValue="default" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="default">Default</TabsTrigger>
          <TabsTrigger value="custom">Custom Items</TabsTrigger>
          <TabsTrigger value="fullwidth">Full Width</TabsTrigger>
        </TabsList>

        <TabsContent value="default" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Default Carousel Loop</CardTitle>
              <CardDescription>
                Basic carousel with default items and infinite loop enabled
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CarouselLoop className="max-w-4xl mx-auto" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Custom Items Carousel</CardTitle>
              <CardDescription>
                Carousel populated with custom content items
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CarouselLoop 
                items={customItems} 
                className="max-w-4xl mx-auto"
                renderItem={(item) => (
                  <Card className="h-full flex flex-col">
                    <CardHeader>
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </CardContent>
                  </Card>
                )}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fullwidth" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Full Width Carousel</CardTitle>
              <CardDescription>
                Carousel spanning the full container width
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              <CarouselLoop className="w-full" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Features Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Infinite Loop</CardTitle>
            <CardDescription>
              Seamless infinite scrolling in both directions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              The carousel automatically wraps around, creating a continuous loop experience
              for users browsing through content.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Accessible Navigation</CardTitle>
            <CardDescription>
              Keyboard and screen reader friendly
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Full ARIA labels, keyboard navigation support, and semantic HTML structure for
              maximum accessibility.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Design System Integration</CardTitle>
            <CardDescription>
              Uses your existing design tokens
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Integrated with TradeFlow's color palette, typography, spacing, and component
              library for consistency.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Usage Example */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Example</CardTitle>
          <CardDescription>
            How to implement the Carousel Loop in your components
          </CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
            <code className="text-sm">{`import CarouselLoop from '@/components/motion-plus/CarouselLoop';

// Basic usage with default items
<CarouselLoop className="max-w-4xl mx-auto" />

// With custom items
const items = [
  {
    title: 'Custom Title',
    description: 'Custom description text',
    imageSrc: '/path/to/image.jpg', // optional
  },
  // ... more items
];

<CarouselLoop items={items} />`}</code>
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}