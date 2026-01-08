
/**
 * Sturij Design System Components
 * 
 * This is the SINGLE SOURCE OF TRUTH for all design system components.
 * Import from this file for easy access to all components.
 * 
 * Architecture:
 * - Layout shell is provided by Layout.jsx using TailwindAppShell
 * - All pages receive the shell automatically - no separate app shells needed
 * - These components are for page content, not layout chrome
 */

// Core Components
export { PageHeader } from './PageHeader';
export { PageSectionHeader } from './PageSectionHeader';
export { PageTitleHeader } from './PageTitleHeader';
export { TailwindFooter } from './TailwindFooter';
export { ContentSection } from './ContentSection';
export { FeatureCard } from './FeatureCard';
export { StatCard } from './StatCard';
export { StatusBadge } from './StatusBadge';
export { DataRow, DataRowGroup } from './DataRow';

// Layout Components (for reference - used by Layout.jsx)
export { default as TailwindNavigation } from './TailwindNavigation';
export { default as TailwindTopNav } from './TailwindTopNav';
export { default as TailwindMobileDrawer } from './TailwindMobileDrawer';
export { default as TailwindBreadcrumb } from './TailwindBreadcrumb';
export { default as TailwindCard } from './TailwindCard';
export { default as TailwindDrawer } from './TailwindDrawer';
