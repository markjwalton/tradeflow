/**
 * LivePreviewNavigation - Navigation component for LivePreview page
 * 
 * Uses NavigationDataProvider for standardized data fetching.
 * Renders hierarchical navigation with playground item matching.
 */

import React from "react";
import { Badge } from "@/components/ui/badge";
import { 
  Layout, Zap, ChevronRight, ChevronDown, Folder, FolderOpen 
} from "lucide-react";
import { NavigationDataProvider, useNavigation } from "@/components/navigation/NavigationDataProvider";

/**
 * LivePreviewNavigation
 * 
 * Props:
 * - playgroundItems: array - Playground items to match against nav
 * - selectedItemId: string - Currently selected item ID
 * - onSelectItem: function - Callback when item selected
 * - fallbackPages: array - Fallback page items if no config
 * - fallbackFeatures: object - Fallback features grouped by category
 */
export function LivePreviewNavigation({
  playgroundItems = [],
  selectedItemId,
  onSelectItem,
  fallbackPages = [],
  fallbackFeatures = {}
}) {
  return (
    <NavigationDataProvider
      source="config"
      configType="live_pages_source"
      defaultExpanded={false}
      maxDepth={3}
    >
      <LivePreviewNavContent
        playgroundItems={playgroundItems}
        selectedItemId={selectedItemId}
        onSelectItem={onSelectItem}
        fallbackPages={fallbackPages}
        fallbackFeatures={fallbackFeatures}
      />
    </NavigationDataProvider>
  );
}

// Inner component that uses the navigation context
function LivePreviewNavContent({
  playgroundItems,
  selectedItemId,
  onSelectItem,
  fallbackPages,
  fallbackFeatures
}) {
  const { 
    items: navItems, 
    flatList,
    isLoading,
    toggleExpanded,
    isExpanded,
    hasChildren,
    getItemChildren
  } = useNavigation();

  // Helper to find playground item by name
  const findPlaygroundItem = (name) => {
    if (!name) return null;
    if (name.startsWith("feature:")) {
      const featureName = name.replace("feature:", "");
      return playgroundItems.find(p => p.source_type === "feature" && p.source_name === featureName) ||
             playgroundItems.find(p => p.source_type === "feature" && p.source_name?.toLowerCase() === featureName.toLowerCase());
    }
    return playgroundItems.find(p => p.source_type === "page" && p.source_name === name) ||
           playgroundItems.find(p => p.source_type === "page" && p.source_name?.toLowerCase() === name.toLowerCase());
  };

  // Recursive nav renderer
  const renderNavItems = (items, depth = 0) => {
    return items.map((navItem) => {
      const isFolder = navItem.item_type === "folder";
      const folderId = navItem._id || navItem.slug;
      const children = getItemChildren(folderId);
      const itemHasChildren = children.length > 0;
      const itemExpanded = isExpanded(folderId);
      const isFeature = navItem.slug?.startsWith("feature:");
      
      const playgroundItem = !isFolder ? findPlaygroundItem(navItem.slug || navItem.name) : null;
      const isSelected = playgroundItem && selectedItemId === playgroundItem.id;

      if (isFolder) {
        return (
          <div key={folderId}>
            <button
              onClick={() => toggleExpanded(folderId)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              {itemHasChildren ? (
                itemExpanded ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronRight className="h-4 w-4 text-slate-400" />
              ) : (
                <div className="w-4" />
              )}
              {itemExpanded ? <FolderOpen className="h-4 w-4 text-amber-400" /> : <Folder className="h-4 w-4 text-amber-400" />}
              <span className="flex-1 text-left">{navItem.name}</span>
            </button>
            {itemExpanded && itemHasChildren && (
              <div>{renderNavItems(children, depth + 1)}</div>
            )}
          </div>
        );
      }

      const isChild = depth > 0;
      return (
        <button
          key={navItem._id || navItem.slug}
          onClick={() => playgroundItem && onSelectItem(playgroundItem.id)}
          className={`w-full flex items-center gap-2 px-3 rounded-lg transition-colors truncate ${
            isChild ? "py-1.5 text-xs" : "py-2 text-sm"
          } ${
            isSelected
              ? "bg-slate-700 text-white"
              : playgroundItem
                ? "text-slate-300 hover:bg-slate-800 hover:text-white cursor-pointer"
                : "text-slate-500 hover:bg-slate-800/50 hover:text-slate-400 cursor-pointer"
          }`}
          title={!playgroundItem ? "Not synced to playground yet" : undefined}
        >
          {!isChild && (isFeature ? <Zap className="h-4 w-4 flex-shrink-0" /> : <Layout className="h-4 w-4 flex-shrink-0" />)}
          <span className="truncate">{navItem.name}</span>
          {!playgroundItem && <span className="text-xs text-slate-600">•</span>}
        </button>
      );
    });
  };

  // Get top-level items
  const getTopLevelItems = () => {
    return navItems
      .filter(item => !item.parent_id && item.is_visible !== false)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  };

  const statusColors = {
    passed: "text-green-600",
    failed: "text-red-600",
    pending: "text-gray-400",
  };

  // Use configured nav or fallback
  if (navItems.length > 0) {
    return renderNavItems(getTopLevelItems(), 0);
  }

  // Fallback rendering
  return (
    <>
      {/* Pages Section */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wide">
          <Layout className="h-3 w-3" />
          Pages
        </div>
        {fallbackPages.map(item => (
          <button
            key={item.id}
            onClick={() => onSelectItem(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm ${
              selectedItemId === item.id 
                ? "bg-slate-700 text-white" 
                : "text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <Layout className="h-4 w-4" />
            <span className="flex-1 text-left truncate">{item.source_name}</span>
            <span className={statusColors[item.test_status || "pending"]}>●</span>
          </button>
        ))}
        {fallbackPages.length === 0 && (
          <p className="text-xs text-slate-500 px-3 py-2">No pages synced</p>
        )}
      </div>

      {/* Features Section */}
      <div>
        <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wide">
          <Zap className="h-3 w-3" />
          Features
        </div>
        {Object.entries(fallbackFeatures).map(([category, items]) => (
          <FallbackFeatureCategory
            key={category}
            category={category}
            items={items}
            selectedItemId={selectedItemId}
            onSelectItem={onSelectItem}
            statusColors={statusColors}
          />
        ))}
        {Object.keys(fallbackFeatures).length === 0 && (
          <p className="text-xs text-slate-500 px-3 py-2">No features synced</p>
        )}
      </div>
    </>
  );
}

// Fallback feature category with local expand state
function FallbackFeatureCategory({ category, items, selectedItemId, onSelectItem, statusColors }) {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
      >
        {expanded ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronRight className="h-4 w-4 text-slate-400" />}
        {expanded ? <FolderOpen className="h-4 w-4 text-amber-400" /> : <Folder className="h-4 w-4 text-amber-400" />}
        <span className="flex-1 text-left font-medium">{category}</span>
        <Badge className="bg-slate-700 text-slate-300 text-xs">{items.length}</Badge>
      </button>
      {expanded && (
        <div className="ml-4 pl-3 border-l border-slate-700 space-y-1 mt-1">
          {items.map(item => (
            <button
              key={item.id}
              onClick={() => onSelectItem(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                selectedItemId === item.id 
                  ? "bg-slate-700 text-white" 
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Zap className="h-3 w-3" />
              <span className="flex-1 text-left truncate">{item.source_name}</span>
              <span className={statusColors[item.test_status || "pending"]}>●</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default LivePreviewNavigation;