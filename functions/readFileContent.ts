import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await req.json();
    const filePath = payload.file_path || payload.filePath;

    if (!filePath) {
      return Response.json({ error: 'File path required' }, { status: 400 });
    }

    // Try to read from UIPage entity first, then fallback to actual file
    const pageSlug = filePath.replace('pages/', '').replace('.js', '').replace('.jsx', '');
    
    // First attempt: Check UIPage entity
    const pages = await base44.asServiceRole.entities.UIPage.filter({ 
      page_name: pageSlug 
    });

    if (pages.length > 0 && pages[0].current_content_jsx) {
      return Response.json({ 
        success: true,
        content: pages[0].current_content_jsx,
        page_name: pages[0].page_name,
        slug: pageSlug,
        source: 'database'
      });
    }

    // Second attempt: Read from actual file system
    try {
      const fileContent = await Deno.readTextFile(filePath);
      return Response.json({ 
        success: true,
        content: fileContent,
        slug: pageSlug,
        source: 'filesystem'
      });
    } catch (fileError) {
      return Response.json({ 
        success: false,
        error: `Page not found in database or filesystem: ${pageSlug}`,
        details: fileError.message
      }, { status: 404 });
    }

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});