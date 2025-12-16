import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Scan local pages directory
    const pagesDir = './pages';
    const pages = [];

    try {
      for await (const entry of Deno.readDir(pagesDir)) {
        if (entry.isFile && (entry.name.endsWith('.js') || entry.name.endsWith('.jsx'))) {
          const pageName = entry.name.replace(/\.(js|jsx)$/, '');
          pages.push(pageName);
        }
      }
    } catch (error) {
      return Response.json({ 
        error: 'Failed to read pages directory', 
        details: error.message 
      }, { status: 500 });
    }

    pages.sort();

    return Response.json({ 
      pages,
      count: pages.length 
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});