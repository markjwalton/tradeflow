import React from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  LayoutDashboard,
  RefreshCw,
  Settings,
  ChevronDown,
  Menu,
  Sparkles,
  HelpCircle,
  Keyboard,
} from "lucide-react";

// Mock header component
function AppHeader() {
  const user = {
    name: "John Doe",
    email: "john@example.com",
    initials: "JD",
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-background/70 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-between px-4 py-2 md:px-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-[var(--color-primary)]" />
            <span className="hidden sm:inline text-sm font-semibold tracking-tight">
              Sturij Admin Console
            </span>
          </div>

          <Button variant="outline" size="sm" className="ml-2 hidden md:inline-flex">
            <LayoutDashboard className="w-4 h-4 mr-2" />
            <span>Dashboard</span>
            <ChevronDown className="w-3 h-3 ml-1" />
          </Button>
        </div>

        <div className="flex-1 flex justify-center" />

        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="hidden md:inline-flex">
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" className="hidden md:inline-flex">
            <Settings className="w-4 h-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-2 py-1 h-9">
                <Avatar className="h-7 w-7">
                  <AvatarFallback>{user.initials}</AvatarFallback>
                </Avatar>
                <div className="hidden sm:flex flex-col items-start">
                  <span className="text-xs font-medium leading-tight">{user.name}</span>
                  <span className="text-[10px] text-muted-foreground leading-tight">{user.email}</span>
                </div>
                <ChevronDown className="w-3 h-3 ml-1 hidden sm:inline" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Profile</DropdownMenuLabel>
              <DropdownMenuItem>View profile</DropdownMenuItem>
              <DropdownMenuItem>Notification preferences</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

// Mock sidebar
function AppSidebar() {
  return (
    <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:h-full bg-card border-r">
      <div className="p-4 space-y-2">
        <div className="flex items-center gap-2 p-2 rounded-lg bg-[var(--color-primary)]/10">
          <LayoutDashboard className="h-4 w-4" />
          <span className="text-sm font-medium">Dashboard</span>
        </div>
        <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted">
          <Menu className="h-4 w-4" />
          <span className="text-sm">Projects</span>
        </div>
        <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted">
          <Menu className="h-4 w-4" />
          <span className="text-sm">Tasks</span>
        </div>
      </div>
    </aside>
  );
}

// Mock footer
function AppFooter() {
  const context = {
    client: "OakFrameCo",
    env: "Production",
    version: "v2.1.0",
  };

  return (
    <footer className="border-t bg-background/80 backdrop-blur-sm text-xs">
      <div className="flex items-center justify-between px-4 py-2 md:px-6">
        <div className="flex items-center gap-3 text-muted-foreground">
          <span>Client: {context.client}</span>
          <span className="hidden sm:inline">• Env: {context.env}</span>
          <span className="hidden md:inline">• {context.version}</span>
        </div>

        <div className="hidden md:flex items-center gap-2 text-muted-foreground">
          <span>Last sync: 3 min ago</span>
          <span>•</span>
          <span>AI suggestions enabled</span>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <HelpCircle className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="hidden sm:inline-flex">
            <Keyboard className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="outline">
            <Sparkles className="w-4 h-4 mr-1" />
            Trade-Flow AI
          </Button>
        </div>
      </div>
    </footer>
  );
}

// Main AppShell wrapper
export default function AppShellPreview({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-muted/40">
      <AppHeader />
      <div className="flex flex-1 overflow-hidden">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <main className="flex-1 overflow-y-auto">
            <div className="px-4 py-6 md:px-8 md:py-8">{children}</div>
          </main>
          <AppFooter />
        </div>
      </div>
    </div>
  );
}