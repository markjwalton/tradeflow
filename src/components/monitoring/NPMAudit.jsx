import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  AlertTriangle, CheckCircle2, Info, XCircle, 
  Shield, Package, Terminal, ExternalLink 
} from "lucide-react";

/**
 * NPM Security Audit Guide and Workflow
 * Provides instructions for running npm audit and fixing vulnerabilities
 */
export default function NPMAudit() {
  const [activeTab, setActiveTab] = useState("overview");

  const auditCommands = {
    check: "npm audit",
    fix: "npm audit fix",
    forcefix: "npm audit fix --force",
    report: "npm audit --json > audit-report.json",
  };

  const vulnerabilitySeverity = [
    { 
      level: "Critical", 
      color: "destructive", 
      icon: XCircle,
      description: "Immediate action required. High risk of exploitation.",
      action: "Update or replace package immediately"
    },
    { 
      level: "High", 
      color: "warning", 
      icon: AlertTriangle,
      description: "Should be fixed as soon as possible.",
      action: "Schedule update within 1 week"
    },
    { 
      level: "Moderate", 
      color: "info", 
      icon: Info,
      description: "Should be addressed in next maintenance cycle.",
      action: "Include in next sprint"
    },
    { 
      level: "Low", 
      color: "muted", 
      icon: Info,
      description: "Minor security concern. Can be addressed when convenient.",
      action: "Track in backlog"
    },
  ];

  const bestPractices = [
    {
      title: "Regular Audits",
      description: "Run npm audit weekly as part of your maintenance routine",
      command: "npm audit",
    },
    {
      title: "Automated CI Checks",
      description: "Add audit checks to your CI/CD pipeline",
      command: "npm audit --audit-level=high",
    },
    {
      title: "Dependency Review",
      description: "Review dependencies before adding new packages",
      command: "npm view <package> security",
    },
    {
      title: "Update Strategy",
      description: "Keep dependencies reasonably up-to-date",
      command: "npm outdated",
    },
  ];

  const githubActionsWorkflow = `name: Security Audit

on:
  schedule:
    - cron: '0 0 * * 1' # Weekly on Monday
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  audit:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run npm audit
      run: npm audit --audit-level=high
      continue-on-error: true
    
    - name: Generate audit report
      if: always()
      run: npm audit --json > audit-report.json
    
    - name: Upload audit report
      if: always()
      uses: actions/upload-artifact@v3
      with:
        name: npm-audit-report
        path: audit-report.json`;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-light font-display mb-2">NPM Security Audit</h2>
        <p className="text-muted-foreground">
          Monitor and fix security vulnerabilities in dependencies
        </p>
      </div>

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Regular security audits help identify and fix vulnerabilities before they can be exploited.
          Run <code className="bg-muted px-1 rounded">npm audit</code> weekly to stay secure.
        </AlertDescription>
      </Alert>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="commands">Commands</TabsTrigger>
          <TabsTrigger value="workflow">CI/CD</TabsTrigger>
          <TabsTrigger value="practices">Best Practices</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Vulnerability Severity Levels</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {vulnerabilitySeverity.map((severity) => (
                <div key={severity.level} className="border-b pb-4 last:border-0">
                  <div className="flex items-start gap-3">
                    <severity.icon className={`h-5 w-5 mt-0.5 text-${severity.color}`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{severity.level}</h4>
                        <Badge variant="outline" className={`text-${severity.color}`}>
                          {severity.level}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {severity.description}
                      </p>
                      <p className="text-xs font-medium text-primary">
                        → {severity.action}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Start</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <p className="text-sm font-medium">1. Check for vulnerabilities</p>
                <div className="bg-muted p-3 rounded-lg font-mono text-sm">
                  npm audit
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">2. Auto-fix when possible</p>
                <div className="bg-muted p-3 rounded-lg font-mono text-sm">
                  npm audit fix
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">3. Review remaining issues</p>
                <p className="text-xs text-muted-foreground">
                  Some vulnerabilities may require manual updates or package replacements
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="commands" className="space-y-4">
          <div className="grid gap-4">
            {Object.entries(auditCommands).map(([key, command]) => (
              <Card key={key}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Terminal className="h-4 w-4 text-muted-foreground" />
                        <code className="font-mono text-sm bg-muted px-2 py-1 rounded">
                          {command}
                        </code>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {key === 'check' && 'Show all vulnerabilities in dependencies'}
                        {key === 'fix' && 'Automatically fix vulnerabilities when possible'}
                        {key === 'forcefix' && 'Force fix (may introduce breaking changes)'}
                        {key === 'report' && 'Generate JSON report for CI/CD integration'}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(command);
                      }}
                    >
                      Copy
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Advanced Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <code className="bg-muted px-2 py-1 rounded font-mono text-xs">
                  npm audit --audit-level=moderate
                </code>
                <p className="text-muted-foreground mt-1">
                  Only show moderate severity and above
                </p>
              </div>
              <div>
                <code className="bg-muted px-2 py-1 rounded font-mono text-xs">
                  npm audit --production
                </code>
                <p className="text-muted-foreground mt-1">
                  Only check production dependencies
                </p>
              </div>
              <div>
                <code className="bg-muted px-2 py-1 rounded font-mono text-xs">
                  npm audit signatures
                </code>
                <p className="text-muted-foreground mt-1">
                  Verify package signatures for supply chain security
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workflow" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>GitHub Actions Workflow</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(githubActionsWorkflow);
                  }}
                >
                  Copy
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
                {githubActionsWorkflow}
              </pre>
              <p className="text-xs text-muted-foreground mt-3">
                Save as <code>.github/workflows/security-audit.yml</code>
              </p>
            </CardContent>
          </Card>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              This workflow runs weekly and on every push/PR. Audit reports are uploaded as artifacts
              for review. Failed audits won't block deployments but will create alerts.
            </AlertDescription>
          </Alert>
        </TabsContent>

        <TabsContent value="practices" className="space-y-4">
          <div className="grid gap-4">
            {bestPractices.map((practice, idx) => (
              <Card key={idx}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-success mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-medium mb-1">{practice.title}</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        {practice.description}
                      </p>
                      <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                        {practice.command}
                      </code>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Additional Resources</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <a
                href="https://docs.npmjs.com/cli/v9/commands/npm-audit"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <ExternalLink className="h-4 w-4" />
                NPM Audit Documentation
              </a>
              <a
                href="https://github.com/advisories"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <ExternalLink className="h-4 w-4" />
                GitHub Security Advisories
              </a>
              <a
                href="https://snyk.io/advisor"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <ExternalLink className="h-4 w-4" />
                Snyk Package Health Scores
              </a>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}