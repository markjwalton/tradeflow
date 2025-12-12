# Security Best Practices Guide

## Overview
Comprehensive security guide covering authentication, data protection, XSS prevention, and secure coding practices for the application.

---

## 1. Authentication & Authorization

### Current Setup
```js
// Already implemented in base44
import { base44 } from '@/api/base44Client';

// Check authentication
const isAuthenticated = await base44.auth.isAuthenticated();

// Get current user
const user = await base44.auth.me();

// Logout
base44.auth.logout();

// Redirect to login
base44.auth.redirectToLogin(nextUrl);
```

### Protect Routes
```jsx
// In Layout.js or route component
function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  
  useEffect(() => {
    const checkAuth = async () => {
      const isAuth = await base44.auth.isAuthenticated();
      setAuthenticated(isAuth);
      setLoading(false);
      
      if (!isAuth) {
        base44.auth.redirectToLogin();
      }
    };
    
    checkAuth();
  }, []);
  
  if (loading) return <PageLoader />;
  if (!authenticated) return null;
  
  return children;
}
```

### Role-Based Access
```jsx
function AdminOnlySection({ children }) {
  const user = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });
  
  if (user.data?.role !== 'admin') {
    return null; // Or show access denied message
  }
  
  return children;
}

// Usage
<AdminOnlySection>
  <Button onClick={deleteAllData}>Delete All Data</Button>
</AdminOnlySection>
```

---

## 2. XSS Prevention

### Input Sanitization
```js
// ❌ NEVER do this - vulnerable to XSS
function DangerousComponent({ userInput }) {
  return <div dangerouslySetInnerHTML={{ __html: userInput }} />;
}

// ✅ Safe - React escapes by default
function SafeComponent({ userInput }) {
  return <div>{userInput}</div>;
}

// ✅ If you must render HTML, sanitize it
import DOMPurify from 'dompurify';

function SafeHTMLComponent({ html }) {
  const sanitized = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p'],
    ALLOWED_ATTR: [],
  });
  
  return <div dangerouslySetInnerHTML={{ __html: sanitized }} />;
}
```

### URL Handling
```js
// ❌ Dangerous - can execute JavaScript
<a href={userProvidedUrl}>Click here</a>

// ✅ Safe - validate URLs
function SafeLink({ href, children }) {
  const isSafe = href.startsWith('http://') || 
                 href.startsWith('https://') ||
                 href.startsWith('/');
  
  if (!isSafe) {
    console.warn('Potentially unsafe URL blocked:', href);
    return <span>{children}</span>;
  }
  
  return <a href={href} rel="noopener noreferrer">{children}</a>;
}
```

### Form Input Validation
```js
// Always validate on frontend AND backend
import { z } from 'zod';

const userSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(100),
  website: z.string().url().optional(),
});

function UserForm() {
  const { register, handleSubmit, formState } = useForm({
    resolver: zodResolver(userSchema),
  });
  
  const onSubmit = async (data) => {
    // Data is already validated by Zod
    await base44.entities.User.create(data);
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input {...register('email')} type="email" />
      {formState.errors.email && <span>{formState.errors.email.message}</span>}
    </form>
  );
}
```

---

## 3. CSRF Protection

### API Requests
```js
// Base44 handles CSRF automatically
// No additional action needed for entity operations

// For custom fetch requests, include credentials
async function makeAuthenticatedRequest(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    credentials: 'include', // Include cookies
    headers: {
      ...options.headers,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response.json();
}
```

---

## 4. Sensitive Data Handling

### Never Store Secrets in Frontend
```js
// ❌ NEVER do this
const API_KEY = 'sk_live_abc123';
const SECRET_TOKEN = 'secret';

// ✅ Use backend functions instead
// functions/stripeCheckout.js
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
const stripe = require('stripe')(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const session = await stripe.checkout.sessions.create({
    // Use secret key securely on backend
  });
  
  return Response.json({ sessionId: session.id });
});
```

### Redact Sensitive Data in Logs
```js
function logUser(user) {
  // ❌ Don't log sensitive data
  console.log('User:', user);
  
  // ✅ Redact sensitive fields
  const { password, ssn, creditCard, ...safeData } = user;
  console.log('User:', safeData);
}

// Better: use a logging utility
function createLogger() {
  const sensitiveFields = ['password', 'token', 'ssn', 'creditCard'];
  
  return {
    log(message, data) {
      const safe = { ...data };
      sensitiveFields.forEach(field => {
        if (field in safe) {
          safe[field] = '[REDACTED]';
        }
      });
      console.log(message, safe);
    },
  };
}

const logger = createLogger();
logger.log('User data:', user); // Password will be [REDACTED]
```

---

## 5. File Upload Security

### Validate File Types
```js
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

function validateFile(file) {
  // Check file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('File type not allowed');
  }
  
  // Check file size
  if (file.size > MAX_SIZE) {
    throw new Error('File too large');
  }
  
  // Additional checks
  if (!file.name.match(/^[\w\-. ]+$/)) {
    throw new Error('Invalid filename');
  }
  
  return true;
}

function FileUpload() {
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    
    try {
      validateFile(file);
      
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      console.log('Uploaded:', file_url);
    } catch (error) {
      toast.error(error.message);
    }
  };
  
  return (
    <input 
      type="file" 
      accept=".jpg,.jpeg,.png,.pdf"
      onChange={handleUpload}
    />
  );
}
```

### Scan Files (Backend)
```js
// functions/uploadFile.js
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  
  // Authenticate user
  const user = await base44.auth.me();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const formData = await req.formData();
  const file = formData.get('file');
  
  // Validate file
  if (file.size > 10 * 1024 * 1024) {
    return Response.json({ error: 'File too large' }, { status: 400 });
  }
  
  // Check file extension and MIME type match
  const ext = file.name.split('.').pop().toLowerCase();
  const mimeMap = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'pdf': 'application/pdf',
  };
  
  if (mimeMap[ext] !== file.type) {
    return Response.json({ error: 'File type mismatch' }, { status: 400 });
  }
  
  // Upload to secure storage
  const { file_url } = await base44.asServiceRole.integrations.Core.UploadPrivateFile({ file });
  
  return Response.json({ file_url });
});
```

---

## 6. SQL Injection Prevention

### Use Parameterized Queries
```js
// Base44 entities use parameterized queries automatically
// ✅ Safe - no SQL injection risk
const users = await base44.entities.User.filter({
  email: userInput, // Automatically sanitized
});

// ✅ Safe - parameters are escaped
const projects = await base44.entities.Project.filter({
  name: { $regex: searchTerm }, // Safely handled
});
```

---

## 7. Rate Limiting

### Frontend Rate Limiting
```js
// utils/rateLimiter.js
class RateLimiter {
  constructor(maxRequests, windowMs) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = new Map();
  }
  
  canMakeRequest(key) {
    const now = Date.now();
    const userRequests = this.requests.get(key) || [];
    
    // Remove old requests outside the window
    const validRequests = userRequests.filter(
      time => now - time < this.windowMs
    );
    
    if (validRequests.length >= this.maxRequests) {
      return false;
    }
    
    validRequests.push(now);
    this.requests.set(key, validRequests);
    return true;
  }
}

// Usage
const limiter = new RateLimiter(5, 60000); // 5 requests per minute

async function sendMessage(message) {
  if (!limiter.canMakeRequest('sendMessage')) {
    toast.error('Too many requests. Please wait.');
    return;
  }
  
  await base44.functions.invoke('sendMessage', { message });
}
```

### Backend Rate Limiting
```js
// functions/api.js
const rateLimits = new Map();

function checkRateLimit(userId, limit = 100, windowMs = 60000) {
  const now = Date.now();
  const userKey = `user:${userId}`;
  const requests = rateLimits.get(userKey) || [];
  
  const validRequests = requests.filter(time => now - time < windowMs);
  
  if (validRequests.length >= limit) {
    return false;
  }
  
  validRequests.push(now);
  rateLimits.set(userKey, validRequests);
  return true;
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Check rate limit
  if (!checkRateLimit(user.id, 100, 60000)) {
    return Response.json(
      { error: 'Rate limit exceeded' },
      { status: 429 }
    );
  }
  
  // Process request...
});
```

---

## 8. Content Security Policy (CSP)

### Configure CSP Headers
```html
<!-- In index.html or via server configuration -->
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  img-src 'self' data: https:;
  connect-src 'self' https://api.base44.com;
">
```

### Vite Configuration
```js
// vite.config.js
export default defineConfig({
  server: {
    headers: {
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'",
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'no-referrer',
      'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
    },
  },
});
```

---

## 9. Secure Communication

### Always Use HTTPS
```js
// Enforce HTTPS in production
if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
  location.replace(`https:${location.href.substring(location.protocol.length)}`);
}
```

### Secure Cookies
```js
// Backend functions - set secure cookies
Deno.serve(async (req) => {
  const response = Response.json({ success: true });
  
  response.headers.set('Set-Cookie', 
    'session=value; HttpOnly; Secure; SameSite=Strict; Max-Age=3600'
  );
  
  return response;
});
```

---

## 10. Error Handling

### Don't Leak Information
```js
// ❌ Exposes internal details
catch (error) {
  toast.error(error.message); // Might expose SQL query, file paths, etc.
}

// ✅ Generic user-facing message
catch (error) {
  console.error('Error:', error); // Log full error for debugging
  toast.error('An error occurred. Please try again.');
}

// ✅ Better - categorize errors
catch (error) {
  if (error.status === 401) {
    toast.error('Please log in to continue.');
  } else if (error.status === 403) {
    toast.error('You don\'t have permission to do that.');
  } else if (error.status >= 500) {
    toast.error('Server error. We\'re looking into it.');
  } else {
    toast.error('Something went wrong. Please try again.');
  }
  
  // Log full error to monitoring service
  captureError(error);
}
```

---

## 11. Dependency Security

### Regular Audits
```bash
# Check for vulnerabilities
npm audit

# Fix automatically
npm audit fix

# Update dependencies
npm update

# Check outdated packages
npm outdated
```

### Lock File
```bash
# Always commit package-lock.json
git add package-lock.json

# Use exact versions for critical dependencies
npm install --save-exact react@18.2.0
```

### Automated Security Checks
```yaml
# .github/workflows/security.yml
name: Security Audit

on:
  schedule:
    - cron: '0 0 * * 0' # Weekly
  push:
    branches: [main]

jobs:
  audit:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Run npm audit
        run: npm audit --audit-level=high
        
      - name: Check for outdated packages
        run: npm outdated
```

---

## 12. Session Management

### Secure Session Handling
```js
// Base44 handles sessions automatically
// Best practices:

// 1. Always check authentication
const user = await base44.auth.me();
if (!user) {
  base44.auth.redirectToLogin();
  return;
}

// 2. Re-validate on sensitive operations
async function deleteAccount() {
  // Re-check authentication
  const user = await base44.auth.me();
  if (!user) {
    toast.error('Session expired. Please log in again.');
    base44.auth.redirectToLogin();
    return;
  }
  
  // Proceed with deletion
  await base44.entities.User.delete(user.id);
}

// 3. Handle session expiration gracefully
base44.entities.Project.list().catch(error => {
  if (error.status === 401) {
    toast.error('Your session has expired.');
    base44.auth.redirectToLogin();
  }
});
```

---

## 13. Security Checklist

### Frontend
- [ ] Input validation on all forms
- [ ] XSS prevention (no dangerouslySetInnerHTML without sanitization)
- [ ] CSRF tokens for state-changing operations
- [ ] Secure HTTP headers (CSP, X-Frame-Options)
- [ ] HTTPS enforced in production
- [ ] No secrets in code or environment variables
- [ ] Rate limiting on API calls
- [ ] Proper error messages (don't leak info)
- [ ] Dependencies regularly audited
- [ ] Authentication checks on protected routes

### Backend
- [ ] Authentication on all endpoints
- [ ] Authorization checks (role-based access)
- [ ] Input validation and sanitization
- [ ] Parameterized queries (no SQL injection)
- [ ] Rate limiting per user/IP
- [ ] Secure file upload validation
- [ ] Secrets stored in environment variables
- [ ] Error logging without sensitive data
- [ ] CORS properly configured
- [ ] API versioning for breaking changes

---

## 14. Common Vulnerabilities

### Prevent Clickjacking
```html
<meta http-equiv="X-Frame-Options" content="DENY">
```

### Prevent MIME Sniffing
```html
<meta http-equiv="X-Content-Type-Options" content="nosniff">
```

### Referrer Policy
```html
<meta name="referrer" content="no-referrer">
```

### Subresource Integrity
```html
<!-- For external scripts -->
<script 
  src="https://cdn.jsdelivr.net/npm/package@1.0.0/dist/file.js"
  integrity="sha384-..."
  crossorigin="anonymous"
></script>
```

---

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [MDN Web Security](https://developer.mozilla.org/en-US/docs/Web/Security)
- [Content Security Policy](https://content-security-policy.com/)
- [Snyk - Dependency Scanning](https://snyk.io/)
- [npm audit](https://docs.npmjs.com/cli/v8/commands/npm-audit)