# Environment Configuration Audit Guide

## Client-Side Environment Variables

### ⚠️ CRITICAL: VITE_* Prefix Required

**All client-side environment variables MUST start with `VITE_`**

```bash
# ✅ CORRECT - Exposed to client
VITE_API_URL=https://api.example.com
VITE_ENVIRONMENT=production
VITE_SENTRY_DSN=https://...

# ❌ WRONG - Not accessible in client
API_URL=https://api.example.com
SECRET_KEY=xxx
```

### Safe Client-Side Variables

```bash
# .env.production
VITE_API_URL=https://api.base44.com
VITE_ENVIRONMENT=production
VITE_APP_NAME=My App
VITE_FEATURE_FLAGS={"newUI":true}
```

### ⛔ Never Expose Secrets

```bash
# ❌ NEVER DO THIS
VITE_STRIPE_SECRET_KEY=sk_live_xxx  # EXPOSED TO CLIENT!
VITE_DATABASE_URL=postgres://...     # EXPOSED TO CLIENT!
VITE_JWT_SECRET=xxx                  # EXPOSED TO CLIENT!
```

**All VITE_* variables are bundled into your JavaScript and visible to users!**

## Backend Functions (Secure Secrets)

### Store Sensitive Data as Secrets

Secrets are ONLY accessible in backend functions, never in client code.

**Set via Base44 Dashboard:**
1. Settings → Environment Variables
2. Add secret (no VITE_ prefix)
3. Access in functions only

### Using Secrets in Functions

```javascript
// functions/stripePayment.js
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  // ✅ Secret only accessible server-side
  const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
  
  if (!stripeKey) {
    return Response.json(
      { error: 'Stripe not configured' },
      { status: 500 }
    );
  }
  
  // Use the secret
  const stripe = new Stripe(stripeKey);
  // ...
});
```

### Pre-Populated Secrets

These are automatically available in functions:

```javascript
Deno.env.get('BASE44_APP_ID')        // Your app ID
Deno.env.get('BASE44_SERVICE_TOKEN') // DON'T USE - use createClientFromRequest
```

## Audit Checklist

### 1. Check All VITE_* Variables

```bash
# Search codebase for VITE_ variables
grep -r "VITE_" .env* src/

# Verify none contain secrets
```

### 2. Review .env Files

```bash
# .env.example (COMMIT THIS)
VITE_API_URL=https://api.base44.com
VITE_ENVIRONMENT=development

# .env.local (NEVER COMMIT)
SECRET_API_KEY=xxx
GITHUB_TOKEN=xxx
```

### 3. Check .gitignore

```gitignore
# .gitignore
.env.local
.env.*.local
.env.production
.env.development

# Safe to commit
# .env.example
```

### 4. Validate Client Code

```javascript
// ❌ BAD - Secret in client code
const apiKey = 'sk_live_xxx';
const response = await fetch('/api', {
  headers: { 'Authorization': `Bearer ${apiKey}` }
});

// ✅ GOOD - Call backend function
const response = await base44.functions.invoke('secureAction', {
  // No secrets needed
});
```

### 5. Review Backend Functions

```javascript
// ✅ GOOD - Secrets in backend only
const apiKey = Deno.env.get('EXTERNAL_API_KEY');
const response = await fetch('https://api.example.com', {
  headers: { 'Authorization': `Bearer ${apiKey}` }
});
```

## Common Mistakes

### Mistake 1: API Keys in Client

```javascript
// ❌ NEVER
const STRIPE_KEY = import.meta.env.VITE_STRIPE_KEY;
```

**Fix:** Use backend function

### Mistake 2: Database Credentials

```javascript
// ❌ NEVER
const DB_URL = import.meta.env.VITE_DATABASE_URL;
```

**Fix:** Base44 SDK handles this automatically

### Mistake 3: JWT Secrets

```javascript
// ❌ NEVER
const JWT_SECRET = import.meta.env.VITE_JWT_SECRET;
```

**Fix:** Use Base44 authentication

## Security Best Practices

### 1. Rotate Secrets Regularly

```bash
# Update secrets in dashboard
# Old: STRIPE_SECRET_KEY=sk_live_old
# New: STRIPE_SECRET_KEY=sk_live_new
```

### 2. Use Different Keys Per Environment

```bash
# Development
STRIPE_SECRET_KEY=sk_test_xxx

# Production  
STRIPE_SECRET_KEY=sk_live_xxx
```

### 3. Validate Environment on Build

```javascript
// vite.config.js
export default defineConfig({
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify(
      process.env.VITE_API_URL || 'https://api.base44.com'
    ),
  },
});
```

### 4. Log Environment (Without Secrets)

```javascript
// main.jsx
console.log('Environment:', import.meta.env.MODE);
console.log('API URL:', import.meta.env.VITE_API_URL);
// Never log: import.meta.env (contains all vars)
```

## Testing Environment Config

```javascript
// Test client can't access secrets
console.log(import.meta.env.STRIPE_SECRET_KEY); // undefined ✅
console.log(import.meta.env.VITE_API_URL);      // defined ✅

// Test backend can access secrets
// In function: Deno.env.get('STRIPE_SECRET_KEY') ✅
```

## Migration Plan

If you find secrets in client code:

1. **Move to backend function**
```javascript
// Before: Client code
const key = import.meta.env.VITE_SECRET;

// After: Backend function
export default async function handler(req) {
  const key = Deno.env.get('SECRET');
  // Use key server-side
}
```

2. **Update dashboard secrets**
- Remove VITE_ prefix
- Set in dashboard (not .env)

3. **Update client calls**
```javascript
// Before
const data = await fetchWithKey(VITE_KEY);

// After  
const data = await base44.functions.invoke('secureAction', {});
```

## Validation Script

```javascript
// scripts/validate-env.js
const fs = require('fs');

const envFile = fs.readFileSync('.env', 'utf-8');
const lines = envFile.split('\n');

const issues = [];

lines.forEach((line, index) => {
  // Check for secrets with VITE_ prefix
  if (line.match(/VITE_.*(?:SECRET|KEY|TOKEN|PASSWORD)/i)) {
    issues.push(`Line ${index + 1}: Potential secret exposed to client`);
  }
  
  // Check for database URLs
  if (line.match(/VITE_.*(?:DATABASE|DB_URL)/i)) {
    issues.push(`Line ${index + 1}: Database URL exposed to client`);
  }
});

if (issues.length > 0) {
  console.error('❌ Environment config issues found:');
  issues.forEach(issue => console.error(issue));
  process.exit(1);
} else {
  console.log('✅ Environment config looks good');
}
```

## Final Checklist

- [ ] All VITE_* variables are safe for client exposure
- [ ] No secrets in VITE_* variables
- [ ] Backend functions use Deno.env.get() for secrets
- [ ] .env.local in .gitignore
- [ ] .env.example committed (no secrets)
- [ ] Different keys for dev/prod
- [ ] Secrets set in Base44 dashboard
- [ ] Client code never accesses secrets
- [ ] Validation script passes
- [ ] Team trained on proper usage