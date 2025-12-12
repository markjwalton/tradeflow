# Security Audit & Vulnerability Management Guide

## Automated Security Audits

### npm audit

Run security audits regularly to detect vulnerabilities in dependencies:

```bash
# Check for vulnerabilities
npm audit

# Get detailed report
npm audit --json > audit-report.json

# Fix automatically (careful in production)
npm audit fix

# Fix with potentially breaking changes
npm audit fix --force
```

### Audit Levels

- **Critical**: Immediate action required
- **High**: Fix as soon as possible
- **Moderate**: Fix in next release cycle
- **Low**: Monitor and fix when convenient

## GitHub Security Features

### 1. Dependabot

Enable Dependabot in your repository:

**`.github/dependabot.yml`**:
```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
    reviewers:
      - "your-team"
    labels:
      - "dependencies"
      - "security"
```

### 2. Code Scanning

Enable GitHub Advanced Security:

**`.github/workflows/codeql-analysis.yml`**:
```yaml
name: "CodeQL"

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]
  schedule:
    - cron: '0 0 * * 1'

jobs:
  analyze:
    name: Analyze
    runs-on: ubuntu-latest
    permissions:
      security-events: write
      actions: read
      contents: read

    strategy:
      matrix:
        language: [ 'javascript' ]

    steps:
    - name: Checkout repository
      uses: actions/checkout@v3

    - name: Initialize CodeQL
      uses: github/codeql-action/init@v2
      with:
        languages: ${{ matrix.language }}

    - name: Autobuild
      uses: github/codeql-action/autobuild@v2

    - name: Perform CodeQL Analysis
      uses: github/codeql-action/analyze@v2
```

### 3. Secret Scanning

GitHub automatically scans for leaked secrets. Configure custom patterns:

**Repository Settings → Security → Code security and analysis**

Enable:
- Dependency graph
- Dependabot alerts
- Dependabot security updates
- Code scanning
- Secret scanning

## Regular Security Checklist

### Weekly
- [ ] Review Dependabot PRs
- [ ] Check npm audit results
- [ ] Review Sentry error reports
- [ ] Check CSP violation reports

### Monthly
- [ ] Full npm audit with `--audit-level=moderate`
- [ ] Review and update dependencies
- [ ] Test authentication flows
- [ ] Review access logs
- [ ] Update security documentation

### Quarterly
- [ ] Full security audit of codebase
- [ ] Review and update CSP headers
- [ ] Penetration testing
- [ ] Review user permissions and roles
- [ ] Update security training for team

## Vulnerability Response Process

### 1. Discovery
- Automated alert from Dependabot/npm audit
- Manual discovery during code review
- External security researcher report
- Monitoring tool alert

### 2. Assessment
```bash
# Check severity
npm audit

# Review specific package
npm audit --package=package-name

# Check if vulnerability affects your code
npm ls package-name
```

### 3. Action Plan

**Critical/High Severity:**
1. Create hotfix branch immediately
2. Update vulnerable dependency
3. Test thoroughly
4. Deploy to production within 24 hours
5. Notify stakeholders

**Moderate Severity:**
1. Create issue in backlog
2. Plan fix for next sprint
3. Monitor for exploitation attempts
4. Fix within 2 weeks

**Low Severity:**
1. Document in tech debt backlog
2. Fix during regular maintenance
3. Address within 30 days

### 4. Testing
```bash
# After fixing
npm audit
npm test
npm run build

# Verify fix
npm ls package-name
```

### 5. Documentation
- Update CHANGELOG.md
- Document in security log
- Notify team via Slack/email
- Update security runbook

## Common Vulnerability Types

### 1. Cross-Site Scripting (XSS)

**Prevention:**
```javascript
// Bad: Direct innerHTML
element.innerHTML = userInput;

// Good: Use React (auto-escapes)
return <div>{userInput}</div>;

// Good: Sanitize if needed
import DOMPurify from 'dompurify';
element.innerHTML = DOMPurify.sanitize(userInput);
```

### 2. SQL Injection

**Prevention:**
```javascript
// Bad: String concatenation
const query = `SELECT * FROM users WHERE id = ${userId}`;

// Good: Parameterized queries (Base44 SDK handles this)
await base44.entities.User.filter({ id: userId });
```

### 3. Authentication Bypass

**Prevention:**
```javascript
// Always verify authentication
const user = await base44.auth.me();
if (!user) {
  return Response.json({ error: 'Unauthorized' }, { status: 401 });
}

// Verify tenant access
if (user.tenant_id !== requestedTenantId) {
  return Response.json({ error: 'Forbidden' }, { status: 403 });
}
```

### 4. Sensitive Data Exposure

**Prevention:**
```javascript
// Don't log sensitive data
console.log('User:', { 
  id: user.id, 
  email: user.email 
  // Don't include: password, tokens, etc.
});

// Filter before sending to frontend
const safeUser = {
  id: user.id,
  email: user.email,
  name: user.full_name,
  // Don't include: password_hash, api_keys, etc.
};
```

### 5. Prototype Pollution

**Prevention:**
```javascript
// Bad: Direct property assignment from user input
Object.assign(obj, userInput);

// Good: Validate and sanitize
const allowedKeys = ['name', 'email'];
const safeData = {};
allowedKeys.forEach(key => {
  if (userInput.hasOwnProperty(key)) {
    safeData[key] = userInput[key];
  }
});
```

## Dependency Security Best Practices

### 1. Pin Versions

```json
{
  "dependencies": {
    "react": "18.2.0",  // Exact version
    "lodash": "~4.17.21",  // Patch updates only
    "axios": "^1.6.0"  // Minor updates
  }
}
```

### 2. Use Lock Files

Always commit `package-lock.json`:
```bash
# Generate lock file
npm install

# Use lock file in CI/CD
npm ci
```

### 3. Verify Package Integrity

```bash
# Check package signatures
npm audit signatures

# Review package before installing
npm view package-name
npm view package-name repository.url
```

### 4. Minimize Dependencies

```bash
# Find unused dependencies
npm prune

# Analyze bundle size
npx webpack-bundle-analyzer

# Check for duplicates
npm dedupe
```

## Environment Security

### Development
```env
# .env.development
VITE_API_URL=http://localhost:3000
VITE_SENTRY_DSN=  # Disabled in dev
VITE_ENABLE_DEBUG=true
```

### Production
```env
# .env.production
VITE_API_URL=https://api.production.com
VITE_SENTRY_DSN=https://...sentry.io/...
VITE_ENABLE_DEBUG=false
VITE_CSP_REPORT_URI=/csp-report
```

**Never commit `.env` files!**

Add to `.gitignore`:
```
.env
.env.local
.env.*.local
```

## Security Monitoring

### 1. Error Tracking (Sentry)

Monitor for:
- Authentication errors
- Authorization failures
- Unusual API patterns
- Rate limit violations

### 2. Log Analysis

```javascript
// Track security events
import { captureMessage } from '@/components/monitoring/sentryConfig';

// Failed login
captureMessage('Failed login attempt', 'warning', {
  email: attemptedEmail,
  ip: request.ip,
  timestamp: new Date(),
});

// Suspicious activity
captureMessage('Multiple failed auth attempts', 'error', {
  userId: user.id,
  attempts: failedAttempts,
});
```

### 3. Rate Limiting

Implement rate limiting for sensitive operations:

```javascript
// Example with Redis
const MAX_ATTEMPTS = 5;
const WINDOW = 900; // 15 minutes

const key = `auth:${email}:${ip}`;
const attempts = await redis.incr(key);
await redis.expire(key, WINDOW);

if (attempts > MAX_ATTEMPTS) {
  throw new Error('Too many attempts. Try again later.');
}
```

## Incident Response

### 1. Immediate Response
- [ ] Identify affected systems
- [ ] Contain the breach (disable accounts, block IPs)
- [ ] Preserve evidence (logs, database state)
- [ ] Notify security team

### 2. Investigation
- [ ] Review access logs
- [ ] Check for data exfiltration
- [ ] Identify vulnerability
- [ ] Document timeline

### 3. Remediation
- [ ] Deploy security fixes
- [ ] Reset compromised credentials
- [ ] Update security measures
- [ ] Test fixes thoroughly

### 4. Recovery
- [ ] Restore affected systems
- [ ] Notify affected users (if required)
- [ ] Update documentation
- [ ] Conduct post-mortem

### 5. Lessons Learned
- [ ] Document incident
- [ ] Update security procedures
- [ ] Train team on prevention
- [ ] Schedule follow-up review

## Security Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [npm Security Best Practices](https://docs.npmjs.com/security)
- [Node.js Security Checklist](https://nodejs.org/en/docs/guides/security/)
- [GitHub Security Lab](https://securitylab.github.com/)

## Emergency Contacts

Document your security team contacts:
- Security Lead: [name@company.com]
- DevOps Lead: [name@company.com]
- Legal: [name@company.com]
- PR/Communications: [name@company.com]