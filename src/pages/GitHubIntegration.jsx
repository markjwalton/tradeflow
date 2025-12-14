import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, File, GitBranch, AlertCircle, FileText, RefreshCw, Database, Sparkles } from "lucide-react";

export default function GitHubIntegration() {
  const [loading, setLoading] = useState(false);
  const [filePath, setFilePath] = useState("");
  const [fileContent, setFileContent] = useState(null);
  const [files, setFiles] = useState([]);
  const [issues, setIssues] = useState([]);
  const [commits, setCommits] = useState([]);
  const [repo, setRepo] = useState(null);
  const [error, setError] = useState(null);
  const [issuesPage, setIssuesPage] = useState(1);
  const [commitsPage, setCommitsPage] = useState(1);
  const [hasMoreIssues, setHasMoreIssues] = useState(false);
  const [hasMoreCommits, setHasMoreCommits] = useState(false);
  const [useCache, setUseCache] = useState(true);
  const [syncResult, setSyncResult] = useState(null);
  const [isRebuilding, setIsRebuilding] = useState(false);
  const [lastRebuild, setLastRebuild] = useState(null);

  const handleGetRepo = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await base44.functions.invoke('githubApi', {
        action: 'get_repo'
      });
      if (result?.data?.repo) {
        setRepo(result.data.repo);
      }
    } catch (e) {
      console.error("GitHub API error:", e);
      setError(e.message || "Failed to load repository");
    } finally {
      setLoading(false);
    }
  };

  // Load repository info on mount
  useEffect(() => {
    handleGetRepo();
    // Load last rebuild timestamp
    const loadRebuildTimestamp = async () => {
      try {
        const user = await base44.auth.me();
        if (user?.ui_preferences?.lastRebuildTimestamp) {
          setLastRebuild(user.ui_preferences.lastRebuildTimestamp);
        }
      } catch (e) {
        // Ignore
      }
    };
    loadRebuildTimestamp();
  }, []);

  const handleGetFile = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await base44.functions.invoke('githubApi', {
        action: 'get_file',
        path: filePath
      });
      setFileContent(result.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleListFiles = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await base44.functions.invoke('githubApi', {
        action: 'list_files',
        path: filePath || ''
      });
      setFiles(result.data?.files || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGetIssues = async (loadMore = false) => {
    setLoading(true);
    setError(null);
    try {
      const pageToLoad = loadMore ? issuesPage + 1 : 1;
      const action = useCache ? 'get_cached_issues' : 'get_issues';
      
      const result = await base44.functions.invoke('githubApi', {
        action,
        page: pageToLoad,
        per_page: 30
      });
      
      if (loadMore) {
        setIssues(prev => [...prev, ...(result.data?.issues || [])]);
      } else {
        setIssues(result.data?.issues || []);
      }
      
      setHasMoreIssues(result.data?.pagination?.has_next || false);
      setIssuesPage(pageToLoad);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGetCommits = async (loadMore = false) => {
    setLoading(true);
    setError(null);
    try {
      const pageToLoad = loadMore ? commitsPage + 1 : 1;
      const action = useCache ? 'get_cached_commits' : 'get_commits';
      
      const result = await base44.functions.invoke('githubApi', {
        action,
        page: pageToLoad,
        per_page: 30
      });
      
      if (loadMore) {
        setCommits(prev => [...prev, ...(result.data?.commits || [])]);
      } else {
        setCommits(result.data?.commits || []);
      }
      
      setHasMoreCommits(result.data?.pagination?.has_next || false);
      setCommitsPage(pageToLoad);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGetReadme = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await base44.functions.invoke('githubApi', {
        action: 'get_readme'
      });
      setFileContent({ content: result.data?.content, path: result.data?.name });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setLoading(true);
    setError(null);
    setSyncResult(null);
    try {
      // Pull pages from GitHub
      const pullResult = await base44.functions.invoke('githubApi', {
        action: 'pull_pages'
      });
      
      setSyncResult({
        updated: pullResult.data?.updated || [],
        count: pullResult.data?.count || 0,
        errors: pullResult.data?.errors || []
      });
      
      setError(null);
    } catch (e) {
      console.error('Sync error:', e);
      setError(e.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRebuild = async () => {
    setIsRebuilding(true);
    try {
      const timestamp = new Date().toISOString();
      const user = await base44.auth.me();
      await base44.auth.updateMe({
        ui_preferences: {
          ...(user.ui_preferences || {}),
          lastRebuildTimestamp: timestamp,
          rebuildTrigger: Math.random()
        }
      });
      setLastRebuild(timestamp);
      
      // Reload after 2 seconds
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (e) {
      setError('Rebuild failed: ' + e.message);
      setIsRebuilding(false);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-background">
      <div className="max-w-6xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="h-6 w-6" />
              GitHub Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6 p-4 bg-muted rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Repository:</span>
                <code className="text-sm">base44dev/tradeai360</code>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Branch:</span>
                <code className="text-sm">main</code>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Sync Direction:</span>
                <Badge variant="secondary">Pull & Push</Badge>
              </div>
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
                <p className="font-medium text-yellow-900 mb-1">⚠️ Important Note:</p>
                <p className="text-yellow-800">After syncing from GitHub, you must trigger a rebuild using the green rebuild button to see changes in the running app.</p>
              </div>
            </div>
            {repo && repo.owner ? (
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <img src={repo.owner.avatar_url} alt={repo.owner.login} className="w-12 h-12 rounded-full" />
                  <div className="flex-1">
                    <a href={repo.html_url} target="_blank" rel="noopener noreferrer" className="font-mono text-lg font-semibold text-primary hover:underline">
                      {repo.full_name}
                    </a>
                    {repo.description && (
                      <p className="text-muted-foreground mt-1">{repo.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Badge variant="secondary">⭐ {repo.stargazers_count}</Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge variant="secondary">🍴 {repo.forks_count}</Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge variant="secondary">👁️ {repo.watchers_count}</Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge variant="secondary">🐛 {repo.open_issues_count} issues</Badge>
                  </div>
                  {repo.language && (
                    <Badge variant="outline">{repo.language}</Badge>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <p className="text-muted-foreground">Loading repository...</p>
              </div>
            )}
          </CardContent>
        </Card>

        {error && (
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                <span>{error}</span>
              </div>
            </CardContent>
          </Card>
        )}
        
        {syncResult && (
          <Card className="border-primary">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <RefreshCw className="h-5 w-5 text-primary" />
                Sync Results
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-lg px-3 py-1">
                  {syncResult.count} pages synced
                </Badge>
              </div>
              
              {syncResult.updated.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Updated Pages:</p>
                  <div className="flex flex-wrap gap-2">
                    {syncResult.updated.map((page) => (
                      <Badge key={page} variant="outline">
                        {page}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {syncResult.errors && syncResult.errors.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-destructive">Errors:</p>
                  <div className="space-y-1">
                    {syncResult.errors.map((error, idx) => (
                      <p key={idx} className="text-xs text-muted-foreground">{error}</p>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="flex justify-end gap-2 mb-4">
          <Button onClick={handleSync} disabled={loading} className="gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Sync from GitHub
          </Button>
          <Button 
            onClick={handleRebuild} 
            disabled={isRebuilding}
            className="gap-2 bg-green-600 hover:bg-green-700"
            title={lastRebuild ? `Last rebuild: ${new Date(lastRebuild).toLocaleString()}` : 'Trigger rebuild'}
          >
            {isRebuilding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Rebuild & Deploy
          </Button>
        </div>

        <Tabs defaultValue="files" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="files">Files</TabsTrigger>
            <TabsTrigger value="content">File Content</TabsTrigger>
            <TabsTrigger value="issues">Issues</TabsTrigger>
            <TabsTrigger value="commits">Commits</TabsTrigger>
          </TabsList>

          <TabsContent value="files" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Browse Files</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Directory path (e.g., components, pages)"
                    value={filePath}
                    onChange={(e) => setFilePath(e.target.value)}
                  />
                  <Button onClick={handleListFiles} disabled={loading}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "List Files"}
                  </Button>
                </div>
                {files.length > 0 && (
                  <div className="space-y-2">
                    {files.map((file) => (
                      <div
                        key={file.path}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer"
                        onClick={() => setFilePath(file.path)}
                      >
                        <div className="flex items-center gap-2">
                          {file.type === 'dir' ? (
                            <File className="h-4 w-4 text-blue-500" />
                          ) : (
                            <FileText className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className="font-mono text-sm">{file.name}</span>
                        </div>
                        <Badge variant="outline">{file.type}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">File Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="File path (e.g., README.md, package.json)"
                    value={filePath}
                    onChange={(e) => setFilePath(e.target.value)}
                  />
                  <Button onClick={handleGetFile} disabled={loading}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Get File"}
                  </Button>
                  <Button onClick={handleGetReadme} variant="outline" disabled={loading}>
                    Get README
                  </Button>
                </div>
                {fileContent && (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Path: <span className="font-mono">{fileContent.path}</span>
                    </p>
                    <pre className="p-4 bg-muted rounded-lg overflow-auto max-h-96 text-sm">
                      <code>{fileContent.content}</code>
                    </pre>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="issues" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Repository Issues</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2 items-center">
                  <Button onClick={() => handleGetIssues(false)} disabled={loading}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : useCache ? <Database className="h-4 w-4" /> : <RefreshCw className="h-4 w-4" />}
                    {useCache ? "Load from Cache" : "Sync from GitHub"}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setUseCache(!useCache)}
                  >
                    {useCache ? "Use Live Data" : "Use Cache"}
                  </Button>
                </div>
                {issues.length > 0 ? (
                  <div className="space-y-3">
                    {issues.map((issue) => (
                      <Card key={issue.id || issue.issue_number}>
                        <CardContent className="pt-4">
                          <div className="space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="font-semibold">#{issue.issue_number || issue.number} {issue.title}</h3>
                              <Badge variant={issue.state === 'open' ? 'default' : 'secondary'}>
                                {issue.state}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {issue.body}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              By {issue.user_login || issue.user?.login} • {new Date(issue.issue_created_at || issue.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {hasMoreIssues && (
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => handleGetIssues(true)}
                        disabled={loading}
                      >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Load More
                      </Button>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No issues loaded yet.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="commits" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Commits</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2 items-center">
                  <Button onClick={() => handleGetCommits(false)} disabled={loading}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : useCache ? <Database className="h-4 w-4" /> : <RefreshCw className="h-4 w-4" />}
                    {useCache ? "Load from Cache" : "Sync from GitHub"}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setUseCache(!useCache)}
                  >
                    {useCache ? "Use Live Data" : "Use Cache"}
                  </Button>
                </div>
                {commits.length > 0 ? (
                  <div className="space-y-3">
                    {commits.map((commit) => (
                      <Card key={commit.sha}>
                        <CardContent className="pt-4">
                          <div className="space-y-2">
                            <p className="font-medium">{commit.message || commit.commit?.message}</p>
                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                              <span>By {commit.author_name || commit.commit?.author?.name}</span>
                              <span className="font-mono text-xs">{commit.sha.slice(0, 7)}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {new Date(commit.commit_date || commit.commit?.author?.date).toLocaleString()}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {hasMoreCommits && (
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => handleGetCommits(true)}
                        disabled={loading}
                      >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Load More
                      </Button>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No commits loaded yet.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}