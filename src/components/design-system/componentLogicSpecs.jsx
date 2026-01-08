// Component Logic Specifications for the Component Editor
// Defines reusable component patterns with configurable properties and sub-components

export const COMPONENT_LOGIC_CATEGORIES = {
  CONTAINERS: 'containers',
  DATA_DISPLAY: 'data_display',
  NAVIGATION: 'navigation',
  FEEDBACK: 'feedback',
  FORMS: 'forms'
};

export const COMPONENT_LOGIC_SPECS = {
  // Container Components
  card: {
    id: 'card',
    label: 'Card Container',
    category: COMPONENT_LOGIC_CATEGORIES.CONTAINERS,
    description: 'A flexible container with header, content, and footer',
    canHaveChildren: true,
    maxDepth: 3,
    properties: {
      title: { type: 'text', label: 'Title', default: '' },
      description: { type: 'text', label: 'Description', default: '' },
      showHeader: { type: 'boolean', label: 'Show Header', default: true },
      showFooter: { type: 'boolean', label: 'Show Footer', default: false },
      variant: { type: 'select', label: 'Variant', options: ['default', 'outlined', 'elevated'], default: 'default' }
    },
    allowedChildren: ['badge', 'button', 'text', 'image', 'accordion', 'grid']
  },
  
  accordion: {
    id: 'accordion',
    label: 'Accordion Container',
    category: COMPONENT_LOGIC_CATEGORIES.CONTAINERS,
    description: 'Collapsible container for organizing content',
    canHaveChildren: true,
    maxDepth: 3,
    properties: {
      title: { type: 'text', label: 'Title', default: 'Section Title' },
      defaultCollapsed: { type: 'boolean', label: 'Default Collapsed', default: false },
      icon: { type: 'icon', label: 'Icon', default: '' }
    },
    allowedChildren: ['card', 'text', 'badge', 'button', 'grid', 'list']
  },

  grid: {
    id: 'grid',
    label: 'Grid Layout',
    category: COMPONENT_LOGIC_CATEGORIES.CONTAINERS,
    description: 'Responsive grid for organizing child components',
    canHaveChildren: true,
    maxDepth: 2,
    properties: {
      columns: { type: 'number', label: 'Columns', default: 3, min: 1, max: 6 },
      gap: { type: 'select', label: 'Gap', options: ['2', '4', '6', '8'], default: '4' },
      responsive: { type: 'boolean', label: 'Responsive', default: true }
    },
    allowedChildren: ['card', 'badge', 'text', 'image', 'button']
  },

  // Data Display Components
  badge: {
    id: 'badge',
    label: 'Badge',
    category: COMPONENT_LOGIC_CATEGORIES.DATA_DISPLAY,
    description: 'Small label for status, tags, or counts',
    canHaveChildren: false,
    properties: {
      text: { type: 'text', label: 'Text', default: 'Badge' },
      variant: { type: 'select', label: 'Variant', options: ['default', 'destructive', 'warning', 'success', 'info'], default: 'default' },
      dataBinding: { type: 'dataBinding', label: 'Data Source', default: null },
      dismissible: { type: 'boolean', label: 'Dismissible', default: false }
    }
  },

  list: {
    id: 'list',
    label: 'Data List',
    category: COMPONENT_LOGIC_CATEGORIES.DATA_DISPLAY,
    description: 'Display list of items with optional styling',
    canHaveChildren: true,
    maxDepth: 2,
    properties: {
      dataSource: { type: 'dataBinding', label: 'Data Source', default: null },
      showBullets: { type: 'boolean', label: 'Show Bullets', default: true },
      itemTemplate: { type: 'template', label: 'Item Template', default: 'text' }
    },
    allowedChildren: ['text', 'badge', 'button']
  },

  pagination: {
    id: 'pagination',
    label: 'Pagination',
    category: COMPONENT_LOGIC_CATEGORIES.NAVIGATION,
    description: 'Navigation for paginated data',
    canHaveChildren: false,
    properties: {
      currentPage: { type: 'number', label: 'Current Page', default: 1 },
      totalPages: { type: 'number', label: 'Total Pages', default: 10 },
      dataBinding: { type: 'dataBinding', label: 'Data Source', default: null },
      showPageNumbers: { type: 'boolean', label: 'Show Page Numbers', default: true },
      pageSize: { type: 'number', label: 'Items Per Page', default: 10 }
    }
  },

  // Form Components
  button: {
    id: 'button',
    label: 'Button',
    category: COMPONENT_LOGIC_CATEGORIES.FORMS,
    description: 'Interactive button element',
    canHaveChildren: false,
    properties: {
      text: { type: 'text', label: 'Text', default: 'Button' },
      variant: { type: 'select', label: 'Variant', options: ['default', 'destructive', 'outline', 'ghost', 'link'], default: 'default' },
      size: { type: 'select', label: 'Size', options: ['sm', 'default', 'lg', 'icon'], default: 'default' },
      icon: { type: 'icon', label: 'Icon', default: '' },
      action: { type: 'action', label: 'Action', default: null },
      disabled: { type: 'boolean', label: 'Disabled', default: false }
    }
  },

  // Basic Elements
  text: {
    id: 'text',
    label: 'Text',
    category: COMPONENT_LOGIC_CATEGORIES.DATA_DISPLAY,
    description: 'Simple text content',
    canHaveChildren: false,
    properties: {
      content: { type: 'text', label: 'Content', default: 'Text content' },
      dataBinding: { type: 'dataBinding', label: 'Data Source', default: null },
      format: { type: 'select', label: 'Format', options: ['plain', 'markdown', 'code'], default: 'plain' }
    }
  },

  image: {
    id: 'image',
    label: 'Image',
    category: COMPONENT_LOGIC_CATEGORIES.DATA_DISPLAY,
    description: 'Display an image',
    canHaveChildren: false,
    properties: {
      src: { type: 'text', label: 'Image URL', default: '' },
      alt: { type: 'text', label: 'Alt Text', default: '' },
      dataBinding: { type: 'dataBinding', label: 'Data Source', default: null },
      aspectRatio: { type: 'select', label: 'Aspect Ratio', options: ['auto', '1/1', '16/9', '4/3', '3/2'], default: 'auto' }
    }
  }
};

// Helper functions
export function getComponentSpec(componentId) {
  return COMPONENT_LOGIC_SPECS[componentId] || null;
}

export function getComponentsByCategory(category) {
  return Object.values(COMPONENT_LOGIC_SPECS).filter(spec => spec.category === category);
}

export function canAddChild(parentId, childId) {
  const parent = COMPONENT_LOGIC_SPECS[parentId];
  if (!parent || !parent.canHaveChildren) return false;
  if (parent.allowedChildren && parent.allowedChildren.length > 0) {
    return parent.allowedChildren.includes(childId);
  }
  return true;
}

export function getComponentDepth(component, allComponents = []) {
  if (!component.children || component.children.length === 0) return 1;
  const childDepths = component.children.map(childId => {
    const child = allComponents.find(c => c.id === childId);
    return child ? getComponentDepth(child, allComponents) + 1 : 1;
  });
  return Math.max(...childDepths);
}