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
    50: 'oklch(0.972 0.011 159.8)',
    100: 'oklch(0.945 0.022 159.8)',
    200: 'oklch(0.890 0.033 159.8)',
    300: 'oklch(0.791 0.044 159.8)',
    400: 'oklch(0.668 0.048 159.8)',
    500: 'oklch(0.398 0.037 159.8)',
    600: 'oklch(0.333 0.031 159.8)',
    700: 'oklch(0.279 0.026 159.8)',
    800: 'oklch(0.237 0.022 159.8)',
    900: 'oklch(0.204 0.019 159.8)',
    DEFAULT: 'oklch(0.398 0.037 159.8)',
    light: 'oklch(0.668 0.048 159.8)',
    dark: 'oklch(0.279 0.026 159.8)'
  },
  
  // Secondary (Warm Copper/Tan)
  secondary: {
    50: 'oklch(0.980 0.010 70.3)',
    100: 'oklch(0.960 0.020 70.3)',
    200: 'oklch(0.906 0.040 70.3)',
    300: 'oklch(0.835 0.060 70.3)',
    400: 'oklch(0.728 0.074 70.3)',
    500: 'oklch(0.676 0.085 70.3)',
    600: 'oklch(0.610 0.090 70.3)',
    700: 'oklch(0.516 0.076 70.3)',
    800: 'oklch(0.437 0.064 70.3)',
    900: 'oklch(0.374 0.054 70.3)',
    DEFAULT: 'oklch(0.728 0.074 70.3)',
    light: 'oklch(0.835 0.060 70.3)',
    dark: 'oklch(0.610 0.090 70.3)'
  },
  
  // Accent (Soft Blush)
  accent: {
    50: 'oklch(0.980 0.008 35.6)',
    100: 'oklch(0.957 0.016 35.6)',
    200: 'oklch(0.894 0.032 35.6)',
    300: 'oklch(0.785 0.044 35.6)',
    400: 'oklch(0.715 0.048 35.6)',
    500: 'oklch(0.646 0.052 35.6)',
    600: 'oklch(0.577 0.056 35.6)',
    700: 'oklch(0.490 0.047 35.6)',
    800: 'oklch(0.417 0.040 35.6)',
    900: 'oklch(0.357 0.034 35.6)',
    DEFAULT: 'oklch(0.785 0.044 35.6)',
    light: 'oklch(0.894 0.032 35.6)',
    dark: 'oklch(0.646 0.052 35.6)'
  },
  
  // Background
  background: {
    50: 'oklch(0.990 0.007 83.1)',
    100: 'oklch(0.962 0.010 83.1)',
    200: 'oklch(0.927 0.020 83.1)',
    300: 'oklch(0.876 0.030 83.1)',
    400: 'oklch(0.809 0.040 83.1)',
    DEFAULT: 'oklch(0.962 0.010 83.1)',
    paper: 'oklch(1.000 0.000 0)',
    subtle: 'oklch(0.990 0.007 83.1)',
    muted: 'oklch(0.927 0.020 83.1)'
  },
  
  // Midnight (Dark Blue-Grey)
  midnight: {
    50: 'oklch(0.970 0.007 235.4)',
    100: 'oklch(0.929 0.014 235.4)',
    200: 'oklch(0.859 0.026 235.4)',
    300: 'oklch(0.749 0.032 235.4)',
    400: 'oklch(0.619 0.038 235.4)',
    500: 'oklch(0.513 0.040 235.4)',
    600: 'oklch(0.451 0.041 235.4)',
    700: 'oklch(0.387 0.040 235.4)',
    800: 'oklch(0.341 0.038 235.4)',
    900: 'oklch(0.223 0.036 235.4)',
    DEFAULT: 'oklch(0.223 0.036 235.4)',
    light: 'oklch(0.341 0.038 235.4)',
    dark: 'oklch(0.223 0.036 235.4)'
  },
  
  // Charcoal
  charcoal: {
    50: 'oklch(0.975 0.000 0)',
    100: 'oklch(0.943 0.000 0)',
    200: 'oklch(0.878 0.000 0)',
    300: 'oklch(0.783 0.000 0)',
    400: 'oklch(0.667 0.000 0)',
    500: 'oklch(0.543 0.000 0)',
    600: 'oklch(0.439 0.000 0)',
    700: 'oklch(0.356 0.000 0)',
    800: 'oklch(0.297 0.000 0)',
    900: 'oklch(0.250 0.000 0)',
    DEFAULT: 'oklch(0.297 0.000 0)',
    light: 'oklch(0.439 0.000 0)',
    dark: 'oklch(0.250 0.000 0)'
  },
  
  // Semantic Colors
  destructive: {
    DEFAULT: 'oklch(0.482 0.071 25.7)',
    light: 'oklch(0.580 0.064 25.7)',
    dark: 'oklch(0.410 0.060 25.7)'
  },
  
  success: {
    DEFAULT: 'oklch(0.513 0.040 159.8)',
    light: 'oklch(0.619 0.038 159.8)',
    dark: 'oklch(0.387 0.040 159.8)'
  },
  
  warning: {
    DEFAULT: 'oklch(0.676 0.085 70.3)',
    light: 'oklch(0.728 0.074 70.3)',
    dark: 'oklch(0.610 0.090 70.3)'
  },
  
  info: {
    DEFAULT: 'oklch(0.513 0.040 235.4)',
    light: 'oklch(0.619 0.038 235.4)',
    dark: 'oklch(0.387 0.040 235.4)'
  }
};

// ================================
// TYPOGRAPHY
// ================================

export const typography = {
  fonts: {
    heading: 'degular-display, system-ui, sans-serif',
    body: 'mrs-eaves-xl-serif-narrow, Georgia, serif',
    mono: 'ui-monospace, SFMono-Regular, SF Mono, Menlo, monospace'
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
  xs: '0 1px 2px 0 oklch(0.223 0.036 235.4 / 0.05)',
  sm: '0 1px 3px 0 oklch(0.223 0.036 235.4 / 0.1), 0 1px 2px -1px oklch(0.223 0.036 235.4 / 0.1)',
  md: '0 4px 6px -1px oklch(0.223 0.036 235.4 / 0.1), 0 2px 4px -2px oklch(0.223 0.036 235.4 / 0.1)',
  lg: '0 10px 15px -3px oklch(0.223 0.036 235.4 / 0.1), 0 4px 6px -4px oklch(0.223 0.036 235.4 / 0.1)',
  xl: '0 20px 25px -5px oklch(0.223 0.036 235.4 / 0.1), 0 8px 10px -6px oklch(0.223 0.036 235.4 / 0.1)',
  '2xl': '0 25px 50px -12px oklch(0.223 0.036 235.4 / 0.25)',
  inner: 'inset 0 2px 4px 0 oklch(0.223 0.036 235.4 / 0.05)',
  primary: '0 4px 14px 0 oklch(0.398 0.037 159.8 / 0.25)',
  secondary: '0 4px 14px 0 oklch(0.728 0.074 70.3 / 0.25)',
  accent: '0 4px 14px 0 oklch(0.785 0.044 35.6 / 0.25)'
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
/* Force Adobe Fonts to load - NO QUOTES */
body {
  font-family: mrs-eaves-xl-serif-narrow, Georgia, serif;
}

h1, h2, h3, h4, h5, h6 {
  font-family: degular-display, system-ui, sans-serif;
}

:root {
  /* ================================
     TYPOGRAPHY TOKENS
     ================================ */
  --font-family-display: degular-display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --font-family-body: mrs-eaves-xl-serif-narrow, Georgia, "Times New Roman", serif;
  --font-family-mono: source-code-pro, "SF Mono", Monaco, monospace;
  --font-heading: var(--font-family-display);
  --font-body: var(--font-family-body);
  --font-mono: var(--font-family-mono);

  /* Font Sizes */
  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
  --text-2xl: 1.5rem;
  --text-3xl: 1.875rem;
  --text-4xl: 2.25rem;
  --text-5xl: 3rem;

  /* ================================
     PRIMARY COLOR SCALE (Sage Green)
     ================================ */
  --primary-50: #f0f5f3;
  --primary-100: #dce8e3;
  --primary-200: #b9d1c7;
  --primary-300: #8ab5a5;
  --primary-400: #5a9480;
  --primary-500: #4a7c6b;
  --primary-600: #3d6658;
  --primary-700: #325447;
  --primary-800: #2a463b;
  --primary-900: #233a31;

  /* ================================
     SECONDARY COLOR SCALE (Warm Beige)
     ================================ */
  --secondary-50: #faf8f5;
  --secondary-100: #f5f0e8;
  --secondary-200: #e8dcc8;
  --secondary-300: #d6c3a0;
  --secondary-400: #c4a87a;
  --secondary-500: #b5956a;
  --secondary-600: #a0815a;
  --secondary-700: #7d644a;
  --secondary-800: #5f4c3a;
  --secondary-900: #4a3b2d;

  /* ================================
     ACCENT COLOR SCALE (Dusty Rose)
     ================================ */
  --accent-50: #faf7f6;
  --accent-100: #f5eeec;
  --accent-200: #e8d8d3;
  --accent-300: #d4bab2;
  --accent-400: #c4a198;
  --accent-500: #b08880;
  --accent-600: #9a7068;
  --accent-700: #7a5850;
  --accent-800: #5f4540;
  --accent-900: #4a3633;

  /* ================================
     BACKGROUND COLOR SCALE
     ================================ */
  --background-50: #fdfcfa;
  --background-100: #f5f3ef;
  --background-200: #e8e5de;
  --background-300: #d6d1c7;
  --background-400: #bfb8ab;
  --background-500: #a39c91;

  /* ================================
     MIDNIGHT COLOR SCALE (Dark Blue-Gray)
     ================================ */
  --midnight-50: #f5f7f9;
  --midnight-100: #e8ecf1;
  --midnight-200: #cdd5df;
  --midnight-300: #a3b1c4;
  --midnight-400: #7589a3;
  --midnight-500: #5a6f89;
  --midnight-600: #4d5f78;
  --midnight-700: #404f64;
  --midnight-800: #364354;
  --midnight-900: #1e2a38;

  /* ================================
     CHARCOAL COLOR SCALE
     ================================ */
  --charcoal-50: #f7f7f7;
  --charcoal-100: #e8e8e8;
  --charcoal-200: #d4d4d4;
  --charcoal-300: #b5b5b5;
  --charcoal-400: #8f8f8f;
  --charcoal-500: #6b6b6b;
  --charcoal-600: #525252;
  --charcoal-700: #404040;
  --charcoal-800: #333333;
  --charcoal-900: #262626;

  /* ================================
     DESTRUCTIVE COLOR SCALE
     ================================ */
  --destructive-50: #faf6f5;
  --destructive-100: #f5ecea;
  --destructive-200: #e8d5d0;
  --destructive-300: #d4b5ac;
  --destructive-400: #b88d80;
  --destructive-500: #9a6b5c;
  --destructive-600: #7a4f42;
  --destructive-700: #5f3f35;
  --destructive-800: #4a322a;
  --destructive-900: #3a2822;

  /* ================================
     SEMANTIC COLORS
     ================================ */
  --color-primary: var(--primary-500);
  --color-secondary: var(--secondary-400);
  --color-accent: var(--accent-300);
  --color-background: var(--background-100);
  --color-card: #ffffff;
  --color-border: var(--background-300);

  /* Text Colors */
  --text-primary: var(--midnight-900);
  --text-secondary: var(--charcoal-800);
  --text-body: var(--charcoal-700);
  --text-muted: var(--charcoal-600);
  --text-subtle: var(--charcoal-500);

  /* ================================
     SPACING TOKENS
     ================================ */
  --spacing-1: 0.25rem;
  --spacing-2: 0.5rem;
  --spacing-3: 0.75rem;
  --spacing-4: 1rem;
  --spacing-5: 1.25rem;
  --spacing-6: 1.5rem;
  --spacing-8: 2rem;
  --spacing-10: 2.5rem;
  --spacing-12: 3rem;
  --spacing-16: 4rem;

  /* ================================
     BORDER RADIUS TOKENS
     ================================ */
  --radius-none: 0;
  --radius-xs: 0.125rem;
  --radius-sm: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  --radius-xl: 0.75rem;
  --radius-2xl: 1rem;
  --radius-3xl: 1.5rem;
  --radius-full: 9999px;

  /* ================================
     SHADOW TOKENS
     ================================ */
  --shadow-xs: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  --shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);

  /* ================================
     SHADCN/UI TOKENS (for compatibility)
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
     Z-INDEX TOKENS
     ================================ */
  --z-base: 0;
  --z-dropdown: 1000;
  --z-sticky: 1020;
  --z-fixed: 1030;
  --z-modal-backdrop: 1040;
  --z-modal: 1050;
  --z-popover: 1060;
  --z-tooltip: 1070;
  --z-toast: 1080;
  --z-max: 9999;
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