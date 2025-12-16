import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { page_slug } = await req.json();
    if (!page_slug) {
      return Response.json({ error: 'page_slug required' }, { status: 400 });
    }

    // Read page content using backend function
    const readResult = await base44.asServiceRole.functions.invoke('readFileContent', {
      file_path: `pages/${page_slug}.js`
    });

    if (!readResult.data.success) {
      return Response.json({ error: readResult.data.error || 'Failed to read page file' }, { status: 404 });
    }

    const content = readResult.data.content;

    // Use AI to analyze the page and extract editable text blocks
    const analysis = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Analyze this React page component and identify all text content that should be editable in a CMS.

Page content:
${content}

For each editable text block, provide:
1. A unique key (kebab-case identifier)
2. The content type (heading, subheading, body, cta, caption, etc.)
3. The current text content
4. The location context (e.g., "hero section", "feature card 1", "footer")
5. Suggested field type (text, textarea, rich-text)

Return a JSON array of editable blocks.`,
      response_json_schema: {
        type: "object",
        properties: {
          page_name: { type: "string" },
          editable_blocks: {
            type: "array",
            items: {
              type: "object",
              properties: {
                key: { type: "string" },
                content_type: { type: "string" },
                current_text: { type: "string" },
                location: { type: "string" },
                field_type: { type: "string" },
                char_count: { type: "number" }
              }
            }
          }
        }
      }
    });

    return Response.json({
      page_slug,
      analysis: analysis,
      total_blocks: analysis.editable_blocks?.length || 0
    });

  } catch (error) {
    console.error('Analysis error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});