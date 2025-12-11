import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, AlertCircle, Info, Palette } from "lucide-react";

export default function ThemePreview() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-display">Theme Preview</h1>
        <p className="text-muted-foreground">See your active theme in action</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Typography</CardTitle>
          <CardDescription>Heading and body font styles</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h1 className="text-4xl font-display mb-2">Display Heading</h1>
            <h2 className="text-3xl font-display mb-2">Headline</h2>
            <h3 className="text-2xl font-display mb-2">Title</h3>
            <h4 className="text-xl font-display mb-2">Subtitle</h4>
            <p className="text-base font-body">Body text: The quick brown fox jumps over the lazy dog. This demonstrates the body font family and base text styling.</p>
            <p className="text-sm text-muted-foreground mt-2">Caption text in muted color</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Color Palette</CardTitle>
          <CardDescription>Active theme colors</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-4">
            <div className="space-y-2">
              <div className="h-20 rounded-lg border bg-primary" />
              <p className="text-xs font-mono">Primary</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 rounded-lg border bg-secondary" />
              <p className="text-xs font-mono">Secondary</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 rounded-lg border bg-accent" />
              <p className="text-xs font-mono">Accent</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 rounded-lg border bg-muted" />
              <p className="text-xs font-mono">Muted</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 rounded-lg border bg-destructive" />
              <p className="text-xs font-mono">Destructive</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Buttons</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button>Primary Button</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm">Small</Button>
            <Button>Default</Button>
            <Button size="lg">Large</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Form Elements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Input Field</Label>
            <Input placeholder="Enter some text..." />
          </div>
          <div className="space-y-2">
            <Label>Disabled Input</Label>
            <Input placeholder="Disabled" disabled />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Badges</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="destructive">Destructive</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Alerts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>This is an informational alert message.</AlertDescription>
          </Alert>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>This is a destructive alert message.</AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cards & Sections</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Nested Card</CardTitle>
                <CardDescription>Card within a card</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">Content goes here with proper spacing and typography.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Another Card</CardTitle>
                <CardDescription>Demonstrating consistency</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">All cards maintain the same styling and spacing.</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tabs</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="tab1">
            <TabsList>
              <TabsTrigger value="tab1">Tab One</TabsTrigger>
              <TabsTrigger value="tab2">Tab Two</TabsTrigger>
              <TabsTrigger value="tab3">Tab Three</TabsTrigger>
            </TabsList>
            <TabsContent value="tab1" className="mt-4">
              <p className="text-sm">Content for the first tab</p>
            </TabsContent>
            <TabsContent value="tab2" className="mt-4">
              <p className="text-sm">Content for the second tab</p>
            </TabsContent>
            <TabsContent value="tab3" className="mt-4">
              <p className="text-sm">Content for the third tab</p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}