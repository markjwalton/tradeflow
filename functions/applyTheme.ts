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

    // Get the palette
    const palettes = await base44.asServiceRole.entities.ColorPalette.filter({ id: paletteId });
    
    if (palettes.length === 0) {
      return Response.json({ error: 'Palette not found' }, { status: 404 });
    }

    const palette = palettes[0];

    // Generate CSS variables from the palette
    let cssVariables = `:root {\n`;
    
    palette.colors.forEach(color => {
      const varName = color.name.toLowerCase().replace(/\s+/g, '-');
      cssVariables += `  --color-${varName}: ${color.hex};\n`;
      if (color.oklch) {
        cssVariables += `  --color-${varName}-oklch: ${color.oklch};\n`;
      }
      
      // If it's a brand color system with types and shades
      if (color.color_type && color.shade) {
        cssVariables += `  --${color.color_type}-${color.shade}: ${color.hex};\n`;
      }
    });
    
    cssVariables += `}\n`;

    // Store the theme in user preferences
    await base44.auth.updateMe({
      active_theme: {
        palette_id: paletteId,
        palette_name: palette.name,
        css_variables: cssVariables,
        applied_date: new Date().toISOString()
      }
    });

    return Response.json({ 
      success: true, 
      css: cssVariables,
      message: 'Theme applied successfully'
    });

  } catch (error) {
    console.error('Error applying theme:', error);
    return Response.json({ 
      error: error.message || 'Failed to apply theme' 
    }, { status: 500 });
  }
});