import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DebugShell() {
  const [checks, setChecks] = useState({});
  const [loading, setLoading] = useState(true);
  const [cssVars, setCssVars] = useState({});

  const runChecks = async () => {
    setLoading(true);
    const results = {};

    // Check 1: User authentication
    try {
      const user = await base44.auth.me();
      results.auth = { status: 'ok', data: { email: user.email, role: user.role } };
    } catch (e) {
      results.auth = { status: 'error', error: e.message };
    }

    // Check 2: Navigation config
    try {
      const navConfigs = await base44.entities.NavigationConfig.filter({ config_type: 'admin_console' });
      results.navConfig = { 
        status: navConfigs.length > 0 ? 'ok' : 'warning', 
        data: { count: navConfigs.length, items: navConfigs[0]?.items?.length || 0 } 
      };
    } catch (e) {
      results.navConfig = { status: 'error', error: e.message };
    }

    // Check 3: CSS Variables loading
    const root = document.documentElement;
    const computedStyle = getComputedStyle(root);
    const testVars = {
      '--color-primary': computedStyle.getPropertyValue('--color-primary'),
      '--color-background': computedStyle.getPropertyValue('--color-background'),
      '--color-card': computedStyle.getPropertyValue('--color-card'),
      '--text-primary': computedStyle.getPropertyValue('--text-primary'),
      '--primary-500': computedStyle.getPropertyValue('--primary-500'),
      '--font-family-display': computedStyle.getPropertyValue('--font-family-display'),
      '--radius-xl': computedStyle.getPropertyValue('--radius-xl'),
      '--shadow-sm': computedStyle.getPropertyValue('--shadow-sm'),
    };
    
    const loadedVars = Object.entries(testVars).filter(([k, v]) => v && v.trim() !== '');
    results.cssVars = { 
      status: loadedVars.length === Object.keys(testVars).length ? 'ok' : 
              loadedVars.length > 0 ? 'warning' : 'error',
      data: { loaded: loadedVars.length, total: Object.keys(testVars).length }
    };
    setCssVars(testVars);

    // Check 4: Sturij components available
    try {
      const { PageHeader } = await import('@/components/sturij');
      results.sturijComponents = { status: PageHeader ? 'ok' : 'error', data: { PageHeader: !!PageHeader } };
    } catch (e) {
      results.sturijComponents = { status: 'error', error: e.message };
    }

    // Check 5: TailwindAppShell available
    try {
      const { TailwindAppShell } = await import('@/components/layout/TailwindAppShell');
      results.appShell = { status: TailwindAppShell ? 'ok' : 'error', data: { loaded: !!TailwindAppShell } };
    } catch (e) {
      results.appShell = { status: 'error', error: e.message };
    }

    // Check 6: UI Card component
    try {
      const { Card } = await import('@/components/ui/card');
      results.uiCard = { status: Card ? 'ok' : 'error', data: { loaded: !!Card } };
    } catch (e) {
      results.uiCard = { status: 'error', error: e.message };
    }

    setChecks(results);
    setLoading(false);
  };

  useEffect(() => {
    runChecks();
  }, []);

  const StatusIcon = ({ status }) => {
    if (status === 'ok') return <CheckCircle className="h-5 w-5 text-green-500" />;
    if (status === 'warning') return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    return <XCircle className="h-5 w-5 text-red-500" />;
  };

  const StatusBadge = ({ status }) => {
    const colors = {
      ok: 'bg-green-100 text-green-800',
      warning: 'bg-yellow-100 text-yellow-800',
      error: 'bg-red-100 text-red-800',
    };
    return <Badge className={colors[status] || colors.error}>{status?.toUpperCase()}</Badge>;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary, #1a1a1a)' }}>
            🔧 Shell Debug Page
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted, #666)' }}>
            Checking what's loading and what isn't
          </p>
        </div>
        <Button onClick={runChecks} disabled={loading} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <>
          {/* System Checks */}
          <Card>
            <CardHeader>
              <CardTitle>System Checks</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(checks).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <StatusIcon status={value.status} />
                    <div>
                      <p className="font-medium">{key}</p>
                      {value.error && <p className="text-sm text-red-600">{value.error}</p>}
                      {value.data && (
                        <p className="text-sm text-gray-500">
                          {JSON.stringify(value.data)}
                        </p>
                      )}
                    </div>
                  </div>
                  <StatusBadge status={value.status} />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* CSS Variables */}
          <Card>
            <CardHeader>
              <CardTitle>CSS Variables (from globals.css)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(cssVars).map(([varName, value]) => (
                  <div key={varName} className="flex items-center justify-between p-2 border rounded text-sm">
                    <code className="text-xs">{varName}</code>
                    <div className="flex items-center gap-2">
                      {value?.trim() ? (
                        <>
                          <span className="text-xs truncate max-w-[150px]" title={value}>
                            {value.slice(0, 30)}...
                          </span>
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        </>
                      ) : (
                        <>
                          <span className="text-red-500 text-xs">NOT LOADED</span>
                          <XCircle className="h-4 w-4 text-red-500" />
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Visual Test */}
          <Card>
            <CardHeader>
              <CardTitle>Visual Token Test</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div 
                  className="p-4 rounded-lg text-center"
                  style={{ backgroundColor: 'var(--primary-500)', color: 'white' }}
                >
                  primary-500
                </div>
                <div 
                  className="p-4 rounded-lg text-center"
                  style={{ backgroundColor: 'var(--secondary-400)', color: 'white' }}
                >
                  secondary-400
                </div>
                <div 
                  className="p-4 rounded-lg text-center"
                  style={{ backgroundColor: 'var(--accent-300)', color: 'var(--midnight-900)' }}
                >
                  accent-300
                </div>
                <div 
                  className="p-4 rounded-lg text-center border"
                  style={{ backgroundColor: 'var(--color-card)', color: 'var(--text-primary)' }}
                >
                  card bg
                </div>
              </div>

              <div className="p-4 border rounded-lg space-y-2">
                <p style={{ fontFamily: 'var(--font-family-display)', fontSize: 'var(--text-xl)' }}>
                  Display Font Test (Degular Display)
                </p>
                <p style={{ fontFamily: 'var(--font-family-body)', fontSize: 'var(--text-base)' }}>
                  Body Font Test (Mrs Eaves XL Serif Narrow)
                </p>
                <code style={{ fontFamily: 'var(--font-family-mono)', fontSize: 'var(--text-sm)' }}>
                  Mono Font Test (Source Code Pro)
                </code>
              </div>

              <div className="flex gap-4">
                <div 
                  className="p-4 text-center"
                  style={{ 
                    backgroundColor: 'var(--color-card)', 
                    boxShadow: 'var(--shadow-sm)',
                    borderRadius: 'var(--radius-lg)'
                  }}
                >
                  shadow-sm + radius-lg
                </div>
                <div 
                  className="p-4 text-center"
                  style={{ 
                    backgroundColor: 'var(--color-card)', 
                    boxShadow: 'var(--shadow-md)',
                    borderRadius: 'var(--radius-xl)'
                  }}
                >
                  shadow-md + radius-xl
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Page Context */}
          <Card>
            <CardHeader>
              <CardTitle>Page Context</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto">
{`URL: ${window.location.href}
Pathname: ${window.location.pathname}
Search: ${window.location.search}
Dark Mode: ${document.documentElement.classList.contains('dark')}
Document Classes: ${document.documentElement.className}
`}
              </pre>
            </CardContent>
          </Card>

          {/* Stylesheets Loaded */}
          <Card>
            <CardHeader>
              <CardTitle>Loaded Stylesheets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-xs">
                {Array.from(document.styleSheets).map((sheet, i) => (
                  <div key={i} className="p-2 bg-gray-50 rounded border">
                    <p><strong>#{i}:</strong> {sheet.href || '(inline/embedded)'}</p>
                    <p className="text-gray-500">Rules: {(() => { try { return sheet.cssRules?.length || 0; } catch { return 'CORS blocked'; } })()}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Raw CSS Check */}
          <Card>
            <CardHeader>
              <CardTitle>Raw :root CSS Check</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm">Checking if :root has any custom properties defined:</p>
                <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto max-h-48">
                  {(() => {
                    const root = document.documentElement;
                    const style = getComputedStyle(root);
                    // Try to get ALL custom properties
                    const allProps = [];
                    for (let i = 0; i < style.length; i++) {
                      const prop = style[i];
                      if (prop.startsWith('--')) {
                        allProps.push(`${prop}: ${style.getPropertyValue(prop).slice(0, 50)}`);
                      }
                    }
                    return allProps.length > 0 
                      ? `Found ${allProps.length} CSS vars:\n${allProps.slice(0, 20).join('\n')}${allProps.length > 20 ? '\n... and more' : ''}`
                      : 'NO CSS VARIABLES FOUND ON :root';
                  })()}
                </pre>
              </div>
            </CardContent>
          </Card>

          {/* Direct Style Test */}
          <Card>
            <CardHeader>
              <CardTitle>Direct Tailwind Class Test</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm">These use Tailwind classes directly (not CSS vars):</p>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-primary text-primary-foreground p-3 rounded text-center text-sm">
                  bg-primary
                </div>
                <div className="bg-secondary text-secondary-foreground p-3 rounded text-center text-sm">
                  bg-secondary
                </div>
                <div className="bg-muted text-muted-foreground p-3 rounded text-center text-sm">
                  bg-muted
                </div>
                <div className="bg-card border p-3 rounded text-center text-sm">
                  bg-card
                </div>
                <div className="bg-destructive text-destructive-foreground p-3 rounded text-center text-sm">
                  bg-destructive
                </div>
                <div className="bg-accent text-accent-foreground p-3 rounded text-center text-sm">
                  bg-accent
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CRITICAL: CSS var() inline test */}
          <Card>
            <CardHeader>
              <CardTitle>🔴 Inline var() Test (THE REAL TEST)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm font-bold">If these boxes have NO color, the CSS vars aren't in :root</p>
              <div className="grid grid-cols-4 gap-2">
                <div style={{ backgroundColor: 'var(--primary-500)', color: '#fff' }} className="p-3 rounded text-center text-xs">
                  --primary-500
                </div>
                <div style={{ backgroundColor: 'var(--secondary-400)', color: '#fff' }} className="p-3 rounded text-center text-xs">
                  --secondary-400
                </div>
                <div style={{ backgroundColor: 'var(--accent-300)', color: '#000' }} className="p-3 rounded text-center text-xs">
                  --accent-300
                </div>
                <div style={{ backgroundColor: 'var(--midnight-900)', color: '#fff' }} className="p-3 rounded text-center text-xs">
                  --midnight-900
                </div>
              </div>
              <p className="text-sm font-bold mt-4">Fallback test (should ALWAYS show color):</p>
              <div className="grid grid-cols-4 gap-2">
                <div style={{ backgroundColor: 'var(--primary-500, #4a7c6b)', color: '#fff' }} className="p-3 rounded text-center text-xs">
                  with fallback
                </div>
                <div style={{ backgroundColor: '#4a7c6b', color: '#fff' }} className="p-3 rounded text-center text-xs">
                  hardcoded hex
                </div>
                <div style={{ backgroundColor: 'oklch(0.398 0.037 159.8)', color: '#fff' }} className="p-3 rounded text-center text-xs">
                  raw oklch
                </div>
                <div className="bg-primary-500 text-white p-3 rounded text-center text-xs">
                  TW class
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}