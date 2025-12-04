// Sturij Design System Tokens
// Base44 Tradespeople Platform

export const colors = {
  // Primary palette
  primary: {
    DEFAULT: '#4A5D4E',
    light: '#5d7361',
    dark: '#3a4a3e',
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
  },
  
  // Secondary (warm copper/tan)
  secondary: {
    DEFAULT: '#D4A574',
    light: '#e0bc94',
    dark: '#c08d54',
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
  },
  
  // Accent (soft blush)
  accent: {
    DEFAULT: '#d9b4a7',
    light: '#e8cec4',
    dark: '#c99a8a',
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
  },
  
  // Background
  background: {
    DEFAULT: '#f5f3ef',
    paper: '#ffffff',
    subtle: '#faf9f7',
    muted: '#eceae5',
  },
  
  // Midnight (dark blue-grey)
  midnight: {
    DEFAULT: '#1b2a35',
    light: '#2a3d4a',
    dark: '#121c24',
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
  },
  
  // Charcoal
  charcoal: {
    DEFAULT: '#3b3b3b',
    light: '#555555',
    dark: '#2a2a2a',
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
  },
  
  // Destructive (muted red)
  destructive: {
    DEFAULT: '#8b5b5b',
    light: '#a87272',
    dark: '#6e4747',
    50: '#faf5f5',
    100: '#f4e8e8',
    200: '#ebd4d4',
    300: '#ddb5b5',
    400: '#c98e8e',
    500: '#8b5b5b',
    600: '#7a4f4f',
    700: '#664242',
    800: '#553838',
    900: '#483030',
  },
  
  // Semantic colors
  success: {
    DEFAULT: '#5a7a5e',
    light: '#6d8f71',
    dark: '#486249',
  },
  warning: {
    DEFAULT: '#c4a35a',
    light: '#d4b872',
    dark: '#a88c42',
  },
  info: {
    DEFAULT: '#5a7a8b',
    light: '#6d8f9f',
    dark: '#486270',
  },
};

export const typography = {
  fonts: {
    heading: '"Degular Display Light", system-ui, sans-serif',
    body: '"Mrs Eaves XL Serif", Georgia, serif',
    mono: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace',
  },
  
  sizes: {
    xs: '0.75rem',     // 12px
    sm: '0.875rem',    // 14px
    base: '1rem',      // 16px
    lg: '1.125rem',    // 18px
    xl: '1.25rem',     // 20px
    '2xl': '1.5rem',   // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
    '5xl': '3rem',     // 48px
    '6xl': '3.75rem',  // 60px
  },
  
  weights: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  
  lineHeights: {
    tight: 1.2,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },
  
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
};

export const spacing = {
  px: '1px',
  0: '0',
  0.5: '2px',
  1: '4px',
  1.5: '6px',
  2: '8px',
  2.5: '10px',
  3: '12px',
  3.5: '14px',
  4: '16px',
  5: '20px',
  6: '24px',
  7: '28px',
  8: '32px',
  9: '36px',
  10: '40px',
  11: '44px',
  12: '48px',
  14: '56px',
  16: '64px',
  20: '80px',
  24: '96px',
  28: '112px',
  32: '128px',
};

export const shadows = {
  none: 'none',
  xs: '0 1px 2px 0 rgb(27 42 53 / 0.05)',
  sm: '0 1px 3px 0 rgb(27 42 53 / 0.1), 0 1px 2px -1px rgb(27 42 53 / 0.1)',
  md: '0 4px 6px -1px rgb(27 42 53 / 0.1), 0 2px 4px -2px rgb(27 42 53 / 0.1)',
  lg: '0 10px 15px -3px rgb(27 42 53 / 0.1), 0 4px 6px -4px rgb(27 42 53 / 0.1)',
  xl: '0 20px 25px -5px rgb(27 42 53 / 0.1), 0 8px 10px -6px rgb(27 42 53 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(27 42 53 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(27 42 53 / 0.05)',
  // Colored shadows
  primary: '0 4px 14px 0 rgb(74 93 78 / 0.25)',
  secondary: '0 4px 14px 0 rgb(212 165 116 / 0.25)',
  accent: '0 4px 14px 0 rgb(217 180 167 / 0.25)',
};

export const radii = {
  none: '0',
  sm: '4px',
  md: '6px',
  lg: '8px',
  xl: '12px',
  '2xl': '16px',
  '3xl': '24px',
  full: '9999px',
};

export const borders = {
  none: 'none',
  thin: '1px solid',
  medium: '2px solid',
  thick: '4px solid',
};

export const transitions = {
  fast: '150ms ease',
  normal: '200ms ease',
  slow: '300ms ease',
  slower: '500ms ease',
};

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

export const zIndex = {
  hide: -1,
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  fixed: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  tooltip: 1600,
};

// CSS custom properties export - Complete Sturij Design System
export const cssVariables = `
:root {
  /* Primary palette (Forest Green) */
  --color-primary: ${colors.primary.DEFAULT};
  --color-primary-light: ${colors.primary.light};
  --color-primary-dark: ${colors.primary.dark};
  --color-primary-50: ${colors.primary[50]};
  --color-primary-100: ${colors.primary[100]};
  --color-primary-200: ${colors.primary[200]};
  --color-primary-300: ${colors.primary[300]};
  --color-primary-400: ${colors.primary[400]};
  --color-primary-500: ${colors.primary[500]};
  --color-primary-600: ${colors.primary[600]};
  --color-primary-700: ${colors.primary[700]};
  --color-primary-800: ${colors.primary[800]};
  --color-primary-900: ${colors.primary[900]};

  /* Secondary palette (Warm Copper/Tan) */
  --color-secondary: ${colors.secondary.DEFAULT};
  --color-secondary-light: ${colors.secondary.light};
  --color-secondary-dark: ${colors.secondary.dark};
  --color-secondary-50: ${colors.secondary[50]};
  --color-secondary-100: ${colors.secondary[100]};
  --color-secondary-200: ${colors.secondary[200]};
  --color-secondary-300: ${colors.secondary[300]};
  --color-secondary-400: ${colors.secondary[400]};
  --color-secondary-500: ${colors.secondary[500]};
  --color-secondary-600: ${colors.secondary[600]};
  --color-secondary-700: ${colors.secondary[700]};
  --color-secondary-800: ${colors.secondary[800]};
  --color-secondary-900: ${colors.secondary[900]};

  /* Accent palette (Soft Blush) */
  --color-accent: ${colors.accent.DEFAULT};
  --color-accent-light: ${colors.accent.light};
  --color-accent-dark: ${colors.accent.dark};
  --color-accent-50: ${colors.accent[50]};
  --color-accent-100: ${colors.accent[100]};
  --color-accent-200: ${colors.accent[200]};
  --color-accent-300: ${colors.accent[300]};
  --color-accent-400: ${colors.accent[400]};
  --color-accent-500: ${colors.accent[500]};
  --color-accent-600: ${colors.accent[600]};
  --color-accent-700: ${colors.accent[700]};
  --color-accent-800: ${colors.accent[800]};
  --color-accent-900: ${colors.accent[900]};

  /* Background palette */
  --color-background: ${colors.background.DEFAULT};
  --color-background-paper: ${colors.background.paper};
  --color-background-subtle: ${colors.background.subtle};
  --color-background-muted: ${colors.background.muted};
  --color-background-50: #faf9f7;
  --color-background-100: #f5f3ef;
  --color-background-200: #eceae5;
  --color-background-300: #e0ded8;
  --color-background-400: #d4d1ca;

  /* Midnight palette (Dark Blue-Grey) */
  --color-midnight: ${colors.midnight.DEFAULT};
  --color-midnight-light: ${colors.midnight.light};
  --color-midnight-dark: ${colors.midnight.dark};
  --color-midnight-50: ${colors.midnight[50]};
  --color-midnight-100: ${colors.midnight[100]};
  --color-midnight-200: ${colors.midnight[200]};
  --color-midnight-300: ${colors.midnight[300]};
  --color-midnight-400: ${colors.midnight[400]};
  --color-midnight-500: ${colors.midnight[500]};
  --color-midnight-600: ${colors.midnight[600]};
  --color-midnight-700: ${colors.midnight[700]};
  --color-midnight-800: ${colors.midnight[800]};
  --color-midnight-900: ${colors.midnight[900]};

  /* Charcoal palette */
  --color-charcoal: ${colors.charcoal.DEFAULT};
  --color-charcoal-light: ${colors.charcoal.light};
  --color-charcoal-dark: ${colors.charcoal.dark};
  --color-charcoal-50: ${colors.charcoal[50]};
  --color-charcoal-100: ${colors.charcoal[100]};
  --color-charcoal-200: ${colors.charcoal[200]};
  --color-charcoal-300: ${colors.charcoal[300]};
  --color-charcoal-400: ${colors.charcoal[400]};
  --color-charcoal-500: ${colors.charcoal[500]};
  --color-charcoal-600: ${colors.charcoal[600]};
  --color-charcoal-700: ${colors.charcoal[700]};
  --color-charcoal-800: ${colors.charcoal[800]};
  --color-charcoal-900: ${colors.charcoal[900]};

  /* Destructive palette (Muted Red) */
  --color-destructive: ${colors.destructive.DEFAULT};
  --color-destructive-light: ${colors.destructive.light};
  --color-destructive-dark: ${colors.destructive.dark};
  --color-destructive-50: ${colors.destructive[50]};
  --color-destructive-100: ${colors.destructive[100]};
  --color-destructive-200: ${colors.destructive[200]};
  --color-destructive-300: ${colors.destructive[300]};
  --color-destructive-400: ${colors.destructive[400]};
  --color-destructive-500: ${colors.destructive[500]};
  --color-destructive-600: ${colors.destructive[600]};
  --color-destructive-700: ${colors.destructive[700]};
  --color-destructive-800: ${colors.destructive[800]};
  --color-destructive-900: ${colors.destructive[900]};

  /* Semantic colors */
  --color-success: ${colors.success.DEFAULT};
  --color-success-light: ${colors.success.light};
  --color-success-dark: ${colors.success.dark};
  --color-warning: ${colors.warning.DEFAULT};
  --color-warning-light: ${colors.warning.light};
  --color-warning-dark: ${colors.warning.dark};
  --color-info: ${colors.info.DEFAULT};
  --color-info-light: ${colors.info.light};
  --color-info-dark: ${colors.info.dark};

  /* Typography */
  --font-heading: ${typography.fonts.heading};
  --font-body: ${typography.fonts.body};
  --font-mono: ${typography.fonts.mono};
  --font-family-display: ${typography.fonts.heading};

  /* Shadows */
  --shadow-xs: ${shadows.xs};
  --shadow-sm: ${shadows.sm};
  --shadow-md: ${shadows.md};
  --shadow-lg: ${shadows.lg};
  --shadow-xl: ${shadows.xl};
  --shadow-2xl: ${shadows['2xl']};
  --shadow-inner: ${shadows.inner};
  --shadow-primary: ${shadows.primary};
  --shadow-secondary: ${shadows.secondary};
  --shadow-accent: ${shadows.accent};

  /* Border Radii */
  --radius-none: ${radii.none};
  --radius-sm: ${radii.sm};
  --radius-md: ${radii.md};
  --radius-lg: ${radii.lg};
  --radius-xl: ${radii.xl};
  --radius-2xl: ${radii['2xl']};
  --radius-3xl: ${radii['3xl']};
  --radius-full: ${radii.full};

  /* Transitions */
  --transition-fast: ${transitions.fast};
  --transition-normal: ${transitions.normal};
  --transition-slow: ${transitions.slow};
  --transition-slower: ${transitions.slower};
}
`;

export default {
  colors,
  typography,
  spacing,
  shadows,
  radii,
  borders,
  transitions,
  breakpoints,
  zIndex,
  cssVariables,
};