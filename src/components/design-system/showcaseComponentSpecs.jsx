/**
 * Comprehensive component specifications extracted from UXShowcase
 * Maps each component to its editable properties, states, variants, and functional capabilities
 */

export const SHOWCASE_CATEGORIES = {
  FOUNDATIONS: 'foundations',
  COMPONENTS: 'components',
  NAVIGATION: 'navigation',
  LAYOUT: 'layout',
  DATA: 'data',
  FEEDBACK: 'feedback'
};

export const SHOWCASE_COMPONENTS = {
  // Design Foundations
  typography: {
    id: 'typography',
    label: 'Typography',
    category: SHOWCASE_CATEGORIES.FOUNDATIONS,
    description: 'Text styles, headings, paragraphs, and font specifications',
    functionalSpec: 'Controls all text rendering including headings (h1-h6), body text, captions, and specialized text like code or quotes',
    editableProperties: {
      fontFamily: {
        property: '--font-family-display',
        label: 'Heading Font',
        type: 'select',
        options: [
          { value: 'var(--font-family-display)', label: 'Display (degular-display)' },
          { value: 'var(--font-family-body)', label: 'Body (mrs-eaves)' },
          { value: 'var(--font-family-mono)', label: 'Monospace' }
        ]
      },
      bodyFont: {
        property: '--font-family-body',
        label: 'Body Font',
        type: 'select',
        options: [
          { value: 'var(--font-family-body)', label: 'Body (mrs-eaves)' },
          { value: 'var(--font-family-display)', label: 'Display (degular-display)' },
          { value: 'var(--font-family-mono)', label: 'Monospace' }
        ]
      },
      fontSize: {
        property: '--text-base',
        label: 'Base Font Size',
        type: 'select',
        options: [
          { value: 'var(--text-xs)', label: 'XS (0.75rem)' },
          { value: 'var(--text-sm)', label: 'SM (0.875rem)' },
          { value: 'var(--text-base)', label: 'Base (1rem)' },
          { value: 'var(--text-lg)', label: 'LG (1.125rem)' }
        ]
      },
      lineHeight: {
        property: '--leading-normal',
        label: 'Line Height',
        type: 'select',
        options: [
          { value: 'var(--leading-tight)', label: 'Tight (1.25)' },
          { value: 'var(--leading-snug)', label: 'Snug (1.375)' },
          { value: 'var(--leading-normal)', label: 'Normal (1.5)' },
          { value: 'var(--leading-relaxed)', label: 'Relaxed (1.625)' },
          { value: 'var(--leading-loose)', label: 'Loose (2)' }
        ]
      },
      letterSpacing: {
        property: '--tracking-normal',
        label: 'Letter Spacing',
        type: 'select',
        options: [
          { value: 'var(--tracking-tight)', label: 'Tight' },
          { value: 'var(--tracking-normal)', label: 'Normal' },
          { value: 'var(--tracking-wide)', label: 'Wide' },
          { value: 'var(--tracking-airy)', label: 'Airy' }
        ]
      },
      textColor: {
        property: '--color-text-primary',
        label: 'Text Color',
        type: 'select',
        options: [
          { value: 'var(--midnight-900)', label: 'Midnight 900' },
          { value: 'var(--midnight-800)', label: 'Midnight 800' },
          { value: 'var(--charcoal-900)', label: 'Charcoal 900' },
          { value: 'var(--charcoal-800)', label: 'Charcoal 800' }
        ]
      }
    },
    applicableStyles: ['font', 'text'],
    states: ['default'],
    variants: ['heading', 'body', 'caption', 'code'],
    sizes: ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl']
  },

  colors: {
    id: 'colors',
    label: 'Colors',
    category: SHOWCASE_CATEGORIES.FOUNDATIONS,
    description: 'Color palettes, scales, and semantic color tokens',
    functionalSpec: 'Manages all color tokens including primary, secondary, accent, semantic colors, and full color scales',
    editableProperties: {
      primaryColor: {
        property: '--color-primary',
        label: 'Primary Color',
        type: 'select',
        options: [
          { value: 'var(--primary-400)', label: 'Primary 400' },
          { value: 'var(--primary-500)', label: 'Primary 500' },
          { value: 'var(--primary-600)', label: 'Primary 600' },
          { value: 'var(--primary-700)', label: 'Primary 700' }
        ]
      },
      secondaryColor: {
        property: '--color-secondary',
        label: 'Secondary Color',
        type: 'select',
        options: [
          { value: 'var(--secondary-300)', label: 'Secondary 300' },
          { value: 'var(--secondary-400)', label: 'Secondary 400' },
          { value: 'var(--secondary-500)', label: 'Secondary 500' }
        ]
      },
      accentColor: {
        property: '--color-accent',
        label: 'Accent Color',
        type: 'select',
        options: [
          { value: 'var(--accent-300)', label: 'Accent 300' },
          { value: 'var(--accent-400)', label: 'Accent 400' },
          { value: 'var(--accent-500)', label: 'Accent 500' }
        ]
      }
    },
    applicableStyles: ['text', 'background'],
    states: ['default'],
    variants: ['primary', 'secondary', 'accent', 'destructive'],
    colorScales: ['primary', 'secondary', 'accent', 'midnight', 'charcoal', 'destructive']
  },

  icons: {
    id: 'icons',
    label: 'Icons',
    category: SHOWCASE_CATEGORIES.FOUNDATIONS,
    description: 'Icon system, sizes, colors, and stroke weights',
    functionalSpec: 'Controls icon rendering including size, stroke width, color, and spacing',
    editableProperties: {
      iconSize: {
        property: '--icon-size',
        label: 'Icon Size',
        type: 'select',
        options: [
          { value: '12px', label: 'XS (12px)' },
          { value: '16px', label: 'SM (16px)' },
          { value: '20px', label: 'Base (20px)' },
          { value: '24px', label: 'LG (24px)' },
          { value: '32px', label: 'XL (32px)' }
        ]
      },
      iconStroke: {
        property: '--icon-stroke-width',
        label: 'Stroke Width',
        type: 'select',
        options: [
          { value: '1', label: 'Thin (1)' },
          { value: '1.5', label: 'Light (1.5)' },
          { value: '2', label: 'Regular (2)' },
          { value: '2.5', label: 'Medium (2.5)' },
          { value: '3', label: 'Bold (3)' }
        ]
      },
      iconColor: {
        property: '--icon-color',
        label: 'Icon Color',
        type: 'select',
        options: [
          { value: 'currentColor', label: 'Current Color' },
          { value: 'var(--primary-500)', label: 'Primary' },
          { value: 'var(--charcoal-600)', label: 'Muted' },
          { value: 'var(--charcoal-800)', label: 'Dark' }
        ]
      }
    },
    applicableStyles: ['text'],
    states: ['default', 'hover', 'active'],
    sizes: ['xs', 'sm', 'base', 'lg', 'xl']
  },

  // Components
  button: {
    id: 'button',
    label: 'Button',
    category: SHOWCASE_CATEGORIES.COMPONENTS,
    description: 'Interactive buttons with variants, sizes, and states',
    functionalSpec: 'Clickable elements that trigger actions, support multiple variants (default, destructive, outline, ghost, link), sizes, and states',
    editableProperties: {
      variant: {
        property: '--button-variant',
        label: 'Variant',
        type: 'select',
        options: [
          { value: 'default', label: 'Default' },
          { value: 'destructive', label: 'Destructive' },
          { value: 'outline', label: 'Outline' },
          { value: 'secondary', label: 'Secondary' },
          { value: 'ghost', label: 'Ghost' },
          { value: 'link', label: 'Link' }
        ]
      },
      size: {
        property: '--button-size',
        label: 'Size',
        type: 'select',
        options: [
          { value: 'sm', label: 'Small' },
          { value: 'default', label: 'Default' },
          { value: 'lg', label: 'Large' },
          { value: 'icon', label: 'Icon Only' }
        ]
      },
      borderRadius: {
        property: '--radius-button',
        label: 'Border Radius',
        type: 'select',
        options: [
          { value: 'var(--radius-none)', label: 'None' },
          { value: 'var(--radius-sm)', label: 'Small' },
          { value: 'var(--radius-md)', label: 'Medium' },
          { value: 'var(--radius-lg)', label: 'Large' },
          { value: 'var(--radius-full)', label: 'Full (Pill)' }
        ]
      },
      padding: {
        property: '--spacing-4',
        label: 'Padding',
        type: 'select',
        options: [
          { value: 'var(--spacing-2)', label: 'Tight' },
          { value: 'var(--spacing-3)', label: 'Snug' },
          { value: 'var(--spacing-4)', label: 'Normal' },
          { value: 'var(--spacing-5)', label: 'Relaxed' }
        ]
      }
    },
    applicableStyles: ['border', 'padding', 'font', 'text', 'background', 'css3'],
    states: ['default', 'hover', 'focus', 'active', 'disabled'],
    variants: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
    sizes: ['sm', 'default', 'lg', 'icon']
  },

  card: {
    id: 'card',
    label: 'Card',
    category: SHOWCASE_CATEGORIES.COMPONENTS,
    description: 'Content containers with headers, body, and footers',
    functionalSpec: 'Container component for grouping related content, supports header/title, description, content area, and footer',
    editableProperties: {
      padding: {
        property: '--spacing-6',
        label: 'Padding',
        type: 'select',
        options: [
          { value: 'var(--spacing-3)', label: 'Compact' },
          { value: 'var(--spacing-4)', label: 'Normal' },
          { value: 'var(--spacing-6)', label: 'Comfortable' },
          { value: 'var(--spacing-8)', label: 'Spacious' }
        ]
      },
      borderRadius: {
        property: '--radius-xl',
        label: 'Border Radius',
        type: 'select',
        options: [
          { value: 'var(--radius-sm)', label: 'Small' },
          { value: 'var(--radius-lg)', label: 'Large' },
          { value: 'var(--radius-xl)', label: 'XL' },
          { value: 'var(--radius-2xl)', label: '2XL' }
        ]
      },
      shadow: {
        property: '--shadow-card',
        label: 'Shadow',
        type: 'select',
        options: [
          { value: 'var(--shadow-sm)', label: 'Subtle' },
          { value: 'var(--shadow-md)', label: 'Medium' },
          { value: 'var(--shadow-lg)', label: 'Large' },
          { value: 'var(--shadow-xl)', label: 'XL' }
        ]
      },
      backgroundColor: {
        property: '--color-card',
        label: 'Background',
        type: 'select',
        options: [
          { value: '#ffffff', label: 'White' },
          { value: 'var(--background-50)', label: 'Background 50' },
          { value: 'var(--primary-50)', label: 'Primary Tint' }
        ]
      }
    },
    applicableStyles: ['border', 'padding', 'font', 'text', 'background', 'css3'],
    states: ['default', 'hover'],
    variants: ['default', 'elevated', 'outline'],
    sizes: ['sm', 'default', 'lg']
  },

  form: {
    id: 'form',
    label: 'Form',
    category: SHOWCASE_CATEGORIES.COMPONENTS,
    description: 'Input fields, labels, validation, and form layouts',
    functionalSpec: 'Form controls including text inputs, selects, textareas, checkboxes, radio buttons, with validation states',
    editableProperties: {
      inputHeight: {
        property: '--spacing-10',
        label: 'Input Height',
        type: 'select',
        options: [
          { value: 'var(--spacing-8)', label: 'Compact' },
          { value: 'var(--spacing-10)', label: 'Normal' },
          { value: 'var(--spacing-12)', label: 'Comfortable' }
        ]
      },
      inputPadding: {
        property: '--spacing-3',
        label: 'Input Padding',
        type: 'select',
        options: [
          { value: 'var(--spacing-2)', label: 'Tight' },
          { value: 'var(--spacing-3)', label: 'Normal' },
          { value: 'var(--spacing-4)', label: 'Relaxed' }
        ]
      },
      borderColor: {
        property: '--color-border',
        label: 'Border Color',
        type: 'select',
        options: [
          { value: 'var(--charcoal-200)', label: 'Light' },
          { value: 'var(--charcoal-300)', label: 'Medium' },
          { value: 'var(--primary-300)', label: 'Primary' }
        ]
      },
      focusRing: {
        property: '--color-ring',
        label: 'Focus Ring',
        type: 'select',
        options: [
          { value: 'var(--primary-500)', label: 'Primary' },
          { value: 'var(--primary-600)', label: 'Primary Dark' },
          { value: 'var(--accent-500)', label: 'Accent' }
        ]
      }
    },
    applicableStyles: ['border', 'padding', 'font', 'text', 'background'],
    states: ['default', 'hover', 'focus', 'disabled', 'error', 'success'],
    variants: ['default', 'filled', 'outline'],
    sizes: ['sm', 'default', 'lg']
  },

  tabs: {
    id: 'tabs',
    label: 'Tabs',
    category: SHOWCASE_CATEGORIES.COMPONENTS,
    description: 'Tabbed navigation for content sections',
    functionalSpec: 'Allows switching between different views/content sections, with active state indicators',
    editableProperties: {
      activeColor: {
        property: '--color-primary',
        label: 'Active Tab Color',
        type: 'select',
        options: [
          { value: 'var(--primary-500)', label: 'Primary' },
          { value: 'var(--primary-600)', label: 'Primary Dark' },
          { value: 'var(--accent-500)', label: 'Accent' }
        ]
      },
      tabPadding: {
        property: '--spacing-3',
        label: 'Tab Padding',
        type: 'select',
        options: [
          { value: 'var(--spacing-2)', label: 'Compact' },
          { value: 'var(--spacing-3)', label: 'Normal' },
          { value: 'var(--spacing-4)', label: 'Comfortable' }
        ]
      },
      underlineThickness: {
        property: '--border-width',
        label: 'Active Underline',
        type: 'select',
        options: [
          { value: '1px', label: 'Thin (1px)' },
          { value: '2px', label: 'Medium (2px)' },
          { value: '3px', label: 'Bold (3px)' }
        ]
      }
    },
    applicableStyles: ['border', 'padding', 'font', 'text', 'background'],
    states: ['default', 'hover', 'active'],
    variants: ['default', 'pills', 'underline'],
    sizes: ['sm', 'default', 'lg']
  },

  modal: {
    id: 'modal',
    label: 'Modal',
    category: SHOWCASE_CATEGORIES.COMPONENTS,
    description: 'Overlay dialogs for focused interactions',
    functionalSpec: 'Dialog overlays that appear on top of page content, includes backdrop, header, body, and action buttons',
    editableProperties: {
      backdropOpacity: {
        property: '--backdrop-opacity',
        label: 'Backdrop Opacity',
        type: 'select',
        options: [
          { value: '0.3', label: 'Light (30%)' },
          { value: '0.5', label: 'Medium (50%)' },
          { value: '0.7', label: 'Dark (70%)' },
          { value: '0.9', label: 'Very Dark (90%)' }
        ]
      },
      maxWidth: {
        property: '--modal-max-width',
        label: 'Max Width',
        type: 'select',
        options: [
          { value: '400px', label: 'Small (400px)' },
          { value: '600px', label: 'Medium (600px)' },
          { value: '800px', label: 'Large (800px)' },
          { value: '1000px', label: 'XL (1000px)' }
        ]
      },
      padding: {
        property: '--spacing-6',
        label: 'Padding',
        type: 'select',
        options: [
          { value: 'var(--spacing-4)', label: 'Compact' },
          { value: 'var(--spacing-6)', label: 'Normal' },
          { value: 'var(--spacing-8)', label: 'Spacious' }
        ]
      }
    },
    applicableStyles: ['border', 'padding', 'font', 'text', 'background', 'css3', 'position'],
    states: ['open', 'closed', 'opening', 'closing'],
    variants: ['default', 'center', 'drawer'],
    sizes: ['sm', 'default', 'lg', 'xl', 'full']
  },

  // Navigation
  navigation: {
    id: 'navigation',
    label: 'Navigation',
    category: SHOWCASE_CATEGORIES.NAVIGATION,
    description: 'Menus, breadcrumbs, sidebars, and navigation patterns',
    functionalSpec: 'Primary navigation components including top nav, side nav, breadcrumbs, and dropdown menus',
    editableProperties: {
      itemPadding: {
        property: '--spacing-3',
        label: 'Item Padding',
        type: 'select',
        options: [
          { value: 'var(--spacing-2)', label: 'Compact' },
          { value: 'var(--spacing-3)', label: 'Normal' },
          { value: 'var(--spacing-4)', label: 'Comfortable' }
        ]
      },
      activeColor: {
        property: '--color-primary',
        label: 'Active Item Color',
        type: 'select',
        options: [
          { value: 'var(--primary-500)', label: 'Primary' },
          { value: 'var(--primary-600)', label: 'Primary Dark' },
          { value: 'var(--accent-500)', label: 'Accent' }
        ]
      },
      hoverBackground: {
        property: '--color-muted',
        label: 'Hover Background',
        type: 'select',
        options: [
          { value: 'var(--background-100)', label: 'Subtle' },
          { value: 'var(--color-muted)', label: 'Medium' },
          { value: 'var(--primary-50)', label: 'Primary Tint' }
        ]
      }
    },
    applicableStyles: ['border', 'padding', 'font', 'text', 'background'],
    states: ['default', 'hover', 'active', 'focus'],
    variants: ['top', 'side', 'breadcrumb', 'dropdown'],
    sizes: ['sm', 'default', 'lg']
  },

  search: {
    id: 'search',
    label: 'Search',
    category: SHOWCASE_CATEGORIES.NAVIGATION,
    description: 'Search inputs, results, and filtering',
    functionalSpec: 'Search components including input field, suggestions, and results display with highlighting',
    editableProperties: {
      inputHeight: {
        property: '--spacing-10',
        label: 'Input Height',
        type: 'select',
        options: [
          { value: 'var(--spacing-8)', label: 'Compact' },
          { value: 'var(--spacing-10)', label: 'Normal' },
          { value: 'var(--spacing-12)', label: 'Comfortable' }
        ]
      },
      borderRadius: {
        property: '--radius-lg',
        label: 'Border Radius',
        type: 'select',
        options: [
          { value: 'var(--radius-md)', label: 'Small' },
          { value: 'var(--radius-lg)', label: 'Medium' },
          { value: 'var(--radius-full)', label: 'Pill' }
        ]
      },
      resultPadding: {
        property: '--spacing-3',
        label: 'Result Padding',
        type: 'select',
        options: [
          { value: 'var(--spacing-2)', label: 'Compact' },
          { value: 'var(--spacing-3)', label: 'Normal' },
          { value: 'var(--spacing-4)', label: 'Comfortable' }
        ]
      }
    },
    applicableStyles: ['border', 'padding', 'font', 'text', 'background'],
    states: ['default', 'focus', 'loading', 'empty', 'results'],
    variants: ['default', 'command', 'autocomplete'],
    sizes: ['sm', 'default', 'lg']
  },

  // Layout
  layout: {
    id: 'layout',
    label: 'Layout',
    category: SHOWCASE_CATEGORIES.LAYOUT,
    description: 'Grid systems, containers, and responsive patterns',
    functionalSpec: 'Layout components including containers, grids, flex layouts, and spacing systems',
    editableProperties: {
      containerMaxWidth: {
        property: '--container-max-width',
        label: 'Container Width',
        type: 'select',
        options: [
          { value: '1200px', label: 'Compact (1200px)' },
          { value: '1400px', label: 'Normal (1400px)' },
          { value: '1600px', label: 'Wide (1600px)' },
          { value: '100%', label: 'Full Width' }
        ]
      },
      gridGap: {
        property: '--spacing-6',
        label: 'Grid Gap',
        type: 'select',
        options: [
          { value: 'var(--spacing-3)', label: 'Tight' },
          { value: 'var(--spacing-4)', label: 'Snug' },
          { value: 'var(--spacing-6)', label: 'Normal' },
          { value: 'var(--spacing-8)', label: 'Relaxed' }
        ]
      },
      sectionPadding: {
        property: '--spacing-16',
        label: 'Section Padding',
        type: 'select',
        options: [
          { value: 'var(--spacing-8)', label: 'Compact' },
          { value: 'var(--spacing-12)', label: 'Normal' },
          { value: 'var(--spacing-16)', label: 'Comfortable' }
        ]
      }
    },
    applicableStyles: ['padding', 'position'],
    states: ['default'],
    variants: ['container', 'grid', 'flex', 'stack'],
    sizes: ['sm', 'md', 'lg', 'xl', 'full']
  },

  // Data & Content
  dataDisplay: {
    id: 'dataDisplay',
    label: 'Data Display',
    category: SHOWCASE_CATEGORIES.DATA,
    description: 'Tables, lists, stats, and data visualization',
    functionalSpec: 'Components for displaying structured data including tables, definition lists, stat cards, and badges',
    editableProperties: {
      rowPadding: {
        property: '--spacing-3',
        label: 'Row Padding',
        type: 'select',
        options: [
          { value: 'var(--spacing-2)', label: 'Compact' },
          { value: 'var(--spacing-3)', label: 'Normal' },
          { value: 'var(--spacing-4)', label: 'Comfortable' }
        ]
      },
      stripedBackground: {
        property: '--color-muted',
        label: 'Striped Row Color',
        type: 'select',
        options: [
          { value: 'transparent', label: 'None' },
          { value: 'var(--background-50)', label: 'Subtle' },
          { value: 'var(--color-muted)', label: 'Medium' }
        ]
      },
      borderColor: {
        property: '--color-border',
        label: 'Border Color',
        type: 'select',
        options: [
          { value: 'var(--charcoal-100)', label: 'Light' },
          { value: 'var(--charcoal-200)', label: 'Medium' },
          { value: 'var(--charcoal-300)', label: 'Dark' }
        ]
      }
    },
    applicableStyles: ['border', 'padding', 'font', 'text', 'background'],
    states: ['default', 'hover', 'selected'],
    variants: ['table', 'list', 'stats', 'badges'],
    sizes: ['sm', 'default', 'lg']
  },

  // Feedback & States
  loading: {
    id: 'loading',
    label: 'Loading',
    category: SHOWCASE_CATEGORIES.FEEDBACK,
    description: 'Loading spinners, skeletons, and progress indicators',
    functionalSpec: 'Visual feedback for async operations including spinners, skeleton screens, and progress bars',
    editableProperties: {
      spinnerSize: {
        property: '--spinner-size',
        label: 'Spinner Size',
        type: 'select',
        options: [
          { value: '16px', label: 'Small (16px)' },
          { value: '24px', label: 'Medium (24px)' },
          { value: '32px', label: 'Large (32px)' },
          { value: '48px', label: 'XL (48px)' }
        ]
      },
      spinnerColor: {
        property: '--color-primary',
        label: 'Spinner Color',
        type: 'select',
        options: [
          { value: 'var(--primary-500)', label: 'Primary' },
          { value: 'var(--primary-600)', label: 'Primary Dark' },
          { value: 'var(--charcoal-400)', label: 'Neutral' }
        ]
      },
      skeletonColor: {
        property: '--color-muted',
        label: 'Skeleton Background',
        type: 'select',
        options: [
          { value: 'var(--background-100)', label: 'Subtle' },
          { value: 'var(--color-muted)', label: 'Medium' },
          { value: 'var(--charcoal-200)', label: 'Prominent' }
        ]
      }
    },
    applicableStyles: ['background', 'css3'],
    states: ['loading'],
    variants: ['spinner', 'skeleton', 'progress', 'pulse'],
    sizes: ['sm', 'default', 'lg', 'xl']
  },

  error: {
    id: 'error',
    label: 'Error',
    category: SHOWCASE_CATEGORIES.FEEDBACK,
    description: 'Error messages, alerts, and recovery options',
    functionalSpec: 'Error state components including inline errors, error boundaries, and recovery actions',
    editableProperties: {
      errorColor: {
        property: '--color-destructive',
        label: 'Error Color',
        type: 'select',
        options: [
          { value: 'var(--destructive-400)', label: 'Light' },
          { value: 'var(--destructive-500)', label: 'Medium' },
          { value: 'var(--destructive-600)', label: 'Dark' }
        ]
      },
      padding: {
        property: '--spacing-4',
        label: 'Padding',
        type: 'select',
        options: [
          { value: 'var(--spacing-3)', label: 'Compact' },
          { value: 'var(--spacing-4)', label: 'Normal' },
          { value: 'var(--spacing-6)', label: 'Comfortable' }
        ]
      },
      borderRadius: {
        property: '--radius-lg',
        label: 'Border Radius',
        type: 'select',
        options: [
          { value: 'var(--radius-md)', label: 'Small' },
          { value: 'var(--radius-lg)', label: 'Medium' },
          { value: 'var(--radius-xl)', label: 'Large' }
        ]
      }
    },
    applicableStyles: ['border', 'padding', 'font', 'text', 'background'],
    states: ['error', 'warning'],
    variants: ['inline', 'alert', 'banner', 'boundary'],
    sizes: ['default']
  },

  feedback: {
    id: 'feedback',
    label: 'Feedback',
    category: SHOWCASE_CATEGORIES.FEEDBACK,
    description: 'Toasts, notifications, and alerts',
    functionalSpec: 'User feedback components including success messages, toasts, alerts, and notification badges',
    editableProperties: {
      toastPosition: {
        property: '--toast-position',
        label: 'Toast Position',
        type: 'select',
        options: [
          { value: 'top-left', label: 'Top Left' },
          { value: 'top-center', label: 'Top Center' },
          { value: 'top-right', label: 'Top Right' },
          { value: 'bottom-left', label: 'Bottom Left' },
          { value: 'bottom-center', label: 'Bottom Center' },
          { value: 'bottom-right', label: 'Bottom Right' }
        ]
      },
      successColor: {
        property: '--color-success',
        label: 'Success Color',
        type: 'select',
        options: [
          { value: 'var(--primary-500)', label: 'Primary' },
          { value: '#22c55e', label: 'Green' },
          { value: '#10b981', label: 'Emerald' }
        ]
      },
      duration: {
        property: '--toast-duration',
        label: 'Toast Duration',
        type: 'select',
        options: [
          { value: '2000', label: '2 seconds' },
          { value: '3000', label: '3 seconds' },
          { value: '5000', label: '5 seconds' },
          { value: '10000', label: '10 seconds' }
        ]
      }
    },
    applicableStyles: ['border', 'padding', 'font', 'text', 'background', 'css3', 'position'],
    states: ['success', 'error', 'warning', 'info'],
    variants: ['toast', 'alert', 'banner', 'badge'],
    sizes: ['default']
  },

  mutation: {
    id: 'mutation',
    label: 'Mutation',
    category: SHOWCASE_CATEGORIES.FEEDBACK,
    description: 'Button states during async operations',
    functionalSpec: 'Buttons with loading, success, and error states for mutations (create, update, delete operations)',
    editableProperties: {
      loadingText: {
        property: '--mutation-loading-text',
        label: 'Loading Text',
        type: 'text',
        default: 'Saving...'
      },
      successDuration: {
        property: '--success-duration',
        label: 'Success Duration',
        type: 'select',
        options: [
          { value: '1000', label: '1 second' },
          { value: '2000', label: '2 seconds' },
          { value: '3000', label: '3 seconds' }
        ]
      },
      disableOnMutate: {
        property: '--disable-on-mutate',
        label: 'Disable During Mutation',
        type: 'boolean',
        default: true
      }
    },
    applicableStyles: ['border', 'padding', 'font', 'text', 'background'],
    states: ['idle', 'loading', 'success', 'error'],
    variants: ['default', 'optimistic'],
    sizes: ['sm', 'default', 'lg']
  }
};

/**
 * Get component spec by ID
 */
export function getShowcaseComponentSpec(componentId) {
  return SHOWCASE_COMPONENTS[componentId] || null;
}

/**
 * Get all components in a category
 */
export function getComponentsByCategory(category) {
  return Object.values(SHOWCASE_COMPONENTS).filter(c => c.category === category);
}

/**
 * Get all editable properties for a component
 */
export function getEditableProperties(componentId) {
  const spec = getShowcaseComponentSpec(componentId);
  return spec?.editableProperties || {};
}

/**
 * Check if a style category applies to this component
 */
export function isStyleApplicableToComponent(componentId, styleCategory) {
  const spec = getShowcaseComponentSpec(componentId);
  return spec?.applicableStyles?.includes(styleCategory) || false;
}