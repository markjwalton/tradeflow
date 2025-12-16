import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Query UIPage entity to get all pages
    const uiPages = await base44.asServiceRole.entities.UIPage.list();
    
    // Extract slugs from UIPage records
    const pages = uiPages
      .filter(page => page.slug)
      .map(page => page.slug)
      .sort();

    return Response.json({ 
      pages,
      count: pages.length 
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});