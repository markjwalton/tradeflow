import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

const GITHUB_TOKEN = Deno.env.get("GITHUB_TOKEN");
const REPO_OWNER = "base44dev";
const REPO_NAME = "tradeai360";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, path, issue_number } = await req.json();

    const headers = {
      'Authorization': `Bearer ${GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28'
    };

    let url;
    let response;

    switch (action) {
      case 'get_file':
        // Get file contents from repository
        url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`;
        response = await fetch(url, { headers });
        if (response.ok) {
          const data = await response.json();
          // Decode base64 content
          const content = atob(data.content);
          return Response.json({ 
            content, 
            path: data.path,
            sha: data.sha,
            size: data.size 
          });
        }
        break;

      case 'list_files':
        // List files in a directory
        url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path || ''}`;
        response = await fetch(url, { headers });
        if (response.ok) {
          const data = await response.json();
          return Response.json({ files: data });
        }
        break;

      case 'get_issues':
        // Get repository issues
        url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues`;
        response = await fetch(url, { headers });
        if (response.ok) {
          const data = await response.json();
          return Response.json({ issues: data });
        }
        break;

      case 'get_issue':
        // Get specific issue
        url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues/${issue_number}`;
        response = await fetch(url, { headers });
        if (response.ok) {
          const data = await response.json();
          return Response.json({ issue: data });
        }
        break;

      case 'get_commits':
        // Get recent commits
        url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/commits`;
        response = await fetch(url, { headers });
        if (response.ok) {
          const data = await response.json();
          return Response.json({ commits: data });
        }
        break;

      case 'get_readme':
        // Get repository README
        url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/readme`;
        response = await fetch(url, { headers });
        if (response.ok) {
          const data = await response.json();
          const content = atob(data.content);
          return Response.json({ content, name: data.name });
        }
        break;

      default:
        return Response.json({ error: 'Invalid action' }, { status: 400 });
    }

    if (!response.ok) {
      const error = await response.text();
      return Response.json({ error: `GitHub API error: ${error}` }, { status: response.status });
    }

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});