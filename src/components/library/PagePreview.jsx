import React from "react";
import { Badge } from "@/components/ui/badge";
import { 
  LayoutDashboard, 
  List, 
  FileText, 
  FormInput, 
  BarChart3, 
  Settings,
  Search,
  Filter,
  Plus,
  Table,
  PieChart,
  Calendar,
  Users,
  FileBox,
  Eye,
  Edit,
  Trash2,
  Download
} from "lucide-react";

const layoutStyles = {
  "full-width": "w-full",
  "centered": "max-w-2xl mx-auto",
  "sidebar": "grid grid-cols-[200px_1fr]",
  "split": "grid grid-cols-2 gap-2"
};

const categoryIcons = {
  Dashboard: LayoutDashboard,
  List: List,
  Detail: FileText,
  Form: FormInput,
  Report: BarChart3,
  Settings: Settings,
  Custom: FileBox,
  Other: FileText
};

const componentPreviews = {
  // Common component types
  list: ({ name }) => (
    <div className="border border-dashed border-gray-300 rounded p-2 bg-white">
      <div className="flex items-center gap-1 mb-2">
        <List className="h-3 w-3 text-gray-400" />
        <span className="text-xs text-gray-500">{name}</span>
      </div>
      <div className="space-y-1">
        {[1,2,3].map(i => (
          <div key={i} className="h-4 bg-gray-100 rounded animate-pulse" style={{width: `${100 - i * 10}%`}} />
        ))}
      </div>
    </div>
  ),
  table: ({ name }) => (
    <div className="border border-dashed border-gray-300 rounded p-2 bg-white">
      <div className="flex items-center gap-1 mb-2">
        <Table className="h-3 w-3 text-gray-400" />
        <span className="text-xs text-gray-500">{name}</span>
      </div>
      <div className="space-y-1">
        <div className="grid grid-cols-4 gap-1">
          {[1,2,3,4].map(i => <div key={i} className="h-3 bg-gray-200 rounded" />)}
        </div>
        {[1,2].map(r => (
          <div key={r} className="grid grid-cols-4 gap-1">
            {[1,2,3,4].map(i => <div key={i} className="h-3 bg-gray-100 rounded" />)}
          </div>
        ))}
      </div>
    </div>
  ),
  card: ({ name }) => (
    <div className="border border-dashed border-gray-300 rounded p-2 bg-white">
      <div className="flex items-center gap-1 mb-2">
        <FileBox className="h-3 w-3 text-gray-400" />
        <span className="text-xs text-gray-500">{name}</span>
      </div>
      <div className="grid grid-cols-3 gap-1">
        {[1,2,3].map(i => (
          <div key={i} className="h-12 bg-gray-100 rounded border border-gray-200" />
        ))}
      </div>
    </div>
  ),
  chart: ({ name }) => (
    <div className="border border-dashed border-gray-300 rounded p-2 bg-white">
      <div className="flex items-center gap-1 mb-2">
        <BarChart3 className="h-3 w-3 text-gray-400" />
        <span className="text-xs text-gray-500">{name}</span>
      </div>
      <div className="flex items-end gap-1 h-10">
        {[60,80,40,90,50,70].map((h, i) => (
          <div key={i} className="flex-1 bg-blue-200 rounded-t" style={{height: `${h}%`}} />
        ))}
      </div>
    </div>
  ),
  form: ({ name }) => (
    <div className="border border-dashed border-gray-300 rounded p-2 bg-white">
      <div className="flex items-center gap-1 mb-2">
        <FormInput className="h-3 w-3 text-gray-400" />
        <span className="text-xs text-gray-500">{name}</span>
      </div>
      <div className="space-y-2">
        {[1,2].map(i => (
          <div key={i}>
            <div className="h-2 w-12 bg-gray-200 rounded mb-1" />
            <div className="h-5 bg-gray-100 rounded border border-gray-200" />
          </div>
        ))}
      </div>
    </div>
  ),
  select: ({ name }) => (
    <div className="border border-dashed border-gray-300 rounded p-2 bg-white">
      <div className="flex items-center gap-1 mb-1">
        <Filter className="h-3 w-3 text-gray-400" />
        <span className="text-xs text-gray-500">{name}</span>
      </div>
      <div className="h-5 bg-gray-100 rounded border border-gray-200 flex items-center justify-between px-1">
        <div className="h-2 w-10 bg-gray-200 rounded" />
        <div className="h-2 w-2 bg-gray-300 rounded" />
      </div>
    </div>
  ),
  stats: ({ name }) => (
    <div className="border border-dashed border-gray-300 rounded p-2 bg-white">
      <div className="flex items-center gap-1 mb-2">
        <PieChart className="h-3 w-3 text-gray-400" />
        <span className="text-xs text-gray-500">{name || "Stats"}</span>
      </div>
      <div className="grid grid-cols-4 gap-1">
        {[1,2,3,4].map(i => (
          <div key={i} className="text-center p-1 bg-gray-50 rounded">
            <div className="text-sm font-bold text-gray-400">{i * 10}</div>
            <div className="h-1 w-6 mx-auto bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    </div>
  ),
  default: ({ name, type }) => (
    <div className="border border-dashed border-gray-300 rounded p-2 bg-white">
      <div className="flex items-center gap-1">
        <FileBox className="h-3 w-3 text-gray-400" />
        <span className="text-xs text-gray-500">{name}</span>
        {type && <Badge variant="outline" className="text-[8px] h-4">{type}</Badge>}
      </div>
    </div>
  )
};

export default function PagePreview({ page }) {
  if (!page) return null;

  const CategoryIcon = categoryIcons[page.category] || FileText;
  const layout = page.layout || "full-width";
  const components = page.components || [];
  const actions = page.actions || [];
  const features = page.features || [];

  const hasSearch = features.some(f => f.toLowerCase().includes("search"));
  const hasFilter = features.some(f => f.toLowerCase().includes("filter"));
  const hasCreate = actions.includes("create");
  const hasExport = actions.includes("export");

  const renderComponent = (comp, index) => {
    const type = (comp.type || "default").toLowerCase();
    const Preview = componentPreviews[type] || componentPreviews.default;
    return <Preview key={index} name={comp.name} type={comp.type} description={comp.description} />;
  };

  return (
    <div className="bg-slate-100 rounded-lg p-4 border">
      {/* Browser Chrome */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {/* Header Bar */}
        <div className="bg-slate-800 px-3 py-2 flex items-center gap-2">
          <div className="flex gap-1">
            <div className="w-2 h-2 rounded-full bg-red-400" />
            <div className="w-2 h-2 rounded-full bg-yellow-400" />
            <div className="w-2 h-2 rounded-full bg-green-400" />
          </div>
          <div className="flex-1 bg-slate-700 rounded h-4 mx-8 flex items-center px-2">
            <span className="text-[8px] text-slate-400">/{page.name}</span>
          </div>
        </div>

        {/* Page Layout */}
        <div className={`p-3 min-h-[200px] ${layout === "sidebar" ? "flex" : ""}`}>
          {/* Sidebar for sidebar layout */}
          {layout === "sidebar" && (
            <div className="w-32 border-r border-gray-200 pr-2 mr-2 space-y-1">
              {[1,2,3,4].map(i => (
                <div key={i} className="h-4 bg-gray-100 rounded" />
              ))}
            </div>
          )}

          <div className={`flex-1 ${layout === "centered" ? "max-w-md mx-auto" : ""}`}>
            {/* Page Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CategoryIcon className="h-4 w-4 text-gray-400" />
                <div className="h-4 w-24 bg-gray-200 rounded" />
              </div>
              <div className="flex gap-1">
                {hasCreate && (
                  <div className="h-5 px-2 bg-blue-500 rounded flex items-center">
                    <Plus className="h-3 w-3 text-white" />
                  </div>
                )}
                {hasExport && (
                  <div className="h-5 px-2 bg-gray-200 rounded flex items-center">
                    <Download className="h-3 w-3 text-gray-500" />
                  </div>
                )}
              </div>
            </div>

            {/* Search/Filter Bar */}
            {(hasSearch || hasFilter) && (
              <div className="flex gap-2 mb-3">
                {hasSearch && (
                  <div className="flex-1 h-6 bg-gray-100 rounded border border-gray-200 flex items-center px-2">
                    <Search className="h-3 w-3 text-gray-400" />
                    <div className="h-2 w-16 bg-gray-200 rounded ml-2" />
                  </div>
                )}
                {hasFilter && (
                  <div className="h-6 px-2 bg-gray-100 rounded border border-gray-200 flex items-center">
                    <Filter className="h-3 w-3 text-gray-400" />
                  </div>
                )}
              </div>
            )}

            {/* Components Grid */}
            {layout === "split" ? (
              <div className="grid grid-cols-2 gap-2">
                {components.map((comp, i) => renderComponent(comp, i))}
              </div>
            ) : (
              <div className="space-y-2">
                {components.length > 0 ? (
                  components.map((comp, i) => renderComponent(comp, i))
                ) : (
                  <div className="h-24 border-2 border-dashed border-gray-200 rounded flex items-center justify-center">
                    <span className="text-xs text-gray-400">Page Content</span>
                  </div>
                )}
              </div>
            )}

            {/* Action Bar for Detail/Form pages */}
            {(page.category === "Detail" || page.category === "Form") && actions.length > 0 && (
              <div className="flex justify-end gap-1 mt-3 pt-2 border-t border-gray-100">
                {actions.includes("edit") && (
                  <div className="h-5 px-2 bg-gray-100 rounded flex items-center">
                    <Edit className="h-3 w-3 text-gray-500" />
                  </div>
                )}
                {actions.includes("delete") && (
                  <div className="h-5 px-2 bg-red-100 rounded flex items-center">
                    <Trash2 className="h-3 w-3 text-red-500" />
                  </div>
                )}
                {actions.includes("view") && (
                  <div className="h-5 px-2 bg-blue-100 rounded flex items-center">
                    <Eye className="h-3 w-3 text-blue-500" />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap gap-2 text-[10px] text-gray-500">
        <span>Layout: <strong>{layout}</strong></span>
        <span>•</span>
        <span>{components.length} components</span>
        <span>•</span>
        <span>{actions.length} actions</span>
      </div>
    </div>
  );
}