import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { 
  RefreshCw, ExternalLink, Loader2, Newspaper, Trash2,
  AlertTriangle, Sparkles, Calendar, Clock, Star
} from "lucide-react";
import { toast } from "sonner";
import { format, formatDistanceToNow, subMonths, isAfter } from "date-fns";

const TECH_COLORS = {
  tailwind: { bg: "bg-cyan-50", text: "text-cyan-700", border: "border-cyan-200" },
  react: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  shadcn: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
  lucide: { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200" },
  base44: { bg: "bg-green-50", text: "text-green-700", border: "border-green-200" }
};

const TECH_NAMES = {
  tailwind: "Tailwind CSS",
  react: "React",
  shadcn: "shadcn/ui",
  lucide: "Lucide Icons",
  base44: "Base44"
};

const NEWS_TYPE_ICONS = {
  release: "🚀",
  blog: "📝",
  tutorial: "📚",
  security: "🔒",
  deprecation: "⚠️",
  feature: "✨",
  community: "👥"
};

export default function NewsFeed() {
  const queryClient = useQueryClient();
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState({ current: 0, total: 0, tech: "" });
  const [cleaning, setCleaning] = useState(false);

  // Fetch all news items
  const { data: newsItems = [], isLoading } = useQuery({
    queryKey: ["techNews"],
    queryFn: () => base44.entities.TechNewsFeed.list("-published_date", 100)
  });

  const createNewsMutation = useMutation({
    mutationFn: (data) => base44.entities.TechNewsFeed.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["techNews"] })
  });

  const deleteNewsMutation = useMutation({
    mutationFn: (id) => base44.entities.TechNewsFeed.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["techNews"] })
  });

  // Scan for new articles
  const handleScanAll = async () => {
    setScanning(true);
    const technologies = ["tailwind", "react", "shadcn", "lucide", "base44"];
    setScanProgress({ current: 0, total: technologies.length, tech: "" });

    try {
      for (let i = 0; i < technologies.length; i++) {
        const tech = technologies[i];
        setScanProgress({ current: i, total: technologies.length, tech: TECH_NAMES[tech] });

        const prompts = {
          tailwind: "Find the latest Tailwind CSS news, blog posts, and updates from the last 2 weeks. Include releases, tutorials, and community highlights.",
          react: "Find the latest React news, blog posts, and updates from the last 2 weeks. Include React 19 features, new hooks, and best practices.",
          shadcn: "Find the latest shadcn/ui news, new components, and updates from the last 2 weeks. Include any new component releases or improvements.",
          lucide: "Find the latest Lucide icons news and updates from the last 2 weeks. Include any new icons added or library improvements.",
          base44: "Find the latest Base44 platform news, updates, and features from the last 2 weeks. Include any SDK updates or new capabilities."
        };

        const result = await base44.integrations.Core.InvokeLLM({
          prompt: `${prompts[tech]}

For each news item, provide:
1. Title
2. Brief summary (2-3 sentences)
3. Source URL (if known, otherwise leave empty)
4. Source name (GitHub, Blog, Twitter, etc.)
5. Approximate publish date
6. News type (release, blog, tutorial, security, deprecation, feature, community)
7. Relevance score (0-100) for a UI component library
8. Key highlights (2-3 bullet points)
9. Is this important for developers? (true/false)
10. Why is it important? (if applicable)

Return up to 5 most relevant items.`,
          add_context_from_internet: true,
          response_json_schema: {
            type: "object",
            properties: {
              articles: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    summary: { type: "string" },
                    source_url: { type: "string" },
                    source_name: { type: "string" },
                    published_date: { type: "string" },
                    news_type: { type: "string" },
                    relevance_score: { type: "number" },
                    highlights: { type: "array", items: { type: "string" } },
                    is_important: { type: "boolean" },
                    importance_reason: { type: "string" }
                  }
                }
              }
            }
          }
        });

        // Save articles
        for (const article of result.articles || []) {
          // Check if we already have this article
          const existing = newsItems.find(n => 
            n.title === article.title && n.technology === tech
          );
          if (!existing) {
            await createNewsMutation.mutateAsync({
              technology: tech,
              title: article.title,
              summary: article.summary,
              source_url: article.source_url || "",
              source_name: article.source_name || "Unknown",
              published_date: article.published_date,
              news_type: article.news_type || "blog",
              ai_relevance_score: article.relevance_score,
              ai_highlights: article.highlights,
              is_important: article.is_important,
              importance_reason: article.importance_reason,
              last_scan_date: new Date().toISOString()
            });
          }
        }
      }

      setScanProgress({ current: technologies.length, total: technologies.length, tech: "Complete!" });
      toast.success("News feed updated");
      setTimeout(() => setScanProgress({ current: 0, total: 0, tech: "" }), 2000);
    } catch (error) {
      toast.error("Scan failed: " + error.message);
      setScanProgress({ current: 0, total: 0, tech: "" });
    }
    setScanning(false);
  };

  // Clean old articles (older than 3 months)
  const handleCleanOld = async () => {
    setCleaning(true);
    const threeMonthsAgo = subMonths(new Date(), 3);
    let deleted = 0;

    try {
      for (const item of newsItems) {
        const publishDate = item.published_date ? new Date(item.published_date) : new Date(item.created_date);
        if (!isAfter(publishDate, threeMonthsAgo)) {
          await deleteNewsMutation.mutateAsync(item.id);
          deleted++;
        }
      }
      toast.success(`Cleaned ${deleted} old articles`);
    } catch (error) {
      toast.error("Cleanup failed: " + error.message);
    }
    setCleaning(false);
  };

  // Group by date
  const groupedNews = newsItems.reduce((acc, item) => {
    const date = item.published_date || format(new Date(item.created_date), "yyyy-MM-dd");
    if (!acc[date]) acc[date] = [];
    acc[date].push(item);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedNews).sort((a, b) => new Date(b) - new Date(a));

  // Stats
  const importantCount = newsItems.filter(n => n.is_important).length;
  const techCounts = Object.keys(TECH_NAMES).reduce((acc, tech) => {
    acc[tech] = newsItems.filter(n => n.technology === tech).length;
    return acc;
  }, {});

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Newspaper className="h-5 w-5 text-[var(--color-primary)]" />
            Technology News Feed
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCleanOld} disabled={cleaning}>
              {cleaning ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Trash2 className="h-4 w-4 mr-1" />}
              Clean Old
            </Button>
            <Button size="sm" onClick={handleScanAll} disabled={scanning} className="bg-[var(--color-primary)]">
              {scanning ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-1" />}
              Scan All
            </Button>
          </div>
        </div>

        {/* Progress */}
        {scanProgress.total > 0 && (
          <div className="mt-4 p-3 bg-[var(--color-background)] rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm">Scanning {scanProgress.tech}...</span>
              <span className="text-sm text-[var(--color-charcoal)]">
                {scanProgress.current}/{scanProgress.total}
              </span>
            </div>
            <Progress value={(scanProgress.current / scanProgress.total) * 100} className="h-2" />
          </div>
        )}

        {/* Stats */}
        <div className="flex flex-wrap gap-2 mt-4">
          <Badge variant="outline" className="gap-1">
            <Star className="h-3 w-3 text-yellow-500" />
            {importantCount} Important
          </Badge>
          {Object.entries(techCounts).map(([tech, count]) => (
            count > 0 && (
              <Badge key={tech} className={`${TECH_COLORS[tech].bg} ${TECH_COLORS[tech].text}`}>
                {TECH_NAMES[tech]}: {count}
              </Badge>
            )
          ))}
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[var(--color-charcoal)]" />
          </div>
        ) : newsItems.length === 0 ? (
          <div className="text-center py-12">
            <Newspaper className="h-12 w-12 mx-auto mb-4 text-[var(--color-charcoal)]" />
            <h3 className="text-lg font-medium">No News Yet</h3>
            <p className="text-[var(--color-charcoal)] mt-2">Click "Scan All" to fetch the latest updates</p>
          </div>
        ) : (
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-6">
              {sortedDates.map(date => (
                <div key={date}>
                  <div className="flex items-center gap-2 mb-3 sticky top-0 bg-white py-1">
                    <Calendar className="h-4 w-4 text-[var(--color-charcoal)]" />
                    <span className="text-sm font-medium text-[var(--color-midnight)]">
                      {format(new Date(date), "MMMM d, yyyy")}
                    </span>
                    <span className="text-xs text-[var(--color-charcoal)]">
                      ({formatDistanceToNow(new Date(date), { addSuffix: true })})
                    </span>
                  </div>

                  <div className="space-y-3">
                    {groupedNews[date].map((item) => (
                      <div
                        key={item.id}
                        className={`p-4 rounded-lg border ${
                          item.is_important 
                            ? "bg-yellow-50 border-yellow-200" 
                            : `${TECH_COLORS[item.technology]?.bg || "bg-gray-50"} ${TECH_COLORS[item.technology]?.border || "border-gray-200"}`
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-lg">{NEWS_TYPE_ICONS[item.news_type] || "📄"}</span>
                              <Badge className={`${TECH_COLORS[item.technology]?.bg} ${TECH_COLORS[item.technology]?.text}`}>
                                {TECH_NAMES[item.technology]}
                              </Badge>
                              {item.is_important && (
                                <Badge className="bg-yellow-100 text-yellow-800 gap-1">
                                  <AlertTriangle className="h-3 w-3" />
                                  Important
                                </Badge>
                              )}
                              {item.ai_relevance_score >= 80 && (
                                <Badge variant="outline" className="gap-1">
                                  <Sparkles className="h-3 w-3" />
                                  High Relevance
                                </Badge>
                              )}
                            </div>

                            <h4 className="font-medium text-[var(--color-midnight)]">{item.title}</h4>
                            <p className="text-sm text-[var(--color-charcoal)] mt-1">{item.summary}</p>

                            {item.ai_highlights?.length > 0 && (
                              <div className="mt-2 space-y-1">
                                {item.ai_highlights.map((highlight, idx) => (
                                  <p key={idx} className="text-xs text-[var(--color-charcoal)] flex items-start gap-1">
                                    <span className="text-[var(--color-primary)]">•</span>
                                    {highlight}
                                  </p>
                                ))}
                              </div>
                            )}

                            {item.importance_reason && (
                              <div className="mt-2 p-2 bg-yellow-100/50 rounded text-xs text-yellow-800">
                                <strong>Why important:</strong> {item.importance_reason}
                              </div>
                            )}

                            <div className="flex items-center gap-3 mt-2 text-xs text-[var(--color-charcoal)]">
                              <span>{item.source_name}</span>
                              {item.source_url && (
                                <a 
                                  href={item.source_url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-[var(--color-primary)] hover:underline"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                  Read More
                                </a>
                              )}
                            </div>
                          </div>

                          <div className="text-right">
                            {item.ai_relevance_score && (
                              <div className="text-xs text-[var(--color-charcoal)]">
                                Relevance: {item.ai_relevance_score}%
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}