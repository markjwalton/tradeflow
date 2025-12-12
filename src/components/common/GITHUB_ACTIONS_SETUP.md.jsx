# GitHub Actions Security Workflows Setup

## Overview

This guide helps you set up automated security scanning, npm audits, and dependency reviews using GitHub Actions for your Base44 application.

## 📁 Required Files

Create these files in your repository:

### 1. Security Audit Workflow

**Path:** `.github/workflows/security-audit.yml`

```yaml
name: Security Audit

on:
  schedule:
    - cron: '0 9 * * 1'  # Weekly on Mondays at 9am UTC
  workflow_dispatch:      # Allow manual trigger
  pull_request:
    branches: [main, master]
  push:
    branches: [main, master]

jobs:
  npm-audit:
    name: NPM Security Audit
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run npm audit
        id: audit
        run: |
          npm audit --audit-level=moderate --json > audit-results.json
          VULN_COUNT=$(cat audit-results.json | jq '.metadata.vulnerabilities.total')
          echo "vulnerability_count=$VULN_COUNT" >> $GITHUB_OUTPUT
          npm audit --audit-level=moderate > audit-report.txt || true
        continue-on-error: true

      - name: Upload audit results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: npm-audit-results
          path: |
            audit-results.json
            audit-report.txt
          retention-days: 30

      - name: Check for critical vulnerabilities
        run: |
          HIGH=$(cat audit-results.json | jq '.metadata.vulnerabilities.high')
          CRITICAL=$(cat audit-results.json | jq '.metadata.vulnerabilities.critical')
          
          if [ "$CRITICAL" -gt 0 ]; then
            echo "::error::Found $CRITICAL critical vulnerabilities"
            exit 1
          fi

      - name: Comment PR with results
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');
            const report = fs.readFileSync('audit-report.txt', 'utf8');
            const body = `## 🔒 NPM Security Audit\n\n\`\`\`\n${report.substring(0, 4000)}\n\`\`\``;
            
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: body
            });

  dependency-review:
    name: Dependency Review
    runs-on: ubuntu-latest
    if: github.event_name == 'pull_request'
    
    steps:
      - uses: actions/checkout@v4
      - uses: actions/dependency-review-action@v4
        with:
          fail-on-severity: moderate
```

### 2. Code Scanning Workflow

**Path:** `.github/workflows/code-scanning.yml`

```yaml
name: Code Scanning

on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]
  schedule:
    - cron: '0 8 * * 2'  # Weekly on Tuesdays

jobs:
  eslint:
    name: ESLint
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run ESLint
        run: npm run lint || true
      
      - name: Upload SARIF file
        if: always()
        uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: eslint-results.sarif

  codeql:
    name: CodeQL Analysis
    runs-on: ubuntu-latest
    permissions:
      security-events: write
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Initialize CodeQL
        uses: github/codeql-action/init@v3
        with:
          languages: javascript
      
      - name: Perform CodeQL Analysis
        uses: github/codeql-action/analyze@v3
```

### 3. Dependency Update Workflow

**Path:** `.github/workflows/dependency-updates.yml`

```yaml
name: Dependency Updates

on:
  schedule:
    - cron: '0 10 * * 3'  # Weekly on Wednesdays
  workflow_dispatch:

jobs:
  update-dependencies:
    name: Update Dependencies
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
      
      - name: Update dependencies
        run: |
          npm update
          npm audit fix || true
      
      - name: Create Pull Request
        uses: peter-evans/create-pull-request@v6
        with:
          commit-message: 'chore: update dependencies'
          title: '🔄 Automated dependency updates'
          body: |
            ## Dependency Updates
            
            This PR updates npm dependencies to their latest compatible versions.
            
            - Run `npm audit` to check for vulnerabilities
            - Test the application thoroughly before merging
            
            Generated by GitHub Actions
          branch: automated-dependency-updates
          delete-branch: true
```

## 🔐 Required Secrets

### Sentry Integration (Optional)

Add to repository secrets:

```
Settings → Secrets and variables → Actions → New repository secret

Name: SENTRY_AUTH_TOKEN
Value: [Your Sentry auth token]
```

### Snyk Integration (Optional)

```
Name: SNYK_TOKEN
Value: [Your Snyk API token]
```

Get tokens from:
- Sentry: https://sentry.io/settings/account/api/auth-tokens/
- Snyk: https://app.snyk.io/account

## 🚀 Enabling Workflows

1. **Create `.github/workflows/` directory** in your repository
2. **Add workflow files** with the YAML content above
3. **Commit and push** to your repository
4. **Verify** workflows appear in Actions tab

## 📊 Monitoring Workflow Results

### GitHub UI

1. Go to repository → **Actions** tab
2. View workflow runs and results
3. Download artifacts for detailed reports
4. Review PR comments for security findings

### Email Notifications

Configure in repository settings:
- Settings → Notifications
- Enable workflow notifications
- Set up Slack/email alerts

## 🎯 Workflow Triggers

| Workflow | Trigger | Frequency |
|----------|---------|-----------|
| Security Audit | PR, Push, Schedule | On PR + Weekly |
| Dependency Review | PR only | Every PR |
| Code Scanning | PR, Push, Schedule | On PR + Weekly |
| Dependency Updates | Schedule | Weekly |

## 🛠️ Customization

### Change Audit Sensitivity

```yaml
# More strict (fail on moderate+)
npm audit --audit-level=moderate

# Less strict (only critical)
npm audit --audit-level=critical
```

### Change Schedule

```yaml
# Daily at 2am UTC
- cron: '0 2 * * *'

# Twice weekly (Monday & Thursday)
- cron: '0 9 * * 1,4'

# Monthly (1st of month)
- cron: '0 9 1 * *'
```

### Add Slack Notifications

```yaml
- name: Notify Slack
  if: failure()
  uses: slackapi/slack-github-action@v1
  with:
    webhook-url: ${{ secrets.SLACK_WEBHOOK }}
    payload: |
      {
        "text": "Security audit failed! Check GitHub Actions for details."
      }
```

## 📋 Best Practices

### 1. Review Workflow Results Regularly

- Set up email notifications
- Check Actions tab weekly
- Address failures promptly

### 2. Keep Workflows Updated

- Update action versions quarterly
- Review deprecated actions
- Test workflow changes in a branch

### 3. Secure Your Secrets

- Rotate tokens regularly
- Use repository secrets only
- Limit secret access

### 4. Document Exceptions

Create `SECURITY.md`:
```markdown
## Known Issues

- Advisory #1234: Low severity, dev dependency only
- Reviewed: 2025-12-12
- Action: Monitoring for fix
```

## 🔍 Troubleshooting

### Workflow Fails on npm audit

```yaml
# Add continue-on-error for warnings
- name: Run npm audit
  run: npm audit --audit-level=high
  continue-on-error: true
```

### Rate Limiting

```yaml
# Use personal access token for higher limits
- uses: actions/checkout@v4
  with:
    token: ${{ secrets.PAT }}
```

### Slow Workflow

```yaml
# Use npm ci instead of npm install
- run: npm ci

# Cache dependencies
- uses: actions/setup-node@v4
  with:
    cache: 'npm'
```

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Dependency Review Action](https://github.com/actions/dependency-review-action)
- [CodeQL Documentation](https://codeql.github.com/docs/)
- [Security Best Practices](https://docs.github.com/en/actions/security-guides)

## ✅ Setup Checklist

- [ ] Create `.github/workflows/` directory
- [ ] Add security-audit.yml
- [ ] Add code-scanning.yml (optional)
- [ ] Add dependency-updates.yml (optional)
- [ ] Configure repository secrets (if using Sentry/Snyk)
- [ ] Enable branch protection rules
- [ ] Set up notification preferences
- [ ] Test workflows manually
- [ ] Document any custom configuration
- [ ] Schedule regular review of workflow results

---

**Note:** These workflows require GitHub Actions to be enabled in your repository settings.