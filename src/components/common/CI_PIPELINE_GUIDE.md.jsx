# CI/CD Pipeline Guide

## GitHub Actions Setup

### Basic Build Pipeline

```yaml
# .github/workflows/build.yml
name: Build and Test

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  build:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [18.x]
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Lint
        run: npm run lint
      
      - name: Type check
        run: npm run type-check || echo "No type-check script"
      
      - name: Build
        run: npm run build
        env:
          NODE_ENV: production
      
      - name: Check bundle size
        run: |
          SIZE=$(du -sb dist | cut -f1)
          echo "Bundle size: $(($SIZE / 1024 / 1024))MB"
          if [ $SIZE -gt 10485760 ]; then
            echo "⚠️ Bundle exceeds 10MB limit"
            exit 1
          fi
      
      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: dist
          path: dist/
          retention-days: 7
```

### Security Audit

```yaml
# .github/workflows/security.yml
name: Security Audit

on:
  schedule:
    - cron: '0 0 * * 0' # Weekly on Sunday
  workflow_dispatch:

jobs:
  audit:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Run npm audit
        run: npm audit --production --audit-level=moderate
      
      - name: Check for outdated packages
        run: npm outdated || true
```

### Bundle Size Guard

```yaml
# .github/workflows/bundle-size.yml
name: Bundle Size Check

on:
  pull_request:
    branches: [main]

jobs:
  check-size:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build current
        run: npm run build
      
      - name: Get current size
        id: current
        run: |
          SIZE=$(du -sb dist | cut -f1)
          echo "size=$SIZE" >> $GITHUB_OUTPUT
      
      - name: Checkout main
        run: git checkout main
      
      - name: Build main
        run: npm ci && npm run build
      
      - name: Get main size
        id: main
        run: |
          SIZE=$(du -sb dist | cut -f1)
          echo "size=$SIZE" >> $GITHUB_OUTPUT
      
      - name: Compare sizes
        run: |
          CURRENT=${{ steps.current.outputs.size }}
          MAIN=${{ steps.main.outputs.size }}
          DIFF=$((CURRENT - MAIN))
          PERCENT=$((DIFF * 100 / MAIN))
          
          echo "Current: $(($CURRENT / 1024 / 1024))MB"
          echo "Main: $(($MAIN / 1024 / 1024))MB"
          echo "Difference: $(($DIFF / 1024 / 1024))MB ($PERCENT%)"
          
          if [ $PERCENT -gt 10 ]; then
            echo "⚠️ Bundle size increased by more than 10%"
            exit 1
          fi
```

### Accessibility Tests

```yaml
# .github/workflows/a11y.yml
name: Accessibility Tests

on:
  pull_request:
    branches: [main]

jobs:
  a11y:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - run: npm ci
      - run: npm run build
      
      - name: Run Pa11y
        run: |
          npm install -g pa11y-ci
          pa11y-ci --sitemap http://localhost:3000/sitemap.xml
```

## Local Pre-commit Hooks

### Install Husky

```bash
npm install -D husky lint-staged
npx husky install
```

### Add Pre-commit Hook

```bash
npx husky add .husky/pre-commit "npx lint-staged"
```

### Configure lint-staged

```json
// package.json
{
  "lint-staged": {
    "*.{js,jsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md}": [
      "prettier --write"
    ]
  }
}
```

## Environment Variables in CI

### GitHub Secrets

```yaml
- name: Build with secrets
  run: npm run build
  env:
    VITE_API_URL: ${{ secrets.VITE_API_URL }}
    VITE_ENV: production
```

### Setting Secrets

1. Go to repository Settings → Secrets and variables → Actions
2. Add secrets:
   - `VITE_API_URL`
   - Other non-sensitive config

## Deployment

### Vercel

```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

### Netlify

```yaml
- name: Deploy to Netlify
  uses: netlify/actions/cli@master
  with:
    args: deploy --dir=dist --prod
  env:
    NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
    NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

## Notifications

### Slack Integration

```yaml
- name: Notify Slack on failure
  if: failure()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    text: 'Build failed!'
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

## Status Badges

Add to README.md:

```markdown
![Build Status](https://github.com/username/repo/workflows/Build%20and%20Test/badge.svg)
![Bundle Size](https://img.shields.io/bundlephobia/minzip/package-name)
![Security](https://img.shields.io/badge/security-audited-green)
```

## Monitoring

### Build Time Tracking

```yaml
- name: Track build time
  run: |
    START=$(date +%s)
    npm run build
    END=$(date +%s)
    DURATION=$((END - START))
    echo "Build took ${DURATION}s"
    
    if [ $DURATION -gt 180 ]; then
      echo "⚠️ Build exceeded 3 minutes"
    fi
```

## Checklist

- [ ] GitHub Actions workflow configured
- [ ] Lint and type-check in CI
- [ ] Build succeeds in CI
- [ ] Bundle size guard in place
- [ ] Security audit runs weekly
- [ ] Pre-commit hooks installed
- [ ] Environment variables configured
- [ ] Deployment pipeline set up
- [ ] Notifications configured
- [ ] Status badges added to README