import { AppHeader } from "./AppHeader";
import { AppSidebar } from "./AppSidebar";
import { AppFooter } from "./AppFooter";
import { AppContent } from "./AppContent";

export function AppShell({ children, user, tenant, navItems = [] }) {
  // Organize flat navItems into hierarchical structure
  const organizeNavigation = (items) => {
    const itemMap = {};
    const roots = [];

    // First pass: create map of all items
    items.forEach((item) => {
      itemMap[item.id] = { ...item, children: [] };
    });

    // Second pass: build hierarchy
    items.forEach((item) => {
      if (item.parent_id && itemMap[item.parent_id]) {
        itemMap[item.parent_id].children.push(itemMap[item.id]);
      } else {
        roots.push(itemMap[item.id]);
      }
    });

    // Sort by order
    const sortByOrder = (arr) => {
      arr.sort((a, b) => (a.order || 0) - (b.order || 0));
      arr.forEach((item) => {
        if (item.children?.length > 0) {
          sortByOrder(item.children);
        }
      });
      return arr;
    };

    return sortByOrder(roots);
  };

  const organizedNavItems = organizeNavigation(navItems);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-background)]">
      <AppHeader user={user} navItems={organizedNavItems} />

      <div className="flex flex-1 overflow-hidden">
        <AppSidebar navItems={organizedNavItems} />
        <div className="flex-1 flex flex-col">
          <AppContent navItems={organizedNavItems}>{children}</AppContent>
        </div>
      </div>

      <AppFooter tenant={tenant} />
    </div>
  );
}