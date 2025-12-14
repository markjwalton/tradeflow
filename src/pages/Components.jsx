import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Code, 
  Copy, 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  Loader2,
  Search,
  Filter,
  ChevronRight
} from "lucide-react";
import { PageHeader } from "@/components/sturij";

export default function Components() {
  const componentCategories = [
    {
      id: "buttons",
      name: "Buttons",
      components: [
        { name: "Primary Button", code: '<Button>Click me</Button>' },
        { name: "Secondary Button", code: '<Button variant="secondary">Secondary</Button>' },
        { name: "Outline Button", code: '<Button variant="outline">Outline</Button>' },
        { name: "Ghost Button", code: '<Button variant="ghost">Ghost</Button>' },
      ]
    },
    {
      id: "inputs",
      name: "Form Inputs",
      components: [
        { name: "Text Input", code: '<Input placeholder="Enter text..." />' },
        { name: "Label", code: '<Label>Field Label</Label>' },
        { name: "Input with Label", code: '<div><Label>Email</Label><Input type="email" placeholder="email@example.com" /></div>' },
      ]
    },
    {
      id: "badges",
      name: "Badges & Pills",
      components: [
        { name: "Default Badge", code: '<Badge>Default</Badge>' },
        { name: "Success Badge", code: '<Badge variant="success">Success</Badge>' },
        { name: "Warning Badge", code: '<Badge variant="warning">Warning</Badge>' },
        { name: "Destructive Badge", code: '<Badge variant="destructive">Error</Badge>' },
      ]
    },
    {
      id: "icons",
      name: "Icons",
      components: [
        { name: "Check Icon", code: '<CheckCircle2 className="h-5 w-5 text-success" />' },
        { name: "Alert Icon", code: '<AlertCircle className="h-5 w-5 text-warning" />' },
        { name: "Info Icon", code: '<Info className="h-5 w-5 text-info" />' },
        { name: "Loading Icon", code: '<Loader2 className="h-5 w-5 animate-spin" />' },
      ]
    }
  ];

  return (
    <div className="max-w-7xl mx-auto -mt-6 bg-background min-h-screen space-y-6">
      <PageHeader 
        title="Components"
        description="Ready-to-use component patterns with code examples"
      />

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search components..." className="pl-9" />
        </div>
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>

      <Tabs defaultValue="buttons" className="space-y-6">
        <TabsList>
          {componentCategories.map((category) => (
            <TabsTrigger key={category.id} value={category.id}>
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {componentCategories.map((category) => (
          <TabsContent key={category.id} value={category.id} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {category.components.map((component, idx) => (
                <Card key={idx}>
                  <CardHeader>
                    <CardTitle className="text-lg">{component.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-6 bg-muted rounded-lg flex items-center justify-center min-h-[100px]">
                      <div dangerouslySetInnerHTML={{ __html: component.code }} />
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs text-muted-foreground flex items-center gap-2">
                          <Code className="h-3 w-3" />
                          Code
                        </Label>
                        <Button variant="ghost" size="sm" className="h-7 px-2">
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      <pre className="p-3 bg-charcoal-900 text-background-50 rounded-md text-xs overflow-x-auto">
                        <code>{component.code}</code>
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <Card className="bg-primary-50 border-primary-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-primary-600" />
            Component Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>All components use design tokens for consistency across the system.</p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>Copy code snippets directly into your pages</li>
            <li>Customize using design token classes</li>
            <li>Test components in the live preview</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}