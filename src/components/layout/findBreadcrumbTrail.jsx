export function findBreadcrumbTrail(items, currentSlug) {
  for (const item of items) {
    if (item.page_slug === currentSlug) {
      return [item];
    }

    if (item.children && item.children.length > 0) {
      const child = item.children.find((c) => c.page_slug === currentSlug);
      if (child) {
        return [item, child];
      }
    }
  }

  return [];
}