import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, File, GitBranch, AlertCircle, FileText, RefreshCw, Database, Search, ChevronDown, ChevronRight } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { PageHeader } from "@/components/sturij";

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
  const [searchIssues, setSearchIssues] = useState("");
  const [searchCommits, setSearchCommits] = useState("");
  const [collapsedIssues, setCollapsedIssues] = useState({});
  const [collapsedCommits, setCollapsedCommits] = useState({});

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

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto -mt-6 space-y-6">
        <PageHeader 
          title="GitHub Integration Demo"
          description="Browse repository files, commits, and issues"
        />
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="h-6 w-6" />
              Repository Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
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
            {/* Action Bar */}
            <Card className="border-border">
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex gap-2 items-center">
                  <Button onClick={() => handleGetIssues(false)} disabled={loading}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : useCache ? <Database className="h-4 w-4" /> : <RefreshCw className="h-4 w-4" />}
                    {useCache ? "Load from Cache" : "Sync from GitHub"}
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="hover:bg-[#e9efeb] hover:text-[#273e2d]"
                    onClick={() => setUseCache(!useCache)}
                  >
                    {useCache ? "Use Live Data" : "Use Cache"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Search */}
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search issues..."
                value={searchIssues}
                onChange={(e) => setSearchIssues(e.target.value)}
                className="pl-10"
              />
            </div>

            {issues.length > 0 ? (
              <IssuesList 
                issues={issues.filter(i => 
                  !searchIssues || 
                  i.title?.toLowerCase().includes(searchIssues.toLowerCase()) ||
                  i.body?.toLowerCase().includes(searchIssues.toLowerCase())
                )}
                collapsedState={collapsedIssues}
                setCollapsedState={setCollapsedIssues}
              />
            ) : (
              <Card className="border-border">
                <CardContent className="py-12 text-center text-muted-foreground">
                  No issues loaded yet.
                </CardContent>
              </Card>
            )}
            
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
          </TabsContent>

          <TabsContent value="commits" className="space-y-4">
            {/* Action Bar */}
            <Card className="border-border">
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex gap-2 items-center">
                  <Button onClick={() => handleGetCommits(false)} disabled={loading}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : useCache ? <Database className="h-4 w-4" /> : <RefreshCw className="h-4 w-4" />}
                    {useCache ? "Load from Cache" : "Sync from GitHub"}
                  </Button>
                  <Button 
                    variant="ghost"
                    className="hover:bg-[#e9efeb] hover:text-[#273e2d]"
                    onClick={() => setUseCache(!useCache)}
                  >
                    {useCache ? "Use Live Data" : "Use Cache"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Search */}
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search commits..."
                value={searchCommits}
                onChange={(e) => setSearchCommits(e.target.value)}
                className="pl-10"
              />
            </div>

            {commits.length > 0 ? (
              <CommitsList 
                commits={commits.filter(c => 
                  !searchCommits || 
                  (c.message || c.commit?.message)?.toLowerCase().includes(searchCommits.toLowerCase()) ||
                  (c.author_name || c.commit?.author?.name)?.toLowerCase().includes(searchCommits.toLowerCase())
                )}
                collapsedState={collapsedCommits}
                setCollapsedState={setCollapsedCommits}
              />
            ) : (
              <Card className="border-border">
                <CardContent className="py-12 text-center text-muted-foreground">
                  No commits loaded yet.
                </CardContent>
              </Card>
            )}
            
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Issues List Component with Collapsible States
function IssuesList({ issues, collapsedState, setCollapsedState }) {
  const issuesByState = issues.reduce((acc, issue) => {
    const state = issue.state || 'open';
    if (!acc[state]) acc[state] = [];
    acc[state].push(issue);
    return acc;
  }, {});

  const states = Object.keys(issuesByState).sort();

  const toggleState = (state) => {
    setCollapsedState(prev => ({
      ...prev,
      [state]: !prev[state]
    }));
  };

  return (
    <div className="space-y-4">
      {states.map(state => {
        const stateIssues = issuesByState[state];
        const isOpen = collapsedState[state] === true;

        return (
          <Card key={state} className="border-border">
            <Collapsible open={isOpen} onOpenChange={() => toggleState(state)}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {isOpen ? (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      )}
                      <CardTitle className="text-lg capitalize">{state}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-3 pt-0 p-4">
                  {stateIssues.map(issue => (
                    <div key={issue.id || issue.issue_number} className="bg-card border border-border rounded-lg hover:shadow-md transition-shadow p-4">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-h3">#{issue.issue_number || issue.number} {issue.title}</h3>
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
                    </div>
                  ))}
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        );
      })}
    </div>
  );
}

// Commits List Component with Collapsible by Date
function CommitsList({ commits, collapsedState, setCollapsedState }) {
  const commitsByDate = commits.reduce((acc, commit) => {
    const date = new Date(commit.commit_date || commit.commit?.author?.date).toLocaleDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(commit);
    return acc;
  }, {});

  const dates = Object.keys(commitsByDate).sort((a, b) => new Date(b) - new Date(a));

  const toggleDate = (date) => {
    setCollapsedState(prev => ({
      ...prev,
      [date]: !prev[date]
    }));
  };

  return (
    <div className="space-y-4">
      {dates.map(date => {
        const dateCommits = commitsByDate[date];
        const isOpen = collapsedState[date] === true;

        return (
          <Card key={date} className="border-border">
            <Collapsible open={isOpen} onOpenChange={() => toggleDate(date)}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {isOpen ? (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      )}
                      <CardTitle className="text-lg">{date}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-3 pt-0 p-4">
                  {dateCommits.map(commit => (
                    <div key={commit.sha} className="bg-card border border-border rounded-lg hover:shadow-md transition-shadow p-4">
                      <div className="space-y-2">
                        <p className="font-medium">{commit.message || commit.commit?.message}</p>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>By {commit.author_name || commit.commit?.author?.name}</span>
                          <span className="font-mono text-xs">{commit.sha.slice(0, 7)}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(commit.commit_date || commit.commit?.author?.date).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        );
      })}
    </div>
  );
}