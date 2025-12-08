import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Layout, Zap, Database, Edit, Eye, Loader2,
  ChevronDown, ChevronRight, ArrowLeft
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

import LivePageRenderer from "@/components/playground/LivePageRenderer";
import { PageHeader, ContentSection, StatCard, StatusBadge, DataRow } from "@/components/sturij";

// Generate slug from name
const toSlug = (name) => name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || '';

export default function LivePreview() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const itemSlug = urlParams.get("page");
  const itemId = urlParams.get("id");
  
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
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Detail view when item is selected
  if (selectedItem) {
    return (
      <div className="p-6 space-y-6 bg-background min-h-screen">
        <Button variant="ghost" onClick={goBack} className="gap-2 text-muted-foreground hover:text-midnight-900">
          <ArrowLeft className="h-4 w-4" />
          Back to Overview
        </Button>

        <PageHeader
          icon={selectedItem.source_type === "page" 
            ? <Layout className="h-6 w-6" />
            : <Zap className="h-6 w-6" />
          }
          title={selectedItem.source_name}
          description={templateData?.description}
          badge={`v${selectedItem.current_version || 1}`}
          actions={
            <div className="flex gap-2">
              <Badge variant="outline" className="font-mono text-xs">
                /{toSlug(selectedItem.source_name)}
              </Badge>
              <Link to={createPageUrl("TestDataManager") + `?item=${selectedItem.id}`}>
                <Button variant="outline" size="sm" className="gap-2">
                  <Database className="h-4 w-4" />
                  Test Data
                </Button>
              </Link>
              <Link to={getDetailUrl(selectedItem)}>
                <Button size="sm" className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Edit className="h-4 w-4" />
                  Edit in Playground
                </Button>
              </Link>
            </div>
          }
        />

        <div className="grid grid-cols-4 gap-6">
          <div className="col-span-3">
            <ContentSection
              icon={<Eye className="h-4 w-4" />}
              title="Live Preview"
              description="Interactive page rendering with test data"
            >
              <div className="-mx-4 -mb-4 mt-4 border-t border-border">
                <LivePageRenderer 
                  item={selectedItem}
                  template={templateData}
                  testData={itemTestData?.entity_data}
                  entities={getEntitiesForItem()}
                />
              </div>
            </ContentSection>
          </div>

          <div className="col-span-1 space-y-4">
            <ContentSection
              icon={<Layout className="h-4 w-4" />}
              title="Details"
            >
              <div className="space-y-1">
                <DataRow 
                  label="Type" 
                  value={<StatusBadge status={selectedItem.source_type} label={selectedItem.source_type} />}
                />
                <DataRow 
                  label="Status" 
                  value={<StatusBadge status={selectedItem.test_status || "pending"} />}
                />
                {templateData?.category && (
                  <DataRow label="Category" value={templateData.category} />
                )}
              </div>
            </ContentSection>

            {getUserStories().length > 0 && (
              <ContentSection
                icon={<Zap className="h-4 w-4" />}
                title="User Stories"
              >
                <ul className="space-y-2 text-sm">
                  {getUserStories().map((story, i) => (
                    <li key={i} className="flex items-start gap-2 text-muted-foreground">
                      <span className="text-primary mt-1">•</span>
                      <span>{story}</span>
                    </li>
                  ))}
                </ul>
              </ContentSection>
            )}

            {getEntitiesForItem().length > 0 && (
              <ContentSection
                icon={<Database className="h-4 w-4" />}
                title="Entities"
              >
                <div className="flex flex-wrap gap-1.5">
                  {getEntitiesForItem().map((e, i) => (
                    <Badge key={i} variant="secondary" className="text-xs gap-1">
                      <Database className="h-3 w-3" />
                      {e.name}
                    </Badge>
                  ))}
                </div>
              </ContentSection>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Overview dashboard
  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      <PageHeader
        icon={<Eye className="h-6 w-6" />}
        title="Live Preview"
        description="Browse and preview all playground pages and features with test data"
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard
          icon={<Layout />}
          label="Pages"
          value={stats.totalPages}
          color="primary"
        />
        <StatCard
          icon={<Zap />}
          label="Features"
          value={stats.totalFeatures}
          color="secondary"
        />
        <StatCard
          icon={<Database />}
          label="With Test Data"
          value={stats.withTestData}
          color="accent"
        />
        <StatCard
          icon={<Layout />}
          label="Passed"
          value={stats.passed}
          color="success"
        />
        <StatCard
          icon={<Layout />}
          label="Pending"
          value={stats.pending}
          color="neutral"
        />
      </div>

      {/* Pages Section */}
      <ContentSection
        icon={<Layout className="h-4 w-4" />}
        title="Pages"
        description={`${groupedItems.pages.length} pages available`}
        collapsible
        defaultExpanded={expandedCategories.has('Pages')}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
          {groupedItems.pages.map(item => (
            <button
              key={item.id}
              onClick={() => selectItem(item)}
              className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:bg-primary/10 hover:border-primary/30 transition-all text-left group"
            >
              <div className="p-2 bg-primary/10 rounded-lg text-primary group-hover:bg-primary/20">
                <Layout className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-midnight-900 truncate">{item.source_name}</p>
                <p className="text-xs text-muted-foreground font-mono">/{toSlug(item.source_name)}</p>
              </div>
              <StatusBadge status={item.test_status || "pending"} size="small" />
            </button>
          ))}
          {groupedItems.pages.length === 0 && (
            <p className="text-muted-foreground text-sm col-span-full py-8 text-center">
              No pages synced yet
            </p>
          )}
        </div>
      </ContentSection>

      {/* Features by Category */}
      {Object.entries(groupedItems.featuresByCategory).map(([category, items]) => (
        <ContentSection
          key={category}
          icon={<Zap className="h-4 w-4" />}
          title={category}
          description={`${items.length} features`}
          collapsible
          defaultExpanded={expandedCategories.has(category)}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
            {items.map(item => (
              <button
                key={item.id}
                onClick={() => selectItem(item)}
                className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:bg-secondary/10 hover:border-secondary/30 transition-all text-left group"
              >
                <div className="p-2 bg-secondary/10 rounded-lg text-secondary group-hover:bg-secondary/20">
                  <Zap className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-midnight-900 truncate">{item.source_name}</p>
                  <p className="text-xs text-muted-foreground font-mono">/{toSlug(item.source_name)}</p>
                </div>
                <StatusBadge status={item.test_status || "pending"} size="small" />
              </button>
            ))}
          </div>
        </ContentSection>
      ))}

      {Object.keys(groupedItems.featuresByCategory).length === 0 && (
        <ContentSection
          icon={<Zap className="h-4 w-4" />}
          title="Features"
          description="No features synced yet"
        >
          <div className="py-8 text-center text-muted-foreground">
            <Zap className="h-10 w-10 mx-auto mb-2 opacity-30" />
            <p>Sync features from the Playground to see them here</p>
          </div>
        </ContentSection>
      )}
    </div>
  );
}