export function findBreadcrumbTrail(items, currentSlug) {
  for (const item of items) {
    // Check both page_url and slug fields
    const itemSlug = item.page_url?.split("?")[0] || item.slug;
    if (itemSlug === currentSlug) {
      return [item];
    }

    if (item.children && item.children.length > 0) {
      // Recursively search through children
      for (const child of item.children) {
        const childSlug = child.page_url?.split("?")[0] || child.slug;
        if (childSlug === currentSlug) {
          return [item, child];
        }
        
        // Check nested children (for deeper hierarchies)
        if (child.children && child.children.length > 0) {
          const deeperTrail = findBreadcrumbTrail([child], currentSlug);
          if (deeperTrail.length > 0) {
            return [item, ...deeperTrail];
          }
        }
      }
    }
  }

  return [];
}