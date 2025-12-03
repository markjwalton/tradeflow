import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tenant_id } = await req.json();

    if (!tenant_id) {
      return Response.json({ error: 'tenant_id is required' }, { status: 400 });
    }

    // Fetch all published community items
    const communityItems = await base44.asServiceRole.entities.CommunityLibraryItem.filter({
      is_published: true
    });

    // Fetch existing tenant items to avoid duplicates
    const existingTenantItems = await base44.asServiceRole.entities.TenantLibraryItem.filter({
      tenant_id: tenant_id
    });

    const existingCommunityIds = new Set(
      existingTenantItems.map(item => item.community_item_id).filter(Boolean)
    );

    // Create tenant library items for each community item
    const itemsToCreate = [];
    for (const communityItem of communityItems) {
      // Skip if already installed
      if (existingCommunityIds.has(communityItem.id)) {
        continue;
      }

      itemsToCreate.push({
        tenant_id: tenant_id,
        community_item_id: communityItem.id,
        name: communityItem.name,
        description: communityItem.description,
        item_type: communityItem.item_type,
        installed_version: communityItem.version,
        latest_available_version: communityItem.version,
        has_update_available: false,
        is_custom: false,
        is_tenant_created: false,
        local_data: communityItem.current_data,
        original_community_data: communityItem.current_data,
        status: "synced",
        last_synced: new Date().toISOString(),
        category: communityItem.category,
        tags: communityItem.tags
      });
    }

    // Bulk create tenant items
    if (itemsToCreate.length > 0) {
      await base44.asServiceRole.entities.TenantLibraryItem.bulkCreate(itemsToCreate);
    }

    return Response.json({
      success: true,
      items_provisioned: itemsToCreate.length,
      items_skipped: communityItems.length - itemsToCreate.length
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});