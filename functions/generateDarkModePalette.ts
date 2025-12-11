import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { paletteId } = await req.json();
    
    if (!paletteId) {
      return Response.json({ error: 'paletteId is required' }, { status: 400 });
    }

    // Get the original palette
    const palettes = await base44.asServiceRole.entities.ColorPalette.filter({ id: paletteId });
    
    if (palettes.length === 0) {
      return Response.json({ error: 'Palette not found' }, { status: 404 });
    }

    const originalPalette = palettes[0];

    // Use AI to generate dark mode variations
    const prompt = `Given this light mode color palette, generate a dark mode alternative that maintains visual harmony and accessibility.

Original Palette: ${originalPalette.name}
Colors:
${originalPalette.colors.map(c => `- ${c.name} (${c.color_type || 'custom'}): ${c.hex} ${c.oklch || ''}`).join('\n')}

Guidelines:
- For backgrounds: Use darker tones (lower lightness in OKLCH)
- For text/foreground: Use lighter tones for contrast
- Maintain the same hue and chroma relationships
- Ensure WCAG AA accessibility standards
- Primary colors should remain recognizable but adapted for dark backgrounds
- Generate OKLCH values for each color

Return a JSON object with a "colors" array containing objects with: name, hex, oklch, color_type, and shade properties.`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          colors: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                hex: { type: "string" },
                oklch: { type: "string" },
                color_type: { type: "string" },
                shade: { type: "string" }
              }
            }
          }
        }
      }
    });

    // Create the dark mode palette
    const darkModePalette = {
      tenant_id: originalPalette.tenant_id,
      name: `${originalPalette.name} (Dark Mode)`,
      description: `Dark mode alternative for ${originalPalette.name}`,
      category: originalPalette.category,
      colors: result.colors || [],
      tags: [...(originalPalette.tags || []), 'dark-mode'],
      parent_palette_id: originalPalette.id,
      is_dark_mode_alternative: true,
      palette_group_id: originalPalette.palette_group_id || originalPalette.id
    };

    const created = await base44.asServiceRole.entities.ColorPalette.create(darkModePalette);

    return Response.json({ 
      success: true, 
      palette: created,
      message: 'Dark mode palette created successfully'
    });

  } catch (error) {
    console.error('Error generating dark mode palette:', error);
    return Response.json({ 
      error: error.message || 'Failed to generate dark mode palette' 
    }, { status: 500 });
  }
});