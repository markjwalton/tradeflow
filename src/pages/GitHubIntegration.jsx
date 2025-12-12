import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, File, GitBranch, AlertCircle, FileText } from "lucide-react";

export default function GitHubIntegration() {
  const [loading, setLoading] = useState(false);
  const [filePath, setFilePath] = useState("README.md");
  const [fileContent, setFileContent] = useState(null);
  const [files, setFiles] = useState([]);
  const [issues, setIssues] = useState([]);
  const [commits, setCommits] = useState([]);
  const [repo, setRepo] = useState(null);
  const [error, setError] = useState(null);

  const handleGetRepo = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await base44.functions.invoke('githubApi', {
        action: 'get_repo'
      });
      console.log("GitHub API full result:", result);
      console.log("GitHub API data:", result?.data);
      setRepo(result?.data?.repo || result?.data);
    } catch (e) {
      console.error("GitHub API error:", e);
      setError(e.message || "Failed to load repository");
    }
    setLoading(false);
  };

  // Load repository info on mount
  useEffect(() => {
    handleGetRepo();
  }, []);

  const handleGetFile = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await base44.functions.invoke('githubApi', {
        action: 'get_file',
        path: filePath
      });
      setFileContent(data);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  const handleListFiles = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await base44.functions.invoke('githubApi', {
        action: 'list_files',
        path: filePath || ''
      });
      setFiles(data.files || []);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  const handleGetIssues = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await base44.functions.invoke('githubApi', {
        action: 'get_issues'
      });
      setIssues(data.issues || []);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  const handleGetCommits = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await base44.functions.invoke('githubApi', {
        action: 'get_commits'
      });
      setCommits(data.commits || []);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  const handleGetReadme = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await base44.functions.invoke('githubApi', {
        action: 'get_readme'
      });
      setFileContent({ content: data.content, path: data.name });
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen p-6 bg-background">
      <div className="max-w-6xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="h-6 w-6" />
              GitHub Integration Demo
            </CardTitle>
          </CardHeader>
          <CardContent>
            {repo ? (
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
                <Button onClick={handleGetIssues} disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Load Issues"}
                </Button>
                {issues.length > 0 ? (
                  <div className="space-y-3">
                    {issues.map((issue) => (
                      <Card key={issue.id}>
                        <CardContent className="pt-4">
                          <div className="space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="font-semibold">#{issue.number} {issue.title}</h3>
                              <Badge variant={issue.state === 'open' ? 'default' : 'secondary'}>
                                {issue.state}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {issue.body}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              By {issue.user.login} • {new Date(issue.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
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
                <Button onClick={handleGetCommits} disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Load Commits"}
                </Button>
                {commits.length > 0 ? (
                  <div className="space-y-3">
                    {commits.slice(0, 10).map((commit) => (
                      <Card key={commit.sha}>
                        <CardContent className="pt-4">
                          <div className="space-y-2">
                            <p className="font-medium">{commit.commit.message}</p>
                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                              <span>By {commit.commit.author.name}</span>
                              <span className="font-mono text-xs">{commit.sha.slice(0, 7)}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {new Date(commit.commit.author.date).toLocaleString()}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
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