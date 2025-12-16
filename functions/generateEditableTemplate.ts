import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { page_slug, editable_blocks, website_folder_id } = await req.json();
    
    if (!page_slug || !editable_blocks) {
      return Response.json({ error: 'page_slug and editable_blocks required' }, { status: 400 });
    }

    // Read original page content using backend function
    const readResult = await base44.asServiceRole.functions.invoke('readFileContent', {
      file_path: `pages/${page_slug}.js`
    });

    if (!readResult.data.success) {
      return Response.json({ error: readResult.data.error || 'Failed to read page file' }, { status: 404 });
    }

    const content = readResult.data.content;

    // Generate modified page with editable areas
    const modifyPrompt = `Transform this React page to use editable content blocks from props.

Original page:
${content}

Editable blocks to integrate:
${JSON.stringify(editable_blocks, null, 2)}

Requirements:
1. Add a pageContent prop to the component
2. Replace hardcoded text with pageContent lookups like: pageContent?.hero_title || "Default text"
3. Keep all styling, components, and structure intact
4. Only modify text content, not functional code
5. Add a comment at the top explaining the editable content structure

Return the complete modified page code.`;

    const modifiedPage = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: modifyPrompt
    });

    // Create CMSPage template entry
    const template = await base44.asServiceRole.entities.CMSPage.create({
      website_folder_id: website_folder_id || null,
      tenant_id: user.tenant_id || null,
      title: `${page_slug} Template`,
      slug: page_slug.toLowerCase().replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase(),
      content: JSON.stringify({
        editable_blocks,
        page_slug,
        modified_code: modifiedPage
      }),
      status: 'draft',
      is_template: true,
      custom_fields: {
        original_page: page_slug,
        blocks_count: editable_blocks.length
      }
    });

    return Response.json({
      success: true,
      template_id: template.id,
      modified_code: modifiedPage,
      editable_blocks: editable_blocks
    });

  } catch (error) {
    console.error('Generation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});