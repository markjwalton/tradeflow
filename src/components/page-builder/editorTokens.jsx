/**
 * Design Tokens for Page Builder/Editor UI
 * Centralized styling for editor components
 */

export const editorTokens = {
  // Editor Panel
  panel: {
    background: "var(--color-background)",
    border: "var(--color-border)",
    shadow: "var(--shadow-lg)",
  },

  // Compact Controls
  control: {
    size: "28px", // h-7 w-7
    fontSize: "9px",
    fontWeight: "500",
    borderRadius: "var(--radius-md)",
    gap: "4px", // gap-1
  },

  // Color Swatches
  swatch: {
    size: "28px", // h-7 w-7
    borderRadius: "var(--radius-md)",
    border: "1px solid var(--color-border)",
    hoverScale: "1.1",
    activeRing: "2px solid var(--color-primary)",
    activeRingOffset: "1px",
  },

  // Grid Layouts
  grid: {
    colors: "grid-cols-10",
    spacing: "grid-cols-7",
    typography: "grid-cols-4",
    weights: "grid-cols-3",
    radius: "grid-cols-4",
  },

  // Spacing
  spacing: {
    sectionGap: "var(--spacing-4)",
    labelMargin: "var(--spacing-2)",
    categoryMargin: "var(--spacing-3)",
  },

  // Typography
  label: {
    fontSize: "var(--text-xs)",
    fontWeight: "var(--font-weight-medium)",
    color: "var(--text-secondary)",
  },

  category: {
    fontSize: "var(--text-xs)",
    color: "var(--text-muted)",
    textTransform: "capitalize",
  },
};

export const editorClasses = {
  control: "h-7 w-7 p-0 text-[9px] font-medium min-w-0 flex items-center justify-center",
  swatch: "h-7 w-7 rounded border transition-all hover:scale-110",
  swatchActive: "ring-2 ring-primary ring-offset-1",
  label: "text-xs font-medium",
  category: "text-xs text-muted-foreground mb-1 capitalize",
};