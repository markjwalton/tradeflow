export function findBreadcrumbTrail(items, currentSlug) {
  for (const item of items) {
    // Check page_url field (which contains the slug)
    const itemSlug = item.page_url?.split("?")[0];
    if (itemSlug === currentSlug) {
      return [item];
    }

    if (item.children && item.children.length > 0) {
      const child = item.children.find((c) => {
        const childSlug = c.page_url?.split("?")[0];
        return childSlug === currentSlug;
      });
      if (child) {
        return [item, child];
      }
    }
  }

  return [];
}