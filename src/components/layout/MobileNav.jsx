import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { X, ChevronDown, ChevronRight, Folder, FolderOpen, Home, LogOut, Settings, User } from "lucide-react";
import { createPageUrl } from "@/utils";
import { getIconByName } from "@/components/navigation/NavIconMap";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { base44 } from "@/api/base44Client";

export function MobileNav({ isOpen, onClose, navItems = [], user }) {
  const location = useLocation();
  const [expandedFolders, setExpandedFolders] = useState(new Set());

  // Build hierarchical structure from flat navItems
  const buildHierarchy = (items) => {
    if (!items || items.length === 0) return [];
    
    const normalizedItems = items.map(item => {
      const itemId = item.id || item._id;
      return {
        ...item,
        id: itemId,
        _id: itemId,
        parent_id: item.parent_id || null,
        children: []
      };
    });
    
    const itemsMap = new Map();
    normalizedItems.forEach((item) => {
      itemsMap.set(item.id, item);
    });
    
    const rootItems = [];
    normalizedItems.forEach((item) => {
      if (item.parent_id && itemsMap.has(item.parent_id)) {
        const parent = itemsMap.get(item.parent_id);
        parent.children.push(item);
      } else {
        rootItems.push(item);
      }
    });
    
    rootItems.sort((a, b) => (a.order || 0) - (b.order || 0));
    rootItems.forEach(item => {
      if (item.children && item.children.length > 0) {
        item.children.sort((a, b) => (a.order || 0) - (b.order || 0));
      }
    });
    
    return rootItems;
  };

  const hierarchicalNavItems = buildHierarchy(navItems);

  const toggleFolder = (folderId, event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(folderId)) next.delete(folderId);
      else next.add(folderId);
      return next;
    });
  };

  const getIcon = (iconName) => {
    return getIconByName(iconName, Home);
  };

  const handleLinkClick = () => {
    onClose();
  };

  const handleLogout = () => {
    const tenantAccessUrl = createPageUrl("TenantAccess");
    base44.auth.logout(window.location.origin + tenantAccessUrl);
  };

  const userInitials = user?.full_name
    ? user.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : user?.email?.substring(0, 2).toUpperCase() || "U";

  const renderNavItem = (item, isChild = false) => {
    const isFolder = item.item_type === "folder";
    const Icon = getIcon(item.icon);
    const isExpanded = expandedFolders.has(item.id);
    const iconSize = item.icon_size || 20;
    const iconStrokeWidth = item.icon_stroke_width || 1.5;

    const pageUrl = item.page_url || "";
    const currentPath = location.pathname.split("/").pop();
    const itemPath = pageUrl.split("?")[0];
    const isActive = currentPath === itemPath;

    if (isFolder) {
      const hasChildren = item.children && item.children.length > 0;
      const FolderIcon = item.icon ? getIcon(item.icon) : (isExpanded ? FolderOpen : Folder);

      return (
        <div key={item.id}>
          <button
            onClick={(e) => toggleFolder(item.id, e)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted touch-target",
              isChild && "pl-8"
            )}
          >
            {hasChildren && (
              isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
            <FolderIcon size={iconSize} strokeWidth={iconStrokeWidth} className="text-accent-500" />
            <span className={cn("flex-1 text-left", !item.parent_id && "font-medium")}>{item.name || 'Unnamed'}</span>
          </button>
          {isExpanded && hasChildren && (
            <div className="bg-muted/50">
              {item.children.map((child) => renderNavItem(child, true))}
            </div>
          )}
        </div>
      );
    }

    const ChildIcon = getIcon(item.icon);
    const pageName = pageUrl.split("?")[0];
    const queryString = pageUrl.includes("?") ? pageUrl.split("?")[1] : "";
    const fullPageUrl = createPageUrl(pageName) + (queryString ? `?${queryString}` : "");

    return (
      <Link
        key={item.id}
        to={fullPageUrl}
        onClick={handleLinkClick}
        className={cn(
          "flex items-center gap-3 px-4 py-3 transition-colors touch-target",
          isChild && "pl-8",
          isActive
            ? "bg-primary text-primary-foreground"
            : "hover:bg-muted"
        )}
      >
        <ChildIcon 
          size={iconSize}
          strokeWidth={iconStrokeWidth}
          className={isActive ? "text-primary-foreground" : "text-primary-500"}
        />
        <span className={cn("truncate", isActive && "font-medium")}>{item.name || 'Unnamed'}</span>
      </Link>
    );
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 md:hidden"
          style={{ zIndex: 'var(--z-modal-backdrop)' }}
          onClick={onClose}
        />
      )}

      {/* Drawer - slides in from LEFT */}
      <div
        className={cn(
          "fixed top-0 left-0 h-full w-[85vw] max-w-80 bg-background transform transition-transform duration-300 ease-in-out md:hidden overflow-hidden shadow-2xl flex flex-col",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
        style={{ zIndex: 'var(--z-modal)' }}
      >
        {/* Header with logo and close */}
        <div className="flex items-center justify-between p-4 border-b shrink-0">
          <img
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69274b9c077e61d7cfe78ec7/c94580ddf_sturij-logo.png"
            alt="Sturij"
            className="h-8"
          />
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors touch-target"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Main Navigation - scrollable */}
        <nav className="flex-1 overflow-y-auto py-2">
          {hierarchicalNavItems.map((item) => renderNavItem(item, false))}
        </nav>

        <Separator />

        {/* Secondary Links */}
        <div className="py-2 shrink-0">
          <Link
            to={createPageUrl("SiteSettings")}
            onClick={handleLinkClick}
            className="flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors touch-target"
          >
            <Settings className="h-5 w-5 text-muted-foreground" />
            <span>Settings</span>
          </Link>
        </div>

        <Separator />

        {/* User Profile Section */}
        {user && (
          <div className="p-4 shrink-0">
            <div className="flex items-center gap-3 mb-3">
              <Avatar className="h-10 w-10">
                <AvatarImage alt={user.full_name || user.email} />
                <AvatarFallback>{userInitials}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{user.full_name || 'User'}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-muted hover:bg-muted/80 rounded-lg transition-colors touch-target"
            >
              <LogOut className="h-4 w-4" />
              <span>Log out</span>
            </button>
          </div>
        )}
      </div>
    </>
  );
}