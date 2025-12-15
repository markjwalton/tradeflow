import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { packageId, targetWebsiteFolderId, targetTenantId } = await req.json();

    if (!packageId || !targetWebsiteFolderId) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const pkg = await base44.asServiceRole.entities.CMSPackage.filter({ id: packageId });
    if (pkg.length === 0) {
      return Response.json({ error: 'Package not found' }, { status: 404 });
    }

    const packageData = JSON.parse(pkg[0].content_snapshot);
    const results = {
      pages: 0,
      blogs: 0,
      products: 0,
      sections: 0,
      templates: 0,
      theme: false,
      navigation: 0,
    };

    // Import pages
    for (const page of packageData.pages || []) {
      await base44.asServiceRole.entities.CMSPage.create({
        ...page,
        website_folder_id: targetWebsiteFolderId,
        tenant_id: targetTenantId || null,
      });
      results.pages++;
    }

    // Import blog posts
    for (const blog of packageData.blogPosts || []) {
      await base44.asServiceRole.entities.CMSBlogPost.create({
        ...blog,
        website_folder_id: targetWebsiteFolderId,
        tenant_id: targetTenantId || null,
      });
      results.blogs++;
    }

    // Import products
    for (const product of packageData.products || []) {
      await base44.asServiceRole.entities.CMSProduct.create({
        ...product,
        website_folder_id: targetWebsiteFolderId,
        tenant_id: targetTenantId || null,
      });
      results.products++;
    }

    // Import sections
    for (const section of packageData.sections || []) {
      await base44.asServiceRole.entities.CMSSection.create({
        ...section,
        website_folder_id: targetWebsiteFolderId,
        tenant_id: targetTenantId || null,
      });
      results.sections++;
    }

    // Import templates
    for (const template of packageData.templates || []) {
      await base44.asServiceRole.entities.ContentTemplate.create({
        ...template,
        tenant_id: targetTenantId || null,
      });
      results.templates++;
    }

    // Import theme
    if (packageData.theme) {
      await base44.asServiceRole.entities.WebsiteTheme.create({
        ...packageData.theme,
        website_folder_id: targetWebsiteFolderId,
        is_active: false,
      });
      results.theme = true;
    }

    // Import navigation
    for (const nav of packageData.navigation || []) {
      await base44.asServiceRole.entities.CMSNavigation.create({
        ...nav,
        website_folder_id: targetWebsiteFolderId,
      });
      results.navigation++;
    }

    return Response.json({ 
      success: true, 
      results,
      message: 'Package imported successfully'
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});