import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { pageName, pageTitle } = await req.json();

    if (!pageName) {
      return Response.json({ error: 'Page name is required' }, { status: 400 });
    }

    const githubToken = Deno.env.get('GITHUB_TOKEN');
    if (!githubToken) {
      return Response.json({ error: 'GitHub token not configured' }, { status: 500 });
    }

    // Create default page content
    const title = pageTitle || pageName.replace(/([A-Z])/g, ' $1').trim();
    const pageContent = `import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function ${pageName}() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>${title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This page was automatically generated. Start building your content here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
`;

    // Create file via GitHub API
    const owner = 'KieronFernieBrown';
    const repo = 'radiant-cms';
    const path = `pages/${pageName}.js`;

    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `token ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `Create ${pageName} page`,
          content: btoa(unescape(encodeURIComponent(pageContent))),
          branch: 'main'
        })
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error('GitHub API error:', error);
      return Response.json({ 
        error: 'Failed to create page file', 
        details: error.message || JSON.stringify(error)
      }, { status: 500 });
    }

    const result = await response.json();

    return Response.json({ 
      success: true,
      pageName,
      filePath: result.content.path,
      htmlUrl: result.content.html_url
    });
  } catch (error) {
    console.error('Function error:', error);
    return Response.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
});