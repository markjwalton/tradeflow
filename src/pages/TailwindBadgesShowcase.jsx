import { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { PageHeader } from '@/components/sturij/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge, DismissibleBadge, StatusBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function TailwindBadgesShowcase() {
  const [dismissedBadges, setDismissedBadges] = useState({});

  const handleDismiss = (id) => {
    setDismissedBadges(prev => ({ ...prev, [id]: true }));
    toast.success('Badge removed');
  };

  const resetBadges = () => {
    setDismissedBadges({});
    toast.info('Badges reset');
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <div className="max-w-[1400px] mx-auto pb-6">
        <PageHeader
          title="Tailwind UI Badges (Converted)"
          description="Badge components with design tokens and Lucide icons"
        >
          <Link to={createPageUrl('TailwindShowcaseGallery')}>
            <Button variant="outline" size="sm">← Back to Gallery</Button>
          </Link>
        </PageHeader>

        <div className="mt-6 space-y-6">
          {/* Conversion Info */}
          <Card style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)' }}>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold mb-2">Conversion Details</h2>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p><strong>Component Type:</strong> Pure styled spans (no Radix needed)</p>
                    <p><strong>Colors:</strong> All hardcoded values replaced with design tokens</p>
                    <p><strong>Icons:</strong> SVG → Lucide React (X icon)</p>
                    <p><strong>Variants:</strong> Using class-variance-authority</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Basic Badges */}
          <Card style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)' }}>
            <CardHeader>
              <CardTitle>Basic Badges</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Badge variant="default">Default</Badge>
                <Badge variant="destructive">Destructive</Badge>
                <Badge variant="warning">Warning</Badge>
                <Badge variant="success">Success</Badge>
                <Badge variant="info">Info</Badge>
                <Badge variant="accent">Accent</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="outline">Outline</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Dismissible Badges */}
          <Card style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)' }}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Dismissible Badges</CardTitle>
                <button
                  onClick={resetBadges}
                  className="text-xs text-muted-foreground hover:text-foreground underline"
                >
                  Reset All
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {!dismissedBadges.default && (
                  <DismissibleBadge
                    variant="default"
                    onDismiss={() => handleDismiss('default')}
                  >
                    Default
                  </DismissibleBadge>
                )}
                {!dismissedBadges.destructive && (
                  <DismissibleBadge
                    variant="destructive"
                    onDismiss={() => handleDismiss('destructive')}
                  >
                    Destructive
                  </DismissibleBadge>
                )}
                {!dismissedBadges.warning && (
                  <DismissibleBadge
                    variant="warning"
                    onDismiss={() => handleDismiss('warning')}
                  >
                    Warning
                  </DismissibleBadge>
                )}
                {!dismissedBadges.success && (
                  <DismissibleBadge
                    variant="success"
                    onDismiss={() => handleDismiss('success')}
                  >
                    Success
                  </DismissibleBadge>
                )}
                {!dismissedBadges.info && (
                  <DismissibleBadge
                    variant="info"
                    onDismiss={() => handleDismiss('info')}
                  >
                    Info
                  </DismissibleBadge>
                )}
                {!dismissedBadges.accent && (
                  <DismissibleBadge
                    variant="accent"
                    onDismiss={() => handleDismiss('accent')}
                  >
                    Accent
                  </DismissibleBadge>
                )}
                {!dismissedBadges.secondary && (
                  <DismissibleBadge
                    variant="secondary"
                    onDismiss={() => handleDismiss('secondary')}
                  >
                    Secondary
                  </DismissibleBadge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Status Badges with Dots */}
          <Card style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)' }}>
            <CardHeader>
              <CardTitle>Status Badges with Indicators</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <StatusBadge variant="destructive">Offline</StatusBadge>
                <StatusBadge variant="warning">Warning</StatusBadge>
                <StatusBadge variant="success">Active</StatusBadge>
                <StatusBadge variant="info">Processing</StatusBadge>
                <StatusBadge variant="accent">Featured</StatusBadge>
                <StatusBadge variant="default">Pending</StatusBadge>
              </div>
            </CardContent>
          </Card>

          {/* Color Mapping Reference */}
          <Card style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)' }}>
            <CardHeader>
              <CardTitle>Color Token Mapping</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 text-sm">
                <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <code className="text-xs">bg-gray-50</code>
                  <span className="text-muted-foreground">→</span>
                  <code className="text-xs">bg-charcoal-50</code>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <code className="text-xs">bg-red-50</code>
                  <span className="text-muted-foreground">→</span>
                  <code className="text-xs">bg-destructive-50</code>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <code className="text-xs">bg-yellow-50</code>
                  <span className="text-muted-foreground">→</span>
                  <code className="text-xs">bg-secondary-50</code>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <code className="text-xs">bg-green-50</code>
                  <span className="text-muted-foreground">→</span>
                  <code className="text-xs">bg-primary-50</code>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <code className="text-xs">bg-blue-50</code>
                  <span className="text-muted-foreground">→</span>
                  <code className="text-xs">bg-midnight-50</code>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <code className="text-xs">bg-pink-50</code>
                  <span className="text-muted-foreground">→</span>
                  <code className="text-xs">bg-accent-50</code>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Usage Examples */}
          <Card style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)' }}>
            <CardHeader>
              <CardTitle>Usage Examples</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Basic Badge</h3>
                  <pre className="text-xs bg-muted p-3 rounded-lg overflow-x-auto">
{`<Badge variant="success">Active</Badge>`}
                  </pre>
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-2">Dismissible Badge</h3>
                  <pre className="text-xs bg-muted p-3 rounded-lg overflow-x-auto">
{`<DismissibleBadge 
  variant="warning" 
  onDismiss={() => console.log('dismissed')}
>
  Warning
</DismissibleBadge>`}
                  </pre>
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-2">Status Badge</h3>
                  <pre className="text-xs bg-muted p-3 rounded-lg overflow-x-auto">
{`<StatusBadge variant="success">Online</StatusBadge>`}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}