# CI/CD Pipeline Guide

## Overview
Complete guide for setting up continuous integration and deployment pipelines with automated testing, security checks, and deployment workflows.

---

## 1. GitHub Actions Workflow

### Basic Build & Test
```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
        
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run linter
        run: npm run lint
        
      - name: Type check
        run: npm run type-check
        
      - name: Run tests
        run: npm test
        
      - name: Build application
        run: npm run build
        env:
          VITE_API_URL: ${{ secrets.STAGING_API_URL }}
          
      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: dist
          path: dist/
          retention-days: 7
```

---

## 2. Complete Production Pipeline

### Full Deployment Workflow
```yaml
# .github/workflows/deploy-production.yml
name: Deploy to Production

on:
  push:
    branches: [main]
  workflow_dispatch: # Manual trigger

jobs:
  quality-checks:
    name: Quality Checks
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Lint
        run: npm run lint
        
      - name: Type check
        run: npm run type-check
        
      - name: Run tests
        run: npm test -- --coverage
        
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          token: ${{ secrets.CODECOV_TOKEN }}

  security-audit:
    name: Security Audit
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run security audit
        run: npm audit --audit-level=moderate
        
      - name: Check for outdated packages
        run: npm outdated || true

  build:
    name: Build Application
    runs-on: ubuntu-latest
    needs: [quality-checks, security-audit]
    
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build
        run: npm run build
        env:
          NODE_ENV: production
          VITE_API_URL: ${{ secrets.PRODUCTION_API_URL }}
          VITE_SENTRY_DSN: ${{ secrets.SENTRY_DSN }}
          VITE_APP_VERSION: ${{ github.ref_name }}
          VITE_COMMIT_SHA: ${{ github.sha }}
          VITE_BUILD_DATE: ${{ github.event.head_commit.timestamp }}
          
      - name: Check bundle size
        run: |
          SIZE=$(du -sh dist | cut -f1)
          echo "Bundle size: $SIZE"
          
      - name: Upload source maps to Sentry
        if: success()
        run: |
          npx @sentry/cli sourcemaps upload \
            --org=${{ secrets.SENTRY_ORG }} \
            --project=${{ secrets.SENTRY_PROJECT }} \
            --auth-token=${{ secrets.SENTRY_AUTH_TOKEN }} \
            ./dist
            
      - name: Remove source maps
        run: find ./dist -name "*.map" -type f -delete
        
      - name: Upload artifacts
        uses: actions/upload-artifact@v3
        with:
          name: production-build
          path: dist/

  deploy:
    name: Deploy to Production
    runs-on: ubuntu-latest
    needs: build
    environment:
      name: production
      url: https://app.example.com
    
    steps:
      - name: Download artifacts
        uses: actions/download-artifact@v3
        with:
          name: production-build
          path: dist/
          
      - name: Deploy to hosting
        run: |
          # Example: Deploy to your hosting provider
          # npm install -g firebase-tools
          # firebase deploy --token "${{ secrets.FIREBASE_TOKEN }}"
          echo "Deploy step - customize for your hosting provider"
          
      - name: Create Sentry release
        run: |
          npx @sentry/cli releases new ${{ github.sha }}
          npx @sentry/cli releases set-commits ${{ github.sha }} --auto
          npx @sentry/cli releases finalize ${{ github.sha }}
        env:
          SENTRY_AUTH_TOKEN: ${{ secrets.SENTRY_AUTH_TOKEN }}
          SENTRY_ORG: ${{ secrets.SENTRY_ORG }}
          SENTRY_PROJECT: ${{ secrets.SENTRY_PROJECT }}
          
      - name: Notify deployment
        uses: 8398a7/action-slack@v3
        if: always()
        with:
          status: ${{ job.status }}
          text: 'Deployment to production ${{ job.status }}'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

---

## 3. Staging Environment

### Deploy to Staging
```yaml
# .github/workflows/deploy-staging.yml
name: Deploy to Staging

on:
  push:
    branches: [develop]

jobs:
  deploy-staging:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build for staging
        run: npm run build:staging
        env:
          VITE_API_URL: ${{ secrets.STAGING_API_URL }}
          VITE_SENTRY_DSN: ${{ secrets.STAGING_SENTRY_DSN }}
          VITE_ENABLE_DEBUG: true
          
      - name: Deploy to staging
        run: |
          # Deploy to staging environment
          echo "Deploy to staging"
          
      - name: Run smoke tests
        run: |
          npm run test:e2e -- --base-url=https://staging.example.com
```

---

## 4. Pull Request Checks

### PR Quality Gates
```yaml
# .github/workflows/pr-checks.yml
name: PR Checks

on:
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  validate:
    name: Validate Changes
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0 # Full history for comparison
          
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Lint changed files
        run: |
          git diff --name-only origin/main...HEAD | grep -E '\.(js|jsx|ts|tsx)$' | xargs npm run lint
          
      - name: Check bundle size impact
        run: |
          npm run build
          CURRENT_SIZE=$(du -sb dist | cut -f1)
          
          git checkout origin/main
          npm ci
          npm run build
          MAIN_SIZE=$(du -sb dist | cut -f1)
          
          DIFF=$((CURRENT_SIZE - MAIN_SIZE))
          PERCENT=$((DIFF * 100 / MAIN_SIZE))
          
          echo "Bundle size change: ${DIFF} bytes (${PERCENT}%)"
          
          if [ $PERCENT -gt 10 ]; then
            echo "Warning: Bundle size increased by more than 10%"
            exit 1
          fi
          
      - name: Comment PR
        uses: actions/github-script@v6
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '✅ All checks passed! Bundle size impact: acceptable'
            })
```

---

## 5. Automated Testing

### Unit & Integration Tests
```yaml
# .github/workflows/tests.yml
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:

jobs:
  unit-tests:
    name: Unit Tests
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run unit tests
        run: npm test -- --coverage --watchAll=false
        
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json

  e2e-tests:
    name: E2E Tests
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Install Playwright
        run: npx playwright install --with-deps
        
      - name: Run E2E tests
        run: npm run test:e2e
        
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

---

## 6. Performance Monitoring

### Lighthouse CI
```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI

on:
  pull_request:
  push:
    branches: [main]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build application
        run: npm run build
        
      - name: Run Lighthouse CI
        run: |
          npm install -g @lhci/cli
          lhci autorun
        env:
          LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}
          
      - name: Upload results
        uses: actions/upload-artifact@v3
        with:
          name: lighthouse-results
          path: .lighthouseci/
```

### Lighthouse Config
```js
// lighthouserc.js
module.exports = {
  ci: {
    collect: {
      startServerCommand: 'npm run preview',
      url: ['http://localhost:4173'],
      numberOfRuns: 3,
    },
    assert: {
      preset: 'lighthouse:recommended',
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
```

---

## 7. Dependency Management

### Automated Updates
```yaml
# .github/workflows/dependency-updates.yml
name: Dependency Updates

on:
  schedule:
    - cron: '0 0 * * 1' # Weekly on Monday
  workflow_dispatch:

jobs:
  update-dependencies:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          
      - name: Update dependencies
        run: |
          npm update
          npm audit fix
          
      - name: Run tests
        run: npm test
        
      - name: Create PR
        uses: peter-evans/create-pull-request@v5
        with:
          commit-message: 'chore: update dependencies'
          title: 'chore: automated dependency updates'
          body: 'Automated dependency updates and security fixes'
          branch: automated-updates
```

### Dependabot Configuration
```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
    reviewers:
      - "team-leads"
    labels:
      - "dependencies"
    ignore:
      - dependency-name: "*"
        update-types: ["version-update:semver-major"]
```

---

## 8. Release Management

### Automated Releases
```yaml
# .github/workflows/release.yml
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0
          
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build
        run: npm run build
        env:
          VITE_APP_VERSION: ${{ github.ref_name }}
          
      - name: Generate changelog
        id: changelog
        run: |
          PREVIOUS_TAG=$(git describe --abbrev=0 --tags $(git rev-list --tags --skip=1 --max-count=1))
          CHANGELOG=$(git log ${PREVIOUS_TAG}..HEAD --pretty=format:"- %s (%h)")
          echo "changelog<<EOF" >> $GITHUB_OUTPUT
          echo "$CHANGELOG" >> $GITHUB_OUTPUT
          echo "EOF" >> $GITHUB_OUTPUT
          
      - name: Create GitHub Release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: ${{ github.ref }}
          release_name: Release ${{ github.ref_name }}
          body: |
            ## Changes
            ${{ steps.changelog.outputs.changelog }}
          draft: false
          prerelease: false
```

---

## 9. Rollback Strategy

### Quick Rollback
```yaml
# .github/workflows/rollback.yml
name: Rollback

on:
  workflow_dispatch:
    inputs:
      version:
        description: 'Version to rollback to'
        required: true

jobs:
  rollback:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
        with:
          ref: ${{ github.event.inputs.version }}
          
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build
        run: npm run build
        
      - name: Deploy
        run: |
          # Deploy previous version
          echo "Deploying version ${{ github.event.inputs.version }}"
          
      - name: Notify team
        uses: 8398a7/action-slack@v3
        with:
          status: custom
          custom_payload: |
            {
              text: `🔄 Rollback to version ${{ github.event.inputs.version }} completed`,
              attachments: [{
                color: 'warning',
                text: 'Production rolled back'
              }]
            }
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

---

## 10. Cache Management

### Optimize Build Times
```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'npm'
          
      - name: Cache node modules
        uses: actions/cache@v3
        with:
          path: ~/.npm
          key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
          restore-keys: |
            ${{ runner.os }}-node-
            
      - name: Cache build output
        uses: actions/cache@v3
        with:
          path: dist/
          key: ${{ runner.os }}-build-${{ github.sha }}
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build
        run: npm run build
```

---

## 11. Environment-Specific Secrets

### Managing Secrets
```yaml
# In GitHub Settings > Secrets and variables > Actions

# Production
PRODUCTION_API_URL
PRODUCTION_DEPLOY_TOKEN
SENTRY_AUTH_TOKEN
SENTRY_ORG
SENTRY_PROJECT

# Staging
STAGING_API_URL
STAGING_SENTRY_DSN

# General
SLACK_WEBHOOK
CODECOV_TOKEN
```

### Using Secrets
```yaml
- name: Deploy with secrets
  run: npm run deploy
  env:
    API_KEY: ${{ secrets.PRODUCTION_API_KEY }}
    DEPLOY_TOKEN: ${{ secrets.DEPLOY_TOKEN }}
```

---

## 12. Monitoring & Notifications

### Slack Integration
```yaml
- name: Notify success
  if: success()
  uses: 8398a7/action-slack@v3
  with:
    status: success
    text: '✅ Deployment to production successful'
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
    
- name: Notify failure
  if: failure()
  uses: 8398a7/action-slack@v3
  with:
    status: failure
    text: '❌ Deployment to production failed'
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### Email Notifications
```yaml
- name: Send email notification
  if: failure()
  uses: dawidd6/action-send-mail@v3
  with:
    server_address: smtp.gmail.com
    server_port: 465
    username: ${{ secrets.EMAIL_USERNAME }}
    password: ${{ secrets.EMAIL_PASSWORD }}
    subject: 'CI/CD Pipeline Failed'
    body: 'The CI/CD pipeline has failed. Check GitHub Actions for details.'
    to: team@example.com
```

---

## 13. Best Practices

### ✅ DO
- Use environment-specific workflows
- Cache dependencies and build outputs
- Run tests before deployment
- Use semantic versioning
- Automate security audits
- Monitor bundle size changes
- Use manual approval for production
- Implement rollback procedures
- Store secrets in GitHub Secrets
- Use branch protection rules

### ❌ DON'T
- Commit secrets to repository
- Deploy directly to production from local machine
- Skip tests in CI pipeline
- Use long-running manual processes
- Deploy without smoke tests
- Ignore failed security audits
- Mix staging and production credentials
- Deploy on Fridays (unless necessary)

---

## 14. Quick Start

### Minimal Setup
```yaml
# .github/workflows/main.yml
name: CI/CD

on:
  push:
    branches: [main]
  pull_request:

jobs:
  ci-cd:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'npm'
          
      - run: npm ci
      - run: npm run lint
      - run: npm test
      - run: npm run build
      
      - name: Deploy
        if: github.ref == 'refs/heads/main'
        run: npm run deploy
        env:
          DEPLOY_TOKEN: ${{ secrets.DEPLOY_TOKEN }}
```

---

## Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Dependabot](https://docs.github.com/en/code-security/dependabot)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
- [Codecov](https://about.codecov.io/)
- [Sentry Releases](https://docs.sentry.io/product/releases/)