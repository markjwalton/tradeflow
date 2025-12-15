import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { contentType, contentId, changeSummary } = await req.json();

    if (!contentType || !contentId) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const entityMap = {
      page: 'CMSPage',
      blog: 'CMSBlogPost',
      product: 'CMSProduct',
      section: 'CMSSection',
    };

    const entityName = entityMap[contentType];
    if (!entityName) {
      return Response.json({ error: 'Invalid content type' }, { status: 400 });
    }

    // Get current content
    const content = await base44.asServiceRole.entities[entityName].filter({ id: contentId });
    if (content.length === 0) {
      return Response.json({ error: 'Content not found' }, { status: 404 });
    }

    // Get existing versions to determine next version number
    const existingVersions = await base44.asServiceRole.entities.ContentVersion.filter({
      content_type: contentType,
      content_id: contentId,
    });

    const nextVersion = existingVersions.length + 1;

    // Create new version
    const version = await base44.asServiceRole.entities.ContentVersion.create({
      content_type: contentType,
      content_id: contentId,
      version_number: nextVersion,
      content_snapshot: JSON.stringify(content[0]),
      change_summary: changeSummary || `Version ${nextVersion}`,
      published: false,
    });

    return Response.json({ 
      success: true, 
      version,
      message: `Version ${nextVersion} created`
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});