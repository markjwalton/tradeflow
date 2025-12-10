import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

export default function AnalysisView({ session, onGenerateAnalysis, isGenerating }) {
  const { high_level_summary, proposed_architecture, development_plan, technical_recommendations } = session;

  return (
    <div className="space-y-6">
      {/* High-Level Summary */}
      <Card className="rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Business Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          {high_level_summary ? (
            <div className="prose prose-sm max-w-none">
              <p className="whitespace-pre-wrap">{high_level_summary}</p>
            </div>
          ) : (
            <div className="text-center py-8">
              <Button
                onClick={onGenerateAnalysis}
                disabled={isGenerating}
                className="bg-primary hover:bg-primary/90"
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                Generate Analysis
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Proposed Architecture */}
      {proposed_architecture && (
        <Card className="rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-success" />
              Proposed Solution Architecture
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {proposed_architecture.entities && (
                <div>
                  <h3 className="font-semibold mb-2">Core Entities</h3>
                  <div className="flex flex-wrap gap-2">
                    {proposed_architecture.entities.map((entity, idx) => (
                      <Badge key={idx} variant="outline">{entity}</Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {proposed_architecture.pages && (
                <div>
                  <h3 className="font-semibold mb-2">Primary Pages</h3>
                  <div className="flex flex-wrap gap-2">
                    {proposed_architecture.pages.map((page, idx) => (
                      <Badge key={idx} variant="outline" className="bg-primary/10">{page}</Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {proposed_architecture.integrations && (
                <div>
                  <h3 className="font-semibold mb-2">Integrations</h3>
                  <div className="flex flex-wrap gap-2">
                    {proposed_architecture.integrations.map((integration, idx) => (
                      <Badge key={idx} variant="outline" className="bg-secondary/10">{integration}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Development Plan */}
      {development_plan && (
        <Card className="rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-warning" />
              Development Roadmap
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <p className="whitespace-pre-wrap">{development_plan}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Technical Recommendations */}
      {technical_recommendations && (
        <Card className="rounded-xl">
          <CardHeader>
            <CardTitle>Technical & Security Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <p className="whitespace-pre-wrap">{technical_recommendations}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}