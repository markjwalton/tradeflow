import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { websiteFolderId, packageName, packageType, includeAssets } = await req.json();

    if (!websiteFolderId || !packageName) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const packageData = {
      pages: [],
      blogPosts: [],
      products: [],
      sections: [],
      templates: [],
      theme: null,
      navigation: [],
      assets: [],
    };

    // Fetch all content for this website folder
    const [pages, blogs, products, sections, templates, themes, navigation, assets] = await Promise.all([
      base44.asServiceRole.entities.CMSPage.filter({ website_folder_id: websiteFolderId }),
      base44.asServiceRole.entities.CMSBlogPost.filter({ website_folder_id: websiteFolderId }),
      base44.asServiceRole.entities.CMSProduct.filter({ website_folder_id: websiteFolderId }),
      base44.asServiceRole.entities.CMSSection.filter({ website_folder_id: websiteFolderId }),
      base44.asServiceRole.entities.ContentTemplate.filter({ tenant_id: websiteFolderId }),
      base44.asServiceRole.entities.WebsiteTheme.filter({ website_folder_id: websiteFolderId, is_active: true }),
      base44.asServiceRole.entities.CMSNavigation.filter({ website_folder_id: websiteFolderId }),
      includeAssets ? base44.asServiceRole.entities.WebsiteAsset.filter({ website_folder_id: websiteFolderId }) : [],
    ]);

    packageData.pages = pages.map(p => ({ ...p, id: undefined, created_date: undefined, updated_date: undefined }));
    packageData.blogPosts = blogs.map(b => ({ ...b, id: undefined, created_date: undefined, updated_date: undefined }));
    packageData.products = products.map(p => ({ ...p, id: undefined, created_date: undefined, updated_date: undefined }));
    packageData.sections = sections.map(s => ({ ...s, id: undefined, created_date: undefined, updated_date: undefined }));
    packageData.templates = templates.map(t => ({ ...t, id: undefined, created_date: undefined, updated_date: undefined }));
    packageData.theme = themes[0] || null;
    packageData.navigation = navigation.map(n => ({ ...n, id: undefined, created_date: undefined, updated_date: undefined }));
    
    if (includeAssets) {
      packageData.assets = assets.map(a => ({
        file_name: a.file_name,
        file_path: a.file_path,
        file_url: a.file_url,
        file_type: a.file_type,
        mime_type: a.mime_type,
      }));
    }

    const pkg = await base44.asServiceRole.entities.CMSPackage.create({
      name: packageName,
      package_type: packageType || 'full_site',
      content_snapshot: JSON.stringify(packageData),
      asset_manifest: packageData.assets,
      theme_config: packageData.theme ? JSON.stringify(packageData.theme) : null,
      website_folder_id: websiteFolderId,
      version: '1.0.0',
    });

    return Response.json({ 
      success: true, 
      package: pkg,
      stats: {
        pages: packageData.pages.length,
        blogs: packageData.blogPosts.length,
        products: packageData.products.length,
        sections: packageData.sections.length,
        templates: packageData.templates.length,
        assets: packageData.assets.length,
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});