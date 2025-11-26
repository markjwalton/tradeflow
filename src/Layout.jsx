import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  Home, 
  Navigation, 
  Building2, 
  RefreshCw,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const pages = [
  { name: "Home", slug: "Home", icon: Home },
  { name: "Navigation Manager", slug: "NavigationManager", icon: Navigation },
  { name: "Tenant Manager", slug: "TenantManager", icon: Building2 },
];

export default function Layout({ children, currentPageName }) {
  const navigate = useNavigate();
  
  const currentPage = pages.find(p => p.slug === currentPageName) || pages[0];
  const CurrentIcon = currentPage?.icon || Home;

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-4 border-b border-slate-700">
          <h1 className="text-lg font-bold">App Architect</h1>
          <p className="text-xs text-slate-400">Navigation Planner</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {pages.map((page) => {
            const Icon = page.icon;
            const isActive = currentPageName === page.slug;
            return (
              <Link
                key={page.slug}
                to={createPageUrl(page.slug)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive 
                    ? "bg-slate-700 text-white" 
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4" />
                {page.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="h-14 bg-white border-b flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            {/* Page Selector Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <CurrentIcon className="h-4 w-4" />
                  {currentPage?.name || "Select Page"}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {pages.map((page) => {
                  const Icon = page.icon;
                  return (
                    <DropdownMenuItem
                      key={page.slug}
                      onClick={() => navigate(createPageUrl(page.slug))}
                      className="gap-2"
                    >
                      <Icon className="h-4 w-4" />
                      {page.name}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Refresh Button */}
          <Button variant="ghost" size="icon" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </header>

        {/* Page Content */}
        <main className="flex-1 bg-gray-50 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}