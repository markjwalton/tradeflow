import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sourceWebsiteFolderId, targetWebsiteFolderId, assetIds, copyMode } = await req.json();

    if (!sourceWebsiteFolderId || !targetWebsiteFolderId) {
      return Response.json({ error: 'Missing source or target website folder' }, { status: 400 });
    }

    const filter = assetIds?.length 
      ? { website_folder_id: sourceWebsiteFolderId, id: { $in: assetIds } }
      : { website_folder_id: sourceWebsiteFolderId };

    const sourceAssets = await base44.asServiceRole.entities.WebsiteAsset.filter(filter);

    const migratedAssets = [];
    
    for (const asset of sourceAssets) {
      const newAsset = await base44.asServiceRole.entities.WebsiteAsset.create({
        website_folder_id: targetWebsiteFolderId,
        file_name: asset.file_name,
        file_path: asset.file_path,
        file_url: asset.file_url,
        file_type: asset.file_type,
        file_size: asset.file_size,
        mime_type: asset.mime_type,
        tags: asset.tags,
      });
      
      migratedAssets.push(newAsset);
      
      if (copyMode !== 'copy' && asset.id) {
        await base44.asServiceRole.entities.WebsiteAsset.delete(asset.id);
      }
    }

    return Response.json({ 
      success: true, 
      migrated: migratedAssets.length,
      mode: copyMode === 'copy' ? 'copied' : 'moved',
      message: `${copyMode === 'copy' ? 'Copied' : 'Moved'} ${migratedAssets.length} assets`
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});