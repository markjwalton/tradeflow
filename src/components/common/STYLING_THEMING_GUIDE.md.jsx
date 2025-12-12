# Styling & Theming Guide

## Overview
Comprehensive guide to styling React applications using Tailwind CSS, CSS variables, design tokens, and theming patterns.

---

## 1. Tailwind CSS Basics

### Utility Classes

```jsx
function Card() {
  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <h2 className="text-2xl font-semibold text-foreground">Title</h2>
      <p className="mt-2 text-sm text-muted-foreground">Description</p>
      <button className="mt-4 rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90">
        Action
      </button>
    </div>
  );
}
```

### Responsive Design

```jsx
function ResponsiveLayout() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {/* Mobile: 1 column, Tablet: 2, Desktop: 3, Large: 4 */}
      <Card />
      <Card />
      <Card />
    </div>
  );
}
```

### Conditional Styling

```jsx
import { cn } from '@/lib/utils';

function Button({ variant = 'default', size = 'md', disabled, className }) {
  return (
    <button
      className={cn(
        // Base styles
        "inline-flex items-center justify-center rounded-md font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        
        // Variant styles
        variant === 'default' && "bg-primary text-primary-foreground hover:bg-primary/90",
        variant === 'destructive' && "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        variant === 'outline' && "border border-input bg-background hover:bg-accent",
        variant === 'ghost' && "hover:bg-accent hover:text-accent-foreground",
        
        // Size styles
        size === 'sm' && "h-9 px-3 text-sm",
        size === 'md' && "h-10 px-4",
        size === 'lg' && "h-11 px-8 text-lg",
        
        // State styles
        disabled && "pointer-events-none opacity-50",
        
        // Custom className
        className
      )}
      disabled={disabled}
    >
      Button
    </button>
  );
}
```

---

## 2. CSS Variables & Design Tokens

### Using CSS Variables

```jsx
function ThemedCard() {
  return (
    <div style={{
      backgroundColor: 'var(--color-card)',
      color: 'var(--color-card-foreground)',
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--spacing-6)',
    }}>
      Content
    </div>
  );
}
```

### Design Tokens in Tailwind

```jsx
function TokenExample() {
  return (
    <div>
      {/* Color tokens */}
      <div className="bg-primary text-primary-foreground">Primary</div>
      <div className="bg-secondary text-secondary-foreground">Secondary</div>
      <div className="bg-accent text-accent-foreground">Accent</div>
      
      {/* Spacing tokens */}
      <div className="p-4 m-2 gap-3">Spacing</div>
      
      {/* Typography tokens */}
      <h1 className="text-4xl font-bold">Heading</h1>
      <p className="text-base leading-relaxed">Body text</p>
      
      {/* Border radius tokens */}
      <div className="rounded-lg">Large radius</div>
      <div className="rounded-xl">Extra large radius</div>
    </div>
  );
}
```

### Accessing Design Tokens

```jsx
import { cssVariables } from '@/components/library/designTokens';

// CSS variables string
const styles = cssVariables;

// Use in style tag
<style dangerouslySetInnerHTML={{ __html: cssVariables }} />
```

---

## 3. Theming System

### Light/Dark Mode

```jsx
function ThemeToggle() {
  const [theme, setTheme] = useState('light');

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <button onClick={toggleTheme}>
      {theme === 'light' ? <Moon /> : <Sun />}
    </button>
  );
}
```

### Theme Context

```jsx
// ThemeContext.jsx
const ThemeContext = React.createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved || 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}

// Usage
function App() {
  return (
    <ThemeProvider>
      <YourApp />
    </ThemeProvider>
  );
}
```

### Dynamic Theme Colors

```jsx
function DynamicTheme() {
  const applyTheme = (colors) => {
    const root = document.documentElement;
    
    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
  };

  const presets = {
    blue: {
      primary: 'oklch(0.5 0.2 250)',
      secondary: 'oklch(0.7 0.1 250)',
    },
    green: {
      primary: 'oklch(0.5 0.2 150)',
      secondary: 'oklch(0.7 0.1 150)',
    },
  };

  return (
    <div>
      <button onClick={() => applyTheme(presets.blue)}>Blue Theme</button>
      <button onClick={() => applyTheme(presets.green)}>Green Theme</button>
    </div>
  );
}
```

---

## 4. Component Styling Patterns

### Base + Variants Pattern

```jsx
const buttonVariants = {
  base: "inline-flex items-center justify-center rounded-md font-medium transition-colors",
  variants: {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    outline: "border border-input hover:bg-accent",
    ghost: "hover:bg-accent",
  },
  sizes: {
    sm: "h-9 px-3 text-sm",
    md: "h-10 px-4",
    lg: "h-11 px-8",
  },
};

function Button({ variant = 'default', size = 'md', className, ...props }) {
  return (
    <button
      className={cn(
        buttonVariants.base,
        buttonVariants.variants[variant],
        buttonVariants.sizes[size],
        className
      )}
      {...props}
    />
  );
}
```

### Compound Variants (CVA)

```jsx
import { cva } from 'class-variance-authority';

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input hover:bg-accent",
        ghost: "hover:bg-accent",
      },
      size: {
        sm: "h-9 px-3 text-sm",
        md: "h-10 px-4",
        lg: "h-11 px-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

function Button({ variant, size, className, ...props }) {
  return (
    <button
      className={buttonVariants({ variant, size, className })}
      {...props}
    />
  );
}
```

---

## 5. Layout Patterns

### Flexbox Layouts

```jsx
function FlexLayouts() {
  return (
    <>
      {/* Horizontal center */}
      <div className="flex items-center justify-center">
        <div>Centered</div>
      </div>

      {/* Space between */}
      <div className="flex items-center justify-between">
        <div>Left</div>
        <div>Right</div>
      </div>

      {/* Vertical stack */}
      <div className="flex flex-col gap-4">
        <div>Item 1</div>
        <div>Item 2</div>
      </div>

      {/* Responsive flex */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">Content</div>
        <div className="w-full md:w-64">Sidebar</div>
      </div>
    </>
  );
}
```

### Grid Layouts

```jsx
function GridLayouts() {
  return (
    <>
      {/* Auto-fit grid */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4">
        <Card />
        <Card />
        <Card />
      </div>

      {/* Named grid areas */}
      <div className="grid grid-cols-[200px_1fr] grid-rows-[auto_1fr] gap-4 h-screen">
        <header className="col-span-2">Header</header>
        <aside>Sidebar</aside>
        <main>Main Content</main>
      </div>

      {/* Responsive grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <Card />
        <Card />
        <Card />
      </div>
    </>
  );
}
```

---

## 6. Animation & Transitions

### Tailwind Transitions

```jsx
function AnimatedCard() {
  return (
    <div className="transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
      <div className="opacity-0 transition-opacity duration-500 group-hover:opacity-100">
        Hover content
      </div>
    </div>
  );
}
```

### Framer Motion

```jsx
import { motion } from 'framer-motion';

function AnimatedList({ items }) {
  return (
    <div>
      {items.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ delay: index * 0.1 }}
        >
          {item.name}
        </motion.div>
      ))}
    </div>
  );
}
```

### CSS Animations

```jsx
// In globals.css
/*
@keyframes slideIn {
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
*/

function AnimatedComponent() {
  return (
    <div className="animate-[slideIn_0.3s_ease-out]">
      Content
    </div>
  );
}
```

---

## 7. Responsive Design

### Breakpoint System

```jsx
// Tailwind breakpoints:
// sm: 640px
// md: 768px
// lg: 1024px
// xl: 1280px
// 2xl: 1536px

function ResponsiveComponent() {
  return (
    <div className="
      text-sm sm:text-base md:text-lg lg:text-xl
      p-2 sm:p-4 md:p-6 lg:p-8
      w-full sm:w-96 md:w-[500px] lg:w-[600px]
    ">
      Responsive content
    </div>
  );
}
```

### Container Queries

```jsx
function ContainerQuery() {
  return (
    <div className="@container">
      <div className="@sm:grid-cols-2 @md:grid-cols-3 @lg:grid-cols-4 grid">
        <Card />
        <Card />
      </div>
    </div>
  );
}
```

---

## 8. Custom Styles

### Custom Tailwind Classes

```jsx
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f9ff',
          // ... more shades
          900: '#0c4a6e',
        },
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      borderRadius: {
        '4xl': '2rem',
      },
    },
  },
};

// Usage
<div className="bg-brand-500 p-18 rounded-4xl">Custom styles</div>
```

### Arbitrary Values

```jsx
function ArbitraryValues() {
  return (
    <div className="
      w-[347px]
      bg-[#1da1f2]
      p-[17px]
      grid-cols-[100px_1fr_100px]
      before:content-['*']
    ">
      Arbitrary values
    </div>
  );
}
```

---

## 9. Performance Optimization

### PurgeCSS

```js
// tailwind.config.js
module.exports = {
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  // Only includes used classes in production
};
```

### Critical CSS

```jsx
// Load critical styles inline
function App() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: criticalCSS }} />
      <YourApp />
    </>
  );
}
```

---

## 10. Best Practices

### ✅ DO
- Use Tailwind utility classes for most styling
- Leverage CSS variables for theming
- Use `cn()` utility for conditional classes
- Follow mobile-first responsive design
- Use design tokens consistently
- Implement proper color contrast (WCAG AA)
- Use semantic color names (primary, secondary)
- Extract repeated patterns into components
- Use Tailwind's purge to reduce bundle size
- Test themes in both light and dark modes
- Use consistent spacing scale
- Leverage Tailwind's built-in animations
- Use arbitrary values sparingly

### ❌ DON'T
- Mix inline styles with Tailwind unnecessarily
- Create custom CSS when Tailwind has utilities
- Hardcode colors instead of using tokens
- Ignore responsive design
- Use !important frequently
- Create overly complex class combinations
- Forget to test dark mode
- Use pixel values instead of rem/em
- Inline all styles (use CSS files for complex)
- Ignore accessibility in color choices
- Create duplicate utility classes
- Skip the cn() utility for conditional styling

---

## 11. Common Patterns

### Card Component

```jsx
function Card({ children, className }) {
  return (
    <div className={cn(
      "rounded-xl border bg-card text-card-foreground shadow-sm",
      className
    )}>
      {children}
    </div>
  );
}

Card.Header = function CardHeader({ children, className }) {
  return (
    <div className={cn("flex flex-col gap-2 p-6", className)}>
      {children}
    </div>
  );
};

Card.Title = function CardTitle({ children, className }) {
  return (
    <h3 className={cn("text-2xl font-semibold leading-none", className)}>
      {children}
    </h3>
  );
};

Card.Content = function CardContent({ children, className }) {
  return (
    <div className={cn("p-6 pt-0", className)}>
      {children}
    </div>
  );
};
```

### Form Input

```jsx
function Input({ className, error, ...props }) {
  return (
    <div>
      <input
        className={cn(
          "flex h-10 w-full rounded-md border border-input",
          "bg-background px-3 py-2 text-sm",
          "ring-offset-background",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
          "placeholder:text-muted-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          "disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-destructive focus-visible:ring-destructive",
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
```

---

## Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Class Variance Authority](https://cva.style/docs)
- [Tailwind CSS Color Generator](https://uicolors.app/)
- [OKLCH Color Picker](https://oklch.com/)
- [Framer Motion](https://www.framer.com/motion/)