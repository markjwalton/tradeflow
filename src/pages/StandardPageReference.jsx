import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { PlusIcon, EllipsisVerticalIcon } from '@heroicons/react/20/solid';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Menu, MenuButton, MenuItem, MenuItems, Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { usePagination } from "@/components/common/usePagination";
import TailwindHeader from "@/components/sturij/TailwindHeader";
import TailwindPagination from "@/components/sturij/TailwindPagination";
import TailwindSidebar from "@/components/sturij/TailwindSidebar";
import TailwindTabs from "@/components/sturij/TailwindTabs";
import { 
  ChevronRightIcon, 
  AdjustmentsHorizontalIcon,
  ArrowUpTrayIcon
} from '@heroicons/react/20/solid';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

/**
 * GOLDEN STANDARD PAGE REFERENCE
 * 
 * Standard page that integrates with main Layout:
 * - Uses global AppShell for header and sidebar
 * - Page-specific header with breadcrumb and actions
 * - Sticky tabs navigation bar above footer
 * - Clean content area with proper spacing
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
    { name: 'Projects', href: '#', current: false },
  ];

  const sidebarNavigation = [
    { name: 'Dashboard', href: '#', icon: (props) => (
      <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ), current: true },
    {
      name: 'Teams',
      icon: (props) => (
        <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      current: false,
      children: [
        { name: 'Engineering', href: '#' },
        { name: 'Human Resources', href: '#' },
        { name: 'Customer Success', href: '#' },
      ],
    },
    {
      name: 'Projects',
      icon: (props) => (
        <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
      ),
      current: false,
      children: [
        { name: 'GraphQL API', href: '#' },
        { name: 'iOS App', href: '#' },
        { name: 'Android App', href: '#' },
        { name: 'New Customer Portal', href: '#' },
      ],
    },
    { name: 'Calendar', href: '#', icon: (props) => (
      <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ), current: false },
    { name: 'Documents', href: '#', icon: (props) => (
      <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ), current: false },
    { name: 'Reports', href: '#', icon: (props) => (
      <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ), current: false },
  ];

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Fixed Header - Full Width */}
      <div className="fixed top-0 left-0 right-0 z-50 h-16 bg-white border-b border-gray-200">
        <TailwindHeader navigation={headerNavigation} onSearch={setSearchQuery} />
      </div>

      {/* Content Below Header */}
      <div className="flex flex-1 pt-16 overflow-hidden">
        {/* Fixed Sidebar - Stops at sticky nav bar */}
        <div className="hidden lg:fixed lg:inset-y-16 lg:z-40 lg:flex lg:w-72 lg:flex-col" style={{ bottom: '64px' }}>
          <TailwindSidebar navigation={sidebarNavigation} />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 lg:pl-72 flex flex-col">
          <div className="flex-1 overflow-y-auto">
            {/* === PAGE HEADER SECTION === */}
            <div className="sticky top-0 z-40 bg-white border-b border-gray-200">
              <div className="px-4 sm:px-6 lg:px-8">
                {/* Breadcrumb */}
                <nav aria-label="Breadcrumb" className="flex py-3">
                  <ol className="flex items-center space-x-2 text-sm">
                    <li>
                      <a href="#" className="text-gray-400 hover:text-gray-500">Home</a>
                    </li>
                    <ChevronRightIcon aria-hidden="true" className="h-5 w-5 shrink-0 text-gray-400" />
                    <li>
                      <a href="#" className="text-gray-400 hover:text-gray-500">Category</a>
                    </li>
                    <ChevronRightIcon aria-hidden="true" className="h-5 w-5 shrink-0 text-gray-400" />
                    <li>
                      <span className="font-medium text-gray-900">Current Page</span>
                    </li>
                  </ol>
                </nav>

                {/* Page Title & Actions */}
                <div className="py-6">
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
                          Golden standard for all pages - pixel-perfect positioning with fixed header and sidebar.
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
                        className="inline-flex items-center justify-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                      >
                        <ArrowUpTrayIcon aria-hidden="true" className="-ml-0.5 h-5 w-5" />
                        Export
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center justify-center gap-2 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                      >
                        <PlusIcon aria-hidden="true" className="-ml-0.5 h-5 w-5" />
                        New Item
                      </button>
                    </div>
                  </div>
                </div>

                {/* Filter Button */}
                <div className="flex flex-col sm:flex-row gap-4 pb-6">
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-inset ring-gray-300 hover:bg-gray-50 w-full sm:w-auto"
                  >
                    <AdjustmentsHorizontalIcon aria-hidden="true" className="-ml-0.5 h-5 w-5" />
                    Filters
                  </button>
                </div>

              </div>
            </div>

            {/* === MAIN CONTENT SECTION === */}
            <div className="px-4 sm:px-6 lg:px-8 py-8 pb-24">
        
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
              <div className="mb-6">
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
                          View
                        </button>
                        <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
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
                <div className="text-center py-16">
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
              <div className="mt-8">
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
          </div>

          {/* Sticky Navigation Bar */}
          <div className="sticky bottom-0 z-30 bg-white border-t border-gray-200">
            <div className="px-4 sm:px-6 lg:px-8 py-3">
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
  );
}