import { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";

export function usePagination(items = [], pageSlug = null) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [pageSettings, setPageSettings] = useState(null);

  // Load page settings and user preferences
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const user = await base44.auth.me();
        const globalDefault = user?.ui_preferences?.defaultItemsPerPage || 25;

        if (pageSlug) {
          const pages = await base44.entities.UIPage.filter({ slug: pageSlug });
          if (pages.length > 0) {
            const page = pages[0];
            setPageSettings(page);
            
            // Page setting overrides user preference
            if (page.items_per_page) {
              setItemsPerPage(page.items_per_page);
            } else {
              setItemsPerPage(globalDefault);
            }
          } else {
            setItemsPerPage(globalDefault);
          }
        } else {
          setItemsPerPage(globalDefault);
        }
      } catch (e) {
        // Use default if settings unavailable
        setItemsPerPage(25);
      }
    };

    loadSettings();
  }, [pageSlug]);

  // Reset to page 1 when items change (e.g., after filtering)
  useEffect(() => {
    setCurrentPage(1);
  }, [items.length]);

  // Calculate pagination values
  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalItems);

  // Get current page items
  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return items.slice(start, end);
  }, [items, currentPage, itemsPerPage]);

  // Navigation functions
  const goToPage = (page) => {
    const validPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(validPage);
    
    // Smooth scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const nextPage = () => goToPage(currentPage + 1);
  const previousPage = () => goToPage(currentPage - 1);
  const goToFirstPage = () => goToPage(1);
  const goToLastPage = () => goToPage(totalPages);

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page
  };

  return {
    // Current state
    currentPage,
    itemsPerPage,
    totalItems,
    totalPages,
    startIndex,
    endIndex,
    currentItems,
    pageSettings,

    // Navigation
    goToPage,
    nextPage,
    previousPage,
    goToFirstPage,
    goToLastPage,
    setItemsPerPage: handleItemsPerPageChange,

    // Helpers
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
  };
}