import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Layout, Zap, Database, Edit, Eye, ChevronRight, Loader2, 
  FlaskConical, CheckCircle2, XCircle, Circle, Settings
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import PagePreview from "@/components/library/PagePreview";

const statusIcons = {
  passed: <CheckCircle2 className="h-3 w-3 text-green-600" />,
  failed: <XCircle className="h-3 w-3 text-red-600" />,
  pending: <Circle className="h-3 w-3 text-gray-400" />,
};

export default function LivePreview() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const itemId = urlParams.get("id");

  const [selectedItemId, setSelectedItemId] = useState(itemId || null);

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

  const { data: testDataSets = [] } = useQuery({
    queryKey: ["testData"],
    queryFn: () => base44.entities.TestData.list(),
  });

  // Get pages and features
  const pageItems = playgroundItems.filter(item => item.source_type === "page");
  const featureItems = playgroundItems.filter(item => item.source_type === "feature");

  // Selected item details
  const selectedItem = selectedItemId ? playgroundItems.find(p => p.id === selectedItemId) : null;
  const selectedTemplate = selectedItem?.source_type === "page" 
    ? pageTemplates.find(t => t.id === selectedItem.source_id)
    : featureTemplates.find(t => t.id === selectedItem?.source_id);
  const templateData = selectedItem?.working_data || selectedTemplate;
  const itemTestData = testDataSets.find(td => td.playground_item_id === selectedItemId);

  const getDetailUrl = (item) => {
    if (item.source_type === "page") return createPageUrl("PlaygroundPage") + `?id=${item.id}`;
    if (item.source_type === "feature") return createPageUrl("PlaygroundFeature") + `?id=${item.id}`;
    return "#";
  };

  // Get user stories for pages/features
  const getUserStories = () => {
    if (!templateData) return [];
    // Features have user_stories directly
    if (selectedItem?.source_type === "feature" && templateData.user_stories) {
      return templateData.user_stories;
    }
    // Pages might have features that have user stories
    if (selectedItem?.source_type === "page" && templateData.features) {
      return templateData.features.map(f => `As a user, I can ${f.toLowerCase()}`);
    }
    return [];
  };

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
      <aside className="w-72 bg-white border-r flex flex-col">
        <div className="p-4 border-b">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <Eye className="h-5 w-5 text-blue-600" />
            Live Preview
          </h2>
          <p className="text-xs text-gray-500 mt-1">Click to preview pages & features</p>
        </div>

        <ScrollArea className="flex-1">
          {/* Pages Section */}
          <div className="p-3">
            <div className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700">
              <Layout className="h-4 w-4 text-blue-600" />
              Pages ({pageItems.length})
            </div>
            <div className="space-y-1">
              {pageItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => setSelectedItemId(item.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between transition-colors ${
                    selectedItemId === item.id 
                      ? "bg-blue-100 text-blue-800" 
                      : "hover:bg-gray-100"
                  }`}
                >
                  <span className="truncate">{item.source_name}</span>
                  <div className="flex items-center gap-1">
                    {statusIcons[item.test_status || "pending"]}
                  </div>
                </button>
              ))}
              {pageItems.length === 0 && (
                <p className="text-xs text-gray-400 px-3 py-2">No pages synced</p>
              )}
            </div>
          </div>

          {/* Features Section */}
          <div className="p-3 border-t">
            <div className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700">
              <Zap className="h-4 w-4 text-amber-600" />
              Features ({featureItems.length})
            </div>
            <div className="space-y-1">
              {featureItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => setSelectedItemId(item.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between transition-colors ${
                    selectedItemId === item.id 
                      ? "bg-amber-100 text-amber-800" 
                      : "hover:bg-gray-100"
                  }`}
                >
                  <span className="truncate">{item.source_name}</span>
                  <div className="flex items-center gap-1">
                    {statusIcons[item.test_status || "pending"]}
                  </div>
                </button>
              ))}
              {featureItems.length === 0 && (
                <p className="text-xs text-gray-400 px-3 py-2">No features synced</p>
              )}
            </div>
          </div>
        </ScrollArea>

        {/* Bottom Actions */}
        <div className="p-3 border-t space-y-2">
          <Link to={createPageUrl("TestDataManager")}>
            <Button variant="outline" size="sm" className="w-full">
              <Settings className="h-4 w-4 mr-2" />
              Manage Test Data
            </Button>
          </Link>
          <Link to={createPageUrl("PlaygroundSummary")}>
            <Button variant="outline" size="sm" className="w-full">
              <FlaskConical className="h-4 w-4 mr-2" />
              Back to Playground
            </Button>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 bg-gray-100 overflow-auto">
        {!selectedItem ? (
          <div className="h-full flex items-center justify-center text-gray-500">
            <div className="text-center">
              <Eye className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg">Select a page or feature to preview</p>
              <p className="text-sm mt-1">Use the navigation on the left</p>
            </div>
          </div>
        ) : (
          <div className="p-6">
            {/* Header Bar */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {selectedItem.source_type === "page" ? (
                  <Layout className="h-6 w-6 text-blue-600" />
                ) : (
                  <Zap className="h-6 w-6 text-amber-600" />
                )}
                <div>
                  <h1 className="text-xl font-bold">{selectedItem.source_name}</h1>
                  <p className="text-sm text-gray-500">{templateData?.description}</p>
                </div>
                <Badge variant="outline">v{selectedItem.current_version || 1}</Badge>
                {statusIcons[selectedItem.test_status || "pending"]}
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

            <div className="grid grid-cols-3 gap-6">
              {/* Live Preview - 2 columns */}
              <div className="col-span-2">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Live Preview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedItem.source_type === "page" && templateData && (
                      <PagePreview page={templateData} />
                    )}

                    {selectedItem.source_type === "feature" && templateData && (
                      <div className="bg-slate-100 rounded-lg p-4 border">
                        <div className="bg-white rounded-lg shadow-sm p-6">
                          <div className="flex items-center gap-3 mb-4">
                            <Zap className="h-8 w-8 text-amber-500" />
                            <div>
                              <h3 className="font-bold text-lg">{templateData.name}</h3>
                              <Badge variant="outline">{templateData.complexity || "medium"}</Badge>
                            </div>
                          </div>
                          
                          {templateData.entities_used?.length > 0 && (
                            <div className="mb-4">
                              <h4 className="text-sm font-medium mb-2">Entities Used</h4>
                              <div className="flex flex-wrap gap-2">
                                {templateData.entities_used.map((e, i) => (
                                  <Badge key={i} variant="secondary">
                                    <Database className="h-3 w-3 mr-1" />
                                    {e}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {templateData.triggers?.length > 0 && (
                            <div className="mb-4">
                              <h4 className="text-sm font-medium mb-2">Triggers</h4>
                              <div className="flex flex-wrap gap-2">
                                {templateData.triggers.map((t, i) => (
                                  <Badge key={i} variant="outline">{t}</Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {templateData.requirements?.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium mb-2">Requirements</h4>
                              <ul className="space-y-1 text-sm text-gray-600">
                                {templateData.requirements.map((req, i) => (
                                  <li key={i} className="flex items-start gap-2">
                                    <ChevronRight className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                    {req}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Test Data Card */}
                {itemTestData && (
                  <Card className="mt-6">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Database className="h-5 w-5 text-blue-600" />
                        Test Data: {itemTestData.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-auto max-h-48">
                        {JSON.stringify(itemTestData.entity_data, null, 2)}
                      </pre>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* User Stories Sidebar */}
              <div className="col-span-1">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">User Stories</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {getUserStories().length > 0 ? (
                      <ul className="space-y-3">
                        {getUserStories().map((story, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
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

                {/* Item Details */}
                <Card className="mt-4">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Type</span>
                      <Badge variant="outline">{selectedItem.source_type}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Category</span>
                      <span>{templateData?.category || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Group</span>
                      <span>{selectedItem.group || templateData?.group || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Status</span>
                      <Badge className={
                        selectedItem.status === "ready" ? "bg-green-100 text-green-800" :
                        selectedItem.status === "modified" ? "bg-blue-100 text-blue-800" :
                        "bg-gray-100 text-gray-800"
                      }>{selectedItem.status}</Badge>
                    </div>
                    {selectedItem.source_type === "page" && templateData?.layout && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Layout</span>
                        <span>{templateData.layout}</span>
                      </div>
                    )}
                    {selectedItem.source_type === "feature" && templateData?.complexity && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Complexity</span>
                        <span>{templateData.complexity}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Actions/Features List */}
                {selectedItem.source_type === "page" && templateData?.actions?.length > 0 && (
                  <Card className="mt-4">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Available Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {templateData.actions.map((action, i) => (
                          <Badge key={i} variant="secondary">{action}</Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}