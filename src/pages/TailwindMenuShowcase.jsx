import { PageHeader } from '@/components/sturij/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ChevronDown, Edit, Copy, Archive, ArrowRight, UserPlus, Heart, Trash } from 'lucide-react';

function MenuWithIcons() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-x-1.5">
          Options
          <ChevronDown className="-mr-1 h-5 w-5 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-56 divide-y divide-border"
      >
        <div className="py-1">
          <DropdownMenuItem className="group">
            <Edit className="mr-3 h-5 w-5 text-muted-foreground group-hover:text-foreground" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem className="group">
            <Copy className="mr-3 h-5 w-5 text-muted-foreground group-hover:text-foreground" />
            Duplicate
          </DropdownMenuItem>
        </div>
        <div className="py-1">
          <DropdownMenuItem className="group">
            <Archive className="mr-3 h-5 w-5 text-muted-foreground group-hover:text-foreground" />
            Archive
          </DropdownMenuItem>
          <DropdownMenuItem className="group">
            <ArrowRight className="mr-3 h-5 w-5 text-muted-foreground group-hover:text-foreground" />
            Move
          </DropdownMenuItem>
        </div>
        <div className="py-1">
          <DropdownMenuItem className="group">
            <UserPlus className="mr-3 h-5 w-5 text-muted-foreground group-hover:text-foreground" />
            Share
          </DropdownMenuItem>
          <DropdownMenuItem className="group">
            <Heart className="mr-3 h-5 w-5 text-muted-foreground group-hover:text-foreground" />
            Add to favorites
          </DropdownMenuItem>
        </div>
        <div className="py-1">
          <DropdownMenuItem className="group text-destructive focus:text-destructive">
            <Trash className="mr-3 h-5 w-5" />
            Delete
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function SimpleMenu() {
  const handleSignOut = (e) => {
    e.preventDefault();
    console.log('Sign out clicked');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-x-1.5">
          Options
          <ChevronDown className="-mr-1 h-5 w-5 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="py-1">
          <DropdownMenuItem>Account settings</DropdownMenuItem>
          <DropdownMenuItem>Support</DropdownMenuItem>
          <DropdownMenuItem>License</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={handleSignOut}>
            Sign out
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function TailwindMenuShowcase() {
  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <div className="max-w-[1400px] mx-auto pb-6">
        <PageHeader
          title="Tailwind UI Menus (Converted)"
          description="Headless UI Menu → Radix UI DropdownMenu with design tokens"
        />

        <div className="mt-6 space-y-6">
          {/* Conversion Info */}
          <Card style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)' }}>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold mb-2">Conversion Details</h2>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p><strong>From:</strong> Headless UI Menu</p>
                    <p><strong>To:</strong> Radix UI DropdownMenu</p>
                    <p><strong>Colors:</strong> All hardcoded values replaced with CSS variables</p>
                    <p><strong>Icons:</strong> Heroicons → Lucide React</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Menu with Icons */}
          <Card style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)' }}>
            <CardHeader>
              <CardTitle>Menu with Icons and Sections</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <MenuWithIcons />
                <p className="text-sm text-muted-foreground">
                  Grouped menu items with icons and visual separators
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Simple Menu */}
          <Card style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)' }}>
            <CardHeader>
              <CardTitle>Simple Menu</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <SimpleMenu />
                <p className="text-sm text-muted-foreground">
                  Basic text menu items without icons
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Color Mapping */}
          <Card style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)' }}>
            <CardHeader>
              <CardTitle>Color Token Mapping</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 text-sm">
                <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <code className="text-xs">bg-white</code>
                  <span className="text-muted-foreground">→</span>
                  <code className="text-xs">bg-popover</code>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <code className="text-xs">text-gray-900</code>
                  <span className="text-muted-foreground">→</span>
                  <code className="text-xs">text-foreground</code>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <code className="text-xs">text-gray-700</code>
                  <span className="text-muted-foreground">→</span>
                  <code className="text-xs">text-foreground</code>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <code className="text-xs">text-gray-400</code>
                  <span className="text-muted-foreground">→</span>
                  <code className="text-xs">text-muted-foreground</code>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <code className="text-xs">data-focus:bg-gray-100</code>
                  <span className="text-muted-foreground">→</span>
                  <code className="text-xs">hover:bg-accent</code>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <code className="text-xs">divide-gray-100</code>
                  <span className="text-muted-foreground">→</span>
                  <code className="text-xs">divide-border</code>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Icon Mapping */}
          <Card style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)' }}>
            <CardHeader>
              <CardTitle>Icon Mapping (Heroicons → Lucide)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 text-sm">
                <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <code className="text-xs">PencilSquareIcon</code>
                  <span className="text-muted-foreground">→</span>
                  <code className="text-xs">Edit</code>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <code className="text-xs">DocumentDuplicateIcon</code>
                  <span className="text-muted-foreground">→</span>
                  <code className="text-xs">Copy</code>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <code className="text-xs">ArchiveBoxIcon</code>
                  <span className="text-muted-foreground">→</span>
                  <code className="text-xs">Archive</code>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <code className="text-xs">ArrowRightCircleIcon</code>
                  <span className="text-muted-foreground">→</span>
                  <code className="text-xs">ArrowRight</code>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <code className="text-xs">ChevronDownIcon</code>
                  <span className="text-muted-foreground">→</span>
                  <code className="text-xs">ChevronDown</code>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <code className="text-xs">TrashIcon</code>
                  <span className="text-muted-foreground">→</span>
                  <code className="text-xs">Trash</code>
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
                  <h3 className="text-sm font-medium mb-2">Menu with Icons</h3>
                  <pre className="text-xs bg-muted p-3 rounded-lg overflow-x-auto">
{`<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline">Options</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent className="w-56 divide-y divide-border">
    <div className="py-1">
      <DropdownMenuItem className="group">
        <Edit className="mr-3 h-5 w-5 text-muted-foreground" />
        Edit
      </DropdownMenuItem>
    </div>
  </DropdownMenuContent>
</DropdownMenu>`}
                  </pre>
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-2">Simple Menu</h3>
                  <pre className="text-xs bg-muted p-3 rounded-lg overflow-x-auto">
{`<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline">Options</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent className="w-56">
    <DropdownMenuItem>Account settings</DropdownMenuItem>
    <DropdownMenuItem>Support</DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem>Sign out</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>`}
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