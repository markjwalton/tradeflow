import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId } = await req.json();
    
    if (!sessionId) {
      return Response.json({ error: 'sessionId required' }, { status: 400 });
    }

    // Fetch session and related data
    const sessions = await base44.asServiceRole.entities.OnboardingSession.filter({ id: sessionId });
    if (sessions.length === 0) {
      return Response.json({ error: 'Session not found' }, { status: 404 });
    }
    const session = sessions[0];

    const tenantProfiles = await base44.asServiceRole.entities.TenantProfile.filter({ 
      tenant_id: session.tenant_id 
    });
    const tenantProfile = tenantProfiles[0] || null;

    const businessProfiles = await base44.asServiceRole.entities.BusinessProfile.filter({ 
      onboarding_session_id: sessionId 
    });
    const businessProfile = businessProfiles[0] || null;

    const processes = await base44.asServiceRole.entities.OperationalProcess.filter({ 
      onboarding_session_id: sessionId 
    });

    const requirements = await base44.asServiceRole.entities.Requirement.filter({ 
      onboarding_session_id: sessionId 
    });

    // Build context for LLM
    const context = {
      session: {
        summary: session.high_level_summary || '',
        requirements: session.single_source_of_truth || '',
        status: session.status
      },
      tenantProfile: tenantProfile ? {
        companyName: tenantProfile.company_name,
        industry: businessProfile?.industry || '',
        businessSize: businessProfile?.business_size || '',
        goals: tenantProfile.app_goals || [],
        kpis: tenantProfile.kpis || []
      } : null,
      processes: processes.map(p => ({
        name: p.process_name,
        type: p.process_type,
        priority: p.priority,
        painPoints: p.pain_points || [],
        desiredOutcomes: p.desired_outcomes || [],
        monthlyVolume: p.monthly_volume || 0
      })),
      requirements: requirements.map(r => ({
        type: r.requirement_type,
        title: r.title,
        description: r.description,
        priority: r.priority,
        userStory: r.user_story || ''
      }))
    };

    // Define LLM response schema
    const responseSchema = {
      type: "object",
      properties: {
        entities: {
          type: "array",
          items: {
            type: "object",
            properties: {
              entity_name: { type: "string" },
              description: { type: "string" },
              fields: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    type: { type: "string" },
                    required: { type: "boolean" },
                    description: { type: "string" },
                    enum: { type: "array", items: { type: "string" } },
                    default: { type: "string" }
                  }
                }
              },
              relationships: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    target_entity: { type: "string" },
                    relationship_type: { type: "string" },
                    foreign_key: { type: "string" }
                  }
                }
              },
              priority: { type: "number" }
            }
          }
        },
        pages: {
          type: "array",
          items: {
            type: "object",
            properties: {
              page_name: { type: "string" },
              page_type: { type: "string" },
              description: { type: "string" },
              primary_entity: { type: "string" },
              data_sources: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    entity: { type: "string" },
                    filters: { type: "object" },
                    sort: { type: "string" }
                  }
                }
              },
              actions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    type: { type: "string" },
                    target: { type: "string" }
                  }
                }
              },
              priority: { type: "number" }
            }
          }
        },
        features: {
          type: "array",
          items: {
            type: "object",
            properties: {
              feature_name: { type: "string" },
              description: { type: "string" },
              user_stories: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    role: { type: "string" },
                    want: { type: "string" },
                    so_that: { type: "string" }
                  }
                }
              },
              workflow: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    step: { type: "number" },
                    action: { type: "string" },
                    trigger: { type: "string" },
                    result: { type: "string" }
                  }
                }
              },
              entities_involved: { type: "array", items: { type: "string" } },
              pages_involved: { type: "array", items: { type: "string" } },
              business_rules: { type: "array", items: { type: "string" } },
              priority: { type: "string" }
            }
          }
        },
        integrations: {
          type: "array",
          items: {
            type: "object",
            properties: {
              integration_name: { type: "string" },
              integration_type: { type: "string" },
              description: { type: "string" },
              provider: { type: "string" },
              endpoints: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    method: { type: "string" },
                    path: { type: "string" },
                    purpose: { type: "string" }
                  }
                }
              },
              authentication: {
                type: "object",
                properties: {
                  type: { type: "string" },
                  credentials_needed: { type: "array", items: { type: "string" } }
                }
              },
              priority: { type: "number" }
            }
          }
        }
      }
    };

    // Call LLM
    const prompt = `You are a system architect generating a complete application architecture based on business requirements.

Context:
${JSON.stringify(context, null, 2)}

Generate a comprehensive system architecture including:
1. **Entities**: Database models with fields, types, and relationships
2. **Pages**: UI pages with their purpose, data sources, and actions
3. **Features**: Complete features with user stories, workflows, and business rules
4. **Integrations**: External API integrations needed

Guidelines:
- Design normalized, scalable data models
- Create intuitive page flows
- Define clear feature workflows
- Identify necessary third-party integrations
- Prioritize by business value

Return a JSON object matching the schema provided.`;

    const llmResponse = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: responseSchema
    });

    // Create entity schemas
    const entitySchemas = [];
    for (const entity of llmResponse.entities || []) {
      const created = await base44.asServiceRole.entities.EntitySchema.create({
        onboarding_session_id: sessionId,
        entity_name: entity.entity_name,
        description: entity.description,
        fields: entity.fields,
        relationships: entity.relationships || [],
        priority: entity.priority || 999
      });
      entitySchemas.push(created);
    }

    // Create page schemas
    const pageSchemas = [];
    for (const page of llmResponse.pages || []) {
      const created = await base44.asServiceRole.entities.PageSchema.create({
        onboarding_session_id: sessionId,
        page_name: page.page_name,
        page_type: page.page_type,
        description: page.description,
        primary_entity: page.primary_entity || '',
        data_sources: page.data_sources || [],
        actions: page.actions || [],
        priority: page.priority || 999
      });
      pageSchemas.push(created);
    }

    // Create feature schemas
    const featureSchemas = [];
    for (const feature of llmResponse.features || []) {
      const created = await base44.asServiceRole.entities.FeatureSchema.create({
        onboarding_session_id: sessionId,
        feature_name: feature.feature_name,
        description: feature.description,
        user_stories: feature.user_stories || [],
        workflow: feature.workflow || [],
        entities_involved: feature.entities_involved || [],
        pages_involved: feature.pages_involved || [],
        business_rules: feature.business_rules || [],
        priority: feature.priority || 'should_have'
      });
      featureSchemas.push(created);
    }

    // Create integration schemas
    const integrationSchemas = [];
    for (const integration of llmResponse.integrations || []) {
      const created = await base44.asServiceRole.entities.IntegrationSchema.create({
        onboarding_session_id: sessionId,
        integration_name: integration.integration_name,
        integration_type: integration.integration_type,
        description: integration.description,
        provider: integration.provider || '',
        endpoints: integration.endpoints || [],
        authentication: integration.authentication || {},
        priority: integration.priority || 999
      });
      integrationSchemas.push(created);
    }

    return Response.json({
      success: true,
      counts: {
        entities: entitySchemas.length,
        pages: pageSchemas.length,
        features: featureSchemas.length,
        integrations: integrationSchemas.length
      },
      data: {
        entities: entitySchemas,
        pages: pageSchemas,
        features: featureSchemas,
        integrations: integrationSchemas
      }
    });

  } catch (error) {
    console.error("Generate architecture error:", error);
    return Response.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
});