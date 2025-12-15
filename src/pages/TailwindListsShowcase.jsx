import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { PageHeader } from '@/components/sturij/PageHeader';
import { ShowcaseSection } from '@/components/showcase/ShowcaseSection';
import { ChevronLeft, ChevronRight, ArrowLeft, ArrowRight, ChevronDown, User, Building, Users, CreditCard, Home, Folder, Calendar as CalendarIcon, FileText, BarChart3, Check, CheckCircle2, Search, FolderPlus, Hash, Tag, Globe, Frown, AlertTriangle, LifeBuoy, PenSquare, Code, Image, Video, Table, X, MoreVertical, Heart, Plus, Link2, HelpCircle, Archive, Copy, Share2, Trash2, UserPlus, LogOut, Bell } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge, StatusBadge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose } from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';

const sampleItems = [
  { id: 1, title: 'First item', description: 'Sample content for demonstration' },
  { id: 2, title: 'Second item', description: 'Sample content for demonstration' },
  { id: 3, title: 'Third item', description: 'Sample content for demonstration' },
];

export default function TailwindListsShowcase() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="List Layouts"
        description="Tailwind UI list patterns converted to use design tokens for consistent styling."
      >
        <Link to={createPageUrl('TailwindShowcaseGallery')}>
          <Button variant="outline" size="sm">← Back to Gallery</Button>
        </Link>
      </PageHeader>

      <ShowcaseSection title="Basic List Layouts" defaultOpen={true}>
        <div className="space-y-8">
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Simple Divided List</h3>
            <ul role="list" className="divide-y divide-border">
              {sampleItems.map((item) => (
                <li key={item.id} className="px-4 py-4 sm:px-0">
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium">Bordered Container List</h3>
            <div className="overflow-hidden rounded-xl border border-border bg-card">
              <ul role="list" className="divide-y divide-border">
                {sampleItems.map((item) => (
                  <li key={item.id} className="px-6 py-4">
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </ShowcaseSection>

      <ShowcaseSection title="Collapsible Sidebar Navigation" defaultOpen={false}>
        <CollapsibleSidebarExample />
      </ShowcaseSection>
    </div>
  );
}

function CollapsibleSidebarExample() {
  const [teamsOpen, setTeamsOpen] = useState(false);
  const [projectsOpen, setProjectsOpen] = useState(false);

  return (
    <div className="relative flex grow flex-col gap-y-5 overflow-y-auto border-r border-border bg-card px-6 h-[600px] rounded-xl">
      <div className="relative flex h-16 shrink-0 items-center">
        <div className="h-8 w-8 rounded bg-primary" />
      </div>
      <nav className="relative flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" className="-mx-2 space-y-1">
              <li>
                <a href="#" className="bg-accent group flex gap-x-3 rounded-md p-2 text-sm font-semibold text-foreground">
                  <Home aria-hidden="true" className="text-muted-foreground h-6 w-6 shrink-0" />
                  Dashboard
                </a>
              </li>
              <li>
                <Collapsible open={teamsOpen} onOpenChange={setTeamsOpen}>
                  <CollapsibleTrigger className="hover:bg-accent group flex w-full items-center gap-x-3 rounded-md p-2 text-left text-sm font-semibold text-foreground">
                    <Users aria-hidden="true" className="text-muted-foreground h-6 w-6 shrink-0" />
                    Teams
                    <ChevronRight aria-hidden="true" className="ml-auto h-5 w-5 shrink-0 text-muted-foreground data-[state=open]:rotate-90 data-[state=open]:text-foreground" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-1 px-2">
                    <ul role="list" className="space-y-1">
                      <li>
                        <a href="#" className="hover:bg-accent block rounded-md py-2 pr-2 pl-9 text-sm text-foreground">
                          Engineering
                        </a>
                      </li>
                      <li>
                        <a href="#" className="hover:bg-accent block rounded-md py-2 pr-2 pl-9 text-sm text-foreground">
                          Human Resources
                        </a>
                      </li>
                    </ul>
                  </CollapsibleContent>
                </Collapsible>
              </li>
              <li>
                <Collapsible open={projectsOpen} onOpenChange={setProjectsOpen}>
                  <CollapsibleTrigger className="hover:bg-accent group flex w-full items-center gap-x-3 rounded-md p-2 text-left text-sm font-semibold text-foreground">
                    <Folder aria-hidden="true" className="text-muted-foreground h-6 w-6 shrink-0" />
                    Projects
                    <ChevronRight aria-hidden="true" className="ml-auto h-5 w-5 shrink-0 text-muted-foreground data-[state=open]:rotate-90 data-[state=open]:text-foreground" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-1 px-2">
                    <ul role="list" className="space-y-1">
                      <li>
                        <a href="#" className="hover:bg-accent block rounded-md py-2 pr-2 pl-9 text-sm text-foreground">
                          GraphQL API
                        </a>
                      </li>
                      <li>
                        <a href="#" className="hover:bg-accent block rounded-md py-2 pr-2 pl-9 text-sm text-foreground">
                          iOS App
                        </a>
                      </li>
                    </ul>
                  </CollapsibleContent>
                </Collapsible>
              </li>
            </ul>
          </li>
          <li className="-mx-6 mt-auto">
            <a href="#" className="flex items-center gap-x-4 px-6 py-3 text-sm font-semibold text-foreground hover:bg-accent">
              <Avatar className="h-8 w-8">
                <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=256&h=256&fit=crop" />
                <AvatarFallback>TC</AvatarFallback>
              </Avatar>
              <span aria-hidden="true">Tom Cook</span>
            </a>
          </li>
        </ul>
      </nav>
    </div>
  );
}