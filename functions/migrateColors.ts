import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

const GITHUB_TOKEN = Deno.env.get('GITHUB_TOKEN');
const REPO_OWNER = 'Contextual';
const REPO_NAME = 'Sturij';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { colorHex, token, files } = await req.json();

    if (!colorHex || !token || !files) {
      return Response.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const results = [];
    const fileChanges = [];
    const hexLower = colorHex.toLowerCase();
    
    // Step 1: Read and process each file from GitHub
    for (const filePath of files) {
      try {
        // Map app paths to GitHub repo paths
        const githubPath = filePath.startsWith('src/') ? filePath : `src/${filePath}`;
        
        // Read file from GitHub
        const fileResponse = await fetch(
          `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${githubPath}`,
          {
            headers: {
              'Authorization': `Bearer ${GITHUB_TOKEN}`,
              'Accept': 'application/vnd.github.v3+json'
            }
          }
        );

        if (!fileResponse.ok) {
          results.push({
            file: filePath,
            success: false,
            error: `File not found in GitHub: ${githubPath}`
          });
          continue;
        }

        const fileData = await fileResponse.json();
        const content = atob(fileData.content);
        let modifiedContent = content;
        let changeCount = 0;

        // Replace various color formats
        const patterns = [
          // CSS properties: color: #4A5D4E
          { regex: new RegExp(`(color|background-color|border-color|fill|stroke):\\s*${hexLower}`, 'gi'), replacement: `$1: var(${token})` },
          // React props: backgroundColor: "#4A5D4E"
          { regex: new RegExp(`backgroundColor:\\s*["']${hexLower}["']`, 'gi'), replacement: `backgroundColor: "var(${token})"` },
          // Style objects: { backgroundColor: "#4A5D4E" }
          { regex: new RegExp(`(["'])${hexLower}\\1`, 'gi'), replacement: `"var(${token})"` }
        ];

        for (const pattern of patterns) {
          const matches = modifiedContent.match(pattern.regex) || [];
          changeCount += matches.length;
          modifiedContent = modifiedContent.replace(pattern.regex, pattern.replacement);
        }

        if (changeCount > 0) {
          fileChanges.push({
            path: githubPath,
            content: modifiedContent,
            sha: fileData.sha
          });
          results.push({
            file: filePath,
            success: true,
            changes: changeCount
          });
        } else {
          results.push({
            file: filePath,
            success: true,
            changes: 0
          });
        }
      } catch (error) {
        results.push({
          file: filePath,
          success: false,
          error: error.message
        });
      }
    }

    // Step 2: Create GitHub commit with all changes
    if (fileChanges.length > 0) {
      const branchName = `color-migration-${colorHex.replace('#', '')}-${Date.now()}`;
      const commitMessage = `Migrate ${colorHex} to ${token}`;

      try {
        // Get default branch ref
        const refResponse = await fetch(
          `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/git/refs/heads/main`,
          {
            headers: {
              'Authorization': `Bearer ${GITHUB_TOKEN}`,
              'Accept': 'application/vnd.github.v3+json'
            }
          }
        );
        const refData = await refResponse.json();
        const baseSha = refData.object.sha;

        // Create new branch
        await fetch(
          `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/git/refs`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${GITHUB_TOKEN}`,
              'Accept': 'application/vnd.github.v3+json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              ref: `refs/heads/${branchName}`,
              sha: baseSha
            })
          }
        );

        // Update files on new branch
        for (const file of fileChanges) {
          await fetch(
            `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${file.path}`,
            {
              method: 'PUT',
              headers: {
                'Authorization': `Bearer ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                message: commitMessage,
                content: btoa(file.content),
                sha: file.sha,
                branch: branchName
              })
            }
          );
        }

        const prUrl = `https://github.com/${REPO_OWNER}/${REPO_NAME}/compare/${branchName}?expand=1`;

        return Response.json({
          success: true,
          results,
          totalChanges: results.reduce((sum, r) => sum + (r.changes || 0), 0),
          branchName,
          prUrl,
          message: 'Changes committed to GitHub. Create PR to merge.'
        });
      } catch (error) {
        return Response.json({
          success: false,
          error: `GitHub commit failed: ${error.message}`,
          results
        }, { status: 500 });
      }
    }

    return Response.json({
      success: true,
      results,
      totalChanges: 0,
      message: 'No changes needed'
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});