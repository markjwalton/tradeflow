# Build Stability Checklist

## Common Build Failure Causes

### 1. Dependency Version Conflicts
```bash
# Clear and reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### 2. Memory Issues
```bash
# Increase Node memory limit
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

### 3. Type Checking Errors
- Check for TypeScript errors: `npx tsc --noEmit`
- Verify prop types and imports

### 4. Import Resolution
- Ensure all imports use correct paths
- Check for circular dependencies
- Verify alias configuration in vite.config.js

### 5. Lazy Loading Issues
- Confirm all lazy-loaded components are exported correctly
- Check for missing default exports
- Verify Suspense boundaries

## Build Optimization

### Vite Config Recommendations
```js
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui': ['@radix-ui/react-*'],
          'query': ['@tanstack/react-query']
        }
      }
    },
    chunkSizeWarningLimit: 1000,
  }
}
```

## Debugging Build Failures

1. **Enable Verbose Logging**
   ```bash
   npm run build --verbose
   ```

2. **Check for Large Dependencies**
   ```bash
   npx vite-bundle-visualizer
   ```

3. **Verify Environment Variables**
   - Ensure all required env vars are set
   - Check .env.production file

4. **Test Locally**
   ```bash
   npm run build && npm run preview
   ```

## CI/CD Integration

- Add build size checks
- Enable source map generation for debugging
- Set up error reporting
- Configure bundle analysis