# Content Security Policy (CSP) Headers Guide

## Overview

Content Security Policy (CSP) is a security standard that helps prevent XSS, clickjacking, and other code injection attacks by controlling which resources can be loaded and executed.

## Recommended CSP Configuration

### Development Environment

```
Content-Security-Policy: 
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://use.typekit.net;
  font-src 'self' https://fonts.gstatic.com https://use.typekit.net;
  img-src 'self' data: https: blob:;
  connect-src 'self' https://api.base44.com wss://api.base44.com;
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
```

### Production Environment (Stricter)

```
Content-Security-Policy: 
  default-src 'self';
  script-src 'self' 'nonce-{random}' https://cdn.jsdelivr.net;
  style-src 'self' 'nonce-{random}' https://fonts.googleapis.com https://use.typekit.net;
  font-src 'self' https://fonts.gstatic.com https://use.typekit.net;
  img-src 'self' data: https: blob:;
  connect-src 'self' https://api.base44.com wss://api.base44.com https://*.sentry.io;
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
  upgrade-insecure-requests;
  block-all-mixed-content;
```

## Implementation Options

### Option 1: Netlify/Vercel Headers

Create `public/_headers` or `netlify.toml`:

```toml
[[headers]]
  for = "/*"
  [headers.values]
    Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://use.typekit.net; font-src 'self' https://fonts.gstatic.com https://use.typekit.net; img-src 'self' data: https: blob:; connect-src 'self' https://api.base44.com wss://api.base44.com;"
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "camera=(), microphone=(), geolocation=()"
```

### Option 2: Meta Tag (Less Secure)

In `index.html`:

```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; script-src 'self' 'unsafe-inline';">
```

### Option 3: Server Configuration

For custom servers, configure headers in your server:

```javascript
// Express example
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline';"
  );
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  next();
});
```

## Directive Explanations

| Directive | Purpose | Our Setting |
|-----------|---------|-------------|
| `default-src` | Fallback for all resource types | `'self'` - only from our domain |
| `script-src` | JavaScript sources | `'self' 'unsafe-inline'` - needed for inline scripts |
| `style-src` | CSS sources | `'self' 'unsafe-inline'` + font providers |
| `font-src` | Font sources | `'self'` + Google Fonts, Adobe Fonts |
| `img-src` | Image sources | `'self' data: https: blob:` - allow all HTTPS |
| `connect-src` | AJAX, WebSocket, EventSource | `'self'` + Base44 API + Sentry |
| `frame-ancestors` | Who can embed us in iframe | `'none'` - prevent clickjacking |
| `base-uri` | Restrict `<base>` tag | `'self'` |
| `form-action` | Form submission targets | `'self'` |

## Testing Your CSP

### 1. Report-Only Mode First

Start with report-only to see violations without blocking:

```
Content-Security-Policy-Report-Only: default-src 'self'; report-uri /csp-report
```

### 2. Browser DevTools

Open browser console and look for CSP violations:
- Chrome/Edge: Console tab shows CSP errors in red
- Firefox: Console shows "Content Security Policy" warnings

### 3. Online Tools

- [CSP Evaluator](https://csp-evaluator.withgoogle.com/)
- [Report URI](https://report-uri.com/home/generate)

## Common Issues & Solutions

### Issue: Inline Styles Blocked

**Solution**: Use CSS files or add `'unsafe-inline'` (less secure)

```javascript
// Instead of:
<div style="color: red;">

// Use:
<div className="text-red-500">
```

### Issue: Inline Scripts Blocked

**Solution**: Move scripts to external files or use nonces

```javascript
// Instead of:
<script>alert('hello')</script>

// Use external file:
<script src="/app.js"></script>
```

### Issue: Third-Party Resources Blocked

**Solution**: Add specific domains to appropriate directives

```
script-src 'self' https://cdn.example.com;
```

## Migration Strategy

### Phase 1: Monitor (Week 1-2)
- Deploy with `Content-Security-Policy-Report-Only`
- Collect violation reports
- Identify needed changes

### Phase 2: Permissive (Week 3-4)
- Deploy with permissive policy (`'unsafe-inline'`, `'unsafe-eval'`)
- Enforce `frame-ancestors` and `form-action` only
- Monitor for issues

### Phase 3: Strict (Month 2+)
- Remove `'unsafe-inline'` and `'unsafe-eval'`
- Implement nonces for necessary inline code
- Full CSP enforcement

## Security Benefits

✅ **XSS Prevention**: Blocks unauthorized scripts  
✅ **Data Injection**: Prevents malicious content injection  
✅ **Clickjacking**: Stops embedding in malicious iframes  
✅ **Man-in-the-Middle**: Forces HTTPS with `upgrade-insecure-requests`  
✅ **Monitoring**: Violation reports help detect attacks

## Additional Security Headers

Always use CSP alongside other security headers:

```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

## Resources

- [MDN CSP Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [CSP Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html)
- [Google CSP Evaluator](https://csp-evaluator.withgoogle.com/)