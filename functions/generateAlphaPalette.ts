import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { paletteId, alphaPercentage = 50 } = await req.json();
    
    if (!paletteId) {
      return Response.json({ error: 'paletteId is required' }, { status: 400 });
    }

    // Get the original palette
    const palettes = await base44.asServiceRole.entities.ColorPalette.filter({ id: paletteId });
    
    if (palettes.length === 0) {
      return Response.json({ error: 'Palette not found' }, { status: 404 });
    }

    const originalPalette = palettes[0];
    const alpha = alphaPercentage / 100;

    // Create alpha variants
    const alphaColors = originalPalette.colors.map(color => ({
      ...color,
      name: `${color.name}-alpha-${alphaPercentage}`,
      oklch: color.oklch ? color.oklch.replace(')', ` / ${alpha})`) : `oklch(0.5 0.1 180 / ${alpha})`,
      alpha: alpha
    }));

    // Create the alpha palette
    const alphaPalette = {
      tenant_id: originalPalette.tenant_id,
      name: `${originalPalette.name} (${alphaPercentage}% Alpha)`,
      description: `${alphaPercentage}% transparency variants for ${originalPalette.name}`,
      category: originalPalette.category,
      colors: alphaColors,
      tags: [...(originalPalette.tags || []), 'alpha', `alpha-${alphaPercentage}`],
      parent_palette_id: originalPalette.id,
      is_alpha_variant: true,
      alpha_percentage: alphaPercentage,
      palette_group_id: originalPalette.palette_group_id || originalPalette.id
    };

    const created = await base44.asServiceRole.entities.ColorPalette.create(alphaPalette);

    return Response.json({ 
      success: true, 
      palette: created,
      message: 'Alpha palette created successfully'
    });

  } catch (error) {
    console.error('Error generating alpha palette:', error);
    return Response.json({ 
      error: error.message || 'Failed to generate alpha palette' 
    }, { status: 500 });
  }
});