import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Try to get config_type from request body, default to app_pages_source
    let config_type = "app_pages_source";
    try {
      const body = await req.json();
      config_type = body.config_type || config_type;
    } catch (e) {
      // No body or invalid JSON, use default
    }
    
    // Get the NavigationConfig to read existing source_slugs
    const configs = await base44.asServiceRole.entities.NavigationConfig.filter({ 
      config_type 
    });

    const existingSlugs = configs[0]?.source_slugs || [];
    
    return Response.json({ 
      pages: existingSlugs.sort(),
      count: existingSlugs.length 
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});