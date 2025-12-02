import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  ArrowLeft, Layout, Zap, Database, Search, Edit, Eye, 
  ChevronRight, Loader2, Settings, FlaskConical
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import PagePreview from "@/components/library/PagePreview";

export default function LivePreview() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const itemId = urlParams.get("id");

  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");

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

  // Get pages and features with preview capability
  const previewableItems = playgroundItems.filter(item => 
    item.source_type === "page" || item.source_type === "feature"
  );

  const filteredItems = previewableItems.filter(item => {
    const matchesSearch = item.source_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || item.source_type === filterType;
    return matchesSearch && matchesType;
  });

  // If viewing a specific item
  const selectedItem = itemId ? playgroundItems.find(p => p.id === itemId) : null;
  const selectedTemplate = selectedItem?.source_type === "page" 
    ? pageTemplates.find(t => t.id === selectedItem.source_id)
    : featureTemplates.find(t => t.id === selectedItem?.source_id);
  const templateData = selectedItem?.working_data || selectedTemplate;
  const itemTestData = testDataSets.find(td => td.playground_item_id === itemId);

  const getDetailUrl = (item) => {
    if (item.source_type === "page") return createPageUrl("PlaygroundPage") + `?id=${item.id}`;
    if (item.source_type === "feature") return createPageUrl("PlaygroundFeature") + `?id=${item.id}`;
    return "#";
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Full preview mode for selected item
  if (selectedItem && templateData) {
    return (
      <div className="min-h-screen bg-gray-100">
        {/* Preview Navigation Bar */}
        <div className="bg-white border-b sticky top-0 z-50 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate(createPageUrl("LivePreview"))}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              All Pages
            </Button>
            <div className="flex items-center gap-2">
              {selectedItem.source_type === "page" ? (
                <Layout className="h-4 w-4 text-blue-600" />
              ) : (
                <Zap className="h-4 w-4 text-amber-600" />
              )}
              <span className="font-medium">{selectedItem.source_name}</span>
              <Badge variant="outline">v{selectedItem.current_version || 1}</Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
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

        {/* Preview Content */}
        <div className="p-6">
          <div className="max-w-6xl mx-auto">
            {selectedItem.source_type === "page" && templateData && (
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <PagePreview page={templateData} />
              </div>
            )}

            {selectedItem.source_type === "feature" && templateData && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-amber-600" />
                    {templateData.name}
                  </CardTitle>
                  <p className="text-gray-500">{templateData.description}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">User Stories</h4>
                      <ul className="space-y-1 text-sm">
                        {templateData.user_stories?.map((story, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <ChevronRight className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                            {story}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Requirements</h4>
                      <ul className="space-y-1 text-sm">
                        {templateData.requirements?.map((req, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <ChevronRight className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  {templateData.entities_used?.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Entities Used</h4>
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
                </CardContent>
              </Card>
            )}

            {/* Test Data Preview */}
            {itemTestData && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Database className="h-5 w-5 text-blue-600" />
                    Test Data: {itemTestData.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-auto max-h-64">
                    {JSON.stringify(itemTestData.entity_data, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Gallery view
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Eye className="h-6 w-6 text-blue-600" />
            Live Pages Preview
          </h1>
          <p className="text-gray-500">View pages and features with test data</p>
        </div>
        <div className="flex gap-2">
          <Link to={createPageUrl("TestDataManager")}>
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Manage Test Data
            </Button>
          </Link>
          <Link to={createPageUrl("PlaygroundSummary")}>
            <Button variant="outline">
              <FlaskConical className="h-4 w-4 mr-2" />
              Playground
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="page">Pages</SelectItem>
            <SelectItem value="feature">Features</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredItems.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No pages or features to preview</p>
          <p className="text-sm mt-1">Sync items from library in the Playground</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map(item => {
            const template = item.source_type === "page"
              ? pageTemplates.find(t => t.id === item.source_id)
              : featureTemplates.find(t => t.id === item.source_id);
            const data = item.working_data || template;
            const hasTestData = testDataSets.some(td => td.playground_item_id === item.id);

            return (
              <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-48 bg-gray-50 border-b relative">
                  {item.source_type === "page" && data && (
                    <div className="transform scale-[0.3] origin-top-left w-[333%] h-[333%]">
                      <PagePreview page={data} />
                    </div>
                  )}
                  {item.source_type === "feature" && (
                    <div className="flex items-center justify-center h-full">
                      <Zap className="h-16 w-16 text-amber-200" />
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {item.source_type === "page" ? (
                        <Layout className="h-4 w-4 text-blue-600" />
                      ) : (
                        <Zap className="h-4 w-4 text-amber-600" />
                      )}
                      <span className="font-medium">{item.source_name}</span>
                    </div>
                    {hasTestData && (
                      <Badge variant="outline" className="text-xs">
                        <Database className="h-3 w-3 mr-1" />
                        Test Data
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                    {data?.description || "No description"}
                  </p>
                  <div className="flex gap-2">
                    <Link to={createPageUrl("LivePreview") + `?id=${item.id}`} className="flex-1">
                      <Button size="sm" variant="outline" className="w-full">
                        <Eye className="h-3 w-3 mr-2" />
                        View
                      </Button>
                    </Link>
                    <Link to={getDetailUrl(item)}>
                      <Button size="sm" variant="ghost">
                        <Edit className="h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}