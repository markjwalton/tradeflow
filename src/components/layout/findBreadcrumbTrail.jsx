export function findBreadcrumbTrail(items, currentSlug) {
  for (const item of items) {
    // Check both page_url and slug fields
    const itemSlug = item.page_url?.split("?")[0] || item.slug;
    if (itemSlug === currentSlug) {
      return [item];
    }

    if (item.children && item.children.length > 0) {
      const child = item.children.find((c) => {
        const childSlug = c.page_url?.split("?")[0] || c.slug;
        return childSlug === currentSlug;
      });
      if (child) {
        return [item, child];
      }
    }
  }

  return [];
}