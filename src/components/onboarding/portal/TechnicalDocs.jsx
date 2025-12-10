import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileCode, Database, Layout, Zap, ExternalLink } from "lucide-react";
import { createPageUrl } from "@/utils";

export default function TechnicalDocs({ sessionId }) {
  return (
    <div className="space-y-6">
      <Card className="rounded-xl bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/10">
        <CardContent className="pt-6 pb-6">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <FileCode className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-display text-primary mb-1">Technical Documentation</h3>
              <p className="text-sm text-muted-foreground">Review your application's architecture, specifications, and implementation details</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        <Card className="rounded-xl hover:border-primary/30 transition-colors">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Database className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">System Architecture & Specifications</CardTitle>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <a href={createPageUrl("OnboardingSpecifications") + `?session=${sessionId}`} target="_blank">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Complete technical specifications including entities, pages, features, and integrations
            </p>
            <div className="flex gap-2 flex-wrap">
              <Badge variant="outline"><Database className="h-3 w-3 mr-1" />Entities</Badge>
              <Badge variant="outline"><Layout className="h-3 w-3 mr-1" />Pages</Badge>
              <Badge variant="outline"><Zap className="h-3 w-3 mr-1" />Features</Badge>
              <Badge variant="outline"><FileCode className="h-3 w-3 mr-1" />Integrations</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl">
          <CardHeader>
            <CardTitle className="text-base">Development Plan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Implementation Phases</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Badge>Phase 1</Badge>
                  <span className="text-muted-foreground">Data models and entities</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Badge>Phase 2</Badge>
                  <span className="text-muted-foreground">Core pages and navigation</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Badge>Phase 3</Badge>
                  <span className="text-muted-foreground">Business logic and workflows</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Badge>Phase 4</Badge>
                  <span className="text-muted-foreground">External integrations</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Badge>Phase 5</Badge>
                  <span className="text-muted-foreground">Testing and deployment</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl">
          <CardHeader>
            <CardTitle className="text-base">Technical Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <p>Database indexing on frequently queried fields for optimal performance</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <p>Implement caching strategies for read-heavy operations</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <p>Use optimistic updates for better user experience</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <p>Progressive Web App (PWA) support for mobile users</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <p>Automated backups and disaster recovery procedures</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}