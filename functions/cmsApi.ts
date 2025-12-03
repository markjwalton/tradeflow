import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-API-Key, X-Tenant-ID',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const base44 = createClientFromRequest(req);
    const apiKey = req.headers.get('X-API-Key');
    const tenantId = req.headers.get('X-Tenant-ID');

    if (!apiKey || !tenantId) {
      return Response.json(
        { error: 'Missing X-API-Key or X-Tenant-ID header' },
        { status: 401, headers: corsHeaders }
      );
    }

    // Validate API key
    const apiKeys = await base44.asServiceRole.entities.CMSApiKey.filter({
      api_key: apiKey,
      tenant_id: tenantId,
      is_active: true
    });

    if (apiKeys.length === 0) {
      return Response.json(
        { error: 'Invalid API key' },
        { status: 401, headers: corsHeaders }
      );
    }

    const keyRecord = apiKeys[0];
    const permissions = keyRecord.permissions || [];

    // Check expiry
    if (keyRecord.expires_at && new Date(keyRecord.expires_at) < new Date()) {
      return Response.json(
        { error: 'API key expired' },
        { status: 401, headers: corsHeaders }
      );
    }

    // Update last used
    await base44.asServiceRole.entities.CMSApiKey.update(keyRecord.id, {
      last_used: new Date().toISOString()
    });

    const url = new URL(req.url);
    const body = req.method !== 'GET' ? await req.json().catch(() => ({})) : {};
    
    // Parse resource and action from body
    const { resource, action, slug, id, data, filters } = body;

    // Permission check helper
    const hasPermission = (needed) => permissions.includes(needed);

    // Route handling
    if (resource === 'pages') {
      if (action === 'list' && hasPermission('pages:read')) {
        const pages = await base44.asServiceRole.entities.CMSPage.filter({
          tenant_id: tenantId,
          status: 'published',
          ...(filters || {})
        });
        return Response.json({ data: pages }, { headers: corsHeaders });
      }
      if (action === 'get' && hasPermission('pages:read')) {
        const pages = await base44.asServiceRole.entities.CMSPage.filter({
          tenant_id: tenantId,
          slug: slug
        });
        return Response.json({ data: pages[0] || null }, { headers: corsHeaders });
      }
      if (action === 'create' && hasPermission('pages:write')) {
        const page = await base44.asServiceRole.entities.CMSPage.create({
          ...data,
          tenant_id: tenantId
        });
        return Response.json({ data: page }, { headers: corsHeaders });
      }
      if (action === 'update' && hasPermission('pages:write')) {
        const page = await base44.asServiceRole.entities.CMSPage.update(id, data);
        return Response.json({ data: page }, { headers: corsHeaders });
      }
    }

    if (resource === 'products') {
      if (action === 'list' && hasPermission('products:read')) {
        const products = await base44.asServiceRole.entities.CMSProduct.filter({
          tenant_id: tenantId,
          status: 'published',
          ...(filters || {})
        });
        return Response.json({ data: products }, { headers: corsHeaders });
      }
      if (action === 'get' && hasPermission('products:read')) {
        const products = await base44.asServiceRole.entities.CMSProduct.filter({
          tenant_id: tenantId,
          slug: slug
        });
        return Response.json({ data: products[0] || null }, { headers: corsHeaders });
      }
      if (action === 'create' && hasPermission('products:write')) {
        const product = await base44.asServiceRole.entities.CMSProduct.create({
          ...data,
          tenant_id: tenantId
        });
        return Response.json({ data: product }, { headers: corsHeaders });
      }
      if (action === 'update' && hasPermission('products:write')) {
        const product = await base44.asServiceRole.entities.CMSProduct.update(id, data);
        return Response.json({ data: product }, { headers: corsHeaders });
      }
    }

    if (resource === 'blog') {
      if (action === 'list' && hasPermission('blog:read')) {
        const posts = await base44.asServiceRole.entities.CMSBlogPost.filter({
          tenant_id: tenantId,
          status: 'published',
          ...(filters || {})
        }, '-publish_date');
        return Response.json({ data: posts }, { headers: corsHeaders });
      }
      if (action === 'get' && hasPermission('blog:read')) {
        const posts = await base44.asServiceRole.entities.CMSBlogPost.filter({
          tenant_id: tenantId,
          slug: slug
        });
        return Response.json({ data: posts[0] || null }, { headers: corsHeaders });
      }
      if (action === 'create' && hasPermission('blog:write')) {
        const post = await base44.asServiceRole.entities.CMSBlogPost.create({
          ...data,
          tenant_id: tenantId
        });
        return Response.json({ data: post }, { headers: corsHeaders });
      }
      if (action === 'update' && hasPermission('blog:write')) {
        const post = await base44.asServiceRole.entities.CMSBlogPost.update(id, data);
        return Response.json({ data: post }, { headers: corsHeaders });
      }
    }

    if (resource === 'forms') {
      if (action === 'list' && hasPermission('forms:read')) {
        const forms = await base44.asServiceRole.entities.CMSForm.filter({
          tenant_id: tenantId,
          status: 'active'
        });
        return Response.json({ data: forms }, { headers: corsHeaders });
      }
      if (action === 'get' && hasPermission('forms:read')) {
        const forms = await base44.asServiceRole.entities.CMSForm.filter({
          tenant_id: tenantId,
          slug: slug
        });
        return Response.json({ data: forms[0] || null }, { headers: corsHeaders });
      }
      if (action === 'submit') {
        // Form submissions don't require auth - public
        const forms = await base44.asServiceRole.entities.CMSForm.filter({
          tenant_id: tenantId,
          slug: slug,
          status: 'active'
        });
        if (forms.length === 0) {
          return Response.json({ error: 'Form not found' }, { status: 404, headers: corsHeaders });
        }
        const form = forms[0];
        const submission = await base44.asServiceRole.entities.CMSFormSubmission.create({
          tenant_id: tenantId,
          form_id: form.id,
          form_name: form.name,
          data: data,
          status: 'new'
        });
        return Response.json({ 
          success: true, 
          message: form.success_message || 'Thank you!' 
        }, { headers: corsHeaders });
      }
    }

    if (resource === 'submissions') {
      if (action === 'list' && hasPermission('submissions:read')) {
        const submissions = await base44.asServiceRole.entities.CMSFormSubmission.filter({
          tenant_id: tenantId,
          ...(filters || {})
        }, '-created_date');
        return Response.json({ data: submissions }, { headers: corsHeaders });
      }
    }

    return Response.json(
      { error: 'Invalid resource or action, or insufficient permissions' },
      { status: 400, headers: corsHeaders }
    );

  } catch (error) {
    return Response.json(
      { error: error.message },
      { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  }
});