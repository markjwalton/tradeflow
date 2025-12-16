import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  const requestStartTime = Date.now();
  console.log('🔥 [BACKEND] Function invoked at', new Date().toISOString());
  
  try {
    console.log('🔐 [BACKEND] Authenticating user...');
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      console.error('❌ [BACKEND] Unauthorized - no user');
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.log('✅ [BACKEND] User authenticated:', user.email);

    console.log('📥 [BACKEND] Parsing request body...');
    const { page_slug, page_content } = await req.json();
    console.log('📥 [BACKEND] Received payload:', {
      page_slug,
      has_content: !!page_content,
      content_length: page_content?.length || 0
    });
    
    if (!page_slug) {
      console.error('❌ [BACKEND] Missing page_slug');
      return Response.json({ error: 'page_slug required' }, { status: 400 });
    }

    let content = page_content;

    // If content not provided, try to read from UIPage entity
    if (!content) {
      console.log('📦 [BACKEND] No content provided, fetching from database...');
      const pages = await base44.asServiceRole.entities.UIPage.filter({ 
        page_name: page_slug 
      });

      console.log('📦 [BACKEND] Database query result:', pages.length, 'pages found');

      if (pages.length === 0) {
        console.error('❌ [BACKEND] Page not found in database');
        return Response.json({ 
          error: `Page "${page_slug}" not found. Please provide page_content in the request.`
        }, { status: 404 });
      }

      content = pages[0].current_content_jsx;
      if (!content) {
        console.error('❌ [BACKEND] Page exists but has no content');
        return Response.json({ 
          error: `No content found for page: ${page_slug}`
        }, { status: 404 });
      }
      console.log('✅ [BACKEND] Content fetched from database:', content.length, 'chars');
    } else {
      console.log('✅ [BACKEND] Using provided content:', content.length, 'chars');
    }

    // Use AI to analyze the page and extract editable text blocks
    console.log('🤖 [BACKEND] Calling LLM to analyze page...');
    const llmStartTime = Date.now();
    
    const prompt = `Analyze this React page component and identify all text content that should be editable in a CMS.

Page content:
${content}

For each editable text block, provide:
1. A unique key (kebab-case identifier)
2. The content type (heading, subheading, body, cta, caption, etc.)
3. The current text content
4. The location context (e.g., "hero section", "feature card 1", "footer")
5. Suggested field type (text, textarea, rich-text)

Analyze up to 20 most important text blocks only.`;

    console.log('🤖 [BACKEND] Prompt length:', prompt.length, 'chars');
    
    const analysis = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
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
    
    const llmDuration = Date.now() - llmStartTime;
    console.log('✅ [BACKEND] LLM response received in', llmDuration, 'ms');
    console.log('📊 [BACKEND] Analysis result:', {
      page_name: analysis.page_name,
      blocks_found: analysis.editable_blocks?.length || 0
    });
    
    const totalDuration = Date.now() - requestStartTime;
    console.log('🎯 [BACKEND] Total request time:', totalDuration, 'ms');

    const result = {
      page_slug,
      analysis: analysis,
      total_blocks: analysis.editable_blocks?.length || 0,
      timing: {
        total_ms: totalDuration,
        llm_ms: llmDuration
      }
    };
    
    console.log('✅ [BACKEND] Returning result:', result);
    return Response.json(result);

  } catch (error) {
    console.error('Analysis error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});