import React, { useState } from "react";
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
  Play, Search, Database, Layout, Zap, CheckCircle2, XCircle, 
  Circle, Loader2, RefreshCw, Plus, Trash2, Eye
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { toast } from "sonner";

const statusIcons = {
  passed: <CheckCircle2 className="h-4 w-4 text-green-600" />,
  failed: <XCircle className="h-4 w-4 text-red-600" />,
  pending: <Circle className="h-4 w-4 text-gray-400" />,
  skipped: <Circle className="h-4 w-4 text-yellow-500" />,
};

const typeIcons = {
  entity: <Database className="h-4 w-4 text-purple-600" />,
  page: <Layout className="h-4 w-4 text-blue-600" />,
  feature: <Zap className="h-4 w-4 text-amber-600" />,
};

export default function PlaygroundSummary() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterGroup, setFilterGroup] = useState("all");
  const [isRunningAll, setIsRunningAll] = useState(false);

  const { data: playgroundItems = [], isLoading } = useQuery({
    queryKey: ["playgroundItems"],
    queryFn: () => base44.entities.PlaygroundItem.list("-created_date"),
  });

  const { data: entityTemplates = [] } = useQuery({
    queryKey: ["entityTemplates"],
    queryFn: () => base44.entities.EntityTemplate.list(),
  });

  const { data: pageTemplates = [] } = useQuery({
    queryKey: ["pageTemplates"],
    queryFn: () => base44.entities.PageTemplate.list(),
  });

  const { data: featureTemplates = [] } = useQuery({
    queryKey: ["featureTemplates"],
    queryFn: () => base44.entities.FeatureTemplate.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.PlaygroundItem.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playgroundItems"] });
      toast.success("Added to playground");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.PlaygroundItem.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playgroundItems"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.PlaygroundItem.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playgroundItems"] });
      toast.success("Removed from playground");
    },
  });

  // Get unique groups
  const groups = [...new Set(playgroundItems.filter(i => i.group).map(i => i.group))].sort();

  const filteredItems = playgroundItems.filter(item => {
    const matchesSearch = item.source_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || item.source_type === filterType;
    const matchesStatus = filterStatus === "all" || item.test_status === filterStatus;
    const matchesGroup = filterGroup === "all" || item.group === filterGroup;
    return matchesSearch && matchesType && matchesStatus && matchesGroup;
  });

  const groupedItems = filteredItems.reduce((acc, item) => {
    const key = item.group || item.source_type;
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  // Stats
  const stats = {
    total: playgroundItems.length,
    passed: playgroundItems.filter(i => i.test_status === "passed").length,
    failed: playgroundItems.filter(i => i.test_status === "failed").length,
    pending: playgroundItems.filter(i => i.test_status === "pending").length,
  };

  const importFromLibrary = async (type) => {
    let templates = [];
    if (type === "entity") templates = entityTemplates;
    else if (type === "page") templates = pageTemplates;
    else if (type === "feature") templates = featureTemplates;

    const existingIds = playgroundItems.filter(i => i.source_type === type).map(i => i.source_id);
    const newItems = templates.filter(t => !existingIds.includes(t.id));

    for (const template of newItems) {
      await base44.entities.PlaygroundItem.create({
        source_type: type,
        source_id: template.id,
        source_name: template.name,
        group: template.group || template.category,
        test_status: "pending",
        test_definition: generateDefaultTests(type, template),
      });
    }

    queryClient.invalidateQueries({ queryKey: ["playgroundItems"] });
    toast.success(`Imported ${newItems.length} ${type} templates`);
  };

  const generateDefaultTests = (type, template) => {
    if (type === "entity") {
      return {
        tests: [
          { name: "Has valid name", check: "name !== undefined && name.length > 0" },
          { name: "Has schema defined", check: "schema !== undefined" },
          { name: "Schema has properties", check: "Object.keys(schema.properties || {}).length > 0" },
          { name: "Has required fields", check: "Array.isArray(schema.required)" },
        ]
      };
    } else if (type === "page") {
      return {
        tests: [
          { name: "Has valid name", check: "name !== undefined" },
          { name: "Has category", check: "category !== undefined" },
          { name: "Has components defined", check: "Array.isArray(components)" },
          { name: "Has entities assigned", check: "Array.isArray(entities_used)" },
        ]
      };
    } else if (type === "feature") {
      return {
        tests: [
          { name: "Has valid name", check: "name !== undefined" },
          { name: "Has description", check: "description && description.length > 10" },
          { name: "Has complexity defined", check: "complexity !== undefined" },
          { name: "Has user stories", check: "Array.isArray(user_stories) && user_stories.length > 0" },
        ]
      };
    }
    return { tests: [] };
  };

  const runTests = async (item) => {
    let template = null;
    if (item.source_type === "entity") {
      template = entityTemplates.find(t => t.id === item.source_id);
    } else if (item.source_type === "page") {
      template = pageTemplates.find(t => t.id === item.source_id);
    } else if (item.source_type === "feature") {
      template = featureTemplates.find(t => t.id === item.source_id);
    }

    if (!template) {
      updateMutation.mutate({
        id: item.id,
        data: { 
          test_status: "failed",
          test_results: { passed: [], failed: [], errors: ["Template not found"] },
          last_test_date: new Date().toISOString()
        }
      });
      return;
    }

    const tests = item.test_definition?.tests || [];
    const passed = [];
    const failed = [];
    const errors = [];

    for (const test of tests) {
      try {
        // Simple evaluation based on template properties
        let result = false;
        const { name, description, category, schema, components, entities_used, complexity, user_stories } = template;
        
        if (test.check.includes("name")) result = name !== undefined && name.length > 0;
        else if (test.check.includes("schema.properties")) result = Object.keys(schema?.properties || {}).length > 0;
        else if (test.check.includes("schema.required")) result = Array.isArray(schema?.required);
        else if (test.check.includes("schema")) result = schema !== undefined;
        else if (test.check.includes("category")) result = category !== undefined;
        else if (test.check.includes("components")) result = Array.isArray(components);
        else if (test.check.includes("entities_used")) result = Array.isArray(entities_used);
        else if (test.check.includes("description")) result = description && description.length > 10;
        else if (test.check.includes("complexity")) result = complexity !== undefined;
        else if (test.check.includes("user_stories")) result = Array.isArray(user_stories) && user_stories.length > 0;
        else result = true; // Default pass for unknown checks

        if (result) passed.push(test.name);
        else failed.push(test.name);
      } catch (e) {
        errors.push(`${test.name}: ${e.message}`);
      }
    }

    const status = errors.length > 0 || failed.length > 0 ? "failed" : "passed";
    
    updateMutation.mutate({
      id: item.id,
      data: {
        test_status: status,
        test_results: { passed, failed, errors },
        last_test_date: new Date().toISOString()
      }
    });
  };

  const runAllTests = async () => {
    setIsRunningAll(true);
    for (const item of playgroundItems) {
      await runTests(item);
    }
    setIsRunningAll(false);
    toast.success("All tests completed");
  };

  const getDetailUrl = (item) => {
    if (item.source_type === "entity") return createPageUrl("PlaygroundEntity") + `?id=${item.id}`;
    if (item.source_type === "page") return createPageUrl("PlaygroundPage") + `?id=${item.id}`;
    if (item.source_type === "feature") return createPageUrl("PlaygroundFeature") + `?id=${item.id}`;
    return "#";
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Development Playground</h1>
          <p className="text-gray-500">Test and validate templates from the library</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={runAllTests} disabled={isRunningAll || playgroundItems.length === 0}>
            {isRunningAll ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
            Run All Tests
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-gray-500">Total Items</div>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-green-700">{stats.passed}</div>
            <div className="text-sm text-green-600">Passed</div>
          </CardContent>
        </Card>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-red-700">{stats.failed}</div>
            <div className="text-sm text-red-600">Failed</div>
          </CardContent>
        </Card>
        <Card className="border-gray-200 bg-gray-50">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-gray-700">{stats.pending}</div>
            <div className="text-sm text-gray-600">Pending</div>
          </CardContent>
        </Card>
      </div>

      {/* Import Buttons */}
      <div className="flex gap-2 mb-6">
        <Button variant="outline" onClick={() => importFromLibrary("entity")}>
          <Database className="h-4 w-4 mr-2" />
          Import Entities ({entityTemplates.length})
        </Button>
        <Button variant="outline" onClick={() => importFromLibrary("page")}>
          <Layout className="h-4 w-4 mr-2" />
          Import Pages ({pageTemplates.length})
        </Button>
        <Button variant="outline" onClick={() => importFromLibrary("feature")}>
          <Zap className="h-4 w-4 mr-2" />
          Import Features ({featureTemplates.length})
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6 flex-wrap">
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
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="entity">Entities</SelectItem>
            <SelectItem value="page">Pages</SelectItem>
            <SelectItem value="feature">Features</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="passed">Passed</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterGroup} onValueChange={setFilterGroup}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Group" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Groups</SelectItem>
            {groups.map(g => (
              <SelectItem key={g} value={g}>{g}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Items List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Play className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No playground items yet</p>
          <p className="text-sm mt-1">Import templates from the library to get started</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedItems).map(([groupName, items]) => (
            <div key={groupName}>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Badge variant="outline">{groupName}</Badge>
                <span className="text-gray-400 text-sm font-normal">({items.length})</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map(item => (
                  <Card key={item.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-base flex items-center gap-2">
                          {typeIcons[item.source_type]}
                          {item.source_name}
                        </CardTitle>
                        {statusIcons[item.test_status]}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {item.test_results && (
                        <div className="text-xs text-gray-500 mb-3">
                          <span className="text-green-600">{item.test_results.passed?.length || 0} passed</span>
                          {" · "}
                          <span className="text-red-600">{item.test_results.failed?.length || 0} failed</span>
                        </div>
                      )}
                      <div className="flex gap-1">
                        <Link to={getDetailUrl(item)}>
                          <Button size="sm" variant="ghost" title="View Details">
                            <Eye className="h-3 w-3" />
                          </Button>
                        </Link>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => runTests(item)}
                          title="Run Tests"
                        >
                          <Play className="h-3 w-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-red-600"
                          onClick={() => deleteMutation.mutate(item.id)}
                          title="Remove"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}