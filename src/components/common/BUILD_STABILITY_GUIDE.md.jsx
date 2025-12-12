# Build Stability Guide

## Overview
This guide addresses intermittent `npm run build` failures and provides systematic troubleshooting steps for Vite build issues.

---

## Common Build Failure Patterns

### 1. Dependency Version Mismatches
**Symptoms:** Build works locally but fails in CI, or works inconsistently
**Solution:** Pin all dependencies to exact versions

```json
// package.json - Use exact versions instead of ^ or ~
{
  "dependencies": {
    "react": "18.2.0",  // instead of "^18.2.0"
    "vite": "5.0.0"     // instead of "^5.0.0"
  }
}
```

### 2. Node/NPM Version Alignment
**Check versions:**
```bash
node --version  # Should match .nvmrc or CI config
npm --version   # NPM 9+ recommended
```

**Fix:**
```bash
# Use specific Node version
nvm install 18.18.0
nvm use 18.18.0

# Update npm
npm install -g npm@latest
```

### 3. Module Resolution Errors
**Symptoms:** "Module not found", "Cannot resolve"
**Solution:** Check path aliases in vite.config.js

```js
// vite.config.js
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
    '@/components': path.resolve(__dirname, './src/components'),
    '@/api': path.resolve(__dirname, './src/api'),
  }
}
```

### 4. Memory Issues (Large Apps)
**Symptoms:** "JavaScript heap out of memory"
**Solution:**
```json
// package.json
{
  "scripts": {
    "build": "NODE_OPTIONS='--max-old-space-size=4096' vite build"
  }
}
```

### 5. Plugin Conflicts
**Common culprits:**
- Multiple React plugins
- Conflicting CSS processors
- Outdated Vite plugins

**Solution:** Update plugins and check compatibility
```bash
npm outdated
npm update @vitejs/plugin-react
```

---

## Systematic Troubleshooting

### Step 1: Enable Verbose Logging
```json
// package.json
{
  "scripts": {
    "build": "vite build --mode development",
    "build:verbose": "DEBUG=vite:* vite build --mode development --logLevel info"
  }
}
```

**Capture logs:**
```bash
npm run build:verbose 2>&1 | tee build-log.txt
```

### Step 2: Clean Build
```bash
# Remove all generated files
rm -rf node_modules
rm -rf dist
rm -rf .vite
rm package-lock.json

# Fresh install
npm install

# Try build
npm run build
```

### Step 3: Isolate Dependencies
Create a minimal vite.config.js:
```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Comment out other plugins temporarily
});
```

### Step 4: Check Environment Variables
```bash
# List all env vars
printenv | grep VITE_

# Verify .env files
cat .env
cat .env.production
```

### Step 5: Verify Import Paths
Common issues:
- Missing file extensions (.jsx, .js)
- Incorrect path casing (Linux is case-sensitive)
- Circular dependencies

**Tool to find circular deps:**
```bash
npm install -g madge
madge --circular --extensions js,jsx src/
```

---

## Production Build Checklist

### Pre-Build
- [ ] All dependencies at stable versions
- [ ] No unresolved merge conflicts
- [ ] `.env.production` configured correctly
- [ ] Node/npm versions match CI environment

### Build Configuration
```js
// vite.config.js - Production optimizations
export default defineConfig({
  build: {
    target: 'es2015',
    minify: 'terser',
    sourcemap: false, // or 'hidden' for error tracking
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
        }
      }
    },
    chunkSizeWarningLimit: 1000, // Warn on chunks > 1MB
  }
});
```

### Post-Build Validation
```bash
# Check bundle size
npm run build
du -sh dist/

# Serve and test
npm run preview
```

---

## CI/CD Integration

### GitHub Actions Example
```yaml
name: Build Check
on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18.x, 20.x]
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Use Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Check bundle size
        run: |
          SIZE=$(du -sb dist | cut -f1)
          echo "Bundle size: $SIZE bytes"
          if [ $SIZE -gt 10485760 ]; then
            echo "Bundle too large (>10MB)"
            exit 1
          fi
```

---

## Version Pinning Strategy

### Lock File Best Practices
```bash
# Use npm ci in CI/CD (faster, respects lock file exactly)
npm ci

# Local development - regenerate lock file only when needed
npm install

# Update specific package
npm update package-name
```

### Recommended .npmrc
```
# .npmrc
save-exact=true
engine-strict=true
```

### Recommended package.json engines
```json
{
  "engines": {
    "node": ">=18.0.0 <21.0.0",
    "npm": ">=9.0.0"
  }
}
```

---

## Debugging Specific Errors

### "Cannot find module" during build
1. Check import path casing
2. Verify file exists
3. Check vite.config.js aliases
4. Look for circular imports

### "Unexpected token" or syntax errors
1. Check Node version (needs ES modules support)
2. Update @vitejs/plugin-react
3. Check for invalid JSX syntax
4. Verify babel/typescript config

### Build hangs or times out
1. Increase memory limit
2. Disable source maps temporarily
3. Check for infinite loops in configs
4. Reduce chunk size

### Dynamic import failures
```js
// Bad - may fail in production
const Component = await import(`./components/${name}.jsx`);

// Good - explicit imports
const components = {
  Header: () => import('./components/Header.jsx'),
  Footer: () => import('./components/Footer.jsx'),
};
const Component = await components[name]();
```

---

## Monitoring Build Health

### Add build timing
```json
{
  "scripts": {
    "build": "time vite build",
    "build:analyze": "vite-bundle-visualizer"
  }
}
```

### Track build metrics
- Build duration (should be < 2 minutes)
- Bundle size (aim for < 5MB total)
- Chunk count (avoid too many small chunks)
- Source map size

---

## Quick Fixes Checklist

When build fails, try in order:

1. `rm -rf node_modules && npm install`
2. `rm -rf .vite dist`
3. Update Node/npm versions
4. Check for syntax errors in recent changes
5. Temporarily disable non-critical plugins
6. Run with `--debug` flag
7. Compare with last working commit
8. Check CI logs for environment differences

---

## Prevention Strategies

### 1. Use Exact Versions in Production
```json
"dependencies": {
  "react": "18.2.0",
  "react-dom": "18.2.0"
}
```

### 2. Regular Dependency Updates
```bash
# Weekly or bi-weekly
npm outdated
npm update
npm test
npm run build
```

### 3. Pre-commit Hooks
```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run build"
    }
  }
}
```

### 4. Lock File Consistency
- Commit `package-lock.json`
- Use `npm ci` in CI/CD
- Don't manually edit lock file

---

## Getting Help

If build issues persist:

1. **Check Vite logs** with `DEBUG=vite:*`
2. **Search Vite issues** on GitHub
3. **Verify plugin versions** are compatible
4. **Test in clean environment** (Docker, fresh VM)
5. **Compare with working branch/commit**

## Resources

- [Vite Troubleshooting](https://vitejs.dev/guide/troubleshooting.html)
- [Node Version Management](https://github.com/nvm-sh/nvm)
- [npm ci vs npm install](https://docs.npmjs.com/cli/v9/commands/npm-ci)
- [Bundle Analysis](https://github.com/btd/rollup-plugin-visualizer)