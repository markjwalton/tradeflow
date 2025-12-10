import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  const startTime = Date.now();
  
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId, buildEntities, buildPages, buildFeatures, buildIntegrations } = await req.json();

    if (!sessionId) {
      return Response.json({ error: 'sessionId is required' }, { status: 400 });
    }

    // Generate build number
    const existingBuilds = await base44.asServiceRole.entities.AppBuildVersion.filter({
      onboarding_session_id: sessionId
    });
    const buildNumber = `build-${String(existingBuilds.length + 1).padStart(3, '0')}`;

    // Create build record
    const buildRecord = await base44.asServiceRole.entities.AppBuildVersion.create({
      onboarding_session_id: sessionId,
      build_number: buildNumber,
      build_options: { buildEntities, buildPages, buildFeatures, buildIntegrations },
      status: "building"
    });

    const results = {
      entities: [],
      pages: [],
      features: [],
      integrations: [],
      errors: []
    };

    // Build Entities
    if (buildEntities) {
      const entitySchemas = await base44.asServiceRole.entities.EntitySchema.filter({ 
        onboarding_session_id: sessionId 
      });

      for (const schema of entitySchemas) {
        try {
          const entityJson = {
            name: schema.entity_name,
            type: "object",
            properties: {},
            required: []
          };

          // Build properties from fields
          for (const field of schema.fields || []) {
            entityJson.properties[field.name] = {
              type: field.type
            };
            
            if (field.description) {
              entityJson.properties[field.name].description = field.description;
            }
            
            if (field.enum) {
              entityJson.properties[field.name].enum = field.enum;
            }
            
            if (field.default !== undefined) {
              entityJson.properties[field.name].default = field.default;
            }

            if (field.required) {
              entityJson.required.push(field.name);
            }
          }

          // Create the entity file
          await base44.asServiceRole.functions.invoke('updateFileContent', {
            filePath: `entities/${schema.entity_name}.json`,
            content: JSON.stringify(entityJson, null, 2)
          });

          results.entities.push(schema.entity_name);
        } catch (error) {
          results.errors.push({
            type: 'entity',
            name: schema.entity_name,
            error: error.message
          });
        }
      }
    }

    // Build Pages
    if (buildPages) {
      const pageSchemas = await base44.asServiceRole.entities.PageSchema.filter({ 
        onboarding_session_id: sessionId 
      });

      for (const schema of pageSchemas) {
        try {
          // Use LLM to generate page component
          const prompt = `Generate a React page component based on this specification:

Page Name: ${schema.page_name}
Page Type: ${schema.page_type}
Description: ${schema.description}
Primary Entity: ${schema.primary_entity || 'None'}
Data Sources: ${JSON.stringify(schema.data_sources || [], null, 2)}
Actions: ${JSON.stringify(schema.actions || [], null, 2)}

Generate a complete, production-ready React component that:
1. Uses @tanstack/react-query for data fetching
2. Uses base44.entities API for CRUD operations
3. Uses shadcn/ui components (Card, Button, Badge, etc.)
4. Implements all specified actions
5. Has responsive design with Tailwind CSS
6. Follows the page type pattern (${schema.page_type})

Export default the component. Use modern React patterns (hooks, functional components).`;

          const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
            prompt,
            response_json_schema: {
              type: "object",
              properties: {
                code: { type: "string" }
              }
            }
          });

          // Create the page file
          await base44.asServiceRole.functions.invoke('updateFileContent', {
            filePath: `pages/${schema.page_name}.js`,
            content: result.code
          });

          results.pages.push(schema.page_name);
        } catch (error) {
          results.errors.push({
            type: 'page',
            name: schema.page_name,
            error: error.message
          });
        }
      }
    }

    // Build Features (as documentation or helper components)
    if (buildFeatures) {
      const featureSchemas = await base44.asServiceRole.entities.FeatureSchema.filter({ 
        onboarding_session_id: sessionId 
      });

      for (const schema of featureSchemas) {
        try {
          // Generate feature implementation guide
          const prompt = `Generate implementation documentation for this feature:

Feature: ${schema.feature_name}
Description: ${schema.description}

User Stories:
${schema.user_stories?.map(s => `- As a ${s.role}, I want ${s.want} so that ${s.so_that}`).join('\n') || ''}

Workflow:
${schema.workflow?.map(w => `Step ${w.step}: ${w.action} (triggered by: ${w.trigger}) → ${w.result}`).join('\n') || ''}

Entities Involved: ${schema.entities_involved?.join(', ') || 'None'}
Pages Involved: ${schema.pages_involved?.join(', ') || 'None'}

Business Rules:
${schema.business_rules?.map(r => `- ${r}`).join('\n') || ''}

Generate a markdown documentation file with:
1. Feature overview
2. Implementation checklist
3. Code snippets for key workflows
4. Testing scenarios`;

          const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
            prompt,
            response_json_schema: {
              type: "object",
              properties: {
                markdown: { type: "string" }
              }
            }
          });

          // Store as knowledge entry
          await base44.asServiceRole.entities.KnowledgeEntry.create({
            onboarding_session_id: sessionId,
            question: `How to implement ${schema.feature_name}?`,
            answer: result.markdown,
            source: 'ai',
            is_important: true,
            tags: ['feature', 'implementation', schema.feature_name]
          });

          results.features.push(schema.feature_name);
        } catch (error) {
          results.errors.push({
            type: 'feature',
            name: schema.feature_name,
            error: error.message
          });
        }
      }
    }

    // Build Integrations (as backend functions)
    if (buildIntegrations) {
      const integrationSchemas = await base44.asServiceRole.entities.IntegrationSchema.filter({ 
        onboarding_session_id: sessionId 
      });

      for (const schema of integrationSchemas) {
        try {
          // Generate integration function
          const prompt = `Generate a Deno backend function for this integration:

Integration: ${schema.integration_name}
Type: ${schema.integration_type}
Provider: ${schema.provider || 'Custom'}
Description: ${schema.description}

Endpoints:
${schema.endpoints?.map(e => `- ${e.method} ${e.path}: ${e.purpose}`).join('\n') || ''}

Authentication: ${JSON.stringify(schema.authentication || {}, null, 2)}

Generate a complete Deno.serve function that:
1. Uses createClientFromRequest for Base44 auth
2. Validates user authentication
3. Implements the integration logic
4. Handles errors properly
5. Returns appropriate JSON responses
6. Uses fetch for API calls
7. Stores API keys in environment variables`;

          const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
            prompt,
            response_json_schema: {
              type: "object",
              properties: {
                code: { type: "string" }
              }
            }
          });

          // Create the function file
          const functionName = schema.integration_name.replace(/[^a-zA-Z0-9]/g, '');
          await base44.asServiceRole.functions.invoke('updateFileContent', {
            filePath: `functions/${functionName}.js`,
            content: result.code
          });

          results.integrations.push(functionName);
        } catch (error) {
          results.errors.push({
            type: 'integration',
            name: schema.integration_name,
            error: error.message
          });
        }
      }
    }

    // Update build record
    const duration = Date.now() - startTime;
    const finalStatus = results.errors.length === 0 ? "success" : 
                       (results.entities.length + results.pages.length > 0 ? "partial" : "failed");

    await base44.asServiceRole.entities.AppBuildVersion.update(buildRecord.id, {
      build_results: results,
      status: finalStatus,
      build_duration_ms: duration
    });

    return Response.json({
      success: true,
      message: 'Application build completed',
      buildNumber,
      results,
      summary: {
        entities: results.entities.length,
        pages: results.pages.length,
        features: results.features.length,
        integrations: results.integrations.length,
        errors: results.errors.length
      }
    });

  } catch (error) {
    console.error('Build error:', error);
    
    // Try to update build record if it exists
    try {
      const base44 = createClientFromRequest(req);
      const existingBuilds = await base44.asServiceRole.entities.AppBuildVersion.filter({
        onboarding_session_id: sessionId,
        status: "building"
      });
      if (existingBuilds.length > 0) {
        await base44.asServiceRole.entities.AppBuildVersion.update(existingBuilds[0].id, {
          status: "failed",
          build_results: { error: error.message }
        });
      }
    } catch (e) {
      // Ignore
    }
    
    return Response.json({ 
      error: 'Failed to build application',
      details: error.message 
    }, { status: 500 });
  }
});