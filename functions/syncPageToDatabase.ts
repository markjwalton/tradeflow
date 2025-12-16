import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  console.log('🔄 [SYNC] Function invoked');
  
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { page_name, repo_owner, repo_name, branch = 'main' } = await req.json();
    
    if (!page_name) {
      return Response.json({ error: 'page_name required' }, { status: 400 });
    }

    const githubToken = Deno.env.get('GITHUB_TOKEN');
    if (!githubToken) {
      return Response.json({ 
        error: 'GITHUB_TOKEN not configured',
        hint: 'Set GITHUB_TOKEN in environment variables'
      }, { status: 500 });
    }

    // Construct GitHub API URL
    const owner = repo_owner || 'your-org'; // Replace with actual org
    const repo = repo_name || 'your-repo'; // Replace with actual repo
    const filePath = `pages/${page_name}.js`;
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`;
    
    console.log('📡 [SYNC] Fetching from GitHub:', apiUrl);

    // Fetch file from GitHub
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Base44-CMS'
      }
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ [SYNC] GitHub API error:', error);
      return Response.json({ 
        error: `GitHub API error: ${response.status}`,
        details: error
      }, { status: response.status });
    }

    const data = await response.json();
    
    // Decode base64 content
    const content = atob(data.content);
    console.log('✅ [SYNC] File fetched:', content.length, 'chars');

    // Check if page already exists
    const existing = await base44.asServiceRole.entities.UIPage.filter({ page_name });
    
    let result;
    if (existing.length > 0) {
      // Update existing
      console.log('🔄 [SYNC] Updating existing page');
      result = await base44.asServiceRole.entities.UIPage.update(existing[0].id, {
        current_content_jsx: content,
        current_version_number: (existing[0].current_version_number || 1) + 1
      });
    } else {
      // Create new
      console.log('✨ [SYNC] Creating new page');
      result = await base44.asServiceRole.entities.UIPage.create({
        page_name,
        slug: page_name.toLowerCase().replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase(),
        description: `Template page: ${page_name}`,
        current_content_jsx: content,
        current_version_number: 1,
        category: 'Custom',
        tags: ['template', 'synced-from-github']
      });
    }

    console.log('✅ [SYNC] Page synced successfully');

    return Response.json({
      success: true,
      page_name,
      page_id: result.id,
      content_length: content.length,
      action: existing.length > 0 ? 'updated' : 'created'
    });

  } catch (error) {
    console.error('❌ [SYNC] Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});