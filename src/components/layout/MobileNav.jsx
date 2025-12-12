import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { X, ChevronDown, ChevronRight, Folder, FolderOpen, Home } from "lucide-react";
import { createPageUrl } from "@/utils";
import { getIconByName } from "@/components/navigation/NavIconMap";
import { cn } from "@/lib/utils";

export function MobileNav({ isOpen, onClose, navItems = [] }) {
  const location = useLocation();
  const [expandedFolders, setExpandedFolders] = useState(new Set());

  const toggleFolder = (folderId) => {
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

  const renderNavItem = (item, isChild = false) => {
    const isFolder = item.item_type === "folder";
    const Icon = getIcon(item.icon);
    const isExpanded = expandedFolders.has(item.id);
    const iconSize = item.icon_size || 20;
    const iconStrokeWidth = item.icon_stroke_width || 2;

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
            onClick={() => toggleFolder(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted",
              isChild && "pl-8"
            )}
          >
            {hasChildren && (
              isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
            <FolderIcon size={iconSize} strokeWidth={iconStrokeWidth} style={{ color: 'var(--secondary-400)' }} />
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
          "flex items-center gap-3 px-4 py-3 transition-colors min-h-[44px]",
          isChild && "pl-8",
          isActive
            ? "bg-primary text-primary-foreground"
            : "hover:bg-muted"
        )}
      >
        <ChildIcon 
          size={iconSize}
          strokeWidth={iconStrokeWidth}
          style={{ color: isActive ? 'var(--primary-foreground)' : 'var(--primary-500)' }}
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
          className="fixed inset-0 bg-black/50 z-50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={cn(
          "fixed top-0 left-0 h-full w-80 bg-background z-50 transform transition-transform duration-300 ease-in-out lg:hidden overflow-y-auto",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-semibold text-lg">Navigation</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav Items */}
        <nav className="py-2">
          {navItems.map((item) => renderNavItem(item, false))}
        </nav>
      </div>
    </>
  );
}