import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { templateId, newWebsiteName, newWebsiteSlug, tenantId, applyTheme } = await req.json();

    if (!templateId || !newWebsiteName || !newWebsiteSlug) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Fetch the template
    const templates = await base44.asServiceRole.entities.WebsiteTemplate.filter({ id: templateId });
    if (templates.length === 0) {
      return Response.json({ error: 'Template not found' }, { status: 404 });
    }
    const template = templates[0];

    // Fetch source folder
    const sourceFolders = await base44.asServiceRole.entities.WebsiteFolder.filter({ id: template.source_folder_id });
    if (sourceFolders.length === 0) {
      return Response.json({ error: 'Source folder not found' }, { status: 404 });
    }

    // Create new WebsiteFolder
    const newFolder = await base44.asServiceRole.entities.WebsiteFolder.create({
      name: newWebsiteName,
      slug: newWebsiteSlug,
      description: `Created from template: ${template.template_name}`,
      is_active: true,
      tenant_id: tenantId || null,
      theme_id: applyTheme && template.default_theme_id ? template.default_theme_id : null
    });

    // Duplicate CMSPages
    const sourcePages = await base44.asServiceRole.entities.CMSPage.filter({ 
      website_folder_id: template.source_folder_id 
    });

    const pagePromises = sourcePages.map(page => 
      base44.asServiceRole.entities.CMSPage.create({
        website_folder_id: newFolder.id,
        tenant_id: tenantId || null,
        title: page.title,
        slug: page.slug,
        content: page.content,
        meta_title: page.meta_title,
        meta_description: page.meta_description,
        featured_image: page.featured_image,
        status: 'draft',
        template: page.template,
        custom_fields: page.custom_fields,
        order: page.order
      })
    );

    await Promise.all(pagePromises);

    // Duplicate WebsiteAssets
    const sourceAssets = await base44.asServiceRole.entities.WebsiteAsset.filter({ 
      website_folder_id: template.source_folder_id 
    });

    const assetPromises = sourceAssets.map(asset => 
      base44.asServiceRole.entities.WebsiteAsset.create({
        website_folder_id: newFolder.id,
        file_name: asset.file_name,
        file_path: asset.file_path,
        file_url: asset.file_url,
        file_type: asset.file_type,
        file_size: asset.file_size,
        mime_type: asset.mime_type,
        tags: asset.tags
      })
    );

    await Promise.all(assetPromises);

    // Duplicate Blog Posts
    const sourceBlogPosts = await base44.asServiceRole.entities.CMSBlogPost.filter({ 
      website_folder_id: template.source_folder_id 
    });

    const blogPromises = sourceBlogPosts.map(post => 
      base44.asServiceRole.entities.CMSBlogPost.create({
        website_folder_id: newFolder.id,
        tenant_id: tenantId || null,
        title: post.title,
        slug: post.slug,
        content: post.content,
        excerpt: post.excerpt,
        author: post.author,
        featured_image: post.featured_image,
        status: 'draft',
        categories: post.categories,
        tags: post.tags,
        custom_fields: post.custom_fields
      })
    );

    await Promise.all(blogPromises);

    // Duplicate Products
    const sourceProducts = await base44.asServiceRole.entities.CMSProduct.filter({ 
      website_folder_id: template.source_folder_id 
    });

    const productPromises = sourceProducts.map(product => 
      base44.asServiceRole.entities.CMSProduct.create({
        website_folder_id: newFolder.id,
        tenant_id: tenantId || null,
        name: product.name,
        slug: product.slug,
        description: product.description,
        short_description: product.short_description,
        price: product.price,
        sale_price: product.sale_price,
        currency: product.currency,
        sku: product.sku,
        stock_quantity: product.stock_quantity,
        images: product.images,
        categories: product.categories,
        tags: product.tags,
        status: 'draft',
        custom_fields: product.custom_fields
      })
    );

    await Promise.all(productPromises);

    // Duplicate Sections
    const sourceSections = await base44.asServiceRole.entities.CMSSection.filter({ 
      website_folder_id: template.source_folder_id 
    });

    const sectionPromises = sourceSections.map(section => 
      base44.asServiceRole.entities.CMSSection.create({
        website_folder_id: newFolder.id,
        tenant_id: tenantId || null,
        name: section.name,
        slug: section.slug,
        content: section.content,
        section_type: section.section_type,
        order: section.order,
        custom_fields: section.custom_fields
      })
    );

    await Promise.all(sectionPromises);

    return Response.json({
      success: true,
      websiteFolder: newFolder,
      pagesCreated: sourcePages.length,
      assetsCreated: sourceAssets.length,
      blogPostsCreated: sourceBlogPosts.length,
      productsCreated: sourceProducts.length,
      sectionsCreated: sourceSections.length,
      message: `Website instance created from template. Template remains unchanged.`
    });

  } catch (error) {
    console.error('Duplication error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});