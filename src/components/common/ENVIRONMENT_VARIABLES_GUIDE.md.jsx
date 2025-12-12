# Environment Variables & Configuration Guide

## Overview
Comprehensive guide for managing environment variables, secrets, and configuration across development, staging, and production environments.

---

## 1. Environment Variables in Vite

### Prefix Requirements
```bash
# ✅ Exposed to client (starts with VITE_)
VITE_API_URL=https://api.example.com
VITE_APP_NAME=MyApp
VITE_SENTRY_DSN=https://...

# ❌ NOT exposed to client (no VITE_ prefix)
DATABASE_URL=postgres://...
API_SECRET=secret123
PRIVATE_KEY=...
```

### Accessing Variables
```js
// In React components or frontend code
const apiUrl = import.meta.env.VITE_API_URL;
const appName = import.meta.env.VITE_APP_NAME;
const isDev = import.meta.env.DEV;
const isProd = import.meta.env.PROD;
const mode = import.meta.env.MODE; // 'development' or 'production'

// ❌ Don't access non-VITE_ variables - they're undefined
const dbUrl = import.meta.env.DATABASE_URL; // undefined!
```

---

## 2. File Structure

### Development (.env files)
```
.env                # Loaded in all cases
.env.local          # Loaded in all cases, ignored by git
.env.development    # Only loaded in development mode
.env.production     # Only loaded in production mode
```

### Priority (highest to lowest)
1. `.env.production.local` (production only, highest priority)
2. `.env.production` (production only)
3. `.env.development.local` (development only)
4. `.env.development` (development only)
5. `.env.local` (all modes except test)
6. `.env` (all modes)

### Example Files

**`.env` (committed, shared defaults)**
```bash
VITE_APP_NAME=MyApp
VITE_API_TIMEOUT=30000
VITE_ENABLE_ANALYTICS=false
```

**`.env.local` (git-ignored, local overrides)**
```bash
VITE_API_URL=http://localhost:3000
VITE_ENABLE_DEBUG=true
```

**`.env.production` (committed, production defaults)**
```bash
VITE_API_URL=https://api.production.com
VITE_ENABLE_ANALYTICS=true
VITE_SENTRY_DSN=https://sentry.io/...
```

---

## 3. Configuration Service

### Centralized Config
```js
// config/env.js
export const config = {
  // App Info
  appName: import.meta.env.VITE_APP_NAME || 'My App',
  appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
  
  // API Configuration
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  apiTimeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000'),
  
  // Feature Flags
  enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  enableDebug: import.meta.env.VITE_ENABLE_DEBUG === 'true',
  
  // External Services
  sentryDsn: import.meta.env.VITE_SENTRY_DSN,
  googleMapsKey: import.meta.env.VITE_GOOGLE_MAPS_KEY,
  
  // Environment
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  mode: import.meta.env.MODE,
};

// Validate required variables
function validateConfig() {
  const required = ['VITE_API_URL', 'VITE_APP_NAME'];
  const missing = required.filter(key => !import.meta.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

if (config.isProduction) {
  validateConfig();
}

export default config;
```

### Usage
```js
// In components
import config from '@/config/env';

function MyComponent() {
  const apiUrl = config.apiUrl;
  
  if (config.enableDebug) {
    console.log('Debug mode enabled');
  }
  
  return <div>{config.appName}</div>;
}
```

---

## 4. TypeScript Support

### Type Definitions
```ts
// vite-env.d.ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_VERSION: string;
  readonly VITE_SENTRY_DSN?: string;
  readonly VITE_GOOGLE_MAPS_KEY?: string;
  readonly VITE_ENABLE_ANALYTICS: string;
  readonly VITE_ENABLE_DEBUG: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

### Typed Config
```ts
// config/env.ts
interface Config {
  appName: string;
  appVersion: string;
  apiUrl: string;
  apiTimeout: number;
  enableAnalytics: boolean;
  enableDebug: boolean;
  sentryDsn: string | undefined;
  isDevelopment: boolean;
  isProduction: boolean;
  mode: string;
}

export const config: Config = {
  appName: import.meta.env.VITE_APP_NAME,
  appVersion: import.meta.env.VITE_APP_VERSION,
  apiUrl: import.meta.env.VITE_API_URL,
  apiTimeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000'),
  enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  enableDebug: import.meta.env.VITE_ENABLE_DEBUG === 'true',
  sentryDsn: import.meta.env.VITE_SENTRY_DSN,
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  mode: import.meta.env.MODE,
};
```

---

## 5. Secrets Management

### Base44 Platform Secrets
```js
// Backend functions can access secrets directly
Deno.serve(async (req) => {
  const apiKey = Deno.env.get('GITHUB_TOKEN');
  const googleKey = Deno.env.get('GOOGLE_CLOUD_API_KEY');
  
  // Use secrets securely
  const response = await fetch('https://api.github.com/...', {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
    },
  });
  
  return Response.json({ data: await response.json() });
});
```

### Frontend Secret Handling
```js
// ❌ NEVER expose secrets in frontend
const apiKey = 'hardcoded-api-key'; // DON'T DO THIS!

// ✅ Call backend function instead
import { base44 } from '@/api/base44Client';

async function fetchData() {
  // Backend function uses secret securely
  const response = await base44.functions.invoke('githubApi', {
    endpoint: '/repos/...'
  });
  
  return response.data;
}
```

### Setting Secrets in Base44
```bash
# Through dashboard: Settings > Environment Variables
GITHUB_TOKEN=ghp_xxx...
GOOGLE_CLOUD_API_KEY=AIza...
STRIPE_SECRET_KEY=sk_live_...
```

---

## 6. Multi-Environment Setup

### Environment-Specific Builds
```json
// package.json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "build:staging": "vite build --mode staging",
    "build:production": "vite build --mode production"
  }
}
```

### Mode-Specific Env Files
```bash
# .env.staging
VITE_API_URL=https://api.staging.example.com
VITE_ENABLE_ANALYTICS=false
VITE_SENTRY_DSN=https://staging-dsn...

# .env.production
VITE_API_URL=https://api.example.com
VITE_ENABLE_ANALYTICS=true
VITE_SENTRY_DSN=https://production-dsn...
```

### Custom Modes in Vite Config
```js
// vite.config.js
export default defineConfig(({ mode }) => {
  // Load env file based on mode
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    },
    server: {
      port: mode === 'staging' ? 3001 : 3000,
    },
  };
});
```

---

## 7. Feature Flags

### Simple Feature Flags
```js
// config/features.js
export const features = {
  newDashboard: import.meta.env.VITE_FEATURE_NEW_DASHBOARD === 'true',
  betaFeatures: import.meta.env.VITE_FEATURE_BETA === 'true',
  analytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
};

// Usage
import { features } from '@/config/features';

function Dashboard() {
  if (features.newDashboard) {
    return <NewDashboard />;
  }
  return <OldDashboard />;
}
```

### Advanced Feature Flags
```js
// config/features.js
class FeatureFlags {
  constructor() {
    this.flags = {
      newUI: this.parseFlag('VITE_FEATURE_NEW_UI'),
      betaAPI: this.parseFlag('VITE_FEATURE_BETA_API'),
      analytics: this.parseFlag('VITE_ENABLE_ANALYTICS'),
    };
  }
  
  parseFlag(key) {
    const value = import.meta.env[key];
    
    // Support different flag formats
    if (value === 'true' || value === '1') return true;
    if (value === 'false' || value === '0') return false;
    
    // Support percentage rollout: "50%" means 50% of users
    if (value?.endsWith('%')) {
      const percentage = parseInt(value);
      return Math.random() * 100 < percentage;
    }
    
    return false;
  }
  
  isEnabled(flag) {
    return this.flags[flag] === true;
  }
}

export const features = new FeatureFlags();
```

---

## 8. Runtime Configuration

### Dynamic Config Loading
```js
// config/runtime.js
let runtimeConfig = null;

export async function loadRuntimeConfig() {
  if (runtimeConfig) return runtimeConfig;
  
  try {
    const response = await fetch('/config.json');
    runtimeConfig = await response.json();
    return runtimeConfig;
  } catch (error) {
    console.error('Failed to load runtime config:', error);
    return {};
  }
}

export function getRuntimeConfig() {
  return runtimeConfig || {};
}

// Usage
import { loadRuntimeConfig, getRuntimeConfig } from '@/config/runtime';

function App() {
  useEffect(() => {
    loadRuntimeConfig();
  }, []);
  
  const config = getRuntimeConfig();
  // Use config...
}
```

### Public Config File
```json
// public/config.json (can be updated without rebuild)
{
  "maintenanceMode": false,
  "announcementBanner": "New features coming soon!",
  "maxUploadSize": 10485760,
  "supportedFileTypes": ["jpg", "png", "pdf"]
}
```

---

## 9. Validation & Defaults

### Schema-Based Validation
```js
// config/validation.js
import { z } from 'zod';

const envSchema = z.object({
  VITE_API_URL: z.string().url(),
  VITE_APP_NAME: z.string().min(1),
  VITE_API_TIMEOUT: z.string().regex(/^\d+$/).transform(Number),
  VITE_ENABLE_ANALYTICS: z.enum(['true', 'false']).transform(v => v === 'true'),
  VITE_SENTRY_DSN: z.string().url().optional(),
});

export function validateEnv() {
  try {
    const validated = envSchema.parse(import.meta.env);
    return { success: true, data: validated };
  } catch (error) {
    return { success: false, error: error.errors };
  }
}

// In app initialization
const validation = validateEnv();
if (!validation.success) {
  console.error('Environment validation failed:', validation.error);
}
```

---

## 10. Best Practices

### ✅ DO
- Use `VITE_` prefix for all client-side variables
- Commit `.env.example` with dummy values
- Add `.env.local` to `.gitignore`
- Validate required variables on startup
- Use TypeScript for type-safe config
- Centralize configuration in a single file
- Use backend functions for sensitive operations
- Document all environment variables
- Set defaults for optional variables
- Test with different environment configurations

### ❌ DON'T
- Commit `.env.local` or `.env.*.local` files
- Store secrets in frontend environment variables
- Hardcode API keys or tokens
- Use process.env (use import.meta.env)
- Forget to prefix with `VITE_`
- Expose backend URLs unnecessarily
- Leave debug flags on in production
- Use same credentials across environments

---

## 11. Common Patterns

### API URL Configuration
```js
// config/api.js
const getApiUrl = () => {
  // Override with environment variable
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Auto-detect based on hostname
  const hostname = window.location.hostname;
  
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:3000';
  }
  
  if (hostname.includes('staging')) {
    return 'https://api.staging.example.com';
  }
  
  return 'https://api.example.com';
};

export const apiUrl = getApiUrl();
```

### Debug Mode
```js
// utils/debug.js
export const debug = {
  enabled: import.meta.env.VITE_ENABLE_DEBUG === 'true',
  
  log(...args) {
    if (this.enabled) {
      console.log('[DEBUG]', ...args);
    }
  },
  
  error(...args) {
    if (this.enabled) {
      console.error('[DEBUG]', ...args);
    }
  },
};

// Usage
import { debug } from '@/utils/debug';

debug.log('User logged in:', user);
```

### Version Info
```js
// config/version.js
export const version = {
  app: import.meta.env.VITE_APP_VERSION || '1.0.0',
  build: import.meta.env.VITE_BUILD_NUMBER || 'dev',
  commit: import.meta.env.VITE_COMMIT_SHA?.substring(0, 7) || 'unknown',
  buildDate: import.meta.env.VITE_BUILD_DATE || new Date().toISOString(),
};

// Display in footer
function Footer() {
  return (
    <footer>
      Version {version.app} (Build {version.build})
      {version.commit !== 'unknown' && ` • ${version.commit}`}
    </footer>
  );
}
```

---

## 12. CI/CD Integration

### GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Build with environment variables
        run: npm run build
        env:
          VITE_API_URL: ${{ secrets.PRODUCTION_API_URL }}
          VITE_SENTRY_DSN: ${{ secrets.SENTRY_DSN }}
          VITE_APP_VERSION: ${{ github.ref_name }}
          VITE_COMMIT_SHA: ${{ github.sha }}
          VITE_BUILD_DATE: ${{ github.event.head_commit.timestamp }}
```

### Build-Time Injection
```js
// vite.config.js
export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    __GIT_COMMIT__: JSON.stringify(process.env.GITHUB_SHA || 'dev'),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  }
});
```

---

## 13. Example .env Files

### .env.example (Commit this)
```bash
# App Configuration
VITE_APP_NAME=MyApp
VITE_APP_VERSION=1.0.0

# API Configuration
VITE_API_URL=http://localhost:3000
VITE_API_TIMEOUT=30000

# Feature Flags
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG=true
VITE_FEATURE_NEW_UI=false

# External Services (get your own keys)
VITE_SENTRY_DSN=https://your-sentry-dsn
VITE_GOOGLE_MAPS_KEY=your-google-maps-key

# Backend Secrets (for functions, not exposed to client)
GITHUB_TOKEN=your-github-token
STRIPE_SECRET_KEY=your-stripe-key
```

### .gitignore
```
# Environment files
.env.local
.env.*.local
.env.development.local
.env.production.local

# Keep these
!.env.example
!.env
!.env.development
!.env.production
```

---

## Resources

- [Vite - Env Variables](https://vitejs.dev/guide/env-and-mode.html)
- [12-Factor App - Config](https://12factor.net/config)
- [Base44 - Environment Variables](https://docs.base44.com)