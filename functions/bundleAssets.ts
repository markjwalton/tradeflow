import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sourceWebsiteFolderId, assetIds } = await req.json();

    if (!sourceWebsiteFolderId) {
      return Response.json({ error: 'Missing website folder ID' }, { status: 400 });
    }

    const filter = assetIds?.length 
      ? { website_folder_id: sourceWebsiteFolderId, id: { $in: assetIds } }
      : { website_folder_id: sourceWebsiteFolderId };

    const assets = await base44.asServiceRole.entities.WebsiteAsset.filter(filter);

    const bundle = {
      created_date: new Date().toISOString(),
      source_website_folder_id: sourceWebsiteFolderId,
      total_assets: assets.length,
      total_size: assets.reduce((sum, a) => sum + (a.file_size || 0), 0),
      assets: assets.map(asset => ({
        file_name: asset.file_name,
        file_path: asset.file_path,
        file_url: asset.file_url,
        file_type: asset.file_type,
        file_size: asset.file_size,
        mime_type: asset.mime_type,
        tags: asset.tags,
      })),
    };

    return Response.json({ 
      success: true, 
      bundle,
      message: `Bundled ${assets.length} assets`
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});