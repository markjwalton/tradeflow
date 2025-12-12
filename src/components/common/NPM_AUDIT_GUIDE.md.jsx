# NPM Audit & Dependency Security Guide

## Overview

This guide covers how to manage npm dependencies securely, run security audits, and handle vulnerabilities in your Base44 application.

## 🔍 Running NPM Audit

### Basic Audit

```bash
# Run full audit
npm audit

# Only show production dependencies
npm audit --production

# Get JSON output for automation
npm audit --json
```

### Audit Levels

```bash
# Show only moderate and above
npm audit --audit-level=moderate

# Show only high and critical
npm audit --audit-level=high

# Show only critical
npm audit --audit-level=critical
```

## 🛠️ Fixing Vulnerabilities

### Automatic Fixes

```bash
# Auto-fix vulnerabilities (safe updates)
npm audit fix

# Force fixes (may introduce breaking changes)
npm audit fix --force

# Dry run to see what would be fixed
npm audit fix --dry-run
```

### Manual Review Process

1. **Review the audit report**
   ```bash
   npm audit
   ```

2. **Check each vulnerability**
   - Assess severity (low, moderate, high, critical)
   - Review affected paths
   - Check if a fix is available

3. **Update specific packages**
   ```bash
   npm update <package-name>
   npm update <package-name>@latest
   ```

4. **For dev dependencies only issues**
   ```bash
   npm audit fix --only=dev
   ```

## 📊 Understanding Audit Output

### Severity Levels

| Level | Risk | Action Required |
|-------|------|----------------|
| **Critical** | Immediate threat | Fix immediately |
| **High** | Serious issue | Fix within 24 hours |
| **Moderate** | Potential issue | Fix within 1 week |
| **Low** | Minor concern | Fix at convenience |

### Common Vulnerability Types

- **Prototype Pollution**: Can modify object prototypes
- **Arbitrary Code Execution**: Attacker can run code
- **Denial of Service**: Can crash your app
- **Cross-Site Scripting (XSS)**: Can inject malicious scripts
- **Path Traversal**: Can access unauthorized files

## 🔄 Regular Maintenance

### Weekly Checklist

```bash
# 1. Run audit
npm audit

# 2. Update outdated packages
npm outdated
npm update

# 3. Check for deprecated packages
npm deprecate

# 4. Clean unused dependencies
npm prune
```

### Monthly Deep Audit

```bash
# 1. Full dependency tree audit
npm audit --all

# 2. Check for duplicate packages
npm dedupe

# 3. Review package-lock.json changes
git diff package-lock.json

# 4. Update major versions (carefully)
npx npm-check-updates -u
npm install
```

## 🚨 Handling Vulnerabilities with No Fix

### 1. Check if it affects your code

```bash
# View full dependency path
npm ls <vulnerable-package>
```

### 2. Research the vulnerability

- Check [GitHub Advisory Database](https://github.com/advisories)
- Review [Snyk Vulnerability DB](https://snyk.io/vuln/)
- Check package's issue tracker

### 3. Options when no fix exists

**Option A: Use npm audit exceptions**

Create `.npmauditignore` file:
```
1234567  # Advisory ID to ignore (with reason below)
# Reason: Dev dependency only, no production impact
```

**Option B: Use overrides (package.json)**

```json
{
  "overrides": {
    "vulnerable-package": "^safe-version"
  }
}
```

**Option C: Remove or replace the package**

```bash
npm uninstall vulnerable-package
npm install alternative-package
```

**Option D: Document and monitor**

Create `SECURITY.md`:
```markdown
## Known Vulnerabilities

### Package: vulnerable-package
- Severity: Moderate
- Affects: Dev dependencies only
- Status: Monitoring for fix
- Mitigations: Not used in production code
- Review Date: 2025-12-12
```

## 🔐 Security Best Practices

### 1. Lock File Management

```bash
# Always commit package-lock.json
git add package-lock.json
git commit -m "Update dependencies"

# Use exact versions for critical packages
npm install --save-exact critical-package
```

### 2. Dependency Minimization

```bash
# Audit bundle size
npx bundle-size

# Remove unused dependencies
npm prune --production

# Check what each package does
npx how-long-npm-install takes
```

### 3. Use Approved Packages Only

Create `.npmrc`:
```
registry=https://registry.npmjs.org/
audit=true
audit-level=moderate
```

### 4. Review Before Installing

```bash
# Check package info before installing
npm view package-name
npm info package-name

# Check for known issues
npm bugs package-name
```

## 🤖 Automated Security Scanning

### GitHub Actions (Recommended)

The repository includes `.github/workflows/security-audit.yml` that runs:
- Weekly automated audits
- PR-based security checks
- Dependency review for new dependencies

### Manual Setup for Other CI/CD

```yaml
# Example GitLab CI
security-audit:
  script:
    - npm audit --audit-level=moderate
    - npm outdated
  only:
    - schedules
    - merge_requests
```

## 📱 Monitoring Tools

### Snyk

```bash
# Install Snyk CLI
npm install -g snyk

# Authenticate
snyk auth

# Test project
snyk test

# Monitor continuously
snyk monitor
```

### Dependabot (GitHub)

Enable in repository settings:
- Settings → Security → Dependabot
- Enable dependency alerts
- Enable security updates

## 🎯 Quick Response Playbook

### Critical Vulnerability Discovered

1. **Assess Impact** (5 min)
   - Check if package is used in production
   - Verify if vulnerability is exploitable in your context

2. **Immediate Action** (15 min)
   - Run `npm audit fix`
   - Test the application
   - Deploy if fix is successful

3. **If No Fix Available** (30 min)
   - Check for alternative packages
   - Implement temporary mitigations
   - Document the issue

4. **Communication** (10 min)
   - Notify team via Slack/email
   - Create tracking ticket
   - Schedule follow-up review

## 📋 Pre-Deployment Checklist

- [ ] Run `npm audit` - no critical vulnerabilities
- [ ] Run `npm outdated` - all packages reasonably current
- [ ] Review `package-lock.json` changes
- [ ] Test all functionality after updates
- [ ] Check bundle size hasn't increased significantly
- [ ] Update CHANGELOG.md with dependency changes
- [ ] Document any known issues in SECURITY.md

## 🔗 Useful Commands Reference

```bash
# Audit commands
npm audit                           # Full audit report
npm audit --json                    # JSON format
npm audit --audit-level=high        # Only high/critical
npm audit fix                       # Auto-fix vulnerabilities
npm audit fix --force               # Force fixes (breaking)

# Dependency management
npm outdated                        # Check for updates
npm update                          # Update to latest allowed
npm ls                             # List dependencies tree
npm dedupe                         # Remove duplicates
npm prune                          # Remove unused packages

# Security checks
npm doctor                          # Health check
npx npm-check                      # Interactive updates
npx depcheck                       # Find unused dependencies
```

## 📚 Additional Resources

- [NPM Audit Documentation](https://docs.npmjs.com/cli/v8/commands/npm-audit)
- [GitHub Advisory Database](https://github.com/advisories)
- [Snyk Vulnerability Database](https://snyk.io/vuln/)
- [OWASP Dependency Check](https://owasp.org/www-project-dependency-check/)

## 🎓 Training & Education

Schedule regular team training on:
- Recognizing security advisories
- Evaluating vulnerability severity
- Testing after security updates
- Emergency response procedures

---

**Remember**: Security is a continuous process, not a one-time task. Regular audits and updates are essential for maintaining a secure application.