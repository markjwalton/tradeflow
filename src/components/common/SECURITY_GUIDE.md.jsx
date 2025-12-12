# Security Hardening Guide

## Authentication & Authorization

### Review Auth Context

Check `Layout.jsx` for proper authentication checks:

```javascript
// Verify user authentication
const user = await base44.auth.me();
if (!user) {
  // Redirect to login
  return;
}

// Check tenant access
const hasAccess = await checkTenantAccess(user, tenantId);
if (!hasAccess) {
  // Show access denied
  return;
}
```

### Tenant Boundaries

Ensure tenant isolation:

```javascript
// Always filter by tenant_id
const projects = await base44.entities.Project.filter({
  tenant_id: currentTenant.id
});

// Never expose cross-tenant data
const userRoles = await base44.entities.TenantUserRole.filter({
  tenant_id: currentTenant.id,
  user_id: user.id
});
```

## Content Security Policy (CSP)

Add CSP headers to prevent XSS:

```javascript
// vite.config.js
export default {
  server: {
    headers: {
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline'",
        "style-src 'self' 'unsafe-inline' https://use.typekit.net",
        "img-src 'self' data: https:",
        "font-src 'self' https://use.typekit.net",
        "connect-src 'self' https://api.base44.com",
      ].join('; ')
    }
  }
}
```

## localStorage Usage

Audit what's stored in localStorage:

```javascript
// Never store sensitive data in localStorage
// ❌ Bad
localStorage.setItem('apiKey', secret);

// ✅ Good - use httpOnly cookies for tokens
// Only store non-sensitive UI preferences
localStorage.setItem('theme', 'dark');
```

### Encrypt Sensitive Data

```javascript
// If you must store sensitive data
import CryptoJS from 'crypto-js';

const encryptData = (data, key) => {
  return CryptoJS.AES.encrypt(JSON.stringify(data), key).toString();
};

const decryptData = (encrypted, key) => {
  const bytes = CryptoJS.AES.decrypt(encrypted, key);
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
};
```

## Input Sanitization

### Editor Inputs

Sanitize all user inputs, especially in page builder:

```javascript
import DOMPurify from 'dompurify';

// Sanitize HTML content
const sanitize = (html) => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'a'],
    ALLOWED_ATTR: ['href', 'class'],
  });
};

// Use in components
<div dangerouslySetInnerHTML={{ __html: sanitize(userContent) }} />
```

### Form Validation

```javascript
import { z } from 'zod';

// Validate and sanitize inputs
const schema = z.object({
  email: z.string().email(),
  name: z.string().max(100).regex(/^[a-zA-Z\s]+$/),
  comment: z.string().max(500),
});

// Server-side validation
const validated = schema.parse(input);
```

## npm Audit

Run security audits regularly:

```bash
# Check for vulnerabilities
npm audit

# Fix automatically (where possible)
npm audit fix

# Production only
npm audit --production

# View detailed report
npm audit --json > audit-report.json
```

### Configure Audit Level

```json
// package.json
{
  "scripts": {
    "precommit": "npm audit --audit-level=moderate",
    "security-check": "npm audit --production --audit-level=high"
  }
}
```

## Prevent XSS

### React Automatic Escaping

React escapes by default, but be careful with:

```javascript
// ⚠️ Dangerous - user content
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ✅ Safe - sanitized
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userInput) }} />
```

### URL Sanitization

```javascript
// Validate URLs
const isSafeUrl = (url) => {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
};

// Use in links
{isSafeUrl(link.url) && (
  <a href={link.url} target="_blank" rel="noopener noreferrer">
    {link.text}
  </a>
)}
```

## SQL Injection Prevention

Base44 SDK handles parameterization, but verify:

```javascript
// ✅ Good - parameterized
await base44.entities.User.filter({
  email: userInput
});

// ❌ Never build raw queries
const query = `SELECT * FROM users WHERE email = '${userInput}'`;
```

## Rate Limiting

Add rate limiting to sensitive endpoints:

```javascript
// functions/sensitiveAction.js
const rateLimits = new Map();

export default async function handler(req) {
  const userId = getUserId(req);
  const now = Date.now();
  const limit = rateLimits.get(userId);
  
  if (limit && now - limit.timestamp < 60000) {
    if (limit.count >= 5) {
      return new Response('Too many requests', { status: 429 });
    }
    limit.count++;
  } else {
    rateLimits.set(userId, { timestamp: now, count: 1 });
  }
  
  // Process request
}
```

## CORS Configuration

```javascript
// vite.config.js
export default {
  server: {
    cors: {
      origin: ['https://yourdomain.com'],
      credentials: true,
    }
  }
}
```

## Environment Variables

```bash
# .env.example - commit this
VITE_API_URL=https://api.base44.com
VITE_ENVIRONMENT=production

# .env.local - never commit
SECRET_API_KEY=xxx
GITHUB_TOKEN=xxx
```

### Client-side Safety

```javascript
// ❌ Never expose secrets client-side
const apiKey = import.meta.env.VITE_SECRET_KEY;

// ✅ Use backend function
const response = await base44.functions.invoke('secureAction', {
  // No secrets needed client-side
});
```

## Security Headers

```javascript
// Add to server/middleware
const securityHeaders = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
};
```

## Checklist

- [ ] Authentication checks in place
- [ ] Tenant isolation enforced
- [ ] CSP headers configured
- [ ] No secrets in localStorage
- [ ] Input sanitization implemented
- [ ] npm audit clean (production)
- [ ] XSS prevention verified
- [ ] URL validation in place
- [ ] Rate limiting on sensitive endpoints
- [ ] CORS properly configured
- [ ] Environment variables secure
- [ ] Security headers set
- [ ] Regular security audits scheduled

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [DOMPurify](https://github.com/cure53/DOMPurify)
- [npm audit docs](https://docs.npmjs.com/cli/v8/commands/npm-audit)