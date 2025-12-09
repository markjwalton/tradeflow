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
import { Menu, ChevronDown, LogOut, User, Settings as SettingsIcon } from "lucide-react";
import { useAppSidebar } from "./SidebarContext";
import { AppBreadcrumb } from "./AppBreadcrumb";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

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
              src="https://framerusercontent.com/images/XKDSOBYkjTdAvMPFrNk5WIrHI.png"
              alt="Sturij"
              className="h-6 w-auto"
            />
          </Link>
        </div>

        <div className="flex-1 flex items-center px-4">
          <AppBreadcrumb organizedNavigation={navItems} />
        </div>

        <div className="flex items-center gap-2">
          <ProfileMenu user={user} />
        </div>
      </div>
    </header>
  );
}

function ProfileMenu({ user }) {
  if (!user) return null;

  const [preferences, setPreferences] = React.useState({
    showAIAssistant: true,
    showPageEditor: true,
  });

  React.useEffect(() => {
    const loadPreferences = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (currentUser?.ui_preferences) {
          setPreferences({
            showAIAssistant: currentUser.ui_preferences.showAIAssistant ?? true,
            showPageEditor: currentUser.ui_preferences.showPageEditor ?? true,
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
        </div>
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