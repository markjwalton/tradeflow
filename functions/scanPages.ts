import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Read all files in the pages directory
    const pages = [];
    try {
      for await (const entry of Deno.readDir('./pages')) {
        if (entry.isFile && (entry.name.endsWith('.js') || entry.name.endsWith('.jsx'))) {
          // Remove .js or .jsx extension to get page name
          const pageName = entry.name.replace(/\.(js|jsx)$/, '');
          pages.push(pageName);
        }
      }
    } catch (e) {
      return Response.json({ 
        error: 'Failed to read pages directory', 
        details: e.message 
      }, { status: 500 });
    }

    return Response.json({ 
      pages: pages.sort(),
      count: pages.length 
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});