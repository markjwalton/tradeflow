import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { paletteId, gradientType = 'linear', angle = 90, selectedColors } = await req.json();
    
    if (!paletteId) {
      return Response.json({ error: 'paletteId is required' }, { status: 400 });
    }

    // Get the original palette
    const palettes = await base44.asServiceRole.entities.ColorPalette.filter({ id: paletteId });
    
    if (palettes.length === 0) {
      return Response.json({ error: 'Palette not found' }, { status: 404 });
    }

    const originalPalette = palettes[0];
    const colorsToUse = selectedColors && selectedColors.length > 0 
      ? originalPalette.colors.filter(c => selectedColors.includes(c.name))
      : originalPalette.colors;

    // Create gradient stops evenly distributed
    const stops = colorsToUse.map((color, index) => {
      const position = (index / (colorsToUse.length - 1)) * 100;
      return {
        position,
        color: color.hex,
        oklch: color.oklch
      };
    });

    // Create the gradient palette
    const gradientPalette = {
      tenant_id: originalPalette.tenant_id,
      name: `${originalPalette.name} Gradient`,
      description: `${gradientType} gradient from ${originalPalette.name}`,
      category: 'gradient',
      gradient: {
        type: gradientType,
        angle: angle,
        stops: stops
      },
      colors: colorsToUse,
      tags: [...(originalPalette.tags || []), 'gradient', gradientType],
      parent_palette_id: originalPalette.id,
      palette_group_id: originalPalette.palette_group_id || originalPalette.id
    };

    const created = await base44.asServiceRole.entities.ColorPalette.create(gradientPalette);

    return Response.json({ 
      success: true, 
      palette: created,
      message: 'Gradient created successfully'
    });

  } catch (error) {
    console.error('Error generating gradient:', error);
    return Response.json({ 
      error: error.message || 'Failed to generate gradient' 
    }, { status: 500 });
  }
});