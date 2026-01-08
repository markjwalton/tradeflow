/**
 * Component Category System for Design System Editor
 * Defines all editable UI components with their applicable style categories
 * Tailwind 4.0 compatible
 */

export const STYLE_CATEGORIES = {
  border: {
    name: 'Border',
    description: 'Border styles including width, color, radius, and style',
    properties: ['--color-border', '--border-width', '--border-style', '--border-left-width', '--border-left-color', '--conditional-bg']
  },
  padding: {
    name: 'Spacing',
    description: 'Internal spacing (padding) and external spacing (margin)',
    properties: ['--spacing-1', '--spacing-2', '--spacing-3', '--spacing-4', '--spacing-5', '--spacing-6', '--spacing-8', '--spacing-10', '--spacing-12', '--spacing-16']
  },
  font: {
    name: 'Typography',
    description: 'Font family, size, weight, line height, letter spacing, alignment',
    properties: ['--font-family-display', '--font-family-body', '--text-xs', '--text-sm', '--text-base', '--text-lg', '--text-xl', '--text-2xl', '--text-3xl', '--text-4xl', '--text-5xl', '--font-weight-normal', '--font-weight-medium', '--font-weight-semibold', '--font-weight-bold', '--leading-tight', '--leading-snug', '--leading-normal', '--leading-relaxed', '--leading-loose', '--tracking-tight', '--tracking-normal', '--tracking-wide', '--tracking-airy', '--text-align', '--word-spacing-tight', '--word-spacing-normal', '--word-spacing-wide', '--word-spacing-airy', '--paragraph-spacing-tight', '--paragraph-spacing-normal', '--paragraph-spacing-relaxed', '--paragraph-spacing-loose']
  },
  text: {
    name: 'Colors',
    description: 'Text and foreground colors',
    properties: ['--color-primary', '--color-secondary', '--color-text-primary', '--color-text-secondary', '--color-text-muted']
  },
  background: {
    name: 'Backgrounds',
    description: 'Background colors, gradients, and patterns',
    properties: ['--color-background', '--color-card', '--color-muted', '--card-bg-pattern', '--card-pattern-color', '--card-pattern-opacity', '--page-bg-pattern', '--page-pattern-color', '--page-pattern-opacity']
  },
  position: {
    name: 'Position',
    description: 'Z-index and layering',
    properties: ['--z-base', '--z-dropdown', '--z-sticky', '--z-fixed', '--z-modal']
  },
  extras: {
    name: 'Transparency',
    description: 'Opacity and transparency effects',
    properties: ['--opacity']
  },
  css3: {
    name: 'Shadows & Radius',
    description: 'Box shadows, border radius, and other CSS3 effects',
    properties: ['--shadow-card', '--shadow-card-hover', '--radius-button', '--shadow-xs', '--shadow-sm', '--shadow-md', '--shadow-lg', '--shadow-xl', '--shadow-2xl', '--radius-none', '--radius-xs', '--radius-sm', '--radius-md', '--radius-lg', '--radius-xl', '--radius-2xl', '--radius-3xl', '--radius-full']
  }
};

export const COMPONENT_CATEGORIES = [
  {
    value: 'button',
    label: 'Button',
    description: 'Interactive elements for user actions',
    functionalSpec: 'Triggers actions, navigates, submits forms. Supports variants (default, destructive, outline, secondary, ghost, link), sizes (sm, default, lg, icon), and states (default, hover, focus, active, disabled).',
    applicableStyles: ['border', 'padding', 'font', 'text', 'background', 'css3'],
    variants: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
    sizes: ['sm', 'default', 'lg', 'icon'],
    states: ['default', 'hover', 'focus', 'active', 'disabled'],
    hasIcon: true,
    examples: ['Primary CTA', 'Secondary action', 'Icon button', 'Link button']
  },
  {
    value: 'card',
    label: 'Card',
    description: 'Container for grouped content',
    functionalSpec: 'Groups related information with header, content, footer sections. Supports elevation via shadows, border styles, and background patterns. Used for lists, dashboards, detail views.',
    applicableStyles: ['border', 'padding', 'background', 'position', 'css3'],
    variants: ['default', 'elevated', 'bordered', 'interactive'],
    sizes: ['compact', 'default', 'spacious'],
    states: ['default', 'hover'],
    hasIcon: false,
    examples: ['Dashboard widget', 'Product card', 'User profile card', 'List item']
  },
  {
    value: 'typography',
    label: 'Typography',
    description: 'Text elements and headings',
    functionalSpec: 'Displays text content with semantic hierarchy (h1-h6, p, span). Supports font families, sizes, weights, line heights, letter spacing, and colors. Maintains readability and visual hierarchy.',
    applicableStyles: ['font', 'text'],
    variants: ['heading', 'body', 'caption', 'code'],
    sizes: ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl'],
    states: ['default'],
    hasIcon: false,
    examples: ['Page heading', 'Body text', 'Caption', 'Code snippet']
  },
  {
    value: 'badge',
    label: 'Badge',
    description: 'Status indicators and labels',
    functionalSpec: 'Displays small pieces of information like status, category, count. Supports variants (default, destructive, warning, success, outline), dismissible state, and status dots.',
    applicableStyles: ['padding', 'font', 'text', 'background', 'border', 'css3'],
    variants: ['default', 'destructive', 'warning', 'success', 'info', 'accent', 'secondary', 'outline'],
    sizes: ['sm', 'default', 'lg'],
    states: ['default'],
    hasIcon: true,
    examples: ['Status badge', 'Category tag', 'Count indicator', 'Notification dot']
  },
  {
    value: 'input',
    label: 'Input',
    description: 'Text input fields',
    functionalSpec: 'Allows user text entry. Supports various types (text, email, password, number), validation states (error, success), placeholders, and labels.',
    applicableStyles: ['border', 'padding', 'font', 'text', 'background', 'css3'],
    variants: ['default', 'filled', 'outlined'],
    sizes: ['sm', 'default', 'lg'],
    states: ['default', 'hover', 'focus', 'disabled', 'error', 'success'],
    hasIcon: true,
    examples: ['Text field', 'Email input', 'Password field', 'Search input']
  },
  {
    value: 'select',
    label: 'Select',
    description: 'Dropdown selection menus',
    functionalSpec: 'Allows selection from options list. Supports single/multi-select, searchable variants, grouped options, and custom triggers.',
    applicableStyles: ['border', 'padding', 'font', 'text', 'background', 'css3'],
    variants: ['default', 'outlined', 'filled'],
    sizes: ['sm', 'default', 'lg'],
    states: ['default', 'hover', 'focus', 'disabled', 'open'],
    hasIcon: true,
    examples: ['Dropdown menu', 'Multi-select', 'Searchable select', 'Grouped options']
  },
  {
    value: 'dialog',
    label: 'Dialog/Modal',
    description: 'Modal overlay windows',
    functionalSpec: 'Displays content over the main interface. Supports different sizes, overlay darkness, close behaviors, and animations. Used for forms, confirmations, detail views.',
    applicableStyles: ['border', 'padding', 'background', 'position', 'css3'],
    variants: ['default', 'alert', 'sheet', 'drawer'],
    sizes: ['sm', 'default', 'lg', 'xl', 'full'],
    states: ['open', 'closed'],
    hasIcon: false,
    examples: ['Confirmation dialog', 'Form modal', 'Image lightbox', 'Side drawer']
  },
  {
    value: 'alert',
    label: 'Alert',
    description: 'Notification and message boxes',
    functionalSpec: 'Displays important messages to users. Supports variants (info, warning, error, success), dismissible state, and icon indicators.',
    applicableStyles: ['border', 'padding', 'font', 'text', 'background', 'css3'],
    variants: ['default', 'info', 'warning', 'error', 'success'],
    sizes: ['default', 'compact'],
    states: ['default', 'dismissible'],
    hasIcon: true,
    examples: ['Info banner', 'Error message', 'Success notification', 'Warning alert']
  },
  {
    value: 'table',
    label: 'Table',
    description: 'Tabular data display',
    functionalSpec: 'Displays structured data in rows and columns. Supports sorting, filtering, pagination, row selection, and responsive layouts.',
    applicableStyles: ['border', 'padding', 'font', 'text', 'background'],
    variants: ['default', 'striped', 'bordered', 'compact'],
    sizes: ['compact', 'default', 'spacious'],
    states: ['default', 'hover', 'selected'],
    hasIcon: false,
    examples: ['Data table', 'Pricing table', 'Comparison table', 'List view']
  },
  {
    value: 'navigation',
    label: 'Navigation',
    description: 'Navigation menus and links',
    functionalSpec: 'Enables site navigation. Includes nav bars, sidebars, breadcrumbs, tabs. Supports active states, nested menus, icons, and responsive collapsing.',
    applicableStyles: ['border', 'padding', 'font', 'text', 'background', 'css3'],
    variants: ['horizontal', 'vertical', 'tabs', 'breadcrumb'],
    sizes: ['compact', 'default', 'expanded'],
    states: ['default', 'hover', 'active', 'disabled'],
    hasIcon: true,
    examples: ['Top nav', 'Sidebar', 'Tabs', 'Breadcrumb trail']
  },
  {
    value: 'tooltip',
    label: 'Tooltip',
    description: 'Contextual help text',
    functionalSpec: 'Displays additional information on hover/focus. Supports positioning (top, bottom, left, right), arrow indicators, and delay timing.',
    applicableStyles: ['padding', 'font', 'text', 'background', 'css3'],
    variants: ['default', 'arrow'],
    sizes: ['sm', 'default'],
    states: ['visible', 'hidden'],
    hasIcon: false,
    examples: ['Help tooltip', 'Info popup', 'Icon explanation', 'Field hint']
  },
  {
    value: 'avatar',
    label: 'Avatar',
    description: 'User profile images',
    functionalSpec: 'Displays user profile pictures or initials. Supports various sizes, shapes (circle, square, rounded), fallback states, status indicators.',
    applicableStyles: ['border', 'css3'],
    variants: ['circle', 'square', 'rounded'],
    sizes: ['xs', 'sm', 'default', 'lg', 'xl'],
    states: ['default', 'online', 'offline', 'away'],
    hasIcon: false,
    examples: ['User profile pic', 'Comment avatar', 'Team member icon', 'Account badge']
  },
  {
    value: 'skeleton',
    label: 'Skeleton Loader',
    description: 'Loading state placeholders',
    functionalSpec: 'Shows placeholder content while data loads. Mimics the layout of the content being loaded. Supports animation variants and different shapes.',
    applicableStyles: ['background', 'css3'],
    variants: ['pulse', 'wave'],
    sizes: ['default'],
    states: ['loading'],
    hasIcon: false,
    examples: ['Card skeleton', 'Text skeleton', 'List skeleton', 'Table skeleton']
  },
  {
    value: 'separator',
    label: 'Separator',
    description: 'Visual dividers',
    functionalSpec: 'Separates content sections. Supports horizontal/vertical orientation, various styles (solid, dashed), and thickness options.',
    applicableStyles: ['border', 'background'],
    variants: ['solid', 'dashed', 'dotted'],
    sizes: ['thin', 'default', 'thick'],
    states: ['default'],
    hasIcon: false,
    examples: ['Section divider', 'Menu separator', 'Toolbar divider', 'Content break']
  }
];

/**
 * Get applicable style categories for a component type
 */
export function getApplicableStyles(componentValue) {
  const component = COMPONENT_CATEGORIES.find(c => c.value === componentValue);
  return component?.applicableStyles || [];
}

/**
 * Check if a style category applies to a component
 */
export function isStyleApplicable(componentValue, styleCategory) {
  const applicableStyles = getApplicableStyles(componentValue);
  return applicableStyles.includes(styleCategory);
}

/**
 * Get component specification
 */
export function getComponentSpec(componentValue) {
  return COMPONENT_CATEGORIES.find(c => c.value === componentValue);
}

/**
 * Get all style properties for a category
 */
export function getStyleProperties(categoryName) {
  return STYLE_CATEGORIES[categoryName]?.properties || [];
}