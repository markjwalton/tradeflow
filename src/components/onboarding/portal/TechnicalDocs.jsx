import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Download, Database, Layout, Code } from "lucide-react";

export default function TechnicalDocs({ session }) {
  const { proposed_architecture, development_plan, technical_recommendations } = session;

  return (
    <div className="space-y-6">
      <Card className="rounded-xl bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/10">
        <CardContent className="pt-6 pb-6">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-display text-primary mb-1">Technical Documentation</h3>
              <p className="text-sm text-muted-foreground">Access your solution architecture, development roadmap, and technical recommendations</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {proposed_architecture && (
        <Card className="rounded-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Layout className="h-5 w-5" />
                Solution Architecture
              </CardTitle>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {proposed_architecture.entities && (
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Data Entities
                </h3>
                <div className="flex flex-wrap gap-2">
                  {proposed_architecture.entities.map((entity, idx) => (
                    <Badge key={idx} variant="outline">{entity}</Badge>
                  ))}
                </div>
              </div>
            )}
            
            {proposed_architecture.pages && (
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Layout className="h-4 w-4" />
                  Application Pages
                </h3>
                <div className="flex flex-wrap gap-2">
                  {proposed_architecture.pages.map((page, idx) => (
                    <Badge key={idx} variant="outline" className="bg-primary/10">{page}</Badge>
                  ))}
                </div>
              </div>
            )}
            
            {proposed_architecture.integrations && (
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  Integrations
                </h3>
                <div className="flex flex-wrap gap-2">
                  {proposed_architecture.integrations.map((integration, idx) => (
                    <Badge key={idx} variant="outline" className="bg-secondary/10">{integration}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {development_plan && (
        <Card className="rounded-xl">
          <CardHeader>
            <CardTitle className="text-lg">Development Roadmap</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <p className="whitespace-pre-wrap text-muted-foreground">{development_plan}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {technical_recommendations && (
        <Card className="rounded-xl">
          <CardHeader>
            <CardTitle className="text-lg">Technical & Security Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <p className="whitespace-pre-wrap text-muted-foreground">{technical_recommendations}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}