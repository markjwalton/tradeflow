/**
 * Component Specifications for Visual Editor
 * Defines categories, applicable styles, and functional specifications for each UI component
 */

export const COMPONENT_CATEGORIES = {
  BUTTONS: 'buttons',
  CARDS: 'cards',
  TYPOGRAPHY: 'typography',
  BADGES: 'badges',
  FORMS: 'forms',
  NAVIGATION: 'navigation',
  FEEDBACK: 'feedback',
  OVERLAYS: 'overlays',
  DATA_DISPLAY: 'data-display',
  LAYOUT: 'layout'
};

export const STYLE_CATEGORIES = {
  BORDER: 'border',
  PADDING: 'padding',
  FONT: 'font',
  TEXT: 'text',
  BACKGROUND: 'background',
  POSITION: 'position',
  EXTRAS: 'extras',
  CSS3: 'css3'
};

export const COMPONENT_SPECS = {
  // BUTTONS CATEGORY
  button: {
    name: 'Button',
    category: COMPONENT_CATEGORIES.BUTTONS,
    description: 'Interactive element for user actions',
    functionalSpec: 'Triggers actions on click, supports variants (default, destructive, outline, ghost), sizes (sm, default, lg, icon), states (hover, focus, active, disabled), and optional icons.',
    applicableStyles: [
      STYLE_CATEGORIES.BORDER,
      STYLE_CATEGORIES.PADDING,
      STYLE_CATEGORIES.FONT,
      STYLE_CATEGORIES.TEXT,
      STYLE_CATEGORIES.BACKGROUND,
      STYLE_CATEGORIES.CSS3
    ],
    stateSupport: ['default', 'hover', 'focus', 'active', 'disabled'],
    variantSupport: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
    sizeSupport: ['sm', 'default', 'lg', 'icon'],
    designTokens: [
      '--color-primary',
      '--color-primary-foreground',
      '--spacing-2',
      '--spacing-4',
      '--radius-button',
      '--shadow-sm',
      '--shadow-md',
      '--font-family-display',
      '--text-sm',
      '--font-weight-medium',
      '--tracking-airy'
    ]
  },

  // CARDS CATEGORY
  card: {
    name: 'Card',
    category: COMPONENT_CATEGORIES.CARDS,
    description: 'Container for grouped content',
    functionalSpec: 'Displays content in a bordered, rounded container with optional header, content area, and footer. Supports shadow variations and hover effects.',
    applicableStyles: [
      STYLE_CATEGORIES.BORDER,
      STYLE_CATEGORIES.PADDING,
      STYLE_CATEGORIES.BACKGROUND,
      STYLE_CATEGORIES.CSS3
    ],
    stateSupport: ['default', 'hover'],
    variantSupport: null,
    sizeSupport: null,
    designTokens: [
      '--color-card',
      '--color-border',
      '--radius-xl',
      '--shadow-card',
      '--shadow-card-hover',
      '--spacing-4',
      '--spacing-6',
      '--card-bg-pattern',
      '--card-pattern-color',
      '--card-pattern-opacity'
    ]
  },

  cardTitle: {
    name: 'Card Title',
    category: COMPONENT_CATEGORIES.CARDS,
    description: 'Heading within card components',
    functionalSpec: 'Semantic h2-h4 element with size variants (small, default, large). Uses card-specific typography tokens for consistent styling across card headers.',
    applicableStyles: [
      STYLE_CATEGORIES.FONT,
      STYLE_CATEGORIES.TEXT
    ],
    stateSupport: ['default'],
    variantSupport: null,
    sizeSupport: ['small', 'default', 'large'],
    designTokens: [
      '--font-family-display',
      '--card-heading-small-size',
      '--card-heading-small-weight',
      '--card-heading-small-leading',
      '--card-heading-small-tracking',
      '--card-heading-default-size',
      '--card-heading-default-weight',
      '--card-heading-default-leading',
      '--card-heading-default-tracking',
      '--card-heading-large-size',
      '--card-heading-large-weight',
      '--card-heading-large-leading',
      '--card-heading-large-tracking',
      '--card-heading-color'
    ]
  },

  cardDescription: {
    name: 'Card Description',
    category: COMPONENT_CATEGORIES.CARDS,
    description: 'Descriptive text within cards',
    functionalSpec: 'Body text element for card descriptions and supporting content. Uses muted text color for visual hierarchy.',
    applicableStyles: [
      STYLE_CATEGORIES.FONT,
      STYLE_CATEGORIES.TEXT
    ],
    stateSupport: ['default'],
    variantSupport: null,
    sizeSupport: null,
    designTokens: [
      '--font-family-body',
      '--text-sm',
      '--color-text-muted',
      '--leading-normal'
    ]
  },

  // TYPOGRAPHY CATEGORY
  heading: {
    name: 'Heading',
    category: COMPONENT_CATEGORIES.TYPOGRAPHY,
    description: 'Semantic headings h1-h6',
    functionalSpec: 'Hierarchical heading elements with semantic levels (h1-h6) and corresponding size scales. Uses display font family for emphasis.',
    applicableStyles: [
      STYLE_CATEGORIES.FONT,
      STYLE_CATEGORIES.TEXT
    ],
    stateSupport: ['default'],
    variantSupport: null,
    sizeSupport: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
    designTokens: [
      '--font-family-display',
      '--text-2xl',
      '--text-3xl',
      '--text-4xl',
      '--text-5xl',
      '--font-weight-semibold',
      '--font-weight-bold',
      '--leading-tight',
      '--tracking-tight',
      '--color-text-primary'
    ]
  },

  paragraph: {
    name: 'Paragraph',
    category: COMPONENT_CATEGORIES.TYPOGRAPHY,
    description: 'Body text blocks',
    functionalSpec: 'Main content text with optimized line height, spacing, and readability. Uses body font family.',
    applicableStyles: [
      STYLE_CATEGORIES.FONT,
      STYLE_CATEGORIES.TEXT
    ],
    stateSupport: ['default'],
    variantSupport: null,
    sizeSupport: null,
    designTokens: [
      '--font-family-body',
      '--text-base',
      '--leading-normal',
      '--color-text-primary',
      '--paragraph-spacing-normal'
    ]
  },

  // BADGES CATEGORY
  badge: {
    name: 'Badge',
    category: COMPONENT_CATEGORIES.BADGES,
    description: 'Small status or label indicator',
    functionalSpec: 'Compact element for displaying status, counts, or labels. Supports variants (default, destructive, warning, success, outline) with corresponding color schemes.',
    applicableStyles: [
      STYLE_CATEGORIES.BORDER,
      STYLE_CATEGORIES.PADDING,
      STYLE_CATEGORIES.FONT,
      STYLE_CATEGORIES.TEXT,
      STYLE_CATEGORIES.BACKGROUND,
      STYLE_CATEGORIES.CSS3
    ],
    stateSupport: ['default'],
    variantSupport: ['default', 'destructive', 'warning', 'success', 'info', 'outline'],
    sizeSupport: null,
    designTokens: [
      '--font-family-display',
      '--text-xs',
      '--font-weight-medium',
      '--spacing-1',
      '--spacing-2',
      '--radius-full',
      '--color-primary',
      '--color-destructive',
      '--primary-100',
      '--destructive-100'
    ]
  },

  // FORMS CATEGORY
  input: {
    name: 'Input',
    category: COMPONENT_CATEGORIES.FORMS,
    description: 'Text input field',
    functionalSpec: 'Single-line text input with focus, disabled, and error states. Supports placeholder text and various input types (text, email, password, etc.).',
    applicableStyles: [
      STYLE_CATEGORIES.BORDER,
      STYLE_CATEGORIES.PADDING,
      STYLE_CATEGORIES.FONT,
      STYLE_CATEGORIES.TEXT,
      STYLE_CATEGORIES.BACKGROUND,
      STYLE_CATEGORIES.CSS3
    ],
    stateSupport: ['default', 'focus', 'disabled', 'error'],
    variantSupport: null,
    sizeSupport: null,
    designTokens: [
      '--color-input',
      '--color-border',
      '--color-background',
      '--spacing-2',
      '--spacing-3',
      '--radius-md',
      '--font-family-body',
      '--text-sm',
      '--color-text-primary'
    ]
  },

  label: {
    name: 'Label',
    category: COMPONENT_CATEGORIES.FORMS,
    description: 'Form field label',
    functionalSpec: 'Descriptive text for form inputs with appropriate font weight and spacing.',
    applicableStyles: [
      STYLE_CATEGORIES.FONT,
      STYLE_CATEGORIES.TEXT
    ],
    stateSupport: ['default'],
    variantSupport: null,
    sizeSupport: null,
    designTokens: [
      '--font-family-display',
      '--text-sm',
      '--font-weight-medium',
      '--color-text-primary',
      '--leading-normal'
    ]
  },

  // NAVIGATION CATEGORY
  link: {
    name: 'Link',
    category: COMPONENT_CATEGORIES.NAVIGATION,
    description: 'Navigation or inline link',
    functionalSpec: 'Clickable text element for navigation with hover and visited states. Supports underline decoration.',
    applicableStyles: [
      STYLE_CATEGORIES.FONT,
      STYLE_CATEGORIES.TEXT
    ],
    stateSupport: ['default', 'hover', 'visited', 'focus'],
    variantSupport: null,
    sizeSupport: null,
    designTokens: [
      '--color-primary',
      '--font-family-body',
      '--text-base',
      '--color-text-primary'
    ]
  },

  // FEEDBACK CATEGORY
  alert: {
    name: 'Alert',
    category: COMPONENT_CATEGORIES.FEEDBACK,
    description: 'Notification or message display',
    functionalSpec: 'Message container with severity variants (info, success, warning, error). Includes optional title, description, and dismiss action.',
    applicableStyles: [
      STYLE_CATEGORIES.BORDER,
      STYLE_CATEGORIES.PADDING,
      STYLE_CATEGORIES.FONT,
      STYLE_CATEGORIES.TEXT,
      STYLE_CATEGORIES.BACKGROUND,
      STYLE_CATEGORIES.CSS3
    ],
    stateSupport: ['default'],
    variantSupport: ['info', 'success', 'warning', 'error'],
    sizeSupport: null,
    designTokens: [
      '--color-border',
      '--spacing-4',
      '--radius-lg',
      '--font-family-body',
      '--text-sm',
      '--color-text-primary',
      '--color-background',
      '--primary-100',
      '--destructive-100'
    ]
  },

  // OVERLAYS CATEGORY
  dialog: {
    name: 'Dialog',
    category: COMPONENT_CATEGORIES.OVERLAYS,
    description: 'Modal dialog overlay',
    functionalSpec: 'Modal container that appears over page content. Includes overlay backdrop, content area with header/footer, and close functionality.',
    applicableStyles: [
      STYLE_CATEGORIES.BORDER,
      STYLE_CATEGORIES.PADDING,
      STYLE_CATEGORIES.BACKGROUND,
      STYLE_CATEGORIES.CSS3,
      STYLE_CATEGORIES.POSITION
    ],
    stateSupport: ['default'],
    variantSupport: null,
    sizeSupport: null,
    designTokens: [
      '--color-card',
      '--color-border',
      '--spacing-6',
      '--radius-xl',
      '--shadow-xl',
      '--z-modal'
    ]
  },

  // DATA DISPLAY CATEGORY
  table: {
    name: 'Table',
    category: COMPONENT_CATEGORIES.DATA_DISPLAY,
    description: 'Tabular data display',
    functionalSpec: 'Structured data table with header row, body rows, and optional footer. Supports row hover states and alternating row backgrounds.',
    applicableStyles: [
      STYLE_CATEGORIES.BORDER,
      STYLE_CATEGORIES.PADDING,
      STYLE_CATEGORIES.FONT,
      STYLE_CATEGORIES.TEXT,
      STYLE_CATEGORIES.BACKGROUND
    ],
    stateSupport: ['default', 'hover'],
    variantSupport: null,
    sizeSupport: null,
    designTokens: [
      '--color-border',
      '--spacing-2',
      '--spacing-4',
      '--font-family-body',
      '--text-sm',
      '--color-text-primary',
      '--color-muted'
    ]
  },

  // LAYOUT CATEGORY
  container: {
    name: 'Container',
    category: COMPONENT_CATEGORIES.LAYOUT,
    description: 'Content wrapper with max-width',
    functionalSpec: 'Responsive container that centers content and applies max-width constraints. No visual styling, purely structural.',
    applicableStyles: [
      STYLE_CATEGORIES.PADDING
    ],
    stateSupport: ['default'],
    variantSupport: null,
    sizeSupport: null,
    designTokens: [
      '--spacing-4',
      '--spacing-6'
    ]
  }
};

/**
 * Get all components in a specific category
 */
export function getComponentsByCategory(category) {
  return Object.entries(COMPONENT_SPECS)
    .filter(([_, spec]) => spec.category === category)
    .map(([key, spec]) => ({ key, ...spec }));
}

/**
 * Check if a style category is applicable to a component
 */
export function isStyleApplicable(componentKey, styleCategory) {
  const spec = COMPONENT_SPECS[componentKey];
  return spec?.applicableStyles.includes(styleCategory) || false;
}

/**
 * Get all design tokens for a component
 */
export function getComponentTokens(componentKey) {
  return COMPONENT_SPECS[componentKey]?.designTokens || [];
}

/**
 * Get component specification
 */
export function getComponentSpec(componentKey) {
  return COMPONENT_SPECS[componentKey];
}