import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Layout, Zap, Database, Edit, Eye, Loader2, CheckCircle2,
  ChevronDown, ChevronRight, Clock, AlertCircle, ArrowLeft
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

import LivePageRenderer from "@/components/playground/LivePageRenderer";
import { ContentCard, InfoRow } from "@/components/layout/PageLayout";

// Generate slug from name
const toSlug = (name) => name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || '';

export default function LivePreview() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const itemSlug = urlParams.get("page"); // Use slug param
  const itemId = urlParams.get("id"); // Legacy support
  
  const [expandedCategories, setExpandedCategories] = useState(new Set(['Pages', 'Features']));

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

  // Find selected item by slug or id
  const selectedItem = useMemo(() => {
    if (itemSlug) {
      return playgroundItems.find(p => toSlug(p.source_name) === itemSlug);
    }
    if (itemId) {
      return playgroundItems.find(p => p.id === itemId);
    }
    return null;
  }, [playgroundItems, itemSlug, itemId]);

  // Group items by category
  const groupedItems = useMemo(() => {
    const pages = playgroundItems.filter(i => i.source_type === "page");
    const features = playgroundItems.filter(i => i.source_type === "feature");
    
    // Group features by category
    const featuresByCategory = features.reduce((acc, item) => {
      const template = featureTemplates.find(t => t.id === item.source_id);
      const category = item.group || template?.category || "Other";
      if (!acc[category]) acc[category] = [];
      acc[category].push(item);
      return acc;
    }, {});

    return { pages, featuresByCategory };
  }, [playgroundItems, featureTemplates]);

  // Summary stats
  const stats = useMemo(() => {
    const pages = playgroundItems.filter(i => i.source_type === "page");
    const features = playgroundItems.filter(i => i.source_type === "feature");
    const withTestData = playgroundItems.filter(i => 
      testDataSets.some(td => td.source_id === i.source_id && td.source_type === i.source_type)
    );
    const passed = playgroundItems.filter(i => i.test_status === "passed");
    const pending = playgroundItems.filter(i => !i.test_status || i.test_status === "pending");
    
    return {
      totalPages: pages.length,
      totalFeatures: features.length,
      withTestData: withTestData.length,
      passed: passed.length,
      pending: pending.length,
      total: playgroundItems.length
    };
  }, [playgroundItems, testDataSets]);

  const selectedTemplate = selectedItem?.source_type === "page" 
    ? pageTemplates.find(t => t.id === selectedItem.source_id)
    : featureTemplates.find(t => t.id === selectedItem?.source_id);
  const templateData = selectedItem?.working_data || selectedTemplate;
  
  const itemTestData = testDataSets.find(td => 
    td.source_id === selectedItem?.source_id && 
    td.source_type === selectedItem?.source_type
  );

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

  const toggleCategory = (category) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  };

  const selectItem = (item) => {
    const slug = toSlug(item.source_name);
    navigate(createPageUrl("LivePreview") + `?page=${slug}`);
  };

  const goBack = () => {
    navigate(createPageUrl("LivePreview"));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Detail view when item is selected
  if (selectedItem) {
    return (
      <div className="p-6 space-y-6">
        <Button variant="ghost" onClick={goBack} className="gap-2 mb-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Overview
        </Button>

        <div className="bg-white border rounded-lg px-4 py-3 flex items-center justify-between">
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
            <Badge variant="secondary" className="text-xs font-mono">/{toSlug(selectedItem.source_name)}</Badge>
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

        <div className="grid grid-cols-4 gap-6">
          <div className="col-span-3">
            <ContentCard
              title="Live Page"
              icon={<Eye className="h-4 w-4" />}
              noPadding
            >
              <LivePageRenderer 
                item={selectedItem}
                template={templateData}
                testData={itemTestData?.entity_data}
                entities={getEntitiesForItem()}
              />
            </ContentCard>
          </div>

          <div className="col-span-1 space-y-4">
            <ContentCard title="User Stories">
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
            </ContentCard>

            <ContentCard title="Details">
              <div className="space-y-1">
                <InfoRow 
                  label="Type" 
                  value={<Badge variant="outline">{selectedItem.source_type}</Badge>} 
                />
                <InfoRow 
                  label="Status" 
                  value={
                    <Badge className={
                      selectedItem.test_status === "passed" ? "bg-green-100 text-green-800" :
                      selectedItem.test_status === "failed" ? "bg-red-100 text-red-800" :
                      "bg-gray-100 text-gray-800"
                    }>{selectedItem.test_status || "pending"}</Badge>
                  } 
                />
                {templateData?.category && (
                  <InfoRow label="Category" value={templateData.category} />
                )}
              </div>
            </ContentCard>

            {getEntitiesForItem().length > 0 && (
              <ContentCard title="Entities">
                <div className="flex flex-wrap gap-1">
                  {getEntitiesForItem().map((e, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      <Database className="h-3 w-3 mr-1" />
                      {e.name}
                    </Badge>
                  ))}
                </div>
              </ContentCard>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Overview dashboard
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Live Preview</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Layout className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalPages}</p>
                <p className="text-xs text-gray-500">Pages</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Zap className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalFeatures}</p>
                <p className="text-xs text-gray-500">Features</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Database className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.withTestData}</p>
                <p className="text-xs text-gray-500">With Test Data</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.passed}</p>
                <p className="text-xs text-gray-500">Passed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Clock className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-xs text-gray-500">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pages Section */}
      <Card>
        <button
          onClick={() => toggleCategory('Pages')}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            {expandedCategories.has('Pages') ? (
              <ChevronDown className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronRight className="h-5 w-5 text-gray-400" />
            )}
            <Layout className="h-5 w-5 text-blue-600" />
            <span className="font-semibold">Pages</span>
            <Badge variant="secondary">{groupedItems.pages.length}</Badge>
          </div>
        </button>
        {expandedCategories.has('Pages') && (
          <CardContent className="pt-0 pb-3">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {groupedItems.pages.map(item => (
                <button
                  key={item.id}
                  onClick={() => selectItem(item)}
                  className="flex items-center gap-3 p-3 rounded-lg border hover:bg-blue-50 hover:border-blue-200 transition-colors text-left"
                >
                  <Layout className="h-4 w-4 text-blue-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{item.source_name}</p>
                    <p className="text-xs text-gray-500 font-mono">/{toSlug(item.source_name)}</p>
                  </div>
                  <Badge className={
                    item.test_status === "passed" ? "bg-green-100 text-green-700" :
                    item.test_status === "failed" ? "bg-red-100 text-red-700" :
                    "bg-gray-100 text-gray-600"
                  }>
                    {item.test_status || "pending"}
                  </Badge>
                </button>
              ))}
              {groupedItems.pages.length === 0 && (
                <p className="text-gray-500 text-sm col-span-full py-4 text-center">No pages synced yet</p>
              )}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Features by Category */}
      {Object.entries(groupedItems.featuresByCategory).map(([category, items]) => (
        <Card key={category}>
          <button
            onClick={() => toggleCategory(category)}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              {expandedCategories.has(category) ? (
                <ChevronDown className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronRight className="h-5 w-5 text-gray-400" />
              )}
              <Zap className="h-5 w-5 text-amber-600" />
              <span className="font-semibold">{category}</span>
              <Badge variant="secondary">{items.length}</Badge>
            </div>
          </button>
          {expandedCategories.has(category) && (
            <CardContent className="pt-0 pb-3">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {items.map(item => (
                  <button
                    key={item.id}
                    onClick={() => selectItem(item)}
                    className="flex items-center gap-3 p-3 rounded-lg border hover:bg-amber-50 hover:border-amber-200 transition-colors text-left"
                  >
                    <Zap className="h-4 w-4 text-amber-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.source_name}</p>
                      <p className="text-xs text-gray-500 font-mono">/{toSlug(item.source_name)}</p>
                    </div>
                    <Badge className={
                      item.test_status === "passed" ? "bg-green-100 text-green-700" :
                      item.test_status === "failed" ? "bg-red-100 text-red-700" :
                      "bg-gray-100 text-gray-600"
                    }>
                      {item.test_status || "pending"}
                    </Badge>
                  </button>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      ))}

      {Object.keys(groupedItems.featuresByCategory).length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-gray-500">
            <Zap className="h-10 w-10 mx-auto mb-2 opacity-30" />
            <p>No features synced yet</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}