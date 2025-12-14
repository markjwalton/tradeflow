import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const projectId = Deno.env.get("ADOBE_FONTS_PROJECT_ID");
    const apiToken = Deno.env.get("ADOBE_FONTS_API_TOKEN");

    if (!projectId || !apiToken) {
      return Response.json({ 
        error: 'Adobe Fonts credentials not configured',
        details: 'Please set ADOBE_FONTS_PROJECT_ID and ADOBE_FONTS_API_TOKEN in secrets'
      }, { status: 500 });
    }

    // Fetch Adobe Fonts project details
    const response = await fetch(
      `https://typekit.com/api/v1/json/kits/${projectId}/published`,
      {
        headers: {
          'X-Typekit-Token': apiToken
        }
      }
    );

    if (!response.ok) {
      return Response.json({ 
        error: 'Failed to fetch Adobe Fonts',
        status: response.status,
        statusText: response.statusText
      }, { status: response.status });
    }

    const data = await response.json();
    
    // Transform Adobe Fonts data to our FontFamily format
    const fonts = data.kit.families.map(family => ({
      name: family.name,
      font_family: `"${family.css_names[0]}", ${family.css_stack}`,
      source: 'adobe',
      url: `https://use.typekit.net/${projectId}.css`,
      category: family.variations ? 
        (family.variations.some(v => v.includes('display')) ? 'display' : 'body') : 
        'body',
      weights: family.variations.map(v => {
        const match = v.match(/n(\d)/);
        return match ? parseInt(match[1]) * 100 : 400;
      }).filter((v, i, arr) => arr.indexOf(v) === i).sort((a, b) => a - b),
      preview_text: "The quick brown fox jumps over the lazy dog",
      is_active: false
    }));

    return Response.json({ 
      success: true,
      fonts,
      project_id: projectId,
      total_fonts: fonts.length
    });

  } catch (error) {
    return Response.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
});