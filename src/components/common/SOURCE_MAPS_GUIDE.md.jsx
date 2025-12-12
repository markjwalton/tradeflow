# Source Maps Configuration Guide

## Overview
Source maps enable debugging of production code by mapping minified/transpiled code back to original source. This guide covers configuration, security, and best practices.

---

## 1. Source Map Types

### Development
```js
// vite.config.js
export default defineConfig({
  build: {
    sourcemap: true, // Full inline source maps for development
  }
});
```

### Production Options

#### Option 1: No Source Maps (Most Secure)
```js
export default defineConfig({
  build: {
    sourcemap: false, // No source maps in production
  }
});
```
**Pros:** Maximum security, smallest bundle  
**Cons:** Harder to debug production issues

#### Option 2: Hidden Source Maps (Recommended)
```js
export default defineConfig({
  build: {
    sourcemap: 'hidden', // Generate maps but don't reference them
  }
});
```
**Pros:** Can debug with Sentry, not public  
**Cons:** Requires upload to error tracking service

#### Option 3: External Source Maps
```js
export default defineConfig({
  build: {
    sourcemap: true, // Generate separate .map files
  }
});
```
**Pros:** Full debugging capability  
**Cons:** Source code visible to anyone

---

## 2. Recommended Configuration

### For Apps with Error Tracking (Sentry)
```js
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { sentryVitePlugin } from '@sentry/vite-plugin';

export default defineConfig({
  plugins: [
    react(),
    sentryVitePlugin({
      org: 'your-org',
      project: 'your-project',
      authToken: process.env.SENTRY_AUTH_TOKEN,
    }),
  ],
  build: {
    sourcemap: 'hidden', // Generate maps but don't expose
  },
});
```

### Upload Source Maps to Sentry
```json
// package.json
{
  "scripts": {
    "build": "vite build",
    "build:production": "vite build && npm run upload-sourcemaps",
    "upload-sourcemaps": "sentry-cli sourcemaps upload --org=your-org --project=your-project ./dist"
  }
}
```

---

## 3. Protecting Source Maps

### Option 1: Private CDN/Server
```nginx
# nginx.conf - Restrict .map file access
location ~* \.map$ {
    # Only allow from specific IPs (your office, VPN, etc.)
    allow 203.0.113.0/24;
    deny all;
    
    # Or require authentication
    auth_basic "Restricted";
    auth_basic_user_file /etc/nginx/.htpasswd;
}
```

### Option 2: Conditional Generation
```js
// vite.config.js
export default defineConfig({
  build: {
    sourcemap: process.env.NODE_ENV === 'development' || 
               process.env.GENERATE_SOURCEMAP === 'true',
  }
});
```

```bash
# Generate maps only when needed
GENERATE_SOURCEMAP=true npm run build
```

### Option 3: Post-Build Removal
```json
// package.json
{
  "scripts": {
    "build": "vite build",
    "build:production": "vite build && npm run remove-maps",
    "remove-maps": "find ./dist -name '*.map' -type f -delete"
  }
}
```

---

## 4. Security Considerations

### What Source Maps Expose
- **Original source code** - Your unminified JavaScript/TypeScript
- **File structure** - Directory organization
- **Comments** - Including TODO, FIXME, credentials if accidentally left
- **Dependencies** - Library versions and structure
- **Business logic** - Algorithms and implementation details

### Mitigation Strategies

#### 1. Use Hidden Source Maps + Error Tracking
```js
// Best practice: Generate maps but don't expose publicly
export default defineConfig({
  build: {
    sourcemap: 'hidden',
  }
});
```

#### 2. Strip Sensitive Information
```js
// vite.config.js
export default defineConfig({
  build: {
    sourcemap: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs
        drop_debugger: true, // Remove debugger statements
      },
      format: {
        comments: false, // Remove all comments
      },
    },
  }
});
```

#### 3. Environment-Specific Builds
```js
// vite.config.js
const isProduction = process.env.NODE_ENV === 'production';
const isStaging = process.env.VITE_ENV === 'staging';

export default defineConfig({
  build: {
    // Full maps in staging, hidden in production
    sourcemap: isStaging ? true : 'hidden',
    minify: isProduction ? 'terser' : false,
  }
});
```

---

## 5. CI/CD Integration

### GitHub Actions Example
```yaml
# .github/workflows/deploy.yml
name: Build and Deploy

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18
          
      - name: Install dependencies
        run: npm ci
      
      - name: Build with source maps
        run: npm run build
        env:
          NODE_ENV: production
          
      - name: Upload source maps to Sentry
        if: success()
        run: |
          npx @sentry/cli sourcemaps upload \
            --org=${{ secrets.SENTRY_ORG }} \
            --project=${{ secrets.SENTRY_PROJECT }} \
            --auth-token=${{ secrets.SENTRY_AUTH_TOKEN }} \
            ./dist
            
      - name: Remove source maps from deployment
        run: find ./dist -name "*.map" -type f -delete
        
      - name: Deploy
        run: npm run deploy
```

---

## 6. Debugging with Source Maps

### In Browser DevTools
```js
// With source maps, you see:
export function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// Without source maps, you see:
function c(t){return t.reduce((e,t)=>e+t.p,0)}
```

### With Sentry
```js
// sentryConfig.js
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: process.env.VITE_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  
  // Enable source map support
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay(),
  ],
  
  // Sample rate for performance monitoring
  tracesSampleRate: 1.0,
});
```

### Uploading Maps Manually
```bash
# Install Sentry CLI
npm install -g @sentry/cli

# Configure
export SENTRY_AUTH_TOKEN=your-token
export SENTRY_ORG=your-org
export SENTRY_PROJECT=your-project

# Upload source maps
sentry-cli sourcemaps upload --validate ./dist
```

---

## 7. Performance Impact

### Source Map Sizes
| Bundle Size | Source Map Size | Impact |
|-------------|-----------------|--------|
| 500 KB | ~2-3 MB | Large but not downloaded by default |
| 1 MB | ~4-6 MB | Significant storage |
| 2 MB | ~8-12 MB | Consider splitting bundles |

### Loading Behavior
- Source maps are **only loaded when DevTools are open**
- No performance impact on end users
- Storage impact on CDN/server only

### Optimization
```js
// Split large bundles to reduce individual map sizes
export default defineConfig({
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          utils: ['lodash', 'date-fns'],
        }
      }
    }
  }
});
```

---

## 8. Best Practices

### ✅ DO
- Use `sourcemap: 'hidden'` for production
- Upload maps to error tracking service (Sentry)
- Remove maps from public deployment
- Use environment variables for conditional generation
- Strip sensitive comments before building
- Test error reporting in staging
- Monitor source map upload success

### ❌ DON'T
- Commit `.map` files to git
- Deploy public-facing source maps to production
- Include credentials in code comments
- Use `sourcemap: true` in production (unless IP-restricted)
- Forget to test error tracking works
- Leave debug code in production

---

## 9. Troubleshooting

### Issue: Source Maps Not Working in Sentry
**Solutions:**
1. Verify maps were uploaded: `sentry-cli sourcemaps list`
2. Check release name matches deployment
3. Ensure source map URLs are correct
4. Verify authentication token has permissions

### Issue: Large Source Map Files
**Solutions:**
1. Split bundles into smaller chunks
2. Exclude node_modules from source maps
3. Use terser to remove comments/whitespace
4. Consider inline source maps for small apps

### Issue: Can't Debug Production Errors
**Solutions:**
1. Enable hidden source maps
2. Upload to Sentry or similar service
3. Implement robust error logging
4. Use error boundaries to catch React errors

---

## 10. Alternative: Inline Source Maps

### When to Use
- Small applications (< 200 KB bundle)
- Internal tools (not public-facing)
- Development/staging environments

```js
export default defineConfig({
  build: {
    sourcemap: 'inline', // Embed map in bundle
  }
});
```

**Pros:** No separate files, easier deployment  
**Cons:** Larger bundle size, source code visible

---

## 11. Monitoring & Alerts

### Track Source Map Upload
```js
// upload-sourcemaps.js
const { execSync } = require('child_process');

try {
  console.log('Uploading source maps to Sentry...');
  
  execSync('sentry-cli sourcemaps upload ./dist', {
    env: {
      ...process.env,
      SENTRY_AUTH_TOKEN: process.env.SENTRY_AUTH_TOKEN,
    },
    stdio: 'inherit',
  });
  
  console.log('✅ Source maps uploaded successfully');
} catch (error) {
  console.error('❌ Failed to upload source maps:', error);
  process.exit(1); // Fail the build
}
```

### Verify in CI
```yaml
- name: Verify source maps
  run: |
    if [ -z "$(find ./dist -name '*.map')" ]; then
      echo "No source maps generated"
      exit 1
    fi
```

---

## 12. Configuration Examples

### Example 1: Open Source Project (Public Maps)
```js
export default defineConfig({
  build: {
    sourcemap: true, // Public source code anyway
  }
});
```

### Example 2: SaaS Application (Private Maps)
```js
export default defineConfig({
  build: {
    sourcemap: 'hidden', // Generate but don't expose
  }
});
```

### Example 3: Enterprise App (No Maps)
```js
export default defineConfig({
  build: {
    sourcemap: false, // Maximum security
  }
});
```

### Example 4: Development Mode
```js
export default defineConfig({
  build: {
    sourcemap: process.env.NODE_ENV === 'development',
  }
});
```

---

## Resources

- [Vite - Build Options](https://vitejs.dev/config/build-options.html#build-sourcemap)
- [Sentry - Source Maps](https://docs.sentry.io/platforms/javascript/sourcemaps/)
- [MDN - Source Maps](https://developer.mozilla.org/en-US/docs/Tools/Debugger/How_to/Use_a_source_map)
- [Chrome DevTools - Source Maps](https://developer.chrome.com/blog/sourcemaps/)