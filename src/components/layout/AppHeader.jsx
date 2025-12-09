import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Menu, ChevronDown, LogOut, User, Settings as SettingsIcon, Search } from "lucide-react";
import { useAppSidebar } from "./SidebarContext";
import { AppBreadcrumb } from "./AppBreadcrumb";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function AppHeader({ user, navItems = [] }) {
  const { cycleMode } = useAppSidebar();

  return (
    <header
      className="
        sticky top-0 z-40
        border-b
        bg-background/70
        backdrop-blur-md
        supports-[backdrop-filter]:bg-background/60
      "
    >
      <div className="flex items-center justify-between px-4 py-2 md:px-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="mr-1"
            onClick={cycleMode}
          >
            <Menu className="w-5 h-5" />
          </Button>

          <Link to={createPageUrl("Dashboard")} className="flex items-center gap-2">
            <img
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69274b9c077e61d7cfe78ec7/c94580ddf_sturij-logo.png"
              alt="Sturij"
              className="w-auto"
              style={{ height: '51px' }}
            />
          </Link>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <PageSearchBar navItems={navItems} />
          <ProfileMenu user={user} />
        </div>
      </div>
    </header>
  );
}

function PageSearchBar({ navItems = [] }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  // Flatten all pages from nav structure
  const getAllPages = (items, category = "") => {
    let pages = [];
    items.forEach(item => {
      if (item.item_type === "folder") {
        if (item.children) {
          pages = pages.concat(getAllPages(item.children, item.name));
        }
      } else {
        pages.push({
          name: item.name,
          slug: item.page_url?.split("?")[0] || "",
          category: category || "Pages",
          icon: item.icon
        });
      }
    });
    return pages;
  };

  const allPages = getAllPages(navItems);

  // Group pages by category
  const categorizedPages = allPages.reduce((acc, page) => {
    if (!acc[page.category]) {
      acc[page.category] = [];
    }
    acc[page.category].push(page);
    return acc;
  }, {});

  const handleSelect = (slug) => {
    setOpen(false);
    setSearch("");
    navigate(createPageUrl(slug));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between text-muted-foreground"
        >
          <Search className="mr-2 h-4 w-4" />
          <span className="text-xs">Search pages...</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="end">
        <Command>
          <CommandInput 
            placeholder="Search pages..." 
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>No pages found.</CommandEmpty>
            {Object.entries(categorizedPages).map(([category, pages]) => (
              <CommandGroup key={category} heading={category}>
                {pages.map((page) => (
                  <CommandItem
                    key={page.slug}
                    onSelect={() => handleSelect(page.slug)}
                  >
                    {page.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function ProfileMenu({ user }) {
  if (!user) return null;

  const [preferences, setPreferences] = useState({
    showAIAssistant: true,
    showPageEditor: true,
    showEditorBubble: true,
    liveEditMode: false,
  });

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (currentUser?.ui_preferences) {
          setPreferences({
            showAIAssistant: currentUser.ui_preferences.showAIAssistant ?? true,
            showPageEditor: currentUser.ui_preferences.showPageEditor ?? true,
            showEditorBubble: currentUser.ui_preferences.showEditorBubble ?? true,
            liveEditMode: currentUser.ui_preferences.liveEditMode ?? false,
          });
        }
      } catch (e) {
        console.error("Failed to load preferences:", e);
      }
    };
    loadPreferences();
  }, []);

  const updatePreference = async (key, value) => {
    const newPrefs = { ...preferences, [key]: value };
    setPreferences(newPrefs);
    
    try {
      await base44.auth.updateMe({
        ui_preferences: newPrefs,
      });
      window.dispatchEvent(new CustomEvent('ui-preferences-changed', { detail: newPrefs }));
    } catch (e) {
      console.error("Failed to save preferences:", e);
    }
  };

  const initials = user.full_name
    ? user.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : user.email?.substring(0, 2).toUpperCase() || "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-2 px-2 py-1 h-9"
        >
          <Avatar className="h-7 w-7">
            <AvatarImage alt={user.full_name || user.email} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="hidden sm:flex flex-col items-start">
            <span className="text-xs font-medium leading-tight">
              {user.full_name || user.email}
            </span>
            <span className="text-[10px] text-muted-foreground leading-tight">
              {user.email}
            </span>
          </div>
          <ChevronDown className="w-3 h-3 ml-1 hidden sm:inline" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel>{user.full_name || user.email}</DropdownMenuLabel>
        <DropdownMenuItem disabled className="text-[11px]">
          {user.email}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <div className="px-2 py-3 space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="ai-assistant" className="text-sm cursor-pointer">
              AI Assistant
            </Label>
            <Switch
              id="ai-assistant"
              checked={preferences.showAIAssistant}
              onCheckedChange={(checked) => updatePreference('showAIAssistant', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="page-editor" className="text-sm cursor-pointer">
              Page Editor
            </Label>
            <Switch
              id="page-editor"
              checked={preferences.showPageEditor}
              onCheckedChange={(checked) => updatePreference('showPageEditor', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="editor-bubble" className="text-sm cursor-pointer">
              Editor Bubble
            </Label>
            <Switch
              id="editor-bubble"
              checked={preferences.showEditorBubble}
              onCheckedChange={(checked) => updatePreference('showEditorBubble', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="live-edit" className="text-sm cursor-pointer">
              Live Edit Mode
            </Label>
            <Switch
              id="live-edit"
              checked={preferences.liveEditMode}
              onCheckedChange={(checked) => updatePreference('liveEditMode', checked)}
            />
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to={createPageUrl("SiteSettings")} className="flex items-center">
            <SettingsIcon className="w-4 h-4 mr-2" />
            Site Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            const tenantAccessUrl = createPageUrl("TenantAccess");
            base44.auth.logout(window.location.origin + tenantAccessUrl);
          }}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}