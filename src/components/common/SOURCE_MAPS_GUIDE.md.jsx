# Source Maps Policy Guide

## Production Source Maps Strategy

### Current Recommendation: Disable or Hide

**Why?**
- Source maps expose your application logic and structure
- Can reveal business logic, API endpoints, and implementation details
- Increase bundle size significantly
- Not needed for end users

### Configuration Options

#### Option 1: Disable Completely (Recommended)

```javascript
// vite.config.js
export default {
  build: {
    sourcemap: false
  }
}
```

**Pros:**
- No source code exposure
- Smaller bundle size
- Faster builds

**Cons:**
- Harder to debug production errors without error tracking service

#### Option 2: Hidden Source Maps

```javascript
// vite.config.js
export default {
  build: {
    sourcemap: 'hidden'
  }
}
```

**Pros:**
- Source maps generated but not referenced in production bundle
- Can upload to error tracking service
- No public exposure

**Cons:**
- Still generates files (need to manage/delete)
- Slightly slower builds

#### Option 3: External Upload (Best Practice)

```javascript
// vite.config.js
export default {
  build: {
    sourcemap: 'hidden'
  }
}
```

**Then upload to error tracking:**

```bash
# Sentry example
sentry-cli releases files <VERSION> upload-sourcemaps ./dist --rewrite
sentry-cli releases files <VERSION> delete ./dist/*.map
```

## Error Tracking Integration

### Recommended Services

1. **Sentry** (Most popular)
2. **LogRocket** (Session replay + errors)
3. **Rollbar** (Simple error tracking)
4. **Bugsnag** (Good for React)

### Sentry Setup

```bash
npm install @sentry/react
```

```javascript
// main.jsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.VITE_ENVIRONMENT,
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  beforeSend(event) {
    // Filter out sensitive data
    if (event.user) {
      delete event.user.email;
    }
    return event;
  },
});
```

### ErrorBoundary with Sentry

```javascript
import * as Sentry from "@sentry/react";

const SentryErrorBoundary = Sentry.ErrorBoundary;

function App() {
  return (
    <SentryErrorBoundary fallback={ErrorFallback}>
      <YourApp />
    </SentryErrorBoundary>
  );
}
```

## Development vs Production

```javascript
// vite.config.js
export default defineConfig(({ mode }) => ({
  build: {
    sourcemap: mode === 'development' ? true : false,
  },
}));
```

## Security Best Practices

### 1. Never Commit Source Maps

```gitignore
# .gitignore
dist/*.map
*.map.js
```

### 2. Remove from CDN/Hosting

If accidentally deployed:

```bash
# Vercel
vercel env rm SOURCEMAP_ENABLE

# Netlify
netlify env:set SOURCEMAP_ENABLE false
```

### 3. Validate Production Bundle

```bash
# Check for .map files
ls -la dist/*.map

# Should return nothing in production
```

## CI/CD Integration

```yaml
# .github/workflows/build.yml
- name: Build for production
  run: npm run build
  env:
    NODE_ENV: production

- name: Remove source maps
  run: find dist -name "*.map" -type f -delete

- name: Upload to Sentry
  if: success()
  run: |
    npx @sentry/cli releases files ${{ github.sha }} upload-sourcemaps ./dist
    npx @sentry/cli releases finalize ${{ github.sha }}
```

## Monitoring Without Source Maps

If you don't use error tracking:

1. **Enhanced logging**
```javascript
window.addEventListener('error', (event) => {
  console.error('Global error:', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
  });
  
  // Send to your backend
  fetch('/api/log-error', {
    method: 'POST',
    body: JSON.stringify({
      message: event.message,
      stack: event.error?.stack,
      userAgent: navigator.userAgent,
      url: window.location.href,
    }),
  });
});
```

2. **User feedback on errors**
```javascript
// In ErrorBoundary
<div>
  <p>Something went wrong</p>
  <button onClick={() => {
    // Collect user feedback
    const description = prompt("What were you doing?");
    reportError(error, description);
  }}>
    Report Issue
  </button>
</div>
```

## Checklist

- [ ] Source maps disabled or hidden in production
- [ ] .gitignore includes *.map files
- [ ] Error tracking service configured (Sentry/LogRocket)
- [ ] CI pipeline removes source maps before deploy
- [ ] Error boundary catches and reports errors
- [ ] Sensitive data filtered before sending to error service
- [ ] Development still has source maps enabled
- [ ] Production bundle verified (no .map files exposed)