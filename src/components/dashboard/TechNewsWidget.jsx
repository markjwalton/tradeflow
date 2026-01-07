import React, { useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Newspaper, ExternalLink, Loader2, RefreshCw, Star, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow, subMonths, isAfter } from "date-fns";

const TECH_COLORS = {
  tailwind: "bg-cyan-100 text-cyan-700",
  react: "bg-blue-100 text-blue-700",
  shadcn: "bg-purple-100 text-purple-700",
  lucide: "bg-orange-100 text-orange-700",
  base44: "bg-green-100 text-green-700"
};

const TECH_NAMES = {
  tailwind: "Tailwind",
  react: "React",
  shadcn: "shadcn",
  lucide: "Lucide",
  base44: "Base44"
};

// Default scan trigger (every N dashboard visits)
const DEFAULT_SCAN_TRIGGER = 20;
const STORAGE_KEY = "tech_news_dashboard_visits";
const SETTINGS_KEY = "tech_news_scan_settings";

function TechNewsWidget() {
  const queryClient = useQueryClient();

  // Get settings from localStorage
  const getSettings = () => {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      return stored ? JSON.parse(stored) : { scanTriggerVisits: DEFAULT_SCAN_TRIGGER };
    } catch {
      return { scanTriggerVisits: DEFAULT_SCAN_TRIGGER };
    }
  };

  // Fetch latest 5 news items
  const { data: newsItems = [], isLoading } = useQuery({
    queryKey: ["techNewsWidget"],
    queryFn: () => base44.entities.TechNewsFeed.list("-published_date", 5)
  });

  const createNewsMutation = useMutation({
    mutationFn: (data) => base44.entities.TechNewsFeed.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["techNewsWidget"] })
  });

  const deleteNewsMutation = useMutation({
    mutationFn: (id) => base44.entities.TechNewsFeed.delete(id)
  });

  // Auto-scan logic on dashboard visit
  useEffect(() => {
    const checkAndScan = async () => {
      try {
        const settings = getSettings();
        const stored = localStorage.getItem(STORAGE_KEY);
        const data = stored ? JSON.parse(stored) : { visits: 0, lastScan: null };
        
        // Increment visit count
        data.visits = (data.visits || 0) + 1;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

        // Check if we should scan
        if (data.visits >= settings.scanTriggerVisits) {
          // Reset counter and scan
          localStorage.setItem(STORAGE_KEY, JSON.stringify({ visits: 0, lastScan: new Date().toISOString() }));
          await runAutoScan();
        }
      } catch (e) {
        console.error("Auto-scan check failed:", e);
      }
    };

    checkAndScan();
  }, []);

  const runAutoScan = async () => {
    const technologies = ["tailwind", "react", "shadcn", "lucide", "base44"];
    
    try {
      // First, clean old articles (older than 3 months)
      const allNews = await base44.entities.TechNewsFeed.list("-created_date", 500);
      const threeMonthsAgo = subMonths(new Date(), 3);
      
      for (const item of allNews) {
        const publishDate = item.published_date ? new Date(item.published_date) : new Date(item.created_date);
        if (!isAfter(publishDate, threeMonthsAgo)) {
          await deleteNewsMutation.mutateAsync(item.id);
        }
      }

      // Scan for new articles
      for (const tech of technologies) {
        const result = await base44.integrations.Core.InvokeLLM({
          prompt: `Find the single most important ${tech === "base44" ? "Base44 platform" : tech === "shadcn" ? "shadcn/ui" : tech === "lucide" ? "Lucide icons" : tech} news or update from the last week. 
          
Return ONE item with: title, summary (2 sentences), source_url (if known), published_date, is_important (true if breaking change or major release), importance_reason.`,
          add_context_from_internet: true,
          response_json_schema: {
            type: "object",
            properties: {
              title: { type: "string" },
              summary: { type: "string" },
              source_url: { type: "string" },
              published_date: { type: "string" },
              is_important: { type: "boolean" },
              importance_reason: { type: "string" }
            }
          }
        });

        if (result.title) {
          // Check if already exists
          const existing = allNews.find(n => n.title === result.title && n.technology === tech);
          if (!existing) {
            await createNewsMutation.mutateAsync({
              technology: tech,
              title: result.title,
              summary: result.summary,
              source_url: result.source_url || "",
              source_name: "Auto-scan",
              published_date: result.published_date,
              news_type: "blog",
              is_important: result.is_important,
              importance_reason: result.importance_reason,
              last_scan_date: new Date().toISOString()
            });
          }
        }
      }

      queryClient.invalidateQueries({ queryKey: ["techNewsWidget"] });
    } catch (e) {
      console.error("Auto-scan failed:", e);
    }
  };

  const handleManualRefresh = async () => {
    toast.info("Scanning for updates...");
    await runAutoScan();
    toast.success("News updated!");
  };

  if (isLoading) {
    return (
      <Card className="border-[var(--color-background-muted)]">
        <CardContent className="py-8 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-[var(--color-charcoal)]" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-[var(--color-background-muted)]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Newspaper className="h-4 w-4 text-[var(--color-primary)]" />
            Tech Updates
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={handleManualRefresh}>
              <RefreshCw className="h-3 w-3" />
            </Button>
            <Link to={createPageUrl("KnowledgeManager") + "?tab=news"}>
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1">
                View All <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {newsItems.length === 0 ? (
          <p className="text-sm text-[var(--color-charcoal)] text-center py-4">
            No news yet. Updates will appear after first scan.
          </p>
        ) : (
          <div className="space-y-3">
            {newsItems.map((item) => (
              <div key={item.id} className="flex items-start gap-2">
                <Badge className={`${TECH_COLORS[item.technology]} text-xs shrink-0`}>
                  {TECH_NAMES[item.technology]}
                </Badge>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    {item.is_important && <Star className="h-3 w-3 text-yellow-500 shrink-0" />}
                    <p className="text-sm font-medium text-[var(--color-midnight)] truncate">
                      {item.title}
                    </p>
                  </div>
                  <p className="text-xs text-[var(--color-charcoal)] mt-0.5">
                    {item.published_date && formatDistanceToNow(new Date(item.published_date), { addSuffix: true })}
                    {item.source_url && (
                      <a 
                        href={item.source_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="ml-2 text-[var(--color-primary)] hover:underline inline-flex items-center gap-0.5"
                      >
                        <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Settings hint */}
        <p className="text-[10px] text-[var(--color-charcoal)] mt-3 text-center">
          Auto-scans every {getSettings().scanTriggerVisits} dashboard visits
        </p>
      </CardContent>
    </Card>
  );
}

// Export settings helper for external use
export const getTechNewsSettings = () => {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    return stored ? JSON.parse(stored) : { scanTriggerVisits: DEFAULT_SCAN_TRIGGER };
  } catch {
    return { scanTriggerVisits: DEFAULT_SCAN_TRIGGER };
  }
};

export const setTechNewsSettings = (settings) => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

export default TechNewsWidget;