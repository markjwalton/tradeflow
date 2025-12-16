import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const githubToken = Deno.env.get('GITHUB_TOKEN');
    if (!githubToken) {
      return Response.json({ error: 'GitHub token not configured' }, { status: 500 });
    }

    // Use GitHub API to list pages folder
    const owner = 'your-org'; // Update with actual owner
    const repo = 'your-repo'; // Update with actual repo
    const path = 'pages';

    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
      {
        headers: {
          'Authorization': `token ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Base44-App'
        }
      }
    );

    if (!response.ok) {
      return Response.json({ 
        error: 'Failed to fetch pages from GitHub', 
        status: response.status 
      }, { status: 500 });
    }

    const files = await response.json();
    const pages = files
      .filter(file => file.type === 'file' && (file.name.endsWith('.js') || file.name.endsWith('.jsx')))
      .map(file => file.name.replace(/\.(js|jsx)$/, ''))
      .sort();

    return Response.json({ 
      pages,
      count: pages.length 
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});