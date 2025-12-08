/**
 * Sturij Design System - Design Tokens Export
 * 
 * This file exports all design tokens as JavaScript constants for programmatic access.
 * Use these when you need to access design values in JavaScript/React logic.
 * 
 * For CSS usage, prefer using CSS variables directly: var(--color-primary)
 */

// ================================
// COLOR PALETTE
// ================================

export const colors = {
  // Primary (Forest Green)
  primary: {
    50: '#f2f5f3',
    100: '#e5ebe6',
    200: '#c9d5cc',
    300: '#a8bead',
    400: '#7a9a82',
    500: '#4A5D4E',
    600: '#3e4f42',
    700: '#334137',
    800: '#28332c',
    900: '#1e2621',
    DEFAULT: '#4A5D4E',
    light: '#5d7361',
    dark: '#3a4a3e'
  },
  
  // Secondary (Warm Copper/Tan)
  secondary: {
    50: '#faf6f2',
    100: '#f5ede4',
    200: '#ebdbc9',
    300: '#e0c4a8',
    400: '#D4A574',
    500: '#c89254',
    600: '#b67d3f',
    700: '#966633',
    800: '#78522a',
    900: '#624423',
    DEFAULT: '#D4A574',
    light: '#e0bc94',
    dark: '#c08d54'
  },
  
  // Accent (Soft Blush)
  accent: {
    50: '#fdf9f7',
    100: '#f9f1ed',
    200: '#f2e2db',
    300: '#e8cec4',
    400: '#d9b4a7',
    500: '#c99a8a',
    600: '#b5806e',
    700: '#966858',
    800: '#7a5548',
    900: '#64463c',
    DEFAULT: '#d9b4a7',
    light: '#e8cec4',
    dark: '#c99a8a'
  },
  
  // Background
  background: {
    50: '#faf9f7',
    100: '#f5f3ef',
    200: '#eceae5',
    300: '#e3dfd7',
    400: '#dad4ca',
    DEFAULT: '#f5f3ef',
    paper: '#ffffff',
    subtle: '#faf9f7',
    muted: '#eceae5'
  },
  
  // Midnight (Dark Blue-Grey)
  midnight: {
    50: '#f4f6f7',
    100: '#e3e7ea',
    200: '#c9d1d7',
    300: '#a3b1bb',
    400: '#758997',
    500: '#5a6e7d',
    600: '#4d5d6a',
    700: '#434f59',
    800: '#3b444d',
    900: '#1b2a35',
    DEFAULT: '#1b2a35',
    light: '#2a3d4a',
    dark: '#121c24'
  },
  
  // Charcoal
  charcoal: {
    50: '#f6f6f6',
    100: '#e7e7e7',
    200: '#d1d1d1',
    300: '#b0b0b0',
    400: '#888888',
    500: '#6d6d6d',
    600: '#5d5d5d',
    700: '#4f4f4f',
    800: '#3b3b3b',
    900: '#262626',
    DEFAULT: '#3b3b3b',
    light: '#555555',
    dark: '#2a2a2a'
  },
  
  // Semantic Colors
  destructive: {
    DEFAULT: '#8b5b5b',
    light: '#a87272',
    dark: '#6e4747'
  },
  
  success: {
    DEFAULT: '#5a7a5e',
    light: '#6d8f71',
    dark: '#486249'
  },
  
  warning: {
    DEFAULT: '#c4a35a',
    light: '#d4b872',
    dark: '#a88c42'
  },
  
  info: {
    DEFAULT: '#5a7a8b',
    light: '#6d8f9f',
    dark: '#486270'
  }
};

// ================================
// TYPOGRAPHY
// ================================

export const typography = {
  fonts: {
    heading: '"Degular Display Light", system-ui, sans-serif',
    body: '"Mrs Eaves XL Serif", Georgia, serif',
    mono: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace'
  },
  
  sizes: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem',// 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem'     // 48px
  },
  
  lineHeights: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2
  },
  
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
    airy: '0.02em'
  }
};

// ================================
// SPACING (4px base grid)
// ================================

export const spacing = {
  0: '0',
  px: '1px',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem',     // 96px
  32: '8rem'      // 128px
};

// ================================
// SHADOWS
// ================================

export const shadows = {
  xs: '0 1px 2px 0 rgb(27 42 53 / 0.05)',
  sm: '0 1px 3px 0 rgb(27 42 53 / 0.1), 0 1px 2px -1px rgb(27 42 53 / 0.1)',
  md: '0 4px 6px -1px rgb(27 42 53 / 0.1), 0 2px 4px -2px rgb(27 42 53 / 0.1)',
  lg: '0 10px 15px -3px rgb(27 42 53 / 0.1), 0 4px 6px -4px rgb(27 42 53 / 0.1)',
  xl: '0 20px 25px -5px rgb(27 42 53 / 0.1), 0 8px 10px -6px rgb(27 42 53 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(27 42 53 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(27 42 53 / 0.05)',
  primary: '0 4px 14px 0 rgb(74 93 78 / 0.25)',
  secondary: '0 4px 14px 0 rgb(212 165 116 / 0.25)',
  accent: '0 4px 14px 0 rgb(217 180 167 / 0.25)'
};

// ================================
// BORDER RADII
// ================================

export const radii = {
  none: '0',
  xs: '0.125rem',   // 2px
  sm: '4px',
  md: '6px',
  lg: '8px',
  xl: '12px',
  '2xl': '16px',
  '3xl': '24px',
  full: '9999px'
};

// ================================
// TRANSITIONS
// ================================

export const transitions = {
  fast: '150ms ease',
  normal: '200ms ease',
  slow: '300ms ease',
  slower: '500ms ease'
};

// ================================
// COMPONENT TOKENS
// ================================

export const components = {
  header: {
    height: '56px'
  },
  sidebar: {
    width: '256px',
    collapsedWidth: '64px'
  }
};

// ================================
// CSS VARIABLE INJECTION
// ================================

/**
 * Complete CSS string for injecting into <style> tags
 * Use in Layout.js: <style dangerouslySetInnerHTML={{ __html: cssVariables }} />
 */
export const cssVariables = `
/* Force Adobe Fonts to load */
body {
  font-family: var(--font-body);
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-heading);
}

:root {
  /* ================================
     SHADCN/UI BASE TOKENS (HSL)
     ================================ */
  --background: 0 0% 100%;
  --foreground: 0 0% 3.9%;
  --card: 0 0% 100%;
  --card-foreground: 0 0% 3.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 0 0% 3.9%;
  --primary: 135 12% 33%;
  --primary-foreground: 0 0% 98%;
  --secondary: 0 0% 96.1%;
  --secondary-foreground: 0 0% 9%;
  --muted: 0 0% 96.1%;
  --muted-foreground: 0 0% 45.1%;
  --accent: 0 0% 96.1%;
  --accent-foreground: 0 0% 9%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 0 0% 98%;
  --border: 0 0% 89.8%;
  --input: 0 0% 89.8%;
  --ring: 0 0% 3.9%;
  --radius: 0.5rem;

  /* ================================
     STURIJ DESIGN SYSTEM TOKENS
     ================================ */
  
  /* Primary palette (Forest Green) */
  --sturij-primary: 135 12% 33%;
  --sturij-primary-light: 135 11% 40%;
  --sturij-primary-dark: 135 13% 26%;

  /* Secondary palette (Warm Copper/Tan) */
  --sturij-secondary: 30 52% 65%;
  --sturij-secondary-light: 30 52% 73%;
  --sturij-secondary-dark: 30 52% 54%;

  /* Accent palette (Soft Blush) */
  --sturij-accent: 17 36% 75%;
  --sturij-accent-light: 17 40% 84%;
  --sturij-accent-dark: 17 32% 66%;

  /* Background palette */
  --sturij-background: 40 20% 95%;
  --sturij-background-paper: 0 0% 100%;
  --sturij-background-subtle: 40 25% 98%;
  --sturij-background-muted: 40 15% 91%;

  /* Midnight palette (Dark Blue-Grey) */
  --sturij-midnight: 203 33% 16%;
  --sturij-midnight-light: 203 29% 23%;
  --sturij-midnight-dark: 203 36% 11%;

  /* Charcoal palette */
  --sturij-charcoal: 0 0% 23%;
  --sturij-charcoal-light: 0 0% 33%;
  --sturij-charcoal-dark: 0 0% 16%;

  /* Semantic colors */
  --sturij-success: 130 16% 41%;
  --sturij-warning: 44 46% 56%;
  --sturij-info: 200 21% 45%;
  --sturij-destructive: 0 20% 45%;

  /* ================================
     HEX VALUES (for var() usage)
     ================================ */
  --color-primary: #4A5D4E;
  --color-primary-light: #5d7361;
  --color-primary-dark: #3a4a3e;
  --color-secondary: #D4A574;
  --color-secondary-light: #e0bc94;
  --color-secondary-dark: #c08d54;
  --color-accent: #d9b4a7;
  --color-accent-light: #e8cec4;
  --color-accent-dark: #c99a8a;
  --color-background: #f5f3ef;
  --color-background-paper: #ffffff;
  --color-background-subtle: #faf9f7;
  --color-background-muted: #eceae5;
  --color-midnight: #1b2a35;
  --color-midnight-light: #2a3d4a;
  --color-midnight-dark: #121c24;
  --color-charcoal: #3b3b3b;
  --color-charcoal-light: #555555;
  --color-charcoal-dark: #2a2a2a;
  --color-destructive: #8b5b5b;
  --color-success: #5a7a5e;
  --color-warning: #c4a35a;
  --color-info: #5a7a8b;

  /* Typography */
  --font-heading: degular-display, system-ui, sans-serif;
  --font-body: mrs-eaves-xl-serif-narrow, Georgia, serif;
  --font-mono: ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace;

  /* Spacing */
  --spacing-1: 0.25rem;
  --spacing-2: 0.5rem;
  --spacing-3: 0.75rem;
  --spacing-4: 1rem;
  --spacing-6: 1.5rem;
  --spacing-8: 2rem;
  --spacing-12: 3rem;

  /* Effects */
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
  --radius-xl: 12px;
  --shadow-sm: 0 1px 3px 0 rgb(27 42 53 / 0.1);
  --shadow-md: 0 4px 6px -1px rgb(27 42 53 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(27 42 53 / 0.1);
  --transition-normal: 200ms ease;
}
`;

// ================================
// UTILITY FUNCTIONS
// ================================

/**
 * Get a color value by path
 * @param {string} path - Dot notation path (e.g., 'primary.500', 'secondary.light')
 */
export function getColor(path) {
  const parts = path.split('.');
  let value = colors;
  for (const part of parts) {
    value = value[part];
    if (!value) return null;
  }
  return value;
}

/**
 * Get spacing value
 * @param {number|string} size - Spacing key (1-32)
 */
export function getSpacing(size) {
  return spacing[size] || null;
}

/**
 * Get shadow value
 * @param {string} level - Shadow level (xs, sm, md, lg, xl, 2xl)
 */
export function getShadow(level) {
  return shadows[level] || shadows.md;
}

/**
 * Get border radius value
 * @param {string} size - Radius size (sm, md, lg, xl)
 */
export function getRadius(size) {
  return radii[size] || radii.lg;
}

// ================================
// THEME PRESET
// ================================

/**
 * Complete theme preset for easy import
 */
export const sturijTheme = {
  colors,
  typography,
  spacing,
  shadows,
  radii,
  transitions,
  components
};

export default sturijTheme;