import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Search, Filter, Plus, Edit, Trash2, Eye, Download, 
  BarChart3, PieChart, Users, Calendar, FileText, Settings,
  ChevronRight, MoreHorizontal
} from "lucide-react";

// Render a live, interactive preview of a page/feature template
export default function LivePageRenderer({ item, template, testData, entities }) {
  const [searchQuery, setSearchQuery] = useState("");

  if (!template) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        No template data available
      </div>
    );
  }

  const components = template.components || [];
  const actions = template.actions || [];
  const features = template.features || [];
  const layout = template.layout || "full-width";

  // Get test data for first entity
  const primaryEntity = entities?.[0];
  const primaryData = testData?.[primaryEntity?.name] || [];

  // Check features
  const hasSearch = features.some(f => f.toLowerCase().includes("search"));
  const hasFilter = features.some(f => f.toLowerCase().includes("filter"));
  const hasCreate = actions.includes("create");
  const hasExport = actions.includes("export");

  // Filter test data by search
  const filteredData = primaryData.filter(row => {
    if (!searchQuery) return true;
    return Object.values(row).some(v => 
      String(v).toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Get columns from entity schema or first data row
  const getColumns = () => {
    if (primaryEntity?.schema?.properties) {
      return Object.keys(primaryEntity.schema.properties).slice(0, 6);
    }
    if (primaryData.length > 0) {
      return Object.keys(primaryData[0]).slice(0, 6);
    }
    return ["name", "status", "date"];
  };

  const columns = getColumns();

  // Render different component types
  const renderComponent = (comp, index) => {
    const type = (comp.type || "default").toLowerCase();

    switch (type) {
      case "table":
      case "list":
        return (
          <Card key={index}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{comp.name || "Data Table"}</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredData.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      {columns.map(col => (
                        <TableHead key={col} className="capitalize">{col.replace(/_/g, " ")}</TableHead>
                      ))}
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.slice(0, 5).map((row, i) => (
                      <TableRow key={i}>
                        {columns.map(col => (
                          <TableCell key={col}>{String(row[col] || "—")}</TableCell>
                        ))}
                        <TableCell>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="py-8 text-center text-gray-400">
                  <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No test data configured</p>
                  <p className="text-xs">Add test data to see a live preview</p>
                </div>
              )}
            </CardContent>
          </Card>
        );

      case "stats":
      case "dashboard":
        return (
          <div key={index} className="grid grid-cols-4 gap-4">
            {[
              { label: "Total", value: filteredData.length || 24, color: "blue" },
              { label: "Active", value: Math.floor((filteredData.length || 24) * 0.7), color: "green" },
              { label: "Pending", value: Math.floor((filteredData.length || 24) * 0.2), color: "yellow" },
              { label: "Closed", value: Math.floor((filteredData.length || 24) * 0.1), color: "gray" },
            ].map((stat, i) => (
              <Card key={i}>
                <CardContent className="pt-4">
                  <div className={`text-2xl font-bold text-${stat.color}-600`}>{stat.value}</div>
                  <div className="text-sm text-gray-500">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        );

      case "chart":
        return (
          <Card key={index}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                {comp.name || "Chart"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48 flex items-end justify-around gap-2 px-4">
                {[65, 80, 45, 90, 55, 70, 85, 60].map((h, i) => (
                  <div 
                    key={i} 
                    className="flex-1 bg-blue-500 rounded-t transition-all hover:bg-blue-600"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
              <div className="flex justify-around mt-2 text-xs text-gray-500">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "Mon"].map((d, i) => (
                  <span key={i}>{d}</span>
                ))}
              </div>
            </CardContent>
          </Card>
        );

      case "form":
        return (
          <Card key={index}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{comp.name || "Form"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {columns.slice(0, 4).map(col => (
                <div key={col}>
                  <label className="text-sm font-medium capitalize">{col.replace(/_/g, " ")}</label>
                  <Input placeholder={`Enter ${col}...`} className="mt-1" />
                </div>
              ))}
              <div className="flex gap-2 pt-2">
                <Button>Save</Button>
                <Button variant="outline">Cancel</Button>
              </div>
            </CardContent>
          </Card>
        );

      case "card":
      case "cards":
        return (
          <div key={index} className="grid grid-cols-3 gap-4">
            {(filteredData.length > 0 ? filteredData.slice(0, 6) : [1, 2, 3, 4, 5, 6]).map((item, i) => (
              <Card key={i} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="pt-4">
                  <div className="font-medium">{item.name || item.title || `Item ${i + 1}`}</div>
                  <div className="text-sm text-gray-500 mt-1">
                    {item.description || item.status || "Description here"}
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Badge variant="secondary">{item.category || "Category"}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        );

      default:
        return (
          <Card key={index}>
            <CardContent className="py-4">
              <div className="text-sm text-gray-500">{comp.name || "Component"}</div>
              <div className="text-xs text-gray-400">{comp.description || comp.type}</div>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="bg-gray-50 min-h-[500px]">
      {/* Page Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">{template.name}</h2>
          <div className="flex gap-2">
            {hasCreate && (
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add New
              </Button>
            )}
            {hasExport && (
              <Button size="sm" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            )}
          </div>
        </div>

        {/* Search & Filter Bar */}
        {(hasSearch || hasFilter) && (
          <div className="flex gap-3 mt-4">
            {hasSearch && (
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            )}
            {hasFilter && (
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Page Content */}
      <div className={`p-6 ${layout === "sidebar" ? "grid grid-cols-[200px_1fr] gap-6" : ""}`}>
        {/* Sidebar for sidebar layout */}
        {layout === "sidebar" && (
          <Card className="h-fit">
            <CardContent className="py-4">
              <nav className="space-y-1">
                {["All Items", "Active", "Pending", "Archived"].map((item, i) => (
                  <button
                    key={i}
                    className={`w-full text-left px-3 py-2 rounded text-sm ${i === 0 ? "bg-blue-50 text-blue-700" : "hover:bg-gray-100"}`}
                  >
                    {item}
                  </button>
                ))}
              </nav>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        <div className={`space-y-6 ${layout === "centered" ? "max-w-2xl mx-auto" : ""}`}>
          {components.length > 0 ? (
            components.map((comp, i) => renderComponent(comp, i))
          ) : (
            // Default rendering based on page category
            <>
              {template.category === "Dashboard" && renderComponent({ type: "stats" }, 0)}
              {template.category === "List" && renderComponent({ type: "table", name: template.name }, 0)}
              {template.category === "Form" && renderComponent({ type: "form", name: template.name }, 0)}
              {template.category === "Detail" && (
                <Card>
                  <CardContent className="py-8">
                    <div className="max-w-2xl">
                      <h3 className="text-lg font-bold mb-4">Detail View</h3>
                      <div className="grid grid-cols-2 gap-4">
                        {columns.map(col => (
                          <div key={col}>
                            <label className="text-sm text-gray-500 capitalize">{col.replace(/_/g, " ")}</label>
                            <div className="font-medium">{filteredData[0]?.[col] || "—"}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              {!["Dashboard", "List", "Form", "Detail"].includes(template.category) && (
                <Card>
                  <CardContent className="py-12 text-center text-gray-400">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Page content preview</p>
                    <p className="text-sm">Add components to see detailed preview</p>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}