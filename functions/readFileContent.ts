import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await req.json();
    const filePath = payload.file_path || payload.filePath;

    if (!filePath) {
      return Response.json({ error: 'File path required' }, { status: 400 });
    }

    // Use GitHub API to read file content
    const GITHUB_TOKEN = Deno.env.get('GITHUB_TOKEN');
    const GITHUB_REPO = 'PickleRicc/base44-test';
    const GITHUB_BRANCH = 'main';

    if (!GITHUB_TOKEN) {
      return Response.json({ error: 'GitHub token not configured' }, { status: 500 });
    }

    // Try multiple possible paths
    const possiblePaths = [
      filePath,
      `src/${filePath}`,
      filePath.replace('pages/', 'src/pages/')
    ];

    let content = null;
    let successPath = null;

    for (const path of possiblePaths) {
      const githubUrl = `https://api.github.com/repos/${GITHUB_REPO}/contents/${path}?ref=${GITHUB_BRANCH}`;
      
      const response = await fetch(githubUrl, {
        headers: {
          'Authorization': `Bearer ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3.raw',
          'User-Agent': 'Base44-App'
        }
      });

      if (response.ok) {
        content = await response.text();
        successPath = path;
        break;
      }
    }

    if (!content) {
      return Response.json({ 
        success: false,
        error: `File not found in any of the attempted paths`,
        attempted_paths: possiblePaths
      }, { status: 404 });
    }

    return Response.json({ 
      success: true,
      content: content,
      path: successPath
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});