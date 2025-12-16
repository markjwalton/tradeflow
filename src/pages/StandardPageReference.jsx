import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  Search, Filter, Download, Upload, Plus, Edit2, Trash2, 
  MoreHorizontal, Eye, Star, Share2, Settings, ChevronLeft, ChevronRight 
} from "lucide-react";
import { PlusIcon, EllipsisVerticalIcon } from '@heroicons/react/20/solid';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Menu, MenuButton, MenuItem, MenuItems, Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { usePagination } from "@/components/common/usePagination";
import TailwindHeader from "@/components/sturij/TailwindHeader";
import TailwindPagination from "@/components/sturij/TailwindPagination";
import TailwindSidebar from "@/components/sturij/TailwindSidebar";
import TailwindTabs from "@/components/sturij/TailwindTabs";

/**
 * GOLDEN STANDARD PAGE REFERENCE
 * 
 * This page demonstrates the perfect implementation of:
 * - Design token usage for all styling
 * - Standard page structure
 * - Pagination integration
 * - Responsive layouts
 * - Proper spacing, shadows, typography
 * - Mobile/tablet optimizations
 * 
 * USE THIS AS THE TEMPLATE FOR ALL PAGES
 */

export default function StandardPageReference() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [currentUser, setCurrentUser] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [progress, setProgress] = useState({ visible: false, percent: 0, message: '' });
  
  useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => {});
  }, []);

  // Sample data query - replace with your entity
  const { data: items = [], isLoading } = useQuery({
    queryKey: ['sampleItems', searchQuery, activeTab],
    queryFn: async () => {
      // Simulated data - replace with real entity query
      return Array.from({ length: 47 }, (_, i) => ({
        id: `item-${i + 1}`,
        title: `Sample Item ${i + 1}`,
        status: ['active', 'pending', 'completed'][i % 3],
        category: ['Design', 'Development', 'Marketing'][i % 3],
        created_date: new Date(Date.now() - i * 86400000).toISOString(),
        description: 'This is a sample description for the item.',
      }));
    },
  });

  // Filter items based on search and tab
  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'all' || item.status === activeTab;
    return matchesSearch && matchesTab;
  });

  // Pagination
  const {
    currentPage,
    totalPages,
    paginatedData = [],
    goToPage,
    nextPage,
    prevPage,
    canGoNext,
    canGoPrev,
    itemsPerPage,
    setItemsPerPage,
    startIndex,
    endIndex,
    totalItems,
  } = usePagination(filteredItems, 25);

  const headerNavigation = [
    { name: 'Dashboard', href: '#', current: true },
    { name: 'Team', href: '#', current: false },
    { name: 'Projects', href: '#', current: false },
    { name: 'Calendar', href: '#', current: false },
  ];

  const sidebarNavigation = [
    { name: 'Dashboard', href: '#', current: true },
    {
      name: 'Teams',
      current: false,
      children: [
        { name: 'Engineering', href: '#' },
        { name: 'Human Resources', href: '#' },
        { name: 'Customer Success', href: '#' },
      ],
    },
    {
      name: 'Projects',
      current: false,
      children: [
        { name: 'GraphQL API', href: '#' },
        { name: 'iOS App', href: '#' },
        { name: 'Android App', href: '#' },
        { name: 'New Customer Portal', href: '#' },
      ],
    },
    { name: 'Calendar', href: '#', current: false },
    { name: 'Documents', href: '#', current: false },
    { name: 'Reports', href: '#', current: false },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Tailwind UI Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        <TailwindSidebar navigation={sidebarNavigation} />
      </div>

      {/* Main content area */}
      <div className="lg:pl-72 flex flex-col flex-1">
        {/* Tailwind UI Header */}
        <TailwindHeader navigation={headerNavigation} onSearch={setSearchQuery} />
        
        {/* === PAGE HEADER SECTION === */}
      {/* Demonstrates: Title, breadcrumb, description, actions */}
      <div 
        className="sticky top-16 z-[var(--z-sticky)] backdrop-blur-sm border-b"
        style={{
          backgroundColor: 'var(--color-background)',
          borderColor: 'var(--color-border)',
        }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex py-[var(--spacing-3)]" aria-label="Breadcrumb">
            <ol className="flex items-center gap-[var(--spacing-2)] font-[var(--font-family-display)] text-[var(--text-sm)]">
              <li>
                <a 
                  href="#" 
                  className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors duration-[var(--duration-200)]"
                >
                  Home
                </a>
              </li>
              <ChevronRight className="h-4 w-4 text-[var(--color-text-muted)]" />
              <li>
                <a 
                  href="#" 
                  className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors duration-[var(--duration-200)]"
                >
                  Category
                </a>
              </li>
              <ChevronRight className="h-4 w-4 text-[var(--color-text-muted)]" />
              <li>
                <span className="text-[var(--color-text-primary)] font-[var(--font-weight-medium)]">
                  Current Page
                </span>
              </li>
            </ol>
          </nav>

          {/* Page Title & Actions - Profile Header Pattern */}
          <div className="py-[var(--spacing-6)]">
            <div className="md:flex md:items-center md:justify-between md:space-x-5">
              <div className="flex items-start space-x-5">
                <div className="shrink-0">
                  <div className="relative">
                    <img
                      alt=""
                      src={currentUser?.profile_picture || "https://images.unsplash.com/photo-1463453091185-61582044d556?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=1024&h=1024&q=80"}
                      className="size-16 rounded-full"
                    />
                    <span aria-hidden="true" className="absolute inset-0 rounded-full shadow-inner" />
                  </div>
                </div>
                <div className="pt-1.5">
                  <h1 className="text-2xl font-bold text-gray-900">Standard Page Reference</h1>
                  <p className="text-sm font-medium text-gray-500">
                    Golden standard for all pages - perfect spacing, shadows, typography, and responsive design using design tokens.
                  </p>
                </div>
              </div>
              <div className="mt-6 flex flex-col-reverse justify-stretch space-y-4 space-y-reverse sm:flex-row-reverse sm:justify-end sm:space-y-0 sm:space-x-3 sm:space-x-reverse md:mt-0 md:flex-row md:space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setProgress({ visible: true, percent: 0, message: 'Preparing export...' });
                    setTimeout(() => setProgress({ visible: true, percent: 25, message: 'Gathering data...' }), 500);
                    setTimeout(() => setProgress({ visible: true, percent: 50, message: 'Processing files...' }), 1000);
                    setTimeout(() => setProgress({ visible: true, percent: 75, message: 'Compressing archive...' }), 1500);
                    setTimeout(() => setProgress({ visible: true, percent: 100, message: 'Complete!' }), 2000);
                    setTimeout(() => setProgress({ visible: false, percent: 0, message: '' }), 2500);
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs inset-ring inset-ring-gray-300 hover:bg-gray-50"
                >
                  <Upload className="h-4 w-4" />
                  Export
                </button>
                <button
                  type="button"
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  <Plus className="h-4 w-4" />
                  New Item
                </button>
              </div>
            </div>
          </div>

          {/* Filter Button */}
          <div className="flex flex-col sm:flex-row gap-4 pb-6">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs inset-ring inset-ring-gray-300 hover:bg-gray-50 w-full sm:w-auto"
            >
              <Filter className="h-4 w-4" />
              Filters
            </button>
          </div>

          {/* Tabs for Status Filtering */}
          <div className="pb-[var(--spacing-6)]">
            <TailwindTabs 
              tabs={[
                { name: 'All Items', value: 'all' },
                { name: 'Active', value: 'active' },
                { name: 'Pending', value: 'pending' },
                { name: 'Completed', value: 'completed' }
              ]}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          </div>
        </div>
      </div>

      {/* === MAIN CONTENT SECTION === */}
      {/* This is the extractable section that can be replaced per page */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-[var(--spacing-8)]">
        
        {/* Progress Bar */}
        {progress.visible && (
          <div className="mb-8 rounded-lg bg-white p-6 shadow-sm border border-gray-200">
            <h4 className="sr-only">Status</h4>
            <p className="text-sm font-medium text-gray-900">{progress.message}</p>
            <div aria-hidden="true" className="mt-6">
              <div className="overflow-hidden rounded-full bg-gray-200">
                <div 
                  style={{ width: `${progress.percent}%` }} 
                  className="h-2 rounded-full bg-indigo-600 transition-all duration-500 ease-out" 
                />
              </div>
            </div>
          </div>
        )}
        {/* Pagination Top */}
        <div className="mb-[var(--spacing-6)]">
          <TailwindPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={goToPage}
            onNextPage={nextPage}
            onPrevPage={prevPage}
            canGoNext={canGoNext}
            canGoPrev={canGoPrev}
            startIndex={startIndex}
            endIndex={endIndex}
            totalItems={totalItems}
          />
        </div>

        {/* Grid Layout - Responsive */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedData.map((item) => (
            <div key={item.id} className="overflow-hidden rounded-lg bg-white shadow-sm group">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <span className="relative inline-block shrink-0">
                      <img
                        alt=""
                        src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                        className="size-10 rounded-full outline -outline-offset-1 outline-black/5"
                      />
                      <span className={`absolute top-0 right-0 block size-2.5 rounded-full ring-2 ring-white ${
                        item.status === 'active' ? 'bg-green-400' : 
                        item.status === 'pending' ? 'bg-red-400' : 'bg-gray-300'
                      }`} />
                    </span>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-gray-900 truncate">{item.title}</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {new Date(item.created_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge 
                    variant={item.status === 'active' ? 'default' : 'secondary'}
                    className="shrink-0"
                  >
                    {item.status}
                  </Badge>
                </div>
                
                <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                  {item.description}
                </p>
                
                {/* Action Buttons */}
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button 
                    onClick={() => {
                      setSelectedItem(item);
                      setDrawerOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
                  >
                    <Eye className="h-4 w-4" />
                    View
                  </button>
                  <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
                    <Edit2 className="h-4 w-4" />
                    Edit
                  </button>
                  <Menu as="div" className="relative inline-block">
                    <MenuButton className="flex items-center rounded-full p-1.5 text-gray-400 hover:text-gray-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                      <span className="sr-only">Open options</span>
                      <EllipsisVerticalIcon aria-hidden="true" className="size-5" />
                    </MenuButton>

                    <MenuItems
                      transition
                      className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg outline-1 outline-black/5 transition data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
                    >
                      <div className="py-1">
                        <MenuItem>
                          <a
                            href="#"
                            className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden"
                          >
                            Duplicate
                          </a>
                        </MenuItem>
                        <MenuItem>
                          <a
                            href="#"
                            className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden"
                          >
                            Share
                          </a>
                        </MenuItem>
                        <MenuItem>
                          <a
                            href="#"
                            className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden"
                          >
                            Archive
                          </a>
                        </MenuItem>
                        <MenuItem>
                          <button
                            type="button"
                            className="block w-full px-4 py-2 text-left text-sm text-red-700 data-focus:bg-gray-100 data-focus:text-red-900 data-focus:outline-hidden"
                          >
                            Delete
                          </button>
                        </MenuItem>
                      </div>
                    </MenuItems>
                  </Menu>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {paginatedData.length === 0 && !isLoading && (
          <div className="text-center py-[var(--spacing-16)]">
            <svg
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="mx-auto size-12 text-gray-400"
            >
              <path
                d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                strokeWidth={2}
                vectorEffect="non-scaling-stroke"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <h3 className="mt-2 text-sm font-semibold text-gray-900">No items found</h3>
            <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filters to find what you're looking for.</p>
            <div className="mt-6">
              <button
                type="button"
                className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                <PlusIcon aria-hidden="true" className="mr-1.5 -ml-0.5 size-5" />
                Create First Item
              </button>
            </div>
          </div>
        )}

        {/* Pagination Bottom */}
        <div className="mt-[var(--spacing-8)]">
          <TailwindPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={goToPage}
            onNextPage={nextPage}
            onPrevPage={prevPage}
            canGoNext={canGoNext}
            canGoPrev={canGoPrev}
            startIndex={startIndex}
            endIndex={endIndex}
            totalItems={totalItems}
          />
        </div>
      </div>

      {/* === REFERENCE DOCUMENTATION === */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-[var(--spacing-12)]">
        <Card>
          <CardHeader>
            <CardTitle>Design Token Reference</CardTitle>
            <CardDescription>
              All elements on this page use design tokens exclusively. Copy this structure for consistent styling.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-[var(--spacing-6)]">
            {/* Spacing Reference */}
            <div>
              <h3 className="font-[var(--font-family-display)] text-[var(--text-base)] font-[var(--font-weight-medium)] tracking-[var(--tracking-airy)] text-[var(--color-text-secondary)] mb-[var(--spacing-3)]">
                Spacing Scale
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-[var(--spacing-4)]">
                {[
                  { token: '--spacing-1', value: '0.25rem', usage: 'Tight spacing' },
                  { token: '--spacing-2', value: '0.5rem', usage: 'Small gaps' },
                  { token: '--spacing-3', value: '0.75rem', usage: 'Icon gaps' },
                  { token: '--spacing-4', value: '1rem', usage: 'Standard padding' },
                  { token: '--spacing-6', value: '1.5rem', usage: 'Card padding' },
                  { token: '--spacing-8', value: '2rem', usage: 'Section spacing' },
                  { token: '--spacing-12', value: '3rem', usage: 'Large sections' },
                  { token: '--spacing-16', value: '4rem', usage: 'Page sections' },
                ].map((space) => (
                  <div 
                    key={space.token}
                    className="p-[var(--spacing-3)] rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-card)]"
                  >
                    <code className="font-[var(--font-family-mono)] text-[var(--text-xs)] text-[var(--color-primary)]">
                      {space.token}
                    </code>
                    <p className="font-[var(--font-family-body)] text-[var(--text-xs)] text-[var(--color-text-muted)] mt-[var(--spacing-1)]">
                      {space.value} - {space.usage}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Typography Reference */}
            <div>
              <h3 className="font-[var(--font-family-display)] text-[var(--text-base)] font-[var(--font-weight-medium)] tracking-[var(--tracking-airy)] text-[var(--color-text-secondary)] mb-[var(--spacing-3)]">
                Typography Scale
              </h3>
              <div className="space-y-[var(--spacing-3)]">
                <div className="p-[var(--spacing-4)] rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-card)]">
                  <p className="font-[var(--font-family-display)] text-[var(--text-3xl)] font-[var(--font-weight-light)] tracking-[var(--tracking-airy)] text-[var(--color-text-primary)]">
                    Page Title (--text-3xl, display font, light)
                  </p>
                </div>
                <div className="p-[var(--spacing-4)] rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-card)]">
                  <p className="font-[var(--font-family-display)] text-[var(--text-xl)] font-[var(--font-weight-normal)] tracking-[var(--tracking-airy)] text-[var(--color-text-secondary)]">
                    Section Title (--text-xl, display font, normal)
                  </p>
                </div>
                <div className="p-[var(--spacing-4)] rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-card)]">
                  <p className="font-[var(--font-family-body)] text-[var(--text-base)] text-[var(--color-text-body)] leading-[var(--leading-relaxed)]">
                    Body Text (--text-base, body font, relaxed leading)
                  </p>
                </div>
                <div className="p-[var(--spacing-4)] rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-card)]">
                  <p className="font-[var(--font-family-body)] text-[var(--text-sm)] text-[var(--color-text-muted)] leading-[var(--leading-normal)]">
                    Caption/Helper Text (--text-sm, muted color)
                  </p>
                </div>
              </div>
            </div>

            {/* Shadow Reference */}
            <div>
              <h3 className="font-[var(--font-family-display)] text-[var(--text-base)] font-[var(--font-weight-medium)] tracking-[var(--tracking-airy)] text-[var(--color-text-secondary)] mb-[var(--spacing-3)]">
                Shadow Scale
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-[var(--spacing-4)]">
                {[
                  { token: '--shadow-sm', usage: 'Cards' },
                  { token: '--shadow-md', usage: 'Card hover' },
                  { token: '--shadow-lg', usage: 'Dropdowns' },
                  { token: '--shadow-xl', usage: 'Modals' },
                  { token: '--shadow-2xl', usage: 'Major elevation' },
                ].map((shadow) => (
                  <div 
                    key={shadow.token}
                    className="p-[var(--spacing-6)] rounded-[var(--radius-lg)] bg-[var(--color-card)]"
                    style={{
                      boxShadow: `var(${shadow.token})`,
                    }}
                  >
                    <code className="font-[var(--font-family-mono)] text-[var(--text-xs)] text-[var(--color-primary)]">
                      {shadow.token}
                    </code>
                    <p className="font-[var(--font-family-body)] text-[var(--text-xs)] text-[var(--color-text-muted)] mt-[var(--spacing-1)]">
                      {shadow.usage}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Border Radius Reference */}
            <div>
              <h3 className="font-[var(--font-family-display)] text-[var(--text-base)] font-[var(--font-weight-medium)] tracking-[var(--tracking-airy)] text-[var(--color-text-secondary)] mb-[var(--spacing-3)]">
                Border Radius
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-[var(--spacing-4)]">
                {[
                  { token: '--radius-sm', value: '0.25rem' },
                  { token: '--radius-md', value: '0.375rem' },
                  { token: '--radius-lg', value: '0.5rem' },
                  { token: '--radius-xl', value: '0.75rem' },
                  { token: '--radius-2xl', value: '1rem' },
                  { token: '--radius-full', value: '9999px' },
                ].map((radius) => (
                  <div 
                    key={radius.token}
                    className="p-[var(--spacing-4)] border border-[var(--color-border)] bg-[var(--color-card)]"
                    style={{
                      borderRadius: `var(${radius.token})`,
                    }}
                  >
                    <code className="font-[var(--font-family-mono)] text-[var(--text-xs)] text-[var(--color-primary)]">
                      {radius.token}
                    </code>
                    <p className="font-[var(--font-family-body)] text-[var(--text-xs)] text-[var(--color-text-muted)] mt-[var(--spacing-1)]">
                      {radius.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Item Details Drawer */}
      <Dialog open={drawerOpen} onClose={setDrawerOpen} className="relative z-10">
        <div className="fixed inset-0" />

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
              <DialogPanel
                transition
                className="pointer-events-auto w-screen max-w-md transform transition duration-500 ease-in-out data-closed:translate-x-full sm:duration-700"
              >
                <div className="relative flex h-full flex-col overflow-y-auto bg-white py-6 shadow-xl">
                  <div className="px-4 sm:px-6">
                    <div className="flex items-start justify-between">
                      <DialogTitle className="text-base font-semibold text-gray-900">
                        {selectedItem?.title || 'Item Details'}
                      </DialogTitle>
                      <div className="ml-3 flex h-7 items-center">
                        <button
                          type="button"
                          onClick={() => setDrawerOpen(false)}
                          className="relative rounded-md text-gray-400 hover:text-gray-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        >
                          <span className="absolute -inset-2.5" />
                          <span className="sr-only">Close panel</span>
                          <XMarkIcon aria-hidden="true" className="size-6" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="relative mt-6 flex-1 px-4 sm:px-6">
                    {selectedItem && (
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">Status</h3>
                          <p className="mt-2 text-sm text-gray-700">
                            <Badge variant={selectedItem.status === 'active' ? 'default' : 'secondary'}>
                              {selectedItem.status}
                            </Badge>
                          </p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">Category</h3>
                          <p className="mt-2 text-sm text-gray-700">{selectedItem.category}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">Created</h3>
                          <p className="mt-2 text-sm text-gray-700">
                            {new Date(selectedItem.created_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">Description</h3>
                          <p className="mt-2 text-sm text-gray-700">{selectedItem.description}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </DialogPanel>
            </div>
          </div>
        </div>
      </Dialog>
      </div>
    </div>
  );
}