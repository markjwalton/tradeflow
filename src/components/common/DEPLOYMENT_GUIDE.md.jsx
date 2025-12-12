# Deployment Guide

## Overview
Comprehensive guide for deploying React/Vite applications to various hosting platforms with environment-specific configurations, zero-downtime strategies, and rollback procedures.

---

## 1. Pre-Deployment Checklist

### Essential Checks
- [ ] All tests passing (`npm test`)
- [ ] Build successful (`npm run build`)
- [ ] No console errors in production build
- [ ] Environment variables configured
- [ ] Security audit passed (`npm audit`)
- [ ] Bundle size within acceptable limits
- [ ] Performance metrics acceptable (Lighthouse)
- [ ] Accessibility audit passed
- [ ] Browser compatibility tested
- [ ] Mobile responsiveness verified
- [ ] Error tracking configured (Sentry)
- [ ] Analytics configured
- [ ] SEO meta tags present
- [ ] Robots.txt and sitemap configured
- [ ] SSL certificate ready

---

## 2. Build Optimization

### Production Build
```bash
# Standard build
npm run build

# Build with specific environment
VITE_ENV=production npm run build

# Build with source maps
npm run build -- --mode production
```

### Vite Production Config
```js
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    mode === 'analyze' && visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  
  build: {
    outDir: 'dist',
    sourcemap: mode === 'production' ? 'hidden' : true,
    minify: 'terser',
    
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: true,
      },
    },
    
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          utils: ['lodash', 'date-fns'],
        },
      },
    },
    
    chunkSizeWarningLimit: 500,
  },
  
  // Enable compression
  server: {
    compress: true,
  },
}));
```

### Package Scripts
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "build:staging": "vite build --mode staging",
    "build:production": "vite build --mode production",
    "build:analyze": "vite build --mode analyze",
    "preview": "vite preview",
    "preview:production": "vite build && vite preview"
  }
}
```

---

## 3. Vercel Deployment

### Automatic Deployment
```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "routes": [
    { "handle": "filesystem" },
    { "src": "/(.*)", "dest": "/index.html" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    },
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ],
  "env": {
    "VITE_API_URL": "@production-api-url",
    "VITE_SENTRY_DSN": "@sentry-dsn"
  }
}
```

### CLI Deployment
```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod

# Set environment variables
vercel env add VITE_API_URL production
```

---

## 4. Netlify Deployment

### Configuration
```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"
  
[build.environment]
  NODE_VERSION = "18"
  
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
  
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    
[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
    
[context.production]
  environment = { VITE_ENV = "production" }
  
[context.staging]
  environment = { VITE_ENV = "staging" }
  command = "npm run build:staging"
```

### CLI Deployment
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Initialize site
netlify init

# Deploy to preview
netlify deploy

# Deploy to production
netlify deploy --prod

# Set environment variables
netlify env:set VITE_API_URL "https://api.example.com"
```

---

## 5. AWS S3 + CloudFront

### S3 Static Hosting
```bash
# Install AWS CLI
npm install -g aws-cli

# Configure AWS credentials
aws configure

# Create S3 bucket
aws s3 mb s3://my-app-bucket

# Enable static website hosting
aws s3 website s3://my-app-bucket \
  --index-document index.html \
  --error-document index.html

# Upload build files
aws s3 sync dist/ s3://my-app-bucket \
  --delete \
  --cache-control "public, max-age=31536000, immutable" \
  --exclude "*.html" \
  --exclude "service-worker.js"

# Upload HTML files with shorter cache
aws s3 sync dist/ s3://my-app-bucket \
  --cache-control "public, max-age=0, must-revalidate" \
  --exclude "*" \
  --include "*.html" \
  --include "service-worker.js"

# Set bucket policy
aws s3api put-bucket-policy \
  --bucket my-app-bucket \
  --policy file://bucket-policy.json
```

### Bucket Policy
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::my-app-bucket/*"
    }
  ]
}
```

### CloudFront Distribution
```bash
# Create CloudFront distribution
aws cloudfront create-distribution \
  --origin-domain-name my-app-bucket.s3.amazonaws.com \
  --default-root-object index.html

# Invalidate cache after deployment
aws cloudfront create-invalidation \
  --distribution-id DISTRIBUTION_ID \
  --paths "/*"
```

### Deployment Script
```bash
#!/bin/bash
# deploy-aws.sh

set -e

echo "Building application..."
npm run build

echo "Uploading to S3..."
aws s3 sync dist/ s3://my-app-bucket --delete

echo "Invalidating CloudFront cache..."
aws cloudfront create-invalidation \
  --distribution-id $CLOUDFRONT_DIST_ID \
  --paths "/*"

echo "Deployment complete!"
```

---

## 6. Docker Deployment

### Multi-stage Dockerfile
```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
```

### Nginx Configuration
```nginx
# nginx.conf
events {
  worker_connections 1024;
}

http {
  include /etc/nginx/mime.types;
  default_type application/octet-stream;
  
  # Gzip compression
  gzip on;
  gzip_vary on;
  gzip_proxied any;
  gzip_comp_level 6;
  gzip_types text/plain text/css text/xml text/javascript
             application/json application/javascript application/xml+rss
             application/rss+xml font/truetype font/opentype
             application/vnd.ms-fontobject image/svg+xml;
  
  server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;
    
    # Security headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
      expires 1y;
      add_header Cache-Control "public, immutable";
    }
    
    # Don't cache HTML
    location ~* \.html$ {
      expires -1;
      add_header Cache-Control "no-cache, no-store, must-revalidate";
    }
    
    # SPA routing
    location / {
      try_files $uri $uri/ /index.html;
    }
  }
}
```

### Docker Commands
```bash
# Build image
docker build -t my-app:latest .

# Run container
docker run -d -p 80:80 --name my-app my-app:latest

# Push to registry
docker tag my-app:latest myregistry/my-app:latest
docker push myregistry/my-app:latest

# Deploy with docker-compose
docker-compose up -d
```

### Docker Compose
```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "80:80"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
    
  # Optional: Add monitoring
  prometheus:
    image: prom/prometheus:latest
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    ports:
      - "9090:9090"
```

---

## 7. Environment Variables

### Managing Secrets
```bash
# Development (.env.local - not committed)
VITE_API_URL=http://localhost:3000
VITE_ENABLE_DEBUG=true

# Staging (.env.staging)
VITE_API_URL=https://staging-api.example.com
VITE_SENTRY_DSN=https://...@sentry.io/...
VITE_APP_ENV=staging

# Production (.env.production)
VITE_API_URL=https://api.example.com
VITE_SENTRY_DSN=https://...@sentry.io/...
VITE_APP_ENV=production
```

### Secure Variable Injection
```js
// config.js - Runtime configuration
export const config = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  sentryDsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.VITE_APP_ENV || 'development',
  version: import.meta.env.VITE_APP_VERSION || 'dev',
  
  // Feature flags
  features: {
    enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
    enableDebug: import.meta.env.VITE_ENABLE_DEBUG === 'true',
  },
};

// Validate required variables in production
if (config.environment === 'production') {
  const required = ['apiUrl', 'sentryDsn'];
  const missing = required.filter(key => !config[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required env variables: ${missing.join(', ')}`);
  }
}
```

---

## 8. Zero-Downtime Deployment

### Blue-Green Deployment
```bash
#!/bin/bash
# blue-green-deploy.sh

BLUE_CONTAINER="app-blue"
GREEN_CONTAINER="app-green"
ACTIVE_CONTAINER=$(docker ps --filter "name=app-active" --format "{{.Names}}")

# Determine which environment is currently active
if [ "$ACTIVE_CONTAINER" == "$BLUE_CONTAINER" ]; then
  NEW_CONTAINER=$GREEN_CONTAINER
  OLD_CONTAINER=$BLUE_CONTAINER
else
  NEW_CONTAINER=$BLUE_CONTAINER
  OLD_CONTAINER=$GREEN_CONTAINER
fi

echo "Deploying to $NEW_CONTAINER..."

# Build and start new container
docker build -t my-app:latest .
docker run -d --name $NEW_CONTAINER -p 8080:80 my-app:latest

# Wait for health check
echo "Waiting for health check..."
sleep 10

# Health check
if curl -f http://localhost:8080/health; then
  echo "Health check passed"
  
  # Switch traffic
  docker rm -f app-active || true
  docker rename $NEW_CONTAINER app-active
  
  # Stop old container
  docker stop $OLD_CONTAINER || true
  docker rm $OLD_CONTAINER || true
  
  echo "Deployment successful!"
else
  echo "Health check failed. Rolling back..."
  docker stop $NEW_CONTAINER
  docker rm $NEW_CONTAINER
  exit 1
fi
```

### Rolling Updates (Kubernetes)
```yaml
# kubernetes-deployment.yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: my-app
  template:
    metadata:
      labels:
        app: my-app
    spec:
      containers:
      - name: my-app
        image: myregistry/my-app:latest
        ports:
        - containerPort: 80
        livenessProbe:
          httpGet:
            path: /health
            port: 80
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 80
          initialDelaySeconds: 5
          periodSeconds: 5
```

---

## 9. Rollback Procedures

### Quick Rollback Script
```bash
#!/bin/bash
# rollback.sh

VERSION=${1:-previous}

echo "Rolling back to version: $VERSION"

# Option 1: Docker
docker pull myregistry/my-app:$VERSION
docker stop my-app
docker rm my-app
docker run -d --name my-app -p 80:80 myregistry/my-app:$VERSION

# Option 2: Git + Redeploy
# git checkout $VERSION
# npm ci
# npm run build
# ./deploy.sh

# Option 3: S3/CloudFront
# aws s3 sync s3://backup-bucket/$VERSION/ s3://my-app-bucket/ --delete
# aws cloudfront create-invalidation --distribution-id $DIST_ID --paths "/*"

echo "Rollback complete!"
```

### Automated Rollback (GitHub Actions)
```yaml
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
          
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18
          
      - name: Install and build
        run: |
          npm ci
          npm run build
          
      - name: Deploy
        run: ./deploy.sh
        env:
          DEPLOY_TOKEN: ${{ secrets.DEPLOY_TOKEN }}
          
      - name: Notify
        uses: 8398a7/action-slack@v3
        with:
          status: custom
          custom_payload: |
            {
              text: "Rolled back to version ${{ github.event.inputs.version }}"
            }
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

---

## 10. Health Checks

### Health Check Endpoint
```js
// public/health.json
{
  "status": "ok",
  "version": "1.0.0",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### Advanced Health Check
```js
// src/health.js
export async function checkHealth() {
  const checks = {
    api: await checkAPI(),
    storage: await checkStorage(),
    dependencies: await checkDependencies(),
  };
  
  const isHealthy = Object.values(checks).every(c => c.status === 'ok');
  
  return {
    status: isHealthy ? 'ok' : 'degraded',
    checks,
    timestamp: new Date().toISOString(),
    version: import.meta.env.VITE_APP_VERSION,
  };
}

async function checkAPI() {
  try {
    const response = await fetch('/api/health');
    return { status: response.ok ? 'ok' : 'error' };
  } catch (error) {
    return { status: 'error', message: error.message };
  }
}
```

---

## 11. Monitoring Post-Deployment

### Deployment Verification Checklist
```bash
#!/bin/bash
# verify-deployment.sh

echo "Verifying deployment..."

# Check HTTP status
STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://example.com)
if [ $STATUS -eq 200 ]; then
  echo "✓ Site is accessible"
else
  echo "✗ Site returned status: $STATUS"
  exit 1
fi

# Check version
VERSION=$(curl -s https://example.com/health | jq -r '.version')
echo "✓ Deployed version: $VERSION"

# Check critical pages
PAGES=("/" "/login" "/dashboard")
for page in "${PAGES[@]}"; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://example.com$page")
  if [ $STATUS -eq 200 ]; then
    echo "✓ $page is accessible"
  else
    echo "✗ $page returned status: $STATUS"
  fi
done

# Check for JavaScript errors
if curl -s https://example.com | grep -q "console.error"; then
  echo "✗ JavaScript errors detected"
  exit 1
else
  echo "✓ No JavaScript errors"
fi

echo "Deployment verification complete!"
```

### Sentry Release Tracking
```bash
# Create Sentry release
npx @sentry/cli releases new "$VERSION"
npx @sentry/cli releases set-commits "$VERSION" --auto
npx @sentry/cli releases finalize "$VERSION"

# Associate with deployment
npx @sentry/cli releases deploys "$VERSION" new -e production
```

---

## 12. CDN Configuration

### CloudFlare Setup
```js
// cloudflare-workers.js
export default {
  async fetch(request) {
    const url = new URL(request.url);
    
    // Security headers
    const headers = new Headers({
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
    });
    
    // Cache rules
    if (url.pathname.startsWith('/assets/')) {
      headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    }
    
    const response = await fetch(request);
    return new Response(response.body, {
      status: response.status,
      headers: { ...response.headers, ...headers },
    });
  },
};
```

---

## 13. Best Practices

### ✅ DO
- Test deployments in staging first
- Use environment-specific configs
- Implement health checks
- Monitor post-deployment
- Keep rollback procedures ready
- Use immutable deployments
- Version your releases
- Automate deployment process
- Set up alerts for failures
- Document deployment process
- Use CDN for static assets
- Enable compression
- Implement proper caching
- Use SSL/HTTPS
- Monitor bundle size

### ❌ DON'T
- Deploy directly to production without testing
- Commit secrets to repository
- Deploy on Fridays (unless necessary)
- Skip health checks
- Forget to invalidate CDN cache
- Deploy without backups
- Use FTP for deployments
- Mix development and production configs
- Deploy breaking changes without migration plan
- Ignore deployment failures

---

## 14. Troubleshooting

### Common Issues

**White Screen After Deployment**
```bash
# Check browser console for errors
# Likely causes:
# - Incorrect base URL in vite.config.js
# - Missing environment variables
# - Failed asset loading

# Fix: Ensure correct base path
# vite.config.js
export default defineConfig({
  base: '/app/', // If deployed to subdirectory
});
```

**404 on Page Refresh**
```bash
# SPA routing not configured on server
# Solution: Configure server to serve index.html for all routes
# See nginx.conf example above
```

**Assets Not Loading**
```bash
# Check CORS headers
# Verify CDN configuration
# Check network tab in DevTools
```

---

## Resources

- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [Vercel Documentation](https://vercel.com/docs)
- [Netlify Documentation](https://docs.netlify.com/)
- [AWS S3 Static Hosting](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html)
- [Docker Documentation](https://docs.docker.com/)