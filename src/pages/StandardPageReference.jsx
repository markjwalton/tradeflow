import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { PlusIcon, EllipsisVerticalIcon } from '@heroicons/react/20/solid';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Menu, MenuButton, MenuItem, MenuItems, Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { usePagination } from "@/components/common/usePagination";
import TailwindPagination from "@/components/sturij/TailwindPagination";
import TailwindTabs from "@/components/sturij/TailwindTabs";
import { 
  AdjustmentsHorizontalIcon,
  ArrowUpTrayIcon,
  HomeIcon
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

  return (
    <>
      {/* Breadcrumb Navigation - Not Sticky */}
      <nav 
        aria-label="Breadcrumb" 
        className="flex"
        style={{ 
          borderBottom: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-background)'
        }}
      >
        <ol 
          role="list" 
          className="mx-auto flex w-full"
          style={{ 
            maxWidth: 'var(--breakpoint-xl)',
            paddingTop: 'var(--spacing-3)',
            paddingBottom: 'var(--spacing-3)',
            paddingLeft: 'var(--spacing-4)',
            paddingRight: 'var(--spacing-4)',
            gap: 'var(--spacing-4)'
          }}
        >
          <li className="flex">
            <div className="flex items-center">
              <a 
                href="#" 
                style={{ color: 'var(--color-text-muted)' }}
                className="hover:opacity-70"
              >
                <HomeIcon aria-hidden="true" className="size-5 shrink-0" />
                <span className="sr-only">Home</span>
              </a>
            </div>
          </li>
          <li className="flex">
            <div className="flex items-center">
              <svg
                fill="currentColor"
                viewBox="0 0 24 44"
                preserveAspectRatio="none"
                aria-hidden="true"
                className="h-full w-6 shrink-0"
                style={{ color: 'var(--color-border)' }}
              >
                <path d="M.293 0l22 22-22 22h1.414l22-22-22-22H.293z" />
              </svg>
              <a
                href="#"
                className="ml-4 text-sm font-medium hover:opacity-70"
                style={{ color: 'var(--color-text-muted)' }}
              >
                Category
              </a>
            </div>
          </li>
          <li className="flex">
            <div className="flex items-center">
              <svg
                fill="currentColor"
                viewBox="0 0 24 44"
                preserveAspectRatio="none"
                aria-hidden="true"
                className="h-full w-6 shrink-0"
                style={{ color: 'var(--color-border)' }}
              >
                <path d="M.293 0l22 22-22 22h1.414l22-22-22-22H.293z" />
              </svg>
              <a
                href="#"
                aria-current="page"
                className="ml-4 text-sm font-medium"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Standard Page Reference
              </a>
            </div>
          </li>
        </ol>
      </nav>

      {/* === PAGE HEADER SECTION - Sticky === */}
      <div className="sticky top-0 z-40" style={{ 
        backgroundColor: 'var(--color-background)',
        borderBottom: '1px solid var(--color-border)'
      }}>
        <div style={{ 
          paddingLeft: 'var(--spacing-4)', 
          paddingRight: 'var(--spacing-4)'
        }} className="sm:px-6 lg:px-8">

                {/* Page Title & Actions */}
                <div style={{ paddingTop: 'var(--spacing-6)', paddingBottom: 'var(--spacing-6)' }}>
                  <div className="md:flex md:items-center md:justify-between" style={{ gap: 'var(--spacing-5)' }}>
                    <div className="flex items-start" style={{ gap: 'var(--spacing-5)' }}>
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
                      <div style={{ paddingTop: 'var(--spacing-1.5)' }}>
                        <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Standard Page Reference</h1>
                        <p className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>
                          Golden standard for all pages with design tokens.
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
                        style={{
                          backgroundColor: 'var(--color-background)',
                          color: 'var(--color-text-primary)',
                          borderColor: 'var(--color-border)'
                        }}
                        className="inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-semibold shadow-xs ring-1 ring-inset hover:opacity-80"
                      >
                        <ArrowUpTrayIcon aria-hidden="true" className="-ml-0.5 h-5 w-5" />
                        Export
                      </button>
                      <button
                        type="button"
                        style={{
                          backgroundColor: 'var(--color-primary)',
                          color: 'var(--color-primary-foreground)'
                        }}
                        className="inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-semibold shadow-xs hover:opacity-90"
                      >
                        <PlusIcon aria-hidden="true" className="-ml-0.5 h-5 w-5" />
                        New Item
                      </button>
                    </div>
                  </div>
                </div>

          {/* Filter Button */}
          <div className="flex flex-col sm:flex-row gap-4" style={{ paddingBottom: 'var(--spacing-6)' }}>
            <button
              type="button"
              style={{
                backgroundColor: 'var(--color-background)',
                color: 'var(--color-text-primary)',
                borderColor: 'var(--color-border)'
              }}
              className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold shadow-xs ring-1 ring-inset hover:opacity-80 w-full sm:w-auto"
            >
              <AdjustmentsHorizontalIcon aria-hidden="true" className="-ml-0.5 h-5 w-5" />
              Filters
            </button>
          </div>

        </div>
      </div>

      {/* Tabs Navigation - Non-sticky, below header */}
      {paginatedData.length > 0 && (
        <div style={{ 
          backgroundColor: 'var(--color-background)',
          borderBottom: '1px solid var(--color-border)'
        }}>
          <div style={{ 
            paddingTop: 'var(--spacing-4)', 
            paddingBottom: 'var(--spacing-4)',
            paddingLeft: 'var(--spacing-4)',
            paddingRight: 'var(--spacing-4)'
          }} className="sm:px-6 lg:px-8">
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
      )}

      {/* === MAIN CONTENT SECTION === */}
      <div style={{ 
        paddingTop: 'var(--spacing-8)', 
        paddingBottom: 'var(--spacing-24)',
        paddingLeft: 'var(--spacing-4)',
        paddingRight: 'var(--spacing-4)'
      }} className="sm:px-6 lg:px-8">
        
        {/* Progress Bar */}
        {progress.visible && (
          <div style={{ 
            marginBottom: 'var(--spacing-8)',
            padding: 'var(--spacing-6)',
            backgroundColor: 'var(--color-card)',
            borderColor: 'var(--color-border)',
            borderWidth: '1px',
            borderRadius: 'var(--radius-lg)'
          }} className="shadow-sm">
            <h4 className="sr-only">Status</h4>
            <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{progress.message}</p>
            <div aria-hidden="true" style={{ marginTop: 'var(--spacing-6)' }}>
              <div className="overflow-hidden rounded-full" style={{ backgroundColor: 'var(--color-muted)' }}>
                <div 
                  style={{ 
                    width: `${progress.percent}%`,
                    backgroundColor: 'var(--color-primary)',
                    height: '0.5rem',
                    borderRadius: '9999px',
                    transition: 'all 500ms ease-out'
                  }} 
                />
              </div>
            </div>
          </div>
        )}
              
        {/* Pagination Top */}
        <div style={{ marginBottom: 'var(--spacing-6)' }}>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" style={{ gap: 'var(--spacing-6)' }}>
          {paginatedData.map((item) => (
            <div key={item.id} className="overflow-hidden group" style={{
              backgroundColor: 'var(--color-card)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{ padding: 'var(--spacing-6)' }}>
                <div className="flex items-start justify-between mb-4" style={{ gap: 'var(--spacing-3)' }}>
                  <div className="flex items-start flex-1 min-w-0" style={{ gap: 'var(--spacing-3)' }}>
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
                      <h3 className="text-base font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>{item.title}</h3>
                      <p className="mt-1 text-sm" style={{ color: 'var(--color-text-muted)' }}>
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
                
                <p className="text-sm line-clamp-2 mb-4" style={{ color: 'var(--color-text-body)' }}>
                  {item.description}
                </p>
                      
                {/* Action Buttons */}
                <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity" style={{ 
                  gap: 'var(--spacing-2)',
                  transitionDuration: 'var(--duration-200)'
                }}>
                  <button 
                    onClick={() => {
                      setSelectedItem(item);
                      setDrawerOpen(true);
                    }}
                    className="inline-flex items-center px-3 py-1.5 text-sm rounded-md hover:opacity-70"
                    style={{ 
                      gap: 'var(--spacing-1.5)',
                      color: 'var(--color-text-secondary)'
                    }}
                  >
                    View
                  </button>
                  <button className="inline-flex items-center px-3 py-1.5 text-sm rounded-md hover:opacity-70" style={{
                    gap: 'var(--spacing-1.5)',
                    color: 'var(--color-text-secondary)'
                  }}>
                    Edit
                  </button>
                  <Menu as="div" className="relative inline-block">
                    <MenuButton className="flex items-center rounded-full hover:opacity-70" style={{ padding: 'var(--spacing-1.5)', color: 'var(--color-text-muted)' }}>
                      <span className="sr-only">Open options</span>
                      <EllipsisVerticalIcon aria-hidden="true" className="size-5" />
                    </MenuButton>

                    <MenuItems
                      transition
                      style={{
                        backgroundColor: 'var(--color-card)',
                        borderRadius: 'var(--radius-md)',
                        boxShadow: 'var(--shadow-lg)'
                      }}
                      className="absolute right-0 z-10 mt-2 w-56 origin-top-right outline-1 outline-black/5 transition data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
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
                  </div>
                ))}
              </div>

        {/* Empty State */}
        {paginatedData.length === 0 && !isLoading && (
          <div className="text-center" style={{ paddingTop: 'var(--spacing-16)', paddingBottom: 'var(--spacing-16)' }}>
            <svg
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="mx-auto size-12"
              style={{ color: 'var(--color-text-muted)' }}
            >
              <path
                d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                strokeWidth={2}
                vectorEffect="non-scaling-stroke"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <h3 className="mt-2 text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>No items found</h3>
            <p className="mt-1 text-sm" style={{ color: 'var(--color-text-muted)' }}>Try adjusting your search or filters to find what you're looking for.</p>
            <div style={{ marginTop: 'var(--spacing-6)' }}>
              <button
                type="button"
                style={{
                  backgroundColor: 'var(--color-primary)',
                  color: 'var(--color-primary-foreground)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-xs)'
                }}
                className="inline-flex items-center px-3 py-2 text-sm font-semibold hover:opacity-90"
              >
                <PlusIcon aria-hidden="true" className="mr-1.5 -ml-0.5 size-5" />
                Create First Item
              </button>
            </div>
          </div>
        )}

        {/* Pagination Bottom */}
        <div style={{ marginTop: 'var(--spacing-8)' }}>
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

      {/* Item Details Drawer */}
      <Dialog open={drawerOpen} onClose={setDrawerOpen} className="relative" style={{ zIndex: 'var(--z-modal)' }}>
        <div className="fixed inset-0" />

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
              <DialogPanel
                transition
                className="pointer-events-auto w-screen max-w-md transform transition data-closed:translate-x-full"
                style={{
                  transitionDuration: 'var(--duration-500)',
                  transitionTimingFunction: 'var(--ease-in-out)'
                }}
              >
                <div className="relative flex h-full flex-col overflow-y-auto shadow-xl" style={{ 
                  backgroundColor: 'var(--color-card)',
                  paddingTop: 'var(--spacing-6)',
                  paddingBottom: 'var(--spacing-6)'
                }}>
                  <div style={{ paddingLeft: 'var(--spacing-4)', paddingRight: 'var(--spacing-4)' }} className="sm:px-6">
                    <div className="flex items-start justify-between">
                      <DialogTitle className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                        {selectedItem?.title || 'Item Details'}
                      </DialogTitle>
                      <div className="ml-3 flex h-7 items-center">
                        <button
                          type="button"
                          onClick={() => setDrawerOpen(false)}
                          className="relative rounded-md hover:opacity-70"
                          style={{ color: 'var(--color-text-muted)' }}
                        >
                          <span className="absolute -inset-2.5" />
                          <span className="sr-only">Close panel</span>
                          <XMarkIcon aria-hidden="true" className="size-6" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="relative mt-6 flex-1" style={{ paddingLeft: 'var(--spacing-4)', paddingRight: 'var(--spacing-4)' }}>
                    {selectedItem && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
                        <div>
                          <h3 className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>Status</h3>
                          <p className="mt-2 text-sm" style={{ color: 'var(--color-text-body)' }}>
                            <Badge variant={selectedItem.status === 'active' ? 'default' : 'secondary'}>
                              {selectedItem.status}
                            </Badge>
                          </p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>Category</h3>
                          <p className="mt-2 text-sm" style={{ color: 'var(--color-text-body)' }}>{selectedItem.category}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>Created</h3>
                          <p className="mt-2 text-sm" style={{ color: 'var(--color-text-body)' }}>
                            {new Date(selectedItem.created_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>Description</h3>
                          <p className="mt-2 text-sm" style={{ color: 'var(--color-text-body)' }}>{selectedItem.description}</p>
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
    </>
  );
}