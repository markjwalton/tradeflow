# Content Security Policy (CSP) Configuration Guide

## Overview

Content Security Policy (CSP) is a security standard that helps prevent cross-site scripting (XSS), clickjacking, and other code injection attacks. This guide shows how to configure CSP headers for your Base44 application.

## 🎯 Recommended CSP Configuration

### Production CSP Header

```
Content-Security-Policy: 
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://use.typekit.net;
  style-src 'self' 'unsafe-inline' https://use.typekit.net https://fonts.googleapis.com;
  font-src 'self' https://use.typekit.net https://fonts.gstatic.com data:;
  img-src 'self' data: https: blob:;
  connect-src 'self' https://api.base44.com https://*.sentry.io;
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
  upgrade-insecure-requests;
```

### Development CSP Header (More Permissive)

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://use.typekit.net;
  style-src 'self' 'unsafe-inline' https://use.typekit.net https://fonts.googleapis.com;
  font-src 'self' https://use.typekit.net https://fonts.gstatic.com data:;
  img-src 'self' data: https: blob:;
  connect-src 'self' ws: wss: https: http://localhost:*;
  frame-ancestors 'none';
```

## 📋 Implementation Methods

### Option 1: Vercel Configuration

Create `vercel.json` in your project root:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://use.typekit.net; style-src 'self' 'unsafe-inline' https://use.typekit.net https://fonts.googleapis.com; font-src 'self' https://use.typekit.net https://fonts.gstatic.com data:; img-src 'self' data: https: blob:; connect-src 'self' https://api.base44.com https://*.sentry.io; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "camera=(), microphone=(), geolocation=()"
        }
      ]
    }
  ]
}
```

### Option 2: Netlify Configuration

Create `netlify.toml` in your project root:

```toml
[[headers]]
  for = "/*"
  [headers.values]
    Content-Security-Policy = """
      default-src 'self';
      script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://use.typekit.net;
      style-src 'self' 'unsafe-inline' https://use.typekit.net https://fonts.googleapis.com;
      font-src 'self' https://use.typekit.net https://fonts.gstatic.com data:;
      img-src 'self' data: https: blob:;
      connect-src 'self' https://api.base44.com https://*.sentry.io;
      frame-ancestors 'none';
      base-uri 'self';
      form-action 'self'
    """
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "camera=(), microphone=(), geolocation=()"
```

### Option 3: Meta Tag (Fallback)

Add to your `index.html` `<head>`:

```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;">
```

**Note:** Meta tag CSP is less secure and doesn't support all directives. Use HTTP headers when possible.

## 🔍 CSP Directives Explained

| Directive | Purpose | Our Configuration |
|-----------|---------|-------------------|
| `default-src` | Fallback for other directives | `'self'` - Only load from same origin |
| `script-src` | JavaScript sources | `'self' 'unsafe-inline'` + trusted CDNs |
| `style-src` | CSS sources | `'self' 'unsafe-inline'` + font providers |
| `font-src` | Font sources | `'self'` + Adobe Fonts + Google Fonts |
| `img-src` | Image sources | `'self' data: https: blob:` |
| `connect-src` | AJAX, WebSocket connections | API endpoints + Sentry |
| `frame-ancestors` | Who can embed this page | `'none'` - Prevent clickjacking |
| `base-uri` | Restricts `<base>` tag | `'self'` |
| `form-action` | Form submission targets | `'self'` |

## 🚨 Why 'unsafe-inline' for Scripts/Styles?

Currently required for:
- React inline styles
- Styled components
- Dynamic style injection
- Vite HMR (development)

**Mitigation Strategy:**
1. Move inline scripts to external files
2. Use nonces for dynamic scripts
3. Implement CSP Level 3 with `'strict-dynamic'`

## 🧪 Testing Your CSP

### 1. Report-Only Mode (Recommended for Testing)

Change `Content-Security-Policy` to `Content-Security-Policy-Report-Only` to test without breaking functionality:

```
Content-Security-Policy-Report-Only: default-src 'self'; report-uri /csp-report
```

### 2. Browser Developer Tools

- Open DevTools Console
- Look for CSP violation messages
- Fix violations before enforcing

### 3. Online CSP Evaluator

Use [CSP Evaluator](https://csp-evaluator.withgoogle.com/) to check your policy for weaknesses.

## 📊 Monitoring CSP Violations

### Setup CSP Reporting Endpoint

```json
{
  "csp": {
    "report-uri": "https://your-app.sentry.io/api/PROJECT_ID/security/?sentry_key=KEY"
  }
}
```

Sentry will automatically collect CSP violations when configured.

## ✅ Security Checklist

- [ ] CSP headers configured in hosting platform
- [ ] `frame-ancestors` set to prevent clickjacking
- [ ] `script-src` doesn't use `'unsafe-eval'` in production
- [ ] HTTPS enforced with `upgrade-insecure-requests`
- [ ] CSP tested in report-only mode
- [ ] Monitoring configured for violations
- [ ] Regular CSP policy reviews scheduled

## 🔄 Progressive Enhancement Path

1. **Phase 1:** Start with report-only mode
2. **Phase 2:** Fix all violations in development
3. **Phase 3:** Deploy enforcement in staging
4. **Phase 4:** Monitor for 1-2 weeks
5. **Phase 5:** Deploy to production
6. **Phase 6:** Tighten restrictions gradually

## 📚 Additional Resources

- [MDN CSP Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [CSP Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html)
- [Google CSP Guide](https://csp.withgoogle.com/docs/index.html)

## 🎯 Quick Implementation

For immediate basic protection, add this to your hosting config:

```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
```

Then gradually implement full CSP following this guide.