import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Layout, Zap, Database, Edit, Eye, ChevronRight, ChevronDown, Loader2, 
  FlaskConical, CheckCircle2, XCircle, Circle, Settings, GripVertical,
  Plus, Folder, FolderOpen, Save
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { toast } from "sonner";

// Dynamic page renderer based on template
import LivePageRenderer from "@/components/playground/LivePageRenderer";

const statusColors = {
  passed: "text-green-600",
  failed: "text-red-600",
  pending: "text-gray-400",
};

export default function LivePreview() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const itemId = urlParams.get("id");

  const [selectedItemId, setSelectedItemId] = useState(itemId || null);
  const [expandedFolders, setExpandedFolders] = useState(new Set());
  const [isEditingNav, setIsEditingNav] = useState(false);

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

  // Build navigation structure
  const pageItems = playgroundItems.filter(item => item.source_type === "page");
  const featureItems = playgroundItems.filter(item => item.source_type === "feature");

  // Group features by category
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

  // Auto-expand all folders on load
  useEffect(() => {
    setExpandedFolders(new Set(Object.keys(featuresByCategory)));
  }, [featureTemplates.length]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen flex">
      {/* Left Navigation Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-4 border-b border-slate-700">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Live Preview
          </h2>
        </div>

        <ScrollArea className="flex-1">
          {/* Pages Section */}
          <div className="p-2">
            <div className="flex items-center gap-2 px-2 py-1 text-xs font-semibold text-slate-400 uppercase">
              <Layout className="h-3 w-3" />
              Pages
            </div>
            <div className="space-y-0.5 mt-1">
              {pageItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => setSelectedItemId(item.id)}
                  className={`w-full text-left px-3 py-2 rounded text-sm flex items-center justify-between transition-colors ${
                    selectedItemId === item.id 
                      ? "bg-blue-600 text-white" 
                      : "text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  <span className="truncate">{item.source_name}</span>
                  <span className={statusColors[item.test_status || "pending"]}>●</span>
                </button>
              ))}
              {pageItems.length === 0 && (
                <p className="text-xs text-slate-500 px-3 py-2">No pages synced</p>
              )}
            </div>
          </div>

          {/* Features Section - Grouped by Category */}
          <div className="p-2 border-t border-slate-700">
            <div className="flex items-center gap-2 px-2 py-1 text-xs font-semibold text-slate-400 uppercase">
              <Zap className="h-3 w-3" />
              Features
            </div>
            <div className="mt-1">
              {Object.entries(featuresByCategory).map(([category, items]) => (
                <div key={category}>
                  <button
                    onClick={() => toggleFolder(category)}
                    className="w-full text-left px-3 py-2 rounded text-sm flex items-center gap-2 text-slate-300 hover:bg-slate-800"
                  >
                    {expandedFolders.has(category) ? (
                      <FolderOpen className="h-4 w-4 text-amber-500" />
                    ) : (
                      <Folder className="h-4 w-4 text-amber-500" />
                    )}
                    <span className="flex-1">{category}</span>
                    <Badge variant="secondary" className="text-xs h-5 bg-slate-700">
                      {items.length}
                    </Badge>
                  </button>
                  {expandedFolders.has(category) && (
                    <div className="ml-4 space-y-0.5">
                      {items.map(item => (
                        <button
                          key={item.id}
                          onClick={() => setSelectedItemId(item.id)}
                          className={`w-full text-left px-3 py-1.5 rounded text-sm flex items-center justify-between transition-colors ${
                            selectedItemId === item.id 
                              ? "bg-amber-600 text-white" 
                              : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                          }`}
                        >
                          <span className="truncate">{item.source_name}</span>
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
          </div>
        </ScrollArea>

        {/* Bottom Actions */}
        <div className="p-3 border-t border-slate-700 space-y-2">
          <Link to={createPageUrl("TestDataManager")}>
            <Button variant="outline" size="sm" className="w-full bg-slate-800 border-slate-600 text-slate-200 hover:bg-slate-700">
              <Database className="h-4 w-4 mr-2" />
              Test Data
            </Button>
          </Link>
          <Link to={createPageUrl("PlaygroundSummary")}>
            <Button variant="outline" size="sm" className="w-full bg-slate-800 border-slate-600 text-slate-200 hover:bg-slate-700">
              <FlaskConical className="h-4 w-4 mr-2" />
              Playground
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