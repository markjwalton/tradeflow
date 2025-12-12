import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Shield, Copy, CheckCircle2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

/**
 * Content Security Policy Configuration Guide
 * Provides CSP header recommendations for production deployment
 */
export default function CSPConfig() {
  const cspDirectives = {
    "default-src": ["'self'"],
    "script-src": [
      "'self'",
      "'unsafe-inline'", // Required for React inline scripts
      "https://cdn.jsdelivr.net", // If using CDN libraries
      "https://use.typekit.net", // Adobe Fonts
    ],
    "style-src": [
      "'self'",
      "'unsafe-inline'", // Required for CSS-in-JS
      "https://use.typekit.net",
    ],
    "img-src": [
      "'self'",
      "data:",
      "blob:",
      "https:", // Allow external images
    ],
    "font-src": [
      "'self'",
      "data:",
      "https://use.typekit.net",
    ],
    "connect-src": [
      "'self'",
      "https://api.base44.com", // Base44 API
      "https://*.sentry.io", // Sentry error tracking
    ],
    "frame-src": ["'self'"],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
    "frame-ancestors": ["'self'"],
    "upgrade-insecure-requests": [],
  };

  const generateCSPHeader = () => {
    return Object.entries(cspDirectives)
      .map(([directive, values]) => {
        if (values.length === 0) return directive;
        return `${directive} ${values.join(" ")}`;
      })
      .join("; ");
  };

  const cspHeader = generateCSPHeader();

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const nginxConfig = `# Nginx Configuration
add_header Content-Security-Policy "${cspHeader}" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;`;

  const apacheConfig = `# Apache Configuration (.htaccess)
Header always set Content-Security-Policy "${cspHeader}"
Header always set X-Content-Type-Options "nosniff"
Header always set X-Frame-Options "SAMEORIGIN"
Header always set X-XSS-Protection "1; mode=block"
Header always set Referrer-Policy "strict-origin-when-cross-origin"
Header always set Permissions-Policy "geolocation=(), microphone=(), camera=()"`;

  const netlifyConfig = `# Netlify (_headers file)
/*
  Content-Security-Policy: ${cspHeader}
  X-Content-Type-Options: nosniff
  X-Frame-Options: SAMEORIGIN
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: geolocation=(), microphone=(), camera=()`;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-light font-display mb-2">Content Security Policy</h2>
        <p className="text-muted-foreground">
          Security headers configuration for production deployment
        </p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          These headers should be configured on your web server or hosting platform. 
          They protect against XSS, clickjacking, and other security vulnerabilities.
        </AlertDescription>
      </Alert>

      {/* CSP Directives */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            CSP Directives
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Object.entries(cspDirectives).map(([directive, values]) => (
            <div key={directive} className="border-b pb-3 last:border-0">
              <div className="flex items-center gap-2 mb-2">
                <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                  {directive}
                </code>
                <Badge variant="outline" className="text-xs">
                  {values.length === 0 ? 'flag' : `${values.length} sources`}
                </Badge>
              </div>
              {values.length > 0 && (
                <div className="flex flex-wrap gap-2 ml-1">
                  {values.map((value, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs font-mono">
                      {value}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Full CSP Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Complete CSP Header</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(cspHeader)}
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
            {cspHeader}
          </pre>
        </CardContent>
      </Card>

      {/* Server Configurations */}
      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Nginx Configuration</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(nginxConfig)}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
              {nginxConfig}
            </pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Apache Configuration</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(apacheConfig)}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
              {apacheConfig}
            </pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Netlify/Vercel Configuration</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(netlifyConfig)}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
              {netlifyConfig}
            </pre>
            <p className="text-xs text-muted-foreground mt-2">
              Save as <code>_headers</code> file in your public directory
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Testing Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Testing Your Headers
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <p className="font-medium mb-1">1. Browser DevTools</p>
            <p className="text-muted-foreground">
              Open DevTools → Network tab → Select any request → Headers tab → 
              Look for "Response Headers"
            </p>
          </div>
          <div>
            <p className="font-medium mb-1">2. Online Tools</p>
            <p className="text-muted-foreground">
              Use <a href="https://securityheaders.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">securityheaders.com</a> to scan your domain
            </p>
          </div>
          <div>
            <p className="font-medium mb-1">3. cURL Command</p>
            <pre className="bg-muted p-2 rounded text-xs mt-1">
              curl -I https://yourdomain.com
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}