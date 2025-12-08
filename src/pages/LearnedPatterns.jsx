import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, BookOpen, Trash2, Search, Filter, AlertTriangle, CheckCircle, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function LearnedPatterns() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  
  const { data: patterns = [], isLoading } = useQuery({
    queryKey: ['cssPatterns'],
    queryFn: () => base44.entities.CSSPattern.list('-created_date', 500)
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.CSSPattern.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cssPatterns'] });
      toast.success("Pattern deleted");
    },
    onError: (error) => {
      toast.error("Failed to delete: " + error.message);
    }
  });

  const statusColors = {
    verified: "bg-success-50 text-success border-success/20",
    violation: "bg-destructive-50 text-destructive border-destructive/20"
  };

  const severityColors = {
    critical: "bg-destructive text-destructive-foreground",
    high: "bg-warning text-warning-foreground",
    medium: "bg-info text-info-foreground",
    low: "bg-muted text-muted-foreground"
  };

  const categoryIcons = {
    color: "🎨",
    spacing: "📏",
    typography: "✍️",
    layout: "📐",
    other: "🔧"
  };

  // Filter patterns
  const filteredPatterns = patterns.filter(pattern => {
    const matchesSearch = !searchQuery || 
      pattern.pattern?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pattern.issue?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || pattern.status === filterStatus;
    const matchesCategory = filterCategory === "all" || pattern.category === filterCategory;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const stats = {
    total: patterns.length,
    verified: patterns.filter(p => p.status === 'verified').length,
    violations: patterns.filter(p => p.status === 'violation').length,
    userModified: patterns.filter(p => p.user_modified).length
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(createPageUrl("ViolationReport"))}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Report
            </Button>
          </div>
          <h1 className="text-2xl font-light font-display text-midnight-900">
            Learned CSS Patterns
          </h1>
          <p className="text-muted-foreground mt-1">
            Patterns you've confirmed to train the AI's understanding
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs">Total Learned</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs">Verified</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{stats.verified}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs">Violations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.violations}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs">User Modified</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-info">{stats.userModified}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search patterns..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="violation">Violation</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="color">Color</SelectItem>
                <SelectItem value="spacing">Spacing</SelectItem>
                <SelectItem value="typography">Typography</SelectItem>
                <SelectItem value="layout">Layout</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Patterns List */}
      {filteredPatterns.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No Patterns Yet</h3>
            <p className="text-muted-foreground mb-4">
              {patterns.length === 0 
                ? "Start confirming patterns in the Violation Report to build your knowledge base"
                : "No patterns match your current filters"}
            </p>
            <Button onClick={() => navigate(createPageUrl("ViolationReport"))}>
              Go to Violation Report
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredPatterns.map((pattern) => (
            <Card key={pattern.id} className="border-l-4" style={{
              borderLeftColor: pattern.status === 'verified' ? 'var(--success)' : 'var(--destructive)'
            }}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="text-2xl">{categoryIcons[pattern.category] || categoryIcons.other}</span>
                      <Badge className={statusColors[pattern.status]}>
                        {pattern.status === 'verified' ? <CheckCircle className="h-3 w-3 mr-1" /> : <AlertTriangle className="h-3 w-3 mr-1" />}
                        {pattern.status}
                      </Badge>
                      {pattern.severity && (
                        <Badge className={severityColors[pattern.severity]}>
                          {pattern.severity}
                        </Badge>
                      )}
                      <Badge variant="outline" className="font-mono text-xs">
                        {pattern.category}
                      </Badge>
                      {pattern.user_modified && (
                        <Badge variant="secondary" className="text-xs">
                          User Modified
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {pattern.occurrences || 0}x occurrences
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <div>
                        <span className="text-xs text-muted-foreground">Pattern:</span>
                        <code className="block bg-primary-100 p-3 rounded text-sm font-mono font-bold mt-1 border-l-4 border-primary">
                          {pattern.pattern}
                        </code>
                      </div>
                    </div>
                    
                    {pattern.issue && (
                      <p className="text-sm text-muted-foreground mt-2">
                        <strong>Issue:</strong> {pattern.issue}
                      </p>
                    )}
                    
                    {pattern.suggested_fix && (
                      <div className="mt-2">
                        <p className="text-xs text-success mb-1">Suggested Fix:</p>
                        <code className="block bg-success-50 p-2 rounded text-sm font-mono text-success">
                          {pattern.suggested_fix}
                        </code>
                      </div>
                    )}
                    
                    {pattern.found_in && pattern.found_in.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-muted-foreground">
                          Found in: {pattern.found_in.slice(0, 3).join(", ")}
                          {pattern.found_in.length > 3 && ` +${pattern.found_in.length - 3} more`}
                        </p>
                      </div>
                    )}
                    
                    {pattern.confirmed_date && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Confirmed: {new Date(pattern.confirmed_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteMutation.mutate(pattern.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}