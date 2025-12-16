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

    // Read page content directly from filesystem
    let content;
    try {
      content = await Deno.readTextFile(`pages/${page_slug}.js`);
    } catch (e) {
      try {
        content = await Deno.readTextFile(`pages/${page_slug}.jsx`);
      } catch (e2) {
        return Response.json({ error: `Page file not found: ${page_slug}` }, { status: 404 });
      }
    }

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

Analyze up to 20 most important text blocks only.`,
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
              },
              required: ["key", "content_type", "current_text", "location", "field_type"]
            }
          }
        },
        required: ["page_name", "editable_blocks"]
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