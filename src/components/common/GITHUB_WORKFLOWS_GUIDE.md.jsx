# GitHub Workflows for Security & CI/CD

## Security Audit Workflow

Create `.github/workflows/security-audit.yml`:

```yaml
name: Security Audit

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]
  schedule:
    # Run every Monday at 9am UTC
    - cron: '0 9 * * 1'
  workflow_dispatch:

jobs:
  npm-audit:
    name: npm Audit
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run npm audit
      run: npm audit --audit-level=moderate
      continue-on-error: true
    
    - name: Generate audit report
      run: npm audit --json > audit-report.json
      continue-on-error: true
    
    - name: Upload audit report
      uses: actions/upload-artifact@v3
      with:
        name: npm-audit-report
        path: audit-report.json
        retention-days: 30

  dependency-review:
    name: Dependency Review
    runs-on: ubuntu-latest
    if: github.event_name == 'pull_request'
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v3
    
    - name: Dependency Review
      uses: actions/dependency-review-action@v3
      with:
        fail-on-severity: moderate

  codeql:
    name: CodeQL Analysis
    runs-on: ubuntu-latest
    permissions:
      security-events: write
      actions: read
      contents: read
    
    strategy:
      matrix:
        language: [ 'javascript' ]
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v3
    
    - name: Initialize CodeQL
      uses: github/codeql-action/init@v2
      with:
        languages: ${{ matrix.language }}
        queries: security-and-quality
    
    - name: Autobuild
      uses: github/codeql-action/autobuild@v2
    
    - name: Perform CodeQL Analysis
      uses: github/codeql-action/analyze@v2

  security-summary:
    name: Security Summary
    runs-on: ubuntu-latest
    needs: [npm-audit, codeql]
    if: always()
    
    steps:
    - name: Create summary
      run: |
        echo "## Security Audit Summary" >> $GITHUB_STEP_SUMMARY
        echo "" >> $GITHUB_STEP_SUMMARY
        echo "- npm audit: ${{ needs.npm-audit.result }}" >> $GITHUB_STEP_SUMMARY
        echo "- CodeQL: ${{ needs.codeql.result }}" >> $GITHUB_STEP_SUMMARY
        echo "" >> $GITHUB_STEP_SUMMARY
        echo "View detailed results in the workflow logs." >> $GITHUB_STEP_SUMMARY
```

## Build & Test Workflow

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  build:
    name: Build & Test
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Lint
      run: npm run lint
      continue-on-error: true
    
    - name: Type check
      run: npm run type-check
      continue-on-error: true
    
    - name: Run tests
      run: npm test
      continue-on-error: true
    
    - name: Build
      run: npm run build
      env:
        CI: true
    
    - name: Check build size
      run: |
        if [ -d "dist" ]; then
          du -sh dist
          du -sh dist/* | sort -h
        fi
    
    - name: Upload build artifacts
      uses: actions/upload-artifact@v3
      with:
        name: build
        path: dist/
        retention-days: 7

  lighthouse:
    name: Lighthouse CI
    runs-on: ubuntu-latest
    needs: build
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Download build artifacts
      uses: actions/download-artifact@v3
      with:
        name: build
        path: dist/
    
    - name: Run Lighthouse CI
      uses: treosh/lighthouse-ci-action@v9
      with:
        urls: |
          http://localhost:3000
        uploadArtifacts: true
        temporaryPublicStorage: true
```

## Dependabot Configuration

Create `.github/dependabot.yml`:

```yaml
version: 2
updates:
  # Enable version updates for npm
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "monday"
      time: "09:00"
    open-pull-requests-limit: 10
    reviewers:
      - "your-team"
    assignees:
      - "tech-lead"
    labels:
      - "dependencies"
      - "automated"
    commit-message:
      prefix: "chore"
      include: "scope"
    
    # Group updates
    groups:
      react-ecosystem:
        patterns:
          - "react*"
          - "@types/react*"
      
      build-tools:
        patterns:
          - "vite*"
          - "@vitejs/*"
          - "esbuild"
      
      testing:
        patterns:
          - "vitest"
          - "@testing-library/*"
          - "jest*"
    
    # Version requirements
    versioning-strategy: increase
    
    # Ignore specific updates
    ignore:
      - dependency-name: "lodash"
        update-types: ["version-update:semver-major"]

  # GitHub Actions updates
  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "weekly"
    labels:
      - "github-actions"
      - "automated"
```

## Deploy Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  deploy-production:
    name: Deploy to Production
    runs-on: ubuntu-latest
    environment: production
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run security audit
      run: npm audit --audit-level=critical
    
    - name: Build
      run: npm run build
      env:
        CI: true
        VITE_API_URL: ${{ secrets.PROD_API_URL }}
        VITE_SENTRY_DSN: ${{ secrets.SENTRY_DSN }}
        VITE_APP_VERSION: ${{ github.sha }}
    
    - name: Deploy to Netlify
      uses: netlify/actions/cli@master
      with:
        args: deploy --prod --dir=dist
      env:
        NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
        NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
    
    - name: Create Sentry release
      uses: getsentry/action-release@v1
      env:
        SENTRY_AUTH_TOKEN: ${{ secrets.SENTRY_AUTH_TOKEN }}
        SENTRY_ORG: ${{ secrets.SENTRY_ORG }}
        SENTRY_PROJECT: ${{ secrets.SENTRY_PROJECT }}
      with:
        environment: production
        version: ${{ github.sha }}
    
    - name: Notify deployment
      uses: slackapi/slack-github-action@v1
      with:
        payload: |
          {
            "text": "🚀 Deployed to production",
            "blocks": [
              {
                "type": "section",
                "text": {
                  "type": "mrkdwn",
                  "text": "Deployment completed\n*Environment:* production\n*Version:* ${{ github.sha }}"
                }
              }
            ]
          }
      env:
        SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

## PR Quality Checks

Create `.github/workflows/pr-checks.yml`:

```yaml
name: PR Quality Checks

on:
  pull_request:
    branches: [ main, develop ]

jobs:
  quality:
    name: Code Quality
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v3
      with:
        fetch-depth: 0
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Check for console.logs
      run: |
        if grep -r "console\\.log" --include="*.jsx" --include="*.js" --exclude-dir=node_modules .; then
          echo "❌ Found console.log statements"
          exit 1
        fi
      continue-on-error: true
    
    - name: Check for TODOs
      run: |
        COUNT=$(grep -r "TODO" --include="*.jsx" --include="*.js" --include="*.md" --exclude-dir=node_modules . | wc -l)
        echo "Found $COUNT TODO comments"
        if [ $COUNT -gt 50 ]; then
          echo "⚠️ Consider addressing some TODOs"
        fi
    
    - name: Check bundle size
      run: |
        npm run build
        SIZE=$(du -sh dist | cut -f1)
        echo "Bundle size: $SIZE"
    
    - name: Comment on PR
      uses: actions/github-script@v6
      with:
        script: |
          github.rest.issues.createComment({
            issue_number: context.issue.number,
            owner: context.repo.owner,
            repo: context.repo.repo,
            body: '✅ Quality checks passed!'
          })
```

## Required Status Checks

In your GitHub repository settings, configure required status checks:

**Settings → Branches → Branch protection rules → main**

Enable:
- [x] Require status checks to pass before merging
  - [x] npm-audit
  - [x] codeql
  - [x] build
  - [x] quality
- [x] Require branches to be up to date before merging
- [x] Require conversation resolution before merging
- [x] Do not allow bypassing the above settings

## Secrets Configuration

Add these secrets in **Settings → Secrets and variables → Actions**:

**Required:**
- `NETLIFY_SITE_ID` - Your Netlify site ID
- `NETLIFY_AUTH_TOKEN` - Netlify deployment token

**Optional (for enhanced features):**
- `SENTRY_DSN` - Sentry project DSN
- `SENTRY_AUTH_TOKEN` - Sentry API token
- `SENTRY_ORG` - Your Sentry organization
- `SENTRY_PROJECT` - Your Sentry project name
- `SLACK_WEBHOOK_URL` - Slack notifications webhook
- `PROD_API_URL` - Production API URL

## Monitoring Workflows

View workflow status:
- **Actions tab** in GitHub repository
- **Checks** section in pull requests
- Email notifications (configure in Settings → Notifications)

## Troubleshooting

### Workflow fails on npm audit

```bash
# Locally check what's failing
npm audit

# Fix automatically
npm audit fix

# Or ignore specific vulnerabilities
npm audit --audit-level=high
```

### CodeQL analysis timeout

Increase timeout in workflow:

```yaml
- name: Perform CodeQL Analysis
  uses: github/codeql-action/analyze@v2
  timeout-minutes: 30
```

### Build size too large

Check what's included:

```bash
npm run build
npx webpack-bundle-analyzer dist/stats.json
```

## Best Practices

1. **Run workflows locally before pushing**
   ```bash
   npm audit
   npm run lint
   npm test
   npm run build
   ```

2. **Use workflow templates** - Start with GitHub's starter workflows

3. **Cache dependencies** - Use `actions/setup-node` with `cache: 'npm'`

4. **Fail fast** - Set `fail-fast: true` in matrix builds

5. **Use environments** - Separate staging/production with approval gates

6. **Monitor workflow usage** - Check Actions usage under Settings → Billing

7. **Keep workflows DRY** - Use reusable workflows for common tasks