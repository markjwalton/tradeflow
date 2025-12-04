import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Layout, Zap, Database, Edit, Eye, Loader2, CheckCircle2, ArrowLeft
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

// Dynamic page renderer based on template
import LivePageRenderer from "@/components/playground/LivePageRenderer";

// Standardized components
import { LivePreviewNavigation } from "@/components/testing/LivePreviewNavigation";
import { ContentCard, InfoRow, StatCard } from "@/components/layout/PageLayout";

const statusColors = {
  passed: "text-green-600",
  failed: "text-red-600",
  pending: "text-gray-400",
};

export default function LivePreview() {
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

  const { data: entityTemplates = [] } = useQuery({
    queryKey: ["entityTemplates"],
    queryFn: () => base44.entities.EntityTemplate.list(),
  });

  const { data: testDataSets = [] } = useQuery({
    queryKey: ["testData"],
    queryFn: () => base44.entities.TestData.list(),
  });

  // Build navigation structure from config
  const pageItems = playgroundItems.filter(item => item.source_type === "page");
  const featureItems = playgroundItems.filter(item => item.source_type === "feature");

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
  // Find test data by library source_id (consistent with TestDataManager)
  const itemTestData = testDataSets.find(td => 
    td.source_id === selectedItem?.source_id && 
    td.source_type === selectedItem?.source_type
  );

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



  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div>
          {!selectedItem ? (
            <div className="h-64 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <Eye className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg">Select a page or feature</p>
                <p className="text-sm mt-1">Use the navigation on the left</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Header Bar */}
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

              {/* Content Grid */}
              <div className="grid grid-cols-4 gap-6">
                {/* Live Page Preview - 3 columns */}
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

                {/* Sidebar - User Stories & Details */}
                <div className="col-span-1 space-y-4">
                  {/* User Stories */}
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

                  {/* Details */}
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

                  {/* Entities Used */}
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
          )}
      </div>
    </div>
  );
}