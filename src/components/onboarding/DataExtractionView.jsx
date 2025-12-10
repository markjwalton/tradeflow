import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Database, CheckCircle, Building2, Workflow, Users, ListChecks } from "lucide-react";
import { toast } from "sonner";

export default function DataExtractionView({ sessionId }) {
  const queryClient = useQueryClient();
  const [isExtracting, setIsExtracting] = useState(false);

  const { data: session } = useQuery({
    queryKey: ["onboardingSession", sessionId],
    queryFn: () => base44.entities.OnboardingSession.filter({ id: sessionId }).then(r => r[0]),
  });

  const { data: businessProfile = [] } = useQuery({
    queryKey: ["businessProfile", sessionId],
    queryFn: () => base44.entities.BusinessProfile.filter({ onboarding_session_id: sessionId }),
  });

  const { data: processes = [] } = useQuery({
    queryKey: ["processes", sessionId],
    queryFn: () => base44.entities.OperationalProcess.filter({ onboarding_session_id: sessionId }),
  });

  const { data: stakeholders = [] } = useQuery({
    queryKey: ["stakeholders", sessionId],
    queryFn: () => base44.entities.Stakeholder.filter({ onboarding_session_id: sessionId }),
  });

  const { data: requirements = [] } = useQuery({
    queryKey: ["requirements", sessionId],
    queryFn: () => base44.entities.Requirement.filter({ onboarding_session_id: sessionId }),
  });

  const extractData = async () => {
    setIsExtracting(true);
    try {
      const conversationContext = session.conversation_history
        ?.map(m => `${m.role}: ${m.content}`)
        .join('\n\n') || '';

      // Extract Business Profile
      const profilePrompt = `Extract business profile information from this conversation:

${conversationContext}

Return JSON with: industry, business_size (solo/small_2_10/medium_11_100/large_100_plus), market_type (B2B/B2C/B2G/mixed), primary_problem, current_tools (array), growth_goals, compliance_requirements (array)`;

      const profileData = await base44.integrations.Core.InvokeLLM({
        prompt: profilePrompt,
        response_json_schema: {
          type: "object",
          properties: {
            industry: { type: "string" },
            business_size: { type: "string" },
            market_type: { type: "string" },
            primary_problem: { type: "string" },
            current_tools: { type: "array", items: { type: "string" } },
            growth_goals: { type: "string" },
            compliance_requirements: { type: "array", items: { type: "string" } }
          }
        }
      });

      await base44.entities.BusinessProfile.create({
        onboarding_session_id: sessionId,
        ...profileData
      });

      // Extract Operational Processes
      const processPrompt = `Identify all operational processes mentioned in this conversation:

${conversationContext}

Return JSON array of processes with: process_name, process_type (from: sales_crm, manufacturing, inventory_supply_chain, project_management, hr_team_management, finance_accounting, procurement, shipping_logistics, marketing, customer_support, quality_control, innovation_rd), priority (1-10), current_workflow, pain_points (array), desired_outcomes (array), monthly_volume, automation_opportunities`;

      const processesData = await base44.integrations.Core.InvokeLLM({
        prompt: processPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            processes: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  process_name: { type: "string" },
                  process_type: { type: "string" },
                  priority: { type: "number" },
                  current_workflow: { type: "string" },
                  pain_points: { type: "array", items: { type: "string" } },
                  desired_outcomes: { type: "array", items: { type: "string" } },
                  monthly_volume: { type: "number" },
                  automation_opportunities: { type: "string" }
                }
              }
            }
          }
        }
      });

      for (const process of processesData.processes || []) {
        await base44.entities.OperationalProcess.create({
          onboarding_session_id: sessionId,
          ...process
        });
      }

      // Extract Stakeholders
      const stakeholderPrompt = `Identify key stakeholders mentioned:

${conversationContext}

Return JSON array with: name, role, responsibilities (array), app_access_needs, mobile_access_required (boolean)`;

      const stakeholdersData = await base44.integrations.Core.InvokeLLM({
        prompt: stakeholderPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            stakeholders: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  role: { type: "string" },
                  responsibilities: { type: "array", items: { type: "string" } },
                  app_access_needs: { type: "string" },
                  mobile_access_required: { type: "boolean" }
                }
              }
            }
          }
        }
      });

      for (const stakeholder of stakeholdersData.stakeholders || []) {
        await base44.entities.Stakeholder.create({
          onboarding_session_id: sessionId,
          ...stakeholder
        });
      }

      // Extract Requirements
      const requirementsPrompt = `Extract all requirements:

${conversationContext}

Return JSON array with: requirement_type (functional/non_functional/integration/data/security/performance), title, description, priority (must_have/should_have/nice_to_have), user_story, acceptance_criteria (array)`;

      const requirementsData = await base44.integrations.Core.InvokeLLM({
        prompt: requirementsPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            requirements: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  requirement_type: { type: "string" },
                  title: { type: "string" },
                  description: { type: "string" },
                  priority: { type: "string" },
                  user_story: { type: "string" },
                  acceptance_criteria: { type: "array", items: { type: "string" } }
                }
              }
            }
          }
        }
      });

      for (const requirement of requirementsData.requirements || []) {
        await base44.entities.Requirement.create({
          onboarding_session_id: sessionId,
          ...requirement
        });
      }

      queryClient.invalidateQueries({ queryKey: ["businessProfile"] });
      queryClient.invalidateQueries({ queryKey: ["processes"] });
      queryClient.invalidateQueries({ queryKey: ["stakeholders"] });
      queryClient.invalidateQueries({ queryKey: ["requirements"] });
      
      toast.success("Data extracted successfully");
    } catch (error) {
      toast.error("Failed to extract data");
      console.error(error);
    } finally {
      setIsExtracting(false);
    }
  };

  const hasData = businessProfile.length > 0 || processes.length > 0;

  return (
    <div className="space-y-6">
      <Card className="rounded-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              Structured Data Extraction
            </CardTitle>
            <Button
              onClick={extractData}
              disabled={isExtracting || hasData}
              size="sm"
              className="bg-primary hover:bg-primary/90"
            >
              {isExtracting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : hasData ? (
                <CheckCircle className="h-4 w-4 mr-2" />
              ) : (
                <Database className="h-4 w-4 mr-2" />
              )}
              {hasData ? "Extracted" : "Extract Data"}
            </Button>
          </div>
        </CardHeader>
        {hasData && (
          <CardContent className="space-y-4">
            {/* Business Profile */}
            {businessProfile.length > 0 && (
              <Card className="border-l-4 border-l-primary">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Business Profile
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="font-semibold">Industry:</span> {businessProfile[0].industry}
                    </div>
                    <div>
                      <span className="font-semibold">Size:</span> {businessProfile[0].business_size?.replace('_', ' ')}
                    </div>
                    <div>
                      <span className="font-semibold">Market:</span> {businessProfile[0].market_type}
                    </div>
                    <div className="col-span-2">
                      <span className="font-semibold">Primary Problem:</span> {businessProfile[0].primary_problem}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Operational Processes */}
            {processes.length > 0 && (
              <Card className="border-l-4 border-l-success">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Workflow className="h-4 w-4" />
                    Operational Processes ({processes.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {processes.map(process => (
                      <div key={process.id} className="p-3 bg-muted rounded-lg">
                        <div className="font-semibold">{process.process_name}</div>
                        <Badge variant="outline" className="mt-1">{process.process_type}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Stakeholders */}
            {stakeholders.length > 0 && (
              <Card className="border-l-4 border-l-secondary">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Stakeholders ({stakeholders.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {stakeholders.map(stakeholder => (
                      <div key={stakeholder.id} className="p-3 bg-muted rounded-lg">
                        <div className="font-semibold">{stakeholder.name}</div>
                        <div className="text-sm text-muted-foreground">{stakeholder.role}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Requirements */}
            {requirements.length > 0 && (
              <Card className="border-l-4 border-l-warning">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ListChecks className="h-4 w-4" />
                    Requirements ({requirements.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {requirements.map(req => (
                      <div key={req.id} className="p-3 bg-muted rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="font-semibold">{req.title}</div>
                          <Badge variant={req.priority === 'must_have' ? 'default' : 'outline'}>
                            {req.priority?.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">{req.description}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
}