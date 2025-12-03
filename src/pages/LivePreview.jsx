import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Layout, Zap, Database, Edit, Eye, ChevronRight, ChevronDown, Loader2, 
  FlaskConical, CheckCircle2, ArrowLeft, Folder, FolderOpen
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

// Dynamic page renderer based on template
import LivePageRenderer from "@/components/playground/LivePageRenderer";

const statusColors = {
  passed: "text-green-600",
  failed: "text-red-600",
  pending: "text-gray-400",
};

export default function LivePreview() {
  const urlParams = new URLSearchParams(window.location.search);
  const itemId = urlParams.get("id");

  const [selectedItemId, setSelectedItemId] = useState(itemId || null);
  const [expandedFolders, setExpandedFolders] = useState(new Set());

  const { data: playgroundItems = [], isLoading } = useQuery({
    queryKey: ["playgroundItems"],
    queryFn: () => base44.entities.PlaygroundItem.list("-created_date"),
  });

  const { data: pageTemplates = [] } = useQuery({
    queryKey: ["pageTemplates"],
    queryFn: () => base44.entities.PageTemplate.list(),
  });

  const { data: featureTemplates = [] } = useQuery({
    queryKey: ["featureTemplates"],
    queryFn: () => base44.entities.FeatureTemplate.list(),
  });

  const { data: entityTemplates = [] } = useQuery({
    queryKey: ["entityTemplates"],
    queryFn: () => base44.entities.EntityTemplate.list(),
  });

  const { data: testDataSets = [] } = useQuery({
    queryKey: ["testData"],
    queryFn: () => base44.entities.TestData.list(),
  });

  // Fetch navigation config for live pages
  const { data: navConfigs = [] } = useQuery({
    queryKey: ["navConfig", "live_pages_source"],
    queryFn: () => base44.entities.NavigationConfig.filter({ config_type: "live_pages_source" }),
  });

  const navItems = navConfigs[0]?.items || [];

  // Build navigation structure from config
  const pageItems = playgroundItems.filter(item => item.source_type === "page");
  const featureItems = playgroundItems.filter(item => item.source_type === "feature");

  // Helper to find playground item by name
  const findPlaygroundItem = (name) => {
    // Check if it's a feature (prefixed with "feature:")
    if (name.startsWith("feature:")) {
      const featureName = name.replace("feature:", "");
      return playgroundItems.find(p => p.source_type === "feature" && p.source_name === featureName);
    }
    return playgroundItems.find(p => p.source_type === "page" && p.source_name === name);
  };

  // Build hierarchical nav from config
  const getNavItemsByParent = (parentId) => {
    return navItems
      .filter(item => (item.parent_id || null) === parentId && item.is_visible !== false)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  };

  const topLevelNavItems = getNavItemsByParent(null);

  // Fallback: Group features by category if no nav config
  const featuresByCategory = featureItems.reduce((acc, item) => {
    const template = featureTemplates.find(t => t.id === item.source_id);
    const category = item.group || template?.category || "Other";
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {});

  // Selected item details
  const selectedItem = selectedItemId ? playgroundItems.find(p => p.id === selectedItemId) : null;
  const selectedTemplate = selectedItem?.source_type === "page" 
    ? pageTemplates.find(t => t.id === selectedItem.source_id)
    : featureTemplates.find(t => t.id === selectedItem?.source_id);
  const templateData = selectedItem?.working_data || selectedTemplate;
  const itemTestData = testDataSets.find(td => td.playground_item_id === selectedItemId);

  // Get entities for the selected item
  const getEntitiesForItem = () => {
    if (!templateData) return [];
    const entityNames = templateData.entities_used || [];
    return entityNames.map(name => {
      const entity = entityTemplates.find(e => e.name === name);
      return entity || { name, schema: { properties: {} } };
    });
  };

  const getDetailUrl = (item) => {
    if (item.source_type === "page") return createPageUrl("PlaygroundPage") + `?id=${item.id}`;
    if (item.source_type === "feature") return createPageUrl("PlaygroundFeature") + `?id=${item.id}`;
    return "#";
  };

  // Get user stories
  const getUserStories = () => {
    if (!templateData) return [];
    if (selectedItem?.source_type === "feature" && templateData.user_stories) {
      return templateData.user_stories;
    }
    if (selectedItem?.source_type === "page" && templateData.features) {
      return templateData.features.map(f => `As a user, I can ${f.toLowerCase()}`);
    }
    return [];
  };

  const toggleFolder = (category) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  };

  // Start with folders collapsed
  // No auto-expand - folders start closed

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Get children of a nav item
  const getNavChildren = (parentId) => {
    return navItems
      .filter(item => (item.parent_id === parentId) && item.is_visible !== false)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  };

  // Get top-level items
  const getTopLevelItems = () => {
    return navItems
      .filter(item => !item.parent_id && item.is_visible !== false)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  };

  // Recursive nav renderer - matches Layout.js styling exactly
  const renderNavItems = (items, depth = 0) => {
    return items.map((navItem) => {
      const isFolder = navItem.item_type === "folder";
      const folderId = navItem._id || navItem.slug;
      const children = getNavChildren(folderId);
      const hasChildren = children.length > 0;
      const isExpanded = expandedFolders.has(folderId);
      const isFeature = navItem.slug?.startsWith("feature:");
      
      // For pages/features, find the corresponding playground item
      const playgroundItem = !isFolder ? findPlaygroundItem(navItem.slug || navItem.name) : null;
      const isSelected = playgroundItem && selectedItemId === playgroundItem.id;

      if (isFolder) {
        return (
          <div key={folderId}>
            <button
              onClick={() => toggleFolder(folderId)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-slate-300 hover:bg-slate-800 hover:text-white"
              style={{ paddingLeft: depth * 12 + 12 }}
            >
              {hasChildren ? (
                isExpanded ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronRight className="h-4 w-4 text-slate-400" />
              ) : (
                <div className="w-4" />
              )}
              {isExpanded ? <FolderOpen className="h-4 w-4 text-amber-400" /> : <Folder className="h-4 w-4 text-amber-400" />}
              <span className="flex-1 text-left">{navItem.name}</span>
            </button>
            {isExpanded && hasChildren && (
              <div className="border-l border-slate-700 ml-5">
                {renderNavItems(children, depth + 1)}
              </div>
            )}
          </div>
        );
      }

      // Page or feature item
      return (
        <button
          key={navItem._id || navItem.slug}
          onClick={() => playgroundItem && setSelectedItemId(playgroundItem.id)}
          disabled={!playgroundItem}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
            isSelected
              ? "bg-slate-700 text-white"
              : playgroundItem
                ? "text-slate-300 hover:bg-slate-800 hover:text-white"
                : "text-slate-500 cursor-not-allowed"
          }`}
          style={{ paddingLeft: depth * 12 + 12 }}
        >
          {isFeature ? <Zap className="h-4 w-4" /> : <Layout className="h-4 w-4" />}
          {navItem.name}
        </button>
      );
    });
  };

  return (
    <div className="flex h-[calc(100vh-56px)]">
      {/* Left Navigation Panel - Dark sidebar matching main layout */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-700">
          <h1 className="text-lg font-bold flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Live Preview
          </h1>
          <p className="text-xs text-slate-400">Preview pages & features</p>
        </div>

        {/* Back Button */}
        <div className="p-3 border-b border-slate-700">
          <Link to={createPageUrl("PlaygroundSummary")}>
            <Button variant="outline" size="sm" className="w-full justify-start bg-slate-800 border-slate-600 text-white hover:bg-slate-700 hover:text-white">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Playground
            </Button>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {navItems.length > 0 ? (
              // Use configured navigation structure - matches Layout.js exactly
              renderNavItems(getTopLevelItems(), 0)
            ) : (
              // Fallback: Show pages and features separately
              <>
                {/* Pages Section */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                    <Layout className="h-3 w-3" />
                    Pages
                  </div>
                  {pageItems.map(item => (
                    <button
                      key={item.id}
                      onClick={() => setSelectedItemId(item.id)}
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
                  {pageItems.length === 0 && (
                    <p className="text-xs text-slate-500 px-3 py-2">No pages synced</p>
                  )}
                </div>

                {/* Features Section - Grouped by Category */}
                <div>
                  <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                    <Zap className="h-3 w-3" />
                    Features
                  </div>
                  {Object.entries(featuresByCategory).map(([category, items]) => (
                    <div key={category}>
                      <button
                        onClick={() => toggleFolder(category)}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                      >
                        {expandedFolders.has(category) ? (
                          <ChevronDown className="h-4 w-4 text-slate-400" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-slate-400" />
                        )}
                        {expandedFolders.has(category) ? (
                          <FolderOpen className="h-4 w-4 text-amber-400" />
                        ) : (
                          <Folder className="h-4 w-4 text-amber-400" />
                        )}
                        <span className="flex-1 text-left font-medium">{category}</span>
                        <Badge className="bg-slate-700 text-slate-300 text-xs">
                          {items.length}
                        </Badge>
                      </button>
                      {expandedFolders.has(category) && (
                        <div className="ml-4 pl-3 border-l border-slate-700 space-y-1 mt-1">
                          {items.map(item => (
                            <button
                              key={item.id}
                              onClick={() => setSelectedItemId(item.id)}
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
                  ))}
                  {Object.keys(featuresByCategory).length === 0 && (
                    <p className="text-xs text-slate-500 px-3 py-2">No features synced</p>
                  )}
                </div>
              </>
            )}
        </nav>

        {/* Bottom Actions */}
        <div className="p-3 border-t border-slate-700">
          <Link to={createPageUrl("TestDataManager")}>
            <Button variant="outline" size="sm" className="w-full bg-slate-800 border-slate-600 text-white hover:bg-slate-700 hover:text-white">
              <Database className="h-4 w-4 mr-2" />
              Manage Test Data
            </Button>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 bg-gray-50 overflow-auto flex flex-col">
        {!selectedItem ? (
          <div className="h-full flex items-center justify-center text-gray-500">
            <div className="text-center">
              <Eye className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg">Select a page or feature</p>
              <p className="text-sm mt-1">Use the navigation on the left</p>
            </div>
          </div>
        ) : (
          <>
            {/* Header Bar */}
            <div className="bg-white border-b px-4 py-3 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                {selectedItem.source_type === "page" ? (
                  <Layout className="h-5 w-5 text-blue-600" />
                ) : (
                  <Zap className="h-5 w-5 text-amber-600" />
                )}
                <div>
                  <h1 className="font-bold">{selectedItem.source_name}</h1>
                  <p className="text-xs text-gray-500">{templateData?.description}</p>
                </div>
                <Badge variant="outline">v{selectedItem.current_version || 1}</Badge>
              </div>
              <div className="flex gap-2">
                <Link to={createPageUrl("TestDataManager") + `?item=${selectedItem.id}`}>
                  <Button variant="outline" size="sm">
                    <Database className="h-4 w-4 mr-2" />
                    Test Data
                  </Button>
                </Link>
                <Link to={getDetailUrl(selectedItem)}>
                  <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit in Playground
                  </Button>
                </Link>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-auto p-6">
              <div className="grid grid-cols-4 gap-6">
                {/* Live Page Preview - 3 columns */}
                <div className="col-span-3">
                  <Card className="h-full">
                    <CardHeader className="pb-2 border-b">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        Live Page
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <LivePageRenderer 
                        item={selectedItem}
                        template={templateData}
                        testData={itemTestData?.entity_data}
                        entities={getEntitiesForItem()}
                      />
                    </CardContent>
                  </Card>
                </div>

                {/* Sidebar - User Stories & Details */}
                <div className="col-span-1 space-y-4">
                  {/* User Stories */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">User Stories</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {getUserStories().length > 0 ? (
                        <ul className="space-y-2 text-sm">
                          {getUserStories().map((story, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span>{story}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-500 text-sm">No user stories defined</p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Details */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Type</span>
                        <Badge variant="outline">{selectedItem.source_type}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Status</span>
                        <Badge className={
                          selectedItem.test_status === "passed" ? "bg-green-100 text-green-800" :
                          selectedItem.test_status === "failed" ? "bg-red-100 text-red-800" :
                          "bg-gray-100 text-gray-800"
                        }>{selectedItem.test_status || "pending"}</Badge>
                      </div>
                      {templateData?.category && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Category</span>
                          <span>{templateData.category}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Entities Used */}
                  {getEntitiesForItem().length > 0 && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Entities</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-1">
                          {getEntitiesForItem().map((e, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              <Database className="h-3 w-3 mr-1" />
                              {e.name}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}