import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, ExternalLink, Copy, CheckCircle2, Box,
  ChevronDown, ChevronRight 
} from "lucide-react";
import { toast } from "sonner";

// Comprehensive shadcn/ui component reference
const SHADCN_COMPONENTS = {
  form: {
    name: "Form Components",
    components: [
      {
        name: "Button",
        import: `import { Button } from "@/components/ui/button"`,
        description: "Interactive button with multiple variants for actions",
        props: [
          { name: "variant", type: "string", default: "default", options: "default | destructive | outline | secondary | ghost | link" },
          { name: "size", type: "string", default: "default", options: "default | sm | lg | icon" },
          { name: "asChild", type: "boolean", default: "false", description: "Merge props onto child element" },
          { name: "disabled", type: "boolean", default: "false" }
        ],
        examples: [
          { title: "Basic", code: `<Button>Click me</Button>` },
          { title: "Variants", code: `<Button variant="outline">Outline</Button>\n<Button variant="destructive">Delete</Button>\n<Button variant="ghost">Ghost</Button>` },
          { title: "With Icon", code: `<Button><Plus className="h-4 w-4 mr-2" />Add Item</Button>` },
          { title: "Loading", code: `<Button disabled><Loader2 className="h-4 w-4 mr-2 animate-spin" />Loading</Button>` },
          { title: "Sturij Styled", code: `<Button className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)]">Primary</Button>` }
        ],
        accessibility: "Supports keyboard navigation, focus states, and aria attributes"
      },
      {
        name: "Input",
        import: `import { Input } from "@/components/ui/input"`,
        description: "Text input field for forms",
        props: [
          { name: "type", type: "string", default: "text", options: "text | email | password | number | search | tel | url" },
          { name: "placeholder", type: "string" },
          { name: "disabled", type: "boolean", default: "false" },
          { name: "className", type: "string" }
        ],
        examples: [
          { title: "Basic", code: `<Input placeholder="Enter your name..." />` },
          { title: "With Label", code: `<div className="space-y-2">\n  <Label htmlFor="email">Email</Label>\n  <Input id="email" type="email" />\n</div>` },
          { title: "With Icon", code: `<div className="relative">\n  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" />\n  <Input className="pl-10" placeholder="Search..." />\n</div>` }
        ],
        accessibility: "Connect with Label using htmlFor/id for screen readers"
      },
      {
        name: "Textarea",
        import: `import { Textarea } from "@/components/ui/textarea"`,
        description: "Multi-line text input",
        props: [
          { name: "rows", type: "number", default: "3" },
          { name: "placeholder", type: "string" },
          { name: "disabled", type: "boolean" }
        ],
        examples: [
          { title: "Basic", code: `<Textarea placeholder="Write your message..." rows={4} />` }
        ]
      },
      {
        name: "Select",
        import: `import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"`,
        description: "Dropdown select with customizable options",
        props: [
          { name: "value", type: "string", description: "Controlled value" },
          { name: "onValueChange", type: "function", description: "(value) => void" },
          { name: "defaultValue", type: "string" },
          { name: "disabled", type: "boolean" }
        ],
        examples: [
          { title: "Basic", code: `<Select>\n  <SelectTrigger>\n    <SelectValue placeholder="Select option" />\n  </SelectTrigger>\n  <SelectContent>\n    <SelectItem value="1">Option 1</SelectItem>\n    <SelectItem value="2">Option 2</SelectItem>\n  </SelectContent>\n</Select>` },
          { title: "Controlled", code: `const [value, setValue] = useState("")\n\n<Select value={value} onValueChange={setValue}>\n  <SelectTrigger>\n    <SelectValue />\n  </SelectTrigger>\n  <SelectContent>\n    <SelectItem value="active">Active</SelectItem>\n    <SelectItem value="inactive">Inactive</SelectItem>\n  </SelectContent>\n</Select>` }
        ],
        accessibility: "Full keyboard navigation with arrow keys"
      },
      {
        name: "Checkbox",
        import: `import { Checkbox } from "@/components/ui/checkbox"`,
        description: "Toggle checkbox for boolean values",
        props: [
          { name: "checked", type: "boolean" },
          { name: "onCheckedChange", type: "function" },
          { name: "disabled", type: "boolean" }
        ],
        examples: [
          { title: "With Label", code: `<div className="flex items-center space-x-2">\n  <Checkbox id="terms" />\n  <Label htmlFor="terms">Accept terms</Label>\n</div>` }
        ]
      },
      {
        name: "Switch",
        import: `import { Switch } from "@/components/ui/switch"`,
        description: "Toggle switch for on/off states",
        props: [
          { name: "checked", type: "boolean" },
          { name: "onCheckedChange", type: "function" },
          { name: "disabled", type: "boolean" }
        ],
        examples: [
          { title: "Basic", code: `<div className="flex items-center space-x-2">\n  <Switch id="notifications" />\n  <Label htmlFor="notifications">Enable notifications</Label>\n</div>` }
        ]
      },
      {
        name: "Label",
        import: `import { Label } from "@/components/ui/label"`,
        description: "Accessible label for form elements",
        props: [
          { name: "htmlFor", type: "string", description: "ID of the form element" }
        ],
        examples: [
          { title: "Basic", code: `<Label htmlFor="name">Name</Label>\n<Input id="name" />` }
        ]
      },
      {
        name: "Slider",
        import: `import { Slider } from "@/components/ui/slider"`,
        description: "Range slider for numeric values",
        props: [
          { name: "value", type: "number[]" },
          { name: "onValueChange", type: "function" },
          { name: "min", type: "number", default: "0" },
          { name: "max", type: "number", default: "100" },
          { name: "step", type: "number", default: "1" }
        ],
        examples: [
          { title: "Basic", code: `<Slider defaultValue={[50]} max={100} step={1} />` }
        ]
      }
    ]
  },
  layout: {
    name: "Layout Components",
    components: [
      {
        name: "Card",
        import: `import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"`,
        description: "Container for related content with header, content, and footer sections",
        props: [
          { name: "className", type: "string", description: "Additional CSS classes" }
        ],
        examples: [
          { title: "Basic", code: `<Card>\n  <CardHeader>\n    <CardTitle>Card Title</CardTitle>\n    <CardDescription>Card description</CardDescription>\n  </CardHeader>\n  <CardContent>\n    <p>Card content goes here</p>\n  </CardContent>\n  <CardFooter>\n    <Button>Action</Button>\n  </CardFooter>\n</Card>` },
          { title: "Sturij Styled", code: `<Card className="border-[var(--color-background-muted)]">\n  <CardHeader>\n    <CardTitle className="text-[var(--color-midnight)]">Title</CardTitle>\n  </CardHeader>\n  <CardContent>Content</CardContent>\n</Card>` }
        ]
      },
      {
        name: "Tabs",
        import: `import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"`,
        description: "Tabbed interface for organizing content",
        props: [
          { name: "value", type: "string", description: "Controlled active tab" },
          { name: "onValueChange", type: "function" },
          { name: "defaultValue", type: "string" }
        ],
        examples: [
          { title: "Basic", code: `<Tabs defaultValue="tab1">\n  <TabsList>\n    <TabsTrigger value="tab1">Tab 1</TabsTrigger>\n    <TabsTrigger value="tab2">Tab 2</TabsTrigger>\n  </TabsList>\n  <TabsContent value="tab1">Content 1</TabsContent>\n  <TabsContent value="tab2">Content 2</TabsContent>\n</Tabs>` },
          { title: "With Icons", code: `<Tabs defaultValue="overview">\n  <TabsList>\n    <TabsTrigger value="overview" className="gap-1">\n      <Home className="h-4 w-4" />\n      Overview\n    </TabsTrigger>\n  </TabsList>\n</Tabs>` }
        ]
      },
      {
        name: "ScrollArea",
        import: `import { ScrollArea } from "@/components/ui/scroll-area"`,
        description: "Custom scrollable container with styled scrollbars",
        props: [
          { name: "className", type: "string" }
        ],
        examples: [
          { title: "Basic", code: `<ScrollArea className="h-72 w-full rounded-md border p-4">\n  {/* Long content here */}\n</ScrollArea>` }
        ]
      },
      {
        name: "Separator",
        import: `import { Separator } from "@/components/ui/separator"`,
        description: "Visual divider between content sections",
        props: [
          { name: "orientation", type: "string", default: "horizontal", options: "horizontal | vertical" }
        ],
        examples: [
          { title: "Basic", code: `<Separator className="my-4" />` }
        ]
      },
      {
        name: "Accordion",
        import: `import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"`,
        description: "Collapsible content sections",
        props: [
          { name: "type", type: "string", default: "single", options: "single | multiple" },
          { name: "collapsible", type: "boolean", default: "false" }
        ],
        examples: [
          { title: "Basic", code: `<Accordion type="single" collapsible>\n  <AccordionItem value="item-1">\n    <AccordionTrigger>Section 1</AccordionTrigger>\n    <AccordionContent>Content 1</AccordionContent>\n  </AccordionItem>\n</Accordion>` }
        ]
      }
    ]
  },
  feedback: {
    name: "Feedback Components",
    components: [
      {
        name: "Badge",
        import: `import { Badge } from "@/components/ui/badge"`,
        description: "Small status indicator or label",
        props: [
          { name: "variant", type: "string", default: "default", options: "default | secondary | destructive | outline" }
        ],
        examples: [
          { title: "Variants", code: `<Badge>Default</Badge>\n<Badge variant="secondary">Secondary</Badge>\n<Badge variant="destructive">Error</Badge>\n<Badge variant="outline">Outline</Badge>` },
          { title: "Sturij Status", code: `<Badge className="bg-[var(--color-success)]/20 text-[var(--color-success)]">Active</Badge>\n<Badge className="bg-[var(--color-warning)]/20 text-[var(--color-warning)]">Pending</Badge>` }
        ]
      },
      {
        name: "Progress",
        import: `import { Progress } from "@/components/ui/progress"`,
        description: "Progress bar indicator",
        props: [
          { name: "value", type: "number", description: "Progress value 0-100" },
          { name: "className", type: "string" }
        ],
        examples: [
          { title: "Basic", code: `<Progress value={66} />` },
          { title: "With Label", code: `<div className="space-y-2">\n  <div className="flex justify-between text-sm">\n    <span>Progress</span>\n    <span>66%</span>\n  </div>\n  <Progress value={66} />\n</div>` }
        ]
      },
      {
        name: "Skeleton",
        import: `import { Skeleton } from "@/components/ui/skeleton"`,
        description: "Loading placeholder animation",
        props: [
          { name: "className", type: "string" }
        ],
        examples: [
          { title: "Card Loading", code: `<div className="space-y-3">\n  <Skeleton className="h-12 w-full" />\n  <Skeleton className="h-4 w-3/4" />\n  <Skeleton className="h-4 w-1/2" />\n</div>` }
        ]
      },
      {
        name: "Alert",
        import: `import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"`,
        description: "Contextual feedback messages",
        props: [
          { name: "variant", type: "string", default: "default", options: "default | destructive" }
        ],
        examples: [
          { title: "Info", code: `<Alert>\n  <Info className="h-4 w-4" />\n  <AlertTitle>Information</AlertTitle>\n  <AlertDescription>This is an info message.</AlertDescription>\n</Alert>` },
          { title: "Error", code: `<Alert variant="destructive">\n  <AlertCircle className="h-4 w-4" />\n  <AlertTitle>Error</AlertTitle>\n  <AlertDescription>Something went wrong.</AlertDescription>\n</Alert>` }
        ]
      },
      {
        name: "Toast (Sonner)",
        import: `import { toast } from "sonner"`,
        description: "Toast notifications for feedback",
        props: [],
        examples: [
          { title: "Types", code: `toast.success("Saved successfully!")\ntoast.error("Failed to save")\ntoast.info("Processing...")\ntoast.warning("Are you sure?")` },
          { title: "With Action", code: `toast("Item deleted", {\n  action: {\n    label: "Undo",\n    onClick: () => handleUndo()\n  }\n})` }
        ]
      }
    ]
  },
  overlay: {
    name: "Overlay Components",
    components: [
      {
        name: "Dialog",
        import: `import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"`,
        description: "Modal dialog for focused interactions",
        props: [
          { name: "open", type: "boolean" },
          { name: "onOpenChange", type: "function" }
        ],
        examples: [
          { title: "Basic", code: `<Dialog>\n  <DialogTrigger asChild>\n    <Button>Open Dialog</Button>\n  </DialogTrigger>\n  <DialogContent>\n    <DialogHeader>\n      <DialogTitle>Dialog Title</DialogTitle>\n      <DialogDescription>Dialog description</DialogDescription>\n    </DialogHeader>\n    <div>Content</div>\n    <DialogFooter>\n      <Button>Save</Button>\n    </DialogFooter>\n  </DialogContent>\n</Dialog>` },
          { title: "Controlled", code: `const [open, setOpen] = useState(false)\n\n<Dialog open={open} onOpenChange={setOpen}>\n  <DialogContent>\n    <DialogHeader>\n      <DialogTitle>Confirm</DialogTitle>\n    </DialogHeader>\n    <DialogFooter>\n      <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>\n      <Button onClick={handleConfirm}>Confirm</Button>\n    </DialogFooter>\n  </DialogContent>\n</Dialog>` }
        ],
        accessibility: "Focus trapped inside dialog, ESC to close"
      },
      {
        name: "Sheet",
        import: `import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"`,
        description: "Slide-out panel from edge of screen",
        props: [
          { name: "side", type: "string", default: "right", options: "top | right | bottom | left" }
        ],
        examples: [
          { title: "Right Sidebar", code: `<Sheet>\n  <SheetTrigger asChild>\n    <Button>Open</Button>\n  </SheetTrigger>\n  <SheetContent>\n    <SheetHeader>\n      <SheetTitle>Settings</SheetTitle>\n    </SheetHeader>\n    <div>Content</div>\n  </SheetContent>\n</Sheet>` }
        ]
      },
      {
        name: "Popover",
        import: `import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"`,
        description: "Floating panel triggered by an element",
        props: [
          { name: "open", type: "boolean" },
          { name: "onOpenChange", type: "function" }
        ],
        examples: [
          { title: "Basic", code: `<Popover>\n  <PopoverTrigger asChild>\n    <Button variant="outline">Open</Button>\n  </PopoverTrigger>\n  <PopoverContent>\n    <p>Popover content</p>\n  </PopoverContent>\n</Popover>` }
        ]
      },
      {
        name: "Tooltip",
        import: `import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"`,
        description: "Contextual information on hover",
        props: [],
        examples: [
          { title: "Basic", code: `<TooltipProvider>\n  <Tooltip>\n    <TooltipTrigger asChild>\n      <Button variant="outline">Hover me</Button>\n    </TooltipTrigger>\n    <TooltipContent>\n      <p>Tooltip text</p>\n    </TooltipContent>\n  </Tooltip>\n</TooltipProvider>` }
        ],
        accessibility: "Wrap app in TooltipProvider once"
      },
      {
        name: "DropdownMenu",
        import: `import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"`,
        description: "Contextual menu triggered by button",
        props: [],
        examples: [
          { title: "Basic", code: `<DropdownMenu>\n  <DropdownMenuTrigger asChild>\n    <Button variant="outline">Menu</Button>\n  </DropdownMenuTrigger>\n  <DropdownMenuContent>\n    <DropdownMenuLabel>Actions</DropdownMenuLabel>\n    <DropdownMenuSeparator />\n    <DropdownMenuItem>Edit</DropdownMenuItem>\n    <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>\n  </DropdownMenuContent>\n</DropdownMenu>` }
        ]
      }
    ]
  },
  data: {
    name: "Data Display",
    components: [
      {
        name: "Table",
        import: `import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"`,
        description: "Data table with header and rows",
        props: [],
        examples: [
          { title: "Basic", code: `<Table>\n  <TableHeader>\n    <TableRow>\n      <TableHead>Name</TableHead>\n      <TableHead>Status</TableHead>\n    </TableRow>\n  </TableHeader>\n  <TableBody>\n    <TableRow>\n      <TableCell>Item 1</TableCell>\n      <TableCell><Badge>Active</Badge></TableCell>\n    </TableRow>\n  </TableBody>\n</Table>` }
        ]
      },
      {
        name: "Avatar",
        import: `import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"`,
        description: "User avatar with image and fallback",
        props: [],
        examples: [
          { title: "Basic", code: `<Avatar>\n  <AvatarImage src="https://..." alt="User" />\n  <AvatarFallback>JD</AvatarFallback>\n</Avatar>` }
        ]
      },
      {
        name: "Calendar",
        import: `import { Calendar } from "@/components/ui/calendar"`,
        description: "Date picker calendar",
        props: [
          { name: "mode", type: "string", default: "single", options: "single | multiple | range" },
          { name: "selected", type: "Date" },
          { name: "onSelect", type: "function" }
        ],
        examples: [
          { title: "Basic", code: `const [date, setDate] = useState<Date>()\n\n<Calendar\n  mode="single"\n  selected={date}\n  onSelect={setDate}\n/>` }
        ]
      }
    ]
  }
};

export default function ShadcnReference() {
  const [search, setSearch] = useState("");
  const [expandedComponents, setExpandedComponents] = useState(new Set(["Button"]));
  const [copiedCode, setCopiedCode] = useState(null);

  const copyCode = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    toast.success("Code copied!");
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const toggleComponent = (name) => {
    setExpandedComponents(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  // Filter components by search
  const filterComponents = (components) => {
    if (!search) return components;
    return components.filter(c => 
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.description?.toLowerCase().includes(search.toLowerCase())
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Box className="h-5 w-5 text-purple-600" />
            shadcn/ui Components Reference
          </CardTitle>
          <Button variant="outline" size="sm" asChild>
            <a href="https://ui.shadcn.com/docs/components" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-3 w-3 mr-1" />
              Full Docs
            </a>
          </Button>
        </div>
        <div className="relative mt-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search components..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-6">
            {Object.entries(SHADCN_COMPONENTS).map(([key, category]) => {
              const filteredComps = filterComponents(category.components);
              if (filteredComps.length === 0) return null;
              
              return (
                <div key={key}>
                  <h3 className="text-sm font-semibold text-purple-800 mb-3 flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-purple-500" />
                    {category.name}
                  </h3>
                  <div className="space-y-2">
                    {filteredComps.map((comp) => {
                      const isExpanded = expandedComponents.has(comp.name);
                      return (
                        <div key={comp.name} className="border rounded-lg overflow-hidden">
                          <button
                            onClick={() => toggleComponent(comp.name)}
                            className="w-full px-4 py-3 flex items-center justify-between bg-purple-50 hover:bg-purple-100 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                              <span className="font-medium text-purple-900">{comp.name}</span>
                              <span className="text-sm text-purple-600">{comp.description}</span>
                            </div>
                          </button>
                          
                          {isExpanded && (
                            <div className="p-4 bg-white space-y-4">
                              {/* Import */}
                              <div>
                                <p className="text-xs font-medium text-purple-700 mb-1">Import</p>
                                <div className="relative">
                                  <pre className="text-xs bg-gray-900 text-gray-100 p-3 rounded overflow-x-auto">
                                    {comp.import}
                                  </pre>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="absolute top-1 right-1 h-6 w-6 p-0"
                                    onClick={() => copyCode(comp.import, `${comp.name}-import`)}
                                  >
                                    {copiedCode === `${comp.name}-import` ? (
                                      <CheckCircle2 className="h-3 w-3 text-green-500" />
                                    ) : (
                                      <Copy className="h-3 w-3" />
                                    )}
                                  </Button>
                                </div>
                              </div>

                              {/* Props */}
                              {comp.props?.length > 0 && (
                                <div>
                                  <p className="text-xs font-medium text-purple-700 mb-2">Props</p>
                                  <div className="bg-gray-50 rounded-lg overflow-hidden">
                                    <table className="w-full text-xs">
                                      <thead className="bg-gray-100">
                                        <tr>
                                          <th className="px-3 py-2 text-left font-medium">Prop</th>
                                          <th className="px-3 py-2 text-left font-medium">Type</th>
                                          <th className="px-3 py-2 text-left font-medium">Default</th>
                                          <th className="px-3 py-2 text-left font-medium">Options/Description</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {comp.props.map((prop, idx) => (
                                          <tr key={idx} className="border-t border-gray-100">
                                            <td className="px-3 py-2 font-mono text-purple-700">{prop.name}</td>
                                            <td className="px-3 py-2 text-gray-600">{prop.type}</td>
                                            <td className="px-3 py-2 text-gray-500">{prop.default || "-"}</td>
                                            <td className="px-3 py-2 text-gray-600">{prop.options || prop.description || "-"}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              )}

                              {/* Examples */}
                              {comp.examples?.length > 0 && (
                                <div>
                                  <p className="text-xs font-medium text-purple-700 mb-2">Examples</p>
                                  <div className="space-y-3">
                                    {comp.examples.map((example, idx) => (
                                      <div key={idx}>
                                        <p className="text-xs text-gray-600 mb-1">{example.title}</p>
                                        <div className="relative">
                                          <pre className="text-xs bg-gray-900 text-gray-100 p-3 rounded overflow-x-auto">
                                            {example.code}
                                          </pre>
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            className="absolute top-1 right-1 h-6 w-6 p-0"
                                            onClick={() => copyCode(example.code, `${comp.name}-${idx}`)}
                                          >
                                            {copiedCode === `${comp.name}-${idx}` ? (
                                              <CheckCircle2 className="h-3 w-3 text-green-500" />
                                            ) : (
                                              <Copy className="h-3 w-3" />
                                            )}
                                          </Button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Accessibility */}
                              {comp.accessibility && (
                                <div className="p-2 bg-blue-50 rounded-lg">
                                  <p className="text-xs text-blue-800">
                                    <strong>Accessibility:</strong> {comp.accessibility}
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}