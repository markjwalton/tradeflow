# Build Stability Guide

## Common Build Issues & Solutions

### 1. Vite Build Failures

**Symptoms:**
- Intermittent `npm run build` failures
- Module resolution errors
- Memory issues during build

**Solutions:**

```bash
# Clear caches and rebuild
rm -rf node_modules dist .vite
npm install
npm run build

# Increase Node memory if needed
NODE_OPTIONS="--max-old-space-size=4096" npm run build

# Check for circular dependencies
npm install -g madge
madge --circular --extensions js,jsx src/
```

### 2. Version Pinning

Pin critical dependencies in `package.json`:

```json
{
  "dependencies": {
    "@base44/sdk": "0.8.3",
    "@tanstack/react-query": "5.84.1",
    "react": "18.2.0"
  }
}
```

### 3. Node/npm Alignment

Ensure consistent Node version across team:

```bash
# .nvmrc file
18.20.0

# Or use volta
volta pin node@18
```

### 4. Build Performance

```javascript
// vite.config.js optimization
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-popover'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
}
```

### 5. Source Maps in Production

```javascript
// vite.config.js
export default {
  build: {
    sourcemap: false, // Disable for production
    // Or: sourcemap: 'hidden' // Generate but don't reference
  },
}
```

### 6. Pre-build Checks

Add to `package.json`:

```json
{
  "scripts": {
    "prebuild": "npm run lint && npm run type-check",
    "type-check": "tsc --noEmit",
    "lint": "eslint src --ext .js,.jsx"
  }
}
```

### 7. Environment Variables

```bash
# .env.production
VITE_API_URL=https://api.production.com
# Never commit secrets!
```

### 8. Bundle Analysis

```bash
npm install -D rollup-plugin-visualizer

# Add to vite.config.js
import { visualizer } from 'rollup-plugin-visualizer';

export default {
  plugins: [
    visualizer({ open: true, filename: 'dist/stats.html' })
  ]
}
```

## CI/CD Pipeline

```yaml
# .github/workflows/build.yml
name: Build Check

on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run lint
      - run: npm run build
      
      - name: Check bundle size
        run: |
          SIZE=$(du -sb dist | cut -f1)
          if [ $SIZE -gt 5000000 ]; then
            echo "Bundle too large: $SIZE bytes"
            exit 1
          fi
```

## Monitoring Build Health

```javascript
// scripts/build-monitor.js
const fs = require('fs');
const path = require('path');

const distPath = path.join(__dirname, '../dist');
const stats = fs.statSync(distPath);
const size = stats.size;

console.log('Build size:', (size / 1024 / 1024).toFixed(2), 'MB');

if (size > 5 * 1024 * 1024) {
  console.error('⚠️ Bundle size exceeds 5MB');
  process.exit(1);
}
```

## Security Audit

```bash
# Run regularly
npm audit --production
npm audit fix

# Check for outdated packages
npm outdated
``