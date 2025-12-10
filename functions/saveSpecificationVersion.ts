import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId, changesSummary } = await req.json();

    if (!sessionId) {
      return Response.json({ error: 'sessionId is required' }, { status: 400 });
    }

    // Mark all previous versions as not current
    const existingVersions = await base44.asServiceRole.entities.AppSpecificationVersion.filter({
      onboarding_session_id: sessionId
    });

    for (const version of existingVersions) {
      await base44.asServiceRole.entities.AppSpecificationVersion.update(version.id, {
        is_current: false
      });
    }

    // Fetch current specifications
    const [entities, pages, features, integrations] = await Promise.all([
      base44.asServiceRole.entities.EntitySchema.filter({ onboarding_session_id: sessionId }),
      base44.asServiceRole.entities.PageSchema.filter({ onboarding_session_id: sessionId }),
      base44.asServiceRole.entities.FeatureSchema.filter({ onboarding_session_id: sessionId }),
      base44.asServiceRole.entities.IntegrationSchema.filter({ onboarding_session_id: sessionId })
    ]);

    // Calculate new version number
    const versionParts = existingVersions.length > 0 
      ? existingVersions[0].version.split('.').map(Number)
      : [0, 0, 0];
    
    // Increment minor version
    versionParts[1] += 1;
    const newVersion = versionParts.join('.');

    // Create new version
    const versionRecord = await base44.asServiceRole.entities.AppSpecificationVersion.create({
      onboarding_session_id: sessionId,
      version: newVersion,
      snapshot_data: {
        entities,
        pages,
        features,
        integrations
      },
      changes_summary: changesSummary || "Specification update",
      created_by_name: user.full_name,
      is_current: true
    });

    return Response.json({
      success: true,
      version: newVersion,
      counts: {
        entities: entities.length,
        pages: pages.length,
        features: features.length,
        integrations: integrations.length
      }
    });

  } catch (error) {
    console.error('Save version error:', error);
    return Response.json({ 
      error: 'Failed to save specification version',
      details: error.message 
    }, { status: 500 });
  }
});