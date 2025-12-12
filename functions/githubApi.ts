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

    const body = await req.json();
    const { action, path, issue_number, page = 1, per_page = 30, colors } = body;

    const headers = {
      'Authorization': `Bearer ${GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28'
    };

    let url;
    let response;

    switch (action) {
    case 'get_cached_commits':
      // Get commits from database
      const cachedCommits = await base44.asServiceRole.entities.GitHubCommit.filter(
        { repo_name: REPO_NAME },
        '-commit_date',
        per_page,
        (page - 1) * per_page
      );
      return Response.json({ commits: cachedCommits });

    case 'get_cached_issues':
      // Get issues from database
      const cachedIssues = await base44.asServiceRole.entities.GitHubIssue.filter(
        { repo_name: REPO_NAME },
        '-issue_updated_at',
        per_page,
        (page - 1) * per_page
      );
      return Response.json({ issues: cachedIssues });

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
        // Get repository issues with pagination and caching
        url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues?page=${page}&per_page=${per_page}&state=all`;
        response = await fetch(url, { headers });
        if (response.ok) {
          const data = await response.json();

          // Store in database
          for (const issue of data) {
            const existing = await base44.asServiceRole.entities.GitHubIssue.filter({
              repo_name: REPO_NAME,
              issue_number: issue.number
            });

            const issueData = {
              repo_name: REPO_NAME,
              issue_number: issue.number,
              title: issue.title,
              body: issue.body || '',
              state: issue.state,
              user_login: issue.user.login,
              html_url: issue.html_url,
              issue_created_at: issue.created_at,
              issue_updated_at: issue.updated_at
            };

            if (existing.length > 0) {
              await base44.asServiceRole.entities.GitHubIssue.update(existing[0].id, issueData);
            } else {
              await base44.asServiceRole.entities.GitHubIssue.create(issueData);
            }
          }

          // Get pagination info from headers
          const linkHeader = response.headers.get('Link');
          const hasNext = linkHeader && linkHeader.includes('rel="next"');

          return Response.json({ 
            issues: data,
            pagination: {
              page,
              per_page,
              has_next: hasNext
            }
          });
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
        // Get recent commits with pagination and caching
        url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/commits?page=${page}&per_page=${per_page}`;
        response = await fetch(url, { headers });
        if (response.ok) {
          const data = await response.json();

          // Store in database
          for (const commit of data) {
            const existing = await base44.asServiceRole.entities.GitHubCommit.filter({
              repo_name: REPO_NAME,
              sha: commit.sha
            });

            const commitData = {
              repo_name: REPO_NAME,
              sha: commit.sha,
              message: commit.commit.message,
              author_name: commit.commit.author.name,
              author_email: commit.commit.author.email,
              commit_date: commit.commit.author.date,
              html_url: commit.html_url
            };

            if (existing.length === 0) {
              await base44.asServiceRole.entities.GitHubCommit.create(commitData);
            }
          }

          // Get pagination info
          const linkHeader = response.headers.get('Link');
          const hasNext = linkHeader && linkHeader.includes('rel="next"');

          return Response.json({ 
            commits: data,
            pagination: {
              page,
              per_page,
              has_next: hasNext
            }
          });
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

      case 'get_repo':
        // Get repository information
        url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}`;
        response = await fetch(url, { headers });
        if (response.ok) {
          const data = await response.json();
          return Response.json({ 
            repo: {
              name: data.name,
              full_name: data.full_name,
              description: data.description,
              html_url: data.html_url,
              stargazers_count: data.stargazers_count,
              watchers_count: data.watchers_count,
              forks_count: data.forks_count,
              open_issues_count: data.open_issues_count,
              language: data.language,
              created_at: data.created_at,
              updated_at: data.updated_at,
              owner: {
                login: data.owner.login,
                avatar_url: data.owner.avatar_url
              }
            }
          });
        }
        break;

      case 'scan_colors':
        // Scan repository for color occurrences
        const { colors } = await req.json();
        const counts = {};
        const fileDetails = [];
        
        // Initialize counts
        for (const color of colors) {
          counts[color] = 0;
        }
        
        // Get repository tree
        const treeResponse = await fetch(
          `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/git/trees/main?recursive=1`,
          { headers }
        );
        const treeData = await treeResponse.json();
        
        // Filter to src files only (js, jsx, css)
        const srcFiles = treeData.tree.filter(item => 
          item.type === 'blob' && 
          item.path.startsWith('src/') &&
          /\.(js|jsx|css)$/.test(item.path)
        );
        
        // Scan each file
        for (const file of srcFiles) {
          try {
            const fileResponse = await fetch(
              `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${file.path}`,
              { headers }
            );
            const fileData = await fileResponse.json();
            const content = atob(fileData.content);
            let fileTotal = 0;
            
            for (const color of colors) {
              const regex = new RegExp(color.replace('#', '#?'), 'gi');
              const matches = content.match(regex) || [];
              counts[color] += matches.length;
              fileTotal += matches.length;
            }
            
            if (fileTotal > 0) {
              fileDetails.push({ 
                path: file.path.replace('src/', ''), 
                changes: fileTotal 
              });
            }
          } catch (error) {
            console.error(`Error scanning ${file.path}:`, error);
          }
        }
        
        return Response.json({ counts, fileDetails });

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