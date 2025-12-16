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

    // Read UIPage from database to get the current page content
    const pageSlug = filePath.replace('pages/', '').replace('.js', '').replace('.jsx', '');
    
    const pages = await base44.asServiceRole.entities.UIPage.filter({ 
      page_name: pageSlug 
    });

    if (pages.length === 0) {
      return Response.json({ 
        success: false,
        error: `Page not found: ${pageSlug}`
      }, { status: 404 });
    }

    const page = pages[0];
    const content = page.current_content_jsx;

    if (!content) {
      return Response.json({ 
        success: false,
        error: `No content found for page: ${pageSlug}`
      }, { status: 404 });
    }

    return Response.json({ 
      success: true,
      content: content,
      page_name: page.page_name,
      slug: pageSlug
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});